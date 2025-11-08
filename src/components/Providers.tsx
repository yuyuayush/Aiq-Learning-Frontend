"use client";

import { AuthProvider } from "@/contexts/AuthContext";
import { UploadProvider } from "@/contexts/UploadContext";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <UploadProvider>
        {children}
      </UploadProvider>
    </AuthProvider>
  );
}
