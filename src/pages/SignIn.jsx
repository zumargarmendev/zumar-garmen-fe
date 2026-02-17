import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import secondaryLogo from '../assets/Logo/secondary_logo.png';
import StickyNavbar from '../components/Navbar';
import LoginPerson from '../assets/Image/Login_person.png';
import { signIn, isAdmin, fetchAndStoreUserPermissions, logout, getCurrentUser } from '../api/auth';
import { saveToken, getToken } from '../utils/tokenManager';
import { getUserList } from '../api/user/user';

const STORAGE_KEY = 'loginAttempts';
const MAX_ATTEMPTS = 5;
const BASE_LOCKOUT = 30_000; // 30 detik
const MAX_LOCKOUT = 15 * 60_000; // 15 menit

const getStoredAttempts = () => {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!stored) return { count: 0, lockoutCount: 0, lockedUntil: 0 };
    // Jika lock sudah expired lebih dari MAX_LOCKOUT, reset semua
    if (stored.lockedUntil && Date.now() > stored.lockedUntil + MAX_LOCKOUT) {
      localStorage.removeItem(STORAGE_KEY);
      return { count: 0, lockoutCount: 0, lockedUntil: 0 };
    }
    return stored;
  } catch {
    return { count: 0, lockoutCount: 0, lockedUntil: 0 };
  }
};

const saveAttempts = (data) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

const clearAttempts = () => {
  localStorage.removeItem(STORAGE_KEY);
};

const getLockoutDuration = (lockoutCount) => {
  // Exponential backoff: 30s → 60s → 120s → 240s → ... cap 15 menit
  return Math.min(BASE_LOCKOUT * Math.pow(2, lockoutCount), MAX_LOCKOUT);
};

const SignIn = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    uEmail: '',
    uPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [animatePage, setAnimatePage] = useState(false);
  const [lockedUntil, setLockedUntil] = useState(() => {
    const stored = getStoredAttempts();
    return stored.lockedUntil && Date.now() < stored.lockedUntil ? stored.lockedUntil : null;
  });

  const isLocked = lockedUntil && Date.now() < lockedUntil;

  useEffect(() => {
    setTimeout(() => setAnimatePage(true), 50);

    const checkAuth = async () => {
      const token = getToken();
      if (token) {
        try {
          await fetchAndStoreUserPermissions();
          navigate(isAdmin() ? '/admin/dashboard' : '/', { replace: true });
        } catch {
          logout();
        }
      }
    };
    checkAuth();

    // Tampilkan error jika masih dalam lockout saat mount
    if (lockedUntil && Date.now() < lockedUntil) {
      const seconds = Math.ceil((lockedUntil - Date.now()) / 1000);
      setError(`Terlalu banyak percobaan. Coba lagi dalam ${seconds} detik.`);
    }
  }, [navigate, lockedUntil]);

  // Countdown timer untuk lockout
  useEffect(() => {
    if (!lockedUntil) return;
    const remaining = lockedUntil - Date.now();
    if (remaining <= 0) {
      setLockedUntil(null);
      setError('');
      return;
    }

    const interval = setInterval(() => {
      const left = lockedUntil - Date.now();
      if (left <= 0) {
        clearInterval(interval);
        setLockedUntil(null);
        setError('');
      } else {
        const secs = Math.ceil(left / 1000);
        setError(`Terlalu banyak percobaan. Coba lagi dalam ${secs} detik.`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lockedUntil]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  const handleLoginFailure = () => {
    const stored = getStoredAttempts();
    const newCount = stored.count + 1;

    if (newCount >= MAX_ATTEMPTS) {
      const newLockoutCount = stored.lockoutCount + 1;
      const duration = getLockoutDuration(stored.lockoutCount);
      const until = Date.now() + duration;
      saveAttempts({ count: 0, lockoutCount: newLockoutCount, lockedUntil: until });
      setLockedUntil(until);
    } else {
      saveAttempts({ ...stored, count: newCount });
      setError(`Login gagal. Email atau password salah. (${newCount}/${MAX_ATTEMPTS})`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLocked) return;

    setLoading(true);
    setError('');
    try {
      const res = await signIn(form.uEmail, form.uPassword);

      if (res.data?.data?.token) {
        clearAttempts();
        saveToken(res.data.data.token);
        await fetchAndStoreUserPermissions();

        // Workaround: cek apakah user masih ada di database (hanya untuk admin)
        // Backend bug: DELETE /api/user tidak cascade delete auth credentials
        if (isAdmin()) {
          try {
            const user = getCurrentUser();
            // Backend search hanya filter by uName, bukan uEmail
            // Search by nama untuk response ringan, lalu exact match email client-side
            const userRes = await getUserList({ pageLimit: 10, pageNumber: 1, search: user?.name });
            const users = userRes.data?.data?.listData || [];
            const exists = users.some(u =>
              u.uEmail?.toLowerCase() === user?.email?.toLowerCase()
            );
            if (!exists) {
              logout();
              setError('Akun tidak ditemukan. Hubungi administrator.');
              setLoading(false);
              return;
            }
          } catch {
            // Jika gagal cek, lanjut saja (jangan block login)
          }
          window.location.href = '/admin/dashboard';
        } else {
          window.location.href = '/';
        }
      } else {
        // Backend return 200 tapi tanpa token = login gagal
        handleLoginFailure();
      }
    } catch {
      handleLoginFailure();
    }
    setLoading(false);
  };

  return (
    <>
      <StickyNavbar />
      <div className="relative min-h-screen bg-gray-100 flex flex-col justify-center p-4 font-montserrat overflow-x-hidden">
        {/* SVG Polygon Kanan Bawah */}
        <div
          className="hidden md:block fixed right-0 bottom-0 z-0 pointer-events-none"
          style={{ width: 'min(25vw, 340px)', height: 'min(25vw, 340px)' }}
        >
          <svg viewBox="0 0 600 600" className="w-full h-full">
            <polygon points="600,0 600,600 0,600" fill="#245156" />
            <polygon points="600,0 600,400 400,600 600,600" fill="#E26C02" />
          </svg>
        </div>

        <main
          className={`relative z-10 w-full flex flex-col lg:flex-row max-w-6xl overflow-hidden items-start mx-auto transition-opacity duration-700 ${
            animatePage ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* Left Section */}
          <div className="lg:w-3/5 bg-gray-100 p-8 flex flex-col justify-between items-center text-primaryColor text-center">
            <div className="flex items-center w-full">
              <img src={secondaryLogo} alt="Logo" className="h-40 mr-4" />
              <div className="flex flex-col text-left">
                <h2 className="text-4xl font-bold mb-1">Masuk</h2>
                <p className="text-2xl font-light mb-2">Zumar Garmen</p>
                <p className="text-sm max-w-xs">
                  Nikmati kemudahan berbelanja produk konveksi berkualitas tinggi. Dari seragam kerja, pakaian olahraga, hingga fashion kasual - semua dibuat dengan standar terbaik dan pelayanan profesional.
                </p>
              </div>
            </div>
            <div className="mt-auto w-full flex items-center justify-center">
              <img src={LoginPerson} alt="Login" className="w-auto h-auto" />
            </div>
          </div>

          {/* Right Section */}
          <div
            className={`lg:w-2/5 px-6 py-4 bg-gray-300 rounded-xl shadow-lg flex flex-col justify-start transition-all duration-700 ${
              animatePage ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-4xl font-semibold text-primaryColor">Masuk</h2>
              <div className="text-sm">
                <span className="text-gray-600">Belum Punya Akun? </span>
                <a href="/sign-up" className="text-secondaryColor font-medium">
                  Daftar
                </a>
              </div>
            </div>

            <form className="space-y-4 w-full max-w-md mx-auto" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="uEmail" className="block text-gray-700 text-sm font-medium mb-1">
                  Alamat email
                </label>
                <input
                  type="email"
                  id="uEmail"
                  placeholder="Alamat email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondaryColor"
                  value={form.uEmail}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label htmlFor="uPassword" className="block text-gray-700 text-sm font-medium mb-1">
                  Kata Sandi
                </label>
                <input
                  type="password"
                  id="uPassword"
                  placeholder="Password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondaryColor"
                  value={form.uPassword}
                  onChange={handleChange}
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-primaryColor text-white py-3 rounded-md font-semibold hover:bg-[#2a5560] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading || isLocked}
              >
                {loading ? 'Loading...' : isLocked ? 'Coba lagi nanti...' : 'Sign In'}
              </button>
              {error && <div className="text-red-500 text-sm text-center mt-2">{error}</div>}
            </form>
          </div>
        </main>
      </div>
    </>
  );
};

export default SignIn;
