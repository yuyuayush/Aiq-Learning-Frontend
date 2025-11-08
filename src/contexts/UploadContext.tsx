"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';
import { VideoUploadProgress } from '@/components/ui/video-upload-progress';

interface UploadProgress {
  isVisible: boolean;
  progress: number;
  fileName: string;
  isComplete: boolean;
  isError: boolean;
  errorMessage: string;
}

interface UploadContextType {
  uploadProgress: UploadProgress;
  showUploadProgress: (fileName?: string) => void;
  updateUploadProgress: (progress: number) => void;
  setUploadFileName: (fileName: string) => void;
  setUploadComplete: (onCompleteCallback?: () => void) => void;
  setUploadError: (error: string) => void;
  hideUploadProgress: () => void;
}

const UploadContext = createContext<UploadContextType | undefined>(undefined);

export function UploadProvider({ children }: { children: React.ReactNode }) {
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    isVisible: false,
    progress: 0,
    fileName: '',
    isComplete: false,
    isError: false,
    errorMessage: ''
  });
  const [onCompleteCallback, setOnCompleteCallback] = useState<(() => void) | null>(null);

  const showUploadProgress = useCallback((fileName: string = '') => {
    console.log('🌐 Global upload progress: showing modal');
    setUploadProgress({
      isVisible: true,
      progress: 0,
      fileName,
      isComplete: false,
      isError: false,
      errorMessage: ''
    });
  }, []);

  const updateUploadProgress = useCallback((progress: number) => {
    console.log('🌐 Global upload progress: updating progress to', progress);
    setUploadProgress(prev => ({
      ...prev,
      progress
    }));
  }, []);

  const setUploadFileName = useCallback((fileName: string) => {
    console.log('🌐 Global upload progress: setting filename to', fileName);
    setUploadProgress(prev => ({
      ...prev,
      fileName
    }));
  }, []);

  const setUploadComplete = useCallback((callback?: () => void) => {
    console.log('🌐 Global upload progress: setting complete');
    setUploadProgress(prev => ({
      ...prev,
      progress: 100,
      isComplete: true
    }));
    if (callback) {
      setOnCompleteCallback(() => callback);
    }
  }, []);

  const setUploadError = useCallback((error: string) => {
    console.log('🌐 Global upload progress: setting error', error);
    setUploadProgress(prev => ({
      ...prev,
      isError: true,
      errorMessage: error
    }));
  }, []);

  const hideUploadProgress = useCallback(() => {
    console.log('🌐 Global upload progress: hiding modal');
    setUploadProgress(prev => ({
      ...prev,
      isVisible: false
    }));
    
    // Execute completion callback if available
    if (onCompleteCallback) {
      console.log('🌐 Executing completion callback');
      onCompleteCallback();
      setOnCompleteCallback(null);
    }
  }, [onCompleteCallback]);

  return (
    <UploadContext.Provider value={{
      uploadProgress,
      showUploadProgress,
      updateUploadProgress,
      setUploadFileName,
      setUploadComplete,
      setUploadError,
      hideUploadProgress
    }}>
      {children}
      
      {/* Global Upload Progress Modal */}
      <VideoUploadProgress
        isOpen={uploadProgress.isVisible}
        progress={uploadProgress.progress}
        fileName={uploadProgress.fileName}
        isComplete={uploadProgress.isComplete}
        isError={uploadProgress.isError}
        errorMessage={uploadProgress.errorMessage}
        onClose={hideUploadProgress}
        onCancel={() => {
          // TODO: Implement upload cancellation if needed
          hideUploadProgress();
        }}
      />
    </UploadContext.Provider>
  );
}

export function useUpload() {
  const context = useContext(UploadContext);
  if (context === undefined) {
    throw new Error('useUpload must be used within an UploadProvider');
  }
  return context;
}