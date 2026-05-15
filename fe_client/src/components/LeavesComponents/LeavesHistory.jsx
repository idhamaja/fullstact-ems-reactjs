import { format } from "date-fns";
import { Check, ImageOff, Loader2, X } from "lucide-react";
import React, { useState } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";

// ─── Constants ────────────────────────────────────────────────────────────────

const SERVER_URL =
  import.meta.env.VITE_API_URL?.replace("/api", "") ?? "http://localhost:5000";

/** Ubah path relatif `/uploads/...` menjadi URL absolut yang bisa dibuka browser */
const resolveUrl = (url) => {
  if (!url) return null;
  return url.startsWith("http") ? url : `${SERVER_URL}${url}`;
};

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

/** Thumbnail foto bukti — klik untuk preview, fallback jika error / PDF / kosong */
const EvidenceThumbnail = ({ evidenceUrl, onPreview }) => {
  const [imgError, setImgError] = useState(false);

  if (!evidenceUrl) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-slate-300 italic select-none">
        <ImageOff className="w-4 h-4" />
        No file
      </span>
    );
  }

  const resolved = resolveUrl(evidenceUrl);
  const isPdf =
    /\.pdf$/i.test(evidenceUrl) || evidenceUrl.includes("application/pdf");

  if (isPdf) {
    return (
      <a
        href={resolved}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full
                   bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 transition-colors"
      >
        PDF
      </a>
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
      onClick={onPreview}
      title="Click to preview"
      className="group relative w-14 h-14 rounded-xl overflow-hidden border-2 border-slate-200
                 hover:border-indigo-400 shadow-sm hover:shadow-md transition-all focus:outline-none
                 focus-visible:ring-2 focus-visible:ring-indigo-400"
    >
      <img
        src={resolved}
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

  // non-admin: Type · Dates · Reason · Evidence · Status          = 5 kolom
  // admin    : + Employee + Actions                                = 7 kolom
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
                            evidenceUrl={leave.evidenceUrl}
                            onPreview={() =>
                              setPreviewUrl(resolveUrl(leave.evidenceUrl))
                            }
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
