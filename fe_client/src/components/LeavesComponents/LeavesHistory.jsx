import { format } from "date-fns";
import { Check, ImageOff, Loader2, X } from "lucide-react";
import React, { useState } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Overlay preview gambar fullscreen */
const ImagePreviewModal = ({ url, onClose }) => {
  if (!url) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative max-w-2xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white hover:text-slate-300 transition-colors"
          aria-label="Close preview"
        >
          <X className="w-7 h-7" />
        </button>
        <img
          src={url}
          alt="Evidence preview"
          className="w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl"
        />
      </div>
    </div>
  );
};

/**
 * Thumbnail foto bukti.
 * - Employee view: evidenceData sudah ada di prop (Base64 data URI).
 * - Admin view: evidenceData tidak di-include di list response untuk hemat bandwidth.
 *   Saat admin klik thumbnail, lazy-fetch dari GET /api/leave/:id/evidence.
 */
const EvidenceThumbnail = ({ leave, isAdmin, onPreview }) => {
  const [imgError, setImgError] = useState(false);
  const [loadingEvidence, setLoadingEvidence] = useState(false);

  const evidenceData = leave.evidenceData;

  // Tidak ada evidence sama sekali
  if (!evidenceData && !isAdmin) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-slate-300 italic select-none">
        <ImageOff className="w-4 h-4" />
        No file
      </span>
    );
  }

  // Admin: evidenceData tidak dikirim di list, tampilkan tombol "View" yang lazy-fetch
  if (isAdmin && !evidenceData) {
    const handleAdminView = async () => {
      setLoadingEvidence(true);
      try {
        const res = await api.get(`/leave/${leave._id || leave.id}/evidence`);
        const data = res.data.evidenceData;
        if (!data) {
          toast.error("No evidence file attached.");
          return;
        }
        onPreview(data);
      } catch {
        toast.error("Failed to load evidence.");
      } finally {
        setLoadingEvidence(false);
      }
    };

    return (
      <button
        onClick={handleAdminView}
        disabled={loadingEvidence}
        className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full
                   bg-indigo-50 text-indigo-600 border border-indigo-200 hover:bg-indigo-100
                   transition-colors disabled:opacity-60"
      >
        {loadingEvidence ? (
          <Loader2 className="w-3 h-3 animate-spin mr-1" />
        ) : null}
        {loadingEvidence ? "Loading..." : "View"}
      </button>
    );
  }

  const isPdf = evidenceData?.startsWith("data:application/pdf");

  // PDF: buka di tab baru
  if (isPdf) {
    const handleOpenPdf = () => {
      const blob = dataURItoBlob(evidenceData);
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    };
    return (
      <button
        onClick={handleOpenPdf}
        className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full
                   bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 transition-colors"
      >
        PDF
      </button>
    );
  }

  if (imgError) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-slate-300 italic select-none">
        <ImageOff className="w-4 h-4" />
        No preview
      </span>
    );
  }

  return (
    <button
      onClick={() => onPreview(evidenceData)}
      title="Click to preview"
      className="group relative w-14 h-14 rounded-xl overflow-hidden border-2 border-slate-200
                 hover:border-indigo-400 shadow-sm hover:shadow-md transition-all focus:outline-none
                 focus-visible:ring-2 focus-visible:ring-indigo-400"
    >
      <img
        src={evidenceData}
        alt="Evidence"
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
        onError={() => setImgError(true)}
      />
      <div
        className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors duration-200
                      flex items-center justify-center"
      >
        <span className="text-white text-[10px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
          View
        </span>
      </div>
    </button>
  );
};

/** Helper: konversi Base64 data URI ke Blob (untuk buka PDF) */
function dataURItoBlob(dataURI) {
  const [header, base64] = dataURI.split(",");
  const mime = header.match(/:(.*?);/)[1];
  const binary = atob(base64);
  const arr = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) arr[i] = binary.charCodeAt(i);
  return new Blob([arr], { type: mime });
}

/** Badge status dengan warna sesuai nilai */
const StatusBadge = ({ status }) => {
  const styles = {
    APPROVED: "bg-emerald-100 text-emerald-700",
    REJECTED: "bg-rose-100 text-rose-700",
    PENDING: "bg-amber-100 text-amber-700",
  };

  return (
    <span
      className={`inline-flex items-center px-4 py-1.5 text-xs font-semibold
                  rounded-full uppercase tracking-wider ${styles[status] ?? styles.PENDING}`}
    >
      {status}
    </span>
  );
};

/** Tombol aksi approve / reject untuk admin */
const ActionButtons = ({ leaveId, isProcessing, onApprove, onReject }) => (
  <div className="flex items-center justify-center gap-3">
    <button
      onClick={onApprove}
      disabled={isProcessing}
      title="Approve"
      className="p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-600
                 transition-all disabled:opacity-50 focus:outline-none focus-visible:ring-2
                 focus-visible:ring-emerald-400"
    >
      {isProcessing ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <Check className="w-5 h-5" />
      )}
    </button>

    <button
      onClick={onReject}
      disabled={isProcessing}
      title="Reject"
      className="p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600
                 transition-all disabled:opacity-50 focus:outline-none focus-visible:ring-2
                 focus-visible:ring-rose-400"
    >
      {isProcessing ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <X className="w-5 h-5" />
      )}
    </button>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const LeavesHistory = ({ leaves, isAdmin, onUpdate }) => {
  const [processing, setProcessing] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleStatusUpdate = async (id, status) => {
    setProcessing(id);
    try {
      await api.patch(`/leave/${id}`, { status });
      onUpdate();
    } catch (error) {
      toast.error(error?.response?.data?.error || error?.message);
    } finally {
      setProcessing(null);
    }
  };

  const colSpan = isAdmin ? 7 : 5;

  return (
    <>
      <ImagePreviewModal url={previewUrl} onClose={() => setPreviewUrl(null)} />

      <div className="w-full mt-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
            <h3 className="text-lg font-semibold text-slate-800">
              Leave History
            </h3>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-full divide-y divide-slate-200">
              <thead>
                <tr className="bg-slate-50">
                  {isAdmin && (
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 whitespace-nowrap w-44">
                      Employee
                    </th>
                  )}
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 whitespace-nowrap w-40">
                    Leave Type
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 whitespace-nowrap w-56">
                    Dates
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 min-w-[240px]">
                    Reason
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 whitespace-nowrap w-28">
                    Evidence
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 whitespace-nowrap w-36">
                    Status
                  </th>
                  {isAdmin && (
                    <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700 whitespace-nowrap w-32">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 bg-white">
                {leaves.length === 0 ? (
                  <tr>
                    <td
                      colSpan={colSpan}
                      className="px-6 py-20 text-center text-slate-400 text-base"
                    >
                      No leave applications found
                    </td>
                  </tr>
                ) : (
                  leaves.map((leave) => {
                    const leaveId = leave._id || leave.id;
                    const isProcessing = processing === leaveId;

                    return (
                      <tr
                        key={leaveId}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        {/* Employee name — admin only */}
                        {isAdmin && (
                          <td className="px-6 py-5 whitespace-nowrap text-slate-900 font-medium">
                            {leave.employee?.firstName}{" "}
                            {leave.employee?.lastName}
                          </td>
                        )}

                        {/* Leave type */}
                        <td className="px-6 py-5">
                          <span className="inline-flex px-3.5 py-1 text-sm font-medium rounded-full bg-slate-100 text-slate-700">
                            {leave.type}
                          </span>
                        </td>

                        {/* Date range */}
                        <td className="px-6 py-5 text-sm text-slate-600 whitespace-nowrap">
                          {format(new Date(leave.startDate), "dd MMM yyyy")}
                          {" — "}
                          {format(new Date(leave.endDate), "dd MMM yyyy")}
                        </td>

                        {/* Reason */}
                        <td className="px-6 py-5 text-slate-700 pr-8">
                          {leave.reason}
                        </td>

                        {/* Evidence thumbnail */}
                        <td className="px-6 py-5">
                          <EvidenceThumbnail
                            leave={leave}
                            isAdmin={isAdmin}
                            onPreview={setPreviewUrl}
                          />
                        </td>

                        {/* Status badge */}
                        <td className="px-6 py-5">
                          <StatusBadge status={leave.status} />
                        </td>

                        {/* Approve / Reject — admin + pending only */}
                        {isAdmin && (
                          <td className="px-6 py-5">
                            {leave.status === "PENDING" && (
                              <ActionButtons
                                leaveId={leaveId}
                                isProcessing={isProcessing}
                                onApprove={() =>
                                  handleStatusUpdate(leaveId, "APPROVED")
                                }
                                onReject={() =>
                                  handleStatusUpdate(leaveId, "REJECTED")
                                }
                              />
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default LeavesHistory;
