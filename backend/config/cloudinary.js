const cloudinary = require('cloudinary').v2;

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Test connection function
const testCloudinaryConnection = async () => {
  try {
    const result = await cloudinary.api.ping();
    console.log('✅ Cloudinary connected successfully:', result);
    return true;
  } catch (error) {
    console.error('❌ Cloudinary connection failed:', error.message);
    return false;
  }
};

// Helper function to generate video transformation URL
const getOptimizedVideoUrl = (publicId, options = {}) => {
  const {
    width = 800,
    height = 450,
    quality = 'auto',
    format = 'mp4'
  } = options;
  
  return cloudinary.url(publicId, {
    resource_type: 'video',
    width: width,
    height: height,
    crop: 'fill',
    quality: quality,
    format: format,
    secure: true
  });
};

// Helper function to generate video thumbnail
const getVideoThumbnail = (publicId, options = {}) => {
  const {
    width = 400,
    height = 225,
    start_offset = '2.0' // Thumbnail at 2 second mark
  } = options;
  
  return cloudinary.url(publicId, {
    resource_type: 'video',
    width: width,
    height: height,
    crop: 'fill',
    start_offset: start_offset,
    format: 'jpg',
    secure: true
  });
};

module.exports = {
  cloudinary,
  testCloudinaryConnection,
  getOptimizedVideoUrl,
  getVideoThumbnail
};
