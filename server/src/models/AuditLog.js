const mongoose = require('mongoose');
const auditLogSchema = new mongoose.Schema({
  actor: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true, index: true },
  action: { type: String, required: true, maxlength: 80, index: true },
  entityType: { type: String, required: true, maxlength: 40, index: true },
  entityId: { type: String, required: true, maxlength: 80, index: true },
  summary: { type: String, required: true, maxlength: 300 },
  ip: { type: String, maxlength: 80 },
  userAgent: { type: String, maxlength: 300 }
}, { timestamps: true });
auditLogSchema.index({ createdAt: -1 });
module.exports = mongoose.model('AuditLog', auditLogSchema);
