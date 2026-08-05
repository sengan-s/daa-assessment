module.exports = {
  mergeSort: {
    id: 'mergeSort',
    title: 'Merge Two Sorted Arrays',
    type: 'stdio',
    marks: 15,
    starterCode: `import java.util.*;

class Main {
    public static void main(String[] args) {
        // write your code here
    }
}`,
    starterCodePython: `# write your code here
`,
    starterCodeC: `#include <stdio.h>

int main() {
    // write your code here
    return 0;
}`,
    testCases: [
      { input: "4\n1 3 5 7\n3\n2 4 6\n", expected: "1 2 3 4 5 6 7", isHidden: false },
      { input: "1\n1\n0\n\n", expected: "1", isHidden: false },
      { input: "0\n\n1\n1\n", expected: "1", isHidden: false },
      { input: "3\n4 5 6\n3\n1 2 3\n", expected: "1 2 3 4 5 6", isHidden: true },
      { input: "0\n\n4\n1 2 3 4\n", expected: "1 2 3 4", isHidden: true }
    ],
    generateMain: () => "",
    generateMainPython: () => "",
    generateMainC: () => ""
  },
  binarySearch: {
    id: 'binarySearch',
    title: 'Binary Search',
    marks: 15,
    starterCode: `class Solution {
    public static int binarySearch(int[] arr, int target) {
        // candidate writes code here
        return -1;
    }
}`,
    starterCodePython: `class Solution:
    def binarySearch(self, arr, target):
        # candidate writes code here
        return -1`,
    starterCodeC: `int binarySearch(int* arr, int arrSize, int target) {
    // candidate writes code here
    return -1;
}`,
    testCases: [
      { input: { arr: [1,3,5,7,9,11], target: 7 }, expected: "3", isHidden: false },
      { input: { arr: [2,4,6,8], target: 5 }, expected: "-1", isHidden: false },
      { input: { arr: [10], target: 10 }, expected: "0", isHidden: false },
      { input: { arr: [], target: 1 }, expected: "-1", isHidden: true },
      { input: { arr: [1,2,3,4,5], target: 1 }, expected: "0", isHidden: true }
    ],
    generateMain: (solutionCode, allTestCases) => {
      let mainBlocks = allTestCases.map((tc, i) => {
        const { arr, target } = tc.input;
        return `        if (tcIndex == ${i}) {
            int[] arr = ${JSON.stringify(arr).replace(/\[/g, '{').replace(/\]/g, '}')};
            int target = ${target};
            int result = Solution.binarySearch(arr, target);
            System.out.print(result);
            return;
        }`;
      }).join('\n');

      return `${solutionCode}

public class Main {
    public static void main(String[] args) {
        int tcIndex = Integer.parseInt(args[0]);
${mainBlocks}
    }
}`;
    },
    generateMainPython: (solutionCode, allTestCases) => {
      let mainBlocks = allTestCases.map((tc, i) => {
        const { arr, target } = tc.input;
        return `    if tc_index == ${i}:
        arr = json.loads('${JSON.stringify(arr)}')
        target = ${target}
        result = sol.binarySearch(arr, target)
        print(result)`;
      }).join('\n');

      return `import json
import sys

${solutionCode}

if __name__ == '__main__':
    tc_index = int(sys.argv[1])
    sol = Solution()
${mainBlocks}
`;
    },
    generateMainC: (solutionCode, allTestCases) => {
      let mainBlocks = allTestCases.map((tc, i) => {
        const { arr, target } = tc.input;
        const cArr = arr.length ? arr.join(',') : '0';
        return `    if (tcIndex == ${i}) {
        int arr[${arr.length || 1}] = {${cArr}};
        int target = ${target};
        int result = binarySearch(arr, ${arr.length}, target);
        printf("%d", result);
        return 0;
    }`;
      }).join('\n');

      return `#include <stdio.h>
#include <stdlib.h>

${solutionCode}

int main(int argc, char *argv[]) {
    if (argc < 2) return 1;
    int tcIndex = atoi(argv[1]);
${mainBlocks}
    return 0;
}`;
    }
  },
  matrixMult: {
    id: 'matrixMult',
    title: 'Matrix Multiplication',
    marks: 20,
    starterCode: `class Solution {
    public static int[][] multiply(int[][] A, int[][] B) {
        // candidate writes code here
        return new int[0][0];
    }
}`,
    starterCodePython: `class Solution:
    def multiply(self, A, B):
        # candidate writes code here
        return []`,
    starterCodeC: `int* multiply(int* A, int A_rows, int A_cols, int* B, int B_rows, int B_cols, int* out_rows, int* out_cols) {
    // candidate writes code here - return a flattened 1D array representing the 2D output matrix
    *out_rows = 0;
    *out_cols = 0;
    return NULL;
}`,
    testCases: [
      { input: { A: [[1,2],[3,4]], B: [[2,0],[1,2]] }, expected: "[[4,4],[10,8]]", isHidden: false },
      { input: { A: [[1,2,3]], B: [[1],[2],[3]] }, expected: "[[14]]", isHidden: false },
      { input: { A: [[1,0],[0,1]], B: [[5,6],[7,8]] }, expected: "[[5,6],[7,8]]", isHidden: true }
    ],
    generateMain: (solutionCode, allTestCases) => {
      const formatMatrix = (m) => m.length === 0 ? '{}' : '{' + m.map(row => '{' + row.join(',') + '}').join(',') + '}';
      let mainBlocks = allTestCases.map((tc, i) => {
        const { A, B } = tc.input;
        return `        if (tcIndex == ${i}) {
            int[][] A = ${formatMatrix(A)};
            int[][] B = ${formatMatrix(B)};
            int[][] result = Solution.multiply(A, B);
            String out = java.util.Arrays.deepToString(result).replaceAll(" ", "");
            System.out.print(out);
            return;
        }`;
      }).join('\n');

      return `import java.util.Arrays;
${solutionCode}

public class Main {
    public static void main(String[] args) {
        int tcIndex = Integer.parseInt(args[0]);
${mainBlocks}
    }
}`;
    },
    generateMainPython: (solutionCode, allTestCases) => {
      let mainBlocks = allTestCases.map((tc, i) => {
        const { A, B } = tc.input;
        return `    if tc_index == ${i}:
        A = json.loads('${JSON.stringify(A)}')
        B = json.loads('${JSON.stringify(B)}')
        result = sol.multiply(A, B)
        print(json.dumps(result).replace(" ", ""))`;
      }).join('\n');

      return `import json
import sys

${solutionCode}

if __name__ == '__main__':
    tc_index = int(sys.argv[1])
    sol = Solution()
${mainBlocks}
`;
    },
    generateMainC: (solutionCode, allTestCases) => {
      let mainBlocks = allTestCases.map((tc, i) => {
        const { A, B } = tc.input;
        const flatA = A.flat();
        const flatB = B.flat();
        return `    if (tcIndex == ${i}) {
        int A[] = {${flatA.join(',')}};
        int A_rows = ${A.length};
        int A_cols = ${A[0] ? A[0].length : 0};
        
        int B[] = {${flatB.join(',')}};
        int B_rows = ${B.length};
        int B_cols = ${B[0] ? B[0].length : 0};
        
        int out_rows, out_cols;
        int* result = multiply(A, A_rows, A_cols, B, B_rows, B_cols, &out_rows, &out_cols);
        
        printf("[");
        for (int r = 0; r < out_rows; r++) {
            printf("[");
            for (int c = 0; c < out_cols; c++) {
                printf("%d", result[r * out_cols + c]);
                if (c < out_cols - 1) printf(",");
            }
            printf("]");
            if (r < out_rows - 1) printf(",");
        }
        printf("]");
        if (result != NULL) free(result);
        return 0;
    }`;
      }).join('\n');

      return `#include <stdio.h>
#include <stdlib.h>

${solutionCode}

int main(int argc, char *argv[]) {
    if (argc < 2) return 1;
    int tcIndex = atoi(argv[1]);
${mainBlocks}
    return 0;
}`;
    }
  }
};
