import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { Input } from './Input';

export interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string | number;
  onSearch?: (query: string) => void;
  searchPlaceholder?: string;
  isLoading?: boolean;
  emptyMessage?: string;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  onSearch,
  searchPlaceholder = 'Search...',
  isLoading,
  emptyMessage = 'No data available',
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const totalPages = Math.ceil(data.length / itemsPerPage);

  // Reset to page 1 if data changes significantly (like filtering)
  useEffect(() => {
    setCurrentPage(1);
  }, [data.length]);

  const currentData = data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, data.length);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-fade-in transition-all duration-300">
      {onSearch && (
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="w-72">
            <Input 
              icon={<Search size={16} />}
              placeholder={searchPlaceholder}
              onChange={(e) => onSearch(e.target.value)}
            />
          </div>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-slate-500 font-medium border-b border-gray-200 uppercase text-xs tracking-wider">
            <tr>
              {columns.map((col, i) => (
                <th key={i} className={`px-6 py-4 ${col.className || ''}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-8 text-center text-slate-500">
                  <div className="animate-pulse flex space-x-4 justify-center">
                    <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-8 text-center text-slate-500">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              currentData.map((row, index) => (
                <tr 
                  key={keyExtractor(row)} 
                  className="hover:bg-brand-50/30 transition-colors cursor-pointer group"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {columns.map((col, i) => (
                    <td key={i} className={`px-6 py-4 text-slate-700 whitespace-nowrap group-hover:text-brand-900 transition-colors ${col.className || ''}`}>
                      {typeof col.accessor === 'function' ? col.accessor(row) : row[col.accessor] as React.ReactNode}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination Footer */}
      {!isLoading && data.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <span className="text-sm text-slate-500">
            Showing <span className="font-medium text-slate-800">{startItem}</span> to <span className="font-medium text-slate-800">{endItem}</span> of <span className="font-medium text-slate-800">{data.length}</span> results
          </span>
          <div className="flex items-center space-x-2">
            <button 
              className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-gray-100 disabled:opacity-50 transition-all cursor-pointer" 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            >
              <ChevronLeft size={20} />
            </button>
            <span className="text-xs font-medium text-slate-600 px-2">Page {currentPage} of {totalPages}</span>
            <button 
              className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-gray-100 disabled:opacity-50 transition-all cursor-pointer" 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
