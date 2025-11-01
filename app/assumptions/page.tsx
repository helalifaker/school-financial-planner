'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, Play, Loader2, Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { formatCurrencySAR, formatPercentageDisplay, parsePercentageInput, parseCurrency } from '@/lib/utils'

interface CapexEntry {
  year: number
  amount: number
  depreciation_period: number
  description: string
}

export default function AssumptionsPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [calculating, setCalculating] = useState(false)
  const [versionName, setVersionName] = useState('')
  const [versionType, setVersionType] = useState<'base' | 'optimistic' | 'downside'>('base')

  // General Setup
  const [schoolName, setSchoolName] = useState('')

  // Strategic Near-Term (2025-2027)
  const [students2025, setStudents2025] = useState(1742)
  const [students2026, setStudents2026] = useState(1800)
  const [students2027, setStudents2027] = useState(1850)
  
  const [tuition2025, setTuition2025] = useState(36903)
  const [annualGrowthRate, setAnnualGrowthRate] = useState(5.00)
  const [growthFrequency, setGrowthFrequency] = useState('every_year')
  
  const [staffCostPct, setStaffCostPct] = useState(47.00)
  const [opexPct, setOpexPct] = useState(20.00)
  
  const [rentMode, setRentMode] = useState<'fixed_plus_inflation' | 'percentage_revenue'>('fixed_plus_inflation')
  const [baseRent2025, setBaseRent2025] = useState(7631145)
  const [inflationRate, setInflationRate] = useState(3.00)
  const [rentRevenuePct, setRentRevenuePct] = useState(12.00)

  // Long-Term Planning (2028-2052)
  const [year1_2028, setYear1_2028] = useState(100)
  const [year2_2029, setYear2_2029] = useState(200)
  const [year3_2030, setYear3_2030] = useState(300)
  const [year4_2031, setYear4_2031] = useState(400)
  const [year5Plus, setYear5Plus] = useState(500)
  
  const [longTermTuition, setLongTermTuition] = useState(50000)
  const [longTermGrowthRate, setLongTermGrowthRate] = useState(5.00)
  const [longTermGrowthFreq, setLongTermGrowthFreq] = useState('every_year')
  const [longTermStaffCostPct, setLongTermStaffCostPct] = useState(45.00)
  const [longTermOpexPct, setLongTermOpexPct] = useState(8.00)
  const [longTermRentMode, setLongTermRentMode] = useState<'fixed_plus_inflation' | 'percentage_revenue'>('percentage_revenue')
  const [longTermRentRevenuePct, setLongTermRentRevenuePct] = useState(12.00)

  // CAPEX Table
  const [capexEntries, setCapexEntries] = useState<CapexEntry[]>([
    { year: 2028, amount: 5000000, depreciation_period: 10, description: 'Initial facility setup' },
    { year: 2030, amount: 2000000, depreciation_period: 5, description: 'Equipment upgrade' }
  ])

  // Working Capital
  const [arDays, setArDays] = useState(30)
  const [apDays, setApDays] = useState(45)
  const [inventoryDays, setInventoryDays] = useState(15)

  // Opening Balance Sheet (2024)
  const [openingBS] = useState({
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

  const addCapexEntry = () => {
    setCapexEntries([
      ...capexEntries,
      { year: 2025, amount: 0, depreciation_period: 5, description: '' }
    ])
  }

  const removeCapexEntry = (index: number) => {
    setCapexEntries(capexEntries.filter((_, i) => i !== index))
  }

  const updateCapexEntry = (index: number, field: keyof CapexEntry, value: any) => {
    const updated = [...capexEntries]
    updated[index] = { ...updated[index], [field]: value }
    setCapexEntries(updated)
  }

  const handleRunModel = async () => {
    if (!versionName) {
      alert('Please enter a version name')
      return
    }

    setCalculating(true)
    try {
      // Build near-term data structure
      const nearTermData: any = {
        '2025': {
          students: { total: students2025, french: Math.round(students2025 * 0.8), ib: Math.round(students2025 * 0.2) },
          tuition: { avg: tuition2025, french: tuition2025 * 0.9, ib: tuition2025 * 1.2 },
          other_income: 5500000,
          growth_rate: annualGrowthRate / 100,
          staff_cost_pct: staffCostPct / 100,
          opex_pct: opexPct / 100,
          rent_model: rentMode === 'fixed_plus_inflation' 
            ? { type: 'fixed', amount: baseRent2025, inflation_rate: inflationRate / 100 }
            : { type: 'revenue_based', percentage: rentRevenuePct / 100 }
        },
        '2026': {
          students: { total: students2026, french: Math.round(students2026 * 0.8), ib: Math.round(students2026 * 0.2) },
          tuition: { avg: tuition2025 * (1 + annualGrowthRate / 100), french: tuition2025 * 0.9, ib: tuition2025 * 1.2 },
          other_income: 6000000,
          growth_rate: annualGrowthRate / 100,
          staff_cost_pct: staffCostPct / 100,
          opex_pct: opexPct / 100,
          rent_model: rentMode === 'fixed_plus_inflation'
            ? { type: 'fixed', amount: baseRent2025 * (1 + inflationRate / 100), inflation_rate: inflationRate / 100 }
            : { type: 'revenue_based', percentage: rentRevenuePct / 100 }
        },
        '2027': {
          students: { total: students2027, french: Math.round(students2027 * 0.8), ib: Math.round(students2027 * 0.2) },
          tuition: { avg: tuition2025 * Math.pow(1 + annualGrowthRate / 100, 2), french: tuition2025 * 0.9, ib: tuition2025 * 1.2 },
          other_income: 6500000,
          growth_rate: annualGrowthRate / 100,
          staff_cost_pct: staffCostPct / 100,
          opex_pct: opexPct / 100,
          rent_model: rentMode === 'fixed_plus_inflation'
            ? { type: 'fixed', amount: baseRent2025 * Math.pow(1 + inflationRate / 100, 2), inflation_rate: inflationRate / 100 }
            : { type: 'revenue_based', percentage: rentRevenuePct / 100 }
        }
      }

      // Build long-term data structure (2028-2052)
      const longTermData: any = {}
      
      // Year mapping for ramp-up
      const yearEnrollment: { [key: number]: number } = {
        2028: year1_2028,
        2029: year2_2029,
        2030: year3_2030,
        2031: year4_2031
      }
      
      for (let year = 2028; year <= 2052; year++) {
        const baseStudents = yearEnrollment[year] || year5Plus
        const yearsFromStart = year - 2028
        const growthFactor = Math.pow(1 + longTermGrowthRate / 100, yearsFromStart)
        
        longTermData[String(year)] = {
          students: {
            total: Math.round(baseStudents * growthFactor),
            french: Math.round(baseStudents * growthFactor * 0.7),
            ib: Math.round(baseStudents * growthFactor * 0.3)
          },
          tuition: {
            avg: Math.round(longTermTuition * growthFactor),
            french: Math.round(longTermTuition * 0.9 * growthFactor),
            ib: Math.round(longTermTuition * 1.2 * growthFactor)
          },
          other_income: 7000000,
          staff_cost_pct: longTermStaffCostPct / 100,
          opex_pct: longTermOpexPct / 100,
          rent_model: longTermRentMode === 'percentage_revenue'
            ? { type: 'revenue_based', percentage: longTermRentRevenuePct / 100 }
            : { type: 'fixed', amount: baseRent2025 }
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
        working_capital: {
          ar_days: arDays,
          ap_days: apDays,
          deferred_pct: 0.12,
          inventory_days: inventoryDays
        },
        opening_balance_sheet: openingBS,
        default_growth_rate: longTermGrowthRate / 100
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
            <div className="border-l-4 border-blue-500 pl-4 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Strategic Near-Term (2025-2027)
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Full strategic modeling approach for near-term planning
              </p>
            </div>

            {/* Student Enrollment */}
            <div className="mb-6">
              <h3 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-3">
                Student Enrollment
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                    2025 Students
                  </label>
                  <input
                    type="number"
                    value={students2025}
                    onChange={(e) => setStudents2025(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                    2026 Students
                  </label>
                  <input
                    type="number"
                    value={students2026}
                    onChange={(e) => setStudents2026(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                    2027 Students
                  </label>
                  <input
                    type="number"
                    value={students2027}
                    onChange={(e) => setStudents2027(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Tuition Structure */}
            <div className="mb-6">
              <h3 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-3">
                Tuition Structure
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                    2025 Tuition per Student (SAR)
                  </label>
                  <input
                    type="text"
                    value={formatCurrencySAR(tuition2025)}
                    onChange={(e) => setTuition2025(parseCurrency(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Annual Growth Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={annualGrowthRate}
                    onChange={(e) => setAnnualGrowthRate(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Growth Frequency (years)
                  </label>
                  <select
                    value={growthFrequency}
                    onChange={(e) => setGrowthFrequency(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  >
                    <option value="every_year">Every year</option>
                    <option value="every_2_years">Every 2 years</option>
                    <option value="every_3_years">Every 3 years</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Cost Structure */}
            <div className="mb-6">
              <h3 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-3">
                Cost Structure (% of Revenue)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Staff Costs as % of Revenue (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={staffCostPct}
                    onChange={(e) => setStaffCostPct(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Opex as % of Revenue (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={opexPct}
                    onChange={(e) => setOpexPct(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Rent Model */}
            <div>
              <h3 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-3">
                Rent Model
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Rent Mode
                  </label>
                  <select
                    value={rentMode}
                    onChange={(e) => setRentMode(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  >
                    <option value="fixed_plus_inflation">Fixed Plus Inflation</option>
                    <option value="percentage_revenue">Percentage of Revenue</option>
                  </select>
                </div>
                
                {rentMode === 'fixed_plus_inflation' && (
                  <>
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                        Base Rent 2025 (SAR)
                      </label>
                      <input
                        type="text"
                        value={formatCurrencySAR(baseRent2025)}
                        onChange={(e) => setBaseRent2025(parseCurrency(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                        Inflation Rate (%)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={inflationRate}
                        onChange={(e) => setInflationRate(parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </>
                )}
                
                {rentMode === 'percentage_revenue' && (
                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Rent as % of Revenue (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={rentRevenuePct}
                      onChange={(e) => setRentRevenuePct(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Strategic Long-Term (2028-2052) */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="border-l-4 border-purple-500 pl-4 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Strategic Long-Term (2028-2052)
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                25-year strategic planning model
              </p>
            </div>

            {/* Enrollment Ramp-Up */}
            <div className="mb-6">
              <h3 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-3">
                Enrollment Ramp-Up
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Year 1 (2028)
                  </label>
                  <input
                    type="number"
                    value={year1_2028}
                    onChange={(e) => setYear1_2028(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Year 2 (2029)
                  </label>
                  <input
                    type="number"
                    value={year2_2029}
                    onChange={(e) => setYear2_2029(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Year 3 (2030)
                  </label>
                  <input
                    type="number"
                    value={year3_2030}
                    onChange={(e) => setYear3_2030(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Year 4 (2031)
                  </label>
                  <input
                    type="number"
                    value={year4_2031}
                    onChange={(e) => setYear4_2031(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Year 5+ (2032-2052)
                  </label>
                  <input
                    type="number"
                    value={year5Plus}
                    onChange={(e) => setYear5Plus(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Tuition Structure */}
            <div className="mb-6">
              <h3 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-3">
                Tuition Structure
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Tuition per Student Year 1 (SAR)
                  </label>
                  <input
                    type="text"
                    value={formatCurrencySAR(longTermTuition)}
                    onChange={(e) => setLongTermTuition(parseCurrency(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Annual Growth Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={longTermGrowthRate}
                    onChange={(e) => setLongTermGrowthRate(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Growth Frequency (years)
                  </label>
                  <select
                    value={longTermGrowthFreq}
                    onChange={(e) => setLongTermGrowthFreq(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  >
                    <option value="every_year">Every year</option>
                    <option value="every_2_years">Every 2 years</option>
                    <option value="every_3_years">Every 3 years</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Cost Structure */}
            <div className="mb-6">
              <h3 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-3">
                Cost Structure (% of Revenue)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Staff Costs as % of Revenue (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={longTermStaffCostPct}
                    onChange={(e) => setLongTermStaffCostPct(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Opex as % of Revenue (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={longTermOpexPct}
                    onChange={(e) => setLongTermOpexPct(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Rent Model */}
            <div>
              <h3 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-3">
                Rent Model
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Rent Mode
                  </label>
                  <select
                    value={longTermRentMode}
                    onChange={(e) => setLongTermRentMode(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  >
                    <option value="fixed_plus_inflation">Fixed Plus Inflation</option>
                    <option value="percentage_revenue">Percentage of Revenue</option>
                  </select>
                </div>
                
                {longTermRentMode === 'percentage_revenue' && (
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Rent as % of Revenue (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={longTermRentRevenuePct}
                      onChange={(e) => setLongTermRentRevenuePct(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* CAPEX Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="border-l-4 border-orange-500 pl-4 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Capital Expenditures (CAPEX)
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Track investments and depreciation
              </p>
            </div>

            <div className="space-y-4">
              {capexEntries.map((entry, index) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                        Year
                      </label>
                      <input
                        type="number"
                        value={entry.year}
                        onChange={(e) => updateCapexEntry(index, 'year', parseInt(e.target.value) || 2025)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                        Amount (SAR)
                      </label>
                      <input
                        type="text"
                        value={formatCurrencySAR(entry.amount)}
                        onChange={(e) => updateCapexEntry(index, 'amount', parseCurrency(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                        Depreciation (years)
                      </label>
                      <input
                        type="number"
                        value={entry.depreciation_period}
                        onChange={(e) => updateCapexEntry(index, 'depreciation_period', parseInt(e.target.value) || 5)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                        Description
                      </label>
                      <input
                        type="text"
                        value={entry.description}
                        onChange={(e) => updateCapexEntry(index, 'description', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={() => removeCapexEntry(index)}
                        className="w-full px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors flex items-center justify-center space-x-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              <button
                onClick={addCapexEntry}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add CAPEX Entry</span>
              </button>
            </div>
          </div>

          {/* Working Capital Assumptions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="border-l-4 border-green-500 pl-4 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Working Capital Assumptions
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Manage cash conversion cycle
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Accounts Receivable (days)
                </label>
                <input
                  type="number"
                  value={arDays}
                  onChange={(e) => setArDays(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Accounts Payable (days)
                </label>
                <input
                  type="number"
                  value={apDays}
                  onChange={(e) => setApDays(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Inventory (days)
                </label>
                <input
                  type="number"
                  value={inventoryDays}
                  onChange={(e) => setInventoryDays(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Info Note */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              <strong>Complete 25-Year Planning:</strong> The system now includes comprehensive long-term planning 
              from 2025-2052, giving you a full strategic view of your school financial trajectory with 
              automated growth projections, CAPEX schedules, working capital management, and balance sheet modeling.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
