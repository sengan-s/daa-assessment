const http = require('http');

const PORT = 3001;

const codePerProblem = {
  mergeSort: `class Solution:\n    def mergeArrays(self, arr1, arr2):\n        return sorted(arr1 + arr2)\n`,
  binarySearch: `class Solution:\n    def search(self, nums, target):\n        import bisect\n        idx = bisect.bisect_left(nums, target)\n        if idx < len(nums) and nums[idx] == target:\n            return idx\n        return -1\n`,
  matrixMult: `class Solution:\n    def multiply(self, mat1, mat2):\n        r1, c1 = len(mat1), len(mat1[0])\n        r2, c2 = len(mat2), len(mat2[0])\n        res = [[0]*c2 for _ in range(r1)]\n        for i in range(r1):\n            for j in range(c2):\n                for k in range(c1):\n                    res[i][j] += mat1[i][k] * mat2[k][j]\n        return res\n`
};

const languagePerProblem = {
  mergeSort: 'python',
  binarySearch: 'python',
  matrixMult: 'python'
};

async function submitForStudent(index) {
  const payload = JSON.stringify({
    rollNo: `TEST-${index.toString().padStart(3, '0')}`,
    name: `Test Student ${index}`,
    codePerProblem,
    languagePerProblem,
    timeTaken: Math.floor(Math.random() * 3000), // Random time
    violations: 0
  });

  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const req = http.request(
      {
        hostname: 'localhost',
        port: PORT,
        path: '/api/submit',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload)
        }
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          const endTime = Date.now();
          resolve({
            index,
            status: res.statusCode,
            timeMs: endTime - startTime,
            data
          });
        });
      }
    );

    req.on('error', (e) => reject(e));
    req.write(payload);
    req.end();
  });
}

async function runLoadTest() {
  const NUM_STUDENTS = 50;
  console.log(`Starting load test for ${NUM_STUDENTS} concurrent submissions...`);
  const startTime = Date.now();

  const promises = [];
  for (let i = 1; i <= NUM_STUDENTS; i++) {
    promises.push(
      submitForStudent(i)
        .then(res => {
          console.log(`Student ${res.index} finished in ${res.timeMs}ms (Status: ${res.status})`);
          return res;
        })
        .catch(err => {
          console.error(`Student ${i} failed:`, err.message);
          return null;
        })
    );
  }

  const results = await Promise.all(promises);
  
  const endTime = Date.now();
  const successful = results.filter(r => r && r.status === 200).length;
  
  console.log('\n--- Load Test Results ---');
  console.log(`Total Time Taken: ${(endTime - startTime) / 1000} seconds`);
  console.log(`Successful Submissions: ${successful}/${NUM_STUDENTS}`);
  console.log(`Failed Submissions: ${NUM_STUDENTS - successful}/${NUM_STUDENTS}`);
}

runLoadTest();
