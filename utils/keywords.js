/**
 * Keywords Configuration
 * Defines tracked keywords for the Brevis community
 */

const TRACKED_KEYWORDS = [
    // Community greetings
    'gbrevis',
    'good morning',

    // Technical terms
    'brevis',
    'zk proof',
    'zkproof',
    'pico prism',
    'proof',
    'coprocessor',

    // Community engagement
    'active',
    'help',
    'tailblazer',
    'how are you',
    'contributor',
    'contribution',
];

/**
 * Get all tracked keywords
 * @returns {Array<string>} List of tracked keywords
 */
function getTrackedKeywords() {
    return TRACKED_KEYWORDS;
}

/**
 * Check if a keyword is tracked
 * @param {string} keyword - Keyword to check
 * @returns {boolean} Whether the keyword is tracked
 */
function isTrackedKeyword(keyword) {
    return TRACKED_KEYWORDS.includes(keyword.toLowerCase());
}

/**
 * Count keyword occurrences in text
 * @param {string} text - Text to search
 * @param {string} keyword - Keyword to count
 * @returns {number} Number of occurrences
 */
function countKeywordInText(text, keyword) {
    const lowerText = text.toLowerCase();
    const lowerKeyword = keyword.toLowerCase();

    // Use regex to match whole words or phrases
    const regex = new RegExp(`\\b${lowerKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    const matches = lowerText.match(regex);

    return matches ? matches.length : 0;
}

/**
 * Get keyword display name (formatted)
 * @param {string} keyword - Raw keyword
 * @returns {string} Formatted keyword
 */
function getKeywordDisplayName(keyword) {
    // Capitalize first letter of each word
    return keyword
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

module.exports = {
    TRACKED_KEYWORDS,
    getTrackedKeywords,
    isTrackedKeyword,
    countKeywordInText,
    getKeywordDisplayName
};
