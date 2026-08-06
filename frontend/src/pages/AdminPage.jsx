import React, { useState, useEffect } from 'react';
import { Download, Search, Code, CheckCircle, Clock, AlertTriangle, Shield, ChevronDown, ChevronUp, Database, Trash2, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';

export default function AdminPage() {
  const isAdminAuthenticated = useStore(state => state.isAdminAuthenticated);
  const setIsAdminAuthenticated = useStore(state => state.setIsAdminAuthenticated);
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [search, setSearch] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'submittedAt', direction: 'desc' });
  const [expandedRow, setExpandedRow] = useState(null);
  const [supabaseStatus, setSupabaseStatus] = useState('checking'); // checking, connected, error

  const handleLogout = () => {
    setIsAdminAuthenticated(false);
    navigate('/');
  };

  useEffect(() => {
    if (!isAdminAuthenticated) {
      navigate('/');
    } else {
      checkSupabaseConnection();
      fetchResults();
    }
  }, [isAdminAuthenticated, navigate]);

  const checkSupabaseConnection = async () => {
    try {
      const { error } = await supabase.auth.getSession();
      if (error) throw error;
      setSupabaseStatus('connected');
    } catch (err) {
      setSupabaseStatus('error');
    }
  };

  const fetchResults = async () => {
    try {
      const { data: supaData, error } = await supabase
        .from('submissions')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (error) throw error;

      const formattedResults = supaData.map(row => {
        const d = row.data || {};
        return {
          id: row.id,
          rollNo: row.roll_no,
          name: row.student_name,
          totalScore: row.total_marks,
          mergeSortMarks: d.scores?.mergeSort || 0,
          binarySearchMarks: d.scores?.binarySearch || 0,
          matrixMultMarks: d.scores?.matrixMult || 0,
          timeTaken: d.timeTaken || 0,
          violations: d.violations || 0,
          submittedAt: row.submitted_at,
          codeMergeSort: d.codePerProblem?.mergeSort || '',
          languageMergeSort: d.languagePerProblem?.mergeSort || '',
          codeBinarySearch: d.codePerProblem?.binarySearch || '',
          languageBinarySearch: d.languagePerProblem?.binarySearch || '',
          codeMatrixMult: d.codePerProblem?.matrixMult || '',
          languageMatrixMult: d.languagePerProblem?.matrixMult || ''
        };
      });

      setResults(formattedResults);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch results from Supabase');
    }
  };

  const handleDelete = async (rollNo, e) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete submission for Roll No: ${rollNo}?`)) return;
    
    const toastId = toast.loading('Deleting...');
    try {
      const { error } = await supabase
        .from('submissions')
        .delete()
        .eq('roll_no', rollNo);
        
      if (error) throw error;

      toast.success('Candidate deleted', { id: toastId });
      setResults(prev => prev.filter(r => r.rollNo !== rollNo));
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete', { id: toastId });
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedResults = [...results].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const filteredResults = sortedResults.filter(
    r => r.rollNo.toLowerCase().includes(search.toLowerCase()) || 
         r.name.toLowerCase().includes(search.toLowerCase())
  );

  const exportCSV = () => {
    if (results.length === 0) return;
    const headers = ['Roll No', 'Name', 'Total Score', 'Merge Sort', 'Binary Search', 'Matrix Mult', 'Time Taken (s)', 'Violations', 'Submitted At'];
    const csvContent = [
      headers.join(','),
      ...results.map(r => [
        r.rollNo,
        `"${r.name}"`,
        r.totalScore,
        r.mergeSortMarks,
        r.binarySearchMarks,
        r.matrixMultMarks,
        r.timeTaken,
        r.violations,
        r.submittedAt
      ].join(','))
    ].join('\\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'daa_results.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleRow = (id) => {
    if (expandedRow === id) setExpandedRow(null);
    else setExpandedRow(id);
  };

  if (!isAdminAuthenticated) return null;

  return (
    <div className="min-h-screen bg-animate-gradient text-slate-200 p-8">
      <div className="max-w-7xl mx-auto">
        
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">DAA Assessment Results</h1>
            <div className="flex items-center gap-4 text-sm">
              <p className="text-slate-400">Total Submissions: {results.length}</p>
              <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-800 border border-slate-700">
                <Database className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-300">Supabase:</span>
                {supabaseStatus === 'checking' && <span className="text-yellow-500">Checking...</span>}
                {supabaseStatus === 'connected' && <span className="text-green-500 font-medium">Connected</span>}
                {supabaseStatus === 'error' && <span className="text-red-500 font-medium">Disconnected</span>}
              </div>
            </div>
          </div>
          
          <div className="flex gap-4">
            <button onClick={fetchResults} className="px-4 py-2 bg-brand-bg2 hover:bg-brand-bg2/80 border border-brand-pink/40 rounded text-sm font-medium transition-colors">
              Refresh Data
            </button>
            <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-brand-pink to-brand-purple hover:shadow-[0_0_15px_rgba(247,37,133,0.5)] rounded text-sm font-medium transition-all text-white">
              <Download className="w-4 h-4" /> Export CSV
            </button>
            <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 hover:border-slate-500 rounded text-sm font-medium transition-colors text-white">
              <LogOut className="w-4 h-4" /> Exit
            </button>
          </div>
        </div>

        <div className="bg-brand-bg1/70 backdrop-blur-xl border border-brand-pink/30 rounded-xl overflow-hidden shadow-[0_0_20px_rgba(247,37,133,0.1)]">
          <div className="p-4 border-b border-brand-pink/30 flex justify-between items-center bg-brand-bg1/50">
            <div className="relative w-64">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search Roll No or Name..." 
                className="w-full pl-9 pr-4 py-2 bg-brand-bg2 border border-brand-pink/40 rounded-lg text-sm focus:outline-none focus:border-brand-pink focus:ring-1 focus:ring-brand-pink"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-brand-bg2/40 border-b border-brand-pink/20">
                  <th className="p-4 font-semibold text-slate-300 cursor-pointer" onClick={() => handleSort('rollNo')}>
                    Roll No {sortConfig.key === 'rollNo' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="p-4 font-semibold text-slate-300 cursor-pointer" onClick={() => handleSort('name')}>
                    Name {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="p-4 font-semibold text-slate-300 cursor-pointer" onClick={() => handleSort('totalScore')}>
                    Score {sortConfig.key === 'totalScore' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="p-4 font-semibold text-slate-300">Marks Breakdown</th>
                  <th className="p-4 font-semibold text-slate-300 cursor-pointer" onClick={() => handleSort('violations')}>
                    Violations {sortConfig.key === 'violations' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="p-4 font-semibold text-slate-300 cursor-pointer" onClick={() => handleSort('submittedAt')}>
                    Time {sortConfig.key === 'submittedAt' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="p-4"></th>
                </tr>
              </thead>
              <tbody>
                {filteredResults.map((r) => (
                  <React.Fragment key={r.id}>
                    <tr className={`border-b border-brand-pink/10 hover:bg-brand-bg2/40 transition-colors ${expandedRow === r.id ? 'bg-brand-bg2/40' : ''}`}>
                      <td className="p-4 font-mono text-sm">{r.rollNo}</td>
                      <td className="p-4 font-medium">{r.name}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${r.totalScore >= 40 ? 'bg-brand-pass/20 text-brand-pass' : r.totalScore >= 20 ? 'bg-yellow-900/50 text-yellow-400' : 'bg-brand-coral/20 text-brand-coral'}`}>
                          {r.totalScore} / 50
                        </span>
                      </td>
                      <td className="p-4 text-xs text-slate-400">
                        <div className="flex gap-3">
                          <span title="Merge Sort">M: {r.mergeSortMarks}/15</span>
                          <span title="Binary Search">B: {r.binarySearchMarks}/15</span>
                          <span title="Matrix Mult">X: {r.matrixMultMarks}/20</span>
                        </div>
                      </td>
                      <td className="p-4">
                        {r.violations > 0 ? (
                          <span className="flex items-center gap-1 text-yellow-500 text-sm">
                            <AlertTriangle className="w-4 h-4" /> {r.violations}
                          </span>
                        ) : (
                          <span className="text-green-500 text-sm flex items-center gap-1">
                            <CheckCircle className="w-4 h-4" /> 0
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-xs text-slate-400">
                        <div>{new Date(r.submittedAt).toLocaleTimeString()}</div>
                        <div className="text-slate-500 flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3" /> {Math.floor(r.timeTaken / 60)}m {r.timeTaken % 60}s
                        </div>
                      </td>
                      <td className="p-4 text-right flex items-center justify-end gap-2">
                        <button onClick={(e) => handleDelete(r.rollNo, e)} className="p-2 hover:bg-red-500/20 text-slate-500 hover:text-red-400 rounded transition-colors" title="Delete">
                          <Trash2 className="w-5 h-5" />
                        </button>
                        <button onClick={() => toggleRow(r.id)} className="p-2 hover:bg-slate-600 rounded transition-colors text-slate-400">
                          {expandedRow === r.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </button>
                      </td>
                    </tr>
                    {expandedRow === r.id && (
                      <tr className="bg-brand-bg1/90 border-b border-brand-pink/20">
                        <td colSpan="7" className="p-6">
                          <h4 className="flex items-center gap-2 text-white font-semibold mb-4 border-b border-brand-pink/20 pb-2">
                            <Code className="w-4 h-4 text-blue-400" /> Submitted Code
                          </h4>
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            
                            <div className="bg-brand-bg2/50 p-4 rounded border border-brand-pink/20">
                              <div className="flex justify-between items-center mb-2">
                                <span className="font-medium text-sm text-blue-300">
                                  Merge Sorted Array <span className="text-xs uppercase bg-slate-700 px-1 rounded ml-1 text-slate-400">{r.languageMergeSort}</span>
                                </span>
                                <span className="text-xs px-2 py-0.5 rounded bg-slate-700">{r.mergeSortMarks}/15</span>
                              </div>
                              <pre className="text-xs text-slate-300 overflow-auto max-h-64 scrollbar-thin scrollbar-thumb-slate-600">
                                <code>{r.codeMergeSort || 'No code submitted'}</code>
                              </pre>
                            </div>

                            <div className="bg-brand-bg2/50 p-4 rounded border border-brand-pink/20">
                              <div className="flex justify-between items-center mb-2">
                                <span className="font-medium text-sm text-blue-300">
                                  Binary Search <span className="text-xs uppercase bg-slate-700 px-1 rounded ml-1 text-slate-400">{r.languageBinarySearch}</span>
                                </span>
                                <span className="text-xs px-2 py-0.5 rounded bg-slate-700">{r.binarySearchMarks}/15</span>
                              </div>
                              <pre className="text-xs text-slate-300 overflow-auto max-h-64 scrollbar-thin scrollbar-thumb-slate-600">
                                <code>{r.codeBinarySearch || 'No code submitted'}</code>
                              </pre>
                            </div>

                            <div className="bg-brand-bg2/50 p-4 rounded border border-brand-pink/20">
                              <div className="flex justify-between items-center mb-2">
                                <span className="font-medium text-sm text-blue-300">
                                  Matrix Multiplication <span className="text-xs uppercase bg-slate-700 px-1 rounded ml-1 text-slate-400">{r.languageMatrixMult}</span>
                                </span>
                                <span className="text-xs px-2 py-0.5 rounded bg-slate-700">{r.matrixMultMarks}/20</span>
                              </div>
                              <pre className="text-xs text-slate-300 overflow-auto max-h-64 scrollbar-thin scrollbar-thumb-slate-600">
                                <code>{r.codeMatrixMult || 'No code submitted'}</code>
                              </pre>
                            </div>

                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
                {filteredResults.length === 0 && (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-slate-500">
                      No submissions found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
