const { evaluateCode } = require('./backend/judge');
const problems = require('./backend/problems');

async function run() {
  const problem = problems['mergeSort'];
  const testCasesToRun = problem.testCases;
  console.time('evaluateCode');
  const res = await evaluateCode(problem, problem.starterCode, 'java', testCasesToRun);
  console.timeEnd('evaluateCode');
  console.log(res);
}

run();
