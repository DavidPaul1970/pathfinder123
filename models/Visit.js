const mongoose = require('mongoose');

const visitSchema = new mongoose.Schema({
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
  latitude: Number,
  longitude: Number,
  position: String,
  visitedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Visit', visitSchema);
