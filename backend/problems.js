module.exports = {
  mergeSort: {
    id: 'mergeSort',
    title: 'Merge Two Sorted Arrays',
    type: 'stdio',
    marks: 15,
    starterCode: `class Solution {\n    public int[] mergeArrays(int[] arr1, int[] arr2) {\n        // write your code here\n        return new int[0];\n    }\n}`,
    starterCodePython: `class Solution:\n    def mergeArrays(self, arr1, arr2):\n        # write your code here\n        pass\n`,
    starterCodeC: `int* mergeArrays(int* arr1, int size1, int* arr2, int size2, int* retSize) {\n    // write your code here\n    *retSize = 0;\n    return NULL;\n}`,
    wrapperCodeJava: `
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n1 = sc.nextInt();
        int[] arr1 = new int[n1];
        for(int i=0; i<n1; i++) arr1[i] = sc.nextInt();
        
        int n2 = sc.nextInt();
        int[] arr2 = new int[n2];
        for(int i=0; i<n2; i++) arr2[i] = sc.nextInt();
        
        Solution sol = new Solution();
        int[] res = sol.mergeArrays(arr1, arr2);
        for(int i=0; i<res.length; i++) {
            System.out.print(res[i] + (i == res.length - 1 ? "" : " "));
        }
        System.out.println();
    }
}
`,
    wrapperCodePython: `
def main():
    import sys
    input_data = sys.stdin.read().split()
    if not input_data: return
    n1 = int(input_data[0])
    arr1 = [int(x) for x in input_data[1:n1+1]]
    idx = n1 + 1
    n2 = int(input_data[idx])
    arr2 = [int(x) for x in input_data[idx+1:idx+1+n2]]
    
    sol = Solution()
    res = sol.mergeArrays(arr1, arr2)
    print(" ".join(map(str, res)))

if __name__ == '__main__':
    main()
`,
    wrapperCodeC: `
int main() {
    int n1;
    if (scanf("%d", &n1) != 1) return 0;
    int* arr1 = (int*)malloc(n1 * sizeof(int));
    for (int i=0; i<n1; i++) scanf("%d", &arr1[i]);
    
    int n2;
    if (scanf("%d", &n2) != 1) return 0;
    int* arr2 = (int*)malloc(n2 * sizeof(int));
    for (int i=0; i<n2; i++) scanf("%d", &arr2[i]);
    
    int retSize = 0;
    int* res = mergeArrays(arr1, n1, arr2, n2, &retSize);
    for (int i=0; i<retSize; i++) {
        printf("%d%s", res[i], i == retSize - 1 ? "" : " ");
    }
    printf("\\n");
    return 0;
}
`,
    testCases: [
      { input: "4\n1 3 5 7\n3\n2 4 6\n", expected: "1 2 3 4 5 6 7", isHidden: false },
      { input: "1\n1\n0\n\n", expected: "1", isHidden: false },
      { input: "0\n\n1\n1\n", expected: "1", isHidden: false },
      { input: "3\n4 5 6\n3\n1 2 3\n", expected: "1 2 3 4 5 6", isHidden: true },
      { input: "0\n\n4\n1 2 3 4\n", expected: "1 2 3 4", isHidden: true }
    ]
  },
  binarySearch: {
    id: 'binarySearch',
    title: 'Binary Search',
    type: 'stdio',
    marks: 15,
    starterCode: `class Solution {\n    public int search(int[] nums, int target) {\n        // write your code here\n        return -1;\n    }\n}`,
    starterCodePython: `class Solution:\n    def search(self, nums, target):\n        # write your code here\n        pass\n`,
    starterCodeC: `int search(int* nums, int size, int target) {\n    // write your code here\n    return -1;\n}`,
    wrapperCodeJava: `
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[] nums = new int[n];
        for(int i=0; i<n; i++) nums[i] = sc.nextInt();
        int target = sc.nextInt();
        
        Solution sol = new Solution();
        int res = sol.search(nums, target);
        System.out.println(res);
    }
}
`,
    wrapperCodePython: `
def main():
    import sys
    input_data = sys.stdin.read().split()
    if not input_data: return
    n = int(input_data[0])
    nums = [int(x) for x in input_data[1:n+1]]
    target = int(input_data[n+1])
    
    sol = Solution()
    res = sol.search(nums, target)
    print(res)

if __name__ == '__main__':
    main()
`,
    wrapperCodeC: `
int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    int* nums = (int*)malloc(n * sizeof(int));
    for (int i=0; i<n; i++) scanf("%d", &nums[i]);
    int target;
    scanf("%d", &target);
    
    int res = search(nums, n, target);
    printf("%d\\n", res);
    return 0;
}
`,
    testCases: [
      { input: "6\n1 3 5 7 9 11\n7\n", expected: "3", isHidden: false },
      { input: "4\n2 4 6 8\n5\n", expected: "-1", isHidden: false },
      { input: "1\n10\n10\n", expected: "0", isHidden: false },
      { input: "0\n\n1\n", expected: "-1", isHidden: true },
      { input: "5\n1 2 3 4 5\n1\n", expected: "0", isHidden: true }
    ]
  },
  matrixMult: {
    id: 'matrixMult',
    title: 'Matrix Multiplication',
    type: 'stdio',
    marks: 15,
    starterCode: `class Solution {\n    public int[][] multiply(int[][] mat1, int[][] mat2) {\n        // write your code here\n        return new int[0][0];\n    }\n}`,
    starterCodePython: `class Solution:\n    def multiply(self, mat1, mat2):\n        # write your code here\n        pass\n`,
    starterCodeC: `int** multiply(int** mat1, int r1, int c1, int** mat2, int r2, int c2, int* retR, int** retC) {\n    // write your code here\n    *retR = 0;\n    *retC = NULL;\n    return NULL;\n}`,
    wrapperCodeJava: `
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int r1 = sc.nextInt();
        int c1 = sc.nextInt();
        int[][] mat1 = new int[r1][c1];
        for(int i=0; i<r1; i++)
            for(int j=0; j<c1; j++)
                mat1[i][j] = sc.nextInt();
                
        int r2 = sc.nextInt();
        int c2 = sc.nextInt();
        int[][] mat2 = new int[r2][c2];
        for(int i=0; i<r2; i++)
            for(int j=0; j<c2; j++)
                mat2[i][j] = sc.nextInt();
        
        Solution sol = new Solution();
        int[][] res = sol.multiply(mat1, mat2);
        for(int i=0; i<res.length; i++) {
            for(int j=0; j<res[i].length; j++) {
                System.out.print(res[i][j] + (j == res[i].length - 1 ? "" : " "));
            }
            System.out.println();
        }
    }
}
`,
    wrapperCodePython: `
def main():
    import sys
    input_data = sys.stdin.read().split()
    if not input_data: return
    idx = 0
    r1 = int(input_data[idx])
    c1 = int(input_data[idx+1])
    idx += 2
    mat1 = []
    for _ in range(r1):
        mat1.append([int(x) for x in input_data[idx:idx+c1]])
        idx += c1
    
    r2 = int(input_data[idx])
    c2 = int(input_data[idx+1])
    idx += 2
    mat2 = []
    for _ in range(r2):
        mat2.append([int(x) for x in input_data[idx:idx+c2]])
        idx += c2
        
    sol = Solution()
    res = sol.multiply(mat1, mat2)
    for row in res:
        print(" ".join(map(str, row)))

if __name__ == '__main__':
    main()
`,
    wrapperCodeC: `
int main() {
    int r1, c1;
    if (scanf("%d %d", &r1, &c1) != 2) return 0;
    int** mat1 = (int**)malloc(r1 * sizeof(int*));
    for (int i=0; i<r1; i++) {
        mat1[i] = (int*)malloc(c1 * sizeof(int));
        for (int j=0; j<c1; j++) scanf("%d", &mat1[i][j]);
    }
    
    int r2, c2;
    if (scanf("%d %d", &r2, &c2) != 2) return 0;
    int** mat2 = (int**)malloc(r2 * sizeof(int*));
    for (int i=0; i<r2; i++) {
        mat2[i] = (int*)malloc(c2 * sizeof(int));
        for (int j=0; j<c2; j++) scanf("%d", &mat2[i][j]);
    }
    
    int retR = 0;
    int* retC = NULL;
    int** res = multiply(mat1, r1, c1, mat2, r2, c2, &retR, &retC);
    
    for (int i=0; i<retR; i++) {
        for (int j=0; j<retC[i]; j++) {
            printf("%d%s", res[i][j], j == retC[i] - 1 ? "" : " ");
        }
        printf("\\n");
    }
    return 0;
}
`,
    testCases: [
      { input: "2 2\n1 2\n3 4\n2 2\n2 0\n1 2\n", expected: "4 4\n10 8", isHidden: false },
      { input: "1 3\n1 2 3\n3 1\n1\n2\n3\n", expected: "14", isHidden: false },
      { input: "2 2\n1 0\n0 1\n2 2\n5 6\n7 8\n", expected: "5 6\n7 8", isHidden: true }
    ]
  }
};
