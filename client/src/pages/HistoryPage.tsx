import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

interface ReviewSummary {
  id: string
  language: string
  review_type: string
  severity: string
  created_at: string
}

export default function HistoryPage() {
  const navigate = useNavigate()
  const [reviews, setReviews] = useState<ReviewSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch('https://vericode-fjt5.onrender.com/review')
        const data = await response.json()
        setReviews(data)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    fetchHistory()
  }, [])

  const severityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return 'text-red-400 bg-red-900/30'
      case 'moderate': return 'text-yellow-400 bg-yellow-900/30'
      case 'minor': return 'text-green-400 bg-green-900/30'
      default: return 'text-gray-400 bg-gray-800'
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
      <p className="text-gray-400">Loading history...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white">Vericode</h1>
            <p className="text-gray-400 mt-1">Review History</p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm transition-colors"
          >
            + New Review
          </button>
        </div>

        {/* History List */}
        {reviews.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No reviews yet</p>
            <button
              onClick={() => navigate('/')}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm"
            >
              Start your first review
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.map(review => (
              <div
                key={review.id}
                onClick={() => navigate(`/review/${review.id}`)}
                className="bg-gray-900 border border-gray-700 rounded-lg p-4 flex items-center justify-between cursor-pointer hover:border-blue-500 transition-colors"
              >
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="px-3 py-1 bg-gray-800 text-blue-400 rounded-full text-sm">
                    {review.language}
                  </span>
                  <span className="px-3 py-1 bg-gray-800 text-gray-400 rounded-full text-sm capitalize">
                    {review.review_type}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm capitalize ${severityColor(review.severity)}`}>
                    {review.severity}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-gray-500 text-sm">
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                  <span className="text-gray-500 text-sm">→</span>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}