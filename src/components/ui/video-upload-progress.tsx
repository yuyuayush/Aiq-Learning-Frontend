"use client";

import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { CheckCircle, Upload, X } from "lucide-react";

interface VideoUploadProgressProps {
  isOpen: boolean;
  progress: number;
  fileName: string;
  isComplete: boolean;
  isError: boolean;
  errorMessage?: string;
  onClose: () => void;
  onCancel?: () => void;
}

export function VideoUploadProgress({
  isOpen,
  progress,
  fileName,
  isComplete,
  isError,
  errorMessage,
  onClose,
  onCancel
}: VideoUploadProgressProps) {
  const [showWarning, setShowWarning] = useState(false);

  // Prevent page reload during upload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isOpen && !isComplete && !isError) {
        e.preventDefault();
        e.returnValue = "Video upload is in progress. All changes will be lost if you leave now.";
        return e.returnValue;
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent F5 refresh during upload
      if ((e.key === "F5" || (e.ctrlKey && e.key === "r")) && isOpen && !isComplete && !isError) {
        e.preventDefault();
        setShowWarning(true);
        setTimeout(() => setShowWarning(false), 3000);
      }
    };

    if (isOpen) {
      window.addEventListener("beforeunload", handleBeforeUnload);
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isComplete, isError]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Blur backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      
      {/* Modal content */}
      <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-2xl p-8 max-w-md w-full mx-4 border">
        <div className="text-center space-y-6">
          {/* Icon */}
          <div className="flex justify-center">
            {isError ? (
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                <X className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
            ) : isComplete ? (
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
            ) : (
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                <Upload className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-pulse" />
              </div>
            )}
          </div>

          {/* Title */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {isError ? "Upload Failed" : isComplete ? "Upload Complete!" : "Uploading Video..."}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 truncate">
              {fileName}
            </p>
          </div>

          {/* Progress */}
          {!isError && (
            <div className="space-y-3">
              <Progress value={progress} className="h-3" />
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>{progress.toFixed(1)}% complete</span>
                <span>{isComplete ? "Done" : "Uploading..."}</span>
              </div>
            </div>
          )}

          {/* Error message */}
          {isError && errorMessage && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-md">
              <p className="text-sm text-red-700 dark:text-red-400">
                {errorMessage}
              </p>
            </div>
          )}

          {/* Warning message for refresh attempts */}
          {showWarning && (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-md border border-yellow-200 dark:border-yellow-800">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                ⚠️ Upload in progress! Please wait for completion.
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3 justify-center">
            {isComplete || isError ? (
              <Button onClick={onClose} className="min-w-[100px]">
                {isError ? "Close" : "Continue"}
              </Button>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  onClick={onCancel}
                  disabled={!onCancel}
                  className="min-w-[100px]"
                >
                  Cancel
                </Button>
                <Button disabled className="min-w-[100px]">
                  Please Wait...
                </Button>
              </>
            )}
          </div>

          {/* Upload info */}
          {!isComplete && !isError && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Do not close this tab or refresh the page during upload
            </p>
          )}
        </div>
      </div>
    </div>
  );
}