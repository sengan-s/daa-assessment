import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import useStore, { DEFAULT_CODE } from '../store/useStore';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import { Play, Send, CheckCircle, XCircle, AlertTriangle, LogOut, Loader2, ChevronRight, ChevronLeft, RotateCcw } from 'lucide-react';
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
      desc: "You are given two sorted arrays of integers. Your task is to merge these two arrays into a single sorted array and output the result.\n\nConstraints:\n- The sizes of both arrays are between 0 and 10^4.\n- The elements in the arrays are sorted in non-decreasing order.\n\nInput Format:\n- The first line contains an integer N, the size of the first array.\n- The second line contains N space-separated integers, representing the first array.\n- The third line contains an integer M, the size of the second array.\n- The fourth line contains M space-separated integers, representing the second array.\n\nOutput Format:\n- Output a single line containing the merged sorted array, with elements separated by a single space.",
      samples: "Example 1:\nInput:\n4\n1 3 5 7\n3\n2 4 6\n\nOutput:\n1 2 3 4 5 6 7\n\nExplanation for Example 1:\nArray 1 has 4 elements: [1, 3, 5, 7]\nArray 2 has 3 elements: [2, 4, 6]\nMerging them in sorted order gives: [1, 2, 3, 4, 5, 6, 7]\n\nExample 2:\nInput:\n0\n\n1\n1\n\nOutput:\n1\n\nExplanation for Example 2:\nArray 1 has 0 elements: [] (empty)\nArray 2 has 1 element: [1]\nMerging them gives: [1]"
    },
    binarySearch: {
      desc: "Given an array of integers sorted in ascending order and a target value, write a function to search the target in the array. If the target exists, then return its index. Otherwise, return -1.\n\nYou must write an algorithm with O(log n) runtime complexity.\n\nConstraints:\n- 1 <= arr.length <= 10^4\n- -10^4 < arr[i], target < 10^4\n- All the integers in the array are unique.\n- The array is sorted in ascending order.\n\nInput Format:\n- The first line contains an integer N, the size of the array.\n- The second line contains N space-separated integers, representing the sorted array.\n- The third line contains an integer T, representing the target value to search for.\n\nOutput Format:\n- Output a single integer representing the index of the target in the array (0-indexed), or -1 if the target is not found.",
      samples: "Example 1:\nInput:\n6\n1 3 5 7 9 11\n7\n\nOutput:\n3\n\nExplanation for Example 1:\nThe array is [1, 3, 5, 7, 9, 11].\nThe target is 7.\nSince 7 exists in the array at index 3 (0-indexed), the output is 3.\n\nExample 2:\nInput:\n4\n2 4 6 8\n5\n\nOutput:\n-1\n\nExplanation for Example 2:\nThe array is [2, 4, 6, 8].\nThe target is 5.\nSince 5 does not exist in the array, the output is -1."
    },
    matrixMult: {
      desc: "You are given two matrices, A and B. Your task is to compute their product (A * B).\n\nFor matrix multiplication to be valid, the number of columns in Matrix A must equal the number of rows in Matrix B. The resulting matrix will have the same number of rows as A and the same number of columns as B.\n\nConstraints:\n- Dimensions of the matrices are between 1x1 and 100x100.\n- Matrix elements are integers.\n\nInput Format:\n1. The first line contains two integers: the number of rows (r1) and columns (c1) of Matrix A.\n2. The next r1 lines represent Matrix A, with each line containing c1 space-separated integers.\n3. The following line contains two integers: the number of rows (r2) and columns (c2) of Matrix B.\n4. The next r2 lines represent Matrix B, with each line containing c2 space-separated integers.\n\nOutput Format:\n- Output the resulting multiplied matrix. Print each row on a new line, with elements separated by a single space.",
      samples: "Example 1:\nInput:\n2 2\n1 2\n3 4\n2 2\n2 0\n1 2\n\nOutput:\n4 4\n10 8\n\nExplanation for Example 1:\nMatrix A is 2x2:\n[1, 2]\n[3, 4]\n\nMatrix B is 2x2:\n[2, 0]\n[1, 2]\n\nResult:\nRow 1: [(1*2 + 2*1), (1*0 + 2*2)] = [4, 4]\nRow 2: [(3*2 + 4*1), (3*0 + 4*2)] = [10, 8]\n\nExample 2:\nInput:\n1 3\n1 2 3\n3 1\n1\n2\n3\n\nOutput:\n14\n\nExplanation for Example 2:\nMatrix A is 1x3: [1, 2, 3]\nMatrix B is 3x1:\n[1]\n[2]\n[3]\n\nResult: [(1*1 + 2*2 + 3*3)] = [14]"
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
  const [showViolation, setShowViolation] = useState(false);
  const [violationMessage, setViolationMessage] = useState('');
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
      
      setViolationMessage(`WARNING [${currentWarnings}/3]: ${message}`);
      setShowViolation(true);
      toast.error(`Warning [${currentWarnings}/3]: ${message}`, { duration: 4000 });
      
      setTimeout(() => {
        setShowViolation(false);
      }, 3000);

      if (currentWarnings >= 3) {
        toast.error('Maximum warnings reached. Auto-submitting...');
        handleFinalSubmit(true);
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleAntiCheatViolation('Tab switching is not allowed during this assessment.');
      }
    };

    const blockAction = (e) => {
      e.preventDefault();
      handleAntiCheatViolation('Copy, Cut, Paste, and Right-Click are strictly prohibited.');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('contextmenu', blockAction);
    document.addEventListener('copy', blockAction);
    document.addEventListener('cut', blockAction);
    document.addEventListener('paste', blockAction);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('contextmenu', blockAction);
      document.removeEventListener('copy', blockAction);
      document.removeEventListener('cut', blockAction);
      document.removeEventListener('paste', blockAction);
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
                  <div key={i} className={`p-3 rounded-lg border ${res.status === 'AC' ? 'bg-brand-pass/10 border-brand-pass/40' : 'bg-brand-coral/10 border-brand-coral/40'} backdrop-blur-sm`}>
                    <div className="flex items-center gap-3">
                      {res.status === 'AC' ? <CheckCircle className="w-5 h-5 text-brand-pass" /> : <XCircle className="w-5 h-5 text-brand-coral" />}
                      <span className="font-semibold text-white">Test Case {res.index} {res.isHidden ? '(Hidden)' : ''}</span>
                      <span className={`ml-auto text-sm font-bold ${res.status === 'AC' ? 'text-green-400' : 'text-red-400'}`}>
                        {{ 'AC': 'Accepted', 'WA': 'Wrong Answer', 'TLE': 'Time Limit Exceeded', 'RE': 'Runtime Error', 'CE': 'Compilation Error' }[res.status] || res.status}
                      </span>
                    </div>
                    {res.status !== 'AC' && !res.isHidden && (
                      <div className="mt-3 text-sm bg-black/40 p-3 rounded font-mono overflow-x-auto text-brand-coral">
                        {res.status === 'CE' ? (
                           <div className="text-red-400"><strong>Compilation Error:</strong><br/>{res.details}</div>
                        ) : res.status === 'RE' ? (
                           <div className="text-red-400"><strong>Runtime Error:</strong><br/>{res.details}</div>
                        ) : res.status === 'TLE' ? (
                           <div className="text-orange-400"><strong>Time Limit Exceeded</strong></div>
                        ) : (
                          <>
                            <div className="mb-1"><span className="text-slate-400">Expected:</span> {res.expected}</div>
                            <div><span className="text-slate-400">Actual:</span> {res.actual}</div>
                          </>
                        )}
                      </div>
                    )}
                    {res.status !== 'AC' && res.isHidden && (
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
                onClick={() => {
                  if (window.confirm('Are you sure you want to reset your code to the default starter template? All your current changes will be lost.')) {
                    updateCode(activeTab, language[activeTab], DEFAULT_CODE[language[activeTab]][activeTab]);
                    toast.success('Code reset to default.');
                  }
                }}
                disabled={isEvaluating}
                className="flex items-center gap-1 bg-brand-bg2 hover:bg-brand-coral/20 hover:text-brand-coral border border-brand-pink/40 hover:border-brand-coral/40 px-3 py-1.5 rounded text-sm font-medium transition-colors disabled:opacity-50"
                title="Reset Code to Default"
              >
                <RotateCcw className="w-4 h-4" /> Reset
              </button>
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
              value={code[language[activeTab]]?.[activeTab] || DEFAULT_CODE[language[activeTab]]?.[activeTab] || ''}
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
      
      {/* Centered Violation Overlay */}
      {showViolation && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-red-950/90 backdrop-blur-md animate-pulse">
          <div className="bg-red-900 border-4 border-red-500 rounded-2xl p-8 max-w-lg text-center shadow-[0_0_150px_rgba(239,68,68,1)] transform scale-110">
            <AlertTriangle className="w-24 h-24 text-red-500 mx-auto mb-4 animate-bounce" />
            <h2 className="text-4xl font-black text-white mb-2 tracking-widest uppercase">Violation Detected</h2>
            <p className="text-xl text-red-100 font-bold">{violationMessage}</p>
            <p className="text-red-300 mt-6 text-sm font-semibold uppercase tracking-widest">Your activity is being monitored</p>
          </div>
        </div>
      )}
    </div>
  );
}
