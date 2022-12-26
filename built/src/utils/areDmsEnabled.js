import User from '../struct/User.js';
/**
 * check db to see whether user has review dms enabled or not
 */
async function areDmsEnabled(userId) {
    const userData = await User.findOne({ id: userId }).lean();
    // new users automatically have dms enabled
    if (!userData || userData.dm == true) {
        return true;
    }
    else {
        return false;
    }
}
export default areDmsEnabled;
