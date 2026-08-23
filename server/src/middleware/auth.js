const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const getToken = (req) => req.cookies?.cv_admin || req.headers.authorization?.replace(/^Bearer\s+/i, '');
exports.requireAdmin = async (req, res, next) => {
  try {
    const token = getToken(req);
    if (!token) return res.status(401).json({ success: false, message: 'Authentication required' });
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(payload.sub);
    if (!admin || admin.sessionVersion !== payload.sv) return res.status(401).json({ success: false, message: 'Session is no longer valid' });
    req.admin = admin;
    req.auth = payload;
    next();
  } catch (_) { return res.status(401).json({ success: false, message: 'Invalid or expired session' }); }
};
exports.requireCsrf = (req, res, next) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  if (!req.cookies?.cv_csrf || req.get('X-CSRF-Token') !== req.cookies.cv_csrf) return res.status(403).json({ success: false, message: 'Invalid CSRF token' });
  next();
};
