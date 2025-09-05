'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import AdminLayout from '../../../components/admin/AdminLayout'

interface ReportData {
  daily: {
    revenue: number
    treatments: number
    customers: number
    therapistFees: number
  }
  weekly: {
    revenue: number
    treatments: number
    customers: number
    therapistFees: number
  }
  monthly: {
    revenue: number
    treatments: number
    customers: number
    therapistFees: number
  }
  yearly: {
    revenue: number
    treatments: number
    customers: number
    therapistFees: number
  }
}

export default function ReportsPage() {
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>('')
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly')
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [mbLoading, setMbLoading] = useState<boolean>(false)
  const [monthlyRows, setMonthlyRows] = useState<any[]>([])
  const [editingRow, setEditingRow] = useState<any | null>(null)
  const exportCsv = () => {
    const headers = ['id','month','year','totalRevenue','totalTherapistFees','totalTreatments','freeTreatments']
    const rows = monthlyRows.map((r) => [r.id, r.month, r.year, r.totalRevenue, r.totalTherapistFees, r.totalTreatments, r.freeTreatments])
    const csv = [headers.join(','), ...rows.map(cols => cols.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `laporan-keuangan-${new Date().toISOString().slice(0,10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setLoading(true)
        const params = new URLSearchParams()
        params.set('period', selectedPeriod)
        params.set('date', selectedDate)
        const res = await fetch(`/api/reports?${params.toString()}`)
        if (!res.ok) throw new Error('Request failed')
        const json = await res.json()
        if (!json.success) throw new Error(json.error || 'Failed to load report data')
        setReportData(json.data)
      } catch (err) {
        console.error('Error fetching report data:', err)
        setError('Failed to load report data')
      } finally {
        setLoading(false)
      }
    }

    fetchReportData()
  }, [selectedPeriod, selectedDate])

  // Load MonthlyBookkeeping rows for quick CRUD
  useEffect(() => {
    const loadMB = async () => {
      try {
        setMbLoading(true)
        const res = await fetch('/api/monthly-bookkeeping')
        const json = await res.json()
        if (json.success) setMonthlyRows(json.data)
      } finally {
        setMbLoading(false)
      }
    }
    loadMB()
  }, [])

  const upsertMonthly = async (payload: any) => {
    const isEdit = !!payload.id
    const url = '/api/monthly-bookkeeping'
    const res = await fetch(url, {
      method: isEdit ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    const json = await res.json()
    if (json.success) {
      setMonthlyRows(prev => {
        if (isEdit) {
          return prev.map(r => (r.id === json.data.id ? json.data : r))
        }
        return [json.data, ...prev]
      })
      setEditingRow(null)
    }
  }

  const deleteMonthly = async (id: number) => {
    const res = await fetch(`/api/monthly-bookkeeping?id=${id}`, { method: 'DELETE' })
    const json = await res.json()
    if (json.success) {
      setMonthlyRows(prev => prev.filter(r => r.id !== id))
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getPeriodLabel = (period: string) => {
    const labels = {
      daily: 'Harian',
      weekly: 'Mingguan', 
      monthly: 'Bulanan',
      yearly: 'Tahunan'
    }
    return labels[period as keyof typeof labels] || period
  }

  const currentData = reportData?.[selectedPeriod]

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-pink-800 mb-2">Laporan Keuangan</h1>
            <p className="text-gray-600">Analisis pendapatan dan performa bisnis salon</p>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-pink-600">
              Laporan {getPeriodLabel(selectedPeriod)}
            </div>
            <div className="text-sm text-gray-500">
              {formatDate(selectedDate)}
            </div>
          </div>
        </div>

        {/* Period Selector */}
        <div className="salon-card p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Periode Laporan
              </label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="daily">Harian</option>
                <option value="weekly">Mingguan</option>
                <option value="monthly">Bulanan</option>
                <option value="yearly">Tahunan</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tanggal Referensi
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Monthly Bookkeeping CRUD */}
        <div className="salon-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-pink-800">Pembukuan Bulanan</h2>
            <div className="flex gap-2">
              <button
                className="px-3 py-2 rounded-lg bg-gray-100 text-gray-800 text-sm"
                onClick={exportCsv}
              >
                Export CSV
              </button>
              <button
                className="px-3 py-2 rounded-lg bg-pink-600 text-white text-sm"
                onClick={() => setEditingRow({ id: null, month: new Date().getMonth() + 1, year: new Date().getFullYear(), totalRevenue: 0, totalTherapistFees: 0, totalTreatments: 0, freeTreatments: 0 })}
              >
                + Tambah
              </button>
            </div>
          </div>

          {editingRow && (
            <div className="mb-4 grid grid-cols-2 md:grid-cols-6 gap-3">
              <input className="input input-bordered" type="number" placeholder="Bulan" value={editingRow.month}
                     onChange={e => setEditingRow({ ...editingRow, month: Number(e.target.value) })} />
              <input className="input input-bordered" type="number" placeholder="Tahun" value={editingRow.year}
                     onChange={e => setEditingRow({ ...editingRow, year: Number(e.target.value) })} />
              <input className="input input-bordered" type="number" placeholder="Pendapatan" value={editingRow.totalRevenue}
                     onChange={e => setEditingRow({ ...editingRow, totalRevenue: Number(e.target.value) })} />
              <input className="input input-bordered" type="number" placeholder="Fee Therapist" value={editingRow.totalTherapistFees}
                     onChange={e => setEditingRow({ ...editingRow, totalTherapistFees: Number(e.target.value) })} />
              <input className="input input-bordered" type="number" placeholder="Total Treatment" value={editingRow.totalTreatments}
                     onChange={e => setEditingRow({ ...editingRow, totalTreatments: Number(e.target.value) })} />
              <input className="input input-bordered" type="number" placeholder="Gratis" value={editingRow.freeTreatments}
                     onChange={e => setEditingRow({ ...editingRow, freeTreatments: Number(e.target.value) })} />
              <div className="col-span-2 md:col-span-6 flex gap-2">
                <button className="px-3 py-2 rounded-lg bg-green-600 text-white text-sm" onClick={() => upsertMonthly(editingRow)}>
                  {editingRow.id ? 'Simpan Perubahan' : 'Simpan'}
                </button>
                <button className="px-3 py-2 rounded-lg bg-gray-200 text-gray-800 text-sm" onClick={() => setEditingRow(null)}>
                  Batal
                </button>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead className="bg-pink-50">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-pink-800">Bulan</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-pink-800">Tahun</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-pink-800">Pendapatan</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-pink-800">Fee Therapist</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-pink-800">Total Treatment</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-pink-800">Gratis</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-pink-800">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {monthlyRows.map(row => (
                  <tr key={row.id} className="border-t border-pink-100">
                    <td className="py-3 px-4">{row.month}</td>
                    <td className="py-3 px-4">{row.year}</td>
                    <td className="py-3 px-4">{new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',minimumFractionDigits:0}).format(row.totalRevenue || 0)}</td>
                    <td className="py-3 px-4">{new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',minimumFractionDigits:0}).format(row.totalTherapistFees || 0)}</td>
                    <td className="py-3 px-4">{row.totalTreatments}</td>
                    <td className="py-3 px-4">{row.freeTreatments}</td>
                    <td className="py-3 px-4 flex gap-2">
                      <button className="px-3 py-1 rounded-lg bg-blue-600 text-white text-xs" onClick={() => setEditingRow(row)}>Edit</button>
                      <button className="px-3 py-1 rounded-lg bg-red-600 text-white text-xs" onClick={() => deleteMonthly(row.id)}>Hapus</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="salon-card p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat laporan keuangan...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="salon-card p-12 text-center">
            <div className="text-6xl mb-4">❌</div>
            <p className="text-red-500 mb-2">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
            >
              Refresh Laporan
            </button>
          </div>
        )}

        {/* Main Content */}
        {!loading && !error && currentData && (
          <>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="salon-card p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Pendapatan</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(currentData.revenue)}
                </p>
              </div>
              <div className="text-4xl">💰</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="salon-card p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Treatment</p>
                <p className="text-2xl font-bold text-blue-600">
                  {currentData.treatments}
                </p>
              </div>
              <div className="text-4xl">💆‍♀️</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="salon-card p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Customer Dilayani</p>
                <p className="text-2xl font-bold text-purple-600">
                  {currentData.customers}
                </p>
              </div>
              <div className="text-4xl">👥</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="salon-card p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Fee Therapist</p>
                <p className="text-2xl font-bold text-orange-600">
                  {formatCurrency(currentData.therapistFees)}
                </p>
              </div>
              <div className="text-4xl">👩‍⚕️</div>
            </div>
          </motion.div>
        </div>

        {/* Detailed Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="salon-card p-6"
        >
          <h2 className="text-xl font-semibold text-pink-800 mb-6">Analisis Keuangan Detail</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Revenue Breakdown */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Breakdown Pendapatan</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                  <span className="text-gray-600">Gross Revenue</span>
                  <span className="font-bold text-green-600">{formatCurrency(currentData.revenue)}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-orange-50 rounded-lg">
                  <span className="text-gray-600">Fee Therapist</span>
                  <span className="font-bold text-orange-600">-{formatCurrency(currentData.therapistFees)}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-purple-50 rounded-lg border-2 border-purple-200">
                  <span className="text-gray-800 font-semibold">Net Profit</span>
                  <span className="font-bold text-purple-600 text-lg">
                    {formatCurrency(currentData.revenue - currentData.therapistFees)}
                  </span>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Metrik Performa</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                  <span className="text-gray-600">Rata-rata per Treatment</span>
                  <span className="font-bold text-blue-600">
                    {formatCurrency(Math.round(currentData.revenue / currentData.treatments))}
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-purple-50 rounded-lg">
                  <span className="text-gray-600">Rata-rata per Customer</span>
                  <span className="font-bold text-purple-600">
                    {formatCurrency(Math.round(currentData.revenue / currentData.customers))}
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-pink-50 rounded-lg">
                  <span className="text-gray-600">Treatment per Customer</span>
                  <span className="font-bold text-pink-600">
                    {(currentData.treatments / currentData.customers).toFixed(1)}x
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        

        </>
        )}
      </div>
    </AdminLayout>
  )
}