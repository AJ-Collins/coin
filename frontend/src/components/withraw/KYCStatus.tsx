import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { CheckCircle, Clock, AlertCircle, Upload, FileText, X } from "lucide-react";
import api from "../../lib/api";
import type { KYCStatus as KYCStatusType } from "../../types/index";

interface KYCStatusProps {
  onStatusChange?: (status: string) => void;
}

export default function KYCStatus({ onStatusChange }: KYCStatusProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResubmitting, setIsResubmitting] = useState(false);
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);

  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);

  const { data: kycStatus, isLoading, refetch } = useQuery<KYCStatusType>({
    queryKey: ["kyc-status"],
    queryFn: async () => {
      const { data } = await api.get("/kyc/status");
      return data;
    },
  });

  const kycMutation = useMutation({
    mutationFn: async (data: { files: File[]; isResubmit: boolean }) => {
      const formData = new FormData();
      data.files.forEach((file) => formData.append("documents", file));
      const endpoint = data.isResubmit ? "/kyc/resubmit" : "/kyc/submit";
      const response = await api.post(endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    },
    onSuccess: (data) => {
      refetch();
      onStatusChange?.(data.status);
      setIsSubmitting(false);
      setIsResubmitting(false);
      setFrontFile(null);
      setBackFile(null);
    },
    onError: (error) => {
      console.error("KYC submission failed:", error);
      setIsSubmitting(false);
      setIsResubmitting(false);
    },
  });

  const handleSelectFront = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setFrontFile(file);
    e.target.value = "";
  };

  const handleSelectBack = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setBackFile(file);
    e.target.value = "";
  };

  const handleSubmitDocuments = async () => {
    if (!frontFile || !backFile) return;
    setIsSubmitting(true);
    await kycMutation.mutateAsync({ files: [frontFile, backFile], isResubmit: isResubmitting });
  };

  if (isLoading) {
    return (
      <div className="bg-[#0d0f17] border border-[#1a1f28] rounded-2xl p-6 animate-pulse">
        <div className="h-24 bg-[#1a1f28] rounded-lg" />
      </div>
    );
  }

  const statusInfo = {
    UNVERIFIED: {
      icon: AlertCircle, color: "text-orange-400", bgColor: "bg-orange-400/10",
      borderColor: "border-orange-400/30", title: "Unverified",
      description: "Submit your documents to start the verification process",
    },
    PENDING: {
      icon: Clock, color: "text-yellow-400", bgColor: "bg-yellow-400/10",
      borderColor: "border-yellow-400/30", title: "Submitted — Under Review",
      description: "Your documents were submitted successfully. Verification may take 24–48 hours.",
    },
    REJECTED: {
      icon: AlertCircle, color: "text-red-400", bgColor: "bg-red-400/10",
      borderColor: "border-red-400/30", title: "Verification Rejected",
      description: "Your submission was rejected. Please resubmit your documents.",
    },
    VERIFIED: {
      icon: CheckCircle, color: "text-[#39ff88]", bgColor: "bg-[#39ff88]/10",
      borderColor: "border-[#39ff88]/30", title: "Verified",
      description: "Your identity has been verified. You can withdraw without limits",
    },
  };

  // The actual live submission status lives in verification.status, not the top-level field.
  const rawStatus = kycStatus?.verification?.status ?? kycStatus?.kycStatus ?? "UNVERIFIED";
  const currentStatus: keyof typeof statusInfo = rawStatus === "APPROVED" ? "VERIFIED" : rawStatus;

  const info = statusInfo[currentStatus] ?? statusInfo.UNVERIFIED;
  const Icon = info.icon;

  // Form is only shown when there's no submission yet, or the last one was rejected
  const showUploadForm = currentStatus === "UNVERIFIED" || currentStatus === "REJECTED";

  const renderUploadSlot = (
    label: string,
    file: File | null,
    onPick: () => void,
    onClear: () => void
  ) => (
    <div className="space-y-1.5">
      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">{label}</span>
      {file ? (
        <div className="flex items-center justify-between bg-[#05070a] border border-[#1a1f28] rounded-lg px-3 py-2.5">
          <div className="flex items-center gap-2 min-w-0">
            <FileText className="h-4 w-4 text-[#39ff88] flex-shrink-0" />
            <span className="text-xs text-gray-300 truncate">{file.name}</span>
          </div>
          <button type="button" onClick={onClear} className="text-gray-500 hover:text-red-400 flex-shrink-0 ml-2">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={onPick}
          className="w-full border border-dashed border-[#2a313e] hover:border-[#39ff88]/50 rounded-lg py-5 flex flex-col items-center justify-center gap-1.5 text-gray-500 hover:text-[#39ff88] transition-colors"
        >
          <Upload className="h-5 w-5" />
          <span className="text-[11px] font-medium">Click to select file</span>
          <span className="text-[10px] text-gray-600">JPG, PNG, PDF · max 5MB</span>
        </button>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className={`${info.bgColor} border ${info.borderColor} rounded-2xl p-6`}>
        <div className="flex items-start gap-3">
          <Icon className={`h-6 w-6 ${info.color} flex-shrink-0 mt-1`} />
          <div>
            <h3 className={`text-lg font-bold ${info.color}`}>{info.title}</h3>
            <p className="text-xs text-gray-400 mt-1">{info.description}</p>
          </div>
        </div>

        {showUploadForm && (
          <div className="mt-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {renderUploadSlot(
                "ID Front",
                frontFile,
                () => frontInputRef.current?.click(),
                () => setFrontFile(null)
              )}
              {renderUploadSlot(
                "ID Back",
                backFile,
                () => backInputRef.current?.click(),
                () => setBackFile(null)
              )}
            </div>

            <input ref={frontInputRef} type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={handleSelectFront} className="hidden" />
            <input ref={backInputRef} type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={handleSelectBack} className="hidden" />

            <button
              onClick={() => {
                setIsResubmitting(currentStatus === "REJECTED");
                handleSubmitDocuments();
              }}
              disabled={isSubmitting || !frontFile || !backFile}
              className="w-full bg-[#39ff88] text-[#05070a] font-bold text-xs py-2.5 rounded-lg hover:bg-[#5dffa1] transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
            >
              <Upload className="h-4 w-4" />
              {isSubmitting ? "Uploading..." : currentStatus === "REJECTED" ? "Resubmit Documents" : "Submit Documents"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}