import { useState, useRef, useEffect } from "react";
import { ArrowLeft, QrCode, ChevronDown } from "lucide-react";

interface Step2Props {
  amount: number;
  onBack: () => void;
  onGenerate: (currency: string, network: string) => void;
  isGenerating: boolean;
}

const getCryptoLogo = (symbol: string) =>
  `https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/${symbol.toLowerCase()}.png`;

// Network strings must exactly match the keys in depositController NETWORK_MAP
// Network strings must exactly match the keys in depositController NETWORK_MAP
const CRYPTO_OPTIONS = [
  {
    id: "ETH",
    name: "Ethereum",
    symbol: "ETH",
    networks: [
      { label: "Ethereum Mainnet",  value: "Ethereum" },
      { label: "Arbitrum One",      value: "Arbitrum One" },
    ],
  },
  {
    id: "USDT",
    name: "Tether",
    symbol: "USDT",
    networks: [
      { label: "Ethereum Mainnet",  value: "Ethereum" },
      { label: "BNB Smart Chain",   value: "BSC" },
      { label: "Polygon",           value: "Polygon" },
      { label: "Arbitrum One",      value: "Arbitrum One" },
    ],
  },
  {
    id: "USDC",
    name: "USD Coin",
    symbol: "USDC",
    networks: [
      { label: "Ethereum Mainnet",  value: "Ethereum" },
      { label: "BNB Smart Chain",   value: "BSC" },
      { label: "Polygon",           value: "Polygon" },
      { label: "Arbitrum One",      value: "Arbitrum One" },
    ],
  },
  {
    id: "BNB",
    name: "BNB",
    symbol: "BNB",
    networks: [
      { label: "BNB Smart Chain",   value: "BSC" },
    ],
  },
  {
    id: "MATIC",
    name: "Polygon",
    symbol: "MATIC",
    networks: [
      { label: "Polygon",           value: "Polygon" },
    ],
  },
  {
    id: "BTC",
    name: "Bitcoin",
    symbol: "BTC",
    networks: [
      { label: "Bitcoin",           value: "Bitcoin" },
    ],
  },
  {
    id: "SOL",
    name: "Solana",
    symbol: "SOL",
    networks: [
      { label: "Solana",            value: "Solana" },
    ],
  },
  {
    id: "TON",
    name: "Toncoin",
    symbol: "TON",
    networks: [
      { label: "TON",               value: "TON" },
    ],
  },
  {
    id: "TRX",
    name: "TRON",
    symbol: "TRX",
    networks: [
      { label: "Tron",              value: "Tron" },
    ],
  },
];

export default function Step2Currency({ amount, onBack, onGenerate, isGenerating }: Step2Props) {
  const [selectedCrypto, setSelectedCrypto] = useState(CRYPTO_OPTIONS[0]);
  const [selectedNetwork, setSelectedNetwork] = useState<{ label: string; value: string } | null>(null);

  const [isCryptoOpen, setIsCryptoOpen] = useState(false);
  const [isNetworkOpen, setIsNetworkOpen] = useState(false);

  const cryptoRef = useRef<HTMLDivElement>(null);
  const networkRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (cryptoRef.current && !cryptoRef.current.contains(event.target as Node)) {
        setIsCryptoOpen(false);
      }
      if (networkRef.current && !networkRef.current.contains(event.target as Node)) {
        setIsNetworkOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Auto-select network when a coin only has one option
  useEffect(() => {
    if (selectedCrypto.networks.length === 1) {
      setSelectedNetwork(selectedCrypto.networks[0]);
    } else {
      setSelectedNetwork(null);
    }
  }, [selectedCrypto]);

  return (
    <div className="space-y-6 text-center animate-fadeIn">
      <div>
        <h2 className="text-lg font-bold text-white mb-1">Select Currency & Network</h2>
        <p className="text-xs text-gray-400">Depositing ${amount.toFixed(2)}</p>
      </div>

      {/* Cryptocurrency Dropdown */}
      <div
        className={`text-left space-y-2 relative transition-all duration-100 ${isCryptoOpen ? "z-40" : "z-20"}`}
        ref={cryptoRef}
      >
        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">
          Select Cryptocurrency
        </label>

        <button
          type="button"
          onClick={() => { setIsCryptoOpen(!isCryptoOpen); setIsNetworkOpen(false); }}
          className="w-full bg-[#05070a] border border-[#1a1f28] rounded-xl px-4 py-3 text-sm text-white flex items-center justify-between outline-none focus:border-[#39ff88]/40 transition-colors"
        >
          <div className="flex items-center gap-3">
            <img
              src={getCryptoLogo(selectedCrypto.symbol)}
              alt={selectedCrypto.name}
              className="w-5 h-5 object-contain rounded-full"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/generic.png";
              }}
            />
            <span className="font-bold text-white">{selectedCrypto.symbol}</span>
            <span className="text-gray-500 text-xs font-medium">{selectedCrypto.name}</span>
          </div>
          <ChevronDown
            className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isCryptoOpen ? "rotate-180" : ""}`}
          />
        </button>

        {isCryptoOpen && (
          <div className="absolute left-0 right-0 mt-1.5 bg-[#0d0f17] border border-[#252b38] rounded-xl shadow-2xl z-[100] max-h-56 overflow-y-auto scrollbar-none">
            {CRYPTO_OPTIONS.map((crypto) => (
              <button
                key={crypto.id}
                type="button"
                onClick={() => {
                  setSelectedCrypto(crypto);
                  setSelectedNetwork(null);
                  setIsCryptoOpen(false);
                }}
                className={`w-full px-4 py-3 text-sm text-left flex items-center gap-3 hover:bg-[#1a1f28] transition-colors ${
                  selectedCrypto.id === crypto.id ? "bg-[#1a1f28]" : ""
                }`}
              >
                <img
                  src={getCryptoLogo(crypto.symbol)}
                  alt={crypto.name}
                  className="w-5 h-5 object-contain rounded-full"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/generic.png";
                  }}
                />
                <div className="flex flex-col">
                  <span className="font-bold text-white text-xs">{crypto.symbol}</span>
                  <span className="text-gray-400 text-[11px]">{crypto.name}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Network Dropdown */}
      <div
        className={`text-left space-y-2 relative transition-all duration-100 ${isNetworkOpen ? "z-30" : "z-10"}`}
        ref={networkRef}
      >
        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">
          Select Network
        </label>

        <button
          type="button"
          // Single-network coins: dropdown is cosmetic only, already auto-selected
          onClick={() => {
            if (selectedCrypto.networks.length > 1) {
              setIsNetworkOpen(!isNetworkOpen);
              setIsCryptoOpen(false);
            }
          }}
          className={`w-full bg-[#05070a] border border-[#1a1f28] rounded-xl px-4 py-3 text-sm text-white flex items-center justify-between outline-none focus:border-[#39ff88]/40 transition-colors ${
            selectedCrypto.networks.length === 1 ? "opacity-60 cursor-default" : ""
          }`}
        >
          <span className={selectedNetwork ? "text-white font-medium" : "text-gray-500"}>
            {selectedNetwork ? selectedNetwork.label : "Select a network"}
          </span>
          {selectedCrypto.networks.length > 1 && (
            <ChevronDown
              className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isNetworkOpen ? "rotate-180" : ""}`}
            />
          )}
        </button>

        {isNetworkOpen && selectedCrypto.networks.length > 1 && (
          <div className="absolute left-0 right-0 mt-1.5 bg-[#0d0f17] border border-[#252b38] rounded-xl shadow-2xl z-[100] max-h-48 overflow-y-auto scrollbar-none">
            {selectedCrypto.networks.map((net) => (
              <button
                key={net.value}
                type="button"
                onClick={() => {
                  setSelectedNetwork(net);
                  setIsNetworkOpen(false);
                }}
                className={`w-full px-4 py-3 text-sm text-left text-gray-300 hover:bg-[#1a1f28] hover:text-white transition-colors ${
                  selectedNetwork?.value === net.value ? "bg-[#1a1f28] text-white font-bold" : ""
                }`}
              >
                {net.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-2 relative z-0">
        <button
          type="button"
          onClick={onBack}
          className="w-1/3 bg-transparent border border-[#1a1f28] text-white font-bold text-sm py-3 rounded-xl hover:bg-[#1a1f28] transition-colors flex items-center justify-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <button
          type="button"
          disabled={!selectedNetwork || isGenerating}
          onClick={() => selectedNetwork && onGenerate(selectedCrypto.id, selectedNetwork.value)}
          className="w-2/3 bg-[#39ff88] text-[#05070a] font-bold text-sm py-3 rounded-xl hover:bg-[#5dffa1] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <QrCode className="h-4 w-4" />
          {isGenerating ? "Generating..." : "Generate Address"}
        </button>
      </div>
    </div>
  );
}