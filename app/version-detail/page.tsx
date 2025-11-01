'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, Download, FileSpreadsheet } from 'lucide-react'
import Link from 'next/link'
import { formatMSAR, formatPercent } from '@/lib/utils'

function VersionDetailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading } = useAuth()
  const [versionData, setVersionData] = useState<any>(null)
  const [loadingData, setLoadingData] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  const versionId = searchParams.get('id') || ''

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
  const years = results?.profit_loss ? Object.keys(results.profit_loss) : []

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
            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Revenue (2025)</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {formatMSAR(results.profit_loss['2025']?.total_revenues)} M
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">SAR</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">EBITDA (2025)</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {formatMSAR(results.profit_loss['2025']?.ebitda)} M
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  {formatPercent(results.profit_loss['2025']?.ebitda / results.profit_loss['2025']?.total_revenues)}% margin
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Net Result (2025)</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {formatMSAR(results.profit_loss['2025']?.net_result)} M
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  {formatPercent(results.profit_loss['2025']?.net_result / results.profit_loss['2025']?.total_revenues)}% margin
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Cash Position (2025)</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {formatMSAR(results.balance_sheet['2025']?.cash)} M
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">SAR</p>
              </div>
            </div>

            {/* Property Information */}
            {(version.metadata?.land_size || version.metadata?.building_size || version.metadata?.comments) && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Property Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {version.metadata?.land_size && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Land Size</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {version.metadata.land_size}
                      </p>
                    </div>
                  )}
                  {version.metadata?.building_size && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Building Size</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {version.metadata.building_size}
                      </p>
                    </div>
                  )}
                </div>
                {version.metadata?.comments && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Comments</p>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {version.metadata.comments}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* 3-Year Trend */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Strategic Near-Term Performance (2025-2027)
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Metric</th>
                      <th className="px-4 py-2 text-right text-sm font-medium text-gray-500 dark:text-gray-400">2025</th>
                      <th className="px-4 py-2 text-right text-sm font-medium text-gray-500 dark:text-gray-400">2026</th>
                      <th className="px-4 py-2 text-right text-sm font-medium text-gray-500 dark:text-gray-400">2027</th>
                      <th className="px-4 py-2 text-right text-sm font-medium text-gray-500 dark:text-gray-400">Growth</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    <tr>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">Revenue (M SAR)</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">
                        {formatMSAR(results.profit_loss['2025']?.total_revenues)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">
                        {formatMSAR(results.profit_loss['2026']?.total_revenues)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">
                        {formatMSAR(results.profit_loss['2027']?.total_revenues)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-green-600 dark:text-green-400">
                        +{formatPercent((results.profit_loss['2027']?.total_revenues / results.profit_loss['2025']?.total_revenues - 1) * 100)}%
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">EBITDA (M SAR)</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">
                        {formatMSAR(results.profit_loss['2025']?.ebitda)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">
                        {formatMSAR(results.profit_loss['2026']?.ebitda)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">
                        {formatMSAR(results.profit_loss['2027']?.ebitda)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-green-600 dark:text-green-400">
                        +{formatPercent((results.profit_loss['2027']?.ebitda / results.profit_loss['2025']?.ebitda - 1) * 100)}%
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">Net Result (M SAR)</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">
                        {formatMSAR(results.profit_loss['2025']?.net_result)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">
                        {formatMSAR(results.profit_loss['2026']?.net_result)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">
                        {formatMSAR(results.profit_loss['2027']?.net_result)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-green-600 dark:text-green-400">
                        +{formatPercent((results.profit_loss['2027']?.net_result / results.profit_loss['2025']?.net_result - 1) * 100)}%
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">Cash (M SAR)</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">
                        {formatMSAR(results.balance_sheet['2025']?.cash)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">
                        {formatMSAR(results.balance_sheet['2026']?.cash)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">
                        {formatMSAR(results.balance_sheet['2027']?.cash)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-blue-600 dark:text-blue-400">
                        +{formatMSAR(results.balance_sheet['2027']?.cash - results.balance_sheet['2025']?.cash)} M
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Long-Term View */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Long-Term Projection Highlights
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">5-Year Revenue (2025-2029)</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatMSAR(
                      Object.keys(results.profit_loss)
                        .slice(0, 5)
                        .reduce((sum, year) => sum + (results.profit_loss[year]?.total_revenues || 0), 0)
                    )} M SAR
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Cumulative</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">5-Year Net Result (2025-2029)</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatMSAR(
                      Object.keys(results.profit_loss)
                        .slice(0, 5)
                        .reduce((sum, year) => sum + (results.profit_loss[year]?.net_result || 0), 0)
                    )} M SAR
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Cumulative</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Projected Cash (2029)</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatMSAR(results.balance_sheet['2029']?.cash || 0)} M SAR
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">End of period</p>
                </div>
              </div>
            </div>

            {/* Key Assumptions Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Case Assumptions ({version.version_type.charAt(0).toUpperCase() + version.version_type.slice(1)} Case)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Planning Horizon:</p>
                  <p className="font-semibold text-gray-900 dark:text-white">2025 - 2052 (28 years)</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">School Name:</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{versionData.assumptions?.general_setup?.school_name || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Model Created:</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{new Date(version.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Version Type:</p>
                  <p className="font-semibold text-gray-900 dark:text-white capitalize">{version.version_type}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* P&L Tab */}
        {activeTab === 'pnl' && results?.profit_loss && (
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                <strong>Historical & Projected Data (2023-2052):</strong> Showing 30 years of financial planning including 2 years of historical data (2023-2024) and 28 years of projections.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Profit & Loss Statement
                  </th>
                  {years.map((year) => (
                    <th key={year} className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {year}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {/* REVENUE SECTION */}
                <tr className="bg-green-50 dark:bg-green-900/10">
                  <td className="px-6 py-3 text-sm font-bold text-gray-900 dark:text-white">
                    REVENUES
                  </td>
                  <td colSpan={years.length}></td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white pl-8">
                    French Program Tuition
                  </td>
                  {years.map((year) => (
                    <td key={year} className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-white">
                      {formatMSAR(results.revenue_streams?.[year]?.french_tuition)}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white pl-8">
                    IB Program Tuition
                  </td>
                  {years.map((year) => (
                    <td key={year} className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-white">
                      {formatMSAR(results.revenue_streams?.[year]?.ib_tuition)}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white pl-8">
                    Other Income
                  </td>
                  {years.map((year) => (
                    <td key={year} className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-white">
                      {formatMSAR(results.revenue_streams?.[year]?.other_income)}
                    </td>
                  ))}
                </tr>
                <tr className="bg-gray-100 dark:bg-gray-700/30">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">
                    Total Revenues
                  </td>
                  {years.map((year) => (
                    <td key={year} className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600 dark:text-green-400 font-semibold">
                      {formatMSAR(results.profit_loss[year]?.total_revenues)}
                    </td>
                  ))}
                </tr>
                
                {/* EXPENSES SECTION */}
                <tr className="bg-red-50 dark:bg-red-900/10">
                  <td className="px-6 py-3 text-sm font-bold text-gray-900 dark:text-white">
                    OPERATING EXPENSES
                  </td>
                  <td colSpan={years.length}></td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white pl-8">
                    Staff Costs
                  </td>
                  {years.map((year) => (
                    <td key={year} className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-600 dark:text-red-400">
                      ({formatMSAR(results.profit_loss[year]?.staff_costs)})
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white pl-8">
                    Other Operating Expenses
                  </td>
                  {years.map((year) => (
                    <td key={year} className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-600 dark:text-red-400">
                      ({formatMSAR(results.profit_loss[year]?.other_opex)})
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white pl-8">
                    Others Expenses (based on staff costs %)
                  </td>
                  {years.map((year) => (
                    <td key={year} className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-600 dark:text-red-400">
                      ({formatMSAR(results.profit_loss[year]?.others_expenses)})
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white pl-8">
                    Rent
                  </td>
                  {years.map((year) => (
                    <td key={year} className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-600 dark:text-red-400">
                      ({formatMSAR(results.profit_loss[year]?.rent)})
                    </td>
                  ))}
                </tr>
                <tr className="bg-gray-100 dark:bg-gray-700/30">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">
                    Total Operating Expenses
                  </td>
                  {years.map((year) => (
                    <td key={year} className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-600 dark:text-red-400 font-semibold">
                      ({formatMSAR(results.profit_loss[year]?.total_operating_expenses)})
                    </td>
                  ))}
                </tr>
                
                {/* EBITDA */}
                <tr className="bg-blue-50 dark:bg-blue-900/10">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">
                    EBITDA
                  </td>
                  {years.map((year) => (
                    <td key={year} className="px-6 py-4 whitespace-nowrap text-sm text-right text-blue-600 dark:text-blue-400 font-bold">
                      {formatMSAR(results.profit_loss[year]?.ebitda)}
                    </td>
                  ))}
                </tr>
                
                {/* DEPRECIATION */}
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white pl-8">
                    Depreciation
                  </td>
                  {years.map((year) => (
                    <td key={year} className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-600 dark:text-red-400">
                      ({formatMSAR(results.profit_loss[year]?.depreciation)})
                    </td>
                  ))}
                </tr>
                
                {/* EBIT */}
                <tr className="bg-gray-100 dark:bg-gray-700/30">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">
                    EBIT
                  </td>
                  {years.map((year) => (
                    <td key={year} className="px-6 py-4 whitespace-nowrap text-sm text-right text-blue-600 dark:text-blue-400 font-semibold">
                      {formatMSAR(results.profit_loss[year]?.ebit)}
                    </td>
                  ))}
                </tr>
                
                {/* NET RESULT */}
                <tr className="bg-green-100 dark:bg-green-900/20">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">
                    NET RESULT
                  </td>
                  {years.map((year) => (
                    <td key={year} className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600 dark:text-green-400 font-bold">
                      {formatMSAR(results.profit_loss[year]?.net_result)}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
            </div>
          </div>
        )}

        {/* Balance Sheet Tab */}
        {activeTab === 'balance-sheet' && results?.balance_sheet && (
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                <strong>Historical & Projected Data (2023-2052):</strong> Showing 30 years of financial planning including 2 years of historical data (2023-2024) and 28 years of projections.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Item
                  </th>
                  {years.map((year) => (
                    <th key={year} className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {year}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                <tr className="bg-blue-50 dark:bg-blue-900/10">
                  <td className="px-6 py-3 text-sm font-bold text-gray-900 dark:text-white" colSpan={years.length + 1}>
                    ASSETS
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white pl-8">
                    Cash
                  </td>
                  {years.map((year) => (
                    <td key={year} className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-white">
                      {formatMSAR(results.balance_sheet[year]?.cash)}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white pl-8">
                    Accounts Receivable
                  </td>
                  {years.map((year) => (
                    <td key={year} className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-white">
                      {formatMSAR(results.balance_sheet[year]?.accounts_receivable)}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white pl-8">
                    Inventory
                  </td>
                  {years.map((year) => (
                    <td key={year} className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-white">
                      {formatMSAR(results.balance_sheet[year]?.inventory)}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white pl-8">
                    Property, Plant & Equipment (Net)
                  </td>
                  {years.map((year) => (
                    <td key={year} className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-white">
                      {formatMSAR(results.balance_sheet[year]?.ppe_net)}
                    </td>
                  ))}
                </tr>
                <tr className="bg-gray-100 dark:bg-gray-700/30">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">
                    Total Assets
                  </td>
                  {years.map((year) => (
                    <td key={year} className="px-6 py-4 whitespace-nowrap text-sm text-right text-blue-600 dark:text-blue-400 font-semibold">
                      {formatMSAR(results.balance_sheet[year]?.total_assets)}
                    </td>
                  ))}
                </tr>
                <tr className="bg-blue-50 dark:bg-blue-900/10">
                  <td className="px-6 py-3 text-sm font-bold text-gray-900 dark:text-white" colSpan={years.length + 1}>
                    LIABILITIES & EQUITY
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white pl-8">
                    Accounts Payable
                  </td>
                  {years.map((year) => (
                    <td key={year} className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-white">
                      {formatMSAR(results.balance_sheet[year]?.accounts_payable)}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white pl-8">
                    Deferred Income
                  </td>
                  {years.map((year) => (
                    <td key={year} className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-white">
                      {formatMSAR(results.balance_sheet[year]?.deferred_income)}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white pl-8">
                    Provisions
                  </td>
                  {years.map((year) => (
                    <td key={year} className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-white">
                      {formatMSAR(results.balance_sheet[year]?.provisions)}
                    </td>
                  ))}
                </tr>
                <tr className="bg-gray-100 dark:bg-gray-700/30">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">
                    Total Liabilities
                  </td>
                  {years.map((year) => (
                    <td key={year} className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-600 dark:text-red-400 font-semibold">
                      {formatMSAR(results.balance_sheet[year]?.total_liabilities)}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white pl-8">
                    Equity
                  </td>
                  {years.map((year) => (
                    <td key={year} className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-white">
                      {formatMSAR(results.balance_sheet[year]?.equity)}
                    </td>
                  ))}
                </tr>
                <tr className="bg-gray-100 dark:bg-gray-700/30">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">
                    Total Liabilities & Equity
                  </td>
                  {years.map((year) => (
                    <td key={year} className="px-6 py-4 whitespace-nowrap text-sm text-right text-blue-600 dark:text-blue-400 font-semibold">
                      {formatMSAR(results.balance_sheet[year]?.total_liab_equity)}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
            </div>
          </div>
        )}

        {/* Cash Flow Tab */}
        {activeTab === 'cash-flow' && results?.cash_flow && (
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                <strong>Historical & Projected Data (2023-2052):</strong> Showing 30 years of financial planning including 2 years of historical data (2023-2024) and 28 years of projections.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Cash Flow Item
                  </th>
                  {years.map((year) => (
                    <th key={year} className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {year}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                <tr className="bg-green-50 dark:bg-green-900/10">
                  <td className="px-6 py-3 text-sm font-bold text-gray-900 dark:text-white">
                    Operating Activities
                  </td>
                  <td colSpan={years.length}></td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white pl-8">
                    Operating Cash Flow
                  </td>
                  {years.map((year) => (
                    <td key={year} className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600 dark:text-green-400">
                      {formatMSAR(results.cash_flow[year]?.operating_cash_flow)}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white pl-8">
                    Working Capital Change
                  </td>
                  {years.map((year) => (
                    <td key={year} className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-white">
                      {formatMSAR(results.cash_flow[year]?.working_capital_change)}
                    </td>
                  ))}
                </tr>
                <tr className="bg-blue-50 dark:bg-blue-900/10">
                  <td className="px-6 py-3 text-sm font-bold text-gray-900 dark:text-white">
                    Investing Activities
                  </td>
                  <td colSpan={years.length}></td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white pl-8">
                    Investing Cash Flow
                  </td>
                  {years.map((year) => (
                    <td key={year} className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-600 dark:text-red-400">
                      {formatMSAR(results.cash_flow[year]?.investing_cash_flow)}
                    </td>
                  ))}
                </tr>
                <tr className="bg-purple-50 dark:bg-purple-900/10">
                  <td className="px-6 py-3 text-sm font-bold text-gray-900 dark:text-white">
                    Financing Activities
                  </td>
                  <td colSpan={years.length}></td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white pl-8">
                    Financing Cash Flow
                  </td>
                  {years.map((year) => (
                    <td key={year} className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-white">
                      {formatMSAR(results.cash_flow[year]?.financing_cash_flow)}
                    </td>
                  ))}
                </tr>
                <tr className="bg-gray-100 dark:bg-gray-700/30">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">
                    Net Cash Flow
                  </td>
                  {years.map((year) => (
                    <td key={year} className="px-6 py-4 whitespace-nowrap text-sm text-right text-blue-600 dark:text-blue-400 font-semibold">
                      {formatMSAR(results.cash_flow[year]?.net_cash_flow)}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
            </div>
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


export default function VersionDetailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    }>
      <VersionDetailContent />
    </Suspense>
  )
}
