export type Status = 'idle' | 'loading' | 'success' | 'error'

export interface BaseEntity {
  id: string
  createdAt: string
  updatedAt: string
}

export type Nullable<T> = T | null
export type Optional<T> = T | undefined

