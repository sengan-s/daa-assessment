import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import { motion } from 'framer-motion';
import { Trophy, LogOut, CheckCircle, ShieldAlert, Award } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ResultsPage() {
  const navigate = useNavigate();
  const candidate = useStore(state => state.candidate);
  const score = useStore(state => state.score);
  const marks = useStore(state => state.marks);
  const clearCandidate = useStore(state => state.clearCandidate);
  const warnings = useStore(state => state.warnings);
  const timeLeft = useStore(state => state.timeLeft);
  
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    if (!candidate || score === null) {
      navigate('/');
    } else {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 }
      });

      // Animate score from 0 to final score
      let start = 0;
      const duration = 2000;
      const stepTime = Math.abs(Math.floor(duration / score));
      
      const timer = setInterval(() => {
        start += 1;
        setDisplayScore(start);
        if (start >= score) {
          clearInterval(timer);
          setDisplayScore(score);
        }
      }, score > 0 ? stepTime : duration);

      return () => clearInterval(timer);
    }
  }, [candidate, score, navigate]);

  const handleExit = () => {
    clearCandidate();
    localStorage.removeItem('daa-assessment-storage');
    // Replace history to prevent back navigation
    navigate('/', { replace: true });
  };

  if (!candidate || score === null) return null;

  return (
    <div className="min-h-screen bg-animate-gradient flex items-center justify-center p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-brand-bg1/70 backdrop-blur-xl rounded-2xl shadow-[0_0_30px_rgba(247,37,133,0.15)] p-8 max-w-2xl w-full border border-brand-pink/30 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-pink to-brand-purple" />
        
        <div className="text-center mb-8">
          <Trophy className="w-20 h-20 mx-auto text-yellow-400 mb-4" />
          <h1 className="text-3xl font-bold text-white mb-2">Assessment Completed!</h1>
          <p className="text-slate-400">Thank you for your submission, {candidate.name} ({candidate.rollNo})</p>
        </div>

        <div className="bg-brand-bg2/50 backdrop-blur-md rounded-xl p-6 mb-8 text-center border border-brand-pink/20">
          <p className="text-slate-400 font-semibold mb-2 uppercase tracking-wide">Final Score</p>
          <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-pink to-brand-purple">
            {displayScore} <span className="text-3xl text-slate-500">/ 50</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-brand-bg2/40 p-4 rounded-lg border border-brand-pink/20">
            <div className="text-slate-400 text-sm mb-1">Merge Sorted Array</div>
            <div className="text-xl font-bold text-white">{marks.mergeSort} <span className="text-sm text-slate-500">/ 15</span></div>
          </div>
          <div className="bg-brand-bg2/40 p-4 rounded-lg border border-brand-pink/20">
            <div className="text-slate-400 text-sm mb-1">Binary Search</div>
            <div className="text-xl font-bold text-white">{marks.binarySearch} <span className="text-sm text-slate-500">/ 15</span></div>
          </div>
          <div className="bg-brand-bg2/40 p-4 rounded-lg border border-brand-pink/20">
            <div className="text-slate-400 text-sm mb-1">Matrix Multiplication</div>
            <div className="text-xl font-bold text-white">{marks.matrixMult} <span className="text-sm text-slate-500">/ 20</span></div>
          </div>
        </div>

        {/* Achievements / Badges */}
        <div className="flex justify-center gap-4 mb-8">
          {score === 50 && (
            <div className="flex items-center gap-2 bg-yellow-900/30 text-yellow-500 px-3 py-1.5 rounded-full border border-yellow-700/50 text-sm font-semibold">
              <Award className="w-4 h-4" /> Perfectionist
            </div>
          )}
          {timeLeft > 900 && score > 0 && (
            <div className="flex items-center gap-2 bg-blue-900/30 text-blue-400 px-3 py-1.5 rounded-full border border-blue-700/50 text-sm font-semibold">
              <CheckCircle className="w-4 h-4" /> Speed Solver
            </div>
          )}
          {warnings === 0 && (
            <div className="flex items-center gap-2 bg-green-900/30 text-green-400 px-3 py-1.5 rounded-full border border-green-700/50 text-sm font-semibold">
              <ShieldAlert className="w-4 h-4" /> Clean Record
            </div>
          )}
        </div>

        <button 
          onClick={handleExit}
          className="w-full py-4 bg-gradient-to-r from-brand-pink to-brand-purple hover:shadow-[0_0_20px_rgba(247,37,133,0.5)] text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
        >
          <LogOut className="w-5 h-5" />
          Exit Assessment
        </button>
      </motion.div>
    </div>
  );
}
