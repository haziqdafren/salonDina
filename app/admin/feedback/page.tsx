'use client'

import { useEffect, useMemo, useState } from 'react'
import AdminLayout from '../../../components/admin/AdminLayout'

type Feedback = {
  id: number
  customerName: string
  customerPhone: string
  serviceName: string
  therapistName: string
  therapistRating: number
  serviceRating: number
  overallRating: number
  comment: string
  isAnonymous: boolean
  createdAt: string
}

export default function AdminFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [rating, setRating] = useState<number | 'all'>('all')

  useEffect(() => {
    const load = async () => {
      try {
        console.log('📊 Loading feedback from database...')
        const res = await fetch('/api/feedback')
        const json = await res.json()
        
        if (json.success) {
          setFeedbacks(json.data || [])
          console.log('✅ Feedback loaded from database:', json.data?.length || 0, 'items')
        } else {
          console.error('❌ Failed to load feedback:', json.error)
        }
      } catch (e) {
        console.error('❌ Error loading feedback:', e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = useMemo(() => {
    return feedbacks
      .filter(f =>
        (rating === 'all' || f.overallRating === rating) &&
        (query.trim() === '' ||
          f.customerName?.toLowerCase().includes(query.toLowerCase()) ||
          f.serviceName?.toLowerCase().includes(query.toLowerCase()) ||
          f.therapistName?.toLowerCase().includes(query.toLowerCase()) ||
          f.comment?.toLowerCase().includes(query.toLowerCase()))
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [feedbacks, query, rating])

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-pink-800 mb-2">Manajemen Feedback</h1>
            <p className="text-gray-600">Lihat dan kelola feedback pelanggan</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
          >
            🔄 Refresh
          </button>
          <div className="flex gap-2">
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Cari nama/layanan/terapis/komentar"
              className="px-3 py-2 border border-gray-300 rounded-lg"
            />
            <select
              value={rating as any}
              onChange={e => setRating(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="all">Semua rating</option>
              {[5,4,3,2,1,0].map(r => (
                <option key={r} value={r}>{r} bintang</option>
              ))}
            </select>
          </div>
        </div>

        <div className="salon-card overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">⏳</div>
              <p className="text-gray-500">Memuat feedback...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">💬</div>
              <p className="text-gray-500">Belum ada feedback</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead className="bg-pink-50">
                  <tr>
                    <th className="text-left py-4 px-6 font-semibold text-pink-800">Tanggal</th>
                    <th className="text-left py-4 px-6 font-semibold text-pink-800">Customer</th>
                    <th className="text-left py-4 px-6 font-semibold text-pink-800">Layanan</th>
                    <th className="text-left py-4 px-6 font-semibold text-pink-800">Therapist</th>
                    <th className="text-left py-4 px-6 font-semibold text-pink-800">Rating</th>
                    <th className="text-left py-4 px-6 font-semibold text-pink-800">Komentar</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(f => (
                    <tr key={f.id} className="border-t border-pink-100">
                      <td className="py-3 px-6 text-gray-700">{new Date(f.createdAt).toLocaleDateString('id-ID')}</td>
                      <td className="py-3 px-6 text-gray-800">{f.isAnonymous ? 'Anonim' : f.customerName}</td>
                      <td className="py-3 px-6 text-gray-800">{f.serviceName}</td>
                      <td className="py-3 px-6 text-gray-800">{f.therapistName}</td>
                      <td className="py-3 px-6 text-gray-800">⭐ {f.overallRating}</td>
                      <td className="py-3 px-6 text-gray-700">{f.comment || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}


