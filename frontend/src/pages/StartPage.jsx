import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import useStore from '../store/useStore';
import toast from 'react-hot-toast';

export default function StartPage() {
  const [loginMode, setLoginMode] = useState('candidate'); // 'candidate' or 'admin'
  const [rollNo, setRollNo] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const setCandidate = useStore(state => state.setCandidate);
  const candidate = useStore(state => state.candidate);
  const setIsAdminAuthenticated = useStore(state => state.setIsAdminAuthenticated);
  const isAdminAuthenticated = useStore(state => state.isAdminAuthenticated);

  // If already started and not submitted, might want to redirect to assessment
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
    <div className="min-h-screen bg-gradient-to-br from-brand-bg1 to-brand-bg2 flex items-center justify-center p-4 overflow-hidden relative">
      {/* Floating particles background (simplified with CSS/Framer Motion) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-white/10 rounded-full"
            style={{
              width: Math.random() * 40 + 10,
              height: Math.random() * 40 + 10,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0.1, 0.5, 0.1],
            }}
            transition={{
              duration: Math.random() * 10 + 5,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="bg-brand-bg1/70 backdrop-blur-xl border border-brand-pink/30 hover:border-brand-pink/60 hover:shadow-[0_0_20px_rgba(247,37,133,0.3)] transition-all p-8 rounded-2xl shadow-2xl w-full max-w-md relative z-10"
      >
        <div className="text-center mb-6">
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand-pink to-brand-purple mb-2"
          >
            DAA Assessment
          </motion.h1>
          <p className="text-gray-300">Design & Analysis of Algorithms</p>
        </div>

        {/* Mode Toggle Tabs */}
        <div className="flex bg-white/5 rounded-lg p-1 mb-6 border border-white/10">
          <button 
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${loginMode === 'candidate' ? 'bg-gradient-to-r from-brand-pink to-brand-purple text-white shadow-[0_0_15px_rgba(247,37,133,0.4)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            onClick={() => { setLoginMode('candidate'); setError(''); }}
          >
            Candidate
          </button>
          <button 
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${loginMode === 'admin' ? 'bg-gradient-to-r from-brand-pink to-brand-purple text-white shadow-[0_0_15px_rgba(247,37,133,0.4)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            onClick={() => { setLoginMode('admin'); setError(''); }}
          >
            Admin
          </button>
        </div>

        {loginMode === 'candidate' ? (
          <form onSubmit={handleStart} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Roll No</label>
            <input 
              type="text" 
              placeholder="2024-CSBS-108"
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-pink transition-all"
              value={rollNo}
              onChange={(e) => {
                setRollNo(e.target.value);
                setError('');
              }}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Student Name</label>
            <input 
              type="text" 
              placeholder="e.g. Asmita"
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-pink transition-all"
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
              className="text-red-400 text-sm"
            >
              {error}
            </motion.p>
          )}

          <button 
            type="submit"
            disabled={!rollNo || !name}
            className="w-full py-3 px-4 bg-gradient-to-r from-brand-pink to-brand-purple hover:shadow-[0_0_20px_rgba(247,37,133,0.6)] text-white font-bold rounded-lg transform transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Start Assessment
          </button>
        </form>
        ) : (
        <form onSubmit={handleAdminLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Admin Password</label>
            <input 
              type="password" 
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-pink transition-all"
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
              className="text-red-400 text-sm"
            >
              {error}
            </motion.p>
          )}

          <button 
            type="submit"
            disabled={!password}
            className="w-full py-3 px-4 bg-gradient-to-r from-brand-pink to-brand-purple hover:shadow-[0_0_20px_rgba(247,37,133,0.6)] text-white font-bold rounded-lg transform transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Login to Dashboard
          </button>
        </form>
        )}
      </motion.div>
    </div>
  );
}
