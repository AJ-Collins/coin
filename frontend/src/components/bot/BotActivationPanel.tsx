import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import api from "../../lib/api";
import { Upload, Key, FileCheck, AlertCircle, Loader2 } from "lucide-react";

interface ActivationPanelProps {
  onActivationSuccess: () => void;
}

export default function BotActivationPanel({ onActivationSuccess }: ActivationPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [passkey, setPasskey] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Passkey standalone activation pipeline
  const activateWithKeyMutation = useMutation({
    mutationFn: (key: string) => api.post("/bot/activate", { passkey: key }),
    onSuccess: () => {
      setError(null);
      onActivationSuccess();
    },
    onError: () => setError("Invalid activation passkey. Please verify and retry.")
  });

  // Handle drag mechanics
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  };

  const processFile = async (file: File) => {
    setError(null);
    const formData = new FormData();
    formData.append("botFile", file);

    try {
      await api.post("/bots/upload/activate", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      onActivationSuccess();
    } catch (err) {
      setError("Failed to upload and compile bot configuration file.");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handlePasskeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passkey.trim()) return;
    activateWithKeyMutation.mutate(passkey);
  };

  return (
    <div className="space-y-4 text-left">
      {error && (
        <div className="bg-[#1c0d0d] border border-red-900/40 rounded-xl p-3 flex items-center gap-2.5 text-red-400 text-xs">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Interactive HTML5 Drag & Drop Target Area */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`bg-[#0d0f17] border-2 border-dashed rounded-2xl p-8 text-center space-y-3 cursor-pointer transition-all ${
          isDragging 
            ? "border-[#a78bfa] bg-[#1a1428]/30" 
            : "border-[#1a1f28] hover:border-gray-700 bg-[#0d0f17]"
        }`}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])} 
          className="hidden" 
          accept=".py,.js,.ts,.json,.zip"
        />
        <div className={`mx-auto w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
          isDragging ? "bg-[#a78bfa] text-[#05070a]" : "bg-[#05070a] text-gray-400"
        }`}>
          {isDragging ? <FileCheck className="h-6 w-6" /> : <Upload className="h-6 w-6" />}
        </div>
        <div>
          <p className="text-sm font-bold text-white">Drag and drop your bot file here</p>
          <p className="text-xs text-gray-500 mt-1">or click to browse local storage (.py, .js, .json, .zip)</p>
        </div>
      </div>

      <div className="relative flex py-1 items-center">
        <div className="flex-grow border-t border-[#1a1f28]/60"></div>
        <span className="flex-shrink mx-4 text-[10px] font-black text-gray-600 uppercase tracking-widest font-mono">OR</span>
        <div className="flex-grow border-t border-[#1a1f28]/60"></div>
      </div>

      {/* Passkey Input Form */}
      <div className="bg-[#0d0f17] border border-[#1a1f28] rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2 text-[#a78bfa]">
          <Key className="h-4 w-4 rotate-90" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">Activate with Passkey</h3>
        </div>
        
        <form onSubmit={handlePasskeySubmit} className="flex flex-col gap-3">
          <div className="relative w-full">
            <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 rotate-90" />
            <input
              type="text"
              placeholder="Enter bot passkey code"
              value={passkey}
              disabled={activateWithKeyMutation.isPending}
              onChange={(e) => setPasskey(e.target.value)}
              className="w-full bg-[#05070a] border border-[#1a1f28] rounded-xl pl-10 pr-4 py-3.5 text-sm text-white placeholder-gray-600 outline-none focus:border-[#a78bfa]/40 transition-colors font-mono disabled:opacity-50"
            />
          </div>

          <button
            type="submit"
            disabled={activateWithKeyMutation.isPending}
            className="w-full bg-[#16a34a] text-white font-bold text-sm py-3.5 rounded-xl hover:bg-[#15803d] transition-all flex items-center justify-center gap-2 border border-[#14532d] whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {activateWithKeyMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Activating...
              </>
            ) : (
              "Activate"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}