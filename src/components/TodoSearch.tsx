import { useState, useEffect } from 'react'

interface TodoSearchProps {
  onSearch: (term: string) => void
}

export default function TodoSearch({ onSearch }: TodoSearchProps) {
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      onSearch(searchTerm)
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [searchTerm, onSearch])

  return (
    <div className="mb-4">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Etsi tehtäviä..."
        className="w-full p-2 rounded bg-gray-700 text-white"
      />
    </div>
  )
} 