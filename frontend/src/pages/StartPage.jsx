import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../store/useStore';
import toast from 'react-hot-toast';

// Lightweight Particle Component for Code Pop Effect
const CodeParticles = () => {
  const [particles, setParticles] = useState([]);
  const lastSpawnTime = useRef(0);
  
  const handleInteraction = useCallback((e) => {
    // Throttle to 100ms
    const now = Date.now();
    if (now - lastSpawnTime.current < 100) return;
    lastSpawnTime.current = now;

    // Respect prefers-reduced-motion
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
      color: Math.random() > 0.5 ? '#F72585' : '#7B61FF' // brand-pink or brand-purple
    };

    setParticles(prev => [...prev, newParticle]);

    // Remove particle after 1 second
    setTimeout(() => {
      setParticles(prev => prev.filter(p => p.id !== newParticle.id));
    }, 1000);
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
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      <AnimatePresence>
        {particles.map(p => (
          <motion.div
            key={p.id}
            initial={{ opacity: 1, x: p.x - 20, y: p.y - 20, scale: 0.5 }}
            animate={{ opacity: 0, y: p.y - 100, scale: 1.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="absolute font-mono text-sm font-bold shadow-sm"
            style={{ color: p.color, textShadow: `0 0 8px ${p.color}` }}
          >
            {p.symbol}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default function StartPage() {
  const [loginMode, setLoginMode] = useState('candidate'); // 'candidate' or 'admin'
  const [rollNo, setRollNo] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [typewriterText, setTypewriterText] = useState('');
  const fullText = "<Login success={true} />";
  
  const navigate = useNavigate();
  const setCandidate = useStore(state => state.setCandidate);
  const candidate = useStore(state => state.candidate);
  const setIsAdminAuthenticated = useStore(state => state.setIsAdminAuthenticated);
  const isAdminAuthenticated = useStore(state => state.isAdminAuthenticated);

  // Typewriter effect logic
  useEffect(() => {
    let i = 0;
    const intervalId = setInterval(() => {
      setTypewriterText(fullText.substring(0, i));
      i++;
      if (i > fullText.length + 5) { // Add pause at the end
        i = 0; // loop
        setTypewriterText('');
      }
    }, 150);
    return () => clearInterval(intervalId);
  }, []);

  // If already started and not submitted, redirect
  useEffect(() => {
    if (loginMode === 'candidate' && candidate && !useStore.getState().isSubmitted) {
      navigate('/assessment');
    }
    if (loginMode === 'admin' && isAdminAuthenticated) {
      navigate('/admin');
    }
  }, [candidate, isAdminAuthenticated, loginMode, navigate]);

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

    setCandidate({ rollNo: rollNo.toUpperCase(), name });
    navigate('/assessment');
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
        setIsAdminAuthenticated(true);
        navigate('/admin');
      } else {
        setError('Invalid password');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  return (
    <div className="min-h-screen bg-animate-gradient flex overflow-hidden relative font-sans">
      <CodeParticles />

      {/* Split Layout Container */}
      <div className="w-full h-screen flex flex-col lg:flex-row relative z-10">
        
        {/* Left Side: Image Panel (Hidden on mobile) */}
        <div className="hidden lg:flex flex-1 relative items-center justify-center p-12 overflow-hidden bg-brand-bg1/40 backdrop-blur-sm border-r border-brand-pink/20">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand-purple/20 via-transparent to-transparent opacity-60"></div>
          
          <motion.div 
            className="relative w-full max-w-2xl aspect-video rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(123,97,255,0.3)] border border-brand-purple/30 animate-float"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
          >
            <img 
              src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070&auto=format&fit=crop" 
              alt="Coding on laptop at night" 
              className="w-full h-full object-cover opacity-80"
              loading="lazy"
            />
            {/* Overlay Gradient for blending */}
            <div className="absolute inset-0 bg-gradient-to-t from-brand-bg1/90 via-transparent to-transparent"></div>
            
            {/* Typewriter Text Overlay */}
            <div className="absolute bottom-8 left-8">
              <div className="font-mono text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-pink to-brand-purple drop-shadow-md">
                {typewriterText}<span className="animate-pulse text-brand-pink">_</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Side: Login Form Panel */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="bg-brand-bg1/70 backdrop-blur-xl border border-brand-pink/30 hover:border-brand-pink/60 hover:shadow-[0_0_30px_rgba(247,37,133,0.2)] transition-all p-8 md:p-10 rounded-3xl shadow-2xl w-full max-w-md relative z-10"
          >
            <div className="text-center mb-8">
              <motion.h1 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand-pink to-brand-purple mb-2"
              >
                DAA Assessment
              </motion.h1>
              <p className="text-brand-purple/80 font-medium">Design & Analysis of Algorithms</p>
            </div>

            {/* Mode Toggle Tabs */}
            <div className="flex bg-brand-bg2/50 rounded-xl p-1.5 mb-8 border border-brand-pink/20 shadow-inner">
              <button 
                className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${loginMode === 'candidate' ? 'bg-gradient-to-r from-brand-pink to-brand-purple text-white shadow-[0_0_15px_rgba(247,37,133,0.4)]' : 'text-slate-400 hover:text-white hover:bg-brand-bg2/80'}`}
                onClick={() => { setLoginMode('candidate'); setError(''); }}
              >
                Candidate
              </button>
              <button 
                className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${loginMode === 'admin' ? 'bg-gradient-to-r from-brand-pink to-brand-purple text-white shadow-[0_0_15px_rgba(247,37,133,0.4)]' : 'text-slate-400 hover:text-white hover:bg-brand-bg2/80'}`}
                onClick={() => { setLoginMode('admin'); setError(''); }}
              >
                Admin
              </button>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={loginMode}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {loginMode === 'candidate' ? (
                  <form onSubmit={handleStart} className="space-y-6">
                    <div className="group">
                      <label className="block text-sm font-semibold text-slate-300 mb-2 group-focus-within:text-brand-pink transition-colors">Roll No</label>
                      <input 
                        type="text" 
                        placeholder="2024-CSBS-108"
                        className="w-full px-5 py-4 rounded-xl bg-brand-bg2/40 border border-brand-pink/20 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-pink focus:border-transparent transition-all shadow-inner"
                        value={rollNo}
                        onChange={(e) => {
                          setRollNo(e.target.value);
                          setError('');
                        }}
                      />
                    </div>
                    
                    <div className="group">
                      <label className="block text-sm font-semibold text-slate-300 mb-2 group-focus-within:text-brand-purple transition-colors">Student Name</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Asmita"
                        className="w-full px-5 py-4 rounded-xl bg-brand-bg2/40 border border-brand-pink/20 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent transition-all shadow-inner"
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          setError('');
                        }}
                      />
                    </div>

                    {error && (
                      <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-brand-coral text-sm font-medium"
                      >
                        {error}
                      </motion.p>
                    )}

                    <motion.button 
                      type="submit"
                      disabled={!rollNo || !name}
                      whileHover={{ scale: (!rollNo || !name) ? 1 : 1.02 }}
                      whileTap={{ scale: (!rollNo || !name) ? 1 : 0.98 }}
                      className="w-full py-4 px-4 bg-gradient-to-r from-brand-pink to-brand-purple hover:shadow-[0_0_25px_rgba(247,37,133,0.6)] text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                    >
                      Start Assessment
                    </motion.button>
                  </form>
                ) : (
                  <form onSubmit={handleAdminLogin} className="space-y-6">
                    <div className="group">
                      <label className="block text-sm font-semibold text-slate-300 mb-2 group-focus-within:text-brand-pink transition-colors">Admin Password</label>
                      <input 
                        type="password" 
                        placeholder="••••••••"
                        className="w-full px-5 py-4 rounded-xl bg-brand-bg2/40 border border-brand-pink/20 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-pink focus:border-transparent transition-all shadow-inner"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setError('');
                        }}
                      />
                    </div>

                    {error && (
                      <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-brand-coral text-sm font-medium"
                      >
                        {error}
                      </motion.p>
                    )}

                    <motion.button 
                      type="submit"
                      disabled={!password}
                      whileHover={{ scale: !password ? 1 : 1.02 }}
                      whileTap={{ scale: !password ? 1 : 0.98 }}
                      className="w-full py-4 px-4 bg-gradient-to-r from-brand-pink to-brand-purple hover:shadow-[0_0_25px_rgba(247,37,133,0.6)] text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                    >
                      Login to Dashboard
                    </motion.button>
                  </form>
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
