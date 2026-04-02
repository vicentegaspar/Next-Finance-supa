import jsPDF from 'jspdf'
import 'jspdf-autotable'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// We will use loosely typed data since it comes populated from the backend
type PopulatedTransaction = any // Expected to have categories(name, type) and accounts(name)

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

const formatDate = (dateString: string) => {
  const [year, month, day] = dateString.split('-')
  return `${day}/${month}/${year}`
}

export const generateCSV = (transactions: PopulatedTransaction[], filename: string) => {
  if (!transactions.length) return

  const headers = ['Data', 'Tipo', 'Descrição', 'Categoria', 'Conta', 'Valor (R$)']
  const rows = transactions.map((t) => [
    formatDate(t.date),
    t.type === 'income' ? 'Receita' : 'Despesa',
    t.description || '',
    t.categories?.name || 'Sem categoria',
    t.accounts?.name || 'Sem conta',
    t.type === 'income' ? t.amount : -t.amount,
  ])

  const csvContent = [
    headers.join(','),
    ...rows.map((e) => e.map(item => `"${String(item).replace(/"/g, '""')}"`).join(',')),
  ].join('\n')

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', `${filename}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export const generatePDF = (transactions: PopulatedTransaction[], periodStr: string, filename: string) => {
  if (!transactions.length) return

  const doc = new jsPDF()

  // Calculate totals by category
  let totalIncome = 0
  let totalExpense = 0
  const incomeCategories: Record<string, number> = {}
  const expenseCategories: Record<string, number> = {}

  transactions.forEach((t) => {
    const isIncome = t.type === 'income'
    const catName = t.categories?.name || 'Sem categoria'
    
    if (isIncome) {
      totalIncome += t.amount
      incomeCategories[catName] = (incomeCategories[catName] || 0) + t.amount
    } else {
      totalExpense += t.amount
      expenseCategories[catName] = (expenseCategories[catName] || 0) + t.amount
    }
  })

  const netBalance = totalIncome - totalExpense

  // Header Title
  doc.setFontSize(22)
  doc.setTextColor(33, 37, 41) // #212529
  doc.text('Clarix PFM - Balancete Financeiro', 14, 22)

  doc.setFontSize(11)
  doc.setTextColor(108, 117, 125) // #6c757d
  doc.text(`Período de Referência: ${periodStr}`, 14, 30)

  // Summary Section
  doc.setFontSize(14)
  doc.setTextColor(0, 0, 0)
  doc.text('Resumo do Período', 14, 45)

  const summaryData = [
    ['Total Receitas', formatCurrency(totalIncome)],
    ['Total Despesas', formatCurrency(totalExpense)],
    ['Saldo Líquido', formatCurrency(netBalance)],
  ]

  // @ts-ignore (jspdf-autotable adds autoTable to jsPDF)
  doc.autoTable({
    startY: 50,
    head: [['Indicador', 'Valor']],
    body: summaryData,
    theme: 'grid',
    headStyles: { fillColor: [44, 62, 80] },
    columnStyles: {
      0: { fontStyle: 'bold' },
      1: { halign: 'right' }
    }
  })

  // Income Breakdown Section
  let finalY = (doc as any).lastAutoTable.finalY + 15
  doc.setFontSize(14)
  doc.text('Detalhamento de Receitas', 14, finalY)

  const incomeItems = Object.entries(incomeCategories)
    .sort((a, b) => b[1] - a[1]) // sort by amount desc
    .map(([cat, amount]) => [cat, formatCurrency(amount)])

  if (incomeItems.length > 0) {
    // @ts-ignore
    doc.autoTable({
      startY: finalY + 5,
      head: [['Categoria', 'Total']],
      body: incomeItems,
      theme: 'striped',
      headStyles: { fillColor: [34, 197, 94] }, // Emerald 500
      columnStyles: { 1: { halign: 'right' } }
    })
    finalY = (doc as any).lastAutoTable.finalY
  } else {
    doc.setFontSize(10)
    doc.text('Não houve receitas no período.', 14, finalY + 8)
    finalY += 15
  }

  // Expense Breakdown Section
  finalY += 15
  doc.setFontSize(14)
  doc.text('Detalhamento de Despesas', 14, finalY)

  const expenseItems = Object.entries(expenseCategories)
    .sort((a, b) => b[1] - a[1]) // sort by amount desc
    .map(([cat, amount]) => [cat, formatCurrency(amount)])

  if (expenseItems.length > 0) {
    // @ts-ignore
    doc.autoTable({
      startY: finalY + 5,
      head: [['Categoria', 'Total']],
      body: expenseItems,
      theme: 'striped',
      headStyles: { fillColor: [239, 68, 68] }, // Red 500
      columnStyles: { 1: { halign: 'right' } }
    })
  } else {
    doc.setFontSize(10)
    doc.text('Não houve despesas no período.', 14, finalY + 8)
  }

  // Footer with Date
  const pageCount = (doc as any).internal.getNumberOfPages()
  doc.setFontSize(8)
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.text(
      `Gerado em ${format(new Date(), "dd/MM/yyyy 'às' HH:mm")}`,
      14,
      doc.internal.pageSize.height - 10
    )
    const str = `Página ${i} de ${pageCount}`
    doc.text(str, doc.internal.pageSize.width - 14 - doc.getTextWidth(str), doc.internal.pageSize.height - 10)
  }

  doc.save(`${filename}.pdf`)
}
