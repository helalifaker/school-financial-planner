'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { supabase, Version } from '@/lib/supabase'
import { ArrowLeft, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import Link from 'next/link'
import { formatMSAR } from '@/lib/utils'

export default function CompareScenariosPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [versions, setVersions] = useState<Version[]>([])
  const [selectedVersion1, setSelectedVersion1] = useState<string>('')
  const [selectedVersion2, setSelectedVersion2] = useState<string>('')
  const [version1Data, setVersion1Data] = useState<any>(null)
  const [version2Data, setVersion2Data] = useState<any>(null)
  const [loadingVersions, setLoadingVersions] = useState(true)
  const [comparing, setComparing] = useState(false)

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

  async function handleCompare() {
    if (!selectedVersion1 || !selectedVersion2) {
      alert('Please select two versions to compare')
      return
    }

    setComparing(true)
    try {
      const [data1Response, data2Response] = await Promise.all([
        supabase.functions.invoke('get-version', { body: { version_id: selectedVersion1 } }),
        supabase.functions.invoke('get-version', { body: { version_id: selectedVersion2 } })
      ])

      if (data1Response.error) throw data1Response.error
      if (data2Response.error) throw data2Response.error

      setVersion1Data(data1Response.data.data)
      setVersion2Data(data2Response.data.data)
    } catch (error) {
      console.error('Error comparing versions:', error)
      alert('Error loading version data')
    } finally {
      setComparing(false)
    }
  }

  if (loading || !user) {
    return null
  }

  const years = version1Data?.results?.profit_loss ? Object.keys(version1Data.results.profit_loss).slice(0, 10) : []

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-4 h-16">
            <Link
              href="/dashboard"
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Compare Scenarios
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Compare two financial planning scenarios side by side
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Selection Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Select Scenarios to Compare
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Scenario 1
              </label>
              <select
                value={selectedVersion1}
                onChange={(e) => setSelectedVersion1(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                disabled={loadingVersions}
              >
                <option value="">Select a version...</option>
                {versions.map((version) => (
                  <option key={version.id} value={version.id}>
                    {version.name} ({version.version_type})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Scenario 2
              </label>
              <select
                value={selectedVersion2}
                onChange={(e) => setSelectedVersion2(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                disabled={loadingVersions}
              >
                <option value="">Select a version...</option>
                {versions.map((version) => (
                  <option key={version.id} value={version.id}>
                    {version.name} ({version.version_type})
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-6">
            <button
              onClick={handleCompare}
              disabled={!selectedVersion1 || !selectedVersion2 || comparing}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors font-medium"
            >
              {comparing ? 'Loading...' : 'Compare Scenarios'}
            </button>
          </div>
        </div>

        {/* Comparison Results */}
        {version1Data && version2Data && (
          <div className="space-y-8">
            {/* Key Metrics Comparison */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Key Metrics (2025)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total Revenue */}
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Total Revenue</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">{version1Data.version.name}</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {formatMSAR(version1Data.results.profit_loss['2025']?.total_revenues)} M
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">{version2Data.version.name}</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {formatMSAR(version2Data.results.profit_loss['2025']?.total_revenues)} M
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Difference</span>
                      <span className={`font-bold ${
                        version1Data.results.profit_loss['2025']?.total_revenues > version2Data.results.profit_loss['2025']?.total_revenues
                          ? 'text-green-600 dark:text-green-400'
                          : version1Data.results.profit_loss['2025']?.total_revenues < version2Data.results.profit_loss['2025']?.total_revenues
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-gray-600 dark:text-gray-400'
                      }`}>
                        {formatMSAR(version1Data.results.profit_loss['2025']?.total_revenues - version2Data.results.profit_loss['2025']?.total_revenues)} M
                      </span>
                    </div>
                  </div>
                </div>

                {/* EBITDA */}
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">EBITDA</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">{version1Data.version.name}</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {formatMSAR(version1Data.results.profit_loss['2025']?.ebitda)} M
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">{version2Data.version.name}</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {formatMSAR(version2Data.results.profit_loss['2025']?.ebitda)} M
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Difference</span>
                      <span className={`font-bold ${
                        version1Data.results.profit_loss['2025']?.ebitda > version2Data.results.profit_loss['2025']?.ebitda
                          ? 'text-green-600 dark:text-green-400'
                          : version1Data.results.profit_loss['2025']?.ebitda < version2Data.results.profit_loss['2025']?.ebitda
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-gray-600 dark:text-gray-400'
                      }`}>
                        {formatMSAR(version1Data.results.profit_loss['2025']?.ebitda - version2Data.results.profit_loss['2025']?.ebitda)} M
                      </span>
                    </div>
                  </div>
                </div>

                {/* Net Result */}
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Net Result</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">{version1Data.version.name}</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {formatMSAR(version1Data.results.profit_loss['2025']?.net_result)} M
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">{version2Data.version.name}</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {formatMSAR(version2Data.results.profit_loss['2025']?.net_result)} M
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Difference</span>
                      <span className={`font-bold ${
                        version1Data.results.profit_loss['2025']?.net_result > version2Data.results.profit_loss['2025']?.net_result
                          ? 'text-green-600 dark:text-green-400'
                          : version1Data.results.profit_loss['2025']?.net_result < version2Data.results.profit_loss['2025']?.net_result
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-gray-600 dark:text-gray-400'
                      }`}>
                        {formatMSAR(version1Data.results.profit_loss['2025']?.net_result - version2Data.results.profit_loss['2025']?.net_result)} M
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Side-by-Side P&L Comparison */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-x-auto">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Profit & Loss Comparison
                </h3>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Metric
                    </th>
                    {years.map((year) => (
                      <th key={year} className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        {year}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {/* Total Revenue */}
                  <tr className="bg-gray-50 dark:bg-gray-700/30">
                    <td colSpan={years.length + 1} className="px-6 py-2 text-sm font-semibold text-gray-900 dark:text-white">
                      Total Revenue
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {version1Data.version.name}
                    </td>
                    {years.map((year) => (
                      <td key={year} className="px-6 py-3 whitespace-nowrap text-sm text-center text-gray-900 dark:text-white">
                        {formatMSAR(version1Data.results.profit_loss[year]?.total_revenues)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {version2Data.version.name}
                    </td>
                    {years.map((year) => (
                      <td key={year} className="px-6 py-3 whitespace-nowrap text-sm text-center text-gray-900 dark:text-white">
                        {formatMSAR(version2Data.results.profit_loss[year]?.total_revenues)}
                      </td>
                    ))}
                  </tr>

                  {/* EBITDA */}
                  <tr className="bg-gray-50 dark:bg-gray-700/30">
                    <td colSpan={years.length + 1} className="px-6 py-2 text-sm font-semibold text-gray-900 dark:text-white">
                      EBITDA
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {version1Data.version.name}
                    </td>
                    {years.map((year) => (
                      <td key={year} className="px-6 py-3 whitespace-nowrap text-sm text-center text-blue-600 dark:text-blue-400 font-medium">
                        {formatMSAR(version1Data.results.profit_loss[year]?.ebitda)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {version2Data.version.name}
                    </td>
                    {years.map((year) => (
                      <td key={year} className="px-6 py-3 whitespace-nowrap text-sm text-center text-blue-600 dark:text-blue-400 font-medium">
                        {formatMSAR(version2Data.results.profit_loss[year]?.ebitda)}
                      </td>
                    ))}
                  </tr>

                  {/* Net Result */}
                  <tr className="bg-gray-50 dark:bg-gray-700/30">
                    <td colSpan={years.length + 1} className="px-6 py-2 text-sm font-semibold text-gray-900 dark:text-white">
                      Net Result
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {version1Data.version.name}
                    </td>
                    {years.map((year) => (
                      <td key={year} className="px-6 py-3 whitespace-nowrap text-sm text-center text-green-600 dark:text-green-400 font-semibold">
                        {formatMSAR(version1Data.results.profit_loss[year]?.net_result)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {version2Data.version.name}
                    </td>
                    {years.map((year) => (
                      <td key={year} className="px-6 py-3 whitespace-nowrap text-sm text-center text-green-600 dark:text-green-400 font-semibold">
                        {formatMSAR(version2Data.results.profit_loss[year]?.net_result)}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!version1Data && !version2Data && !comparing && (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <TrendingUp className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No Comparison Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Select two scenarios above to compare their financial projections
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
