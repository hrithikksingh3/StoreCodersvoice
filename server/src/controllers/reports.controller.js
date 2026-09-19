const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { text } = require('../utils/content');

const COLORS = { navy: '#081225', ink: '#13213d', blue: '#2563eb', cyan: '#06b6d4', muted: '#64748b', line: '#dbe4f0', pale: '#f5f9ff', green: '#047857', amber: '#b45309', red: '#b91c1c' };
const SOCIAL_LINKS = [
  { label: 'Website', url: 'https://codersvoice.me' },
  { label: 'LinkedIn', url: 'https://www.linkedin.com/company/codersvoice/' },
  { label: 'GitHub', url: 'https://github.com/codersvoicehrithik' },
  { label: 'Medium', url: 'https://medium.com/@hrithikkumarsingh' },
  { label: 'X', url: 'https://twitter.com/Codersvoice' },
  { label: 'Instagram', url: 'https://www.instagram.com/codersvoice/' },
  { label: 'YouTube', url: 'https://www.youtube.com/channel/UCgVFnSkvmtPs3y3HvUJU7ig' },
  { label: 'Telegram', url: 'https://t.me/codersvoicehrithik' },
  { label: 'Facebook', url: 'https://www.facebook.com/profile.php?id=100086181562620' },
  { label: 'Buy Me a Coffee', url: 'https://www.buymeacoffee.com/codersvoice' },
];
const dateValue = (value, endOfDay = false) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return null;
  if (endOfDay) date.setUTCHours(23, 59, 59, 999);
  return date;
};
const safeFilePart = (value) => String(value || 'report').replace(/[^a-z0-9-]/gi, '-').toLowerCase();
// PDFKit's built-in Helvetica font does not contain the Indian rupee glyph.
// Use the ISO currency label so every deployed runtime renders amounts correctly.
const money = (value) => `INR ${Number(value || 0).toLocaleString('en-IN')}`;
const dateText = (value) => (value ? new Date(value).toLocaleDateString('en-IN') : '—');

function productQuery(query) {
  const filter = {};
  if (['draft', 'published', 'hidden', 'archived'].includes(query.status)) filter.status = query.status;
  if (query.category && text(query.category, 80)) filter.category = query.category;
  if (query.q && text(query.q, 80)) {
    const value = new RegExp(query.q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [{ name: value }, { slug: value }, { category: value }, { tags: value }];
  }
  const from = dateValue(query.from);
  const to = dateValue(query.to, true);
  if (from || to) filter.updatedAt = { ...(from ? { $gte: from } : {}), ...(to ? { $lte: to } : {}) };
  return filter;
}

function orderQuery(query) {
  const filter = {};
  if (['created', 'paid', 'failed'].includes(query.status)) filter.status = query.status;
  if (query.q && text(query.q, 120)) {
    const value = new RegExp(query.q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [{ email: value }, { productName: value }, { razorpayOrderId: value }, { razorpayPaymentId: value }];
  }
  const from = dateValue(query.from);
  const to = dateValue(query.to, true);
  if (from || to) filter.createdAt = { ...(from ? { $gte: from } : {}), ...(to ? { $lte: to } : {}) };
  return filter;
}

function reportFilters(query, fields) {
  return fields.flatMap(([label, key]) => (query[key] ? [[label, String(query[key])]] : []));
}

function drawSocialLinks(doc, links, y) {
  const fontSize = 6.2;
  const gap = 14;
  doc.font('Helvetica-Bold').fontSize(fontSize);
  const widths = links.map((link) => doc.widthOfString(link.label));
  const totalWidth = widths.reduce((sum, width) => sum + width, 0) + gap * (links.length - 1);
  let x = Math.max(34, (doc.page.width - totalWidth) / 2);
  links.forEach((link, index) => {
    const width = widths[index];
    doc.fillColor(COLORS.blue).text(link.label, x, y, { width, lineBreak: false, underline: true });
    doc.link(x, y, width, fontSize + 3, link.url);
    x += width + gap;
  });
}

function createPdf(res, title, subtitle, filters, metrics, columns, rows) {
  const doc = new PDFDocument({ size: 'A4', margin: 34, bufferPages: true, info: { Title: title, Author: 'CodersVoice' } });
  const filename = `${safeFilePart(title)}-${new Date().toISOString().slice(0, 10)}.pdf`;
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  doc.pipe(res);

  const header = () => {
    doc.rect(0, 0, doc.page.width, 96).fill(COLORS.navy);
    doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(22).text('CodersVoice', 34, 27);
    doc.fillColor('#93c5fd').font('Helvetica').fontSize(10).text('ADMIN REPORT', 35, 57);
    doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(18).text(title, 34, 114);
    doc.fillColor(COLORS.muted).font('Helvetica').fontSize(9).text(subtitle, 34, 140);
  };
  const pageHeader = () => {
    doc.rect(0, 0, doc.page.width, 46).fill(COLORS.navy);
    doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(11).text(`CodersVoice - ${title}`, 34, 17);
  };
  header();
  let y = 170;
  if (filters.length) {
    doc.fillColor(COLORS.ink).font('Helvetica-Bold').fontSize(10).text('Applied filters', 34, y);
    y += 15;
    doc.fillColor(COLORS.muted).font('Helvetica').fontSize(8).text(filters.map(([name, value]) => `${name}: ${value}`).join('   ·   '), 34, y, { width: 525 });
    y += 30;
  }
  const cardWidth = 166;
  metrics.slice(0, 3).forEach(([label, value, color], index) => {
    const x = 34 + index * (cardWidth + 10);
    doc.roundedRect(x, y, cardWidth, 57, 8).fill(COLORS.pale);
    doc.fillColor(color || COLORS.blue).font('Helvetica-Bold').fontSize(18).text(String(value), x + 12, y + 12, { width: cardWidth - 24 });
    doc.fillColor(COLORS.muted).font('Helvetica').fontSize(8).text(label.toUpperCase(), x + 12, y + 37, { width: cardWidth - 24 });
  });
  y += 83;
  const tableHeader = () => {
    doc.roundedRect(34, y, 527, 24, 6).fill(COLORS.ink);
    let x = 40;
    columns.forEach((column) => {
      doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(7.5).text(column.label.toUpperCase(), x, y + 8, { width: column.width - 5, lineBreak: false });
      x += column.width;
    });
    y += 24;
  };
  tableHeader();
  rows.forEach((row, index) => {
    const rowHeight = 28;
    if (y + rowHeight > doc.page.height - 42) {
      doc.addPage();
      pageHeader();
      y = 68;
      tableHeader();
    }
    if (index % 2 === 0) doc.rect(34, y, 527, rowHeight).fill('#f8fafc');
    let x = 40;
    columns.forEach((column) => {
      const value = String(row[column.key] ?? '—');
      doc.fillColor(COLORS.ink).font('Helvetica').fontSize(7.5).text(value, x, y + 8, { width: column.width - 7, height: 16, ellipsis: true, lineBreak: false });
      x += column.width;
    });
    y += rowHeight;
  });
  const range = doc.bufferedPageRange();
  for (let index = 0; index < range.count; index += 1) {
    doc.switchToPage(index);
    // Keep all footer text above PDFKit's bottom margin. Writing below that
    // boundary makes PDFKit automatically add an otherwise blank page.
    drawSocialLinks(doc, SOCIAL_LINKS.slice(0, 5), doc.page.height - 71);
    drawSocialLinks(doc, SOCIAL_LINKS.slice(5), doc.page.height - 60);
    doc.fillColor(COLORS.muted).font('Helvetica').fontSize(7).text(`Generated ${new Date().toLocaleString('en-IN')} - Page ${index + 1} of ${range.count}`, 34, doc.page.height - 45, { align: 'center', width: 527, lineBreak: false });
  }
  doc.end();
}

async function createWorkbook(res, title, filters, metrics, columns, rows) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'CodersVoice';
  workbook.created = new Date();
  const sheet = workbook.addWorksheet('Report', { views: [{ state: 'frozen', ySplit: 6 }] });
  sheet.mergeCells(1, 1, 1, columns.length);
  const titleCell = sheet.getCell('A1');
  titleCell.value = `CodersVoice — ${title}`;
  titleCell.font = { name: 'Aptos Display', size: 18, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF081225' } };
  titleCell.alignment = { vertical: 'middle' };
  sheet.getRow(1).height = 32;
  sheet.mergeCells(2, 1, 2, columns.length);
  sheet.getCell('A2').value = `Generated ${new Date().toLocaleString('en-IN')}${filters.length ? `  |  ${filters.map(([name, value]) => `${name}: ${value}`).join('  |  ')}` : ''}`;
  sheet.getCell('A2').font = { color: { argb: 'FF64748B' }, italic: true, size: 10 };
  metrics.slice(0, Math.min(metrics.length, columns.length)).forEach(([label, value, color], index) => {
    const cell = sheet.getCell(4, index + 1);
    cell.value = `${label}: ${value}`;
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: (color || COLORS.blue).replace('#', 'FF') } };
    cell.alignment = { horizontal: 'center' };
  });
  sheet.addRow([]);
  const header = sheet.addRow(columns.map((column) => column.label));
  header.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF13213D' } };
    cell.alignment = { vertical: 'middle' };
  });
  rows.forEach((row) => sheet.addRow(columns.map((column) => row[column.key] ?? '—')));
  sheet.autoFilter = { from: { row: 6, column: 1 }, to: { row: 6, column: columns.length } };
  sheet.columns.forEach((column, index) => { column.width = Math.max(14, Math.min(columns[index].width / 1.5, 34)); });
  sheet.eachRow((row, number) => {
    if (number > 6) {
      row.eachCell((cell) => { cell.alignment = { vertical: 'top', wrapText: true }; cell.border = { bottom: { style: 'hair', color: { argb: 'FFE2E8F0' } } }; });
      if (number % 2 === 1) row.eachCell((cell) => { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } }; });
    }
  });
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="${safeFilePart(title)}-${new Date().toISOString().slice(0, 10)}.xlsx"`);
  await workbook.xlsx.write(res);
  res.end();
}

function sendReport(req, res, next, payload) {
  const format = String(req.query.format || '').toLowerCase();
  if (!['pdf', 'xlsx'].includes(format)) return res.status(400).json({ success: false, message: 'Choose PDF or Excel for this report.' });
  const subtitle = `${payload.rows.length} records · Generated ${new Date().toLocaleString('en-IN')}`;
  if (format === 'pdf') return createPdf(res, payload.title, subtitle, payload.filters, payload.metrics, payload.columns, payload.rows);
  return createWorkbook(res, payload.title, payload.filters, payload.metrics, payload.columns, payload.rows).catch(next);
}

exports.products = async (req, res, next) => { try {
  const items = await Product.find(productQuery(req.query)).sort({ updatedAt: -1 }).lean();
  const rows = items.map((item) => ({ name: item.name, category: item.category, price: money(item.price), status: item.status, updated: dateText(item.updatedAt) }));
  return sendReport(req, res, next, {
    title: 'Products report', filters: reportFilters(req.query, [['Search', 'q'], ['Status', 'status'], ['Category', 'category'], ['From', 'from'], ['To', 'to']]),
    metrics: [['Products', items.length, COLORS.blue], ['Visible in store', items.filter((item) => item.status === 'published').length, COLORS.green], ['Hidden', items.filter((item) => item.status === 'hidden').length, COLORS.amber]],
    columns: [{ label: 'Product', key: 'name', width: 175 }, { label: 'Category', key: 'category', width: 115 }, { label: 'Price', key: 'price', width: 72 }, { label: 'Status', key: 'status', width: 82 }, { label: 'Updated', key: 'updated', width: 83 }], rows,
  });
} catch (error) { next(error); } };

exports.orders = async (req, res, next) => { try {
  const items = await Order.find(orderQuery(req.query)).sort({ createdAt: -1 }).lean();
  const revenue = items.filter((item) => item.status === 'paid').reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const rows = items.map((item) => ({ product: item.productName, customer: item.email, amount: money(item.amount), payment: item.status, delivery: item.fulfillmentStatus || 'not tracked', created: dateText(item.createdAt) }));
  return sendReport(req, res, next, {
    title: 'Orders report', filters: reportFilters(req.query, [['Search', 'q'], ['Payment', 'status'], ['From', 'from'], ['To', 'to']]),
    metrics: [['Orders', items.length, COLORS.blue], ['Paid orders', items.filter((item) => item.status === 'paid').length, COLORS.green], ['Paid revenue', money(revenue), COLORS.cyan]],
    columns: [{ label: 'Product', key: 'product', width: 120 }, { label: 'Customer', key: 'customer', width: 125 }, { label: 'Amount', key: 'amount', width: 65 }, { label: 'Payment', key: 'payment', width: 63 }, { label: 'Delivery', key: 'delivery', width: 75 }, { label: 'Created', key: 'created', width: 78 }], rows,
  });
} catch (error) { next(error); } };

exports.dashboard = async (req, res, next) => { try {
  const orders = await Order.find(orderQuery(req.query)).sort({ createdAt: -1 }).lean();
  const [products, visibleProducts, blogs] = await Promise.all([Product.countDocuments(), Product.countDocuments({ status: 'published' }), require('../models/BlogPost').countDocuments()]);
  const paid = orders.filter((item) => item.status === 'paid');
  const revenue = paid.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const rows = orders.map((item) => ({ metric: item.productName, detail: item.email, amount: money(item.amount), payment: item.status, delivery: item.fulfillmentStatus || 'not tracked', date: dateText(item.createdAt) }));
  return sendReport(req, res, next, {
    title: 'Dashboard report', filters: reportFilters(req.query, [['From', 'from'], ['To', 'to']]),
    metrics: [['Products', products, COLORS.blue], ['Published', visibleProducts, COLORS.green], ['Paid revenue', money(revenue), COLORS.cyan]],
    columns: [{ label: 'Recent order', key: 'metric', width: 135 }, { label: 'Customer', key: 'detail', width: 130 }, { label: 'Amount', key: 'amount', width: 66 }, { label: 'Payment', key: 'payment', width: 63 }, { label: 'Delivery', key: 'delivery', width: 70 }, { label: 'Date', key: 'date', width: 67 }], rows,
  });
} catch (error) { next(error); } };
