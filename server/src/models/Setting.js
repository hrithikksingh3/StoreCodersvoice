const mongoose = require('mongoose');
const settingSchema = new mongoose.Schema({
  key: { type: String, default: 'store', unique: true },
  storeName: { type: String, default: 'CodersVoice Store', maxlength: 100 },
  currency: { type: String, default: 'INR', enum: ['INR'] },
  defaultAuthor: { type: String, default: 'CodersVoice', maxlength: 100 },
  siteTitle: { type: String, default: 'CodersVoice Store', maxlength: 100 },
  defaultDescription: { type: String, default: 'Premium digital products for builders.', maxlength: 170 },
  defaultOgImage: String
}, { timestamps: true });
module.exports = mongoose.model('Setting', settingSchema);
