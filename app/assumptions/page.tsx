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

  // Long-Term Planning (2028-2052)
  const [longTermGrowthRate, setLongTermGrowthRate] = useState(0.05)
  const [longTermStaffCostPct, setLongTermStaffCostPct] = useState(0.42)
  const [longTermOpexPct, setLongTermOpexPct] = useState(0.43)
  const [longTermRentAmount, setLongTermRentAmount] = useState(8000000)
  const [useLongTermGrowth, setUseLongTermGrowth] = useState(true)

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
      // Prepare long-term data
      const longTermData: any = {}
      
      if (useLongTermGrowth) {
        // Auto-generate long-term data based on 2027 baseline with growth
        const baseYear = nearTermData['2027']
        for (let year = 2028; year <= 2052; year++) {
          const yearsFromBase = year - 2027
          const compoundFactor = Math.pow(1 + longTermGrowthRate, yearsFromBase)
          
          longTermData[String(year)] = {
            students: {
              french: Math.round(baseYear.students.french * compoundFactor),
              ib: Math.round(baseYear.students.ib * compoundFactor)
            },
            tuition: {
              french: Math.round(baseYear.tuition.french * compoundFactor),
              ib: Math.round(baseYear.tuition.ib * compoundFactor)
            },
            other_income: Math.round(baseYear.other_income * compoundFactor),
            staff_cost_pct: longTermStaffCostPct,
            opex_pct: longTermOpexPct,
            rent_model: { type: 'fixed', amount: longTermRentAmount }
          }
        }
      }

      // Prepare assumptions
      const assumptions = {
        general_setup: {
          school_name: schoolName || 'School',
          planning_horizon: { start: 2024, end: 2052 },
          currency: 'SAR',
          display_units: 'M SAR'
        },
        strategic_near_term: nearTermData,
        strategic_long_term: longTermData,
        capex_table: capexEntries,
        working_capital: workingCapital,
        opening_balance_sheet: openingBS,
        default_growth_rate: longTermGrowthRate
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
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Rent Model
                    </label>
                    <div className="space-y-3">
                      <select
                        value={nearTermData[year as keyof typeof nearTermData].rent_model.type}
                        onChange={(e) => {
                          const newData = { ...nearTermData }
                          newData[year as keyof typeof nearTermData].rent_model = {
                            ...newData[year as keyof typeof nearTermData].rent_model,
                            type: e.target.value as 'fixed' | 'per_student' | 'revenue_based'
                          }
                          setNearTermData(newData)
                        }}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm"
                      >
                        <option value="fixed">Fixed Amount</option>
                        <option value="per_student">Per Student</option>
                        <option value="revenue_based">Revenue Based</option>
                      </select>
                      
                      {nearTermData[year as keyof typeof nearTermData].rent_model.type === 'fixed' && (
                        <input
                          type="number"
                          value={nearTermData[year as keyof typeof nearTermData].rent_model.amount}
                          onChange={(e) => {
                            const newData = { ...nearTermData }
                            newData[year as keyof typeof nearTermData].rent_model.amount = parseInt(e.target.value)
                            setNearTermData(newData)
                          }}
                          placeholder="Annual rent (SAR)"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm"
                        />
                      )}
                      
                      {nearTermData[year as keyof typeof nearTermData].rent_model.type === 'per_student' && (
                        <input
                          type="number"
                          value={nearTermData[year as keyof typeof nearTermData].rent_model.amount}
                          onChange={(e) => {
                            const newData = { ...nearTermData }
                            newData[year as keyof typeof nearTermData].rent_model.amount = parseInt(e.target.value)
                            setNearTermData(newData)
                          }}
                          placeholder="Rent per student (SAR)"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm"
                        />
                      )}
                      
                      {nearTermData[year as keyof typeof nearTermData].rent_model.type === 'revenue_based' && (
                        <input
                          type="number"
                          step="0.01"
                          value={nearTermData[year as keyof typeof nearTermData].rent_model.amount / 100}
                          onChange={(e) => {
                            const newData = { ...nearTermData }
                            newData[year as keyof typeof nearTermData].rent_model.amount = parseFloat(e.target.value) * 100
                            setNearTermData(newData)
                          }}
                          placeholder="% of revenue"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm"
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Strategic Long-Term (2028-2052) */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Strategic Long-Term (2028-2052)
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Configure growth assumptions for the 25-year planning horizon
                </p>
              </div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={useLongTermGrowth}
                  onChange={(e) => setUseLongTermGrowth(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Auto-generate from 2027 baseline
                </span>
              </label>
            </div>

            {useLongTermGrowth ? (
              <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-4">
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    Long-term projections (2028-2052) will be automatically generated based on your 2027 figures 
                    with the growth rate and cost parameters specified below.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Annual Growth Rate
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="0.5"
                        value={longTermGrowthRate}
                        onChange={(e) => setLongTermGrowthRate(parseFloat(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                      />
                      <span className="absolute right-3 top-2 text-gray-500 dark:text-gray-400 text-sm">
                        ({(longTermGrowthRate * 100).toFixed(1)}%)
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Applies to students, tuition, and other income
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Staff Cost (% of Revenue)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="1"
                        value={longTermStaffCostPct}
                        onChange={(e) => setLongTermStaffCostPct(parseFloat(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                      />
                      <span className="absolute right-3 top-2 text-gray-500 dark:text-gray-400 text-sm">
                        ({(longTermStaffCostPct * 100).toFixed(0)}%)
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Operating Expenses (% of Revenue)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="1"
                        value={longTermOpexPct}
                        onChange={(e) => setLongTermOpexPct(parseFloat(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                      />
                      <span className="absolute right-3 top-2 text-gray-500 dark:text-gray-400 text-sm">
                        ({(longTermOpexPct * 100).toFixed(0)}%)
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Annual Rent (SAR)
                    </label>
                    <input
                      type="number"
                      value={longTermRentAmount}
                      onChange={(e) => setLongTermRentAmount(parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Fixed rent for all long-term years
                    </p>
                  </div>
                </div>

                {/* Projection Preview */}
                <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                    Projection Preview
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                    {[2030, 2035, 2040, 2045, 2050].map((year) => {
                      const yearsFromBase = year - 2027
                      const factor = Math.pow(1 + longTermGrowthRate, yearsFromBase)
                      const projectedRevenue = (
                        nearTermData['2027'].students.french * nearTermData['2027'].tuition.french * factor +
                        nearTermData['2027'].students.ib * nearTermData['2027'].tuition.ib * factor +
                        nearTermData['2027'].other_income * factor
                      ) / 1000000
                      
                      return (
                        <div key={year} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                          <p className="font-semibold text-gray-900 dark:text-white">{year}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            Revenue: {projectedRevenue.toFixed(1)}M SAR
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            Students: {Math.round((nearTermData['2027'].students.french + nearTermData['2027'].students.ib) * factor)}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p>Manual year-by-year configuration would be available here.</p>
                <p className="text-sm mt-2">Enable auto-generation for quick setup based on growth rates.</p>
              </div>
            )}
          </div>

          {/* Info Note */}
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
            <p className="text-sm text-green-800 dark:text-green-300">
              <strong>Complete 25-Year Planning:</strong> The system now includes comprehensive long-term planning 
              from 2025-2052, giving you a full strategic view of your school financial trajectory with 
              automated growth projections, CAPEX schedules, and balance sheet modeling.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
