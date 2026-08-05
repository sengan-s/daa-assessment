import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../store/useStore';
import { CheckCircle } from 'lucide-react';

// Lightweight Particle Component
const CodeParticles = () => {
  const [particles, setParticles] = useState([]);
  const lastSpawnTime = useRef(0);
  
  const handleInteraction = useCallback((e) => {
    const now = Date.now();
    if (now - lastSpawnTime.current < 100) return;
    lastSpawnTime.current = now;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    let clientX, clientY;
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const symbols = ['</>', '{ }', 'const', '0101', '<div>', '];', '=>', '||', '&&', '!='];
    const symbol = symbols[Math.floor(Math.random() * symbols.length)];
    
    const newParticle = {
      id: now + Math.random(),
      x: clientX,
      y: clientY,
      symbol,
      color: Math.random() > 0.5 ? '#F72585' : '#7B61FF'
    };

    setParticles(prev => [...prev, newParticle]);

    setTimeout(() => {
      setParticles(prev => prev.filter(p => p.id !== newParticle.id));
    }, 1500);
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleInteraction);
    window.addEventListener('touchstart', handleInteraction);
    return () => {
      window.removeEventListener('mousemove', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
    };
  }, [handleInteraction]);

  return (
    <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden">
      <AnimatePresence>
        {particles.map(p => (
          <motion.div
            key={p.id}
            initial={{ opacity: 1, x: p.x - 30, y: p.y - 30, scale: 1 }}
            animate={{ opacity: 0, y: p.y - 150, scale: 3.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.8, ease: 'easeOut' }}
            className="absolute font-mono text-3xl font-bold opacity-60 shadow-md"
            style={{ color: p.color, textShadow: `0 0 15px ${p.color}` }}
          >
            {p.symbol}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default function StartPage() {
  const [loginMode, setLoginMode] = useState('candidate');
  const [rollNo, setRollNo] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [typewriterText, setTypewriterText] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  
  const fullText = "<Login success={true} />";
  
  const navigate = useNavigate();
  const setCandidate = useStore(state => state.setCandidate);
  const candidate = useStore(state => state.candidate);
  const setIsAdminAuthenticated = useStore(state => state.setIsAdminAuthenticated);
  const isAdminAuthenticated = useStore(state => state.isAdminAuthenticated);

  useEffect(() => {
    let i = 0;
    const intervalId = setInterval(() => {
      setTypewriterText(fullText.substring(0, i));
      i++;
      if (i > fullText.length + 8) { 
        i = 0; 
        setTypewriterText('');
      }
    }, 150);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (loginMode === 'candidate' && candidate && !useStore.getState().isSubmitted && !isSuccess) {
      navigate('/assessment');
    }
    if (loginMode === 'admin' && isAdminAuthenticated && !isSuccess) {
      navigate('/admin');
    }
  }, [candidate, isAdminAuthenticated, loginMode, navigate, isSuccess]);

  const validateRollNo = (roll) => {
    const regex = /^\d{4}-[A-Z]+-\d{3}$/i;
    return regex.test(roll);
  };

  const handleStart = (e) => {
    e.preventDefault();
    if (!validateRollNo(rollNo)) {
      setError('Invalid Roll No format. Use YYYY-DEPT-NNN (e.g. 2024-CSBS-108)');
      return;
    }
    if (name.trim().length < 2) {
      setError('Please enter a valid name.');
      return;
    }

    setIsSuccess(true);
    setTimeout(() => {
      setCandidate({ rollNo: rollNo.toUpperCase(), name });
      navigate('/assessment');
    }, 1200);
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const data = await res.json();
      if (data.success) {
        setIsSuccess(true);
        setTimeout(() => {
          setIsAdminAuthenticated(true);
          navigate('/admin');
        }, 1200);
      } else {
        setError('Invalid password');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center font-sans overflow-hidden bg-brand-bg1">
      {/* 1. Background Image with Ken Burns */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div 
          className="w-full h-full animate-ken-burns bg-cover bg-center opacity-60"
          style={{ backgroundImage: 'url("https://media.giphy.com/media/L8K62iTDkzGX6/giphy.gif")' }}
        ></div>
      </div>

      {/* 2. Animated Gradient Overlay + Vignette */}
      <div className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-80 bg-animate-gradient z-10"></div>
      <div className="absolute inset-0 pointer-events-none vignette-overlay z-20"></div>

      <CodeParticles />

      {/* Typewriter Text Overlay */}
      <div className="absolute bottom-6 left-6 md:bottom-8 md:left-8 pointer-events-none z-30">
        <div className="font-mono text-sm md:text-lg font-medium text-white/40 drop-shadow-md">
          {typewriterText}<span className="animate-pulse text-brand-pink/60">_</span>
        </div>
      </div>

      {/* Login Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-[28rem] mx-4 p-8 md:p-10 bg-[#0a0e2a]/60 backdrop-blur-2xl rounded-[2rem] border border-brand-pink/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative z-40"
      >
        <AnimatePresence mode="wait">
          {!isSuccess ? (
            <motion.div 
              key="form"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-center mb-8">
                <motion.h1 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.5 }}
                  className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand-pink via-brand-purple to-brand-pink bg-[length:200%_auto] animate-shimmer mb-2 tracking-tight"
                >
                  DAA Assessment
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="text-slate-300/80 font-medium text-sm md:text-base"
                >
                  Design & Analysis of Algorithms
                </motion.p>
              </div>

              {/* Sliding Pill Toggle */}
              <div className="relative flex bg-[#1a1f4b]/60 rounded-2xl p-1.5 mb-8 border border-white/5 shadow-inner">
                {['candidate', 'admin'].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => { setLoginMode(mode); setError(''); }}
                    className={`relative flex-1 py-3 text-sm font-bold rounded-xl transition-colors z-10 ${loginMode === mode ? 'text-white' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    {loginMode === mode && (
                      <motion.div
                        layoutId="activePill"
                        className="absolute inset-0 bg-gradient-to-r from-brand-pink to-brand-purple rounded-xl shadow-[0_4px_15px_rgba(247,37,133,0.3)]"
                        initial={false}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        style={{ zIndex: -1 }}
                      />
                    )}
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                <motion.form
                  key={loginMode}
                  onSubmit={loginMode === 'candidate' ? handleStart : handleAdminLogin}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-5"
                >
                  {loginMode === 'candidate' ? (
                    <>
                      <div className="relative group">
                        <input 
                          type="text"
                          id="rollNo"
                          placeholder=" "
                          className="peer w-full px-5 pt-6 pb-2 rounded-xl bg-[#1a1f4b]/40 border border-white/10 text-white focus:outline-none focus:border-transparent transition-all shadow-inner hover:bg-[#1a1f4b]/60"
                          value={rollNo}
                          onChange={(e) => { setRollNo(e.target.value); setError(''); }}
                        />
                        <label 
                          htmlFor="rollNo"
                          className="absolute left-5 top-4 text-slate-400 text-sm font-medium transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:top-2 peer-focus:text-xs peer-focus:text-brand-pink cursor-text"
                        >
                          Roll No (e.g. 2024-CSBS-108)
                        </label>
                        <div className="absolute inset-0 rounded-xl border border-brand-pink opacity-0 peer-focus:opacity-100 peer-focus:shadow-[0_0_15px_rgba(247,37,133,0.4)] transition-all pointer-events-none scale-100 peer-focus:scale-[1.01]"></div>
                      </div>
                      
                      <div className="relative group">
                        <input 
                          type="text"
                          id="name"
                          placeholder=" "
                          className="peer w-full px-5 pt-6 pb-2 rounded-xl bg-[#1a1f4b]/40 border border-white/10 text-white focus:outline-none focus:border-transparent transition-all shadow-inner hover:bg-[#1a1f4b]/60"
                          value={name}
                          onChange={(e) => { setName(e.target.value); setError(''); }}
                        />
                        <label 
                          htmlFor="name"
                          className="absolute left-5 top-4 text-slate-400 text-sm font-medium transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:top-2 peer-focus:text-xs peer-focus:text-brand-purple cursor-text"
                        >
                          Student Name
                        </label>
                        <div className="absolute inset-0 rounded-xl border border-brand-purple opacity-0 peer-focus:opacity-100 peer-focus:shadow-[0_0_15px_rgba(123,97,255,0.4)] transition-all pointer-events-none scale-100 peer-focus:scale-[1.01]"></div>
                      </div>
                    </>
                  ) : (
                    <div className="relative group">
                      <input 
                        type="password"
                        id="password"
                        placeholder=" "
                        className="peer w-full px-5 pt-6 pb-2 rounded-xl bg-[#1a1f4b]/40 border border-white/10 text-white focus:outline-none focus:border-transparent transition-all shadow-inner hover:bg-[#1a1f4b]/60"
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setError(''); }}
                      />
                      <label 
                        htmlFor="password"
                        className="absolute left-5 top-4 text-slate-400 text-sm font-medium transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:top-2 peer-focus:text-xs peer-focus:text-brand-pink cursor-text"
                      >
                        Admin Password
                      </label>
                      <div className="absolute inset-0 rounded-xl border border-brand-pink opacity-0 peer-focus:opacity-100 peer-focus:shadow-[0_0_15px_rgba(247,37,133,0.4)] transition-all pointer-events-none scale-100 peer-focus:scale-[1.01]"></div>
                    </div>
                  )}

                  {error && (
                    <motion.p 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="text-brand-coral text-sm font-medium pl-1"
                    >
                      {error}
                    </motion.p>
                  )}

                  <motion.button 
                    type="submit"
                    disabled={loginMode === 'candidate' ? (!rollNo || !name) : !password}
                    whileHover={{ scale: 1.02, filter: 'brightness(1.1)' }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full py-4 px-4 bg-gradient-to-r from-brand-pink to-brand-purple text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2 overflow-hidden relative group shadow-[0_4px_15px_rgba(0,0,0,0.2)] hover:shadow-[0_0_25px_rgba(247,37,133,0.5)]"
                  >
                    <span className="relative z-10 drop-shadow-md">{loginMode === 'candidate' ? 'Start Assessment' : 'Login to Dashboard'}</span>
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out z-0"></div>
                  </motion.button>
                </motion.form>
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-10"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.1 }}
              >
                <CheckCircle className="w-24 h-24 text-green-400 mb-6 drop-shadow-[0_0_20px_rgba(74,222,128,0.4)]" />
              </motion.div>
              <motion.h2 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-3xl font-bold text-white mb-2"
              >
                {loginMode === 'candidate' ? 'Welcome, ' + name : 'Welcome, Admin'}
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-slate-400"
              >
                {loginMode === 'candidate' ? 'Preparing your assessment environment...' : 'Loading dashboard...'}
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
