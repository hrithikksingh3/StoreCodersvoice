const AuditLog = require('../models/AuditLog');
const Order = require('../models/Order');
const audit = require('../utils/audit');
const ExcelJS = require('exceljs');
const atlasStorage = require('../services/atlas-storage.service');

const MAX_BATCH_SIZE = 10000;
const DEFAULT_STORAGE_LIMIT_MB = 512;
const targets = {
  audit_logs: { model: AuditLog, label: 'audit logs', retentionDays: 7 },
  orders: { model: Order, label: 'orders', retentionDays: 30 },
};

const retentionBoundary = (days) => {
  const boundary = new Date();
  boundary.setUTCDate(boundary.getUTCDate() - days);
  return boundary;
};

const parseDate = (value, endOfDay = false) => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.valueOf()) || date.toISOString().slice(0, 10) !== value) return null;
  if (endOfDay) date.setUTCHours(23, 59, 59, 999);
  return date;
};

const getTarget = (value) => targets[value] || null;
const configuredStorageLimitBytes = () => {
  const value = Number(process.env.DATABASE_STORAGE_LIMIT_MB || DEFAULT_STORAGE_LIMIT_MB);
  const megabytes = Number.isFinite(value) && value > 0 ? value : DEFAULT_STORAGE_LIMIT_MB;
  return Math.round(megabytes * 1024 * 1024);
};
const megabytes = (bytes) => Math.round((Number(bytes || 0) / (1024 * 1024)) * 100) / 100;

const buildPlan = (body) => {
  const targetKey = String(body.target || '');
  const target = getTarget(targetKey);
  const from = parseDate(body.from);
  const requestedTo = parseDate(body.to, true);
  if (!target) {
    const error = new Error('Only audit logs and orders can be managed here.');
    error.status = 400;
    throw error;
  }
  if (!from || !requestedTo || from > requestedTo) {
    const error = new Error('Choose a valid start and end date for the batch.');
    error.status = 400;
    throw error;
  }
  const boundary = retentionBoundary(target.retentionDays);
  const safeTo = new Date(Math.min(requestedTo.valueOf(), boundary.valueOf() - 1));
  if (from > safeTo) {
    const error = new Error(`The most recent ${target.retentionDays} days of ${target.label} are permanently retained and cannot be deleted.`);
    error.status = 400;
    throw error;
  }
  return {
    targetKey,
    target,
    boundary,
    query: { createdAt: { $gte: from, $lte: safeTo } },
    requestedTo,
    effectiveTo: safeTo,
  };
};

const describePlan = async (body) => {
  const plan = buildPlan(body);
  const count = await plan.target.model.countDocuments(plan.query);
  return {
    ...plan,
    count,
    confirmationText: `DELETE ${count} ${plan.targetKey === 'orders' ? 'ORDERS' : 'AUDIT LOGS'}`,
    requiresSmallerBatch: count > MAX_BATCH_SIZE,
  };
};

const safeOrderExport = (item) => ({
  id: String(item._id), email: item.email, customerName: item.customerName || null, phone: item.phone || null, productId: item.productId, productName: item.productName,
  amount: Number(item.amount || 0), currency: 'INR', paymentStatus: item.status,
  fulfillmentStatus: item.fulfillmentStatus || 'pending', paymentMethod: item.paymentMethod || null,
  paymentCapturedAt: item.paymentCapturedAt || null, razorpayOrderId: item.razorpayOrderId || null,
  razorpayPaymentId: item.razorpayPaymentId || null, ownerSharePercent: item.ownerSharePercent ?? null,
  createdAt: item.createdAt, updatedAt: item.updatedAt,
});
const safeAuditExport = (item) => ({
  id: String(item._id), actorId: item.actor ? String(item.actor) : null, action: item.action,
  entityType: item.entityType, entityId: item.entityId, summary: item.summary,
  ip: item.ip || null, userAgent: item.userAgent || null, createdAt: item.createdAt, updatedAt: item.updatedAt,
});
const exportRows = async (plan) => {
  const records = await plan.target.model.find(plan.query).sort({ createdAt: 1 }).limit(MAX_BATCH_SIZE).lean();
  return records.map(plan.targetKey === 'orders' ? safeOrderExport : safeAuditExport);
};
const dateText = (value) => value ? new Date(value).toISOString() : '';
const exportWorkbook = async (res, targetKey, rows) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'CodersVoice';
  const sheet = workbook.addWorksheet(targetKey === 'orders' ? 'Orders backup' : 'Audit logs backup', { views: [{ state: 'frozen', ySplit: 2 }] });
  const columns = targetKey === 'orders'
    ? [['ID', 'id'], ['Customer email', 'email'], ['Customer name', 'customerName'], ['Phone', 'phone'], ['Product ID', 'productId'], ['Product', 'productName'], ['Amount (INR)', 'amount'], ['Payment', 'paymentStatus'], ['Fulfillment', 'fulfillmentStatus'], ['Method', 'paymentMethod'], ['Paid at', 'paymentCapturedAt'], ['Razorpay order', 'razorpayOrderId'], ['Razorpay payment', 'razorpayPaymentId'], ['Your share %', 'ownerSharePercent'], ['Created at', 'createdAt'], ['Updated at', 'updatedAt']]
    : [['ID', 'id'], ['Actor ID', 'actorId'], ['Action', 'action'], ['Entity type', 'entityType'], ['Entity ID', 'entityId'], ['Summary', 'summary'], ['IP', 'ip'], ['User agent', 'userAgent'], ['Created at', 'createdAt'], ['Updated at', 'updatedAt']];
  sheet.mergeCells(1, 1, 1, columns.length);
  sheet.getCell('A1').value = `CodersVoice ${targetKey === 'orders' ? 'Orders' : 'Audit logs'} backup`;
  sheet.getCell('A1').font = { bold: true, size: 16, color: { argb: 'FFFFFFFF' } };
  sheet.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF081225' } };
  const header = sheet.addRow(columns.map(([label]) => label));
  header.eachCell((cell) => { cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }; cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2563EB' } }; });
  rows.forEach((row) => sheet.addRow(columns.map(([, key]) => /At$/.test(key) ? dateText(row[key]) : row[key] ?? '')));
  sheet.autoFilter = { from: { row: 2, column: 1 }, to: { row: 2, column: columns.length } };
  sheet.columns.forEach((column) => { column.width = 20; });
  sheet.getColumn(4).width = 32;
  sheet.getColumn(targetKey === 'orders' ? 2 : 6).width = 36;
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  await workbook.xlsx.write(res);
  res.end();
};

exports.summary = async (_req, res, next) => {
  try {
    const items = await Promise.all(Object.entries(targets).map(async ([key, target]) => {
      const boundary = retentionBoundary(target.retentionDays);
      const [total, eligible, oldest] = await Promise.all([
        target.model.countDocuments(),
        target.model.countDocuments({ createdAt: { $lt: boundary } }),
        target.model.findOne().sort({ createdAt: 1 }).select('createdAt').lean(),
      ]);
      return { target: key, label: target.label, retentionDays: target.retentionDays, total, eligible, oldestCreatedAt: oldest?.createdAt || null, retentionBoundary: boundary };
    }));
    let storage = {
      available: false,
      configuredLimitMb: megabytes(configuredStorageLimitBytes()),
      message: 'Database usage could not be read. Confirm the quota in MongoDB Atlas.',
    };
    try {
      const stats = await AuditLog.db.db.stats();
      const collectionAllocationBytes = Number(stats.storageSize || 0);
      const indexBytes = Number(stats.indexSize || 0);
      const databaseStatsUsedBytes = collectionAllocationBytes + indexBytes;
      const limitBytes = configuredStorageLimitBytes();
      let atlasUsage = null;
      let atlasError = null;
      try { atlasUsage = await atlasStorage.getAtlasStorageUsage(); } catch (error) { atlasError = error; console.warn('Could not read Atlas storage metrics:', error.message); }
      const hasAtlasUsage = Boolean(atlasUsage?.usedBytes);
      const usedBytes = hasAtlasUsage ? atlasUsage.usedBytes : databaseStatsUsedBytes;
      storage = {
        available: true,
        configuredLimitMb: megabytes(limitBytes),
        usedMb: megabytes(usedBytes),
        calculatedUsedMb: megabytes(databaseStatsUsedBytes),
        logicalDataMb: megabytes(stats.dataSize),
        collectionAllocationMb: megabytes(collectionAllocationBytes),
        indexMb: megabytes(indexBytes),
        freeMb: Math.max(0, megabytes(limitBytes - usedBytes)),
        percentUsed: Math.min(100, Math.round((usedBytes / limitBytes) * 10000) / 100),
        source: hasAtlasUsage ? 'atlas-api' : 'database-stats',
        observedAt: hasAtlasUsage ? atlasUsage.observedAt : null,
        message: hasAtlasUsage
          ? 'Atlas disk usage is retrieved automatically through the configured read-only service account. Atlas refreshes measurements periodically; this page caches the latest value for five minutes.'
          : atlasUsage?.unavailable
          ? `${atlasUsage.reason} Showing the application database footprint instead; use the Atlas dashboard as the authoritative capacity view for this tier.`
          : atlasStorage.isConfigured()
          ? `Atlas metrics are temporarily unavailable (${atlasError?.message || 'unknown error'}). Showing the application database footprint instead.`
          : 'This is the application database footprint (collections plus indexes). Configure the Atlas read-only service account variables to show automatic Atlas disk usage.',
      };
    } catch (error) {
      console.warn('Could not read MongoDB database stats:', error.message);
    }
    res.json({ success: true, items, maxBatchSize: MAX_BATCH_SIZE, storage });
  } catch (error) { next(error); }
};

exports.exportBackup = async (req, res, next) => {
  try {
    const plan = await describePlan(req.body);
    if (!plan.count) return res.status(400).json({ success: false, message: 'No eligible records exist in this date range.' });
    if (plan.requiresSmallerBatch) return res.status(400).json({ success: false, message: `This batch contains ${plan.count} records. Restrict the date range to ${MAX_BATCH_SIZE.toLocaleString()} records or fewer before exporting.` });
    const format = String(req.body.format || '').toLowerCase();
    if (!['ndjson', 'xlsx'].includes(format)) return res.status(400).json({ success: false, message: 'Choose NDJSON or Excel for the backup.' });
    const rows = await exportRows(plan);
    const filename = `codersvoice-${plan.targetKey}-${req.body.from}-to-${plan.effectiveTo.toISOString().slice(0, 10)}-backup`;
    await audit(req, 'DATA_RETENTION_EXPORTED', 'data-management', plan.targetKey, `Exported ${rows.length} ${plan.target.label} for retention review.`);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.${format}"`);
    if (format === 'xlsx') return exportWorkbook(res, plan.targetKey, rows);
    res.type('application/x-ndjson');
    return res.send(`${rows.map((row) => JSON.stringify(row)).join('\n')}\n`);
  } catch (error) { next(error); }
};

exports.preview = async (req, res, next) => {
  try {
    const plan = await describePlan(req.body);
    res.json({
      success: true,
      target: plan.targetKey,
      label: plan.target.label,
      count: plan.count,
      retentionDays: plan.target.retentionDays,
      retentionBoundary: plan.boundary,
      effectiveTo: plan.effectiveTo,
      requestedTo: plan.requestedTo,
      confirmationText: plan.confirmationText,
      maxBatchSize: MAX_BATCH_SIZE,
      requiresSmallerBatch: plan.requiresSmallerBatch,
    });
  } catch (error) { next(error); }
};

exports.purge = async (req, res, next) => {
  try {
    const plan = await describePlan(req.body);
    if (!plan.count) return res.status(400).json({ success: false, message: 'No eligible records exist in this date range.' });
    if (plan.requiresSmallerBatch) return res.status(400).json({ success: false, message: `This batch contains ${plan.count} records. Restrict the date range to ${MAX_BATCH_SIZE.toLocaleString()} records or fewer.` });
    if (String(req.body.confirmation || '') !== plan.confirmationText) return res.status(400).json({ success: false, message: `Type “${plan.confirmationText}” exactly to confirm this deletion.` });

    const result = await plan.target.model.deleteMany(plan.query);
    await audit(req, 'DATA_RETENTION_PURGED', 'data-management', plan.targetKey, `Deleted ${result.deletedCount} ${plan.target.label} created on or before ${plan.effectiveTo.toISOString().slice(0, 10)}; ${plan.target.retentionDays}-day retention floor enforced.`);
    res.json({ success: true, deletedCount: result.deletedCount, target: plan.targetKey, retentionDays: plan.target.retentionDays });
  } catch (error) { next(error); }
};

module.exports._internals = { parseDate, retentionBoundary, buildPlan, MAX_BATCH_SIZE, safeOrderExport, safeAuditExport };
