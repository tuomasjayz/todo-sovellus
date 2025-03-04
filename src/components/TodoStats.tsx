import { Statistics } from '@/types'

interface TodoStatsProps {
  stats: Statistics
}

export default function TodoStats({ stats }: TodoStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-gray-800 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Yhteenveto</h3>
        <div className="space-y-1">
          <p>Tehtäviä yhteensä: {stats.total}</p>
          <p>Valmiina: {stats.completed}</p>
          <p>Myöhässä: {stats.overdue}</p>
          <p>Tärkeitä: {stats.important}</p>
        </div>
      </div>

      <div className="bg-gray-800 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Kategoriat</h3>
        <div className="space-y-1">
          {Object.entries(stats.byCategory).map(([category, count]) => (
            <p key={category}>{category}: {count}</p>
          ))}
        </div>
      </div>

      <div className="bg-gray-800 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Prioriteetit</h3>
        <div className="space-y-1">
          {Object.entries(stats.byPriority).map(([priority, count]) => (
            <p key={priority}>{priority}: {count}</p>
          ))}
        </div>
      </div>

      <div className="bg-gray-800 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Edistyminen</h3>
        <div className="w-full bg-gray-700 rounded-full h-4">
          <div
            className="bg-indigo-600 h-4 rounded-full"
            style={{
              width: `${stats.total ? (stats.completed / stats.total) * 100 : 0}%`
            }}
          />
        </div>
        <p className="mt-2 text-sm">
          {stats.total ? Math.round((stats.completed / stats.total) * 100) : 0}% valmiina
        </p>
      </div>
    </div>
  )
} 