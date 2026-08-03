import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useStore = create(
  persist(
    (set) => ({
      // Candidate Details
      candidate: null, // { rollNo: '', name: '' }
      setCandidate: (candidate) => set({ candidate }),
      clearCandidate: () => set({ candidate: null, code: {}, warnings: 0, timeLeft: 3600, isSubmitted: false, score: null, marks: null }),

      // Admin State
      isAdminAuthenticated: false,
      setIsAdminAuthenticated: (status) => set({ isAdminAuthenticated: status }),

      // Assessment State
      timeLeft: 3600, // 1 hour in seconds
      setTimeLeft: (time) => set({ timeLeft: time }),

      warnings: 0,
      incrementWarning: () => set((state) => ({ warnings: state.warnings + 1 })),

      // Language State per problem
      language: {
        mergeSort: 'java',
        binarySearch: 'java',
        matrixMult: 'java'
      },
      updateLanguage: (problemId, lang) => set((state) => ({
        language: { ...state.language, [problemId]: lang }
      })),

      // Problem Code State per language
      code: {
        java: {
          mergeSort: `class Solution {\n    public static void merge(int[] nums1, int m, int[] nums2, int n) {\n        // candidate writes code here — modify nums1 in place, don't return anything\n    }\n}`,
          binarySearch: `class Solution {\n    public static int binarySearch(int[] arr, int target) {\n        // candidate writes code here\n        return -1;\n    }\n}`,
          matrixMult: `class Solution {\n    public static int[][] multiply(int[][] A, int[][] B) {\n        // candidate writes code here\n        return new int[0][0];\n    }\n}`
        },
        python: {
          mergeSort: `class Solution:\n    def merge(self, nums1, m, nums2, n):\n        # candidate writes code here — modify nums1 in place, don't return anything\n        pass`,
          binarySearch: `class Solution:\n    def binarySearch(self, arr, target):\n        # candidate writes code here\n        return -1`,
          matrixMult: `class Solution:\n    def multiply(self, A, B):\n        # candidate writes code here\n        return []`
        },
        c: {
          mergeSort: `void merge(int* nums1, int nums1Size, int m, int* nums2, int nums2Size, int n) {\n    // candidate writes code here\n}`,
          binarySearch: `int binarySearch(int* arr, int arrSize, int target) {\n    // candidate writes code here\n    return -1;\n}`,
          matrixMult: `void multiply(int* A, int A_rows, int A_cols, int* B, int B_rows, int B_cols, int* res) {\n    // candidate writes code here\n}`
        }
      },
      updateCode: (problemId, lang, newCode) => set((state) => ({
        code: { 
          ...state.code, 
          [lang]: { ...(state.code[lang] || {}), [problemId]: newCode } 
        }
      })),

      // Submission State
      isSubmitted: false,
      setIsSubmitted: (status) => set({ isSubmitted: status }),
      
      score: null,
      marks: null,
      setResults: (score, marks) => set({ score, marks })
    }),
    {
      name: 'daa-assessment-storage', // unique name
      getStorage: () => localStorage, // (optional) by default the 'localStorage' is used
    }
  )
);

export default useStore;
