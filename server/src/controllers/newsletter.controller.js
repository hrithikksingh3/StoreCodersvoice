const Newsletter = require('../models/Newsletter');
const sendMail = require('../utils/sendMail');

exports.subscribe = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const exists = await Newsletter.findOne({ email });
    if (exists) {
      return res.status(409).json({ message: 'Already subscribed' });
    }

    await Newsletter.create({ email });

    await sendMail({
  to: email,
  subject: 'Welcome to CodersVoice 🚀',
  html: `
    <div style="
      max-width:600px;
      margin:0 auto;
      padding:24px;
      font-family:Arial,Helvetica,sans-serif;
      background:#ffffff;
      color:#0f172a;
      border-radius:8px;
      border:1px solid #e5e7eb;
    ">

      <h2 style="margin:0 0 12px;color:#020617;">
        Welcome to <span style="color:#7b61ff;">CodersVoice</span> 🚀
      </h2>

      <p style="font-size:15px;line-height:1.6;color:#334155;">
        You're officially subscribed to <strong>CodersVoice</strong>.
        Thanks for joining the community.
      </p>

      <p style="font-size:15px;line-height:1.6;color:#334155;">
        You’ll receive:
      </p>

      <ul style="padding-left:18px;color:#334155;font-size:14px;line-height:1.6;">
        <li>🚀 Production-ready projects & source code</li>
        <li>🧠 Practical dev tips & system design insights</li>
        <li>🤝 Early access to workshops & mentorship</li>
         <li>📦 Stay tuned — something useful is always shipping</li>
      </ul>

      <!-- CTA BUTTON -->
  <div style="margin:28px 0; text-align:center;">
    <a href="https://codersvoice-dev.onrender.com"
       target="_blank"
       style="
         display:inline-block;
         padding:14px 24px;
         background:linear-gradient(135deg,#7b61ff,#00f0ff);
         color:#041226;
         font-weight:700;
         font-size:14px;
         text-decoration:none;
         border-radius:8px;
         box-shadow:0 8px 24px rgba(123,97,255,0.25);
       ">
      Visit CodersVoice →
    </a>
  </div>

      <p style="font-size:14px;color:#64748b;margin-top:24px;">
        — Hrithik Singh<br/>
        <strong>CodersVoice</strong>
      </p>

      <hr style="margin:24px 0;border:none;border-top:1px solid #e5e7eb;" />

      <p style="font-size:12px;color:#94a3b8; text-align: center;">
        You’re receiving this because you subscribed on CodersVoice.
        If this wasn’t you, feel free to ignore this email.
      </p>

    </div>
  `
});


    res.json({ message: 'Subscribed successfully 🎉' });
  } catch (err) {
    console.error('NEWSLETTER ERROR:', err);
    res.status(500).json({ message: 'Subscription failed' });
  }
};
