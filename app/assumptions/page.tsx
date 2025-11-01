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
  const [students2025French, setStudents2025French] = useState(1394)
  const [students2025IB, setStudents2025IB] = useState(348)
  const [students2026French, setStudents2026French] = useState(1440)
  const [students2026IB, setStudents2026IB] = useState(360)
  const [students2027French, setStudents2027French] = useState(1480)
  const [students2027IB, setStudents2027IB] = useState(370)
  
  const [tuitionFrench, setTuitionFrench] = useState(33213)
  const [tuitionIB, setTuitionIB] = useState(44284)
  const [annualGrowthRate, setAnnualGrowthRate] = useState(5.00)
  const [growthFrequency, setGrowthFrequency] = useState('1')
  
  const [staffCostPct, setStaffCostPct] = useState(47.00)
  const [opexPct, setOpexPct] = useState(20.00)
  
  const [rentMode, setRentMode] = useState<'fixed_plus_inflation' | 'percentage_revenue'>('fixed_plus_inflation')
  const [baseRent2025, setBaseRent2025] = useState(7631145)
  const [inflationRate, setInflationRate] = useState(3.00)
  const [rentRevenuePct, setRentRevenuePct] = useState(12.00)
  const [rentGrowthFrequency, setRentGrowthFrequency] = useState('1')

  // Long-Term Planning (2028-2052)
  const [year1_2028French, setYear1_2028French] = useState(70)
  const [year1_2028IB, setYear1_2028IB] = useState(30)
  const [year2_2029French, setYear2_2029French] = useState(140)
  const [year2_2029IB, setYear2_2029IB] = useState(60)
  const [year3_2030French, setYear3_2030French] = useState(210)
  const [year3_2030IB, setYear3_2030IB] = useState(90)
  const [year4_2031French, setYear4_2031French] = useState(280)
  const [year4_2031IB, setYear4_2031IB] = useState(120)
  const [year5PlusFrench, setYear5PlusFrench] = useState(350)
  const [year5PlusIB, setYear5PlusIB] = useState(150)
  
  const [longTermTuitionFrench, setLongTermTuitionFrench] = useState(45000)
  const [longTermTuitionIB, setLongTermTuitionIB] = useState(60000)
  const [longTermGrowthRate, setLongTermGrowthRate] = useState(5.00)
  const [longTermGrowthFreq, setLongTermGrowthFreq] = useState('1')
  const [longTermStaffCostPct, setLongTermStaffCostPct] = useState(45.00)
  const [longTermOpexPct, setLongTermOpexPct] = useState(8.00)
  const [longTermRentMode, setLongTermRentMode] = useState<'fixed_plus_inflation' | 'percentage_revenue'>('percentage_revenue')
  const [longTermBaseRent, setLongTermBaseRent] = useState(8000000)
  const [longTermInflationRate, setLongTermInflationRate] = useState(3.00)
  const [longTermRentRevenuePct, setLongTermRentRevenuePct] = useState(12.00)
  const [longTermRentGrowthFreq, setLongTermRentGrowthFreq] = useState('1')

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
      const growthFreqYears = parseInt(growthFrequency)
      const rentGrowthFreqYears = parseInt(rentGrowthFrequency)
      
      const nearTermData: any = {
        '2025': {
          students: { total: students2025French + students2025IB, french: students2025French, ib: students2025IB },
          tuition: { avg: (tuitionFrench * students2025French + tuitionIB * students2025IB) / (students2025French + students2025IB), french: tuitionFrench, ib: tuitionIB },
          other_income: 5500000,
          growth_rate: annualGrowthRate / 100,
          staff_cost_pct: staffCostPct / 100,
          opex_pct: opexPct / 100,
          rent_model: rentMode === 'fixed_plus_inflation' 
            ? { type: 'fixed', amount: baseRent2025, inflation_rate: inflationRate / 100, growth_frequency: rentGrowthFreqYears }
            : { type: 'revenue_based', percentage: rentRevenuePct / 100 }
        },
        '2026': {
          students: { total: students2026French + students2026IB, french: students2026French, ib: students2026IB },
          tuition: { 
            avg: (tuitionFrench * students2026French + tuitionIB * students2026IB) / (students2026French + students2026IB) * (growthFreqYears === 1 ? (1 + annualGrowthRate / 100) : 1), 
            french: tuitionFrench * (growthFreqYears === 1 ? (1 + annualGrowthRate / 100) : 1), 
            ib: tuitionIB * (growthFreqYears === 1 ? (1 + annualGrowthRate / 100) : 1) 
          },
          other_income: 6000000,
          growth_rate: annualGrowthRate / 100,
          staff_cost_pct: staffCostPct / 100,
          opex_pct: opexPct / 100,
          rent_model: rentMode === 'fixed_plus_inflation'
            ? { type: 'fixed', amount: baseRent2025 * (rentGrowthFreqYears === 1 ? (1 + inflationRate / 100) : 1), inflation_rate: inflationRate / 100, growth_frequency: rentGrowthFreqYears }
            : { type: 'revenue_based', percentage: rentRevenuePct / 100 }
        },
        '2027': {
          students: { total: students2027French + students2027IB, french: students2027French, ib: students2027IB },
          tuition: { 
            avg: (tuitionFrench * students2027French + tuitionIB * students2027IB) / (students2027French + students2027IB) * Math.pow(1 + annualGrowthRate / 100, Math.floor(2 / growthFreqYears)), 
            french: tuitionFrench * Math.pow(1 + annualGrowthRate / 100, Math.floor(2 / growthFreqYears)), 
            ib: tuitionIB * Math.pow(1 + annualGrowthRate / 100, Math.floor(2 / growthFreqYears)) 
          },
          other_income: 6500000,
          growth_rate: annualGrowthRate / 100,
          staff_cost_pct: staffCostPct / 100,
          opex_pct: opexPct / 100,
          rent_model: rentMode === 'fixed_plus_inflation'
            ? { type: 'fixed', amount: baseRent2025 * Math.pow(1 + inflationRate / 100, Math.floor(2 / rentGrowthFreqYears)), inflation_rate: inflationRate / 100, growth_frequency: rentGrowthFreqYears }
            : { type: 'revenue_based', percentage: rentRevenuePct / 100 }
        }
      }

      // Build long-term data structure (2028-2052)
      const longTermData: any = {}
      const longTermGrowthFreqYears = parseInt(longTermGrowthFreq)
      const longTermRentGrowthFreqYears = parseInt(longTermRentGrowthFreq)
      
      // Year mapping for ramp-up
      const yearEnrollmentFrench: { [key: number]: number } = {
        2028: year1_2028French,
        2029: year2_2029French,
        2030: year3_2030French,
        2031: year4_2031French
      }
      
      const yearEnrollmentIB: { [key: number]: number } = {
        2028: year1_2028IB,
        2029: year2_2029IB,
        2030: year3_2030IB,
        2031: year4_2031IB
      }
      
      for (let year = 2028; year <= 2052; year++) {
        const baseFrenchStudents = yearEnrollmentFrench[year] || year5PlusFrench
        const baseIBStudents = yearEnrollmentIB[year] || year5PlusIB
        const yearsFromStart = year - 2028
        const tuitionGrowthFactor = Math.pow(1 + longTermGrowthRate / 100, Math.floor(yearsFromStart / longTermGrowthFreqYears))
        const rentGrowthFactor = Math.pow(1 + longTermInflationRate / 100, Math.floor(yearsFromStart / longTermRentGrowthFreqYears))
        
        longTermData[String(year)] = {
          students: {
            total: baseFrenchStudents + baseIBStudents,
            french: baseFrenchStudents,
            ib: baseIBStudents
          },
          tuition: {
            avg: (longTermTuitionFrench * tuitionGrowthFactor * baseFrenchStudents + longTermTuitionIB * tuitionGrowthFactor * baseIBStudents) / (baseFrenchStudents + baseIBStudents),
            french: Math.round(longTermTuitionFrench * tuitionGrowthFactor),
            ib: Math.round(longTermTuitionIB * tuitionGrowthFactor)
          },
          other_income: 7000000,
          staff_cost_pct: longTermStaffCostPct / 100,
          opex_pct: longTermOpexPct / 100,
          rent_model: longTermRentMode === 'percentage_revenue'
            ? { type: 'revenue_based', percentage: longTermRentRevenuePct / 100 }
            : { type: 'fixed', amount: longTermBaseRent * rentGrowthFactor, inflation_rate: longTermInflationRate / 100, growth_frequency: longTermRentGrowthFreqYears }
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                    2025 French Students
                  </label>
                  <input
                    type="number"
                    value={students2025French}
                    onChange={(e) => setStudents2025French(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                    2025 IB Students
                  </label>
                  <input
                    type="number"
                    value={students2025IB}
                    onChange={(e) => setStudents2025IB(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                    2026 French Students
                  </label>
                  <input
                    type="number"
                    value={students2026French}
                    onChange={(e) => setStudents2026French(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                    2026 IB Students
                  </label>
                  <input
                    type="number"
                    value={students2026IB}
                    onChange={(e) => setStudents2026IB(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                    2027 French Students
                  </label>
                  <input
                    type="number"
                    value={students2027French}
                    onChange={(e) => setStudents2027French(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                    2027 IB Students
                  </label>
                  <input
                    type="number"
                    value={students2027IB}
                    onChange={(e) => setStudents2027IB(parseInt(e.target.value) || 0)}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                    French Tuition per Student (SAR)
                  </label>
                  <input
                    type="text"
                    value={formatCurrencySAR(tuitionFrench)}
                    onChange={(e) => setTuitionFrench(parseCurrency(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                    IB Tuition per Student (SAR)
                  </label>
                  <input
                    type="text"
                    value={formatCurrencySAR(tuitionIB)}
                    onChange={(e) => setTuitionIB(parseCurrency(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <option value="1">Every 1 year</option>
                    <option value="2">Every 2 years</option>
                    <option value="3">Every 3 years</option>
                    <option value="4">Every 4 years</option>
                    <option value="5">Every 5 years</option>
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
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                        Base Rent (SAR)
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
                  <div>
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
                
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Growth Frequency (years)
                  </label>
                  <select
                    value={rentGrowthFrequency}
                    onChange={(e) => setRentGrowthFrequency(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  >
                    <option value="1">Every 1 year</option>
                    <option value="2">Every 2 years</option>
                    <option value="3">Every 3 years</option>
                    <option value="4">Every 4 years</option>
                    <option value="5">Every 5 years</option>
                  </select>
                </div>
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
                    Year 1 (2028) French
                  </label>
                  <input
                    type="number"
                    value={year1_2028French}
                    onChange={(e) => setYear1_2028French(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Year 1 (2028) IB
                  </label>
                  <input
                    type="number"
                    value={year1_2028IB}
                    onChange={(e) => setYear1_2028IB(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Year 2 (2029) French
                  </label>
                  <input
                    type="number"
                    value={year2_2029French}
                    onChange={(e) => setYear2_2029French(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Year 2 (2029) IB
                  </label>
                  <input
                    type="number"
                    value={year2_2029IB}
                    onChange={(e) => setYear2_2029IB(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Year 3 (2030) French
                  </label>
                  <input
                    type="number"
                    value={year3_2030French}
                    onChange={(e) => setYear3_2030French(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Year 3 (2030) IB
                  </label>
                  <input
                    type="number"
                    value={year3_2030IB}
                    onChange={(e) => setYear3_2030IB(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Year 4 (2031) French
                  </label>
                  <input
                    type="number"
                    value={year4_2031French}
                    onChange={(e) => setYear4_2031French(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Year 4 (2031) IB
                  </label>
                  <input
                    type="number"
                    value={year4_2031IB}
                    onChange={(e) => setYear4_2031IB(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Year 5+ (2032-2052) French
                  </label>
                  <input
                    type="number"
                    value={year5PlusFrench}
                    onChange={(e) => setYear5PlusFrench(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Year 5+ (2032-2052) IB
                  </label>
                  <input
                    type="number"
                    value={year5PlusIB}
                    onChange={(e) => setYear5PlusIB(parseInt(e.target.value) || 0)}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                    French Tuition per Student (SAR)
                  </label>
                  <input
                    type="text"
                    value={formatCurrencySAR(longTermTuitionFrench)}
                    onChange={(e) => setLongTermTuitionFrench(parseCurrency(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                    IB Tuition per Student (SAR)
                  </label>
                  <input
                    type="text"
                    value={formatCurrencySAR(longTermTuitionIB)}
                    onChange={(e) => setLongTermTuitionIB(parseCurrency(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <option value="1">Every 1 year</option>
                    <option value="2">Every 2 years</option>
                    <option value="3">Every 3 years</option>
                    <option value="4">Every 4 years</option>
                    <option value="5">Every 5 years</option>
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
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                
                {longTermRentMode === 'fixed_plus_inflation' && (
                  <>
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                        Base Rent (SAR)
                      </label>
                      <input
                        type="text"
                        value={formatCurrencySAR(longTermBaseRent)}
                        onChange={(e) => setLongTermBaseRent(parseCurrency(e.target.value))}
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
                        value={longTermInflationRate}
                        onChange={(e) => setLongTermInflationRate(parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </>
                )}
                
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
                
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Growth Frequency (years)
                  </label>
                  <select
                    value={longTermRentGrowthFreq}
                    onChange={(e) => setLongTermRentGrowthFreq(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  >
                    <option value="1">Every 1 year</option>
                    <option value="2">Every 2 years</option>
                    <option value="3">Every 3 years</option>
                    <option value="4">Every 4 years</option>
                    <option value="5">Every 5 years</option>
                  </select>
                </div>
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
