import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Eye, EyeOff, Phone, Mail, User, Shield,
  CheckCircle, AlertCircle, ChevronRight, Loader2
} from 'lucide-react';

/* ── Helpers ─────────────────────────────────────────────── */
const generateUID = () => 'usr_' + Math.random().toString(36).substr(2, 9);

const avatarFromName = (name) =>
  `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}&backgroundColor=6366f1,8b5cf6,06b6d4&backgroundType=gradientLinear`;

/* Google logo SVG */
const GoogleLogo = () => (
  <svg width="20" height="20" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
    <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
    <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
    <path fill="#FBBC05" d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71 0-.593.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z"/>
    <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"/>
  </svg>
);

/* Input component */
const Input = ({ label, icon: Icon, type = 'text', value, onChange, placeholder, error, right }) => (
  <div className="space-y-1.5">
    {label && <label className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold">{label}</label>}
    <div className={`relative flex items-center bg-white/[0.04] border rounded-xl px-4 py-3 transition-colors ${
      error ? 'border-rose-500/50' : 'border-white/8 focus-within:border-indigo-500/50'
    }`}>
      {Icon && <Icon className="w-4 h-4 text-neutral-500 flex-shrink-0 mr-3" />}
      <input
        type={type} value={value} onChange={onChange} placeholder={placeholder}
        className="flex-grow bg-transparent text-sm text-white placeholder-neutral-600 focus:outline-none"
      />
      {right}
    </div>
    {error && <p className="text-xs text-rose-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{error}</p>}
  </div>
);

/* ── Shared layout (defined outside to prevent unmounting and input focus loss) ── */
const Card = ({ children, className = '' }) => (
  <div className={`bg-[#111111] border border-white/8 rounded-3xl shadow-2xl ${className}`}>
    {children}
  </div>
);

const BackBtn = ({ onClick }) => (
  <button onClick={onClick}
    className="inline-flex items-center space-x-1.5 text-xs text-neutral-400 hover:text-white transition-colors mb-6 group">
    <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
    <span>Back</span>
  </button>
);

const Divider = ({ label = 'or' }) => (
  <div className="flex items-center gap-3 my-1">
    <div className="flex-grow h-px bg-white/8" />
    <span className="text-[11px] text-neutral-600 font-medium">{label}</span>
    <div className="flex-grow h-px bg-white/8" />
  </div>
);

const PrimaryBtn = ({ children, onClick, type = 'button', disabled, loading }) => (
  <button type={type} onClick={onClick} disabled={disabled || loading}
    className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs uppercase tracking-widest rounded-full transition-all shadow-[0_0_20px_rgba(99,102,241,0.25)] flex items-center justify-center gap-2">
    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : children}
  </button>
);

/* ── Fake Google account picker ──────────────────────────── */
const GOOGLE_ACCOUNTS = [
  { name: 'Rahul Sharma (Player)', email: 'rahul.sharma@gmail.com', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Rahul', role: 'player' },
  { name: 'Priya Sharma (Venue Owner)', email: 'priya.sharma@gmail.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya', role: 'owner' },
];

/* ════════════════════════════════════════════════════════════
   MAIN AUTH COMPONENT
   ════════════════════════════════════════════════════════════ */
export default function Auth({ onLogin }) {
  const [step, setStep] = useState('main');
  // main | google-pick | phone-otp | email-form

  /* Phone state */
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpName, setOtpName] = useState('');
  const [countdown, setCountdown] = useState(0);
  const otpRefs = useRef([]);

  /* Email state */
  const [isSignUp, setIsSignUp] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [signUpRole, setSignUpRole] = useState('player');
  const [otpRole, setOtpRole] = useState('player');

  /* UI state */
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  /* Countdown timer */
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  /* ── Handlers ─────────────────────────────────────────── */
  const finishLogin = (userData) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLogin(userData);
    }, 800);
  };

  /* Google */
  const handleGoogleSelect = (account) => {
    finishLogin({
      uid: generateUID(),
      name: account.name,
      email: account.email,
      avatar: account.avatar,
      role: account.role,
      authMethod: 'google',
      joinedAt: new Date().toISOString(),
    });
  };

  /* Phone: send OTP */
  const handleSendOTP = () => {
    const errs = {};
    if (!phone || phone.replace(/\D/g, '').length < 10) errs.phone = 'Enter a valid 10-digit number';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('phone-otp');
      setCountdown(60);
    }, 1000);
  };

  /* Phone: verify OTP */
  const handleVerifyOTP = () => {
    const entered = otp.join('');
    if (entered.length < 6) { setErrors({ otp: 'Enter all 6 digits' }); return; }
    if (entered !== '123456') { setErrors({ otp: 'Invalid OTP. Use 123456 for demo.' }); return; }
    setErrors({});
    finishLogin({
      uid: generateUID(),
      name: otpName.trim() || `User${phone.slice(-4)}`,
      phone: `+91 ${phone}`,
      role: otpRole,
      avatar: avatarFromName(otpName || phone),
      authMethod: 'phone',
      joinedAt: new Date().toISOString(),
    });
  };

  /* OTP box typing */
  const handleOTPBox = (i, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[i] = val;
    setOtp(next);
    if (val && i < 5) otpRefs.current[i + 1]?.focus();
    if (!val && i > 0) otpRefs.current[i - 1]?.focus();
  };

  const handleOTPKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus();
  };

  /* Email */
  const handleEmailAuth = (e) => {
    e.preventDefault();
    const errs = {};
    if (isSignUp && !name.trim()) errs.name = 'Enter your full name';
    if (!email.includes('@')) errs.email = 'Enter a valid email';
    if (password.length < 6) errs.password = 'Minimum 6 characters';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    // Determine role heuristically for sign-in or from toggle for sign-up
    const determinedRole = isSignUp ? signUpRole : (email.toLowerCase().includes('owner') ? 'owner' : 'player');

    finishLogin({
      uid: generateUID(),
      name: name.trim() || email.split('@')[0],
      email,
      role: determinedRole,
      avatar: avatarFromName(name || email),
      authMethod: 'email',
      joinedAt: new Date().toISOString(),
    });
  };



  return (
    <div className="min-h-screen bg-[#080808] flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">

      {/* Ambient blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-indigo-600/6 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-violet-600/6 rounded-full blur-[100px]" />
        <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] bg-teal-500/4 rounded-full blur-[80px]" />
      </div>

      <div className="relative z-10 w-full max-w-[440px]">
        {/* Brand */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center space-x-3 mb-8">
          <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-display font-black text-xl shadow-[0_0_24px_rgba(99,102,241,0.5)]">T</div>
          <span className="font-display font-black text-2xl text-white tracking-widest">TURFINGTON</span>
        </motion.div>

        <AnimatePresence mode="wait">
          {step === 'main' ? (
            <motion.div key="main" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <Card className="p-7 space-y-5">
                <div className="text-center">
                  <h2 className="font-display font-black text-2xl text-white tracking-tight">Welcome Back</h2>
                  <p className="text-neutral-400 text-xs mt-1.5 font-light">Sign in to join sessions, book venues and connect with players</p>
                </div>

                {/* Google */}
                <button onClick={() => setStep('google-pick')}
                  className="w-full flex items-center justify-center gap-3 py-3.5 bg-white hover:bg-neutral-100 text-gray-800 font-bold text-sm rounded-full transition-all shadow-lg">
                  <GoogleLogo />
                  <span>Continue with Google</span>
                </button>

                <Divider />

                {/* Phone */}
                <div className="space-y-3">
                  <Input
                    key="input-phone"
                    label="Mobile Number"
                    icon={Phone}
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="Enter 10-digit number"
                    error={errors.phone}
                    right={
                      <span className="text-xs font-bold text-neutral-500 flex-shrink-0 ml-2 flex items-center gap-1">
                        <span className="text-base leading-none">🇮🇳</span>
                        <span>+91</span>
                      </span>
                    }
                  />
                  <PrimaryBtn onClick={handleSendOTP} loading={loading}>
                    Send OTP <ChevronRight className="w-4 h-4" />
                  </PrimaryBtn>
                </div>

                <Divider label="or use email" />

                {/* Email toggle */}
                <button onClick={() => setStep('email-form')}
                  className="w-full flex items-center justify-center gap-2 py-3.5 border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] text-neutral-300 font-bold text-xs uppercase tracking-widest rounded-full transition-all">
                  <Mail className="w-4 h-4" />
                  <span>Sign in with Email</span>
                </button>

                <p className="text-[10px] text-neutral-700 text-center font-light pt-1">
                  By continuing you agree to our Terms of Service and Privacy Policy
                </p>
              </Card>
            </motion.div>
          ) : step === 'google-pick' ? (
            <motion.div key="google" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <BackBtn onClick={() => setStep('main')} />
              <Card className="p-7">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <GoogleLogo />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-white text-base">Choose an account</h3>
                    <p className="text-[10px] text-neutral-500 mt-0.5">to continue to Turfington</p>
                  </div>
                </div>

                <div className="space-y-2 mb-5">
                  {GOOGLE_ACCOUNTS.map(acc => (
                    <button key={acc.email} onClick={() => handleGoogleSelect(acc)}
                      className="w-full flex items-center gap-4 p-3.5 rounded-2xl border border-white/5 hover:bg-white/[0.04] hover:border-white/15 transition-all group text-left">
                      <img src={acc.avatar} alt={acc.name} className="w-11 h-11 rounded-full object-cover border-2 border-white/10 flex-shrink-0" />
                      <div className="flex-grow">
                        <p className="font-bold text-white text-sm">{acc.name}</p>
                        <p className="text-[11px] text-neutral-500 mt-0.5">{acc.email}</p>
                      </div>
                      {loading
                        ? <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
                        : <ChevronRight className="w-4 h-4 text-neutral-600 group-hover:text-white transition-colors" />}
                    </button>
                  ))}

                  {/* Use another account */}
                  <button onClick={() => { setIsSignUp(false); setStep('email-form'); }}
                    className="w-full flex items-center gap-4 p-3.5 rounded-2xl border border-dashed border-white/8 hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all text-left">
                    <div className="w-11 h-11 rounded-full border-2 border-dashed border-white/15 flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-neutral-500" />
                    </div>
                    <span className="text-sm font-medium text-neutral-400">Use another account</span>
                  </button>
                </div>

                <p className="text-[10px] text-neutral-700 text-center">
                  Google account data is securely used only to sign you in
                </p>
              </Card>
            </motion.div>
          ) : step === 'phone-otp' ? (
            <motion.div key="otp" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <BackBtn onClick={() => { setStep('main'); setOtp(['','','','','','']); setErrors({}); }} />
              <Card className="p-7 space-y-6">
                <div className="text-center">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-600/15 border border-indigo-500/20 flex items-center justify-center mx-auto mb-4">
                    <Phone className="w-6 h-6 text-indigo-400" />
                  </div>
                  <h3 className="font-display font-bold text-white text-lg">Enter OTP</h3>
                  <p className="text-xs text-neutral-400 mt-1 font-light">
                    We sent a 6-digit code to <span className="text-white font-semibold">+91 {phone}</span>
                  </p>
                  <p className="text-[11px] text-indigo-400 mt-1">Demo OTP: <strong>123456</strong></p>
                </div>

                {/* OTP boxes */}
                <div className="flex justify-center gap-2">
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={el => otpRefs.current[i] = el}
                      type="text"
                      inputMode="numeric"
                      value={digit}
                      maxLength={1}
                      onChange={e => handleOTPBox(i, e.target.value)}
                      onKeyDown={e => handleOTPKeyDown(i, e)}
                      className={`w-12 h-14 text-center text-xl font-black rounded-xl border bg-white/[0.04] text-white transition-all focus:outline-none ${
                        digit ? 'border-indigo-500 bg-indigo-600/10' : 'border-white/10 focus:border-indigo-500/60'
                      }`}
                    />
                  ))}
                </div>
                {errors.otp && <p className="text-xs text-rose-400 text-center flex items-center justify-center gap-1"><AlertCircle className="w-3 h-3" />{errors.otp}</p>}

                {/* Optional name */}
                <Input key="input-otpname" icon={User} placeholder="Your name (optional)"
                  value={otpName} onChange={e => setOtpName(e.target.value)} />

                {/* Phone OTP Role selector */}
                <div className="space-y-2 text-left">
                  <label className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold">Select Role</label>
                  <div className="flex bg-white/[0.02] border border-white/8 rounded-xl p-1">
                    <button 
                      type="button"
                      onClick={() => setOtpRole('player')}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                        otpRole === 'player' ? 'bg-indigo-600 text-white shadow-md' : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      🏃 Player
                    </button>
                    <button 
                      type="button"
                      onClick={() => setOtpRole('owner')}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                        otpRole === 'owner' ? 'bg-violet-600 text-white shadow-md' : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      🏟️ Venue Owner
                    </button>
                  </div>
                </div>

                <PrimaryBtn onClick={handleVerifyOTP} loading={loading}>
                  Verify & Continue <ChevronRight className="w-4 h-4" />
                </PrimaryBtn>

                {/* Resend */}
                <div className="text-center">
                  {countdown > 0 ? (
                    <p className="text-xs text-neutral-500">
                      Resend code in <span className="font-bold text-white">{countdown}s</span>
                    </p>
                  ) : (
                    <button onClick={() => { setCountdown(60); setOtp(['','','','','','']); }}
                      className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
                      Resend OTP
                    </button>
                  )}
                </div>
              </Card>
            </motion.div>
          ) : step === 'email-form' ? (
            <motion.div key="email" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <BackBtn onClick={() => { setStep('main'); setErrors({}); }} />
              <Card className="p-7">
                {/* Tab: Sign In / Create Account */}
                <div className="flex bg-white/[0.04] rounded-full p-1 mb-6">
                  {['Sign Up', 'Sign In'].map(t => (
                    <button key={t} onClick={() => { setIsSignUp(t === 'Sign Up'); setErrors({}); }}
                      className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-full transition-all ${
                        (t === 'Sign Up') === isSignUp ? 'bg-indigo-600 text-white shadow-md' : 'text-neutral-400 hover:text-white'
                      }`}>
                      {t}
                    </button>
                  ))}
                </div>

                <form onSubmit={handleEmailAuth} className="space-y-4">
                  {isSignUp && (
                    <>
                      <Input key="input-name" label="Full Name" icon={User} value={name}
                        onChange={e => setName(e.target.value)} placeholder="e.g. Rahul Sharma" error={errors.name} />
                      
                      <div className="space-y-2 text-left">
                        <label className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold">Register As</label>
                        <div className="flex bg-white/[0.02] border border-white/8 rounded-xl p-1">
                          <button 
                            type="button"
                            onClick={() => setSignUpRole('player')}
                            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                              signUpRole === 'player' ? 'bg-indigo-600 text-white shadow-md' : 'text-neutral-400 hover:text-white'
                            }`}
                          >
                            🏃 Player
                          </button>
                          <button 
                            type="button"
                            onClick={() => setSignUpRole('owner')}
                            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                              signUpRole === 'owner' ? 'bg-violet-600 text-white shadow-md' : 'text-neutral-400 hover:text-white'
                            }`}
                          >
                            🏟️ Venue Owner
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                  <Input key="input-email" label="Email Address" icon={Mail} type="email" value={email}
                    onChange={e => setEmail(e.target.value)} placeholder="name@example.com" error={errors.email} />
                  <Input key="input-password" label="Password" icon={Shield} type={showPwd ? 'text' : 'password'}
                    value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters" error={errors.password}
                    right={
                      <button type="button" onClick={() => setShowPwd(!showPwd)}
                        className="text-neutral-500 hover:text-white transition-colors ml-2 flex-shrink-0">
                        {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    }
                  />
                  <PrimaryBtn type="submit" loading={loading}>
                    {isSignUp ? 'Create Account' : 'Sign In'} <ChevronRight className="w-4 h-4" />
                  </PrimaryBtn>
                </form>

                <Divider />

                <button onClick={() => setStep('google-pick')}
                  className="w-full flex items-center justify-center gap-3 py-3 bg-white hover:bg-neutral-100 text-gray-800 font-bold text-xs rounded-full transition-all shadow">
                  <GoogleLogo />
                  <span>Continue with Google instead</span>
                </button>
              </Card>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Footer */}
        <p className="text-center text-[10px] text-neutral-700 mt-6 font-light">
          Turfington © 2026 · Made in India 🇮🇳
        </p>
      </div>
    </div>
  );
}
