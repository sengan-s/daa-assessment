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
    java: `import java.util.Scanner;
class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[] arr = new int[n];
        for (int i = 0; i < n; i++) arr[i] = sc.nextInt();
        if (!sc.hasNextInt()) return;
        int target = sc.nextInt();
        
        int l = 0, r = n - 1;
        int res = -1;
        while (l <= r) {
            int mid = l + (r - l) / 2;
            if (arr[mid] == target) { res = mid; break; }
            if (arr[mid] < target) l = mid + 1;
            else r = mid - 1;
        }
        System.out.println(res);
    }
}`,
    python: `import sys
def solve():
    input_data = sys.stdin.read().split()
    if not input_data: return
    n = int(input_data[0])
    arr = [int(x) for x in input_data[1:n+1]]
    target = int(input_data[n+1])
    
    l, r = 0, len(arr) - 1
    res = -1
    while l <= r:
        mid = l + (r - l) // 2
        if arr[mid] == target:
            res = mid
            break
        if arr[mid] < target:
            l = mid + 1
        else:
            r = mid - 1
    print(res)
if __name__ == '__main__':
    solve()`,
    c: `#include <stdio.h>
#include <stdlib.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    int *arr = (int*)malloc(n * sizeof(int));
    for (int i = 0; i < n; i++) {
        scanf("%d", &arr[i]);
    }
    int target;
    if (scanf("%d", &target) != 1) return 0;
    
    int l = 0, r = n - 1;
    int res = -1;
    while (l <= r) {
        int mid = l + (r - l) / 2;
        if (arr[mid] == target) { res = mid; break; }
        if (arr[mid] < target) l = mid + 1;
        else r = mid - 1;
    }
    printf("%d\\n", res);
    free(arr);
    return 0;
}`
  },
  matrixMult: {
    java: `import java.util.Scanner;
class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int m = sc.nextInt();
        int n = sc.nextInt();
        int[][] A = new int[m][n];
        for (int i = 0; i < m; i++)
            for (int j = 0; j < n; j++)
                A[i][j] = sc.nextInt();
                
        if (!sc.hasNextInt()) return;
        int n2 = sc.nextInt();
        int p = sc.nextInt();
        int[][] B = new int[n2][p];
        for (int i = 0; i < n2; i++)
            for (int j = 0; j < p; j++)
                B[i][j] = sc.nextInt();
                
        int[][] C = new int[m][p];
        for (int i = 0; i < m; i++) {
            for (int j = 0; j < p; j++) {
                for (int k = 0; k < n; k++) {
                    C[i][j] += A[i][k] * B[k][j];
                }
            }
        }
        
        for (int i = 0; i < m; i++) {
            for (int j = 0; j < p; j++) {
                System.out.print(C[i][j]);
                if (j < p - 1) System.out.print(" ");
            }
            System.out.println();
        }
    }
}`,
    python: `import sys
def solve():
    input_data = sys.stdin.read().split()
    if not input_data: return
    idx = 0
    m = int(input_data[idx]); idx += 1
    n = int(input_data[idx]); idx += 1
    A = []
    for _ in range(m):
        row = []
        for _ in range(n):
            row.append(int(input_data[idx]))
            idx += 1
        A.append(row)
        
    n2 = int(input_data[idx]); idx += 1
    p = int(input_data[idx]); idx += 1
    B = []
    for _ in range(n2):
        row = []
        for _ in range(p):
            row.append(int(input_data[idx]))
            idx += 1
        B.append(row)
        
    C = [[0] * p for _ in range(m)]
    for i in range(m):
        for j in range(p):
            for k in range(n):
                C[i][j] += A[i][k] * B[k][j]
                
    for row in C:
        print(*(row))
if __name__ == '__main__':
    solve()`,
    c: `#include <stdio.h>
#include <stdlib.h>
int main() {
    int m, n;
    if (scanf("%d %d", &m, &n) != 2) return 0;
    int **A = (int**)malloc(m * sizeof(int*));
    for (int i = 0; i < m; i++) {
        A[i] = (int*)malloc(n * sizeof(int));
        for (int j = 0; j < n; j++) {
            scanf("%d", &A[i][j]);
        }
    }
    
    int n2, p;
    if (scanf("%d %d", &n2, &p) != 2) return 0;
    int **B = (int**)malloc(n2 * sizeof(int*));
    for (int i = 0; i < n2; i++) {
        B[i] = (int*)malloc(p * sizeof(int));
        for (int j = 0; j < p; j++) {
            scanf("%d", &B[i][j]);
        }
    }
    
    int **C = (int**)malloc(m * sizeof(int*));
    for (int i = 0; i < m; i++) {
        C[i] = (int*)calloc(p, sizeof(int));
        for (int j = 0; j < p; j++) {
            for (int k = 0; k < n; k++) {
                C[i][j] += A[i][k] * B[k][j];
            }
        }
    }
    
    for (int i = 0; i < m; i++) {
        for (int j = 0; j < p; j++) {
            printf("%d", C[i][j]);
            if (j < p - 1) printf(" ");
        }
        printf("\\n");
    }
    return 0;
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
        const allPassed = result.results.every(tc => tc.status === 'AC');
        if (allPassed) {
          console.log(`${probId} in ${lang}: SUCCESS`);
        } else {
          console.log(`${probId} in ${lang}: FAILED`);
          console.log(JSON.stringify(result.results, null, 2));
        }
      } catch (err) {
        console.error(`Error running ${probId} in ${lang}:`, err);
      }
    }
  }
}
runAll();
