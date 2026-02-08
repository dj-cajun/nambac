/**
 * Range-based Scoring Logic (5 Questions, Max Score 5)
 * 
 * Each question adds +1 to the score.
 * Q1 to Q5: Each question adds 0 or 1.
 * 
 * Result Range: 0 to 5 (6 unique results)
 * 
 * @param {boolean[]} answers - Array of 5 booleans (true when Option B is selected)
 */
export const calculateScore = (answers, questions) => {
    if (!answers || !questions || answers.length === 0) {
        console.warn("Invalid inputs for scoring", { answers, questions });
        return 0;
    }

    let rawScore = 0;

    answers.forEach((isOptionBSelected, index) => {
        const question = questions[index];
        if (question) {
            if (isOptionBSelected) {
                rawScore += (question.score_b || 0);
            } else {
                rawScore += (question.score_a || 0); // Usually 0
            }
        }
    });

    // 3-Bit Binary Logic (4-2-1-0-0) results in 0-7 range.
    // This maps directly to result indices 0-7.
    return rawScore;
};
