'use client';

import React from 'react';

interface AdminLayoutProps {
  sidebar?: React.ReactNode;
  header: React.ReactNode;
  children: React.ReactNode;
}

export default function AdminLayout({
  header,
  children,
}: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      {/* Header */}
      <div className="border-b border-white/10 bg-[#0D0D0D]/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="px-4 md:px-8 py-4">{header}</div>
      </div>

      {/* Content */}
      <div className="p-4 md:p-8 overflow-auto">
        {children}
      </div>
    </div>
  );
}
