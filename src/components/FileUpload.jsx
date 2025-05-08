import { useRef, useState } from 'react';

const FileUpload = ({ onFileChange, isConverting }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (isConverting) return;
    
    const files = e.dataTransfer.files;
    processFile(files[0]);
  };

  const handleFileInputChange = (e) => {
    if (isConverting) return;
    processFile(e.target.files[0]);
  };

  const processFile = (file) => {
    if (!file) return;
    
    if (!file.type.startsWith('video/')) {
      alert('Please upload a valid video file.');
      return;
    }
    
    onFileChange(file);
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-6 text-center ${
        isDragging ? 'border-primary bg-blue-50' : 'border-gray-300'
      } ${isConverting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={isConverting ? undefined : triggerFileInput}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={handleFileInputChange}
        disabled={isConverting}
      />
      
      <div className="flex flex-col items-center justify-center space-y-2">
        <svg 
          className="w-12 h-12 text-gray-400" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2" 
            d="M7 4v16M17 4v16M3 8h18M3 16h18"
          />
        </svg>
        <p className="text-lg font-medium text-gray-600">
          {isDragging ? 'Drop your video here' : 'Drag and drop your video here'}
        </p>
        <p className="text-sm text-gray-500">or</p>
        <button
          type="button"
          className="btn-primary"
          disabled={isConverting}
        >
          Browse Files
        </button>
        <p className="text-xs text-gray-500 mt-2">
          Supports: MP4, AVI, MOV, MKV, WEBM, FLV, WMV, etc.
        </p>
      </div>
    </div>
  );
};

export default FileUpload;