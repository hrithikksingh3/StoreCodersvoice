const { cloudinary, assertConfigured } = require('../config/cloudinary');
const { assertImageBuffer, assertSafeRemoteImageUrl } = require('../utils/image-security');

const allowedKinds = new Set(['products', 'blogs']);
const uploadBuffer = (buffer, folder) => new Promise((resolve, reject) => {
  const stream = cloudinary.uploader.upload_stream(
    {
      folder,
      resource_type: 'image',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif'],
      transformation: [{ quality: 'auto', fetch_format: 'auto' }],
    },
    (error, result) => (error ? reject(error) : resolve(result)),
  );
  stream.end(buffer);
});

exports.uploadImage = async (req, res, next) => {
  try {
    assertConfigured();
    const kind = allowedKinds.has(req.body.kind) ? req.body.kind : 'products';
    const folder = `codersvoice/${kind}`;
    const sourceUrl = String(req.body.sourceUrl || '').trim();
    let result;

    if (req.file) {
      assertImageBuffer(req.file.buffer);
      result = await uploadBuffer(req.file.buffer, folder);
    } else if (sourceUrl) {
      const safeUrl = await assertSafeRemoteImageUrl(sourceUrl);
      // Cloudinary fetches the remote image itself and stores the resulting asset.
      result = await cloudinary.uploader.upload(safeUrl, {
        folder,
        resource_type: 'image',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif'],
        transformation: [{ quality: 'auto', fetch_format: 'auto' }],
      });
    } else {
      return res.status(400).json({ success: false, message: 'Choose an image file or provide a valid HTTPS image URL.' });
    }

    res.status(201).json({
      success: true,
      item: {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
      },
    });
  } catch (error) {
    if (error.http_code || error.status) {
      return res.status(error.status || 400).json({ success: false, message: error.message || 'Image upload failed.' });
    }
    next(error);
  }
};
