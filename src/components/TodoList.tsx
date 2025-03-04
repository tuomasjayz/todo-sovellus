'use client'

import { useState, useEffect } from 'react'
import { TodoItem, Priority, Category, Statistics, SortOption, SortDirection } from '@/types'
import { supabase } from '@/lib/supabase'
import TodoStats from './TodoStats'
import TodoFilters from './TodoFilters'
import TodoSearch from './TodoSearch'
import { toast } from 'react-hot-toast'

export default function TodoList() {
  const [todos, setTodos] = useState<TodoItem[]>([])
  const [newTodo, setNewTodo] = useState('')
  const [selectedPriority, setSelectedPriority] = useState<Priority>('normaali')
  const [selectedCategory, setSelectedCategory] = useState<Category>('henkilökohtainen')
  const [dueDate, setDueDate] = useState<string>('')
  const [filter, setFilter] = useState<{
    category?: Category
    priority?: Priority
    showCompleted: boolean
    onlyImportant: boolean
  }>({ showCompleted: true, onlyImportant: false })
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loading, setLoading] = useState(true)
  
  const [searchTerm, setSearchTerm] = useState('')
  const [editingTodo, setEditingTodo] = useState<TodoItem | null>(null)
  const [sortOption, setSortOption] = useState<SortOption>('created_at')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  useEffect(() => {
    fetchTodos()
  }, [])

  async function fetchTodos() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setTodos(data || [])
    } catch (error) {
      console.error('Error fetching todos:', error)
    } finally {
      setLoading(false)
    }
  }

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTodo.trim()) return

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.error('User not found')
        return
      }

      const newTodoItem = {
        text: newTodo,
        completed: false,
        priority: selectedPriority,
        category: selectedCategory,
        due_date: dueDate ? new Date(dueDate).toISOString() : null,
        created_at: new Date().toISOString(),
        user_id: user.id
      }

      const { data, error } = await supabase
        .from('todos')
        .insert([newTodoItem])
        .select()

      if (error) {
        toast.error('Virhe tehtävän lisäämisessä')
        throw error
      }

      if (data) {
        setTodos([data[0], ...todos])
        setNewTodo('')
        setDueDate('')
        toast.success('Tehtävä lisätty')
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error adding todo:', errorMessage)
    }
  }

  const toggleTodo = async (id: number) => {
    try {
      const todoToUpdate = todos.find(t => t.id === id)
      if (!todoToUpdate) {
        toast.error('Tehtävää ei löytynyt')
        return
      }

      const { data, error } = await supabase
        .from('todos')
        .update({ 
          completed: !todoToUpdate.completed,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Supabase error details:', error)
        toast.error(`Virhe: ${error.message || 'Tuntematon virhe'}`)
        return
      }

      if (!data) {
        toast.error('Päivitys epäonnistui')
        return
      }

      setTodos(todos.map(todo =>
        todo.id === id ? { ...todo, ...data } : todo
      ))
      
      toast.success(todoToUpdate.completed ? 'Tehtävä merkitty keskeneräiseksi' : 'Tehtävä merkitty valmiiksi')
    } catch (error) {
      console.error('Error updating todo:', error)
      toast.error('Odottamaton virhe tehtävän päivityksessä')
    }
  }

  const toggleImportant = async (id: number) => {
    try {
      const todoToUpdate = todos.find(t => t.id === id)
      if (!todoToUpdate) {
        toast.error('Tehtävää ei löytynyt')
        return
      }

      const { data, error } = await supabase
        .from('todos')
        .update({ 
          important: !todoToUpdate.important,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Supabase error details:', error)
        toast.error(`Virhe: ${error.message || 'Tuntematon virhe'}`)
        return
      }

      if (!data) {
        toast.error('Päivitys epäonnistui')
        return
      }

      setTodos(todos.map(todo =>
        todo.id === id ? { ...todo, ...data } : todo
      ))
      
      toast.success(todoToUpdate.important ? 'Poistettu tärkeistä tehtävistä' : 'Merkitty tärkeäksi tehtäväksi')
    } catch (error) {
      console.error('Error updating todo:', error)
      toast.error('Odottamaton virhe tehtävän päivityksessä')
    }
  }

  const deleteTodo = async (id: number) => {
    // Ask for confirmation before deleting
    if (!window.confirm('Haluatko varmasti poistaa tämän tehtävän?')) {
      return
    }
    
    try {
      const todoToDelete = todos.find(t => t.id === id)
      if (!todoToDelete) {
        toast.error('Tehtävää ei löytynyt')
        return
      }

      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', id)

      if (error) {
        toast.error('Virhe tehtävän poistamisessa')
        throw error
      }
      
      setTodos(todos.filter(todo => todo.id !== id))
      toast.success('Tehtävä poistettu')
    } catch (error) {
      console.error('Error deleting todo:', error)
      toast.error('Odottamaton virhe tehtävän poistamisessa')
    }
  }

  const calculateStats = (): Statistics => {
    const stats: Statistics = {
      total: todos.length,
      completed: todos.filter(t => t.completed).length,
      overdue: todos.filter(t => 
        t.due_date && new Date(t.due_date) < new Date() && !t.completed
      ).length,
      important: todos.filter(t => t.important).length,
      byCategory: {
        työ: 0,
        henkilökohtainen: 0,
        opiskelu: 0,
        harrastukset: 0
      },
      byPriority: {
        matala: 0,
        normaali: 0,
        korkea: 0
      }
    }

    todos.forEach(todo => {
      stats.byCategory[todo.category]++
      stats.byPriority[todo.priority]++
    })

    return stats
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleEdit = async (todo: TodoItem) => {
    if (!editingTodo) return
    
    try {
      const { error } = await supabase
        .from('todos')
        .update({
          text: editingTodo.text,
          priority: editingTodo.priority,
          category: editingTodo.category,
          due_date: editingTodo.due_date,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingTodo.id)

      if (error) throw error

      setTodos(todos.map(t => 
        t.id === editingTodo.id ? { ...t, ...editingTodo } : t
      ))
      setEditingTodo(null)
      toast.success('Tehtävä päivitetty')
    } catch (error) {
      console.error('Error updating todo:', error)
      toast.error('Virhe päivitettäessä tehtävää')
    }
  }

  const sortTodos = (todos: TodoItem[]) => {
    return [...todos].sort((a, b) => {
      switch (sortOption) {
        case 'due_date':
          const dateA = a.due_date ? new Date(a.due_date).getTime() : Infinity
          const dateB = b.due_date ? new Date(b.due_date).getTime() : Infinity
          return sortDirection === 'asc' ? dateA - dateB : dateB - dateA
        case 'priority':
          const priorityOrder = { korkea: 3, normaali: 2, matala: 1 }
          return sortDirection === 'asc' 
            ? priorityOrder[a.priority] - priorityOrder[b.priority]
            : priorityOrder[b.priority] - priorityOrder[a.priority]
        default:
          return sortDirection === 'asc'
            ? a[sortOption].localeCompare(b[sortOption])
            : b[sortOption].localeCompare(a[sortOption])
      }
    })
  }

  const filteredAndSortedTodos = sortTodos(
    todos.filter(todo => {
      const matchesSearch = todo.text.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = !filter.category || todo.category === filter.category
      const matchesPriority = !filter.priority || todo.priority === filter.priority
      const matchesCompleted = filter.showCompleted || !todo.completed
      const matchesImportant = !filter.onlyImportant || todo.important
      
      return matchesSearch && matchesCategory && matchesPriority && matchesCompleted && matchesImportant
    })
  )

  const renderSortControls = () => (
    <div className="flex gap-4 mb-4">
      <select
        value={sortOption}
        onChange={(e) => setSortOption(e.target.value as SortOption)}
        className="p-2 rounded bg-gray-700 text-white"
      >
        <option value="created_at">Luontipäivä</option>
        <option value="due_date">Määräpäivä</option>
        <option value="priority">Prioriteetti</option>
        <option value="category">Kategoria</option>
      </select>
      <button
        onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
        className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
      >
        {sortDirection === 'asc' ? '↑' : '↓'}
      </button>
    </div>
  )

  return (
    <div className="space-y-6">
      <TodoStats stats={calculateStats()} />
      <TodoSearch onSearch={setSearchTerm} />
      {renderSortControls()}
      <TodoFilters filter={filter} setFilter={setFilter} />
      
      <form onSubmit={addTodo} className="space-y-4 bg-gray-800 p-4 rounded-lg">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Lisää uusi tehtävä..."
          className="w-full p-2 rounded bg-gray-700 text-white"
        />
        
        <div className="flex gap-4 flex-wrap">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as Category)}
            className="p-2 rounded bg-gray-700 text-white"
          >
            <option value="työ">Työ</option>
            <option value="henkilökohtainen">Henkilökohtainen</option>
            <option value="opiskelu">Opiskelu</option>
            <option value="harrastukset">Harrastukset</option>
          </select>

          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value as Priority)}
            className="p-2 rounded bg-gray-700 text-white"
          >
            <option value="matala">Matala</option>
            <option value="normaali">Normaali</option>
            <option value="korkea">Korkea</option>
          </select>

          <input
            type="datetime-local"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="p-2 rounded bg-gray-700 text-white"
            min={new Date().toISOString().slice(0, 16)}
          />

          <button 
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Lisää
          </button>
        </div>
      </form>

      <ul className="space-y-2">
        {filteredAndSortedTodos.map(todo => (
          <li 
            key={todo.id}
            className={`flex items-center gap-2 p-3 rounded ${
              todo.completed ? 'bg-gray-700' : 'bg-gray-800'
            }`}
          >
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
              className="w-5 h-5"
            />
            <div className="flex-1">
              <div className="flex items-center">
                <span className={todo.completed ? 'line-through text-gray-500' : ''}>
                  {todo.text}
                </span>
                {todo.important && (
                  <span className="ml-2 text-yellow-500">★</span>
                )}
              </div>
              <div className="flex gap-2 text-sm text-gray-400">
                <span className={`px-2 py-0.5 rounded ${
                  getPriorityColor(todo.priority)
                }`}>
                  {todo.priority}
                </span>
                <span>{todo.category}</span>
                {todo.due_date && (
                  <span className={`${
                    isOverdue(todo) ? 'text-red-500 font-semibold' : ''
                  }`}>
                    Deadline: {formatDateTime(todo.due_date)}
                    {isOverdue(todo) && ' (Myöhässä)'}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => toggleImportant(todo.id)}
              className="p-1 text-yellow-500 hover:text-yellow-400 mr-2"
              title={todo.important ? "Poista tärkeä merkintä" : "Merkitse tärkeäksi"}
            >
              {todo.important ? '★' : '☆'}
            </button>
            <button
              onClick={() => deleteTodo(todo.id)}
              className="p-1 text-red-500 hover:text-red-400"
            >
              Poista
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

function getPriorityColor(priority: Priority): string {
  switch (priority) {
    case 'korkea': return 'bg-red-900'
    case 'normaali': return 'bg-yellow-900'
    case 'matala': return 'bg-green-900'
  }
}

function isOverdue(todo: TodoItem): boolean {
  if (!todo.due_date || todo.completed) return false
  return new Date(todo.due_date) < new Date()
}

function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString('fi-FI', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
} 