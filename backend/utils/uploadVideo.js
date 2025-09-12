const { cloudinary } = require('../config/cloudinary');
const fs = require('fs');

/**
 * Upload video file to Cloudinary
 * @param {string} filePath - Local file path to upload
 * @param {Object} options - Upload options
 * @returns {Object} Upload result with video details
 */
const uploadVideo = async (filePath, options = {}) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: 'video',
      folder: 'safeed/videos',
      quality: 'auto:best',
      format: 'mp4',
      transformation: [
        { width: 1280, height: 720, crop: 'limit' }, // Limit max size
        { quality: 'auto:best' },
        { fetch_format: 'auto' }
      ],
      eager: [
        { width: 800, height: 450, crop: 'fill', quality: 'auto', format: 'mp4' },
        { width: 400, height: 225, crop: 'fill', start_offset: '2.0', format: 'jpg' }
      ],
      ...options
    });
    
    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      duration: result.duration,
      width: result.width,
      height: result.height,
      size: result.bytes,
      format: result.format,
      createdAt: result.created_at,
      thumbnailUrl: result.eager && result.eager[1] ? result.eager[1].secure_url : null,
      optimizedUrl: result.eager && result.eager[0] ? result.eager[0].secure_url : result.secure_url
    };
  } catch (error) {
    console.error('Video upload error:', error);
    return {
      success: false,
      error: error.message,
      details: error
    };
  }
};

/**
 * Upload video from URL to Cloudinary
 * @param {string} videoUrl - Video URL to upload
 * @param {Object} options - Upload options
 * @returns {Object} Upload result
 */
const uploadVideoFromUrl = async (videoUrl, options = {}) => {
  try {
    const result = await cloudinary.uploader.upload(videoUrl, {
      resource_type: 'video',
      folder: 'safeed/videos',
      quality: 'auto:best',
      format: 'mp4',
      ...options
    });
    
    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      duration: result.duration,
      width: result.width,
      height: result.height,
      size: result.bytes
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Delete video from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @returns {Object} Deletion result
 */
const deleteVideo = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: 'video'
    });
    
    return {
      success: result.result === 'ok',
      result: result.result
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get video details from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @returns {Object} Video details
 */
const getVideoDetails = async (publicId) => {
  try {
    const result = await cloudinary.api.resource(publicId, {
      resource_type: 'video'
    });
    
    return {
      success: true,
      video: {
        publicId: result.public_id,
        url: result.secure_url,
        duration: result.duration,
        width: result.width,
        height: result.height,
        size: result.bytes,
        format: result.format,
        createdAt: result.created_at
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Clean up local uploaded file
 * @param {string} filePath - Path to file to delete
 */
const cleanupLocalFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`✅ Cleaned up local file: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error cleaning up file ${filePath}:`, error.message);
  }
};

/**
 * Validate video file
 * @param {Object} file - Multer file object
 * @returns {Object} Validation result
 */
const validateVideoFile = (file) => {
  const allowedMimeTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/flv', 'video/webm'];
  const maxSize = 100 * 1024 * 1024; // 100MB
  
  if (!file) {
    return { isValid: false, error: 'No file provided' };
  }
  
  if (!allowedMimeTypes.includes(file.mimetype)) {
    return { isValid: false, error: 'Invalid file type. Only video files are allowed.' };
  }
  
  if (file.size > maxSize) {
    return { isValid: false, error: 'File size too large. Maximum size is 100MB.' };
  }
  
  return { isValid: true };
};

module.exports = {
  uploadVideo,
  uploadVideoFromUrl,
  deleteVideo,
  getVideoDetails,
  cleanupLocalFile,
  validateVideoFile
};
