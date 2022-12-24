const mongoose = require('mongoose')

const Submission = mongoose.model(
  'Submission',
  new mongoose.Schema({
    _id: {
      type: String,
      required: true,
      minlength: 18,
    },
    guildId: String,
    submissionType: String,
    userId: String,
    pointsTotal: Number,
    collaborators: String,
    bonus: String,
    edit: Boolean,
    size: Number,
    quality: Number,
    sqm: Number,
    complexity: Number,
    smallAmt: Number,
    mediumAmt: Number,
    largeAmt: Number,
    roadType: Number,
    roadKMs: Number,
    submissionTime: Number,
    reviewTime: Number,
    reviewer: String,
    feedback: { type: String, maxlength: 1700 },
  }),
)

module.exports = Submission
