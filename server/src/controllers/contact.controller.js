const Contact = require('../models/Contact');
const sendMail = require('../utils/sendMail');

exports.submitContact = async (req, res) => {
  try {
    const { name, email, role, budget, message } = req.body;

    // Required fields based on UI
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, Email and Project Description are required'
      });
    }

    // Save to DB
    const contact = await Contact.create({
      name,
      email,
      role,
      budget,
      message
    });

    // Email notification
   // Email notification to admin
await sendMail({
  to: 'hrithikwebsoultions@gmail.com',
  subject: `🚀 New Project Pitch — ${name}`,
  html: `
    <div style="
      max-width:640px;
      margin:0 auto;
      padding:24px;
      font-family:Arial,Helvetica,sans-serif;
      background:#ffffff;
      color:#0f172a;
      border-radius:10px;
      border:1px solid #e5e7eb;
    ">

      <h2 style="margin:0 0 16px;color:#020617;">
        🚀 New Project Pitch Received
      </h2>

      <p style="font-size:14px;color:#334155;margin-bottom:24px;">
        A new project inquiry has been submitted through <strong>CodersVoice</strong>.
        Details are below.
      </p>

      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tr>
          <td style="padding:10px 8px;font-weight:700;color:#020617;">Name</td>
          <td style="padding:10px 8px;color:#334155;">${name}</td>
        </tr>
        <tr style="background:#f8fafc;">
          <td style="padding:10px 8px;font-weight:700;color:#020617;">Email</td>
          <td style="padding:10px 8px;color:#334155;">${email}</td>
        </tr>
        <tr>
          <td style="padding:10px 8px;font-weight:700;color:#020617;">Company / Role</td>
          <td style="padding:10px 8px;color:#334155;">${role || 'Not provided'}</td>
        </tr>
        <tr style="background:#f8fafc;">
          <td style="padding:10px 8px;font-weight:700;color:#020617;">Budget</td>
          <td style="padding:10px 8px;color:#334155;">${budget || 'Not specified'}</td>
        </tr>
      </table>

      <div style="margin-top:24px;">
        <h3 style="margin-bottom:8px;color:#020617;font-size:16px;">
          Project Description
        </h3>
        <div style="
          padding:14px;
          background:#f8fafc;
          border-radius:8px;
          border:1px solid #e5e7eb;
          font-size:14px;
          color:#334155;
          line-height:1.6;
          white-space:pre-line;
        ">
          ${message}
        </div>
      </div>

      <hr style="margin:28px 0;border:none;border-top:1px solid #e5e7eb;" />

      <p style="font-size:12px;color:#64748b;text-align:center;">
        This notification was generated automatically by CodersVoice.
      </p>

    </div>
  `
});


    return res.status(201).json({
      success: true,
      message: 'Pitch sent successfully 🚀'
    });

  } catch (error) {
    console.error('CONTACT ERROR:', error);

    return res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};
