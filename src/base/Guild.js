const mongoose = require('mongoose')

const Guild = mongoose.model(
  'Guild',
  new mongoose.Schema({
    id: String,
    submitChannel: String,
    reviewerRole: String,
    ranks: {
      level1: String,
      level2: String,
      level3: String,
      level4: String,
    },
  }),
)

module.exports = Guild
