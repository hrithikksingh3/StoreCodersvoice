const { Resend } = require('resend');

module.exports = async ({ to, subject, html, attachments = [] }) => {
  if (!process.env.RESEND_API_KEY || !process.env.EMAIL_USER) {
    throw new Error('Email delivery is not configured');
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const { data, error } = await resend.emails.send({
    from: `"CodersVoice" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
    attachments,
  });

  if (error) throw new Error(`Resend rejected the email: ${error.message || 'Unknown provider error'}`);
  if (!data?.id) throw new Error('Resend did not return an email ID');
  return { id: data.id };
};
