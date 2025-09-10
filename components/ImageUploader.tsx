import React, { useState, useCallback, useEffect, useRef } from 'react';
import { InputImage } from '../types';
import { fileToInputImage } from '../utils/fileUtils';
import { UploadIcon, TrashIcon } from './Icon';

interface ImageUploaderProps {
  onImagesChange: (images: InputImage[]) => void;
  maxImages: number;
  disabled: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImagesChange, maxImages, disabled }) => {
  const [images, setImages] = useState<InputImage[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    onImagesChange(images);
  }, [images, onImagesChange]);
  
  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files) return;
    const fileArray = Array.from(files).slice(0, maxImages - images.length);
    
    const imagePromises = fileArray
      .filter(file => file.type.startsWith('image/'))
      .map(file => fileToInputImage(file));
      
    const newImages = await Promise.all(imagePromises);
    setImages(prev => [...prev, ...newImages].slice(0, maxImages));

  }, [images.length, maxImages]);
  
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if(!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if(!disabled) {
        handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };
  
  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };
  
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  if (disabled) {
    return (
      <div className="h-40 flex items-center justify-center bg-gray-900/50 border-2 border-dashed border-gray-700 rounded-2xl opacity-50">
        <p className="text-gray-500">此模式禁用圖片上傳。</p>
      </div>
    );
  }

  return (
    <div>
      <div 
        onClick={triggerFileInput}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`h-40 flex flex-col items-center justify-center p-4 bg-gray-900 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 ${isDragging ? 'border-purple-500 bg-purple-900/20' : 'border-gray-700 hover:border-purple-600'}`}
      >
        <input 
          type="file" 
          ref={fileInputRef}
          multiple 
          accept="image/*" 
          className="hidden" 
          onChange={handleFileChange}
          disabled={images.length >= maxImages}
        />
        <UploadIcon />
        <p className="mt-2 text-sm text-gray-400">
          <span className="font-semibold text-purple-400">點擊上傳</span> 或拖放檔案
        </p>
        <p className="text-xs text-gray-500">最多 {maxImages} 張圖片</p>
      </div>

      {images.length > 0 && (
        <div className="mt-4 grid grid-cols-3 sm:grid-cols-5 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative group aspect-square">
              <img src={`data:${image.mimeType};base64,${image.base64}`} alt={image.name} className="w-full h-full object-cover rounded-lg shadow-md" />
              <button
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="移除圖片"
              >
                <TrashIcon />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;