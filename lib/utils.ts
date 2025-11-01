import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format number as M SAR (millions of SAR)
export function formatMSAR(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) return '0.000'
  const msar = value / 1000000
  return msar.toFixed(3)
}

// Format percentage
export function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) return '0.00'
  return value.toFixed(2)
}

// Parse M SAR to SAR
export function parseMSARtoSAR(msar: number): number {
  return msar * 1000000
}

// Format large numbers with commas
export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) return '0'
  return value.toLocaleString('en-US')
}

// Format currency (SAR) with commas
export function formatCurrencySAR(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) return '0'
  return value.toLocaleString('en-US', { maximumFractionDigits: 0 })
}

// Parse currency string to number (remove commas)
export function parseCurrency(value: string): number {
  return parseFloat(value.replace(/,/g, '')) || 0
}

// Format percentage for display (0.47 -> 47)
export function formatPercentageDisplay(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) return '0'
  return (value * 100).toFixed(2)
}

// Parse percentage from display to decimal (47 -> 0.47)
export function parsePercentageInput(value: string | number): number {
  const numValue = typeof value === 'string' ? parseFloat(value) : value
  return numValue / 100
}

// Generate years array
export function generateYears(startYear: number, endYear: number): number[] {
  const years = []
  for (let year = startYear; year <= endYear; year++) {
    years.push(year)
  }
  return years
}

// Check if control status is OK
export function isControlOK(difference: number, tolerance: number = 0.001): boolean {
  return Math.abs(difference) <= tolerance
}

// Calculate CAGR (Compound Annual Growth Rate)
export function calculateCAGR(startValue: number, endValue: number, years: number): number {
  if (startValue <= 0 || endValue <= 0 || years <= 0) return 0
  return (Math.pow(endValue / startValue, 1 / years) - 1) * 100
}

// Get status badge color
export function getStatusColor(status: string): string {
  switch (status.toUpperCase()) {
    case 'OK':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
    case 'WARNING':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
    case 'ERROR':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
  }
}
