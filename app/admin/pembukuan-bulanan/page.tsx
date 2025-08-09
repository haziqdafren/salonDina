'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import AdminLayout from '../../../components/admin/AdminLayout'

// Monthly entry interface
interface MonthlyEntry {
  date: string
  omzet: number
  pengeluaran: {
    operasional: number
    gaji: number
    feeTherapist: number
  }
  totalPengeluaran: number
  omzetBerjalan: number
  notes?: string
}

interface MonthlyStats {
  totalOmzet: number
  totalPengeluaran: number
  netProfit: number
  averageDaily: number
  operasionalCosts: number
  therapistFees: number
  salaries: number
}

// Mock monthly data for December 2024
const mockMonthlyData: MonthlyEntry[] = [
  {
    date: '2024-12-01',
    omzet: 2850000,
    pengeluaran: { operasional: 350000, gaji: 500000, feeTherapist: 285000 },
    totalPengeluaran: 1135000,
    omzetBerjalan: 2850000,
    notes: 'Pembukaan bulan, stok produk baru'
  },
  {
    date: '2024-12-02',
    omzet: 3200000,
    pengeluaran: { operasional: 200000, gaji: 0, feeTherapist: 320000 },
    totalPengeluaran: 520000,
    omzetBerjalan: 6050000,
    notes: 'Weekend busy day'
  },
  {
    date: '2024-12-03',
    omzet: 2100000,
    pengeluaran: { operasional: 150000, gaji: 0, feeTherapist: 210000 },
    totalPengeluaran: 360000,
    omzetBerjalan: 8150000
  },
  {
    date: '2024-12-04',
    omzet: 2650000,
    pengeluaran: { operasional: 180000, gaji: 0, feeTherapist: 265000 },
    totalPengeluaran: 445000,
    omzetBerjalan: 10800000
  },
  {
    date: '2024-12-05',
    omzet: 1950000,
    pengeluaran: { operasional: 120000, gaji: 0, feeTherapist: 195000 },
    totalPengeluaran: 315000,
    omzetBerjalan: 12750000
  },
  {
    date: '2024-12-06',
    omzet: 2400000,
    pengeluaran: { operasional: 160000, gaji: 0, feeTherapist: 240000 },
    totalPengeluaran: 400000,
    omzetBerjalan: 15150000
  },
  {
    date: '2024-12-07',
    omzet: 2800000,
    pengeluaran: { operasional: 190000, gaji: 0, feeTherapist: 280000 },
    totalPengeluaran: 470000,
    omzetBerjalan: 17950000,
    notes: 'Weekend peak, extra therapist'
  }
]

export default function PembukuanBulanan() {
  const [selectedMonth, setSelectedMonth] = useState('2024-12')
  const [monthlyData, setMonthlyData] = useState<MonthlyEntry[]>(mockMonthlyData)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingEntry, setEditingEntry] = useState<MonthlyEntry | null>(null)
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    omzet: 0,
    operasional: 0,
    gaji: 0,
    feeTherapist: 0,
    notes: ''
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  // Filter data by selected month
  const filteredData = monthlyData.filter(entry => 
    entry.date.startsWith(selectedMonth)
  )

  // Calculate monthly statistics
  const monthlyStats: MonthlyStats = {
    totalOmzet: filteredData.reduce((sum, entry) => sum + entry.omzet, 0),
    totalPengeluaran: filteredData.reduce((sum, entry) => sum + entry.totalPengeluaran, 0),
    netProfit: 0,
    averageDaily: 0,
    operasionalCosts: filteredData.reduce((sum, entry) => sum + entry.pengeluaran.operasional, 0),
    therapistFees: filteredData.reduce((sum, entry) => sum + entry.pengeluaran.feeTherapist, 0),
    salaries: filteredData.reduce((sum, entry) => sum + entry.pengeluaran.gaji, 0)
  }

  monthlyStats.netProfit = monthlyStats.totalOmzet - monthlyStats.totalPengeluaran
  monthlyStats.averageDaily = filteredData.length > 0 ? monthlyStats.totalOmzet / filteredData.length : 0

  // Calculate cumulative running totals
  const dataWithRunningTotals = filteredData.map((entry, index) => {
    const runningOmzet = filteredData.slice(0, index + 1).reduce((sum, e) => sum + e.omzet, 0)
    return { ...entry, omzetBerjalan: runningOmzet }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const totalPengeluaran = formData.operasional + formData.gaji + formData.feeTherapist
    
    const newEntry: MonthlyEntry = {
      date: formData.date,
      omzet: formData.omzet,
      pengeluaran: {
        operasional: formData.operasional,
        gaji: formData.gaji,
        feeTherapist: formData.feeTherapist
      },
      totalPengeluaran,
      omzetBerjalan: 0, // Will be recalculated
      notes: formData.notes
    }

    if (editingEntry) {
      setMonthlyData(prev => prev.map(entry => 
        entry.date === editingEntry.date ? newEntry : entry
      ))
    } else {
      setMonthlyData(prev => [...prev, newEntry].sort((a, b) => a.date.localeCompare(b.date)))
    }

    // Reset form
    setFormData({
      date: new Date().toISOString().split('T')[0],
      omzet: 0,
      operasional: 0,
      gaji: 0,
      feeTherapist: 0,
      notes: ''
    })
    
    setShowAddForm(false)
    setEditingEntry(null)
  }

  const handleEdit = (entry: MonthlyEntry) => {
    setFormData({
      date: entry.date,
      omzet: entry.omzet,
      operasional: entry.pengeluaran.operasional,
      gaji: entry.pengeluaran.gaji,
      feeTherapist: entry.pengeluaran.feeTherapist,
      notes: entry.notes || ''
    })
    setEditingEntry(entry)
    setShowAddForm(true)
  }

  const handleDelete = (date: string) => {
    if (confirm('Yakin ingin menghapus entry ini?')) {
      setMonthlyData(prev => prev.filter(entry => entry.date !== date))
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-pink-800 mb-2">Pembukuan Bulanan</h1>
            <p className="text-gray-600">Kelola keuangan bulanan salon dengan sistem P&L digital</p>
          </div>
          <div className="flex items-center gap-4">
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="salon-input w-auto"
            />
            <button
              onClick={() => {
                setEditingEntry(null)
                setFormData({
                  date: new Date().toISOString().split('T')[0],
                  omzet: 0,
                  operasional: 0,
                  gaji: 0,
                  feeTherapist: 0,
                  notes: ''
                })
                setShowAddForm(true)
              }}
              className="salon-button-primary flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Tambah Entry
            </button>
          </div>
        </div>

        {/* Monthly Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="salon-card p-6"
          >
            <div className="flex items-center gap-4">
              <div className="bg-green-100 p-3 rounded-2xl">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Total Omzet</h3>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(monthlyStats.totalOmzet)}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="salon-card p-6"
          >
            <div className="flex items-center gap-4">
              <div className="bg-red-100 p-3 rounded-2xl">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Total Pengeluaran</h3>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(monthlyStats.totalPengeluaran)}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="salon-card p-6"
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl ${monthlyStats.netProfit >= 0 ? 'bg-blue-100' : 'bg-orange-100'}`}>
                <svg className={`w-6 h-6 ${monthlyStats.netProfit >= 0 ? 'text-blue-600' : 'text-orange-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Net Profit</h3>
                <p className={`text-2xl font-bold ${monthlyStats.netProfit >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                  {formatCurrency(monthlyStats.netProfit)}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="salon-card p-6"
          >
            <div className="flex items-center gap-4">
              <div className="bg-purple-100 p-3 rounded-2xl">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Rata-rata Harian</h3>
                <p className="text-2xl font-bold text-purple-600">{formatCurrency(monthlyStats.averageDaily)}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Expense Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="salon-card p-6"
        >
          <h2 className="text-xl font-semibold text-pink-800 mb-6">Breakdown Pengeluaran Bulan Ini</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl">
              <div className="text-3xl mb-2">🛒</div>
              <h4 className="font-semibold text-gray-800 mb-1">Operasional</h4>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(monthlyStats.operasionalCosts)}</p>
              <p className="text-sm text-gray-500">
                {((monthlyStats.operasionalCosts / monthlyStats.totalPengeluaran) * 100).toFixed(1)}% dari total
              </p>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl">
              <div className="text-3xl mb-2">👩‍⚕️</div>
              <h4 className="font-semibold text-gray-800 mb-1">Fee Therapist</h4>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(monthlyStats.therapistFees)}</p>
              <p className="text-sm text-gray-500">
                {((monthlyStats.therapistFees / monthlyStats.totalPengeluaran) * 100).toFixed(1)}% dari total
              </p>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl">
              <div className="text-3xl mb-2">💼</div>
              <h4 className="font-semibold text-gray-800 mb-1">Gaji Tetap</h4>
              <p className="text-2xl font-bold text-purple-600">{formatCurrency(monthlyStats.salaries)}</p>
              <p className="text-sm text-gray-500">
                {monthlyStats.totalPengeluaran > 0 ? ((monthlyStats.salaries / monthlyStats.totalPengeluaran) * 100).toFixed(1) : 0}% dari total
              </p>
            </div>
          </div>
        </motion.div>

        {/* Monthly Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="salon-card overflow-hidden"
        >
          <div className="p-6 border-b border-pink-100">
            <h2 className="text-xl font-semibold text-pink-800">
              Tabel Pembukuan {new Date(selectedMonth + '-01').toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-pink-50">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-pink-800">Tanggal</th>
                  <th className="text-left py-3 px-4 font-semibold text-pink-800">Omzet</th>
                  <th className="text-left py-3 px-4 font-semibold text-pink-800">OP</th>
                  <th className="text-left py-3 px-4 font-semibold text-pink-800">GAJI</th>
                  <th className="text-left py-3 px-4 font-semibold text-pink-800">FEE</th>
                  <th className="text-left py-3 px-4 font-semibold text-pink-800">Total Pengeluaran</th>
                  <th className="text-left py-3 px-4 font-semibold text-pink-800">Omzet Berjalan</th>
                  <th className="text-left py-3 px-4 font-semibold text-pink-800">Profit Harian</th>
                  <th className="text-left py-3 px-4 font-semibold text-pink-800">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {dataWithRunningTotals.map((entry, index) => {
                  const dailyProfit = entry.omzet - entry.totalPengeluaran
                  return (
                    <tr key={entry.date} className="border-t border-pink-100 hover:bg-pink-25">
                      <td className="py-3 px-4">
                        <div className="font-medium">{formatDate(entry.date)}</div>
                        {entry.notes && (
                          <div className="text-xs text-gray-500 mt-1">{entry.notes}</div>
                        )}
                      </td>
                      <td className="py-3 px-4 font-semibold text-green-600">
                        {formatCurrency(entry.omzet)}
                      </td>
                      <td className="py-3 px-4 text-red-600">
                        {formatCurrency(entry.pengeluaran.operasional)}
                      </td>
                      <td className="py-3 px-4 text-purple-600">
                        {formatCurrency(entry.pengeluaran.gaji)}
                      </td>
                      <td className="py-3 px-4 text-blue-600">
                        {formatCurrency(entry.pengeluaran.feeTherapist)}
                      </td>
                      <td className="py-3 px-4 font-semibold text-red-600">
                        {formatCurrency(entry.totalPengeluaran)}
                      </td>
                      <td className="py-3 px-4 font-semibold text-indigo-600">
                        {formatCurrency(entry.omzetBerjalan)}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`font-semibold ${dailyProfit >= 0 ? 'text-green-600' : 'text-orange-600'}`}>
                          {formatCurrency(dailyProfit)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleEdit(entry)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(entry.date)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              
              {/* Summary Row */}
              <tfoot className="bg-pink-50 border-t-2 border-pink-200">
                <tr className="font-semibold">
                  <td className="py-3 px-4 text-pink-800">TOTAL BULAN</td>
                  <td className="py-3 px-4 text-green-600">{formatCurrency(monthlyStats.totalOmzet)}</td>
                  <td className="py-3 px-4 text-red-600">{formatCurrency(monthlyStats.operasionalCosts)}</td>
                  <td className="py-3 px-4 text-purple-600">{formatCurrency(monthlyStats.salaries)}</td>
                  <td className="py-3 px-4 text-blue-600">{formatCurrency(monthlyStats.therapistFees)}</td>
                  <td className="py-3 px-4 text-red-600">{formatCurrency(monthlyStats.totalPengeluaran)}</td>
                  <td className="py-3 px-4 text-indigo-600">{formatCurrency(monthlyStats.totalOmzet)}</td>
                  <td className={`py-3 px-4 ${monthlyStats.netProfit >= 0 ? 'text-green-600' : 'text-orange-600'}`}>
                    {formatCurrency(monthlyStats.netProfit)}
                  </td>
                  <td className="py-3 px-4"></td>
                </tr>
              </tfoot>
            </table>
            
            {filteredData.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Belum ada data</h3>
                <p className="text-gray-500">Tambah entry untuk mulai pembukuan bulan ini</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Add/Edit Entry Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="salon-card max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-pink-100">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-pink-800">
                    {editingEntry ? 'Edit Entry' : 'Tambah Entry Baru'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowAddForm(false)
                      setEditingEntry(null)
                    }}
                    className="p-2 hover:bg-pink-50 rounded-lg"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Date */}
                <div>
                  <label className="salon-label">Tanggal *</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    className="salon-input"
                  />
                </div>

                {/* Revenue */}
                <div>
                  <label className="salon-label">Omzet *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="1000"
                    value={formData.omzet}
                    onChange={(e) => setFormData(prev => ({ ...prev, omzet: parseInt(e.target.value) || 0 }))}
                    className="salon-input"
                    placeholder="Total pendapatan hari ini"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Preview: {formatCurrency(formData.omzet)}
                  </p>
                </div>

                {/* Expenses */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-4">Pengeluaran</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="salon-label">Operasional (OP)</label>
                      <input
                        type="number"
                        min="0"
                        step="1000"
                        value={formData.operasional}
                        onChange={(e) => setFormData(prev => ({ ...prev, operasional: parseInt(e.target.value) || 0 }))}
                        className="salon-input"
                        placeholder="Produk, utilitas, dll"
                      />
                    </div>
                    
                    <div>
                      <label className="salon-label">Gaji Tetap</label>
                      <input
                        type="number"
                        min="0"
                        step="1000"
                        value={formData.gaji}
                        onChange={(e) => setFormData(prev => ({ ...prev, gaji: parseInt(e.target.value) || 0 }))}
                        className="salon-input"
                        placeholder="Gaji karyawan tetap"
                      />
                    </div>
                    
                    <div>
                      <label className="salon-label">Fee Therapist</label>
                      <input
                        type="number"
                        min="0"
                        step="1000"
                        value={formData.feeTherapist}
                        onChange={(e) => setFormData(prev => ({ ...prev, feeTherapist: parseInt(e.target.value) || 0 }))}
                        className="salon-input"
                        placeholder="Total fee dan komisi therapist"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4 p-4 bg-red-50 rounded-lg">
                    <div className="text-lg font-semibold text-red-700">
                      Total Pengeluaran: {formatCurrency(formData.operasional + formData.gaji + formData.feeTherapist)}
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="salon-label">Catatan</label>
                  <textarea
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    className="salon-input"
                    placeholder="Catatan khusus untuk hari ini..."
                  />
                </div>

                {/* Profit Preview */}
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-lg font-semibold text-blue-700">
                    Net Profit Hari Ini: {formatCurrency(formData.omzet - (formData.operasional + formData.gaji + formData.feeTherapist))}
                  </div>
                </div>

                {/* Submit */}
                <div className="flex gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false)
                      setEditingEntry(null)
                    }}
                    className="salon-button-secondary flex-1"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="salon-button-primary flex-1"
                  >
                    {editingEntry ? 'Update Entry' : 'Simpan Entry'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}