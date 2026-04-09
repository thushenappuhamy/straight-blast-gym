"use client";

import React, { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  SortingState,
  Row,
  Cell,
} from "@tanstack/react-table";
import { ChevronUp, ChevronDown, Check, X } from "lucide-react";

export function AdvancedMembersTable({
  data,
  onViewDetails,
}: {
  data: any[];
  onViewDetails: (member: any) => void;
}) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  const columns = useMemo(
    () => [
      {
        id: "select",
        header: ({ table }: any) => (
          <input
            type="checkbox"
            checked={table.getIsAllRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
            className="w-4 h-4 cursor-pointer"
          />
        ),
        cell: ({ row }: any) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
            className="w-4 h-4 cursor-pointer"
          />
        ),
        width: 40,
      },
      {
        id: "member",
        header: "Member",
        accessorKey: "name",
        cell: ({ row }: any) => (
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#F4D03F] to-yellow-600 flex items-center justify-center text-black font-bold text-xs">
              {row.original.name?.[0]?.toUpperCase() || "?"}
            </div>
            <div>
              <div className="font-bold text-gray-900">{row.original.name}</div>
              <div className="text-gray-500 text-xs">{row.original.email}</div>
            </div>
          </div>
        ),
      },
      {
        id: "plan",
        header: ({ column }: any) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-1 hover:text-[#F4D03F] transition"
          >
            Plan
            {column.getIsSorted() === "asc" ? (
              <ChevronUp size={14} />
            ) : column.getIsSorted() === "desc" ? (
              <ChevronDown size={14} />
            ) : (
              <div className="w-4 h-4" />
            )}
          </button>
        ),
        accessorKey: "plan",
        cell: ({ row }: any) => {
          const planColors: Record<string, string> = {
            GOLD: "bg-[#F4D03F] text-black",
            BASIC: "bg-gray-200 text-gray-800",
            ELITE: "bg-black text-white",
          };
          return (
            <span className={`px-3 py-1 text-xs font-black rounded ${planColors[row.original.plan] || "bg-gray-100"}`}>
              {row.original.plan}
            </span>
          );
        },
      },
      {
        id: "status",
        header: ({ column }: any) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-1 hover:text-[#F4D03F] transition"
          >
            Status
            {column.getIsSorted() === "asc" ? (
              <ChevronUp size={14} />
            ) : column.getIsSorted() === "desc" ? (
              <ChevronDown size={14} />
            ) : (
              <div className="w-4 h-4" />
            )}
          </button>
        ),
        accessorKey: "status",
        cell: ({ row }: any) => {
          const statusText = row.original.status || "UNKNOWN";
          const isActive = statusText === "ACTIVE" || statusText === "active";
          return (
            <div className="flex items-center gap-2">
              {isActive ? (
                <Check size={16} className="text-green-600" />
              ) : (
                <X size={16} className="text-red-600" />
              )}
              <span className={`text-xs font-bold uppercase ${isActive ? "text-green-600" : "text-red-600"}`}>
                {statusText}
              </span>
            </div>
          );
        },
      },
      {
        id: "joined",
        header: ({ column }: any) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-1 hover:text-[#F4D03F] transition"
          >
            Joined
            {column.getIsSorted() === "asc" ? (
              <ChevronUp size={14} />
            ) : column.getIsSorted() === "desc" ? (
              <ChevronDown size={14} />
            ) : (
              <div className="w-4 h-4" />
            )}
          </button>
        ),
        accessorKey: "joined",
        cell: ({ row }: any) => (
          <div className="text-sm text-gray-700">{row.original.joined || "N/A"}</div>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }: any) => (
          <button
            onClick={() => onViewDetails(row.original)}
            className="text-xs font-bold text-[#F4D03F] hover:text-[#E5C730] hover:underline transition"
          >
            View Details
          </button>
        ),
      },
    ],
    [onViewDetails]
  );

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const selectedCount = table.getFilteredSelectedRowModel().rows.length;

  return (
    <div className="space-y-4">
      {/* Bulk Actions Bar */}
      {selectedCount > 0 && (
        <div className="bg-[#F4D03F]/10 border border-[#F4D03F]/30 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={table.getIsAllRowsSelected()}
              onChange={table.getToggleAllRowsSelectedHandler()}
              className="w-4 h-4"
            />
            <span className="text-sm font-bold text-[#F4D03F]">
              {selectedCount} member{selectedCount !== 1 ? "s" : ""} selected
            </span>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-[#F4D03F] text-black font-bold text-sm rounded hover:bg-[#E5C730] transition">
              Send Email
            </button>
            <button className="px-4 py-2 border border-[#F4D03F] text-[#F4D03F] font-bold text-sm rounded hover:bg-[#F4D03F]/10 transition">
              Export CSV
            </button>
            <button className="px-4 py-2 border border-red-500/50 text-red-500 font-bold text-sm rounded hover:bg-red-500/10 transition">
              Deactivate
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full bg-white">
          <thead className="bg-[#2B2621] border-b border-gray-200">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-6 py-4 text-left text-xs font-black text-[#F4D03F] uppercase tracking-wider"
                  >
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-gray-200">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50 transition">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-6 py-4">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{" "}
          {Math.min(
            (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
            table.getFilteredRowModel().rows.length
          )}{" "}
          of {table.getFilteredRowModel().rows.length} members
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="px-4 py-2 border border-gray-300 rounded text-sm font-bold disabled:opacity-50 hover:bg-gray-100 transition"
          >
            Previous
          </button>
          <div className="flex items-center gap-2">
            {Array.from({ length: table.getPageCount() }).map((_, i) => (
              <button
                key={i}
                onClick={() => table.setPageIndex(i)}
                className={`px-3 py-2 rounded text-xs font-bold transition ${
                  table.getState().pagination.pageIndex === i
                    ? "bg-[#F4D03F] text-black"
                    : "border border-gray-300 text-gray-700 hover:bg-gray-100"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="px-4 py-2 border border-gray-300 rounded text-sm font-bold disabled:opacity-50 hover:bg-gray-100 transition"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}