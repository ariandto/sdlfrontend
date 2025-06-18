import React, { useState, useEffect } from "react";
import { signInWithPopup, onAuthStateChanged, User } from "firebase/auth";
import { auth, provider } from "../../config/firebase";
import apiClient from "../../config/apiClient";
import { useNavigate } from "react-router-dom";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [userInfo, setUserInfo] = useState<{ name: string; photoURL: string } | null>(null);

  // Cek session dari backend jika user sudah login di Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      if (user) {
        console.log("👀 User Firebase terdeteksi, cek session backend...");
        try {
          await apiClient.get("/checkSession", { withCredentials: true });
          navigate("/dashboard");
        } catch {
          console.log("❌ Session tidak valid, user perlu login ulang.");
        }
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogin = async () => {
    setIsLoading(true);
    setError("");
    setUserInfo(null);

    try {
      console.log("🔐 Login Google dimulai...");
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (!user) throw new Error("Tidak ada user yang dikembalikan");

      console.log("✅ Login berhasil:", user.email);

      const idToken = await user.getIdToken(true); // Ambil token terbaru
      console.log("🔑 ID Token berhasil diambil");

      // Kirim ke backend untuk membuat session cookie
      const res = await apiClient.post(
        "/sessionLogin",
        {
          idToken,
          name: user.displayName,
          photoURL: user.photoURL,
        },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("✅ Session backend berhasil:", res.data);

      // Simpan info user
      setUserInfo({
        name: res.data.user.name,
        photoURL: res.data.user.photoURL,
      });

      // Opsional: beri delay agar user lihat profilnya dulu
      setTimeout(() => {
        navigate("/dashboard", { replace: true });
      }, 2000);
    } catch (error: any) {
      console.error("❌ Error saat login:", error);

      let errorMessage = "Login gagal. Coba lagi.";
      if (error.code === "auth/popup-closed-by-user") {
        errorMessage = "Popup ditutup sebelum login selesai.";
      } else if (error.code === "auth/popup-blocked") {
        errorMessage = "Popup diblokir oleh browser.";
      } else if (error.response?.status === 401) {
        errorMessage = "Token tidak valid. Silakan login ulang.";
      } else if (!navigator.onLine) {
        errorMessage = "Koneksi internet tidak tersedia.";
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg text-center w-[90%] max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
          Smart Door Control
        </h1>

        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Silakan login untuk mengakses sistem kontrol pintu
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {userInfo && (
          <div className="mb-6">
            <img
              src={userInfo.photoURL}
              alt="Foto Profil"
              className="w-20 h-20 rounded-full mx-auto mb-2 shadow-md"
            />
            <p className="text-lg font-semibold text-gray-800 dark:text-white">
              {userInfo.name}
            </p>
          </div>
        )}

        <button
          onClick={handleLogin}
          disabled={isLoading}
          className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
            isLoading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800"
          } text-white shadow-md hover:shadow-lg`}
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              <span>Masuk...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>Login dengan Google</span>
            </>
          )}
        </button>

        <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
          Dengan login, Anda menyetujui penggunaan sistem ini sesuai kebijakan yang berlaku.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
