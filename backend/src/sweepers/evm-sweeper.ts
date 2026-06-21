require('dotenv').config();
const { ethers } = require('ethers');
const bip39 = require('bip39');
const db = require('../db/setup');

const RPC_MAP = {
    sepolia:     process.env.SEPOLIA_RPC,
    bsc_testnet: process.env.BSC_TESTNET_RPC,
};

const HOT_WALLET = process.env.HOT_WALLET_ADDRESS
    ? ethers.utils.getAddress(process.env.HOT_WALLET_ADDRESS)
    : null;
const MIN_SWEEP = parseFloat(process.env.MIN_SWEEP_ETH || '0.001');

function getPrivateKeyForPath(derivationPath) {
    const seed = bip39.mnemonicToSeedSync(process.env.MASTER_MNEMONIC);
    return ethers.utils.HDNode.fromSeed(seed).derivePath(derivationPath).privateKey;
}

function scheduleConfirmationCheck(txHash, depositId, provider) {
    const interval = setInterval(async () => {
        try {
            const receipt = await provider.getTransactionReceipt(txHash);
            if (!receipt) return;
            clearInterval(interval);
            if (receipt.status === 1) {
                db.prepare(`UPDATE deposits SET status='swept', swept_at=CURRENT_TIMESTAMP WHERE id=?`).run(depositId);
                console.log(`Delayed confirmation: deposit #${depositId} swept | tx: ${txHash}`);
            } else {
                console.log(`Sweep tx failed on-chain: ${txHash}`);
            }
        } catch (e) {
            console.error('Confirmation check error:', e.message);
        }
    }, 15_000);
}

async function sweepSingleDeposit(deposit, provider) {
    const privateKey  = getPrivateKeyForPath(deposit.derivation_path);
    const wallet      = new ethers.Wallet(privateKey, provider);
    const balanceWei  = await provider.getBalance(deposit.address);
    const balanceETH  = parseFloat(ethers.utils.formatEther(balanceWei));

    if (balanceETH < MIN_SWEEP) {
        console.log(`  ↳ ${deposit.address} balance ${balanceETH} below threshold — skip`);
        return;
    }

    const gasPrice   = await provider.getGasPrice();
    const gasLimit   = ethers.BigNumber.from(21000);
    const gasCost    = gasPrice.mul(gasLimit);
    const sendAmount = balanceWei.sub(gasCost);

    if (sendAmount.lte(0)) {
        console.log(`  ↳ ${deposit.address} — balance doesn't cover gas`);
        return;
    }

    console.log(`  ↳ Sweeping ${ethers.utils.formatEther(sendAmount)} ETH → ${HOT_WALLET}`);

    const tx = await wallet.sendTransaction({
        to:       HOT_WALLET,
        value:    sendAmount,
        gasLimit: gasLimit,
        gasPrice: gasPrice,
    });

    console.log(`  ↳ Tx broadcast: ${tx.hash}`);

    // Save tx hash immediately — before waiting — so we never re-sweep
    db.prepare(`UPDATE deposits SET swept_tx=? WHERE id=?`).run(tx.hash, deposit.id);

    try {
        const receipt = await Promise.race([
            tx.wait(1),
            new Promise((_, reject) => setTimeout(() => reject(new Error('wait timeout')), 60_000))
        ]);

        if (receipt && receipt.status === 1) {
            db.prepare(`UPDATE deposits SET status='swept', swept_at=CURRENT_TIMESTAMP WHERE id=?`).run(deposit.id);
            console.log(`  ✅ Swept deposit #${deposit.id} | tx: ${tx.hash}`);
        } else {
            console.log(`  ⚠ Tx may have failed — check: ${tx.hash}`);
        }
    } catch (err) {
        console.log(`  ⏳ Confirmation timeout for ${tx.hash} — polling until confirmed`);
        scheduleConfirmationCheck(tx.hash, deposit.id, provider);
    }
}

async function sweepEVM(network) {
    if (!HOT_WALLET) {
        console.log(`[sweeper/${network}] HOT_WALLET_ADDRESS not set — skipping`);
        return;
    }

    const provider = new ethers.providers.JsonRpcProvider(RPC_MAP[network]);

    const pending = db.prepare(`
        SELECT d.id, d.user_id, d.coin, d.amount, d.tx_hash,
               da.address, da.derivation_path
        FROM deposits d
        JOIN deposit_addresses da
          ON da.user_id = d.user_id
         AND da.coin    = d.coin
         AND da.network = d.network
        WHERE d.network  = ?
          AND d.status   = 'credited'
          AND d.swept_tx IS NULL
    `).all(network);

    if (pending.length === 0) {
        console.log(`[sweeper/${network}] Nothing to sweep.`);
        return;
    }

    console.log(`[sweeper/${network}] ${pending.length} deposit(s) to sweep`);

    for (const deposit of pending) {
        try {
            await sweepSingleDeposit(deposit, provider);
        } catch (err) {
            console.error(`  ✗ Sweep failed for deposit #${deposit.id}:`, err.message);
        }
    }
}

async function startEVMSweeper(network, intervalMs = 120_000) {
    console.log(`🧹 EVM Sweeper started: ${network} (every ${intervalMs / 1000}s)`);
    const run = async () => {
        try { await sweepEVM(network); }
        catch (err) { console.error(`[sweeper/${network}] Error:`, err.message); }
    };
    await run();
    setInterval(run, intervalMs);
}

module.exports = { startEVMSweeper };