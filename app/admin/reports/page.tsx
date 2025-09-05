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

  // Mock data for now
  const mockReportData: ReportData = {
    daily: { revenue: 850000, treatments: 12, customers: 8, therapistFees: 340000 },
    weekly: { revenue: 4250000, treatments: 68, customers: 45, therapistFees: 1700000 },
    monthly: { revenue: 18750000, treatments: 285, customers: 180, therapistFees: 7500000 },
    yearly: { revenue: 225000000, treatments: 3420, customers: 2160, therapistFees: 90000000 }
  }

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setLoading(true)
        // TODO: Replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
        setReportData(mockReportData)
      } catch (err) {
        console.error('Error fetching report data:', err)
        setError('Failed to load report data')
      } finally {
        setLoading(false)
      }
    }

    fetchReportData()
  }, [selectedPeriod, selectedDate])

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

        {/* Export Options */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="salon-card p-6"
        >
          <h2 className="text-xl font-semibold text-pink-800 mb-6">Export Laporan</h2>
          <div className="flex flex-wrap gap-4">
            <button className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
              📊 Export ke Excel
            </button>
            <button className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
              📄 Export ke PDF
            </button>
            <button className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
              📧 Email Laporan
            </button>
          </div>
        </motion.div>

        </>
        )}
      </div>
    </AdminLayout>
  )
}