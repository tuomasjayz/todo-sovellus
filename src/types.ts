export type Priority = 'matala' | 'normaali' | 'korkea'
export type Category = 'työ' | 'henkilökohtainen' | 'opiskelu' | 'harrastukset'

export type TodoItem = {
  id: number
  text: string
  completed: boolean
  priority: Priority
  category: Category
  due_date: string | null
  created_at: string
  updated_at?: string
  user_id: string
  important?: boolean
}

export interface Statistics {
  total: number
  completed: number
  overdue: number
  important: number
  byCategory: Record<Category, number>
  byPriority: Record<Priority, number>
}

export type SortOption = 'created_at' | 'due_date' | 'priority' | 'category'
export type SortDirection = 'asc' | 'desc' 