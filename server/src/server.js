require('dotenv').config();
// PUBLIC_SITE_URL is used for public metadata and sitemap URLs. On Render, safely
// inherit the first allowed storefront origin when the optional explicit value was missed.
if (!String(process.env.PUBLIC_SITE_URL || '').trim()) {
  process.env.PUBLIC_SITE_URL = String(process.env.FRONTEND_URL || '').split(',')[0].trim();
}
const { validateProductionEnvironment } = require('./config/environment');
const app = require('./app');
const connectDB = require('./config/db');

validateProductionEnvironment();
connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
