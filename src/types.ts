export type Priority = 'matala' | 'normaali' | 'korkea'
export type Category = 'työ' | 'henkilökohtainen' | 'opiskelu' | 'harrastukset'

export interface TodoItem {
  id: number
  user_id: string
  text: string
  completed: boolean
  priority: Priority
  category: Category
  due_date?: string
  created_at: string
}

export interface Statistics {
  total: number
  completed: number
  overdue: number
  byCategory: Record<Category, number>
  byPriority: Record<Priority, number>
} 