const mongoose = require('mongoose');
const sanitizeHtml = require('sanitize-html');

const cleanHtml = (value) => sanitizeHtml(value || '', {
  allowedTags: ['p', 'br', 'h2', 'h3', 'h4', 'strong', 'em', 'blockquote', 'ul', 'ol', 'li', 'a', 'pre', 'code', 'img'],
  allowedAttributes: { a: ['href', 'title', 'target', 'rel'], img: ['src', 'alt', 'title'] },
  allowedSchemes: ['http', 'https', 'mailto'],
  transformTags: { a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer', target: '_blank' }) }
});

const blogPostSchema = new mongoose.Schema({
  title: { type: String, trim: true, maxlength: 180 },
  slug: { type: String, trim: true, lowercase: true, unique: true, sparse: true, maxlength: 180, match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/ },
  excerpt: { type: String, trim: true, maxlength: 500 },
  content: { type: String, set: cleanHtml, maxlength: 100000 },
  featuredImage: { type: String, trim: true, validate: { validator: (value) => !value || /^https?:\/\//i.test(value), message: 'Invalid image URL' } },
  author: { type: String, trim: true, maxlength: 100 },
  category: { type: String, trim: true, maxlength: 80, index: true },
  tags: [{ type: String, trim: true, maxlength: 50 }],
  status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft', index: true },
  publishedAt: Date,
  seoTitle: { type: String, trim: true, maxlength: 70 },
  metaDescription: { type: String, trim: true, maxlength: 170 },
  canonicalUrl: String,
  ogTitle: { type: String, trim: true, maxlength: 95 },
  ogDescription: { type: String, trim: true, maxlength: 200 },
  ogImage: String
}, { timestamps: true });

blogPostSchema.index({ status: 1, publishedAt: -1 });
blogPostSchema.index({ status: 1, category: 1, publishedAt: -1 });
module.exports = mongoose.model('BlogPost', blogPostSchema);
