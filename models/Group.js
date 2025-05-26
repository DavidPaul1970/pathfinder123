const mongoose = require('mongoose');
const slugify = require('slugify');

const groupSchema = new mongoose.Schema({
  image: String,
  name: { type: String, required: true },
  description: String,
  link: { type: String, required: true },
  target: String,
  subscribersCount: { type: Number, default: 83001 },
  slug: { type: String, unique: true, lowercase: true }
});

// قبل الحفظ، نولّد السلق تلقائياً بناءً على الاسم
groupSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true, strict: true });
  next();
});

module.exports = mongoose.model('Group', groupSchema);