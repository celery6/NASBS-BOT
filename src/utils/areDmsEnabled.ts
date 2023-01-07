import User from '../struct/User.js'

/**
 * check db to see whether user has review dms enabled or not
 */
async function areDmsEnabled(userId: string) {
  const userData = await User.findOne({ id: userId }).lean()
  // userData.dm is blank by default, so check if its explicitly set false. otherwise its true
  if (userData.dm == false) {
    return false
  } else {
    return true
  }
}

export default areDmsEnabled
