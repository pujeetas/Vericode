import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Home() {
  const [code, setCode] = useState('')
  const [reviewType, setReviewType] = useState('general quality')
  const [review, setReview] = useState('')
  const [language, setLanguage] = useState('')
  const [loading, setLoading] = useState(false)
  const [reviewId, setReviewId] = useState('')
  const navigate = useNavigate()

  const handleReview = async () => {
    if (!code.trim()) return
    setReview('')
    setLanguage('')
    setReviewId('')
    setLoading(true)

    const response = await fetch('https://vericode-fjt5.onrender.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, reviewType })
    })

    const reader = response.body!.getReader()
    const decoder = new TextDecoder()

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value)
      const lines = chunk.split('\n')

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6))
            if (data.type === 'language') setLanguage(data.value)
            if (data.type === 'chunk') setReview(prev => prev + data.value)
            if (data.type === 'done') {
              setLoading(false)
              setReviewId(data.reviewId)
            }
          } catch {}
        }
      }
    }
  }

  const handleShare = () => {
    const url = `${window.location.origin}/review/${reviewId}`
    navigator.clipboard.writeText(url)
    alert('Link copied to clipboard!')
  }

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
            onClick={() => navigate('/history')}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition-colors"
        >
            History →
        </button>
    </div>

        {/* Review Type Selector */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {['general quality', 'bug detection', 'performance', 'security', 'documentation'].map(type => (
            <button
              key={type}
              onClick={() => setReviewType(type)}
              className={`px-3 py-1 rounded-full text-sm capitalize ${
                reviewType === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Code Input */}
        <textarea
          value={code}
          onChange={e => setCode(e.target.value)}
          placeholder="Paste your code here..."
          className="w-full h-64 bg-gray-900 text-green-400 font-mono text-sm p-4 rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500 resize-none"
        />

        {/* Buttons Row */}
        <div className="mt-4 flex items-center gap-3 flex-wrap">
          <button
            onClick={handleReview}
            disabled={loading || !code.trim()}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
          >
            {loading ? 'Reviewing...' : 'Review Code'}
          </button>

          {language && (
            <span className="px-3 py-2 bg-gray-800 text-blue-400 rounded-lg text-sm">
              Detected: {language}
            </span>
          )}

          {reviewId && (
            <>
              <button
                onClick={handleShare}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-medium transition-colors"
              >
                📋 Copy Share Link
              </button>
              <button
                onClick={() => navigate(`/review/${reviewId}`)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium transition-colors"
              >
                View Full Review →
              </button>
            </>
          )}
        </div>

        {/* Review Output */}
        {review && (
          <div className="mt-6 bg-gray-900 rounded-lg p-6 border border-gray-700">
            <h2 className="text-lg font-semibold mb-3 text-blue-400">Review</h2>
            <pre className="text-gray-300 text-sm whitespace-pre-wrap font-mono">
              {review}
            </pre>
          </div>
        )}

      </div>
    </div>
  )
}