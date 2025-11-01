'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { supabase, Version } from '@/lib/supabase'
import { ArrowLeft, Download, FileSpreadsheet, Printer } from 'lucide-react'
import Link from 'next/link'
import { formatMSAR, formatPercent } from '@/lib/utils'

export default function ReportsPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [versions, setVersions] = useState<Version[]>([])
  const [selectedVersion, setSelectedVersion] = useState<string>('')
  const [versionData, setVersionData] = useState<any>(null)
  const [loadingVersions, setLoadingVersions] = useState(true)
  const [loadingData, setLoadingData] = useState(false)
  const [selectedYears, setSelectedYears] = useState<string[]>([])

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      loadVersions()
    }
  }, [user])

  async function loadVersions() {
    try {
      const { data, error } = await supabase
        .from('versions')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setVersions(data || [])
    } catch (error) {
      console.error('Error loading versions:', error)
    } finally {
      setLoadingVersions(false)
    }
  }

  async function handleVersionSelect(versionId: string) {
    setSelectedVersion(versionId)
    setLoadingData(true)
    
    try {
      const { data, error } = await supabase.functions.invoke('get-version', {
        body: { version_id: versionId }
      })

      if (error) throw error
      setVersionData(data.data)
      
      // Default to first 10 years
      const years = Object.keys(data.data.results.profit_loss).slice(0, 10)
      setSelectedYears(years)
    } catch (error) {
      console.error('Error loading version:', error)
      alert('Error loading version data')
    } finally {
      setLoadingData(false)
    }
  }

  function handlePrint() {
    window.print()
  }

  function handleExport() {
    if (!versionData) return
    
    // Create CSV export
    const { results } = versionData
    let csv = 'COMPREHENSIVE FINANCIAL REPORT\n\n'
    
    // P&L Section
    csv += 'PROFIT & LOSS STATEMENT\n'
    csv += 'Year,' + selectedYears.join(',') + '\n'
    
    csv += 'Total Revenues,' + selectedYears.map(y => results.profit_loss[y]?.total_revenues || 0).join(',') + '\n'
    csv += 'Staff Costs,' + selectedYears.map(y => results.profit_loss[y]?.staff_costs || 0).join(',') + '\n'
    csv += 'Other Opex,' + selectedYears.map(y => results.profit_loss[y]?.other_opex || 0).join(',') + '\n'
    csv += 'Rent,' + selectedYears.map(y => results.profit_loss[y]?.rent || 0).join(',') + '\n'
    csv += 'EBITDA,' + selectedYears.map(y => results.profit_loss[y]?.ebitda || 0).join(',') + '\n'
    csv += 'Net Result,' + selectedYears.map(y => results.profit_loss[y]?.net_result || 0).join(',') + '\n\n'
    
    // Balance Sheet Section
    csv += 'BALANCE SHEET\n'
    csv += 'Year,' + selectedYears.join(',') + '\n'
    csv += 'Total Assets,' + selectedYears.map(y => results.balance_sheet[y]?.total_assets || 0).join(',') + '\n'
    csv += 'Total Liabilities,' + selectedYears.map(y => results.balance_sheet[y]?.total_liabilities || 0).join(',') + '\n'
    csv += 'Equity,' + selectedYears.map(y => results.balance_sheet[y]?.equity || 0).join(',') + '\n\n'
    
    // Cash Flow Section
    csv += 'CASH FLOW STATEMENT\n'
    csv += 'Year,' + selectedYears.join(',') + '\n'
    csv += 'Operating CF,' + selectedYears.map(y => results.cash_flow[y]?.operating_cash_flow || 0).join(',') + '\n'
    csv += 'Investing CF,' + selectedYears.map(y => results.cash_flow[y]?.investing_cash_flow || 0).join(',') + '\n'
    csv += 'Net Cash Flow,' + selectedYears.map(y => results.cash_flow[y]?.net_cash_flow || 0).join(',') + '\n'
    
    // Download
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `financial-report-${versionData.version.name}.csv`
    a.click()
  }

  if (loading || !user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard"
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Financial Reports
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Comprehensive financial statements and analysis
                </p>
              </div>
            </div>
            {versionData && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print</span>
                </button>
                <button
                  onClick={handleExport}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Export CSV</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Version Selection */}
        {!versionData && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Select a Version to Generate Reports
            </h3>
            {loadingVersions ? (
              <p className="text-gray-600 dark:text-gray-400">Loading versions...</p>
            ) : versions.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400">No versions available</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {versions.map((version) => (
                  <button
                    key={version.id}
                    onClick={() => handleVersionSelect(version.id)}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                        <FileSpreadsheet className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {version.name}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                          {version.version_type} Case
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Loading State */}
        {loadingData && (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">Loading report data...</p>
          </div>
        )}

        {/* Report Content */}
        {versionData && !loadingData && (
          <div className="space-y-8">
            {/* Report Header */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {versionData.version.name}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 capitalize">
                {versionData.version.version_type} Case - Generated on {new Date().toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                School: {versionData.assumptions.general_setup?.school_name || 'Not specified'}
              </p>
            </div>

            {/* Executive Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Executive Summary (2025-2027)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Average Annual Revenue</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatMSAR(
                      (versionData.results.profit_loss['2025']?.total_revenues +
                       versionData.results.profit_loss['2026']?.total_revenues +
                       versionData.results.profit_loss['2027']?.total_revenues) / 3
                    )} M SAR
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Average EBITDA Margin</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatPercent(
                      (versionData.results.profit_loss['2025']?.ebitda / versionData.results.profit_loss['2025']?.total_revenues +
                       versionData.results.profit_loss['2026']?.ebitda / versionData.results.profit_loss['2026']?.total_revenues +
                       versionData.results.profit_loss['2027']?.ebitda / versionData.results.profit_loss['2027']?.total_revenues) / 3
                    )}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Cumulative Net Result</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatMSAR(
                      versionData.results.profit_loss['2025']?.net_result +
                      versionData.results.profit_loss['2026']?.net_result +
                      versionData.results.profit_loss['2027']?.net_result
                    )} M SAR
                  </p>
                </div>
              </div>
            </div>

            {/* Detailed Reports - P&L */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-x-auto">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Profit & Loss Statement
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Item</th>
                      {selectedYears.map((year) => (
                        <th key={year} className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                          {year}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    <tr>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">Total Revenues</td>
                      {selectedYears.map((year) => (
                        <td key={year} className="px-6 py-4 text-sm text-right text-green-600 dark:text-green-400">
                          {formatMSAR(versionData.results.profit_loss[year]?.total_revenues)}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">Operating Expenses</td>
                      {selectedYears.map((year) => (
                        <td key={year} className="px-6 py-4 text-sm text-right text-red-600 dark:text-red-400">
                          ({formatMSAR(versionData.results.profit_loss[year]?.total_operating_expenses)})
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">EBITDA</td>
                      {selectedYears.map((year) => (
                        <td key={year} className="px-6 py-4 text-sm text-right text-blue-600 dark:text-blue-400 font-semibold">
                          {formatMSAR(versionData.results.profit_loss[year]?.ebitda)}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">Net Result</td>
                      {selectedYears.map((year) => (
                        <td key={year} className="px-6 py-4 text-sm text-right text-green-600 dark:text-green-400 font-semibold">
                          {formatMSAR(versionData.results.profit_loss[year]?.net_result)}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Balance Sheet */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-x-auto">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Balance Sheet
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Item</th>
                      {selectedYears.map((year) => (
                        <th key={year} className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                          {year}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    <tr>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">Total Assets</td>
                      {selectedYears.map((year) => (
                        <td key={year} className="px-6 py-4 text-sm text-right text-blue-600 dark:text-blue-400">
                          {formatMSAR(versionData.results.balance_sheet[year]?.total_assets)}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">Total Liabilities</td>
                      {selectedYears.map((year) => (
                        <td key={year} className="px-6 py-4 text-sm text-right text-red-600 dark:text-red-400">
                          {formatMSAR(versionData.results.balance_sheet[year]?.total_liabilities)}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">Equity</td>
                      {selectedYears.map((year) => (
                        <td key={year} className="px-6 py-4 text-sm text-right text-green-600 dark:text-green-400">
                          {formatMSAR(versionData.results.balance_sheet[year]?.equity)}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Cash Flow */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-x-auto">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Cash Flow Statement
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Item</th>
                      {selectedYears.map((year) => (
                        <th key={year} className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                          {year}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    <tr>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">Operating Cash Flow</td>
                      {selectedYears.map((year) => (
                        <td key={year} className="px-6 py-4 text-sm text-right text-green-600 dark:text-green-400">
                          {formatMSAR(versionData.results.cash_flow[year]?.operating_cash_flow)}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">Investing Cash Flow</td>
                      {selectedYears.map((year) => (
                        <td key={year} className="px-6 py-4 text-sm text-right text-red-600 dark:text-red-400">
                          {formatMSAR(versionData.results.cash_flow[year]?.investing_cash_flow)}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">Net Cash Flow</td>
                      {selectedYears.map((year) => (
                        <td key={year} className="px-6 py-4 text-sm text-right text-blue-600 dark:text-blue-400 font-semibold">
                          {formatMSAR(versionData.results.cash_flow[year]?.net_cash_flow)}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
