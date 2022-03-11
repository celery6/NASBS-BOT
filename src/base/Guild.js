const mongoose = require('mongoose')

const Guild = mongoose.model(
  'Guild',
  new mongoose.Schema({
    id: String,
    submitChannel: String,
    eventSubmitChannel: String,
    reviewChannel: String,
    reviewerRole: String,
  }),
)

module.exports = Guild
