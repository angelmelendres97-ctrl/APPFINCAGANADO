export interface PaginatedResponse<T> {
  data: T[]
  [key: string]: unknown
}

export const unwrapList = <T>(response: T[] | PaginatedResponse<T>): T[] => {
  if (Array.isArray(response)) return response
  if (response && Array.isArray(response.data)) return response.data
  return []
}
