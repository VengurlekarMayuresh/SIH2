import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, CheckCircle, AlertCircle, Film, Cloud } from 'lucide-react';
import { apiClient } from '@/utils/api';

interface VideoUploadProps {
  onVideoUploaded: (videoData: VideoData) => void;
  onError?: (error: string) => void;
  maxFileSize?: number; // in MB
  acceptedFormats?: string[];
  className?: string;
}

interface VideoData {
  url: string;
  optimizedUrl?: string;
  thumbnailUrl?: string;
  publicId: string;
  duration: number;
  size: number;
  width: number;
  height: number;
  format: string;
  uploadedAt: string;
}

const VideoUpload: React.FC<VideoUploadProps> = ({
  onVideoUploaded,
  onError,
  maxFileSize = 100, // 100MB default
  acceptedFormats = ['mp4', 'mov', 'avi', 'wmv', 'flv', 'webm'],
  className = ""
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedVideo, setUploadedVideo] = useState<VideoData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [urlUpload, setUrlUpload] = useState('');
  const [uploadMode, setUploadMode] = useState<'file' | 'url'>('file');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxFileSize * 1024 * 1024) {
      return `File size must be less than ${maxFileSize}MB`;
    }

    // Check file format
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!fileExtension || !acceptedFormats.includes(fileExtension)) {
      return `Only ${acceptedFormats.join(', ')} files are allowed`;
    }

    // Check MIME type
    if (!file.type.startsWith('video/')) {
      return 'Please select a valid video file';
    }

    return null;
  };

  const handleFileSelect = useCallback((file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      onError?.(validationError);
      return;
    }

    setError(null);
    setPreviewFile(file);
  }, [maxFileSize, acceptedFormats, onError]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      handleFileSelect(file);
    }
  };

  const uploadFile = async () => {
    if (!previewFile) return;

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    const formData = new FormData();
    formData.append('video', previewFile);
    formData.append('title', previewFile.name);
    formData.append('description', 'Educational video uploaded to SafeEd platform');

    try {
      const response = await apiClient.post('/institution/upload-video', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(progress);
          }
        }
      });

      if (response.data.video) {
        setUploadedVideo(response.data.video);
        onVideoUploaded(response.data.video);
        setPreviewFile(null);
        
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Upload failed. Please try again.';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const uploadFromUrl = async () => {
    if (!urlUpload.trim()) return;

    setIsUploading(true);
    setError(null);

    try {
      const response = await apiClient.post('/institution/upload-video-from-url', {
        videoUrl: urlUpload,
        title: 'Imported Video',
        description: 'Video imported from URL to SafeEd platform'
      });

      if (response.data.video) {
        setUploadedVideo(response.data.video);
        onVideoUploaded(response.data.video);
        setUrlUpload('');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'URL upload failed. Please try again.';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`video-upload-container ${className}`}>
      {/* Upload Mode Tabs */}
      <div className="flex mb-4 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        <button
          onClick={() => setUploadMode('file')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors duration-200 ${
            uploadMode === 'file'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Upload className="w-4 h-4 inline mr-2" />
          Upload File
        </button>
        <button
          onClick={() => setUploadMode('url')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors duration-200 ${
            uploadMode === 'url'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Cloud className="w-4 h-4 inline mr-2" />
          From URL
        </button>
      </div>

      {uploadMode === 'file' ? (
        <div>
          {/* File Upload Area */}
          <div
            className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors duration-200 ${
              isDragging
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : error
                ? 'border-red-300 bg-red-50 dark:bg-red-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDrag}
            onDragEnter={handleDragIn}
            onDragLeave={handleDragOut}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleFileInputChange}
              className="hidden"
            />
            
            <div className="space-y-4">
              <div className="flex justify-center">
                <Film className={`w-12 h-12 ${error ? 'text-red-400' : 'text-gray-400'}`} />
              </div>
              
              <div>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {isDragging ? 'Drop video here' : 'Upload video file'}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Drag and drop or click to select
                </p>
              </div>
              
              <div className="text-xs text-gray-500 dark:text-gray-400">
                <p>Supported formats: {acceptedFormats.join(', ').toUpperCase()}</p>
                <p>Maximum size: {maxFileSize}MB</p>
              </div>
            </div>
          </div>

          {/* File Preview */}
          {previewFile && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Film className="w-8 h-8 text-blue-500" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {previewFile.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formatFileSize(previewFile.size)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setPreviewFile(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <button
                onClick={uploadFile}
                disabled={isUploading}
                className="mt-3 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg transition-colors duration-200 disabled:cursor-not-allowed"
              >
                {isUploading ? `Uploading... ${uploadProgress}%` : 'Upload to Cloudinary'}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div>
          {/* URL Upload */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Video URL
              </label>
              <input
                type="url"
                value={urlUpload}
                onChange={(e) => setUrlUpload(e.target.value)}
                placeholder="https://example.com/video.mp4"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            <button
              onClick={uploadFromUrl}
              disabled={isUploading || !urlUpload.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg transition-colors duration-200 disabled:cursor-not-allowed"
            >
              {isUploading ? 'Importing Video...' : 'Import from URL'}
            </button>
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {isUploading && uploadProgress > 0 && (
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
            <span>Uploading...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start space-x-2">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Success Message */}
      {uploadedVideo && (
        <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-start space-x-2">
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-800 dark:text-green-400">
                Video uploaded successfully!
              </p>
              <div className="mt-2 text-xs text-green-600 dark:text-green-500 space-y-1">
                <p>Duration: {formatDuration(uploadedVideo.duration)}</p>
                <p>Size: {formatFileSize(uploadedVideo.size)}</p>
                <p>Resolution: {uploadedVideo.width}×{uploadedVideo.height}</p>
                <p>Format: {uploadedVideo.format.toUpperCase()}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoUpload;
