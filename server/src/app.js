const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');



const app = express();

//for site security
const helmet = require("helmet");
app.use(helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: { policy: 'cross-origin' } }));


const origins = (process.env.FRONTEND_URL || 'http://localhost:5173,http://localhost:3000').split(',').map((value) => value.trim());
app.use(cors({
  origin(origin, callback) { if (!origin || origins.includes(origin)) return callback(null, true); return callback(new Error('Origin is not allowed by CORS')); },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true
}));

app.use(express.json({ limit: '200kb' }));
app.use(cookieParser());
app.set('trust proxy', 1);
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, max: 300, standardHeaders: true, legacyHeaders: false }));

app.get('/', (req, res) => {
  res.send('CodersVoice Backend API Running');
});
// Routes
app.use('/api/contact', require('./routes/contact.routes'));
app.use('/api/payment', require('./routes/payment.routes'));
app.use("/api/ai", require("./routes/ai.routes"));
app.use('/api/products', require('./routes/products.routes'));
app.use('/api/blogs', require('./routes/blogs.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
const orders = require('./controllers/orders.controller');
const { requireAdmin } = require('./middleware/auth');
const meta = require('./controllers/admin-meta.controller');
app.get('/api/orders/:id/download', orders.download);
app.get('/api/admin/orders', requireAdmin, orders.listAdmin);
app.post('/api/admin/orders/:id/resend-email', requireAdmin, require('./middleware/auth').requireCsrf, orders.resendEmail);
app.get('/api/admin/dashboard', requireAdmin, meta.dashboard);
app.get('/api/admin/audit-logs', requireAdmin, meta.auditLogs);
app.get('/api/admin/settings', requireAdmin, meta.getSettings);
app.put('/api/admin/settings', requireAdmin, require('./middleware/auth').requireCsrf, meta.updateSettings);
const seo = require('./controllers/seo.controller');
app.get('/robots.txt', seo.robots);
app.get('/sitemap.xml', seo.sitemap);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found"
  });
});

app.use((error, _req, res, _next) => {
  if (error?.name === 'MulterError') return res.status(400).json({ success: false, message: error.code === 'LIMIT_FILE_SIZE' ? 'Image must be 8 MB or smaller.' : 'Invalid image upload.' });
  if (error?.name === 'ValidationError') return res.status(400).json({ success: false, message: 'Validation failed' });
  if (error?.type === 'entity.parse.failed') return res.status(400).json({ success: false, message: 'Invalid JSON body' });
  console.error('Unhandled API error:', error.message);
  res.status(500).json({ success: false, message: 'Internal server error' });
});



module.exports = app;


