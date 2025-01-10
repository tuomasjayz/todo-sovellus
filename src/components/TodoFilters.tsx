import { Category, Priority } from '@/types'

interface TodoFiltersProps {
  filter: {
    category?: Category
    priority?: Priority
    showCompleted: boolean
  }
  setFilter: React.Dispatch<React.SetStateAction<{
    category?: Category
    priority?: Priority
    showCompleted: boolean
  }>>
}

export default function TodoFilters({ filter, setFilter }: TodoFiltersProps) {
  return (
    <div className="flex gap-4 flex-wrap bg-gray-800 p-4 rounded-lg">
      <select
        value={filter.category || ''}
        onChange={(e) => setFilter(prev => ({
          ...prev,
          category: e.target.value as Category || undefined
        }))}
        className="p-2 rounded bg-gray-700 text-white"
      >
        <option value="">Kaikki kategoriat</option>
        <option value="työ">Työ</option>
        <option value="henkilökohtainen">Henkilökohtainen</option>
        <option value="opiskelu">Opiskelu</option>
        <option value="harrastukset">Harrastukset</option>
      </select>

      <select
        value={filter.priority || ''}
        onChange={(e) => setFilter(prev => ({
          ...prev,
          priority: e.target.value as Priority || undefined
        }))}
        className="p-2 rounded bg-gray-700 text-white"
      >
        <option value="">Kaikki prioriteetit</option>
        <option value="matala">Matala</option>
        <option value="normaali">Normaali</option>
        <option value="korkea">Korkea</option>
      </select>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={filter.showCompleted}
          onChange={(e) => setFilter(prev => ({
            ...prev,
            showCompleted: e.target.checked
          }))}
          className="w-5 h-5"
        />
        Näytä valmiit
      </label>
    </div>
  )
} 