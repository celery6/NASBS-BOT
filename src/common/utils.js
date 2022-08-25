const { Message } = require('discord.js')

/**
 * Basically the Array.some() function, except its async
 * @param {Array<any> | Set<any> | Iterator<any>} collection - a collection of values
 * @param {(element: any) => Promise<boolean>} predicate - the function to test on each element in the collection
 * @returns true if predicate(element) is true for some element in the collection and false otherwise
 */
async function asyncSome(collection, predicate) {
  for (let element of collection) {
    result = await predicate(element)
    if (result) {
      return true
    }
  }
  return false
}

/**
 * Check whether a submission has been accepted
 * @param {Message} submissionMsg - The message/post containing the user's submission
 * @returns true if the submission has been accepted (the bot has reacted with '✅') and false otherwise
 */
async function checkIfAccepted(submissionMsg) {
  const reactionCache = submissionMsg.reactions.cache.values()
  return asyncSome(reactionCache, async (reaction) => {
    const updatedReaction = await reaction.fetch()
    return updatedReaction?.emoji?.name === '✅' && updatedReaction?.me
  })
}

/**
 * Check whether a submission has been rejected
 * @param {Message} submissionMsg - The message/post containing the user's submission
 * @returns true if the submission has been rejected (the bot has reacted with '❌') and false otherwise
 */
async function checkIfRejected(submissionMsg) {
  const reactionCache = submissionMsg.reactions.cache.values()
  return asyncSome(reactionCache, async (reaction) => {
    const updatedReaction = await reaction.fetch()
    return updatedReaction?.emoji?.name === '❌' && updatedReaction?.me
  })
}

module.exports = { asyncSome, checkIfAccepted, checkIfRejected }
