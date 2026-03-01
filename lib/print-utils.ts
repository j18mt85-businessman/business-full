// Print utility for DASTA POS
// Generates print-friendly HTML in a new window for receipts and reports

interface PrintReceiptData {
  branchName: string
  branchAddress: string
  receiptNumber: string
  date: string
  cashier?: string
  customerName?: string
  items: { name: string; qty: number; price: number; total: number }[]
  subtotal: number
  discount: number
  total: number
  paymentMethod: string
  cashReceived?: number
  change?: number
}

interface PrintReportData {
  title: string
  branchName: string
  period: string
  generatedAt: string
  sections: {
    title: string
    rows: { label: string; value: string }[]
  }[]
  tableData?: {
    headers: string[]
    rows: string[][]
  }
}

export function printReceipt(data: PrintReceiptData) {
  const w = window.open('', '_blank', 'width=350,height=700')
  if (!w) return

  const itemsHtml = data.items.map(item => `
    <div class="row">
      <span class="flex1">${item.name} x${item.qty}</span>
      <span class="bold">${formatNum(item.total)} ₾</span>
    </div>
  `).join('')

  w.document.write(`<!DOCTYPE html><html><head><title>ჩეკი ${data.receiptNumber}</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'Courier New',monospace;font-size:12px;width:280px;margin:0 auto;padding:12px;color:#000}
  .center{text-align:center}
  .bold{font-weight:bold}
  .title{font-size:16px;font-weight:bold;margin-bottom:4px}
  .subtitle{font-size:10px;color:#666}
  .line{border-top:1px dashed #333;margin:8px 0}
  .row{display:flex;justify-content:space-between;margin:2px 0}
  .flex1{flex:1}
  .total-row{font-size:14px;font-weight:bold;margin:4px 0}
  .footer{font-size:10px;color:#888;text-align:center;margin-top:8px}
  @media print{@page{margin:0;size:80mm auto}body{width:auto}}
</style></head><body>
  <div class="center">
    <div class="title">${data.branchName}</div>
    <div class="subtitle">${data.branchAddress}</div>
  </div>
  <div class="line"></div>
  <div class="row"><span>ჩეკი:</span><span class="bold">${data.receiptNumber}</span></div>
  <div class="row"><span>თარიღი:</span><span>${data.date}</span></div>
  ${data.cashier ? `<div class="row"><span>მოლარე:</span><span>${data.cashier}</span></div>` : ''}
  ${data.customerName ? `<div class="row"><span>კლიენტი:</span><span>${data.customerName}</span></div>` : ''}
  <div class="line"></div>
  ${itemsHtml}
  <div class="line"></div>
  <div class="row"><span>ქვეჯამი:</span><span>${formatNum(data.subtotal)} ₾</span></div>
  ${data.discount > 0 ? `<div class="row"><span>ფასდაკლება:</span><span>-${formatNum(data.discount)} ₾</span></div>` : ''}
  <div class="total-row row"><span>ჯამი:</span><span>${formatNum(data.total)} ₾</span></div>
  <div class="line"></div>
  <div class="row"><span>გადახდა:</span><span>${data.paymentMethod}</span></div>
  ${data.cashReceived ? `<div class="row"><span>მიღებული:</span><span>${formatNum(data.cashReceived)} ₾</span></div>` : ''}
  ${data.change && data.change > 0 ? `<div class="row"><span>ხურდა:</span><span>${formatNum(data.change)} ₾</span></div>` : ''}
  <div class="line"></div>
  <div class="footer">გმადლობთ შეძენისთვის!</div>
  <div class="footer" style="margin-top:4px">DASTA.GE</div>
</body></html>`)
  w.document.close()
  setTimeout(() => { w.print(); w.close() }, 300)
}

export function printReport(data: PrintReportData) {
  const w = window.open('', '_blank', 'width=800,height=900')
  if (!w) return

  const sectionsHtml = data.sections.map(section => `
    <div class="section">
      <h3>${section.title}</h3>
      ${section.rows.map(r => `<div class="kv-row"><span class="kv-label">${r.label}</span><span class="kv-value">${r.value}</span></div>`).join('')}
    </div>
  `).join('')

  const tableHtml = data.tableData ? `
    <table>
      <thead><tr>${data.tableData.headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
      <tbody>${data.tableData.rows.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')}</tbody>
    </table>
  ` : ''

  w.document.write(`<!DOCTYPE html><html><head><title>${data.title}</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'Segoe UI',Tahoma,sans-serif;font-size:13px;color:#1a1a2e;max-width:760px;margin:0 auto;padding:30px}
  h1{font-size:22px;color:#0f1724;margin-bottom:4px}
  h3{font-size:15px;color:#0f1724;padding-bottom:6px;border-bottom:2px solid #10b981;margin-bottom:10px}
  .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px;padding-bottom:16px;border-bottom:3px solid #0f1724}
  .header-left{flex:1}
  .header-right{text-align:right;font-size:11px;color:#666}
  .brand{color:#10b981;font-weight:bold;font-size:12px;letter-spacing:1px;margin-bottom:4px}
  .section{margin-bottom:20px;padding:16px;border:1px solid #e5e7eb;border-radius:8px;background:#fafafa}
  .kv-row{display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px dotted #e5e7eb}
  .kv-label{color:#666;font-size:12px}
  .kv-value{font-weight:bold;font-size:13px}
  table{width:100%;border-collapse:collapse;margin-top:16px;font-size:12px}
  th{background:#0f1724;color:#fff;padding:8px 12px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:.5px}
  td{padding:6px 12px;border-bottom:1px solid #e5e7eb}
  tr:nth-child(even){background:#f9fafb}
  .footer{text-align:center;margin-top:24px;padding-top:16px;border-top:1px solid #e5e7eb;font-size:10px;color:#999}
  @media print{@page{margin:15mm}body{padding:0}.section{break-inside:avoid}}
</style></head><body>
  <div class="header">
    <div class="header-left">
      <div class="brand">DASTA.GE</div>
      <h1>${data.title}</h1>
      <div style="font-size:13px;color:#666">${data.branchName}</div>
    </div>
    <div class="header-right">
      <div>პერიოდი: ${data.period}</div>
      <div>გენერირებულია: ${data.generatedAt}</div>
    </div>
  </div>
  ${sectionsHtml}
  ${tableHtml}
  <div class="footer">ეს ანგარიში გენერირებულია DASTA.GE სისტემით</div>
</body></html>`)
  w.document.close()
  setTimeout(() => { w.print(); w.close() }, 300)
}

function formatNum(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}
