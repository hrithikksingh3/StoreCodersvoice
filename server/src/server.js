require('dotenv').config();
const { validateProductionEnvironment } = require('./config/environment');
const app = require('./app');
const connectDB = require('./config/db');

validateProductionEnvironment();
connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
