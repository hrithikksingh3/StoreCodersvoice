const mongoose = require('mongoose');

const url = {
  type: String,
  trim: true,
  validate: { validator: (value) => !value || /^https?:\/\//i.test(value), message: 'URL must use http or https' }
};

const productSchema = new mongoose.Schema({
  name: { type: String, trim: true, maxlength: 160 },
  slug: { type: String, trim: true, lowercase: true, unique: true, sparse: true, maxlength: 180, match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/ },
  shortDescription: { type: String, trim: true, maxlength: 320 },
  description: { type: String, trim: true, maxlength: 20000 },
  price: { type: Number, min: 0 },
  currency: { type: String, default: 'INR', enum: ['INR'] },
  category: { type: String, trim: true, maxlength: 80, index: true },
  tags: [{ type: String, trim: true, maxlength: 50 }],
  techStack: [{ type: String, trim: true, maxlength: 50 }],
  thumbnail: url,
  galleryImages: [url],
  demoUrl: url,
  downloadUrl: url,
  featured: { type: Boolean, default: false, index: true },
  sortOrder: { type: Number, default: 0 },
  status: { type: String, enum: ['draft', 'published', 'hidden', 'archived'], default: 'hidden', index: true },
  seoTitle: { type: String, trim: true, maxlength: 70 },
  seoDescription: { type: String, trim: true, maxlength: 170 },
  canonicalUrl: url,
  ogTitle: { type: String, trim: true, maxlength: 95 },
  ogDescription: { type: String, trim: true, maxlength: 200 },
  ogImage: url,
  publishedAt: Date
}, { timestamps: true });

productSchema.index({ status: 1, category: 1, createdAt: -1 });
productSchema.index({ status: 1, featured: -1, sortOrder: -1 });

module.exports = mongoose.model('Product', productSchema);
