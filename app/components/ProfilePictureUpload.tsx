"use client";

import { useState, useRef } from "react";
import Image from "next/image";

interface ProfilePictureUploadProps {
  currentImage?: string;
  onImageChange: (imageUrl: string) => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
}

export default function ProfilePictureUpload({ 
  currentImage, 
  onImageChange, 
  size = 'md',
  className = '',
  disabled = false
}: ProfilePictureUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setIsUploading(true);

    try {
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPreview(result);
        onImageChange(result);
      };
      reader.readAsDataURL(file);

      // In a real app, you would upload to a cloud service like AWS S3, Cloudinary, etc.
      // For now, we'll just use the data URL
      console.log('File uploaded:', file.name);
      
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setPreview(null);
    onImageChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="relative">
        {/* Profile Picture Display */}
        <div 
          className={`${sizeClasses[size]} rounded-full bg-gradient-to-r from-[#FFBF00] to-[#FFD700] flex items-center justify-center transition-opacity duration-200 relative overflow-hidden ${
            disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:opacity-80'
          }`}
          onClick={handleClick}
        >
          {preview ? (
            <Image
              src={preview}
              alt="Profile picture"
              fill
              className="object-cover rounded-full"
            />
          ) : (
            <span className="text-2xl font-bold text-black">
              {size === 'sm' ? '👤' : size === 'md' ? '👤' : '👤'}
            </span>
          )}
          
          {/* Upload Overlay */}
          {!disabled && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200">
              <span className="text-white text-sm font-medium">
                {isUploading ? 'Uploading...' : 'Change'}
              </span>
            </div>
          )}
        </div>

        {/* Upload Progress */}
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Action Buttons */}
      {!disabled && (
        <div className="flex gap-2 mt-4">
          <button
            onClick={handleClick}
            disabled={isUploading}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-medium rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {preview ? 'Change Photo' : 'Upload Photo'}
          </button>
          
          {preview && (
            <button
              onClick={handleRemoveImage}
              disabled={isUploading}
              className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-medium rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Remove
            </button>
          )}
        </div>
      )}

      {/* Upload Guidelines */}
      <div className="mt-3 text-center">
        {disabled ? (
          <p className="text-xs text-gray-500">
            Click "Edit Profile" to change your photo
          </p>
        ) : (
          <>
            <p className="text-xs text-gray-600">
              JPG, PNG or GIF. Max size 5MB.
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Recommended: {size === 'sm' ? '64x64px' : size === 'md' ? '128x128px' : '256x256px'}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
