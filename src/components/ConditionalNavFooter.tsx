"use client";

import { usePathname } from 'next/navigation';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface ConditionalNavFooterProps {
  children: React.ReactNode;
}

export default function ConditionalNavFooter({ children }: ConditionalNavFooterProps) {
  const pathname = usePathname();
  
  // Show navbar and footer only on landing page (root path)
  const showNavAndFooter = pathname === '/';

  return (
    <>
      {showNavAndFooter && <Navbar />}
      {children}
      {showNavAndFooter && <Footer />}
    </>
  );
}