'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import AdminLayout from '../../../components/admin/AdminLayout'
import CurrencyInput from '../../../components/ui/CurrencyInput'
import { showNotification } from '../../../components/ui/NotificationToast'

// Enhanced Monthly Entry Interface
interface MonthlyEntry {
  id: string
  date: string
  omzet: number
  pengeluaran: {
    operasional: number
    gaji: number
    feeTherapist: number
    lainnya?: number
  }
  totalPengeluaran: number
  netProfit: number
  notes?: string
  createdAt: string
  updatedAt: string
}

interface MonthlyStats {
  totalOmzet: number
  totalPengeluaran: number
  netProfit: number
  averageDaily: number
  averageProfit: number
  operasionalCosts: number
  therapistFees: number
  salaries: number
  profitMargin: number
  totalDays: number
}

interface FormData {
  date: string
  omzet: number
  operasional: number
  gaji: number
  feeTherapist: number
  lainnya: number
  notes: string
}

// Professional Monthly Accounting System
export default function PembukuanBulananProfessional() {
  // State Management
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`
  })
  
  const [monthlyData, setMonthlyData] = useState<MonthlyEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingEntry, setEditingEntry] = useState<MonthlyEntry | null>(null)
  
  const [formData, setFormData] = useState<FormData>({
    date: new Date().toISOString().split('T')[0],
    omzet: 0,
    operasional: 0,
    gaji: 0,
    feeTherapist: 0,
    lainnya: 0,
    notes: ''
  })

  // Storage key based on month
  const getStorageKey = (month: string) => `monthlyAccounting_${month}`

  // Load data from localStorage
  useEffect(() => {
    const loadData = () => {
      setLoading(true)
      try {
        const storageKey = getStorageKey(selectedMonth)
        const savedData = localStorage.getItem(storageKey)
        
        if (savedData) {
          const parsedData = JSON.parse(savedData)
          setMonthlyData(Array.isArray(parsedData) ? parsedData : [])
        } else {
          setMonthlyData([])
        }
      } catch (error) {
        console.error('Error loading monthly data:', error)
        setMonthlyData([])
        showNotification.error('Error', 'Gagal memuat data bulan ini')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [selectedMonth])

  // Save data to localStorage
  const saveData = (data: MonthlyEntry[]) => {
    try {
      const storageKey = getStorageKey(selectedMonth)
      localStorage.setItem(storageKey, JSON.stringify(data))
    } catch (error) {
      console.error('Error saving data:', error)
      showNotification.error('Error', 'Gagal menyimpan data')
    }
  }

  // Generate unique ID
  const generateId = () => `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  // Form validation
  const validateForm = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = []
    const today = new Date().toISOString().split('T')[0]
    
    if (!formData.date) {
      errors.push('Tanggal harus diisi')
    } else if (formData.date > today) {
      errors.push('Tidak dapat menambahkan data untuk tanggal yang akan datang')
    }
    
    if (formData.omzet < 0) {
      errors.push('Omzet tidak boleh negatif')
    }
    
    if (formData.operasional < 0 || formData.gaji < 0 || formData.feeTherapist < 0 || formData.lainnya < 0) {
      errors.push('Pengeluaran tidak boleh negatif')
    }

    // Check for duplicate date (only for new entries)
    if (!editingEntry) {
      const isDuplicate = monthlyData.some(entry => entry.date === formData.date)
      if (isDuplicate) {
        errors.push('Data untuk tanggal ini sudah ada. Gunakan Edit untuk mengubah.')
      }
    }
    
    return { isValid: errors.length === 0, errors }
  }

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const validation = validateForm()
    if (!validation.isValid) {
      validation.errors.forEach(error => {
        showNotification.error('Validasi Gagal', error)
      })
      return
    }

    try {
      const totalPengeluaran = formData.operasional + formData.gaji + formData.feeTherapist + formData.lainnya
      const netProfit = formData.omzet - totalPengeluaran
      const now = new Date().toISOString()

      const entryData: MonthlyEntry = {
        id: editingEntry?.id || generateId(),
        date: formData.date,
        omzet: formData.omzet,
        pengeluaran: {
          operasional: formData.operasional,
          gaji: formData.gaji,
          feeTherapist: formData.feeTherapist,
          lainnya: formData.lainnya
        },
        totalPengeluaran,
        netProfit,
        notes: formData.notes.trim() || undefined,
        createdAt: editingEntry?.createdAt || now,
        updatedAt: now
      }

      let updatedData: MonthlyEntry[]

      if (editingEntry) {
        // Update existing entry
        updatedData = monthlyData.map(entry => 
          entry.id === editingEntry.id ? entryData : entry
        )
        showNotification.success('Berhasil Diperbarui!', 'Data pembukuan telah diperbarui')
      } else {
        // Add new entry
        updatedData = [...monthlyData, entryData].sort((a, b) => a.date.localeCompare(b.date))
        showNotification.success('Berhasil Ditambahkan!', 'Data pembukuan baru telah disimpan')
      }

      setMonthlyData(updatedData)
      saveData(updatedData)
      resetForm()
      setShowAddModal(false)
      setEditingEntry(null)

    } catch (error) {
      console.error('Error submitting form:', error)
      showNotification.error('Gagal Menyimpan', 'Terjadi kesalahan saat menyimpan data')
    }
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      omzet: 0,
      operasional: 0,
      gaji: 0,
      feeTherapist: 0,
      lainnya: 0,
      notes: ''
    })
  }

  // Handle edit
  const handleEdit = (entry: MonthlyEntry) => {
    setEditingEntry(entry)
    setFormData({
      date: entry.date,
      omzet: entry.omzet,
      operasional: entry.pengeluaran.operasional,
      gaji: entry.pengeluaran.gaji,
      feeTherapist: entry.pengeluaran.feeTherapist,
      lainnya: entry.pengeluaran.lainnya || 0,
      notes: entry.notes || ''
    })
    setShowAddModal(true)
  }

  // Handle delete
  const handleDelete = (entryId: string) => {
    if (!confirm('Yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan.')) {
      return
    }

    try {
      const updatedData = monthlyData.filter(entry => entry.id !== entryId)
      setMonthlyData(updatedData)
      saveData(updatedData)
      showNotification.success('Terhapus', 'Data pembukuan telah dihapus')
    } catch (error) {
      console.error('Error deleting entry:', error)
      showNotification.error('Gagal Menghapus', 'Terjadi kesalahan saat menghapus data')
    }
  }

  // Calculate monthly statistics
  const calculateStats = (): MonthlyStats => {
    if (monthlyData.length === 0) {
      return {
        totalOmzet: 0,
        totalPengeluaran: 0,
        netProfit: 0,
        averageDaily: 0,
        averageProfit: 0,
        operasionalCosts: 0,
        therapistFees: 0,
        salaries: 0,
        profitMargin: 0,
        totalDays: 0
      }
    }

    const totalOmzet = monthlyData.reduce((sum, entry) => sum + entry.omzet, 0)
    const totalPengeluaran = monthlyData.reduce((sum, entry) => sum + entry.totalPengeluaran, 0)
    const netProfit = totalOmzet - totalPengeluaran
    const operasionalCosts = monthlyData.reduce((sum, entry) => sum + entry.pengeluaran.operasional, 0)
    const therapistFees = monthlyData.reduce((sum, entry) => sum + entry.pengeluaran.feeTherapist, 0)
    const salaries = monthlyData.reduce((sum, entry) => sum + entry.pengeluaran.gaji, 0)
    const totalDays = monthlyData.length

    return {
      totalOmzet,
      totalPengeluaran,
      netProfit,
      averageDaily: totalOmzet / totalDays,
      averageProfit: netProfit / totalDays,
      operasionalCosts,
      therapistFees,
      salaries,
      profitMargin: totalOmzet > 0 ? (netProfit / totalOmzet) * 100 : 0,
      totalDays
    }
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  // Get month name
  const getMonthName = (monthString: string) => {
    const date = new Date(monthString + '-01')
    return date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
  }

  const stats = calculateStats()
  const validation = validateForm()

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat data pembukuan...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-pink-800 mb-2">Pembukuan Bulanan</h1>
            <p className="text-gray-600">Sistem akuntansi digital untuk laporan keuangan salon</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div>
              <label className="salon-label text-sm">Pilih Bulan</label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="salon-input w-auto"
              />
            </div>
            
            <button
              onClick={() => {
                resetForm()
                setEditingEntry(null)
                setShowAddModal(true)
              }}
              className="salon-btn-primary flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Tambah Entry
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
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
                <h3 className="text-sm font-medium text-gray-600">Total Omzet</h3>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalOmzet)}</p>
                <p className="text-xs text-gray-500">Rata-rata: {formatCurrency(stats.averageDaily)}/hari</p>
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
                <h3 className="text-sm font-medium text-gray-600">Total Pengeluaran</h3>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(stats.totalPengeluaran)}</p>
                <p className="text-xs text-gray-500">{stats.totalDays} hari operasi</p>
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
              <div className={`p-3 rounded-2xl ${stats.netProfit >= 0 ? 'bg-blue-100' : 'bg-orange-100'}`}>
                <svg className={`w-6 h-6 ${stats.netProfit >= 0 ? 'text-blue-600' : 'text-orange-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-600">Net Profit</h3>
                <p className={`text-2xl font-bold ${stats.netProfit >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                  {formatCurrency(stats.netProfit)}
                </p>
                <p className="text-xs text-gray-500">
                  Margin: {stats.profitMargin.toFixed(1)}%
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
                <h3 className="text-sm font-medium text-gray-600">Profit Harian</h3>
                <p className={`text-2xl font-bold ${stats.averageProfit >= 0 ? 'text-purple-600' : 'text-orange-600'}`}>
                  {formatCurrency(stats.averageProfit)}
                </p>
                <p className="text-xs text-gray-500">Per hari rata-rata</p>
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
          <h2 className="text-xl font-semibold text-pink-800 mb-6">Breakdown Pengeluaran - {getMonthName(selectedMonth)}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl">
              <div className="text-3xl mb-2">🛒</div>
              <h4 className="font-semibold text-gray-800 mb-1">Operasional</h4>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(stats.operasionalCosts)}</p>
              <p className="text-sm text-gray-500">
                {stats.totalPengeluaran > 0 ? ((stats.operasionalCosts / stats.totalPengeluaran) * 100).toFixed(1) : 0}% dari total
              </p>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl">
              <div className="text-3xl mb-2">👩‍⚕️</div>
              <h4 className="font-semibold text-gray-800 mb-1">Fee Therapist</h4>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(stats.therapistFees)}</p>
              <p className="text-sm text-gray-500">
                {stats.totalPengeluaran > 0 ? ((stats.therapistFees / stats.totalPengeluaran) * 100).toFixed(1) : 0}% dari total
              </p>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl">
              <div className="text-3xl mb-2">💼</div>
              <h4 className="font-semibold text-gray-800 mb-1">Gaji Tetap</h4>
              <p className="text-2xl font-bold text-purple-600">{formatCurrency(stats.salaries)}</p>
              <p className="text-sm text-gray-500">
                {stats.totalPengeluaran > 0 ? ((stats.salaries / stats.totalPengeluaran) * 100).toFixed(1) : 0}% dari total
              </p>
            </div>
          </div>
        </motion.div>

        {/* Data Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="salon-card overflow-hidden"
        >
          <div className="p-6 border-b border-pink-100">
            <h2 className="text-xl font-semibold text-pink-800">
              Data Pembukuan - {getMonthName(selectedMonth)}
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-pink-50">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-pink-800">Tanggal</th>
                  <th className="text-left py-3 px-4 font-semibold text-pink-800">Omzet</th>
                  <th className="text-left py-3 px-4 font-semibold text-pink-800">Operasional</th>
                  <th className="text-left py-3 px-4 font-semibold text-pink-800">Gaji</th>
                  <th className="text-left py-3 px-4 font-semibold text-pink-800">Fee</th>
                  <th className="text-left py-3 px-4 font-semibold text-pink-800">Total Pengeluaran</th>
                  <th className="text-left py-3 px-4 font-semibold text-pink-800">Net Profit</th>
                  <th className="text-left py-3 px-4 font-semibold text-pink-800">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {monthlyData.map((entry, index) => (
                  <tr key={entry.id} className="border-t border-pink-100 hover:bg-pink-25">
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
                    <td className="py-3 px-4">
                      <span className={`font-semibold ${entry.netProfit >= 0 ? 'text-green-600' : 'text-orange-600'}`}>
                        {formatCurrency(entry.netProfit)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEdit(entry)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(entry.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                          title="Hapus"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              
              {/* Summary Row */}
              {monthlyData.length > 0 && (
                <tfoot className="bg-gradient-to-r from-indigo-50 to-purple-50 border-t-2 border-indigo-200">
                  <tr className="font-bold">
                    <td className="py-4 px-4 text-indigo-800 text-base">💰 TOTAL BULAN</td>
                    <td className="py-3 px-4 text-green-600">{formatCurrency(stats.totalOmzet)}</td>
                    <td className="py-3 px-4 text-red-600">{formatCurrency(stats.operasionalCosts)}</td>
                    <td className="py-3 px-4 text-purple-600">{formatCurrency(stats.salaries)}</td>
                    <td className="py-3 px-4 text-blue-600">{formatCurrency(stats.therapistFees)}</td>
                    <td className="py-3 px-4 text-red-600">{formatCurrency(stats.totalPengeluaran)}</td>
                    <td className={`py-3 px-4 ${stats.netProfit >= 0 ? 'text-green-600' : 'text-orange-600'}`}>
                      {formatCurrency(stats.netProfit)}
                    </td>
                    <td className="py-3 px-4"></td>
                  </tr>
                </tfoot>
              )}
            </table>
            
            {monthlyData.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Belum ada data</h3>
                <p className="text-gray-500">Tambah entry pembukuan untuk bulan {getMonthName(selectedMonth)}</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Add/Edit Modal */}
        <AnimatePresence>
          {showAddModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setShowAddModal(false)
                  setEditingEntry(null)
                  resetForm()
                }
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ 
                  type: "spring", 
                  damping: 25, 
                  stiffness: 300,
                  duration: 0.3 
                }}
                className="salon-card max-w-3xl w-full relative"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header - Fixed */}
                <div className="p-6 border-b border-pink-100 bg-white rounded-t-2xl sticky top-0 z-10">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-xl font-semibold text-pink-800">
                        {editingEntry ? 'Edit Entry Pembukuan' : 'Tambah Entry Pembukuan'}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {editingEntry ? 'Perbarui data keuangan harian' : 'Tambahkan data keuangan harian baru'}
                      </p>
                    </div>
                    <motion.button
                      onClick={() => {
                        setShowAddModal(false)
                        setEditingEntry(null)
                        resetForm()
                      }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 hover:bg-pink-50 rounded-lg transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </motion.button>
                  </div>
                </div>
                
                {/* Modal Content - Scrollable */}
                <div className="max-h-[calc(90vh-120px)] overflow-y-auto">
                  <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Date - Animated */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <label className="salon-label">Tanggal *</label>
                      <motion.input
                        type="date"
                        required
                        value={formData.date}
                        onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                        className="salon-input"
                        whileFocus={{ scale: 1.02 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                      />
                    </motion.div>

                    {/* Revenue - Animated */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <CurrencyInput
                        label="Omzet *"
                        value={formData.omzet}
                        onChange={(value) => setFormData(prev => ({ ...prev, omzet: value }))}
                        placeholder="Total pendapatan hari ini"
                        required={true}
                      />
                    </motion.div>

                    {/* Expenses - Animated */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <span className="text-lg">💸</span>
                        Pengeluaran
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <motion.div
                          whileHover={{ y: -2 }}
                          transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        >
                          <CurrencyInput
                            label="Operasional"
                            value={formData.operasional}
                            onChange={(value) => setFormData(prev => ({ ...prev, operasional: value }))}
                            placeholder="Produk, utilitas, dll"
                          />
                        </motion.div>
                        
                        <motion.div
                          whileHover={{ y: -2 }}
                          transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        >
                          <CurrencyInput
                            label="Gaji Tetap"
                            value={formData.gaji}
                            onChange={(value) => setFormData(prev => ({ ...prev, gaji: value }))}
                            placeholder="Gaji karyawan tetap"
                          />
                        </motion.div>
                        
                        <motion.div
                          whileHover={{ y: -2 }}
                          transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        >
                          <CurrencyInput
                            label="Fee Therapist"
                            value={formData.feeTherapist}
                            onChange={(value) => setFormData(prev => ({ ...prev, feeTherapist: value }))}
                            placeholder="Fee dan komisi therapist"
                          />
                        </motion.div>
                        
                        <motion.div
                          whileHover={{ y: -2 }}
                          transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        >
                          <CurrencyInput
                            label="Pengeluaran Lainnya"
                            value={formData.lainnya}
                            onChange={(value) => setFormData(prev => ({ ...prev, lainnya: value }))}
                            placeholder="Pengeluaran lain-lain"
                          />
                        </motion.div>
                      </div>
                    </motion.div>

                    {/* Summary - Animated */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="bg-gradient-to-br from-gray-50 to-pink-50 rounded-xl p-4 space-y-3 border border-pink-100"
                    >
                      <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                        <span className="text-lg">📊</span>
                        Ringkasan Keuangan
                      </h4>
                      
                      <div className="space-y-2">
                        <motion.div 
                          className="flex justify-between text-sm"
                          whileHover={{ x: 4 }}
                          transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        >
                          <span className="text-gray-600">Total Pengeluaran:</span>
                          <span className="font-semibold text-red-600">
                            {formatCurrency(formData.operasional + formData.gaji + formData.feeTherapist + formData.lainnya)}
                          </span>
                        </motion.div>
                        
                        <motion.div 
                          className="flex justify-between text-lg font-bold pt-2 border-t border-pink-200"
                          whileHover={{ x: 4 }}
                          transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        >
                          <span className="text-gray-800 flex items-center gap-2">
                            <span className="text-lg">💰</span>
                            Net Profit:
                          </span>
                          <span className={`${(formData.omzet - (formData.operasional + formData.gaji + formData.feeTherapist + formData.lainnya)) >= 0 ? 'text-green-600' : 'text-orange-600'}`}>
                            {formatCurrency(formData.omzet - (formData.operasional + formData.gaji + formData.feeTherapist + formData.lainnya))}
                          </span>
                        </motion.div>
                      </div>
                    </motion.div>

                    {/* Notes - Animated */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <label className="salon-label flex items-center gap-2">
                        <span className="text-lg">📝</span>
                        Catatan
                      </label>
                      <motion.textarea
                        rows={3}
                        value={formData.notes}
                        onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                        className="salon-input resize-none"
                        placeholder="Catatan khusus untuk hari ini..."
                        whileFocus={{ scale: 1.01 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                      />
                    </motion.div>

                    {/* Validation Errors - Animated */}
                    <AnimatePresence>
                      {!validation.isValid && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="p-4 bg-red-50 border border-red-200 rounded-lg"
                        >
                          <div className="flex items-start gap-2">
                            <span className="text-red-500 text-lg">⚠️</span>
                            <div className="text-sm text-red-800">
                              <h5 className="font-semibold mb-2">Validasi Form:</h5>
                              <ul className="list-disc list-inside space-y-1">
                                {validation.errors.map((error, index) => (
                                  <motion.li 
                                    key={index}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                  >
                                    {error}
                                  </motion.li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </form>
                </div>

                {/* Modal Footer - Fixed */}
                <div className="p-6 border-t border-pink-100 bg-white rounded-b-2xl sticky bottom-0 z-10">
                  <div className="flex gap-3">
                    <motion.button
                      type="button"
                      onClick={() => {
                        setShowAddModal(false)
                        setEditingEntry(null)
                        resetForm()
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="salon-btn-secondary flex-1"
                    >
                      Batal
                    </motion.button>
                    <motion.button
                      type="submit"
                      form="accounting-form"
                      disabled={!validation.isValid}
                      whileHover={validation.isValid ? { scale: 1.02 } : {}}
                      whileTap={validation.isValid ? { scale: 0.98 } : {}}
                      className={`salon-btn-primary flex-1 ${!validation.isValid ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={handleSubmit}
                    >
                      <span className="flex items-center gap-2 justify-center">
                        {validation.isValid ? (
                          <>
                            <span className="text-lg">✨</span>
                            {editingEntry ? 'Perbarui Entry' : 'Simpan Entry'}
                          </>
                        ) : (
                          <>
                            <span className="text-lg">⚠️</span>
                            Lengkapi Form
                          </>
                        )}
                      </span>
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  )
}