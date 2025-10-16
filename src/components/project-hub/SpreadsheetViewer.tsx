'use client'

import { useState, useEffect } from 'react'
import * as XLSX from 'xlsx'
import { Download, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DataGridWrapper } from './DataGridWrapper'

interface SpreadsheetViewerProps {
  fileUrl: string
  fileName: string
  onClose: () => void
  onDownload?: () => void
}

interface ColumnDef {
  key: string
  name: string
  width?: number
  resizable?: boolean
}

/**
 * Visualiseur de fichiers XLSX et CSV
 * Lecture seule, avec possibilité de télécharger pour éditer dans Excel
 */
export function SpreadsheetViewer({
  fileUrl,
  fileName,
  onClose,
  onDownload
}: SpreadsheetViewerProps) {
  const [columns, setColumns] = useState<ColumnDef[]>([])
  const [rows, setRows] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sheetNames, setSheetNames] = useState<string[]>([])
  const [activeSheet, setActiveSheet] = useState<string>('')

  useEffect(() => {
    loadSpreadsheet()
  }, [fileUrl])

  useEffect(() => {
    if (activeSheet && sheetNames.length > 0) {
      loadSheet(activeSheet)
    }
  }, [activeSheet])

  const loadSpreadsheet = async () => {
    setIsLoading(true)
    setError(null)

    try {
      console.log('📊 Loading spreadsheet:', fileName)
      
      // Télécharger le fichier
      const response = await fetch(fileUrl)
      if (!response.ok) {
        throw new Error('Impossible de charger le fichier')
      }

      const arrayBuffer = await response.arrayBuffer()
      
      // Parser avec XLSX
      const workbook = XLSX.read(arrayBuffer, { type: 'array' })
      
      console.log('✅ Workbook loaded:', workbook.SheetNames)
      
      // Stocker les noms de feuilles
      setSheetNames(workbook.SheetNames)
      setActiveSheet(workbook.SheetNames[0])
      
      // Charger la première feuille
      loadSheetFromWorkbook(workbook, workbook.SheetNames[0])
      
    } catch (err) {
      console.error('❌ Error loading spreadsheet:', err)
      setError(err instanceof Error ? err.message : 'Erreur de chargement')
    } finally {
      setIsLoading(false)
    }
  }

  const loadSheet = async (sheetName: string) => {
    try {
      const response = await fetch(fileUrl)
      const arrayBuffer = await response.arrayBuffer()
      const workbook = XLSX.read(arrayBuffer, { type: 'array' })
      loadSheetFromWorkbook(workbook, sheetName)
    } catch (err) {
      console.error('Error loading sheet:', err)
    }
  }

  const loadSheetFromWorkbook = (workbook: XLSX.WorkBook, sheetName: string) => {
    const sheet = workbook.Sheets[sheetName]
    
    // Convertir en JSON
    const jsonData = XLSX.utils.sheet_to_json(sheet, { 
      header: 1, // Retourne un tableau de tableaux
      defval: '' // Valeur par défaut pour cellules vides
    }) as any[][]
    
    if (jsonData.length === 0) {
      setColumns([])
      setRows([])
      return
    }
    
    // Première ligne = headers
    const headers = jsonData[0]
    
    // Générer les colonnes
    const cols: ColumnDef[] = headers.map((header, index) => ({
      key: `col${index}`,
      name: header?.toString() || `Column ${index + 1}`,
      width: 150,
      resizable: true
    }))
    
    // Générer les lignes (à partir de la 2ème ligne)
    const dataRows = jsonData.slice(1).map((row, rowIndex) => {
      const rowData: any = { id: rowIndex }
      row.forEach((cell, colIndex) => {
        rowData[`col${colIndex}`] = cell?.toString() || ''
      })
      return rowData
    })
    
    console.log('📋 Parsed data:', {
      columns: cols.length,
      rows: dataRows.length,
      sheet: sheetName
    })
    
    setColumns(cols)
    setRows(dataRows)
  }

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-[#111] border border-[#333] rounded-lg w-full max-w-[95vw] h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#333]">
          <div>
            <h2 className="text-lg font-bold text-white">{fileName}</h2>
            <p className="text-sm text-gray-500 mt-1">
              {isLoading ? 'Chargement...' : `${rows.length} lignes × ${columns.length} colonnes`}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {onDownload && (
              <Button
                variant="outline"
                size="sm"
                onClick={onDownload}
                className="bg-[#222] border-[#444] hover:bg-[#333] text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                Télécharger
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="hover:bg-[#222] text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Tabs pour les feuilles multiples */}
        {sheetNames.length > 1 && (
          <div className="flex gap-1 px-4 pt-3 border-b border-[#333]">
            {sheetNames.map((name) => (
              <button
                key={name}
                onClick={() => setActiveSheet(name)}
                className={`px-4 py-2 text-sm rounded-t transition-colors ${
                  activeSheet === name
                    ? 'bg-[#222] text-white border-t border-l border-r border-[#444]'
                    : 'text-gray-500 hover:text-white hover:bg-[#1a1a1a]'
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mb-4"></div>
                <p className="text-white">Chargement du fichier...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-red-400">
                <p className="text-lg font-medium mb-2">Erreur</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          ) : rows.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">Aucune donnée à afficher</p>
            </div>
          ) : (
            <div className="h-full spreadsheet-viewer">
              <DataGridWrapper
                columns={columns}
                rows={rows}
                rowKeyGetter={(row) => row.id}
                className="rdg-light"
                style={{ height: '100%' }}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-[#333] bg-[#0a0a0a]">
          <p className="text-xs text-gray-600">
            💡 <span className="text-gray-500">Lecture seule.</span> Téléchargez le fichier pour l'éditer dans Excel.
          </p>
        </div>
      </div>

      {/* Custom Styles pour DataGrid */}
      <style jsx global>{`
        .spreadsheet-viewer .rdg {
          --rdg-background-color: #111;
          --rdg-header-background-color: #1a1a1a;
          --rdg-row-hover-background-color: #1a1a1a;
          --rdg-row-selected-background-color: #2a2a2a;
          --rdg-border-color: #333;
          --rdg-summary-border-color: #333;
          --rdg-color: #fff;
          --rdg-header-color: #aaa;
          --rdg-cell-frozen-box-shadow: none;
          border: none;
          font-size: 13px;
        }

        .spreadsheet-viewer .rdg-cell {
          border-right: 1px solid #333;
          border-bottom: 1px solid #333;
          padding: 8px 12px;
        }

        .spreadsheet-viewer .rdg-header-row {
          background-color: #1a1a1a;
          font-weight: 600;
          border-bottom: 2px solid #444;
        }

        .spreadsheet-viewer .rdg-row:hover {
          background-color: #1a1a1a;
        }
      `}</style>
    </div>
  )
}

