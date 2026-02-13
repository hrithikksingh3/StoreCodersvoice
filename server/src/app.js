const express = require('express');
const cors = require('cors');

const app = express();


app.use(cors({
//   origin: [
// "https://codersvoice.onrender.com",
// "http://localhost:5500",
// "http://127.0.0.1:5500",
// "https://codersvoice-dev.onrender.com"

// ],
origion: process.env.FRONTEND_URL || "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: false
}));

app.use(express.json());

app.get('/', (req, res) => {
  res.send('CodersVoice Backend API Running');
});
// Routes
app.use('/api/contact', require('./routes/contact.routes'));
app.use('/api/payment', require('./routes/payment.routes'));
app.use("/api/ai", require("./routes/ai.routes"));

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found"
  });
});



module.exports = app;


