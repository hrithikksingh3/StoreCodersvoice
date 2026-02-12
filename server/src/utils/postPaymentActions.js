const sendMail = require("./sendMail");
const generateInvoice = require("./generateInvoice");

module.exports = async function postPaymentActions(order) {
  try {
    console.log("📦 Background job started for order:", order._id);

    const invoiceBuffer = await generateInvoice(order);

    await sendMail({
      to: order.email,
      subject: `Your ${order.productName} – CodersVoice`,
      html: `
         <div style="font-family:Inter,Arial,sans-serif;background:#0b0f1a;padding:40px">
        <div style="max-width:600px;margin:auto;background:#111827;border-radius:14px;padding:32px;color:#e5e7eb">
          
          <h2 style="margin:0 0 10px;color:#8b5cf6;">Payment Successful 🎉</h2>
          <p style="color:#cbd5f5;font-size:15px;">
            Thanks for purchasing <b>${order.productName}</b> from <b>CodersVoice</b>.
          </p>

          <div style="margin:28px 0;padding:20px;background:#020617;border-radius:12px;text-align:center">
            <p style="margin-bottom:14px;font-size:14px;color:#94a3b8">
              Click below to download your source code
            </p>

             <a href="${order.downloadUrl}"
                target="_blank"
                style="
                 display:inline-block;
                 padding:14px 22px;
                 background:linear-gradient(90deg,#7b61ff,#00f0ff);
                  color:#020617;
                 text-decoration:none;
                  font-weight:700;
                  border-radius:10px;
                ">
               ⬇ Download Source Code
             </a>
           </div>

           <p style="font-size:13px;color:#94a3b8;text-align:center">
            If you face any issue, just reply to this email.<br/>
           — Team CodersVoice
           </p>

         </div>
       </div>
      `,
      attachments: [
        {
          filename: `CodersVoice-Invoice-${order._id}.pdf`,
          content: invoiceBuffer,
          contentType: "application/pdf"
        }
      ]
    });

    console.log("✅ Background email + invoice done");
  } catch (err) {
    console.error("❌ Background task failed:", err);
  }
};
