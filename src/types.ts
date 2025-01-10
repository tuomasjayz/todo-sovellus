export type Priority = 'matala' | 'normaali' | 'korkea'
export type Category = 'työ' | 'henkilökohtainen' | 'opiskelu' | 'harrastukset'

export interface TodoItem {
  id: number
  text: string
  completed: boolean
  priority: Priority
  category: Category
  dueDate?: Date
  createdAt: Date
}

export interface Statistics {
  total: number
  completed: number
  overdue: number
  byCategory: Record<Category, number>
  byPriority: Record<Priority, number>
} 