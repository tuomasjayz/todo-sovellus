import TodoList from '@/components/TodoList'

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Todo Tracker</h1>
        <TodoList />
      </div>
    </main>
  )
}
