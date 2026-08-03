import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import useStore from '../store/useStore';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import { Play, Send, CheckCircle, XCircle, AlertTriangle, LogOut, Loader2, ChevronRight, ChevronLeft } from 'lucide-react';

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
      desc: "You are given two integer arrays nums1 and nums2, sorted in non-decreasing order, and two integers m and n, representing the number of elements in nums1 and nums2 respectively. Merge nums1 and nums2 into a single array sorted in non-decreasing order. The final sorted array should not be returned by the function — instead it must be stored inside nums1. To accommodate this, nums1 has a length of m + n, where the first m elements are the elements to be merged and the last n elements are 0 placeholders to be ignored/overwritten. nums2 has a length of n.",
      samples: "Input: nums1=[1,2,3,0,0,0], m=3, nums2=[2,5,6], n=3 → Output: [1,2,2,3,5,6]"
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
    const handleCopyPaste = (e) => {
      e.preventDefault();
      incrementWarning();
      const currentWarnings = useStore.getState().warnings;
      toast.error(`Warning [${currentWarnings}/3]: Copy-paste is not allowed during this assessment.`, { duration: 4000 });
      if (currentWarnings >= 3) {
        toast.error('Maximum warnings reached. Auto-submitting...');
        handleFinalSubmit(true);
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

    return () => {
      document.removeEventListener('copy', handleCopyPaste);
      document.removeEventListener('paste', handleCopyPaste);
      document.removeEventListener('cut', handleCopyPaste);
      document.removeEventListener('keydown', blockKeys);
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
    <div className="flex flex-col h-screen bg-slate-900 text-slate-200 font-sans">
      {/* Header */}
      <header className="flex justify-between items-center p-4 bg-slate-800 border-b border-slate-700 shadow-md">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
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
                <circle cx="20" cy="20" r="18" className="stroke-slate-700" strokeWidth="4" fill="none" />
                <circle cx="20" cy="20" r="18" 
                  className={`stroke-current ${timeLeft < 300 ? 'text-red-500 animate-pulse' : 'text-green-500'}`} 
                  strokeWidth="4" fill="none" 
                  strokeDasharray="113" 
                  strokeDashoffset={113 - (113 * timeLeft) / 3600} 
                  strokeLinecap="round" 
                />
              </svg>
            </div>
            <span className={`text-xl font-mono font-bold ${timeLeft < 300 ? 'text-red-500' : 'text-green-400'}`}>
              {formatTime(timeLeft)}
            </span>
          </div>

          <button 
            onClick={() => handleFinalSubmit(false)}
            disabled={isSubmittingTotal}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50"
          >
            {isSubmittingTotal ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
            Final Submit
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Sidebar - Problem List */}
        <div className="w-64 bg-slate-800 border-r border-slate-700 flex flex-col">
          <div className="p-4 font-semibold text-slate-400 border-b border-slate-700 uppercase text-xs tracking-wider">
            Problems
          </div>
          <div className="flex-1 overflow-y-auto">
            {PROBLEMS.map((prob) => (
              <button
                key={prob.id}
                onClick={() => setActiveTab(prob.id)}
                className={`w-full text-left px-4 py-4 border-b border-slate-700/50 transition-colors flex justify-between items-center ${activeTab === prob.id ? 'bg-slate-700 border-l-4 border-l-blue-500' : 'hover:bg-slate-700/50 border-l-4 border-l-transparent'}`}
              >
                <div className={`font-medium ${activeTab === prob.id ? 'text-blue-400' : 'text-slate-300'}`}>
                  {prob.title}
                </div>
                {problemStatus[prob.id] === 'solved' && <CheckCircle className="w-4 h-4 text-green-500" />}
                {problemStatus[prob.id] === 'attempted' && <AlertTriangle className="w-4 h-4 text-yellow-500" />}
              </button>
            ))}
          </div>
        </div>

        {/* Center - Problem Statement */}
        <div className="w-1/3 p-6 bg-slate-900 border-r border-slate-700 flex flex-col overflow-y-auto">
          <h2 className="text-2xl font-bold mb-4 text-white">{PROBLEMS.find(p => p.id === activeTab)?.title}</h2>
          
          <div className="prose prose-invert max-w-none">
            <p className="text-slate-300 leading-relaxed">
              {problemDetails[activeTab].desc}
            </p>
            <h3 className="text-lg font-semibold mt-6 mb-2 text-white">Sample Input/Output</h3>
            <pre className="bg-slate-800 p-4 rounded-lg text-sm text-blue-300 whitespace-pre-wrap">
              {problemDetails[activeTab].samples}
            </pre>
          </div>

          {/* Run Results Panel */}
          {runResults[activeTab] && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4 border-b border-slate-700 pb-2">Test Results</h3>
              <div className="space-y-3">
                {runResults[activeTab].map((res, i) => (
                  <div key={i} className={`p-3 rounded-lg border ${res.status === 'PASS' ? 'bg-green-900/20 border-green-800/50' : 'bg-red-900/20 border-red-800/50'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      {res.status === 'PASS' ? <CheckCircle className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-red-500" />}
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
          <div className="flex justify-between items-center p-2 bg-slate-800 border-b border-slate-700">
            <div className="flex gap-2 items-center">
              <select 
                value={language[activeTab]} 
                onChange={(e) => updateLanguage(activeTab, e.target.value)}
                className="bg-slate-900 border border-slate-600 text-slate-300 text-sm rounded px-3 py-1.5 outline-none mr-2 focus:border-blue-500"
              >
                <option value="java">Java</option>
                <option value="python">Python 3</option>
                <option value="c">C</option>
              </select>
              <button 
                onClick={() => handleRun(false)}
                disabled={isEvaluating}
                className="flex items-center gap-1 bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded text-sm font-medium transition-colors disabled:opacity-50"
              >
                {isEvaluating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 text-green-400" />}
                Run
              </button>
              <button 
                onClick={() => handleRun(true)}
                disabled={isEvaluating}
                className="flex items-center gap-1 bg-blue-600 hover:bg-blue-500 px-3 py-1.5 rounded text-sm font-medium transition-colors disabled:opacity-50 text-white"
              >
                {isEvaluating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Submit
              </button>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={prevProblem}
                disabled={activeTab === PROBLEMS[0].id}
                className="flex items-center gap-1 bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded text-sm transition-colors disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" /> Prev
              </button>
              <button 
                onClick={nextProblem}
                disabled={activeTab === PROBLEMS[PROBLEMS.length - 1].id}
                className="flex items-center gap-1 bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded text-sm transition-colors disabled:opacity-50"
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
