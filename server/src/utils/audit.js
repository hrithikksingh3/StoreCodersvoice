const AuditLog = require('../models/AuditLog');
module.exports = (req, action, entityType, entity, summary) => AuditLog.create({
  actor: req.admin._id, action, entityType, entityId: String(entity._id || entity), summary,
  ip: req.ip, userAgent: req.get('user-agent') || ''
}).catch((error) => console.error('Audit log failure:', error.message));
