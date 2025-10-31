'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, Download, FileSpreadsheet } from 'lucide-react'
import Link from 'next/link'
import { formatMSAR, formatPercent } from '@/lib/utils'

export default function VersionDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { user, loading } = useAuth()
  const [versionData, setVersionData] = useState<any>(null)
  const [loadingData, setLoadingData] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  const versionId = params.id as string

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user && versionId) {
      loadVersionData()
    }
  }, [user, versionId])

  async function loadVersionData() {
    try {
      const { data, error } = await supabase.functions.invoke('get-version', {
        body: { version_id: versionId }
      })

      if (error) throw error
      setVersionData(data.data)
    } catch (error) {
      console.error('Error loading version:', error)
    } finally {
      setLoadingData(false)
    }
  }

  if (loading || !user || loadingData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    )
  }

  if (!versionData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Version not found</p>
      </div>
    )
  }

  const { version, results } = versionData
  const years = results?.profit_loss ? Object.keys(results.profit_loss).slice(0, 10) : []

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                href="/versions"
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  {version.name}
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {version.version_type} Case
                </p>
              </div>
            </div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {['overview', 'pnl', 'balance-sheet', 'cash-flow', 'controls', 'ratios'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab
                    ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                {tab.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && results && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Revenue (2025)</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {formatMSAR(results.profit_loss['2025']?.total_revenues)} M SAR
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">EBITDA (2025)</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {formatMSAR(results.profit_loss['2025']?.ebitda)} M SAR
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Net Result (2025)</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {formatMSAR(results.profit_loss['2025']?.net_result)} M SAR
                </p>
              </div>
            </div>
          </div>
        )}

        {/* P&L Tab */}
        {activeTab === 'pnl' && results?.profit_loss && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Year
                  </th>
                  {years.map((year) => (
                    <th key={year} className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {year}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    Total Revenue
                  </td>
                  {years.map((year) => (
                    <td key={year} className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-white">
                      {formatMSAR(results.profit_loss[year]?.total_revenues)}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    Operating Expenses
                  </td>
                  {years.map((year) => (
                    <td key={year} className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-600 dark:text-red-400">
                      {formatMSAR(results.profit_loss[year]?.total_operating_expenses)}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    EBITDA
                  </td>
                  {years.map((year) => (
                    <td key={year} className="px-6 py-4 whitespace-nowrap text-sm text-right text-blue-600 dark:text-blue-400 font-semibold">
                      {formatMSAR(results.profit_loss[year]?.ebitda)}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    Net Result
                  </td>
                  {years.map((year) => (
                    <td key={year} className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600 dark:text-green-400 font-semibold">
                      {formatMSAR(results.profit_loss[year]?.net_result)}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Controls Tab */}
        {activeTab === 'controls' && results?.controls && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Balance Sheet Parity
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Year</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Assets</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Liab + Equity</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Difference</th>
                      <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {Object.entries(results.controls.balance_sheet_parity).slice(0, 10).map(([year, data]: [string, any]) => (
                      <tr key={year}>
                        <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">{year}</td>
                        <td className="px-4 py-2 text-sm text-right text-gray-900 dark:text-white">{data.assets}</td>
                        <td className="px-4 py-2 text-sm text-right text-gray-900 dark:text-white">{data.liab_equity}</td>
                        <td className="px-4 py-2 text-sm text-right text-gray-900 dark:text-white">{data.difference}</td>
                        <td className="px-4 py-2 text-center">
                          <span className={`px-2 py-1 text-xs font-semibold rounded ${
                            data.status === 'OK' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                          }`}>
                            {data.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Ratios Tab */}
        {activeTab === 'ratios' && results?.ratios && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(results.ratios['2025'] || {}).map(([key, value]: [string, any]) => (
              <div key={key} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {typeof value === 'string' ? value : value.toFixed(2)}
                  {key.includes('pct') || key.includes('margin') ? '%' : ''}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
