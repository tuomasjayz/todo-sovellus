'use client'

import { useState } from 'react'
import { TodoItem } from '@/types'

export default function TodoList() {
  const [todos, setTodos] = useState<TodoItem[]>([])
  const [newTodo, setNewTodo] = useState('')

  const addTodo = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTodo.trim()) return

    const todo: TodoItem = {
      id: Date.now(),
      text: newTodo,
      completed: false,
    }

    setTodos([...todos, todo])
    setNewTodo('')
  }

  const toggleTodo = (id: number) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ))
  }

  return (
    <div className="space-y-4">
      <form onSubmit={addTodo} className="flex gap-2">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Lisää uusi tehtävä..."
          className="flex-1 p-2 rounded bg-gray-800 text-white"
        />
        <button 
          type="submit"
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Lisää
        </button>
      </form>

      <ul className="space-y-2">
        {todos.map(todo => (
          <li 
            key={todo.id}
            className="flex items-center gap-2 p-2 rounded bg-gray-800"
          >
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
              className="w-5 h-5"
            />
            <span className={todo.completed ? 'line-through text-gray-500' : ''}>
              {todo.text}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
} 