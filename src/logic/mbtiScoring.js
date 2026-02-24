/**
 * MBTI Scoring Logic (12 Questions, 4 Dimensions)
 * 
 * Dimensions: E/I, S/N, T/F, J/P
 * Each dimension has 3 questions
 * Result: 16 possible MBTI types (e.g., "ENFP", "ISTJ")
 * 
 * Questions should have dimension field: "EI", "SN", "TF", "JP"
 * score_a/score_b maps to the first/second letter of the dimension
 * e.g., dimension "EI": option_a → E, option_b → I
 */

export const calculateMBTI = (answers, questions) => {
    if (!answers || !questions || answers.length === 0) {
        return "ENFP"; // Default fallback
    }

    const counts = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };

    answers.forEach((isOptionBSelected, index) => {
        const question = questions[index];
        if (!question || !question.dimension) return;

        const dim = question.dimension; // "EI", "SN", "TF", "JP"
        const letter1 = dim[0]; // E, S, T, J
        const letter2 = dim[1]; // I, N, F, P

        if (isOptionBSelected) {
            counts[letter2]++;
        } else {
            counts[letter1]++;
        }
    });

    // Build MBTI string
    const mbti =
        (counts.E >= counts.I ? "E" : "I") +
        (counts.S >= counts.N ? "S" : "N") +
        (counts.T >= counts.F ? "T" : "F") +
        (counts.J >= counts.P ? "J" : "P");

    return mbti;
};

/**
 * Name Hash Scoring (for name_input type)
 * Converts a name string into a deterministic result index
 */
export const calculateNameScore = (name, resultCount) => {
    if (!name || resultCount <= 0) return 0;

    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        const char = name.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }

    // Add date seed for daily variation
    const today = new Date();
    const dateSeed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    hash = Math.abs(hash + dateSeed);

    return hash % resultCount;
};
