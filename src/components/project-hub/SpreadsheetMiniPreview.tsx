'use client'

import { useState, useEffect } from 'react'
import * as XLSX from 'xlsx'
import { Maximize2, FileSpreadsheet } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SpreadsheetMiniPreviewProps {
  fileUrl: string
  fileName: string
  onExpand?: () => void
}

/**
 * Mini preview pour fichiers Excel/CSV dans la sidebar
 * Affiche les 5 premières lignes en aperçu
 */
export function SpreadsheetMiniPreview({
  fileUrl,
  fileName,
  onExpand
}: SpreadsheetMiniPreviewProps) {
  const [previewData, setPreviewData] = useState<{ headers: string[]; rows: string[][] } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadPreview()
  }, [fileUrl])

  const loadPreview = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(fileUrl)
      if (!response.ok) throw new Error('Impossible de charger le fichier')

      const arrayBuffer = await response.arrayBuffer()
      const workbook = XLSX.read(arrayBuffer, { type: 'array' })
      
      // Prendre la première feuille
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
      const jsonData = XLSX.utils.sheet_to_json(firstSheet, { 
        header: 1,
        defval: ''
      }) as any[][]
      
      if (jsonData.length === 0) {
        setPreviewData(null)
        setIsLoading(false)
        return
      }
      
      // Headers = première ligne
      const headers = jsonData[0]?.map(h => h?.toString() || '') || []
      
      // Prendre les 5 premières lignes de données (max)
      const rows = jsonData.slice(1, 6).map(row => 
        row.map(cell => cell?.toString() || '')
      )
      
      setPreviewData({ headers, rows })
    } catch (err) {
      console.error('Error loading spreadsheet preview:', err)
      setError('Erreur de chargement')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-green-400 mb-2"></div>
          <p className="text-xs text-gray-500">Chargement...</p>
        </div>
      </div>
    )
  }

  if (error || !previewData) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900">
        <FileSpreadsheet className="w-12 h-12 text-green-500 mb-3" />
        <p className="text-xs text-gray-500 mb-3">{error || 'Fichier Excel/CSV'}</p>
        {onExpand && (
          <Button
            size="sm"
            onClick={onExpand}
            className="bg-green-400 hover:bg-green-500 text-black text-xs"
          >
            📊 Visualiser
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="absolute inset-0 bg-[#111] overflow-hidden group">
      {/* Mini tableau */}
      <div className="h-full overflow-auto text-[10px]">
        <table className="w-full border-collapse">
          <thead className="bg-[#1a1a1a] sticky top-0 z-10">
            <tr>
              {previewData.headers.slice(0, 4).map((header, i) => (
                <th
                  key={i}
                  className="border border-[#333] px-2 py-1 text-left font-semibold text-gray-400 truncate"
                  style={{ maxWidth: '80px' }}
                >
                  {header || `Col ${i + 1}`}
                </th>
              ))}
              {previewData.headers.length > 4 && (
                <th className="border border-[#333] px-2 py-1 text-center text-gray-600">
                  +{previewData.headers.length - 4}
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {previewData.rows.map((row, rowIdx) => (
              <tr key={rowIdx} className="hover:bg-[#1a1a1a]">
                {row.slice(0, 4).map((cell, cellIdx) => (
                  <td
                    key={cellIdx}
                    className="border border-[#333] px-2 py-1 text-gray-300 truncate"
                    style={{ maxWidth: '80px' }}
                    title={cell}
                  >
                    {cell || '-'}
                  </td>
                ))}
                {row.length > 4 && (
                  <td className="border border-[#333] px-2 py-1 text-center text-gray-600">
                    ...
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bouton Agrandir en overlay */}
      {onExpand && (
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Button
            onClick={onExpand}
            size="sm"
            className="bg-green-400 hover:bg-green-500 text-black font-bold"
          >
            <Maximize2 className="w-4 h-4 mr-2" />
            Agrandir
          </Button>
        </div>
      )}

      {/* Badge indicateur */}
      <div className="absolute bottom-2 right-2 bg-green-400 text-black text-[9px] font-bold px-2 py-1 rounded">
        {previewData.rows.length}+ lignes
      </div>
    </div>
  )
}

