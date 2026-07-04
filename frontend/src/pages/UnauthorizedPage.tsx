import { Link } from "react-router-dom";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#05070a] text-white text-center px-4">
      <h1 className="text-3xl font-black mb-2">403 — Not authorized</h1>
      <p className="text-gray-400 mb-6">You don't have permission to view this page.</p>
      <Link to="/" className="text-[#a78bfa] font-semibold hover:underline">← Back home</Link>
    </div>
  );
}