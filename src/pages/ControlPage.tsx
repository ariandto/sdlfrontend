// src/pages/ControlPage.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../../config/firebase";
import apiClient, { setAuthToken } from "../../config/apiClient";

const ControlPage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || 
           (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  const [lastAction, setLastAction] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    // Apply theme to document
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  useEffect(() => {
  const checkSession = async () => {
    try {
      const res = await apiClient.get("/checkSession", { withCredentials: true });
      const decodedUser = res.data.user;
      setUser(decodedUser); // Simulasi user, bisa disesuaikan
    } catch (err) {
      console.warn("❌ Session invalid. Redirecting to login.");
      setUser(null);
      navigate("/");
    }
  };

  checkSession();
}, [navigate]);


  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleBack = () => {
    navigate("/dashboard");
  };

  const handleControl = async (action: "open" | "close") => {
    try {
      setLoading(true);
      setStatus("");
      const response = await apiClient.post("/control", { action });
      setStatus(response.data.message);
      setLastAction(action === "open" ? "Membuka pintu" : "Menutup pintu");
      
      // Clear status after 5 seconds
      setTimeout(() => {
        setStatus("");
      }, 5000);
    } catch (error: any) {
      console.error("❌ Gagal kirim aksi:", error);
      setStatus("Gagal mengirim perintah. Silakan coba lagi.");
      setLastAction("");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
  if (window.confirm("Logout?")) {
    await apiClient.post("/logout", {}, { withCredentials: true });
    window.location.href = "/";
  }
};


  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center transition-colors duration-300">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center border border-gray-200 dark:border-gray-700">
          <div className="text-6xl mb-4">🔐</div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Akses Terbatas
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Silakan login terlebih dahulu untuk mengakses kontrol pintu
          </p>
          <button
            onClick={() => navigate("/")}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200"
          >
            Ke Halaman Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBack}
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
                aria-label="Kembali ke dashboard"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Panel Kontrol
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                aria-label="Toggle dark mode"
              >
                {darkMode ? '☀️' : '🌙'}
              </button>
              
              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="text-sm text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Welcome Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8 border border-gray-200 dark:border-gray-700 transition-colors duration-300">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
              <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Kontrol Pintu Smart Lock
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Kelola akses pintu Anda dengan mudah dan aman
              </p>
            </div>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Open Door Button */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700 transition-colors duration-300">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-3xl text-white">🔓</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Buka Pintu
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
                Buka kunci pintu untuk memberikan akses masuk
              </p>
              <button
                onClick={() => handleControl("open")}
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 px-6 rounded-xl shadow-lg transform hover:scale-105 disabled:hover:scale-100 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                {loading && lastAction === "Membuka pintu" ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Membuka...</span>
                  </>
                ) : (
                  <>
                    <span>🔓</span>
                    <span>Buka Pintu</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Close Door Button */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700 transition-colors duration-300">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-red-400 to-rose-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-3xl text-white">🔒</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Tutup Pintu
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
                Kunci pintu untuk mengamankan akses masuk
              </p>
              <button
                onClick={() => handleControl("close")}
                disabled={loading}
                className="w-full bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 px-6 rounded-xl shadow-lg transform hover:scale-105 disabled:hover:scale-100 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                {loading && lastAction === "Menutup pintu" ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Menutup...</span>
                  </>
                ) : (
                  <>
                    <span>🔒</span>
                    <span>Tutup Pintu</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Status Display */}
        {status && (
          <div className={`rounded-xl p-6 mb-8 border transition-all duration-300 ${
            status.includes("Gagal") 
              ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800" 
              : "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
          }`}>
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${
                status.includes("Gagal") 
                  ? "bg-red-500 animate-pulse" 
                  : "bg-green-500 animate-pulse"
              }`}></div>
              <p className={`font-medium ${
                status.includes("Gagal") 
                  ? "text-red-700 dark:text-red-300" 
                  : "text-green-700 dark:text-green-300"
              }`}>
                {status}
              </p>
            </div>
          </div>
        )}

        

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>&copy; 2025 Smart Door Lock Control Panel. Secure & Reliable.</p>
          <p className="mt-1">Terakhir diakses: {new Date().toLocaleString('id-ID')}</p>
        </div>
      </div>
    </div>
  );
};

export default ControlPage;