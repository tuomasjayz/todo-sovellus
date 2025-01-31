'use client'

import { useState, useEffect } from 'react'
import { TodoItem, Priority, Category, Statistics } from '@/types'
import { supabase } from '@/lib/supabase'
import TodoStats from './TodoStats'
import TodoFilters from './TodoFilters'

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
  }>({ showCompleted: true })
  const [loading, setLoading] = useState(true)

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
        console.error('Supabase error:', error)
        throw error
      }

      if (data) {
        setTodos([data[0], ...todos])
        setNewTodo('')
      }
    } catch (error: any) {
      console.error('Error adding todo:', error.message || error)
    }
  }

  const toggleTodo = async (id: number) => {
    try {
      const todoToUpdate = todos.find(t => t.id === id)
      if (!todoToUpdate) return

      const { error } = await supabase
        .from('todos')
        .update({ completed: !todoToUpdate.completed })
        .eq('id', id)

      if (error) throw error
      setTodos(todos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      ))
    } catch (error) {
      console.error('Error updating todo:', error)
    }
  }

  const deleteTodo = async (id: number) => {
    try {
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', id)

      if (error) throw error
      setTodos(todos.filter(todo => todo.id !== id))
    } catch (error) {
      console.error('Error deleting todo:', error)
    }
  }

  const calculateStats = (): Statistics => {
    const stats: Statistics = {
      total: todos.length,
      completed: todos.filter(t => t.completed).length,
      overdue: todos.filter(t => 
        t.due_date && new Date(t.due_date) < new Date() && !t.completed
      ).length,
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

  const filteredTodos = todos.filter(todo => {
    if (!filter.showCompleted && todo.completed) return false
    if (filter.category && todo.category !== filter.category) return false
    if (filter.priority && todo.priority !== filter.priority) return false
    return true
  })

  return (
    <div className="space-y-6">
      <TodoStats stats={calculateStats()} />
      
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
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="p-2 rounded bg-gray-700 text-white"
          />

          <button 
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Lisää
          </button>
        </div>
      </form>

      <TodoFilters filter={filter} setFilter={setFilter} />

      <ul className="space-y-2">
        {filteredTodos.map(todo => (
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
              <span className={todo.completed ? 'line-through text-gray-500' : ''}>
                {todo.text}
              </span>
              <div className="flex gap-2 text-sm text-gray-400">
                <span className={`px-2 py-0.5 rounded ${
                  getPriorityColor(todo.priority)
                }`}>
                  {todo.priority}
                </span>
                <span>{todo.category}</span>
                {todo.due_date && (
                  <span>Deadline: {new Date(todo.due_date).toLocaleDateString('fi-FI')}</span>
                )}
              </div>
            </div>
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