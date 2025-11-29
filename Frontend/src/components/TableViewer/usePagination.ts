import { useState, useMemo } from "react"

interface UsePaginationProps {
  totalItems: number
  itemsPerPage?: number
}

export function usePagination({ totalItems, itemsPerPage = 10 }: UsePaginationProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(itemsPerPage)

  const totalPages = useMemo(() => {
    return Math.ceil(totalItems / pageSize)
  }, [totalItems, pageSize])

  const startIndex = useMemo(() => {
    return (currentPage - 1) * pageSize
  }, [currentPage, pageSize])

  const endIndex = useMemo(() => {
    return Math.min(startIndex + pageSize, totalItems)
  }, [startIndex, pageSize, totalItems])

  const goToPage = (page: number) => {
    const validPage = Math.max(1, Math.min(page, totalPages))
    setCurrentPage(validPage)
  }

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const changePageSize = (size: number) => {
    setPageSize(size)
    setCurrentPage(1) // Reset to first page when changing page size
  }

  return {
    currentPage,
    pageSize,
    totalPages,
    startIndex,
    endIndex,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    changePageSize,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
  }
}
