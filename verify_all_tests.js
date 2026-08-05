const { evaluateCode } = require('./backend/judge');
const problems = require('./backend/problems');

const solutions = {
  mergeSort: {
    java: `import java.util.*;

class Main {
    public static void main(String[] args) {

        Scanner sc = new Scanner(System.in);

        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[] a = new int[n];

        for (int i = 0; i < n; i++)
            a[i] = sc.nextInt();

        if (!sc.hasNextInt()) return;
        int m = sc.nextInt();
        int[] b = new int[m];

        for (int i = 0; i < m; i++)
            b[i] = sc.nextInt();

        int[] result = new int[n + m];

        int i = 0, j = 0, k = 0;

        while (i < n && j < m) {
            if (a[i] <= b[j]) {
                result[k++] = a[i++];
            } else {
                result[k++] = b[j++];
            }
        }

        while (i < n)
            result[k++] = a[i++];

        while (j < m)
            result[k++] = b[j++];

        for (int x = 0; x < result.length; x++) {
            System.out.print(result[x]);
            if (x < result.length - 1) System.out.print(" ");
        }
    }
}`,
    python: `import sys

def solve():
    input_data = sys.stdin.read().split()
    if not input_data:
        return
    n = int(input_data[0])
    a = [int(x) for x in input_data[1:n+1]]
    
    if len(input_data) <= n+1:
        return
    m = int(input_data[n+1])
    b = [int(x) for x in input_data[n+2:n+2+m]]

    i = 0
    j = 0
    result = []

    while i < n and j < m:
        if a[i] <= b[j]:
            result.append(a[i])
            i += 1
        else:
            result.append(b[j])
            j += 1

    while i < n:
        result.append(a[i])
        i += 1

    while j < m:
        result.append(b[j])
        j += 1

    print(*(result))

if __name__ == '__main__':
    solve()`,
    c: `#include <stdio.h>

int main() {
    int n, m;

    if (scanf("%d", &n) != 1) return 0;
    int a[n > 0 ? n : 1];
    for (int i = 0; i < n; i++)
        scanf("%d", &a[i]);

    if (scanf("%d", &m) != 1) return 0;
    int b[m > 0 ? m : 1];
    for (int i = 0; i < m; i++)
        scanf("%d", &b[i]);

    int result[n + m > 0 ? n + m : 1];

    int i = 0, j = 0, k = 0;

    while (i < n && j < m) {
        if (a[i] <= b[j])
            result[k++] = a[i++];
        else
            result[k++] = b[j++];
    }

    while (i < n)
        result[k++] = a[i++];

    while (j < m)
        result[k++] = b[j++];

    for (int x = 0; x < n + m; x++) {
        printf("%d", result[x]);
        if (x < n + m - 1) printf(" ");
    }

    return 0;
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
        const allPassed = result.results.every(r => r.status === 'PASS');
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
