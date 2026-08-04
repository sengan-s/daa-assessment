const { evaluateCode } = require('./backend/judge');
const problems = require('./backend/problems');

const solutions = {
  mergeSort: {
    java: `class Solution {
    public static void merge(int[] nums1, int m, int[] nums2, int n) {
        int i = m - 1;
        int j = n - 1;
        int k = m + n - 1;
        while (j >= 0) {
            if (i >= 0 && nums1[i] > nums2[j]) {
                nums1[k--] = nums1[i--];
            } else {
                nums1[k--] = nums2[j--];
            }
        }
    }
}`,
    python: `class Solution:
    def merge(self, nums1, m, nums2, n):
        i = m - 1
        j = n - 1
        k = m + n - 1
        while j >= 0:
            if i >= 0 and nums1[i] > nums2[j]:
                nums1[k] = nums1[i]
                i -= 1
            else:
                nums1[k] = nums2[j]
                j -= 1
            k -= 1`,
    c: `void merge(int* nums1, int nums1Size, int m, int* nums2, int nums2Size, int n) {
    int i = m - 1;
    int j = n - 1;
    int k = m + n - 1;
    while (j >= 0) {
        if (i >= 0 && nums1[i] > nums2[j]) {
            nums1[k--] = nums1[i--];
        } else {
            nums1[k--] = nums2[j--];
        }
    }
}`
  },
  binarySearch: {
    java: `class Solution {
    public static int binarySearch(int[] arr, int target) {
        int l = 0, r = arr.length - 1;
        while (l <= r) {
            int mid = l + (r - l) / 2;
            if (arr[mid] == target) return mid;
            if (arr[mid] < target) l = mid + 1;
            else r = mid - 1;
        }
        return -1;
    }
}`,
    python: `class Solution:
    def binarySearch(self, arr, target):
        l, r = 0, len(arr) - 1
        while l <= r:
            mid = l + (r - l) // 2
            if arr[mid] == target:
                return mid
            if arr[mid] < target:
                l = mid + 1
            else:
                r = mid - 1
        return -1`,
    c: `int binarySearch(int* arr, int arrSize, int target) {
    if (arrSize == 0) return -1;
    int l = 0, r = arrSize - 1;
    while (l <= r) {
        int mid = l + (r - l) / 2;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) l = mid + 1;
        else r = mid - 1;
    }
    return -1;
}`
  },
  matrixMult: {
    java: `class Solution {
    public static int[][] multiply(int[][] A, int[][] B) {
        if (A.length == 0 || B.length == 0) return new int[0][0];
        int m = A.length;
        int n = A[0].length;
        int p = B[0].length;
        int[][] C = new int[m][p];
        for (int i = 0; i < m; i++) {
            for (int j = 0; j < p; j++) {
                for (int k = 0; k < n; k++) {
                    C[i][j] += A[i][k] * B[k][j];
                }
            }
        }
        return C;
    }
}`,
    python: `class Solution:
    def multiply(self, A, B):
        if not A or not B: return []
        m, n, p = len(A), len(A[0]), len(B[0])
        C = [[0] * p for _ in range(m)]
        for i in range(m):
            for j in range(p):
                for k in range(n):
                    C[i][j] += A[i][k] * B[k][j]
        return C`,
    c: `#include <stdlib.h>
int* multiply(int* A, int A_rows, int A_cols, int* B, int B_rows, int B_cols, int* out_rows, int* out_cols) {
    *out_rows = A_rows;
    *out_cols = B_cols;
    if (A_rows == 0 || B_cols == 0) return NULL;
    int* C = (int*)calloc(A_rows * B_cols, sizeof(int));
    for (int i = 0; i < A_rows; i++) {
        for (int j = 0; j < B_cols; j++) {
            for (int k = 0; k < A_cols; k++) {
                C[i * B_cols + j] += A[i * A_cols + k] * B[k * B_cols + j];
            }
        }
    }
    return C;
}`
  }
};

async function runAll() {
  for (const probId of Object.keys(problems)) {
    const prob = problems[probId];
    for (const lang of ['java', 'python', 'c']) {
      const sol = solutions[probId][lang];
      console.log(`Running ${probId} in ${lang}...`);
      try {
        const result = await evaluateCode(prob, sol, lang, prob.testCases);
        const allPassed = result.results.every(r => r.passed);
        console.log(`${probId} in ${lang}: ${allPassed ? 'ALL PASSED' : 'FAILED'}`);
        if (!allPassed) {
          console.log(JSON.stringify(result.results, null, 2));
        }
      } catch (err) {
        console.error(`Error running ${probId} in ${lang}:`, err);
      }
    }
  }
}
runAll();
