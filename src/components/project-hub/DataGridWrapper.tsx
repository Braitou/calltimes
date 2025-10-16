'use client'

import { useEffect, useState } from 'react'

interface DataGridWrapperProps {
  columns: any[]
  rows: any[]
  rowKeyGetter: (row: any) => any
  className?: string
  style?: React.CSSProperties
}

export function DataGridWrapper({ columns, rows, rowKeyGetter, className, style }: DataGridWrapperProps) {
  const [DataGrid, setDataGrid] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Import dynamique côté client
    const loadDataGrid = async () => {
      try {
        const module = await import('react-data-grid')
        await import('react-data-grid/lib/styles.css')
        
        // Essayer différentes manières d'accéder au composant
        const Component = module.default || (module as any).DataGrid || module
        
        setDataGrid(() => Component)
        setIsLoading(false)
      } catch (error) {
        console.error('Error loading DataGrid:', error)
        setIsLoading(false)
      }
    }

    loadDataGrid()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-400 mb-2"></div>
          <p className="text-xs text-gray-500">Chargement du tableau...</p>
        </div>
      </div>
    )
  }

  if (!DataGrid) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-red-400">Erreur de chargement du tableau</p>
      </div>
    )
  }

  return (
    <DataGrid
      columns={columns}
      rows={rows}
      rowKeyGetter={rowKeyGetter}
      className={className}
      style={style}
    />
  )
}

