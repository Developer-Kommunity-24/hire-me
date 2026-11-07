import { create } from 'zustand'
import type {
  ApplicationStatus,
  SortOption,
  ViewMode,
} from '@/lib/schemas/student-applications.schema'

export interface ApplicationsStoreState {
  search: string
  selectedStatus: 'all' | ApplicationStatus
  sortBy: SortOption
  viewMode: ViewMode
  expandedAppId: string | null
  currentPage: number
  pageSize: number

  // Actions
  setSearch: (search: string) => void
  setSelectedStatus: (status: 'all' | ApplicationStatus) => void
  setSortBy: (sortBy: SortOption) => void
  setViewMode: (viewMode: ViewMode) => void
  toggleExpanded: (id: string) => void
  setExpandedAppId: (id: string | null) => void
  setCurrentPage: (page: number) => void
  setPageSize: (pageSize: number) => void
  resetFilters: () => void
}

export const initialStoreState = {
  search: '',
  selectedStatus: 'all' as const,
  sortBy: 'status' as const,
  viewMode: 'list' as const,
  expandedAppId: null,
  currentPage: 1,
  pageSize: 6,
}

export const useApplicationsStore = create<ApplicationsStoreState>((set) => ({
  ...initialStoreState,

  setSearch: (search: string) => set({ search, currentPage: 1 }),

  setSelectedStatus: (selectedStatus: 'all' | ApplicationStatus) =>
    set({ selectedStatus, currentPage: 1 }),

  setSortBy: (sortBy: SortOption) => set({ sortBy }),

  setViewMode: (viewMode: ViewMode) => set({ viewMode }),

  toggleExpanded: (id: string) =>
    set((state) => ({
      expandedAppId: state.expandedAppId === id ? null : id,
    })),

  setExpandedAppId: (id: string | null) => set({ expandedAppId: id }),

  setCurrentPage: (currentPage: number) => set({ currentPage }),

  setPageSize: (pageSize: number) => set({ pageSize, currentPage: 1 }),

  resetFilters: () =>
    set({
      search: '',
      selectedStatus: 'all',
      sortBy: 'status',
      currentPage: 1,
    }),
}))
