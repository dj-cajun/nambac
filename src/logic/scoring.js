/**
 * 3-bit Binary Scoring Logic (5 Questions total)
 * 
 * Q1: Weight 4 (Bit 2: 100)
 * Q2: Weight 2 (Bit 1: 010)
 * Q3: Weight 1 (Bit 0: 001)
 * Q4, Q5: Weight 0
 * 
 * Result Range: 0 to 7 (8 unique results)
 * 
 * @param {boolean[]} answers - Array of 5 booleans (true when Option B is selected)
 * @param {object[]} questions - Array of question objects with scores
 */
export const calculateScore = (answers, questions) => {
    if (!answers || !questions || answers.length === 0) {
        console.warn("Invalid inputs for scoring", { answers, questions });
        return 0;
    }

    let rawScore = 0;

    // Use the scores directly from the question objects (which are now forced to 4, 2, 1, 0, 0)
    answers.forEach((isOptionBSelected, index) => {
        const question = questions[index];
        if (question) {
            if (isOptionBSelected) {
                rawScore += (question.score_b || 0);
            } else {
                rawScore += (question.score_a || 0);
            }
        }
    });

    return rawScore;
};
