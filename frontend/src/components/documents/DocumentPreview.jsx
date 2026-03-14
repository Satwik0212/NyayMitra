import React, { useRef } from 'react'
import { Download, Printer } from 'lucide-react'
import Button from '../ui/Button'

const DocumentPreview = ({ htmlContent, docType }) => {
  const previewRef = useRef(null)

  const handleDownloadPDF = async () => {
    try {
      // Dynamic import to avoid SSR issues
      const html2pdf = (await import('html2pdf.js')).default
      const element = previewRef.current
      const opt = {
        margin: 15,
        filename: `nyaymitra_${docType || 'document'}_${Date.now()}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      }
      html2pdf().set(opt).from(element).save()
    } catch (err) {
      console.error('PDF generation failed:', err)
      // Fallback: print
      window.print()
    }
  }

  const handlePrint = () => window.print()

  if (!htmlContent) return null

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-300">Document Preview</h3>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" icon={Printer} onClick={handlePrint} className="no-print">
            Print
          </Button>
          <Button variant="gold" size="sm" icon={Download} onClick={handleDownloadPDF} className="no-print">
            Download PDF
          </Button>
        </div>
      </div>

      {/* Preview Frame */}
      <div
        className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-200 min-h-[600px]"
        id="document-preview"
      >
        <div
          ref={previewRef}
          className="text-black"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </div>
    </div>
  )
}

export default DocumentPreview
