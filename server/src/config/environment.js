const isHttpsUrl = (value) => {
  try {
    return new URL(String(value)).protocol === 'https:';
  } catch (_) {
    return false;
  }
};

const validateProductionEnvironment = () => {
  if (process.env.NODE_ENV !== 'production') return;

  const required = [
    'MONGO_URI', 'FRONTEND_URL', 'PUBLIC_API_URL', 'PUBLIC_SITE_URL', 'JWT_SECRET',
    'DOWNLOAD_TOKEN_SECRET', 'RAZORPAY_KEY', 'RAZORPAY_SECRET', 'RESEND_API_KEY',
    'EMAIL_USER', 'CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET',
  ];
  const missing = required.filter((key) => !String(process.env[key] || '').trim());
  const weakSecrets = ['JWT_SECRET', 'DOWNLOAD_TOKEN_SECRET'].filter((key) => String(process.env[key] || '').length < 32);
  const frontendOrigins = String(process.env.FRONTEND_URL || '').split(',').map((value) => value.trim()).filter(Boolean);
  const invalidUrls = [
    ...(frontendOrigins.length && frontendOrigins.every(isHttpsUrl) ? [] : ['FRONTEND_URL']),
    ...['PUBLIC_API_URL', 'PUBLIC_SITE_URL'].filter((key) => !isHttpsUrl(process.env[key])),
  ];
  const errors = [
    ...(missing.length ? [`Missing: ${missing.join(', ')}`] : []),
    ...(weakSecrets.length ? [`Must be at least 32 characters: ${weakSecrets.join(', ')}`] : []),
    ...(invalidUrls.length ? [`Must be HTTPS URLs: ${invalidUrls.join(', ')}`] : []),
  ];
  if (errors.length) throw new Error(`Production environment configuration is invalid. ${errors.join('. ')}`);
};

module.exports = { validateProductionEnvironment };
