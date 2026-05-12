'use client';

import React from 'react';

interface TableColumn {
  key: string;
  label: string;
  className?: string;
  render?: (value: any, row: any, idx: number) => React.ReactNode;
}

interface AdminTableProps {
  title: string;
  columns: TableColumn[];
  data: any[];
  onViewMore?: () => void;
  emptyMessage?: string;
}

export default function AdminTable({
  title,
  columns,
  data,
  onViewMore,
  emptyMessage = 'No data available',
}: AdminTableProps) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 md:p-6 border-b border-white/10">
        <h3 className="text-lg font-black text-white uppercase tracking-wide">{title}</h3>
        {onViewMore && (
          <button
            onClick={onViewMore}
            className="text-xs font-bold text-[#E63C2F] hover:text-[#E63C2F]/80 uppercase tracking-wider"
          >
            View All →
          </button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          {/* Column Headers */}
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.02]">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 md:px-6 py-3 text-left text-[10px] md:text-xs font-bold uppercase tracking-wider text-white/40 ${col.className || ''
                    }`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {data.length > 0 ? (
              data.map((row, rowIdx) => (
                <tr
                  key={rowIdx}
                  className="border-b border-white/5 hover:bg-white/[0.03] transition-colors"
                >
                  {columns.map((col) => (
                    <td
                      key={`${rowIdx}-${col.key}`}
                      className={`px-4 md:px-6 py-3 text-sm text-white/75 ${col.className || ''
                        }`}
                    >
                      {col.render
                        ? col.render(row[col.key], row, rowIdx)
                        : row[col.key] || '-'}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-4 md:px-6 py-8 text-center">
                  <p className="text-sm text-white/40">{emptyMessage}</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
