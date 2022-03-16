const mongoose = require('mongoose')

const User = mongoose.model(
  'User',
  new mongoose.Schema({
    id: String,
    guildId: String,
    dm: Boolean,
    pointsTotal: Number,
    buildingCount: Number,
    roadKMs: Number,
    sqm: Number,
  }),
)

module.exports = User
