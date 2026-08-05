import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import useStore from '../store/useStore';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import { Play, Send, CheckCircle, XCircle, AlertTriangle, LogOut, Loader2, ChevronRight, ChevronLeft } from 'lucide-react';
import { supabase } from '../supabaseClient';

const PROBLEMS = [
  { id: 'mergeSort', title: 'Merge Sorted Array' },
  { id: 'binarySearch', title: 'Binary Search' },
  { id: 'matrixMult', title: 'Matrix Multiplication' }
];

export default function AssessmentPage() {
  const navigate = useNavigate();
  const candidate = useStore(state => state.candidate);
  const timeLeft = useStore(state => state.timeLeft);
  const setTimeLeft = useStore(state => state.setTimeLeft);
  const warnings = useStore(state => state.warnings);
  const incrementWarning = useStore(state => state.incrementWarning);
  const code = useStore(state => state.code);
  const updateCode = useStore(state => state.updateCode);
  const language = useStore(state => state.language);
  const updateLanguage = useStore(state => state.updateLanguage);
  const isSubmitted = useStore(state => state.isSubmitted);
  const setIsSubmitted = useStore(state => state.setIsSubmitted);
  const setResults = useStore(state => state.setResults);

  const [activeTab, setActiveTab] = useState('mergeSort');
  const [problemDetails, setProblemDetails] = useState({
    mergeSort: { 
      desc: "You are given two sorted arrays. Merge them into one sorted array.",
      samples: "Input:\n4\n1 3 5 7\n3\n2 4 6\n\nOutput:\n1 2 3 4 5 6 7"
    },
    binarySearch: {
      desc: "Given a sorted array and a target, return the index of target, or -1 if not found.",
      samples: "Input: arr=[1,3,5,7,9,11], target=7 → Output: 3"
    },
    matrixMult: {
      desc: "Given matrices A (m x n) and B (n x p), return the product matrix.",
      samples: "Input: A=[[1,2],[3,4]], B=[[5,6],[7,8]] → Output: [[19,22],[43,50]]"
    }
  });
  const [runResults, setRunResults] = useState({});
  const [problemStatus, setProblemStatus] = useState({
    mergeSort: 'unattempted',
    binarySearch: 'unattempted',
    matrixMult: 'unattempted'
  });
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isSubmittingTotal, setIsSubmittingTotal] = useState(false);
  const editorRef = useRef(null);

  useEffect(() => {
    if (!candidate) {
      navigate('/');
    }
    if (isSubmitted) {
      navigate('/results');
    }
  }, [candidate, isSubmitted, navigate]);

  // Timer Logic
  useEffect(() => {
    if (isSubmitted || !candidate) return;
    const timer = setInterval(() => {
      setTimeLeft(timeLeft - 1);
      if (timeLeft <= 1) {
        clearInterval(timer);
        handleFinalSubmit(true); // Auto submit on timeout
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isSubmitted, candidate]);

  // Anti-cheating listeners
  useEffect(() => {
    const handleAntiCheatViolation = (message) => {
      incrementWarning();
      const currentWarnings = useStore.getState().warnings;
      toast.error(`Warning [${currentWarnings}/3]: ${message}`, { duration: 4000 });
      if (currentWarnings >= 3) {
        toast.error('Maximum warnings reached. Auto-submitting...');
        handleFinalSubmit(true);
      }
    };

    const handleCopyPaste = (e) => {
      e.preventDefault();
      handleAntiCheatViolation('Copy-paste is not allowed during this assessment.');
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleAntiCheatViolation('Tab switching is not allowed during this assessment.');
      }
    };

    const blockKeys = (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'v' || e.key === 'x')) {
        handleCopyPaste(e);
      }
    };

    document.addEventListener('copy', handleCopyPaste);
    document.addEventListener('paste', handleCopyPaste);
    document.addEventListener('cut', handleCopyPaste);
    document.addEventListener('keydown', blockKeys);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('copy', handleCopyPaste);
      document.removeEventListener('paste', handleCopyPaste);
      document.removeEventListener('cut', handleCopyPaste);
      document.removeEventListener('keydown', blockKeys);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleEditorChange = (value) => {
    updateCode(activeTab, language[activeTab], value);
  };

  const handleRun = async (isSubmit = false) => {
    setIsEvaluating(true);
    const toastId = toast.loading(isSubmit ? 'Submitting...' : 'Running visible test cases...');
    try {
      const response = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemId: activeTab,
          code: code[language[activeTab]]?.[activeTab] || '',
          language: language[activeTab],
          isSubmit
        })
      });
      const data = await response.json();
      if (data.success) {
        setRunResults(prev => ({
          ...prev,
          [activeTab]: data.results
        }));
        if (data.passedCount === data.totalCount && isSubmit) {
          confetti();
          toast.success('All test cases passed!', { id: toastId });
          setProblemStatus(prev => ({ ...prev, [activeTab]: 'solved' }));
        } else {
          toast.success(`${data.passedCount}/${data.totalCount} passed`, { id: toastId });
          setProblemStatus(prev => ({ ...prev, [activeTab]: 'attempted' }));
        }
      } else {
        toast.error('Evaluation failed: ' + data.error, { id: toastId });
      }
    } catch (error) {
      toast.error('Network error', { id: toastId });
    }
    setIsEvaluating(false);
  };

  const handleFinalSubmit = async (isAuto = false) => {
    setIsSubmittingTotal(true);
    const toastId = toast.loading('Submitting assessment...');
    try {
      const codePerProblem = {};
      for (let p of PROBLEMS) {
        const lang = language[p.id];
        codePerProblem[p.id] = code[lang]?.[p.id] || '';
      }
      
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rollNo: candidate.rollNo,
          name: candidate.name,
          codePerProblem,
          languagePerProblem: language,
          timeTaken: 3600 - timeLeft,
          violations: warnings
        })
      });
      const data = await response.json();
      if (data.success) {
        setIsSubmitted(true);
        setResults(data.totalScore, data.scores);
        
        // Save to Supabase
        try {
          const { error: sbError } = await supabase.from('submissions').insert({
            id: candidate.rollNo,
            roll_no: candidate.rollNo,
            student_name: candidate.name,
            total_marks: data.totalScore,
            data: {
              codePerProblem,
              languagePerProblem: language,
              timeTaken: 3600 - timeLeft,
              violations: warnings,
              scores: data.scores
            }
          });
          if (sbError) console.error("Supabase insert error:", sbError);
        } catch (e) {
          console.error("Supabase insert exception:", e);
        }

        toast.success(isAuto ? 'Auto-submitted successfully!' : 'Submitted successfully!', { id: toastId });
        navigate('/results');
      } else {
        toast.error('Submission failed: ' + data.error, { id: toastId });
      }
    } catch (error) {
      toast.error('Network error during submission. Please retry.', { id: toastId });
    }
    setIsSubmittingTotal(false);
  };

  const nextProblem = () => {
    const idx = PROBLEMS.findIndex(p => p.id === activeTab);
    if (idx < PROBLEMS.length - 1) setActiveTab(PROBLEMS[idx + 1].id);
  };

  const prevProblem = () => {
    const idx = PROBLEMS.findIndex(p => p.id === activeTab);
    if (idx > 0) setActiveTab(PROBLEMS[idx - 1].id);
  };

  if (!candidate) return null;

  return (
    <div className="flex flex-col h-screen bg-animate-gradient text-slate-200 font-sans">
      {/* Header */}
      <header className="flex justify-between items-center p-4 bg-brand-bg1/70 backdrop-blur-xl border-b border-brand-pink/30 shadow-[0_4px_20px_rgba(247,37,133,0.15)] z-10">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-pink to-brand-purple">
            DAA Assessment
          </h1>
          <span className="text-sm px-3 py-1 bg-slate-700 rounded-full">{candidate.rollNo} - {candidate.name}</span>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <AlertTriangle className={`w-5 h-5 ${warnings > 0 ? 'text-yellow-500' : 'text-slate-500'}`} />
            <span className={warnings > 0 ? 'text-yellow-500 font-semibold' : 'text-slate-500'}>
              Warnings: {warnings}/3
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="20" cy="20" r="18" className="stroke-brand-pink/20" strokeWidth="4" fill="none" />
                <circle cx="20" cy="20" r="18" 
                  className={`stroke-current ${timeLeft < 300 ? 'text-brand-coral animate-pulse' : 'text-brand-pink'}`} 
                  strokeWidth="4" fill="none" 
                  strokeDasharray="113" 
                  strokeDashoffset={113 - (113 * timeLeft) / 3600} 
                  strokeLinecap="round" 
                />
              </svg>
            </div>
            <span className={`text-xl font-mono font-bold ${timeLeft < 300 ? 'text-brand-coral' : 'text-brand-pink'}`}>
              {formatTime(timeLeft)}
            </span>
          </div>

          <button 
            onClick={() => handleFinalSubmit(false)}
            disabled={isSubmittingTotal}
            className="flex items-center gap-2 bg-gradient-to-r from-brand-coral to-red-600 hover:shadow-[0_0_15px_rgba(255,107,107,0.5)] text-white px-4 py-2 rounded-lg font-semibold transition-all disabled:opacity-50"
          >
            {isSubmittingTotal ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
            Final Submit
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Sidebar - Problem List */}
        <div className="w-64 bg-brand-bg1/50 backdrop-blur-md border-r border-brand-pink/30 flex flex-col z-10">
          <div className="p-4 font-semibold text-brand-purple border-b border-brand-pink/30 uppercase text-xs tracking-wider">
            Problems
          </div>
          <div className="flex-1 overflow-y-auto">
            {PROBLEMS.map((prob) => (
              <button
                key={prob.id}
                onClick={() => setActiveTab(prob.id)}
                className={`w-full text-left px-4 py-4 border-b border-brand-pink/10 transition-colors flex justify-between items-center ${activeTab === prob.id ? 'bg-brand-bg2/80 border-l-4 border-l-brand-pink shadow-[inset_4px_0_0_rgba(247,37,133,1)]' : 'hover:bg-brand-bg2/40 border-l-4 border-l-transparent'}`}
              >
                <div className={`font-medium ${activeTab === prob.id ? 'text-brand-pink' : 'text-slate-300'}`}>
                  {prob.title}
                </div>
                {problemStatus[prob.id] === 'solved' && <CheckCircle className="w-4 h-4 text-brand-pass" />}
                {problemStatus[prob.id] === 'attempted' && <AlertTriangle className="w-4 h-4 text-yellow-500" />}
              </button>
            ))}
          </div>
        </div>

        {/* Center - Problem Statement */}
        <div className="w-1/3 p-6 bg-brand-bg2/20 backdrop-blur-sm border-r border-brand-pink/30 flex flex-col overflow-y-auto">
          <h2 className="text-2xl font-bold mb-4 text-white">{PROBLEMS.find(p => p.id === activeTab)?.title}</h2>
          
          <div className="prose prose-invert max-w-none">
            <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
              {problemDetails[activeTab].desc}
            </p>
            <h3 className="text-lg font-semibold mt-6 mb-2 text-white">Sample Input/Output</h3>
            <pre className="bg-brand-bg1/80 border border-brand-pink/20 p-4 rounded-lg text-sm text-brand-purple whitespace-pre-wrap">
              {problemDetails[activeTab].samples}
            </pre>
          </div>

          {/* Run Results Panel */}
          {runResults[activeTab] && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4 border-b border-brand-pink/30 pb-2 text-brand-pink">Test Results</h3>
              <div className="space-y-3">
                {runResults[activeTab].map((res, i) => (
                  <div key={i} className={`p-3 rounded-lg border ${res.status === 'PASS' ? 'bg-brand-pass/10 border-brand-pass/40' : 'bg-brand-coral/10 border-brand-coral/40'} backdrop-blur-sm`}>
                    <div className="flex items-center gap-2 mb-1">
                      {res.status === 'PASS' ? <CheckCircle className="w-5 h-5 text-brand-pass" /> : <XCircle className="w-5 h-5 text-brand-coral" />}
                      <span className="font-semibold">{res.isHidden ? `Hidden Test Case ${res.index}` : `Test Case ${res.index}`}</span>
                      <span className={`ml-auto text-sm ${res.status === 'PASS' ? 'text-green-400' : 'text-red-400'}`}>
                        {res.status}
                      </span>
                    </div>
                    {res.status === 'FAIL' && !res.isHidden && (
                      <div className="text-sm mt-2 space-y-1 text-slate-300">
                        <div><span className="font-semibold text-slate-400">Reason:</span> {res.reason}</div>
                        {res.expected && <div><span className="font-semibold text-slate-400">Expected:</span> <code className="bg-slate-800 px-1 rounded">{res.expected}</code></div>}
                        {res.actual && <div><span className="font-semibold text-slate-400">Actual:</span> <code className="bg-slate-800 px-1 rounded">{res.actual}</code></div>}
                        {res.details && <pre className="mt-2 text-xs text-red-300 bg-red-950/50 p-2 rounded overflow-x-auto">{res.details}</pre>}
                      </div>
                    )}
                    {res.status === 'FAIL' && res.isHidden && (
                      <div className="text-sm mt-2 text-slate-400">
                        Reason: {res.reason}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right - Code Editor */}
        <div className="flex-1 flex flex-col bg-[#1e1e1e]">
          <div className="flex justify-between items-center p-2 bg-brand-bg1/90 border-b border-brand-pink/30">
            <div className="flex gap-2 items-center">
              <select 
                value={language[activeTab]} 
                onChange={(e) => updateLanguage(activeTab, e.target.value)}
                className="bg-brand-bg2 border border-brand-pink/40 text-slate-300 text-sm rounded px-3 py-1.5 outline-none mr-2 focus:border-brand-pink focus:ring-1 focus:ring-brand-pink"
              >
                <option value="java">Java</option>
                <option value="python">Python 3</option>
                <option value="c">C</option>
              </select>
              <button 
                onClick={() => handleRun(false)}
                disabled={isEvaluating}
                className="flex items-center gap-1 bg-brand-bg2 hover:bg-brand-bg2/80 border border-brand-pink/40 px-3 py-1.5 rounded text-sm font-medium transition-colors disabled:opacity-50"
              >
                {isEvaluating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 text-brand-pass" />}
                Run
              </button>
              <button 
                onClick={() => handleRun(true)}
                disabled={isEvaluating}
                className="flex items-center gap-1 bg-gradient-to-r from-brand-pink to-brand-purple hover:shadow-[0_0_15px_rgba(247,37,133,0.5)] px-3 py-1.5 rounded text-sm font-medium transition-all disabled:opacity-50 text-white"
              >
                {isEvaluating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Submit
              </button>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={prevProblem}
                disabled={activeTab === PROBLEMS[0].id}
                className="flex items-center gap-1 bg-brand-bg2 hover:bg-brand-bg2/80 border border-brand-pink/20 px-3 py-1.5 rounded text-sm transition-colors disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" /> Prev
              </button>
              <button 
                onClick={nextProblem}
                disabled={activeTab === PROBLEMS[PROBLEMS.length - 1].id}
                className="flex items-center gap-1 bg-brand-bg2 hover:bg-brand-bg2/80 border border-brand-pink/20 px-3 py-1.5 rounded text-sm transition-colors disabled:opacity-50"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="flex-1 relative">
            <Editor
              height="100%"
              language={language[activeTab]}
              theme="vs-dark"
              value={code[language[activeTab]]?.[activeTab] || ''}
              onChange={handleEditorChange}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                wordWrap: "on",
                scrollBeyondLastLine: false,
                contextmenu: false // Disable right-click menu
              }}
              onMount={(editor) => {
                editorRef.current = editor;
              }}
            />
          </div>
        </div>

      </div>
    </div>
  );
}
