'use client';

import React from 'react';

interface VersionSelectorProps {
  versions: Array<{ id: string; label: string; date?: string }>;
  activeVersion: string;
  onVersionChange: (versionId: string) => void;
  maxVisible?: number;
}

export default function VersionSelector({
  versions,
  activeVersion,
  onVersionChange,
  maxVisible = 8,
}: VersionSelectorProps) {
  if (!versions.length) return null;

  const displayVersions = versions.slice(0, maxVisible);
  const hasMore = versions.length > maxVisible;

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-xs font-bold uppercase tracking-wider text-white/40 mb-3">
        Saved Versions
      </p>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {displayVersions.map((version) => (
          <button
            key={version.id}
            onClick={() => onVersionChange(version.id)}
            className={`px-3 py-2 rounded-lg whitespace-nowrap text-xs font-bold uppercase tracking-wider transition-all ${
              activeVersion === version.id
                ? 'bg-[#E63C2F] text-white'
                : 'border border-white/20 text-white/60 hover:border-white/40 hover:text-white/80'
            }`}
          >
            {version.label}
          </button>
        ))}
        {hasMore && (
          <div className="flex items-center px-2 text-xs text-white/40">
            +{versions.length - maxVisible}
          </div>
        )}
      </div>
    </div>
  );
}
