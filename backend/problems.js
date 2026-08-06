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
    ]
  },
  binarySearch: {
    id: 'binarySearch',
    title: 'Binary Search',
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
      { input: "2 2\n1 2\n3 4\n2 2\n2 0\n1 2\n", expected: "4 4\n10 8", isHidden: false },
      { input: "1 3\n1 2 3\n3 1\n1\n2\n3\n", expected: "14", isHidden: false },
      { input: "2 2\n1 0\n0 1\n2 2\n5 6\n7 8\n", expected: "5 6\n7 8", isHidden: true }
    ]
  }
};
