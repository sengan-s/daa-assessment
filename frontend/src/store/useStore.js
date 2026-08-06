import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const DEFAULT_CODE = {
  java: {
    mergeSort: `class Solution {\n    public int[] mergeArrays(int[] arr1, int[] arr2) {\n        // write your code here\n        return new int[0];\n    }\n}`,
    binarySearch: `class Solution {\n    public int search(int[] nums, int target) {\n        // write your code here\n        return -1;\n    }\n}`,
    matrixMult: `class Solution {\n    public int[][] multiply(int[][] mat1, int[][] mat2) {\n        // write your code here\n        return new int[0][0];\n    }\n}`
  },
  python: {
    mergeSort: `class Solution:\n    def mergeArrays(self, arr1, arr2):\n        # write your code here\n        pass\n`,
    binarySearch: `class Solution:\n    def search(self, nums, target):\n        # write your code here\n        pass\n`,
    matrixMult: `class Solution:\n    def multiply(self, mat1, mat2):\n        # write your code here\n        pass\n`
  },
  c: {
    mergeSort: `int* mergeArrays(int* arr1, int size1, int* arr2, int size2, int* retSize) {\n    // write your code here\n    *retSize = 0;\n    return NULL;\n}`,
    binarySearch: `int search(int* nums, int size, int target) {\n    // write your code here\n    return -1;\n}`,
    matrixMult: `int** multiply(int** mat1, int r1, int c1, int** mat2, int r2, int c2, int* retR, int** retC) {\n    // write your code here\n    *retR = 0;\n    *retC = NULL;\n    return NULL;\n}`
  }
};

const useStore = create(
  persist(
    (set) => ({
      // Candidate Details
      candidate: null, // { rollNo: '', name: '' }
      setCandidate: (candidate) => set({ candidate }),
      clearCandidate: () => set({ candidate: null, code: DEFAULT_CODE, warnings: 0, timeLeft: 3600, isSubmitted: false, score: null, marks: null }),

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
      code: DEFAULT_CODE,
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
