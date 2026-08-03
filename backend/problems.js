module.exports = {
  mergeSort: {
    id: 'mergeSort',
    title: 'Merge Sorted Array',
    marks: 15,
    starterCode: `class Solution {
    public static void merge(int[] nums1, int m, int[] nums2, int n) {
        // candidate writes code here — modify nums1 in place, don't return anything
    }
}`,
    starterCodePython: `class Solution:
    def merge(self, nums1, m, nums2, n):
        # candidate writes code here — modify nums1 in place, don't return anything
        pass`,
    starterCodeC: `void merge(int* nums1, int nums1Size, int m, int* nums2, int nums2Size, int n) {
    // candidate writes code here
}`,
    testCases: [
      { input: { nums1: [1,2,3,0,0,0], m: 3, nums2: [2,5,6], n: 3 }, expected: "[1,2,2,3,5,6]", isHidden: false },
      { input: { nums1: [1], m: 1, nums2: [], n: 0 }, expected: "[1]", isHidden: false },
      { input: { nums1: [0], m: 0, nums2: [1], n: 1 }, expected: "[1]", isHidden: false },
      { input: { nums1: [4,5,6,0,0,0], m: 3, nums2: [1,2,3], n: 3 }, expected: "[1,2,3,4,5,6]", isHidden: true },
      { input: { nums1: [0,0,0,0], m: 0, nums2: [1,2,3,4], n: 4 }, expected: "[1,2,3,4]", isHidden: true }
    ],
    // Function to generate the wrapper Main.java for this problem
    generateMain: (solutionCode, testCase) => {
      const { nums1, m, nums2, n } = testCase.input;
      return `
import java.util.Arrays;
${solutionCode}

public class Main {
    public static void main(String[] args) {
        int[] nums1 = ${JSON.stringify(nums1).replace(/\[/g, '{').replace(/\]/g, '}')};
        int m = ${m};
        int[] nums2 = ${JSON.stringify(nums2).replace(/\[/g, '{').replace(/\]/g, '}')};
        int n = ${n};
        Solution.merge(nums1, m, nums2, n);
        
        // Remove spaces after commas to match the expected format exactly
        System.out.print(Arrays.toString(nums1).replaceAll(" ", ""));
    }
}
`;
    },
    generateMainPython: (solutionCode, testCase) => {
      const { nums1, m, nums2, n } = testCase.input;
      return `
import json

${solutionCode}

if __name__ == '__main__':
    nums1 = json.loads('${JSON.stringify(nums1)}')
    m = ${m}
    nums2 = json.loads('${JSON.stringify(nums2)}')
    n = ${n}
    Solution().merge(nums1, m, nums2, n)
    print(json.dumps(nums1).replace(" ", ""))
`;
    },
    generateMainC: (solutionCode, testCase) => {
      const { nums1, m, nums2, n } = testCase.input;
      const cNums1 = nums1.length ? nums1.join(',') : '0';
      const cNums2 = nums2.length ? nums2.join(',') : '0';
      return `
#include <stdio.h>
#include <stdlib.h>

${solutionCode}

int main() {
    int nums1[${nums1.length || 1}] = {${cNums1}};
    int m = ${m};
    int nums2[${nums2.length || 1}] = {${cNums2}};
    int n = ${n};
    merge(nums1, ${nums1.length}, m, nums2, ${nums2.length}, n);
    
    printf("[");
    for(int i=0; i<${nums1.length}; i++) {
        printf("%d", nums1[i]);
        if(i < ${nums1.length}-1) printf(",");
    }
    printf("]");
    return 0;
}
`;
    }
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
    generateMain: (solutionCode, testCase) => {
      const { arr, target } = testCase.input;
      return `
${solutionCode}

public class Main {
    public static void main(String[] args) {
        int[] arr = ${JSON.stringify(arr).replace(/\[/g, '{').replace(/\]/g, '}')};
        int target = ${target};
        int result = Solution.binarySearch(arr, target);
        System.out.print(result);
    }
}
`;
    },
    generateMainPython: (solutionCode, testCase) => {
      const { arr, target } = testCase.input;
      return `
import json

${solutionCode}

if __name__ == '__main__':
    arr = json.loads('${JSON.stringify(arr)}')
    target = ${target}
    result = Solution().binarySearch(arr, target)
    print(result)
`;
    },
    generateMainC: (solutionCode, testCase) => {
      const { arr, target } = testCase.input;
      const cArr = arr.length ? arr.join(',') : '0';
      return `
#include <stdio.h>
#include <stdlib.h>

${solutionCode}

int main() {
    int arr[${arr.length || 1}] = {${cArr}};
    int target = ${target};
    int result = binarySearch(arr, ${arr.length}, target);
    printf("%d", result);
    return 0;
}
`;
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
    starterCodeC: `void multiply(int* A, int A_rows, int A_cols, int* B, int B_rows, int B_cols, int* res) {
    // candidate writes code here
}`,
    testCases: [
      { input: { A: [[1,2],[3,4]], B: [[5,6],[7,8]] }, expected: "[[19,22],[43,50]]", isHidden: false },
      { input: { A: [[1,0],[0,1]], B: [[2,3],[4,5]] }, expected: "[[2,3],[4,5]]", isHidden: false },
      { input: { A: [[1,2,3]], B: [[1],[1],[1]] }, expected: "[[6]]", isHidden: false },
      { input: { A: [[2]], B: [[3]] }, expected: "[[6]]", isHidden: true },
      { input: { A: [[1,1],[1,1]], B: [[1,1],[1,1]] }, expected: "[[2,2],[2,2]]", isHidden: true }
    ],
    generateMain: (solutionCode, testCase) => {
      const { A, B } = testCase.input;
      
      const formatMatrix = (matrix) => {
        if (!matrix || matrix.length === 0) return 'new int[0][0]';
        let str = '{';
        for(let i=0; i<matrix.length; i++) {
          str += '{' + matrix[i].join(',') + '}';
          if(i < matrix.length - 1) str += ',';
        }
        str += '}';
        return str;
      };

      return `
import java.util.Arrays;
${solutionCode}

public class Main {
    public static void main(String[] args) {
        int[][] A = ${formatMatrix(A)};
        int[][] B = ${formatMatrix(B)};
        int[][] result = Solution.multiply(A, B);
        
        // Print 2D array without spaces to match expected output format
        String out = Arrays.deepToString(result).replaceAll(" ", "");
        System.out.print(out);
    }
}
`;
    },
    generateMainPython: (solutionCode, testCase) => {
      const { A, B } = testCase.input;
      return `
import json

${solutionCode}

if __name__ == '__main__':
    A = json.loads('${JSON.stringify(A)}')
    B = json.loads('${JSON.stringify(B)}')
    result = Solution().multiply(A, B)
    print(json.dumps(result).replace(" ", ""))
`;
    },
    generateMainC: (solutionCode, testCase) => {
      const { A, B } = testCase.input;
      const flatA = A.flat();
      const flatB = B.flat();
      return `
#include <stdio.h>
#include <stdlib.h>

${solutionCode}

int main() {
    int A[] = {${flatA.join(',')}};
    int A_rows = ${A.length};
    int A_cols = ${A[0].length};
    
    int B[] = {${flatB.join(',')}};
    int B_rows = ${B.length};
    int B_cols = ${B[0].length};
    
    int res[${A.length * B[0].length}];
    
    multiply(A, A_rows, A_cols, B, B_rows, B_cols, res);
    
    printf("[");
    for(int i=0; i<A_rows; i++) {
        printf("[");
        for(int j=0; j<B_cols; j++) {
            printf("%d", res[i * B_cols + j]);
            if(j < B_cols - 1) printf(",");
        }
        printf("]");
        if(i < A_rows - 1) printf(",");
    }
    printf("]");
    return 0;
}
`;
    }
  }
};
