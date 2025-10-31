'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, Save, Play, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function AssumptionsPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [saving, setSaving] = useState(false)
  const [calculating, setCalculating] = useState(false)
  const [versionName, setVersionName] = useState('')
  const [versionType, setVersionType] = useState<'base' | 'optimistic' | 'downside'>('base')

  // General Setup
  const [schoolName, setSchoolName] = useState('')

  // Strategic Near-Term (2025-2027)
  const [nearTermData, setNearTermData] = useState({
    '2025': {
      students: { french: 850, ib: 100 },
      tuition: { french: 82000, ib: 95000 },
      other_income: 5500000,
      growth_rate: 0.05,
      staff_cost_pct: 0.42,
      opex_pct: 0.43,
      rent_model: { type: 'fixed', amount: 8000000 }
    },
    '2026': {
      students: { french: 900, ib: 120 },
      tuition: { french: 85000, ib: 98000 },
      other_income: 6000000,
      growth_rate: 0.06,
      staff_cost_pct: 0.42,
      opex_pct: 0.43,
      rent_model: { type: 'fixed', amount: 8000000 }
    },
    '2027': {
      students: { french: 950, ib: 140 },
      tuition: { french: 88000, ib: 101000 },
      other_income: 6500000,
      growth_rate: 0.05,
      staff_cost_pct: 0.42,
      opex_pct: 0.43,
      rent_model: { type: 'fixed', amount: 8000000 }
    }
  })

  // CAPEX Table
  const [capexEntries, setCapexEntries] = useState([
    { year: '2025', amount: 5000000, depreciation_period: 10, description: 'New building renovation' },
    { year: 2030, amount: 3000000, depreciation_period: 10, description: 'Technology upgrades' }
  ])

  // Working Capital
  const [workingCapital, setWorkingCapital] = useState({
    ar_days: 50,
    ap_days: 30,
    deferred_pct: 0.12,
    inventory_days: 10
  })

  // Opening Balance Sheet (2024)
  const [openingBS, setOpeningBS] = useState({
    '2024': {
      cash: 18250072,
      accounts_receivable: 9800000,
      inventory: 500000,
      ppe_net: 20000000,
      total_assets: 48550072,
      accounts_payable: 5000000,
      deferred_income: 8000000,
      provisions: 2000000,
      total_liabilities: 15000000,
      equity: 33550072,
      total_liab_equity: 48550072
    }
  })

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  const handleRunModel = async () => {
    if (!versionName) {
      alert('Please enter a version name')
      return
    }

    setCalculating(true)
    try {
      // Prepare assumptions
      const assumptions = {
        general_setup: {
          school_name: schoolName || 'School',
          planning_horizon: { start: 2024, end: 2052 },
          currency: 'SAR',
          display_units: 'M SAR'
        },
        strategic_near_term: nearTermData,
        strategic_long_term: {}, // Would be populated with 2028-2052 data
        capex_table: capexEntries,
        working_capital: workingCapital,
        opening_balance_sheet: openingBS,
        default_growth_rate: 0.05
      }

      // Call edge function to run model
      const { data, error } = await supabase.functions.invoke('run-model', {
        body: {
          versionName,
          versionType,
          assumptions
        }
      })

      if (error) throw error

      alert('Model calculated successfully!')
      router.push(`/versions/${data.data.version_id}`)
    } catch (error: any) {
      console.error('Error running model:', error)
      alert(`Error: ${error.message}`)
    } finally {
      setCalculating(false)
    }
  }

  if (loading || !user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
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
                  Assumptions Workspace
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Configure your financial planning inputs
                </p>
              </div>
            </div>
            <button
              onClick={handleRunModel}
              disabled={calculating}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors flex items-center space-x-2"
            >
              {calculating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Calculating...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Run Model</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Version Setup */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Version Setup
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Version Name
                </label>
                <input
                  type="text"
                  value={versionName}
                  onChange={(e) => setVersionName(e.target.value)}
                  placeholder="e.g., Base Case - Q4 2024"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Version Type
                </label>
                <select
                  value={versionType}
                  onChange={(e) => setVersionType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                >
                  <option value="base">Base Case</option>
                  <option value="optimistic">Optimistic</option>
                  <option value="downside">Downside</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  School Name
                </label>
                <input
                  type="text"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  placeholder="School Name"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Strategic Near-Term (2025-2027) */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Strategic Near-Term (2025-2027)
            </h2>
            {['2025', '2026', '2027'].map((year) => (
              <div key={year} className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700 last:border-0">
                <h3 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-3">
                  Year {year}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Students (French)
                    </label>
                    <input
                      type="number"
                      value={nearTermData[year as keyof typeof nearTermData].students.french}
                      onChange={(e) => {
                        const newData = { ...nearTermData }
                        newData[year as keyof typeof nearTermData].students.french = parseInt(e.target.value)
                        setNearTermData(newData)
                      }}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Students (IB)
                    </label>
                    <input
                      type="number"
                      value={nearTermData[year as keyof typeof nearTermData].students.ib}
                      onChange={(e) => {
                        const newData = { ...nearTermData }
                        newData[year as keyof typeof nearTermData].students.ib = parseInt(e.target.value)
                        setNearTermData(newData)
                      }}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Tuition French (SAR)
                    </label>
                    <input
                      type="number"
                      value={nearTermData[year as keyof typeof nearTermData].tuition.french}
                      onChange={(e) => {
                        const newData = { ...nearTermData }
                        newData[year as keyof typeof nearTermData].tuition.french = parseInt(e.target.value)
                        setNearTermData(newData)
                      }}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Tuition IB (SAR)
                    </label>
                    <input
                      type="number"
                      value={nearTermData[year as keyof typeof nearTermData].tuition.ib}
                      onChange={(e) => {
                        const newData = { ...nearTermData }
                        newData[year as keyof typeof nearTermData].tuition.ib = parseInt(e.target.value)
                        setNearTermData(newData)
                      }}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Staff Cost %
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={nearTermData[year as keyof typeof nearTermData].staff_cost_pct}
                      onChange={(e) => {
                        const newData = { ...nearTermData }
                        newData[year as keyof typeof nearTermData].staff_cost_pct = parseFloat(e.target.value)
                        setNearTermData(newData)
                      }}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Opex %
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={nearTermData[year as keyof typeof nearTermData].opex_pct}
                      onChange={(e) => {
                        const newData = { ...nearTermData }
                        newData[year as keyof typeof nearTermData].opex_pct = parseFloat(e.target.value)
                        setNearTermData(newData)
                      }}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Other Income (SAR)
                    </label>
                    <input
                      type="number"
                      value={nearTermData[year as keyof typeof nearTermData].other_income}
                      onChange={(e) => {
                        const newData = { ...nearTermData }
                        newData[year as keyof typeof nearTermData].other_income = parseInt(e.target.value)
                        setNearTermData(newData)
                      }}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Rent (SAR/year)
                    </label>
                    <input
                      type="number"
                      value={nearTermData[year as keyof typeof nearTermData].rent_model.amount}
                      onChange={(e) => {
                        const newData = { ...nearTermData }
                        newData[year as keyof typeof nearTermData].rent_model.amount = parseInt(e.target.value)
                        setNearTermData(newData)
                      }}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Info Note */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              <strong>Note:</strong> This is a simplified assumptions interface. For production use, you would add:
              - Strategic Long-Term data (2028-2052) with growth curves
              - Complete CAPEX table management
              - Working capital detailed inputs
              - Opening balance sheet editing
              - Validation and data import features
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
