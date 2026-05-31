export async function generatePDF(devo) {
  const { jsPDF } = await import('jspdf')

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageW = doc.internal.pageSize.getWidth()
  const margin = 18
  const maxW = pageW - margin * 2
  let y = 0

  function checkPage(needed = 20) {
    if (y + needed > 272) { doc.addPage(); y = 16 }
  }

  function addText(text, color, size = 10.5, lineH = 6) {
    doc.setTextColor(...color)
    doc.setFontSize(size)
    const lines = doc.splitTextToSize(text, maxW)
    checkPage(lines.length * lineH + 4)
    doc.text(lines, margin, y)
    y += lines.length * lineH + 6
  }

  // Header
  doc.setFillColor(15, 30, 46)
  doc.rect(0, 0, pageW, 28, 'F')
  doc.setTextColor(201, 168, 76)
  doc.setFontSize(20)
  doc.setFont(undefined, 'bold')
  doc.text('Manna', margin, 17)
  doc.setFont(undefined, 'normal')
  doc.setFontSize(9)
  doc.setTextColor(180, 180, 180)
  doc.text('Devocional Personalizado', margin + 24, 17)
  y = 36

  // Meta
  doc.setFontSize(8.5)
  doc.setTextColor(140, 140, 140)
  const dateStr = new Date(devo.date).toLocaleDateString('pt-BR', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })
  doc.text(dateStr.charAt(0).toUpperCase() + dateStr.slice(1), margin, y)
  if (devo.emotion) {
    const tag = devo.emotion + (devo.cause ? ' · ' + devo.cause : '')
    doc.text(tag, pageW - margin, y, { align: 'right' })
  }
  y += 10

  // Divider
  doc.setDrawColor(201, 168, 76)
  doc.setLineWidth(0.4)
  doc.line(margin, y, pageW - margin, y)
  y += 10

  // Greeting
  doc.setTextColor(201, 168, 76)
  doc.setFontSize(11.5)
  doc.setFont(undefined, 'italic')
  const greeting = `${devo.firstName}, esta é a palavra de Deus para você hoje.`
  const gLines = doc.splitTextToSize(greeting, maxW)
  doc.text(gLines, margin, y)
  doc.setFont(undefined, 'normal')
  y += gLines.length * 6.5 + 10

  // Abertura
  if (devo.abertura) {
    addText(devo.abertura, [50, 50, 50], 10.5, 6)
    y += 4
  }

  // Versículo
  if (devo.versiculo) {
    checkPage(50)
    const vText = `"${devo.versiculo}"`
    doc.setFontSize(10.5)
    doc.setFont(undefined, 'italic')
    const vLines = doc.splitTextToSize(vText, maxW - 12)
    const boxH = vLines.length * 6 + 16
    doc.setFillColor(248, 244, 232)
    doc.roundedRect(margin, y, maxW, boxH, 2, 2, 'F')
    doc.setDrawColor(201, 168, 76)
    doc.setLineWidth(2)
    doc.line(margin, y, margin, y + boxH)
    doc.setLineWidth(0.3)
    doc.setTextColor(100, 70, 20)
    doc.text(vLines, margin + 8, y + 8)
    doc.setFont(undefined, 'normal')
    y += boxH + 4
    if (devo.referencia) {
      doc.setFontSize(8.5)
      doc.setTextColor(160, 110, 30)
      doc.text(devo.referencia.toUpperCase(), margin + 8, y)
      y += 10
    }
    y += 4
  }

  // Reflexão
  if (devo.reflexao) {
    const paras = devo.reflexao.split(/\n\n+/)
    for (const para of paras) {
      if (para.trim()) {
        addText(para.trim(), [45, 45, 45], 10.5, 6)
        y += 2
      }
    }
    y += 4
  }

  // Oração
  if (devo.oracao) {
    checkPage(50)
    doc.setFontSize(8)
    doc.setTextColor(150, 110, 200)
    doc.setFont(undefined, 'bold')
    doc.text('ORAÇÃO', margin, y)
    doc.setFont(undefined, 'normal')
    y += 7
    doc.setFontSize(10.5)
    doc.setFont(undefined, 'italic')
    const oLines = doc.splitTextToSize(devo.oracao, maxW - 8)
    const oBoxH = oLines.length * 6 + 14
    doc.setFillColor(232, 236, 248)
    doc.roundedRect(margin, y, maxW, oBoxH, 2, 2, 'F')
    doc.setTextColor(50, 50, 80)
    doc.text(oLines, margin + 6, y + 8)
    doc.setFont(undefined, 'normal')
    y += oBoxH + 8
  }

  // Footer
  const totalPages = doc.internal.getNumberOfPages()
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p)
    const fY = 287
    doc.setDrawColor(201, 168, 76)
    doc.setLineWidth(0.3)
    doc.line(margin, fY - 4, pageW - margin, fY - 4)
    doc.setFontSize(8.5)
    doc.setTextColor(201, 168, 76)
    doc.setFont(undefined, 'normal')
    doc.text('Conheça o Manna — appmanna.com', pageW / 2, fY + 1, { align: 'center' })
  }

  return doc.output('blob')
}

export async function shareOrDownloadPDF(devo) {
  const blob = await generatePDF(devo)
  const file = new File([blob], 'manna-devocional.pdf', { type: 'application/pdf' })

  if (navigator.share && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: 'Devocional Manna',
        text: 'Recebi este devocional personalizado. Que Deus abençoe você também! Conheça o Manna: appmanna.com'
      })
      return
    } catch {
      // fallthrough
    }
  }

  window.open(URL.createObjectURL(blob), '_blank')
}
