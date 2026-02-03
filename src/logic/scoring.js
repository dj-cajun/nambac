/**
 * 3-bit Binary Scoring Logic
 * 
 * Each question represents a bit in a 3-bit binary number.
 * Q1: 2^0 = 1
 * Q2: 2^1 = 2
 * Q3: 2^2 = 4
 * 
 * Yes (1) adds the weight to the score.
 * No (0) adds 0.
 * 
 * Result Range: 0 to 7
 * 
 * @param {boolean[]} answers - Array of 3 booleans (true for Yes/Option A, false for No/Option B)
 * NOTE: The prompt says "Option A" is +weight. Let's clarify based on standard A/B.
 * Usually A=Yes, B=No. Or specific mapping. 
 * The instruction says:
 * "1번 질문 '예' 선택 시: +1점"
 * Assuming the UI passes [isYes, isYes, isYes].
 */
export const calculateScore = (answers) => {
    if (!answers || answers.length !== 3) {
        console.warn("Invalid answers array for 3-bit logic", answers);
        return 0; // Default to 0
    }

    let score = 0;

    // Q1 (Index 0) -> Weight 1
    if (answers[0]) score += 1;

    // Q2 (Index 1) -> Weight 2
    if (answers[1]) score += 2;

    // Q3 (Index 2) -> Weight 4
    if (answers[2]) score += 4;

    return score;
};
