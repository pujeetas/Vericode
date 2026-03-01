import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

interface Review {
  id: string
  code: string
  language: string
  review_type: string
  feedback: string
  severity: string
  created_at: string
}

export default function ReviewPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [review, setReview] = useState<Review | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchReview = async () => {
      try {
        const response = await fetch(`https://vericode-fjt5.onrender.com/${id}`)
        if (!response.ok) {
          setError('Review not found')
          return
        }
        const data = await response.json()
        setReview(data)
      } catch {
        setError('Failed to load review')
      } finally {
        setLoading(false)
      }
    }
    fetchReview()
  }, [id])

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
      <p className="text-gray-400">Loading review...</p>
    </div>
  )

  if (error) return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
      <div className="text-center">
        <p className="text-red-400 mb-4">{error}</p>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-blue-600 rounded-lg"
        >
          Back to Home
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white">Vericode</h1>
            <p className="text-gray-400 mt-1">AI-powered code review</p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition-colors"
          >
            ← New Review
          </button>
        </div>

        {/* Review Meta */}
        <div className="flex gap-3 mb-6 flex-wrap">
          <span className="px-3 py-1 bg-gray-800 text-blue-400 rounded-full text-sm">
            {review?.language}
          </span>
          <span className="px-3 py-1 bg-gray-800 text-gray-400 rounded-full text-sm capitalize">
            {review?.review_type}
          </span>
          <span className={`px-3 py-1 rounded-full text-sm capitalize ${severityColor(review?.severity || '')}`}>
            {review?.severity} severity
          </span>
          <span className="px-3 py-1 bg-gray-800 text-gray-500 rounded-full text-sm">
            {new Date(review?.created_at || '').toLocaleDateString()}
          </span>
        </div>

        {/* Code */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3 text-gray-400">Code Reviewed</h2>
          <pre className="bg-gray-900 text-green-400 font-mono text-sm p-4 rounded-lg border border-gray-700 overflow-x-auto whitespace-pre-wrap">
            {review?.code}
          </pre>
        </div>

        {/* Feedback */}
        <div>
        <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-blue-400">Review</h2>
            <button
            onClick={() => {
                navigator.clipboard.writeText(review?.feedback || '')
                alert('Feedback copied!')
            }}
            className="px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-gray-400 transition-colors"
            >
            📋 Copy
            </button>
        </div>
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
            <pre className="text-gray-300 text-sm whitespace-pre-wrap font-mono">
            {review?.feedback}
            </pre>
        </div>
        </div>

      </div>
    </div>
  )
}