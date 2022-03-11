const mongoose = require('mongoose')

const Submission = mongoose.model(
  'Submission',
  new mongoose.Schema({
    msgId: String,
    pointsTotal: Number,
    userId: String,
    submissionType: String,
    collaboration: String,
    bonus: String,
    edit: Boolean,
    size: Number,
    quality: Number,
    incompletion: Number,
    sqm: Number,
    complexity: Number,
    smallAmt: Number,
    mediumAmt: Number,
    largeAmt: Number,
    totalCount: Number,
    roadType: Number,
    roadKMs: Number,
  }),
)

module.exports = Submission
