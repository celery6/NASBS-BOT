/**
 * Ensure submission feedback is 1700 or fewer characters and slice it if not
 */
function validateFeedback(feedback) {
  if (feedback.length <= 1000) {
    return feedback
  } else {
    return feedback.slice(0, 999)
  }
}

export default validateFeedback
