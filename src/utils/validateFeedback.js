/**
 * Ensure submission feedback is 1700 or fewer characters and slice it if not
 * @param {string} feedback
 * @returns {string}
 */
function validateFeedback(feedback) {
  if (feedback.length <= 1700) {
    return feedback
  } else {
    return feedback.slice(0, 1699)
  }
}

module.exports = validateFeedback
