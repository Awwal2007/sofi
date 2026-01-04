// ReceiptGenerator.jsx (New Component)
import React from 'react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export const generateTransactionReceipt = async (transaction, user) => {
  try {
    // Create a container for the receipt
    const receiptContainer = document.createElement('div')
    receiptContainer.style.position = 'absolute'
    receiptContainer.style.left = '-9999px'
    receiptContainer.style.top = '-9999px'
    receiptContainer.style.width = '794px' // A4 width in pixels
    receiptContainer.style.padding = '40px'
    receiptContainer.style.fontFamily = 'Arial, sans-serif'
    receiptContainer.style.backgroundColor = 'white'
    receiptContainer.style.color = '#000'
    receiptContainer.innerHTML = `
      <div style="margin-bottom: 40px; text-align: center;">
        <h1 style="color: #1e40af; margin: 0; font-size: 28px; font-weight: bold;">SoFi Bank</h1>
        <p style="color: #6b7280; margin: 5px 0 0; font-size: 14px;">Digital Banking Receipt</p>
      </div>
      
      <div style="border: 2px solid #1e40af; border-radius: 12px; padding: 30px; margin-bottom: 30px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <div>
            <h2 style="color: #1e293b; margin: 0 0 5px; font-size: 24px; font-weight: bold;">Transaction Receipt</h2>
            <p style="color: #64748b; margin: 0; font-size: 14px;">ID: ${transaction.transactionId || transaction._id || transaction.id}</p>
          </div>
          <div style="background-color: #f1f5f9; padding: 10px 20px; border-radius: 8px; text-align: center;">
            <div style="color: ${transaction.status === 'completed' ? '#059669' : transaction.status === 'pending' ? '#d97706' : '#dc2626'}; 
                         font-size: 16px; font-weight: bold; text-transform: uppercase;">
              ${transaction.status}
            </div>
          </div>
        </div>
        
        <div style="background-color: #eff6ff; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
          <div style="text-align: center;">
            <div style="font-size: 36px; font-weight: bold; color: ${transaction.type === 'credit' ? '#059669' : '#dc2626'}; margin-bottom: 5px;">
              ${transaction.type === 'credit' ? '+' : '-'}$${transaction.amount.toFixed(2)}
            </div>
            <div style="color: #4b5563; font-size: 16px;">${transaction.description}</div>
          </div>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 25px; margin-bottom: 25px;">
          <div>
            <h3 style="color: #374151; font-size: 16px; font-weight: bold; margin: 0 0 10px;">Transaction Details</h3>
            <div style="font-size: 14px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span style="color: #6b7280;">Date & Time:</span>
                <span style="color: #111827; font-weight: 500;">${new Date(transaction.createdAt || transaction.date).toLocaleString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span style="color: #6b7280;">Type:</span>
                <span style="color: #111827; font-weight: 500;">${transaction.type === 'credit' ? 'Credit' : transaction.type === 'debit' ? 'Debit' : 'Transfer'}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span style="color: #6b7280;">Category:</span>
                <span style="color: #111827; font-weight: 500; text-transform: capitalize;">${transaction.category || 'General'}</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 style="color: #374151; font-size: 16px; font-weight: bold; margin: 0 0 10px;">Account Information</h3>
            <div style="font-size: 14px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span style="color: #6b7280;">Account Number:</span>
                <span style="color: #111827; font-weight: 500;">${user?.accountNumber ? '••••' + user.accountNumber.slice(-4) : 'N/A'}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span style="color: #6b7280;">Account Holder:</span>
                <span style="color: #111827; font-weight: 500;">${user?.name || 'N/A'}</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: #6b7280;">Transaction Fees:</span>
                <span style="color: #111827; font-weight: 500;">$${(transaction.fees || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 25px;">
          <div>
            <h3 style="color: #374151; font-size: 16px; font-weight: bold; margin: 0 0 10px;">From</h3>
            <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; font-size: 14px;">
              <div style="font-weight: bold; color: #111827; margin-bottom: 5px;">
                ${transaction.sender?.name || transaction.sender?.accountNumber || transaction.sender || 'N/A'}
              </div>
              ${transaction.sender?.accountNumber ? `
                <div style="color: #6b7280;">Account: ••••${transaction.sender.accountNumber.slice(-4)}</div>
              ` : ''}
            </div>
          </div>
          
          <div>
            <h3 style="color: #374151; font-size: 16px; font-weight: bold; margin: 0 0 10px;">To</h3>
            <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; font-size: 14px;">
              <div style="font-weight: bold; color: #111827; margin-bottom: 5px;">
                ${transaction.receiver?.name || transaction.receiver?.accountNumber || transaction.receiver || 'N/A'}
              </div>
              ${transaction.receiver?.accountNumber ? `
                <div style="color: #6b7280;">Account: ••••${transaction.receiver.accountNumber.slice(-4)}</div>
              ` : ''}
            </div>
          </div>
        </div>
      </div>
      
      <div style="border-top: 1px solid #e5e7eb; padding-top: 25px; margin-bottom: 30px;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
          <div>
            <div style="font-size: 12px; color: #6b7280; margin-bottom: 5px;">Reference Number</div>
            <div style="font-size: 14px; font-weight: bold; color: #111827; font-family: monospace;">
              ${transaction.transactionId || transaction._id || transaction.id}
            </div>
          </div>
          <div>
            <div style="font-size: 12px; color: #6b7280; margin-bottom: 5px;">Authorization Code</div>
            <div style="font-size: 14px; font-weight: bold; color: #111827; font-family: monospace;">
              ${'AUTH' + Math.random().toString(36).substr(2, 9).toUpperCase()}
            </div>
          </div>
        </div>
      </div>
      
      <div style="border-top: 1px solid #e5e7eb; padding-top: 25px;">
        <h3 style="color: #374151; font-size: 16px; font-weight: bold; margin: 0 0 15px;">Important Information</h3>
        <div style="font-size: 12px; color: #6b7280; line-height: 1.5;">
          <p style="margin: 0 0 10px;">• This receipt is proof of your transaction with SoFi Bank.</p>
          <p style="margin: 0 0 10px;">• Please keep this receipt for your records and future reference.</p>
          <p style="margin: 0 0 10px;">• For any discrepancies, please contact customer support within 30 days.</p>
          <p style="margin: 0;">• Generated electronically on ${new Date().toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}</p>
        </div>
      </div>
      
      <div style="margin-top: 40px; text-align: center; font-size: 10px; color: #9ca3af;">
        <p style="margin: 0 0 5px;">SoFi Bank • Member FDIC • Equal Housing Lender</p>
        <p style="margin: 0;">123 Banking Street, San Francisco, CA 94105 • support@sofi.com • (888) 888-8888</p>
      </div>
    `
    
    document.body.appendChild(receiptContainer)
    
    // Convert to canvas then to PDF
    const canvas = await html2canvas(receiptContainer, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    })
    
    document.body.removeChild(receiptContainer)
    
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })
    
    const imgWidth = 210 // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)
    
    // Generate filename
    const date = new Date().toISOString().split('T')[0]
    const timestamp = new Date().toTimeString().split(' ')[0].replace(/:/g, '-')
    const filename = `SoFi_Receipt_${date}_${timestamp}.pdf`
    
    // Save the PDF
    pdf.save(filename)
    
    return { success: true, filename }
  } catch (error) {
    console.error('Error generating receipt:', error)
    return { success: false, error: error.message }
  }
}

// Simple receipt generator for transactions list (without modal)
export const downloadTransactionReceipt = async (transaction, user) => {
  try {
    const pdf = new jsPDF()
    
    // Set up basic styling
    pdf.setFont('helvetica')
    pdf.setFontSize(20)
    pdf.setTextColor(30, 64, 175) // Blue color
    pdf.text('SoFi Bank', 105, 20, { align: 'center' })
    
    pdf.setFontSize(12)
    pdf.setTextColor(107, 114, 128) // Gray color
    pdf.text('Digital Banking Receipt', 105, 28, { align: 'center' })
    
    // Draw a line
    pdf.setDrawColor(30, 64, 175)
    pdf.setLineWidth(0.5)
    pdf.line(20, 35, 190, 35)
    
    // Transaction details
    pdf.setFontSize(16)
    pdf.setTextColor(31, 41, 55) // Dark gray
    pdf.text('Transaction Receipt', 20, 45)
    
    pdf.setFontSize(10)
    pdf.setTextColor(107, 114, 128)
    pdf.text(`ID: ${transaction.transactionId || transaction._id || transaction.id}`, 20, 52)
    
    // Status badge
    const statusColor = transaction.status === 'completed' ? [5, 150, 105] : // green
                       transaction.status === 'pending' ? [217, 119, 6] : // yellow
                       [220, 38, 38] // red
    
    pdf.setFillColor(...statusColor)
    pdf.roundedRect(160, 40, 30, 10, 3, 3, 'F')
    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(8)
    pdf.text(transaction.status.toUpperCase(), 175, 46, { align: 'center' })
    
    // Amount section
    pdf.setFontSize(24)
    const amountColor = transaction.type === 'credit' ? [5, 150, 105] : // green
                       [220, 38, 38] // red
    pdf.setTextColor(...amountColor)
    pdf.text(`${transaction.type === 'credit' ? '+' : '-'}$${transaction.amount.toFixed(2)}`, 105, 70, { align: 'center' })
    
    pdf.setFontSize(12)
    pdf.setTextColor(75, 85, 99)
    pdf.text(transaction.description, 105, 78, { align: 'center' })
    
    // Transaction details table
    pdf.setFontSize(10)
    pdf.setTextColor(107, 114, 128)
    
    let yPos = 90
    
    // Date & Time
    pdf.text('Date & Time:', 20, yPos)
    pdf.setTextColor(17, 24, 39)
    pdf.text(new Date(transaction.createdAt || transaction.date).toLocaleString(), 70, yPos)
    
    // Type
    yPos += 7
    pdf.setTextColor(107, 114, 128)
    pdf.text('Type:', 20, yPos)
    pdf.setTextColor(17, 24, 39)
    pdf.text(transaction.type === 'credit' ? 'Credit' : transaction.type === 'debit' ? 'Debit' : 'Transfer', 70, yPos)
    
    // Category
    yPos += 7
    pdf.setTextColor(107, 114, 128)
    pdf.text('Category:', 20, yPos)
    pdf.setTextColor(17, 24, 39)
    pdf.text((transaction.category || 'General').toUpperCase(), 70, yPos)
    
    // From/To accounts
    yPos += 12
    pdf.setTextColor(107, 114, 128)
    pdf.text('From Account:', 20, yPos)
    pdf.setTextColor(17, 24, 39)
    pdf.text(transaction.sender?.name || transaction.sender?.accountNumber || transaction.sender || 'N/A', 70, yPos)
    
    yPos += 7
    pdf.setTextColor(107, 114, 128)
    pdf.text('To Account:', 20, yPos)
    pdf.setTextColor(17, 24, 39)
    pdf.text(transaction.receiver?.name || transaction.receiver?.accountNumber || transaction.receiver || 'N/A', 70, yPos)
    
    // Fees
    yPos += 7
    pdf.setTextColor(107, 114, 128)
    pdf.text('Transaction Fees:', 20, yPos)
    pdf.setTextColor(17, 24, 39)
    pdf.text(`$${(transaction.fees || 0).toFixed(2)}`, 70, yPos)
    
    // Account holder info
    yPos += 12
    pdf.setTextColor(107, 114, 128)
    pdf.text('Account Holder:', 20, yPos)
    pdf.setTextColor(17, 24, 39)
    pdf.text(user?.name || 'N/A', 70, yPos)
    
    yPos += 7
    pdf.setTextColor(107, 114, 128)
    pdf.text('Account Number:', 20, yPos)
    pdf.setTextColor(17, 24, 39)
    pdf.text(user?.accountNumber ? '••••' + user.accountNumber.slice(-4) : 'N/A', 70, yPos)
    
    // Reference number
    yPos += 12
    pdf.setTextColor(107, 114, 128)
    pdf.text('Reference Number:', 20, yPos)
    pdf.setTextColor(17, 24, 39)
    pdf.setFont('courier')
    pdf.text(transaction.transactionId || transaction._id || transaction.id, 70, yPos)
    
    // Footer
    pdf.setFont('helvetica')
    pdf.setFontSize(8)
    pdf.setTextColor(156, 163, 175)
    yPos = 270
    pdf.text('SoFi Bank • Member FDIC • Equal Housing Lender', 105, yPos, { align: 'center' })
    yPos += 4
    pdf.text('Generated electronically on ' + new Date().toLocaleString(), 105, yPos, { align: 'center' })
    
    // Generate filename
    const date = new Date().toISOString().split('T')[0]
    const timestamp = new Date().toTimeString().split(' ')[0].replace(/:/g, '-')
    const filename = `SoFi_Receipt_${date}_${timestamp}.pdf`
    
    // Save the PDF
    pdf.save(filename)
    
    return { success: true, filename }
  } catch (error) {
    console.error('Error generating simple receipt:', error)
    return { success: false, error: error.message }
  }
}