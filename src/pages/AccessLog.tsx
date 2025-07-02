import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import apiClient from "../../config/apiClient";
import DeleteModal from "../modals/deleteModal"; // 👉 adjust the path if different

interface AccessLog {
  id: string;
  timestamp: string;
  method: string;
  user: string;
  door: string;
  alarm: string;
}

const AccessLogPage: React.FC = () => {
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* ------------------------------------------------------------
   * Modal state
   * ---------------------------------------------------------- */
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [confirmAction, setConfirmAction] = useState<() => Promise<void>>(async () => {});

  const formatDateTime = (iso: string) =>
    new Date(iso).toLocaleString("id-ID", {
      timeZone: "Asia/Jakarta",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

  /* ------------------------------------------------------------
   * Fetching data
   * ---------------------------------------------------------- */
  const fetchLogs = async () => {
    try {
      const { data } = await apiClient.get<{ total: number; logs: AccessLog[] }>("/access-logs", {
        withCredentials: true,
      });
      setLogs(data.logs || []);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Gagal memuat data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  /* ------------------------------------------------------------
   * Helpers to open modal with dynamic action
   * ---------------------------------------------------------- */
  const openDeleteModal = (
    title: string,
    message: string,
    action: () => Promise<void>
  ) => {
    setModalTitle(title);
    setModalMessage(message);
    setConfirmAction(() => action);
    setModalOpen(true);
  };

  const handleConfirm = useCallback(async () => {
    setModalLoading(true);
    await confirmAction();
    setModalLoading(false);
    setModalOpen(false);
  }, [confirmAction]);

  /* ------------------------------------------------------------
   * Delete single log
   * ---------------------------------------------------------- */
  const deleteLog = async (id: string) => {
    openDeleteModal("Hapus Riwayat", "Apakah Anda yakin ingin menghapus riwayat ini?", async () => {
      try {
        await apiClient.delete(`/access-logs/${id}`, { withCredentials: true });
        setLogs((prev) => prev.filter((log) => log.id !== id));
      } catch (err) {
        alert("Gagal menghapus riwayat.");
      }
    });
  };

  /* ------------------------------------------------------------
   * Delete all logs
   * ---------------------------------------------------------- */
  const deleteAll = async () => {
    if (logs.length === 0) return;
    openDeleteModal("Hapus Semua Riwayat", "Apakah Anda yakin ingin menghapus semua riwayat akses?", async () => {
      try {
        await apiClient.delete(`/access-logs`, { withCredentials: true });
        setLogs([]);
      } catch (err) {
        alert("Gagal menghapus semua riwayat.");
      }
    });
  };

  /* ------------------------------------------------------------
   * Render states
   * ---------------------------------------------------------- */
  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 transition-colors dark:from-gray-900 dark:to-gray-800">
        <p className="text-lg text-gray-700 dark:text-gray-300">Memuat data…</p>
      </div>
    );

  if (error)
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 transition-colors dark:from-gray-900 dark:to-gray-800">
        <p className="text-lg text-red-600 dark:text-red-400">{error}</p>
      </div>
    );

  /* ------------------------------------------------------------
   * Main return (table + modal)
   * ---------------------------------------------------------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 transition-colors dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Riwayat Akses</h1>
          <div className="flex gap-3">
            <button
              onClick={deleteAll}
              className="rounded-md bg-red-600 px-4 py-2 text-white transition hover:bg-red-700"
            >
              🗑️ Hapus Semua
            </button>
            <Link
              to="/dashboard"
              className="rounded-md bg-indigo-600 px-4 py-2 text-white transition hover:bg-indigo-700"
            >
              ⬅︎ Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr className="text-gray-700 dark:text-gray-300">
                  <th className="px-4 py-3 font-medium">No</th>
                  <th className="whitespace-nowrap px-4 py-3 font-medium">Tanggal & Waktu</th>
                  <th className="px-4 py-3 font-medium">Metode</th>
                  <th className="px-4 py-3 font-medium">Pengguna</th>
                  <th className="px-4 py-3 font-medium">Status Pintu</th>
                  <th className="px-4 py-3 font-medium">Status Alarm</th>
                  <th className="px-4 py-3 font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-6 text-center text-gray-500 dark:text-gray-400">
                      Belum ada data akses.
                    </td>
                  </tr>
                ) : (
                  logs.map((log, idx) => (
                    <tr
                      key={log.id}
                      className={idx % 2 === 0 ? "bg-gray-50 dark:bg-gray-900" : "bg-white dark:bg-gray-800"}
                    >
                      <td className="whitespace-nowrap px-4 py-2">{idx + 1}</td>
                      <td className="whitespace-nowrap px-4 py-2">{formatDateTime(log.timestamp)}</td>
                      <td className="whitespace-nowrap px-4 py-2">{log.method}</td>
                      <td className="whitespace-nowrap px-4 py-2">{log.user}</td>
                      <td
                        className={`whitespace-nowrap px-4 py-2 font-semibold ${
                          log.door.toLowerCase() === "terbuka"
                            ? "text-red-600 dark:text-red-400"
                            : "text-green-600 dark:text-green-400"
                        }`}
                      >
                        {log.door}
                      </td>
                      <td
                        className={`whitespace-nowrap px-4 py-2 font-semibold ${
                          log.alarm.toLowerCase() === "alarm!"
                            ? "text-orange-600 dark:text-orange-400"
                            : "text-gray-600 dark:text-gray-400"
                        }`}
                      >
                        {log.alarm}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2">
                        <button onClick={() => deleteLog(log.id)} className="text-sm text-red-600 hover:underline">
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>&copy; 2025 Smart Door Lock System. All rights reserved.</p>
          <p className="mt-1">Terakhir diperbarui: {new Date().toLocaleString("id-ID")}</p>
        </footer>
      </main>

      {/* Delete Confirmation Modal */}
      <DeleteModal
        open={modalOpen}
        loading={modalLoading}
        title={modalTitle}
        message={modalMessage}
        confirmLabel="Hapus"
        cancelLabel="Batal"
        onConfirm={handleConfirm}
        onClose={() => (modalLoading ? null : setModalOpen(false))}
      />
    </div>
  );
};

export default AccessLogPage;
