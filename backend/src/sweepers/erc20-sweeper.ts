require('dotenv').config();
const { ethers } = require('ethers');
const bip39 = require('bip39');
const db    = require('../db/setup');

const RPC_MAP = {
    sepolia:     process.env.SEPOLIA_RPC,
    bsc_testnet: process.env.BSC_TESTNET_RPC,
};

const HOT_WALLET = process.env.HOT_WALLET_ADDRESS
    ? ethers.utils.getAddress(process.env.HOT_WALLET_ADDRESS)
    : null;

const ERC20_ABI = [
    'function balanceOf(address owner) view returns (uint256)',
    'function transfer(address to, uint256 amount) returns (bool)',
    'function decimals() view returns (uint8)',
];

const TOKEN_CONTRACTS = {
    sepolia: {
        USDT: '0x7169D38820dfd117C3FA1f22a697dBA58d90BA06',
        USDC: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
    },
    bsc_testnet: {
        USDT: '0x337610d27C682E347C9cD60bD4B3B107c9D34EDD',
        USDC: '0x64544969ed7EBf5f083679233325356EbE738930',
    }
};

function getPrivateKeyForPath(derivationPath) {
    const seed = bip39.mnemonicToSeedSync(process.env.MASTER_MNEMONIC);
    return ethers.utils.HDNode.fromSeed(seed).derivePath(derivationPath).privateKey;
}

async function sweepERC20(network, coin) {
    if (!HOT_WALLET) {
        console.log(`[sweeper/${network}/${coin}] HOT_WALLET_ADDRESS not set — skipping`);
        return;
    }

    const hotWalletPK = process.env.HOT_WALLET_PRIVATE_KEY;
    if (!hotWalletPK) {
        console.log(`[sweeper/${network}/${coin}] HOT_WALLET_PRIVATE_KEY not set — skipping`);
        return;
    }

    const contractAddress = TOKEN_CONTRACTS[network]?.[coin];
    if (!contractAddress) return;

    const provider      = new ethers.providers.JsonRpcProvider(RPC_MAP[network]);
    const tokenContract = new ethers.Contract(contractAddress, ERC20_ABI, provider);
    const decimals      = await tokenContract.decimals();

    const pending = db.prepare(`
        SELECT d.id, d.user_id, d.amount,
               da.address, da.derivation_path
        FROM deposits d
        JOIN deposit_addresses da
          ON da.user_id = d.user_id
         AND da.coin    = d.coin
         AND da.network = d.network
        WHERE d.network  = ?
          AND d.coin     = ?
          AND d.status   = 'credited'
          AND d.swept_tx IS NULL
    `).all(network, coin);

    if (pending.length === 0) return;
    console.log(`[sweeper/${network}/${coin}] ${pending.length} token sweep(s) pending`);

    const gasWallet = new ethers.Wallet(hotWalletPK, provider);

    for (const deposit of pending) {
        try {
            const tokenBalance = await tokenContract.balanceOf(deposit.address);
            if (tokenBalance.eq(0)) continue;

            const humanAmount = parseFloat(ethers.utils.formatUnits(tokenBalance, decimals));
            console.log(`  ↳ Sweeping ${humanAmount} ${coin} from ${deposit.address}`);

            const gasPrice  = await provider.getGasPrice();
            const gasNeeded = gasPrice.mul(65000);

            const fundTx = await gasWallet.sendTransaction({
                to: deposit.address, value: gasNeeded
            });
            await fundTx.wait(1);

            const depositWallet   = new ethers.Wallet(getPrivateKeyForPath(deposit.derivation_path), provider);
            const tokenWithSigner = tokenContract.connect(depositWallet);

            const transferTx = await tokenWithSigner.transfer(HOT_WALLET, tokenBalance, {
                gasLimit: 65000,
                gasPrice,
            });
            await transferTx.wait(1);

            db.prepare(`
                UPDATE deposits SET status='swept', swept_tx=?, swept_at=CURRENT_TIMESTAMP
                WHERE id=?
            `).run(transferTx.hash, deposit.id);

            console.log(`  ✅ Token sweep complete: ${transferTx.hash}`);

        } catch (err) {
            console.error(`  ✗ Token sweep failed #${deposit.id}:`, err.message);
        }
    }
}

async function startERC20Sweeper(network, coin, intervalMs = 120_000) {
    console.log(`🧹 ERC20 Sweeper started: ${coin} on ${network}`);
    const run = async () => {
        try { await sweepERC20(network, coin); }
        catch (err) { console.error(`[sweeper/${network}/${coin}]`, err.message); }
    };
    await run();
    setInterval(run, intervalMs);
}

module.exports = { startERC20Sweeper };