import { calculateScore } from './src/logic/scoring.js';

const testCases = [
    { input: [false, false, false], expected: 0 },
    { input: [true, false, false], expected: 1 },
    { input: [false, true, false], expected: 2 },
    { input: [true, true, false], expected: 3 },
    { input: [false, false, true], expected: 4 },
    { input: [true, false, true], expected: 5 },
    { input: [false, true, true], expected: 6 },
    { input: [true, true, true], expected: 7 },
];

let failed = 0;
testCases.forEach((test, idx) => {
    const result = calculateScore(test.input);
    if (result !== test.expected) {
        console.error(`Test ${idx} FAILED: Expected ${test.expected}, got ${result}`);
        failed++;
    } else {
        console.log(`Test ${idx} PASSED: ${test.input} => ${result}`);
    }
});

if (failed === 0) console.log("ALL TESTS PASSED ✨");
else console.log(`${failed} TESTS FAILED ❌`);
