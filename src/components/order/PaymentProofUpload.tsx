'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';
import {
  UploadCloud,
  XCircle,
  CheckCircle,
  Loader2,
  File as FileIcon,
  Image as ImageIcon,
  AlertCircle,
  Upload,
  FileText,
  Trash2,
  X
} from 'lucide-react';
import NextImage from 'next/image'; // Renamed to avoid conflict with lucide icon
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress'; // Assuming you have Progress from shadcn/ui
import { useAuth } from '@/hooks/use-auth';
import { motion, AnimatePresence } from 'framer-motion';

const MAX_SIZE_MB = 5;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
const ALLOWED_MIME_TYPES = {
  'image/jpeg': [],
  'image/png': [],
  'image/gif': [],
  'image/webp': [],
  'application/pdf': [],
};
const ALLOWED_EXTENSIONS_STRING = "JPG, PNG, GIF, WEBP, PDF";

interface PaymentProofUploadProps {
  onUploadSuccess: (fileUrl: string, fileName: string) => void;
  onUploadError?: (errorMessage: string) => void;
  orderId?: string; // Add orderId as optional prop
}

const PaymentProofUpload: React.FC<PaymentProofUploadProps> = ({
  onUploadSuccess,
  onUploadError,
  orderId,
}) => {
  const { user } = useAuth(); // Get current user
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null); // Data URL for preview
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{ url: string; name: string; storageType?: string } | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);

  const clearState = (keepSuccess = false) => {
    setFile(null);
    setPreview(null);
    setError(null);
    setUploadProgress(null);
    setIsUploading(false);
    if (!keepSuccess) {
        setSuccessInfo(null);
    }
  };

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      clearState(); // Clear previous state on new drop

      if (fileRejections.length > 0) {
        const firstRejection = fileRejections[0];
        if (firstRejection.errors.some((e) => e.code === 'file-too-large')) {
          setError(`File is too large. Max size: ${MAX_SIZE_MB}MB.`);
        } else if (firstRejection.errors.some((e) => e.code === 'file-invalid-type')) {
          setError(`Invalid file type. Allowed: ${ALLOWED_EXTENSIONS_STRING}.`);
        } else {
          setError(firstRejection.errors[0]?.message || 'File rejected.');
        }
        return;
      }

      if (acceptedFiles.length > 0) {
        const selectedFile = acceptedFiles[0];
        setFile(selectedFile);

        // Generate preview
        if (selectedFile.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onloadend = () => {
            setPreview(reader.result as string);
          };
          reader.readAsDataURL(selectedFile);
        } else {
          setPreview(null); // No preview for non-image files like PDF
        }
      }
    },
    []
  );

  const { getRootProps, getInputProps, isFocused } = useDropzone({
    onDrop,
    accept: ALLOWED_MIME_TYPES,
    maxSize: MAX_SIZE_BYTES,
    maxFiles: 1,
    multiple: false,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
    onDropAccepted: () => setIsDragActive(false),
    onDropRejected: () => setIsDragActive(false),
  });

  const handleUpload = useCallback(async () => {
    if (!file) return;
    if (!user?.id) {
      setError('You must be logged in to upload proof.');
      if (onUploadError) onUploadError('You must be logged in to upload proof.');
      return;
    }
    setIsUploading(true);
    setUploadProgress(0);
    setError(null);
    setSuccessInfo(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', user.id); // Always include userId
    
    // Don't mark as an order screenshot to use Azure storage
    // formData.append('isOrderScreenshot', 'true'); 
    
    if (orderId) {
      formData.append('orderId', orderId); // Include orderId if available
    } else {
      // If somehow no orderId is provided, create a temporary one
      formData.append('orderId', `temp-${Date.now()}`);
    }

    try {
      // NOTE: Standard fetch doesn't support progress easily.
      // For progress, you'd typically use XMLHttpRequest or a library like Axios.
      // Simulating progress for demo purposes, then calling fetch.
      await new Promise(res => setTimeout(res, 200)); setUploadProgress(30);
      await new Promise(res => setTimeout(res, 300)); setUploadProgress(70);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      setUploadProgress(100);
      await new Promise(res => setTimeout(res, 300)); // Short delay to show 100%

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Upload failed');
      }
      
      setSuccessInfo({ 
        url: result.url, 
        name: result.originalName || file.name,
        storageType: result.storageType || 'unknown'
      });
      onUploadSuccess(result.url, result.originalName || file.name);
      setFile(null); // Clear the file state after successful upload

    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred during upload.';
      setError(errorMessage);
      if (onUploadError) onUploadError(errorMessage);
      clearState(); // Clear state on error
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
      // Don't clear file/preview here if success, as successInfo handles the display
    }
  }, [file, onUploadSuccess, onUploadError, user?.id, orderId]);

  // --- Auto-upload Effect --- 
  useEffect(() => {
    if (file && !isUploading && !successInfo) {
      handleUpload();
    }
    // Intentionally not including handleUpload in dependency array
    // as its definition depends on 'file' which is already here.
    // Adding it can cause infinite loops if not careful.
  }, [file, isUploading, successInfo]); 

  const handleRemoveSelection = () => {
    clearState();
    onUploadSuccess('', ''); // Notify parent that proof is removed/cleared
  };

  const getFileTypeIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) {
      return <ImageIcon className="h-4 w-4 text-indigo-500" />;
    }
    return <FileText className="h-4 w-4 text-indigo-500" />;
  };

  const renderSuccessState = () => (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 shadow-sm overflow-hidden"
    >
      <div className="p-4 flex items-center justify-between space-x-3">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="bg-white p-2 rounded-lg shadow-sm border border-green-100">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-green-800">Payment Proof Uploaded</p>
            <div className="flex items-center mt-1">
              {getFileTypeIcon(successInfo?.name || '')}
              <p className="text-xs text-green-700 truncate ml-1.5" title={successInfo?.name}>
                {successInfo?.name}
              </p>
            </div>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleRemoveSelection}
          className="bg-white text-gray-700 hover:text-red-600 p-2 rounded-full border border-gray-200 hover:border-red-200 transition-colors shadow-sm"
        >
          <Trash2 size={16} />
        </motion.button>
      </div>
    </motion.div>
  );

  const renderErrorState = () => (
    <AnimatePresence>
      {error && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="mt-3 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3 shadow-sm"
        >
          <div className="bg-white p-2 rounded-lg shadow-sm border border-red-100">
            <AlertCircle className="h-5 w-5 text-red-600" />
          </div>
          <div className="flex-grow">
            <p className="text-sm font-medium text-red-800">{error}</p>
            <p className="text-xs text-red-600 mt-1">Please try again with a different file.</p>
          </div>
          <button 
            onClick={() => setError(null)} 
            className="bg-white text-gray-500 hover:text-red-600 p-1.5 rounded-full border border-gray-200 hover:border-red-200 transition-colors"
          >
            <X size={14} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const dropzoneClassName = useMemo(() => {
    let baseClasses = "relative p-6 sm:p-8 border-2 border-dashed rounded-xl text-center transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-indigo-500 bg-gradient-to-br";
    if (isUploading) {
        baseClasses += " opacity-80 cursor-default from-indigo-50 to-indigo-100 border-indigo-300"; 
    }
    else if (isDragActive) {
      baseClasses += " from-indigo-50 to-purple-50 border-indigo-400 shadow-md";
    } else if (isFocused) {
      baseClasses += " from-gray-50 to-indigo-50 border-indigo-300";
    } else {
      baseClasses += " from-gray-50 to-white border-gray-300 hover:border-indigo-300 hover:from-gray-50 hover:to-indigo-50";
    }
    return baseClasses;
  }, [isDragActive, isFocused, isUploading]);

  return (
    <div className="mb-8">
      <div className="flex items-center mb-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="p-2 mr-3 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
        >
          <Upload size={20} />
        </motion.div>
        <div>
          <h3 className="text-lg font-bold text-gray-800">Payment Proof</h3>
          <p className="text-sm text-gray-500">Upload a clear screenshot or PDF of your transaction receipt</p>
        </div>
          </div>

      {/* Display Success Info */}
      {successInfo && renderSuccessState()}

      {/* Display Error */}
      {renderErrorState()}

      {/* Display Dropzone and Preview/Upload controls (only if no success yet) */} 
      {!successInfo && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="group"
        >
        <div {...getRootProps()} className={dropzoneClassName}>
          <input {...getInputProps()} disabled={isUploading} />
            
            {/* Animated Background */}
            <div className="absolute inset-0 rounded-xl overflow-hidden">
              {isDragActive && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.1 }}
                  className="absolute inset-0 bg-indigo-600 z-0"
                />
              )}
            </div>
            
            <div className="relative z-10">
              {isUploading ? (
                <div className="flex flex-col items-center justify-center text-indigo-600 py-8">
                  <div className="relative">
                    <div className="h-16 w-16 rounded-full border-4 border-indigo-100 flex items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                    </div>
                    {uploadProgress !== null && uploadProgress >= 100 && (
                      <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -right-1 -top-1 bg-green-500 rounded-full p-1"
                      >
                        <CheckCircle className="h-5 w-5 text-white" />
                      </motion.div>
                    )}
                  </div>
                  <p className="text-base font-medium mt-4 text-indigo-700">
                    {uploadProgress === 100 ? 'Processing upload...' : 'Uploading payment proof...'}
                  </p>
                 {uploadProgress !== null && (
                    <div className="w-3/4 mt-4">
                      <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${uploadProgress}%` }}
                          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                        />
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-xs text-gray-500">Uploading</span>
                        <span className="text-xs font-medium text-indigo-700">{uploadProgress}%</span>
                      </div>
                    </div>
                 )}
              </div>
            ) : file ? (
                <div className="flex flex-col items-center text-center py-8">
                 {preview ? (
                    <div className="relative bg-white p-2 rounded-xl shadow-sm border border-gray-200 mb-3">
                      <NextImage 
                        src={preview} 
                        alt="Preview" 
                        width={120} 
                        height={120} 
                        className="rounded-lg object-cover h-28 w-28" 
                      />
                    </div>
                  ) : (
                    <div className="bg-indigo-100 rounded-xl p-6 mb-3">
                      <FileIcon className="h-12 w-12 text-indigo-600" />
                    </div>
                  )}
                  <p className="text-base font-medium text-gray-800">{file.name}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
               </div>
            ) : (
                <div className="py-8">
                  <div className={`mx-auto bg-white rounded-full p-4 mb-4 w-20 h-20 flex items-center justify-center shadow-sm border border-gray-200 group-hover:border-indigo-300 transition-colors ${isDragActive ? 'border-indigo-400 bg-indigo-50' : ''}`}>
                    <UploadCloud className={`h-10 w-10 ${isDragActive ? 'text-indigo-600' : 'text-gray-400 group-hover:text-indigo-500'} transition-colors`} />
                  </div>
                  <p className={`text-base font-medium ${isDragActive ? 'text-indigo-700' : 'text-gray-700'}`}>
                    {isDragActive ? 'Drop to upload' : 'Drag & drop payment proof here'}
                  </p>
                  <p className="text-sm text-gray-500 mt-2 mb-3">
                    or click to browse files
                  </p>
                  <p className="text-xs text-gray-400 max-w-xs mx-auto">
                    Accepted file types: {ALLOWED_EXTENSIONS_STRING} (Max {MAX_SIZE_MB}MB)
                  </p>
                </div>
              )}
            </div>
        </div>
        </motion.div>
      )}
    </div>
  );
};

export default PaymentProofUpload; 