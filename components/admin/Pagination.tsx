// Professional Admin Pagination Component
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

interface PaginationProps {
  currentPage: number
  totalItems: number
  itemsPerPage: number
  onPageChange: (page: number) => void
  onItemsPerPageChange?: (itemsPerPage: number) => void
  showItemsPerPage?: boolean
  itemsPerPageOptions?: number[]
  className?: string
  loading?: boolean
  itemName?: string // e.g., "bookings", "customers", "therapists"
}

export default function Pagination({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  showItemsPerPage = true,
  itemsPerPageOptions = [5, 10, 20, 50],
  className = '',
  loading = false,
  itemName = 'items'
}: PaginationProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startItem = Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  // Generate page numbers with ellipsis logic
  const generatePageNumbers = () => {
    const pages: (number | string)[] = []
    const showEllipsis = totalPages > 7

    if (!showEllipsis) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Complex ellipsis logic
      if (currentPage <= 4) {
        // Show: 1 2 3 4 5 ... last
        for (let i = 1; i <= Math.min(5, totalPages); i++) {
          pages.push(i)
        }
        if (totalPages > 5) {
          pages.push('...')
          pages.push(totalPages)
        }
      } else if (currentPage >= totalPages - 3) {
        // Show: 1 ... last-4 last-3 last-2 last-1 last
        pages.push(1)
        pages.push('...')
        for (let i = Math.max(totalPages - 4, 1); i <= totalPages; i++) {
          if (i > 1) pages.push(i)
        }
      } else {
        // Show: 1 ... current-1 current current+1 ... last
        pages.push(1)
        pages.push('...')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      }
    }

    return pages
  }

  const pageNumbers = generatePageNumbers()

  if (totalItems === 0) {
    return (
      <div className={`flex items-center justify-center py-6 text-slate-500 ${className}`}>
        <div className="text-center">
          <div className="text-2xl mb-2">📂</div>
          <div className="text-sm">Tidak ada data {itemName} untuk ditampilkan</div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white border-t border-slate-200 px-4 py-4 sm:px-6 ${className}`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        
        {/* Items per page selector - Mobile First */}
        {showItemsPerPage && onItemsPerPageChange && (
          <div className="flex items-center gap-2 order-2 sm:order-1">
            <span className="text-sm text-slate-600 whitespace-nowrap">Tampilkan:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                onItemsPerPageChange(Number(e.target.value))
                onPageChange(1) // Reset to first page when changing items per page
              }}
              disabled={loading}
              className="min-h-[44px] px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-500 focus:border-transparent bg-white disabled:bg-slate-100 disabled:cursor-not-allowed"
            >
              {itemsPerPageOptions.map(option => (
                <option key={option} value={option}>
                  {option} {itemName}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Page info - Responsive */}
        <div className="order-1 sm:order-2">
          <p className="text-sm text-slate-700 text-center sm:text-left">
            Menampilkan{' '}
            <span className="font-semibold text-slate-900">{startItem.toLocaleString('id-ID')}</span>
            {' '}-{' '}
            <span className="font-semibold text-slate-900">{endItem.toLocaleString('id-ID')}</span>
            {' '}dari{' '}
            <span className="font-semibold text-slate-900">{totalItems.toLocaleString('id-ID')}</span>
            {' '}{itemName}
          </p>
        </div>

        {/* Pagination controls - Mobile Optimized */}
        <div className="order-3">
          <nav className="flex items-center justify-center sm:justify-end">
            <div className="flex items-center gap-1">
              
              {/* First Page Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onPageChange(1)}
                disabled={currentPage === 1 || loading}
                className="min-h-[44px] min-w-[44px] p-2 text-slate-500 hover:text-slate-700 disabled:text-slate-300 disabled:cursor-not-allowed transition-colors touch-manipulation flex items-center justify-center"
                title="Halaman Pertama"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
              </motion.button>

              {/* Previous Page Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1 || loading}
                className="min-h-[44px] min-w-[44px] p-2 text-slate-500 hover:text-slate-700 disabled:text-slate-300 disabled:cursor-not-allowed transition-colors touch-manipulation flex items-center justify-center"
                title="Halaman Sebelumnya"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </motion.button>

              {/* Page Numbers */}
              <div className="hidden sm:flex items-center gap-1 mx-2">
                {pageNumbers.map((page, index) => {
                  if (page === '...') {
                    return (
                      <span key={`ellipsis-${index}`} className="px-3 py-2 text-slate-500">
                        ...
                      </span>
                    )
                  }

                  const pageNum = page as number
                  const isActive = pageNum === currentPage

                  return (
                    <motion.button
                      key={pageNum}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onPageChange(pageNum)}
                      disabled={loading}
                      className={`min-h-[44px] min-w-[44px] px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 touch-manipulation ${
                        isActive
                          ? 'bg-slate-900 text-white shadow-lg'
                          : 'text-slate-700 hover:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed'
                      }`}
                    >
                      {pageNum}
                    </motion.button>
                  )
                })}
              </div>

              {/* Mobile Page Indicator */}
              <div className="sm:hidden mx-3 px-4 py-2 bg-slate-100 rounded-lg">
                <span className="text-sm font-medium text-slate-700">
                  {currentPage} / {totalPages}
                </span>
              </div>

              {/* Next Page Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages || loading}
                className="min-h-[44px] min-w-[44px] p-2 text-slate-500 hover:text-slate-700 disabled:text-slate-300 disabled:cursor-not-allowed transition-colors touch-manipulation flex items-center justify-center"
                title="Halaman Selanjutnya"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </motion.button>

              {/* Last Page Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onPageChange(totalPages)}
                disabled={currentPage === totalPages || loading}
                className="min-h-[44px] min-w-[44px] p-2 text-slate-500 hover:text-slate-700 disabled:text-slate-300 disabled:cursor-not-allowed transition-colors touch-manipulation flex items-center justify-center"
                title="Halaman Terakhir"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              </motion.button>
            </div>
          </nav>
        </div>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center"
        >
          <div className="flex items-center gap-3 text-slate-600">
            <div className="w-5 h-5 border-2 border-slate-400 border-t-slate-600 rounded-full animate-spin"></div>
            <span className="text-sm font-medium">Memuat data...</span>
          </div>
        </motion.div>
      )}
    </div>
  )
}

// Helper hook for pagination logic
export function usePagination<T>(
  data: T[],
  initialItemsPerPage: number = 10
) {
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage)

  // Calculate paginated data
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedData = data.slice(startIndex, endIndex)

  // Reset to page 1 if current page becomes invalid
  const totalPages = Math.ceil(data.length / itemsPerPage)
  if (currentPage > totalPages && totalPages > 0) {
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage)
    setCurrentPage(1) // Reset to first page
  }

  return {
    currentPage,
    itemsPerPage,
    totalPages,
    paginatedData,
    totalItems: data.length,
    handlePageChange,
    handleItemsPerPageChange,
    startIndex,
    endIndex
  }
}