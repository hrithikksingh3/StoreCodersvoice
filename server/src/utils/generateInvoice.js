const PDFDocument = require("pdfkit");

module.exports = function generateInvoice(order) {
  return new Promise((resolve) => {
    const doc = new PDFDocument({ margin: 40 });
    const buffers = [];

    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => resolve(Buffer.concat(buffers)));

    /* ========= COLORS ========= */
    const PRIMARY = "#7b61ff";
    const DARK = "#0b0f1a";
    const MUTED = "#6b7280";

    /* ========= HEADER ========= */
    doc
      .rect(0, 0, doc.page.width, 110)
      .fill(DARK);

    doc
      .fillColor("white")
      .fontSize(26)
      .text("Codersvoice", 40, 35);

    doc
      .fontSize(11)
      .fillColor("#c7d2fe")
      .text("Premium Developer Products & Mentorship", 40, 68);

    doc
      .fillColor(PRIMARY)
      .roundedRect(doc.page.width - 170, 35, 120, 32, 6)
      .fill();

    doc
      .fillColor("white")
      .fontSize(14)
      .text("INVOICE", doc.page.width - 145, 44);

    doc.moveDown(3);

    /* ========= META INFO ========= */
    const top = 140;

    doc
      .fillColor("#111827")
      .fontSize(12)
      .text("BILLED TO", 40, top);

    doc
      .fontSize(11)
      .fillColor(MUTED)
      .text(order.email, 40, top + 18);

    // doc
    //   .fillColor("#111827")
    //   .fontSize(12)
    //   .text("INVOICE DETAILS", doc.page.width - 220, top);

    // doc
    //   .fontSize(11)
    //   .fillColor(MUTED)
    //   .text(`Invoice ID: CV-${order._id}`, doc.page.width - 220, top + 18)
    //   .text(`Date: ${new Date().toLocaleDateString()}`, doc.page.width - 220, top + 34)
    //   .text(`Payment: Razorpay`, doc.page.width - 220, top + 50);


    const rightX = doc.page.width - 260;
const rightWidth = 220;
let rightY = top;

doc
  .fillColor("#111827")
  .fontSize(12)
  .text("INVOICE DETAILS", rightX, rightY, { width: rightWidth });

rightY += 18;

doc
  .fontSize(11)
  .fillColor(MUTED)
  .text(`Invoice ID: CV-${order._id}`, rightX, rightY, {
    width: rightWidth
  });

rightY = doc.y + 6; // ✅ auto move after wrapping

doc.text(`Date: ${new Date().toLocaleDateString()}`, rightX, rightY, {
  width: rightWidth
});

rightY += 16;

doc.text(`Payment: Razorpay`, rightX, rightY, {
  width: rightWidth
});


    /* ========= SEPARATOR ========= */
    doc
      .moveTo(40, top + 85)
      .lineTo(doc.page.width - 40, top + 85)
      .strokeColor("#e5e7eb")
      .stroke();

    /* ========= PRODUCT TABLE ========= */
    const tableTop = top + 110;

    doc
      .fontSize(12)
      .fillColor("#111827")
      .text("DESCRIPTION", 40, tableTop)
      .text("AMOUNT", doc.page.width - 160, tableTop);

    doc
      .moveTo(40, tableTop + 18)
      .lineTo(doc.page.width - 40, tableTop + 18)
      .strokeColor("#e5e7eb")
      .stroke();

    doc
      .fontSize(11)
      .fillColor("#374151")
      .text(order.productName, 40, tableTop + 30)
      .text(`Rs. ${order.amount}`, doc.page.width - 160, tableTop + 30);

    /* ========= TOTAL ========= */
    doc
      .moveTo(40, tableTop + 70)
      .lineTo(doc.page.width - 40, tableTop + 70)
      .strokeColor("#e5e7eb")
      .stroke();

    doc
      .fontSize(14)
      .fillColor("#111827")
      .text("TOTAL PAID", doc.page.width - 260, tableTop + 85);

    doc
      .fontSize(18)
      .fillColor(PRIMARY)
      .text(`Rs. ${order.amount}`, doc.page.width - 160, tableTop + 82);


      /* ========= WATERMARK ========= */
doc.save();

doc
  .rotate(-30, { origin: [doc.page.width / 2, doc.page.height / 2] })
  .fontSize(60)
  .fillColor("#7b61ff")
  .opacity(0.06)
  .text(
    "CODERSVOICE",
    doc.page.width / 2 - 250,
    doc.page.height / 2 - 30,
    {
      width: 500,
      align: "center"
    }
  );

doc.restore();
doc.opacity(1);
//

    /* ========= STATUS BADGE ========= */
    doc
      .fillColor("#dcfce7")
      .roundedRect(40, tableTop + 80, 120, 28, 6)
      .fill();

    doc
      .fillColor("#166534")
      .fontSize(12)
      .text("PAID", 78, tableTop + 88);

/* ========= FOOTER (FIXED AT BOTTOM) ========= */
const footerY = doc.page.height - 90;

doc
  .fontSize(10)
  .fillColor(MUTED)
  .text(
    "This is a system-generated invoice. No signature required.\nFor support or queries, reply to this email.",
    40,
    footerY,
    {
      width: doc.page.width - 80,   // ✅ full usable width
      align: "center"
    }
  );

doc
//   .moveDown(0.8)
  .fontSize(10)
  .fillColor(PRIMARY)
  .text(
    "© CodersVoice • Build • Ship • Influence",
    40,
    // doc.y,
    footerY + 28, 
    {
      width: doc.page.width - 80,
      align: "center"
    }
  );


    doc.end();
  });
};
