'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { supabase, Version } from '@/lib/supabase'
import { ArrowLeft, Calendar, TrendingUp, FileText, Trash2 } from 'lucide-react'
import Link from 'next/link'

export default function VersionsPage() {
  const router = useRouter()
  const { user, profile, loading } = useAuth()
  const [versions, setVersions] = useState<Version[]>([])
  const [loadingVersions, setLoadingVersions] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

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
      setLoadingVersions(true)
      
      // Use the list-versions edge function instead of direct database query
      const { data, error } = await supabase.functions.invoke('list-versions', {
        method: 'GET'
      })

      if (error) {
        console.error('Edge function error:', error)
        throw error
      }
      
      // Extract versions from the response
      const versionsData = data?.data || []
      setVersions(versionsData)
    } catch (error) {
      console.error('Error loading versions:', error)
      // Fallback to direct database query if edge function fails
      try {
        const { data, error } = await supabase
          .from('versions')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error
        setVersions(data || [])
      } catch (fallbackError) {
        console.error('Fallback query also failed:', fallbackError)
        alert('Failed to load versions. Please refresh the page.')
      }
    } finally {
      setLoadingVersions(false)
    }
  }

  async function handleDelete(versionId: string, versionName: string, event: React.MouseEvent) {
    event.preventDefault()
    event.stopPropagation()

    // Only admins can delete
    if (profile?.role !== 'admin') {
      alert('Only administrators can delete models')
      return
    }

    const confirmed = confirm(`Are you sure you want to delete "${versionName}"? This action cannot be undone.`)
    if (!confirmed) return

    setDeletingId(versionId)
    try {
      // Delete results first (foreign key constraint)
      const { error: resultsError } = await supabase
        .from('results')
        .delete()
        .eq('version_id', versionId)

      if (resultsError) throw resultsError

      // Delete assumptions
      const { error: assumptionsError } = await supabase
        .from('assumptions')
        .delete()
        .eq('version_id', versionId)

      if (assumptionsError) throw assumptionsError

      // Delete version
      const { error: versionError } = await supabase
        .from('versions')
        .delete()
        .eq('id', versionId)

      if (versionError) throw versionError

      // Refresh versions list
      await loadVersions()
      alert('Model deleted successfully')
    } catch (error) {
      console.error('Error deleting version:', error)
      alert('Error deleting model. Please try again.')
    } finally {
      setDeletingId(null)
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
          <div className="flex items-center space-x-4 h-16">
            <Link
              href="/dashboard"
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Model Versions
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Browse and manage your financial models
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loadingVersions ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            Loading versions...
          </div>
        ) : versions.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <FileText className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No versions yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Create your first financial planning model to get started
            </p>
            <Link
              href="/assumptions"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create New Model
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {versions.map((version) => (
              <div
                key={version.id}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200 relative group"
              >
                <Link
                  href={`/version-detail?id=${version.id}`}
                  className="block"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      version.version_type === 'base' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                      version.version_type === 'optimistic' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                      'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
                    }`}>
                      {version.version_type}
                    </div>
                    {version.is_active && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-xs font-medium rounded">
                        Active
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {version.name}
                  </h3>

                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(version.created_at).toLocaleDateString()}
                  </div>

                  {/* Property Information */}
                  {(version.metadata?.land_size || version.metadata?.building_size) && (
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2 space-y-1">
                      {version.metadata?.land_size && (
                        <div className="flex items-center">
                          <span className="font-medium mr-2">Land:</span>
                          <span>{version.metadata.land_size}</span>
                        </div>
                      )}
                      {version.metadata?.building_size && (
                        <div className="flex items-center">
                          <span className="font-medium mr-2">Building:</span>
                          <span>{version.metadata.building_size}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {version.metadata?.comments && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">
                      {version.metadata.comments}
                    </p>
                  )}

                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center text-sm text-blue-600 dark:text-blue-400">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      View Details
                    </div>
                  </div>
                </Link>

                {/* Delete Button - Only visible for admins */}
                {profile?.role === 'admin' && (
                  <button
                    onClick={(e) => handleDelete(version.id, version.name, e)}
                    disabled={deletingId === version.id}
                    className="absolute top-4 right-4 p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    title="Delete model (Admin only)"
                  >
                    {deletingId === version.id ? (
                      <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Trash2 className="w-5 h-5" />
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
