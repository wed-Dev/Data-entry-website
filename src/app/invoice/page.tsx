'use client'

import { useState, useRef, useEffect } from 'react'
import { AppLayout } from '@/components/AppLayout'
import { Save, FileText, Download, Upload } from 'lucide-react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import axios from 'axios'

export default function InvoicePage() {
  const [invoiceNumber, setInvoiceNumber] = useState('')
  const [invoiceDate, setInvoiceDate] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [vehicleNumber, setVehicleNumber] = useState('')
  const [currentLocation, setCurrentLocation] = useState('')
  const [destinationLocation, setDestinationLocation] = useState('')
  const [distance, setDistance] = useState('')
  const [totalAmount, setTotalAmount] = useState('')
  const [lineItems, setLineItems] = useState<any[]>([
    { srNo: 1, description: '', qty: '', rate: '', amount: '' },
    { srNo: 2, description: '', qty: '', rate: '', amount: '' },
    { srNo: 3, description: '', qty: '', rate: '', amount: '' },
    { srNo: 4, description: '', qty: '', rate: '', amount: '' },
    { srNo: 5, description: '', qty: '', rate: '', amount: '' },
  ])
  const [signatureData, setSignatureData] = useState('/typesignature.jpg')
  const [saving, setSaving] = useState(false)
  const invoiceRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [showSignatureModal, setShowSignatureModal] = useState(false)

  useEffect(() => {
    // Set default date and invoice number
    const today = new Date().toISOString().split('T')[0]
    setInvoiceDate(today)
    setInvoiceNumber(Math.floor(100000 + Math.random() * 900000).toString())
  }, [])

  const handleSaveInvoice = async () => {
    setSaving(true)
    try {
      const invoiceData = {
        invoiceNumber,
        date: invoiceDate,
        companyName,
        vehicleNumber,
        currentLocation,
        destinationLocation,
        distance,
        lineItems,
        totalAmount,
        signature: signatureData,
      }

      await axios.post('/api/invoices', invoiceData)
      alert('âœ… Invoice saved successfully!')
    } catch (error) {
      console.error('Error saving invoice:', error)
      alert('âŒ Error saving invoice. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDownloadPDF = async () => {
    if (!invoiceRef.current) return

    try {
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 3,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true,
      })

      const pdf = new jsPDF('p', 'mm', 'a4', true)
      const imgData = canvas.toDataURL('image/png', 1.0)
      const imgWidth = 210
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight, undefined, 'FAST')
      pdf.save(`Invoice_${invoiceNumber}_${invoiceDate}.pdf`)
      alert('âœ… Invoice PDF downloaded!')
    } catch (error) {
      console.error('Error downloading PDF:', error)
      alert('âŒ Error downloading PDF. Please try again.')
    }
  }

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    setIsDrawing(true)
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  const applySignature = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dataURL = canvas.toDataURL('image/png')
    setSignatureData(dataURL)
    setShowSignatureModal(false)
  }

  const handleLineItemChange = (index: number, field: string, value: string) => {
    const updated = [...lineItems]
    updated[index] = { ...updated[index], [field]: value }
    setLineItems(updated)
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Print-specific styles */}
        <style>{`
          @media print {
            body * {
              visibility: hidden;
            }
            #invoice-container, #invoice-container * {
              visibility: visible;
            }
            #invoice-container {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
            .no-print {
              display: none !important;
            }
            .print-grid-2 {
              display: grid !important;
              grid-template-columns: 1fr 1fr !important;
              gap: 1rem !important;
            }
            .print-grid-2 > div {
              break-inside: avoid !important;
            }
            input {
              border: none !important;
              border-bottom: 1px dotted #999 !important;
            }
          }
          @media screen and (max-width: 640px) {
            .print-grid-2 {
              grid-template-columns: 1fr !important;
            }
          }
        `}</style>
        {/* Action Buttons */}
        <div className="flex gap-3 justify-end no-print">
          <button onClick={() => setShowSignatureModal(true)} className="btn-secondary">
            <Upload size={18} />
            Add Signature
          </button>
          <button onClick={handleSaveInvoice} disabled={saving} className="btn-primary">
            <Save size={18} />
            {saving ? 'Saving...' : 'Save Invoice'}
          </button>
          <button onClick={handleDownloadPDF} className="btn-primary">
            <Download size={18} />
            Download PDF
          </button>
        </div>

        {/* Invoice Container */}
        <div ref={invoiceRef} className="max-w-4xl id="invoice-container" mx-auto bg-white border-4 border-black">
          {/* Header */}
          <div className="text-center p-6 border-b-2 border-black">
            <h1 className="text-2xl font-bold text-blue-900">Ø­Ø§Ù…Ø¯ Ù…Ø®ØªØ§Ø± Ù„Ù„Ù†Ù‚Ù„ Ø¨Ø§Ù„Ø´Ø§Ø­Ù†Ø§Øª Ø§Ù„Ø«Ù‚ÙŠÙ„Ø© ÙˆØ§Ù„Ø®ÙÙŠÙØ© (Ø´.Ø°.Ù….Ù…)</h1>
            <h2 className="text-2xl font-bold text-blue-900 mt-1">HAMID MUKHTAR HEAVY & LIGHT TRUCKS TRANSPORT (L.L.C)</h2>
            <p className="text-xl text-blue-900 mt-2">Dubai 24/7 Car Recovery & Towing Service</p>

            <div className="flex justify-between items-start mt-6">
              <div className="text-left">
                <div className="bg-blue-900 text-white px-6 py-3 inline-block font-bold">Car Removal<br/>Service</div>
                <div className="text-2xl font-bold text-blue-900 mt-3">
                  No.: <input
                    type="text"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    className="border-b border-gray-400 w-32 outline-none"
                  />
                </div>
              </div>

              <div className="border-2 border-black px-4 py-2">
                <div className="text-sm">ÙØ§ØªÙˆØ±Ø© Ù†Ù‚Ø¯Ø§Ù‹ / Ø¹Ù„Ù‰ Ø§Ù„Ø­Ø³Ø§Ø¨</div>
                <div className="text-xs font-bold">CASH / DEBIT INVOICE</div>
              </div>

              <div className="text-right">
                <div className="text-sm">Email: Ahmadfarhan32304gmail.com</div>
                <div className="font-bold">Ahmad Farhan</div>
                <div className="text-lg font-bold">ðŸ“ž +971 543881803</div>
                <div className="mt-2">
                  <span className="text-sm">Ø§Ù„ØªØ§Ø±ÙŠØ® Date.: </span>
                  <input
                    type="date"
                    value={invoiceDate}
                    onChange={(e) => setInvoiceDate(e.target.value)}
                    className="border-b border-gray-400 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="p-6 border-b-2 border-black">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 print-grid-2 mb-4">
              <div>
                <label className="font-bold">Company Name:</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="border-b border-dotted border-gray-400 w-full outline-none"
                  placeholder="Enter company name"
                />
              </div>
              <div>
                <label className="font-bold">Vehicle Number:</label>
                <input
                  type="text"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value)}
                  className="border-b border-dotted border-gray-400 w-full outline-none"
                  placeholder="Enter vehicle number"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 print-grid-2 mb-4">
              <div>
                <label className="font-bold">Current Location:</label>
                <input
                  type="text"
                  value={currentLocation}
                  onChange={(e) => setCurrentLocation(e.target.value)}
                  className="border-b border-dotted border-gray-400 w-full outline-none"
                  placeholder="Enter current location"
                />
              </div>
              <div>
                <label className="font-bold">Destination Location:</label>
                <input
                  type="text"
                  value={destinationLocation}
                  onChange={(e) => setDestinationLocation(e.target.value)}
                  className="border-b border-dotted border-gray-400 w-full outline-none"
                  placeholder="Enter destination location"
                />
              </div>
            </div>
            <div>
              <label className="font-bold">Distance (KM):</label>
              <input
                type="text"
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
                className="border-b border-dotted border-gray-400 w-full outline-none"
                placeholder="Enter distance in kilometers"
              />
            </div>
          </div>

          {/* Invoice Table */}
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-white">
                <th className="border border-blue-900 p-2 text-xs">
                  <div className="text-sm">Ø§Ù„Ø±Ù‚Ù…</div>
                  <div className="font-bold">Sr. No.</div>
                </th>
                <th className="border border-blue-900 p-2 text-xs">
                  <div className="text-sm">Ø§Ù„ØªÙÙ€Ù€Ù€Ø§ØµÙŠÙ€Ù€Ù€Ù€Ù€Ù€Ù€Ù„</div>
                  <div className="font-bold">Description</div>
                </th>
                <th className="border border-blue-900 p-2 text-xs">
                  <div className="text-sm">Ø§Ù„Ø¹Ø¯Ø¯</div>
                  <div className="font-bold">Qty.</div>
                </th>
                <th className="border border-blue-900 p-2 text-xs">
                  <div className="text-sm">Ø§Ù„Ø³Ø¹Ø±</div>
                  <div className="font-bold">Rate</div>
                </th>
                <th className="border border-blue-900 p-2 text-xs">
                  <div className="text-sm">Ø§Ù„Ù…Ø¨Ù„Øº</div>
                  <div className="font-bold">Amount</div>
                </th>
              </tr>
            </thead>
            <tbody>
              {lineItems.map((item, index) => (
                <tr key={index}>
                  <td className="border border-blue-900 p-2 text-center">{item.srNo}</td>
                  <td className="border border-blue-900 p-2">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => handleLineItemChange(index, 'description', e.target.value)}
                      className="w-full outline-none"
                    />
                  </td>
                  <td className="border border-blue-900 p-2">
                    <input
                      type="text"
                      value={item.qty}
                      onChange={(e) => handleLineItemChange(index, 'qty', e.target.value)}
                      className="w-full outline-none text-center"
                    />
                  </td>
                  <td className="border border-blue-900 p-2">
                    <input
                      type="text"
                      value={item.rate}
                      onChange={(e) => handleLineItemChange(index, 'rate', e.target.value)}
                      className="w-full outline-none text-center"
                    />
                  </td>
                  <td className="border border-blue-900 p-2">
                    <input
                      type="text"
                      value={item.amount}
                      onChange={(e) => handleLineItemChange(index, 'amount', e.target.value)}
                      className="w-full outline-none text-center"
                    />
                  </td>
                </tr>
              ))}
              <tr className="bg-white font-bold">
                <td className="border-t-2 border-blue-900 border-r border-blue-900 p-2">
                  <div className="text-xs">Signature:</div>
                  {signatureData && (
                    <img src={signatureData} alt="Signature" className="max-w-[100px] h-8 mt-1" />
                  )}
                </td>
                <td colSpan={4} className="border-t-2 border-blue-900 p-3 text-right">
                  <span className="text-sm">Ø§Ù„Ù…Ø¬Ù…ÙˆØ¹ Ø¯Ø±Ù‡Ù…&nbsp;&nbsp;Total Dirhams</span>
                  <div className="mt-2">
                    <input
                      type="text"
                      value={totalAmount}
                      onChange={(e) => setTotalAmount(e.target.value)}
                      className="border-b border-dotted border-gray-400 w-32 outline-none text-right font-bold"
                      placeholder="Total"
                    />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Signature Modal */}
      {showSignatureModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-bold text-lg">Draw or Upload Signature</h3>
              <button onClick={() => setShowSignatureModal(false)} className="btn-secondary px-3 py-1">âœ–</button>
            </div>
            <div className="p-4 bg-gray-50">
              <canvas
                ref={canvasRef}
                width={700}
                height={220}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                className="w-full border border-dashed border-gray-400 bg-white cursor-crosshair rounded"
              />
            </div>
            <div className="flex justify-between items-center p-4 border-t">
              <button onClick={clearSignature} className="btn-secondary">Clear</button>
              <button onClick={applySignature} className="btn-primary">Use Signature</button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  )
}





