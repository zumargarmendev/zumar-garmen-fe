import React, { useState, useEffect, useRef } from 'react';
import secondaryLogoWhite from '../assets/Logo/secondary_logo_white.png';
import StickyNavbar from '../components/Navbar';
import LoginPerson from '../assets/Image/Login_person.png';
import { signUp } from '../api/auth';
import { getToken } from '../utils/tokenManager';

// --- Layer 1: Rate Limiting (semua attempt, sukses + gagal) ---
const SIGNUP_STORAGE_KEY = 'signupAttempts';
const SIGNUP_MAX_ATTEMPTS = 3;
const SIGNUP_WINDOW = 30 * 60_000; // 30 menit

const getSignupAttempts = () => {
  try {
    const stored = JSON.parse(localStorage.getItem(SIGNUP_STORAGE_KEY));
    if (!stored) return { timestamps: [] };
    // Bersihkan timestamp yang sudah expired
    const now = Date.now();
    const valid = (stored.timestamps || []).filter(t => now - t < SIGNUP_WINDOW);
    return { timestamps: valid };
  } catch {
    return { timestamps: [] };
  }
};

const addSignupAttempt = () => {
  const stored = getSignupAttempts();
  stored.timestamps.push(Date.now());
  localStorage.setItem(SIGNUP_STORAGE_KEY, JSON.stringify(stored));
};

const isSignupLimited = () => {
  const { timestamps } = getSignupAttempts();
  return timestamps.length >= SIGNUP_MAX_ATTEMPTS;
};

const getSignupCooldown = () => {
  const { timestamps } = getSignupAttempts();
  if (timestamps.length < SIGNUP_MAX_ATTEMPTS) return 0;
  const oldest = timestamps[timestamps.length - SIGNUP_MAX_ATTEMPTS];
  const remaining = SIGNUP_WINDOW - (Date.now() - oldest);
  return Math.max(0, remaining);
};

// --- Layer 3: Timing Check ---
const MIN_FILL_TIME = 3000; // 3 detik minimum untuk isi form

const SignUp = () => {
  const [form, setForm] = useState({
    uName: '',
    uAddress: '',
    uEmail: '',
    uPhone: '',
    uPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [animatePage, setAnimatePage] = useState(false);
  const [cooldownText, setCooldownText] = useState('');

  // Layer 2: Honeypot
  const [honeypot, setHoneypot] = useState('');

  // Layer 3: Timing — catat waktu mount
  const mountTime = useRef(Date.now());

  useEffect(() => {
    setTimeout(() => setAnimatePage(true), 50);

    if (getToken()) {
      window.location.href = '/';
    }
  }, []);

  // Countdown timer untuk rate limit cooldown
  useEffect(() => {
    const cooldown = getSignupCooldown();
    if (cooldown <= 0) {
      setCooldownText('');
      return;
    }

    const updateCooldown = () => {
      const remaining = getSignupCooldown();
      if (remaining <= 0) {
        setCooldownText('');
        return;
      }
      const minutes = Math.ceil(remaining / 60_000);
      setCooldownText(`Terlalu banyak percobaan registrasi. Coba lagi dalam ${minutes} menit.`);
    };

    updateCooldown();
    const interval = setInterval(updateCooldown, 30_000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();

    // Layer 2: Honeypot check — bot isi field tersembunyi
    if (honeypot) return;

    // Layer 3: Timing check — terlalu cepat = bot
    if (Date.now() - mountTime.current < MIN_FILL_TIME) {
      setError('Terlalu cepat. Silakan isi form dengan lengkap.');
      return;
    }

    // Layer 1: Rate limiting check
    if (isSignupLimited()) {
      const minutes = Math.ceil(getSignupCooldown() / 60_000);
      setCooldownText(`Terlalu banyak percobaan registrasi. Coba lagi dalam ${minutes} menit.`);
      setError(`Terlalu banyak percobaan registrasi. Coba lagi dalam ${minutes} menit.`);
      return;
    }

    setLoading(true);
    setError('');

    // Catat attempt (sukses maupun gagal)
    addSignupAttempt();

    try {
      const res = await signUp({ ...form });
      if (res.data && res.data.status === 'success') {
        window.location.href = '/sign-in';
      }
    } catch {
      setError('Register gagal. Pastikan data sudah benar dan email belum terdaftar.');
    }
    setLoading(false);
  };

  return (
    <>
    <StickyNavbar />
    <div className="relative min-h-screen bg-primaryColor flex flex-col justify-center p-4 font-montserrat overflow-x-hidden">
      {/* SVG Polygon Kanan Bawah */}
      <div
        className="hidden md:block fixed right-0 bottom-0 z-0 pointer-events-none"
        style={{ width: 'min(18vw, 180px)', height: 'min(18vw, 180px)' }}
      >
        <svg viewBox="0 0 600 600" className="w-full h-full">
          {/* Segitiga orange */}
          <polygon points="600,0 600,600 0,600" fill="#E26C02" />
        </svg>
      </div>
      <div className={`relative z-10 flex flex-col lg:flex-row w-full max-w-6xl overflow-hidden mx-auto transition-opacity duration-700 ${animatePage ? 'opacity-100' : 'opacity-0'}`}>
        {/* Left Section (Marketing) */}
        <div className="lg:w-3/5 bg-primaryColor p-8 flex flex-col justify-between items-center text-white text-center">
          {/* Logo and Text Wrapper */}
          <div className="flex items-center w-full">
            <img src={secondaryLogoWhite} alt="Zumar Apparels Logo" className="h-40 mr-4" />
            <div className="flex flex-col text-left">
              <h2 className="text-4xl font-bold mb-1">Sign Up To</h2>
              <p className="text-2xl font-light mb-2">Zumar Garmen</p>
              <p className="text-sm max-w-xs">Daftarkan akun Anda sekarang untuk menikmati pengalaman belanja mudah, cepat, dan produk konveksi unggulan dari Zumar Garmen Indonesia.</p>
            </div>
          </div>
          {/* Image */}
          <div className="mt-auto w-full flex items-center justify-center">
            <img 
              src={LoginPerson} 
              alt="Woman with shopping bags" 
              className="w-auto h-auto" 
            />
         </div>
        </div>

        {/* Right Section (Registration Form) */}
        <div className={`lg:w-2/5 px-6 py-4 bg-gray-100 rounded-xl shadow-lg flex flex-col justify-center transition-all duration-700 ${animatePage ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-4xl font-semibold text-primaryColor">Daftar</h2>
            <div className="text-sm">
              <span className="text-gray-600">Sudah Punya Akun? </span>
              <a href="/sign-in" className="text-secondaryColor font-medium">Masuk</a>
            </div>
          </div>

          <form className="space-y-4 w-full max-w-md mx-auto" onSubmit={handleSubmit}>
            {/* Layer 2: Honeypot — hidden field, invisible to real users */}
            <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', opacity: 0, height: 0, overflow: 'hidden' }}>
              <label htmlFor="website">Website</label>
              <input
                type="text"
                id="website"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={e => setHoneypot(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="uEmail" className="block text-gray-700 text-sm font-medium mb-1">Alamat email <span className="text-red-500 ml-1">*</span></label>
              <input type="email" id="uEmail" name="uEmail" placeholder="Alamat email" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondaryColor" value={form.uEmail} onChange={handleChange} required />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="uName" className="block text-gray-700 text-sm font-medium mb-1">User name <span className="text-red-500 ml-1">*</span></label>
                <input type="text" id="uName" name="uName" placeholder="User name" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondaryColor" value={form.uName} onChange={handleChange} required />
              </div>
              <div>
                <label htmlFor="uPhone" className="block text-gray-700 text-sm font-medium mb-1">Nomor telepon <span className="text-red-500 ml-1">*</span></label>
                <input type="text" id="uPhone" name="uPhone" placeholder="Nomor telepon" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondaryColor" value={form.uPhone} onChange={handleChange} required />
              </div>
            </div>

            <div>
              <label htmlFor="uAddress" className="block text-gray-700 text-sm font-medium mb-1">Alamat pengiriman <span className="text-red-500 ml-1">*</span></label>
              <input type="text" id="uAddress" name="uAddress" placeholder="Alamat" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondaryColor" value={form.uAddress} onChange={handleChange} required />
            </div>

            <div>
              <label htmlFor="uPassword" className="block text-gray-700 text-sm font-medium mb-1">Password <span className="text-red-500 ml-1">*</span></label>
              <input type="password" id="uPassword" name="uPassword" placeholder="Password" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondaryColor" value={form.uPassword} onChange={handleChange} required />
            </div>

            <button type="submit" className="w-full bg-primaryColor text-white py-3 rounded-md font-semibold hover:bg-[#2a5560] transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled={loading || !!cooldownText}>
              {loading ? 'Loading...' : cooldownText ? 'Coba lagi nanti...' : 'Sign up'}
            </button>
            {(error || cooldownText) && <div className="text-red-500 text-sm text-center mt-2">{error || cooldownText}</div>}
          </form>
        </div>
      </div>
    </div>
    </>
  );
};

export default SignUp;
