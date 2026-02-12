// const nodemailer = require('nodemailer');

// module.exports = async ({ to, subject, text }) => {
//   try {
//     const transporter = nodemailer.createTransport({
//       service: 'gmail',
//       auth: {
//         user: process.env.EMAIL_USER, // your gmail
//         pass: process.env.EMAIL_PASS  // app password
//       }
//     });

//     await transporter.sendMail({
//       from: `"CodersVoice" <${process.env.EMAIL_USER}>`,
//       to,
//       subject,
//       text
//     });

//     console.log('📧 Email sent successfully');
//   } catch (error) {
//     console.error('📧 Email send failed:', error);
//     throw error; // IMPORTANT: lets controller catch it
//   }
// };



//working
// const nodemailer = require('nodemailer');

// module.exports = async ({ to, subject, text, html }) => {
//   console.log("📧 sendMail called");
//   console.log("TO:", to);

//   try {
//     const transporter = nodemailer.createTransport({
//       service: 'gmail',
//       auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS
//       }
//     });

//     const info = await transporter.sendMail({
//       from: `"CodersVoice" <${process.env.EMAIL_USER}>`,
//       to,
//       subject,
//       text,
//       html
//     });
// console.log('📧 MAIL_USER:', process.env.EMAIL_USER);
// console.log('📧 MAIL_PASS exists:', !!process.env.EMAIL_PASS);

//     console.log("📧 Email sent:", info.response);
//   } catch (error) {
//     console.error("📧 Email ERROR:", error);
//     throw error; // VERY IMPORTANT
//   }
// };



// const nodemailer = require("nodemailer");

// module.exports = async ({
//   to,
//   subject,
//   text,
//   html,
//   attachments = []   // ✅ THIS WAS MISSING / WRONG
// }) => {
//   console.log("📧 sendMail called");
//   console.log("TO:", to);

//   try {
//     const transporter = nodemailer.createTransport({
//       service: "gmail",
//       auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS
//       }
//     });

//     await transporter.sendMail({
//       from: `"CodersVoice" <${process.env.EMAIL_USER}>`,
//       to,
//       subject,
//       text,
//       html,
//       attachments   // ✅ now defined
//     });

//     console.log("📧 Email sent successfully");
//   } catch (error) {
//     console.error("📧 Email ERROR:", error);
//     throw error;
//   }
// };





// const nodemailer = require("nodemailer");

// console.log("📧 Initializing mail transporter...");

// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS
//   }
// });

// module.exports = async ({ to, subject, text, html, attachments = [] }) => {
//   console.log("📧 sendMail called →", to);

//   try {
//     await transporter.sendMail({
//       from: `"CodersVoice" <${process.env.EMAIL_USER}>`,
//       to,
//       subject,
//       text,
//       html,
//       attachments
//     });

//     console.log("✅ Email sent");
//   } catch (err) {
//     console.error("❌ Email failed:", err.message);
//     throw err;
//   }
// };


const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

module.exports = async ({ to, subject, html, attachments = [] }) => {
  console.log("📧 sendMail called →", to);

  try {
    await resend.emails.send({
      from: `"CodersVoice" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      attachments
    });

    console.log("✅ Email sent successfully");
  } catch (err) {
    console.error("❌ Email failed:", err.message);
    throw err;
  }
};
