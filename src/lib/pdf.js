export async function generatePDF(devo) {
  const { jsPDF } = await import('jspdf')

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageW = doc.internal.pageSize.getWidth()
  const margin = 20
  const maxW = pageW - margin * 2
  let y = 0

  function checkPage(needed = 20) {
    if (y + needed > 275) { doc.addPage(); y = 20 }
  }

  function cleanText(text) {
    if (!text) return ''
    return text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/_(.*?)_/g, '$1')
      .replace(/#{1,6}\s/g, '')
      .replace(/`(.*?)`/g, '$1')
      .trim()
  }

  function addPara(text, colorR, colorG, colorB, size, lineH, italic) {
    text = cleanText(text)
    if (!text) return
    doc.setTextColor(colorR, colorG, colorB)
    doc.setFontSize(size || 10.5)
    doc.setFont(undefined, italic ? 'italic' : 'normal')
    const lines = doc.splitTextToSize(text, maxW)
    checkPage(lines.length * (lineH || 6) + 4)
    doc.text(lines, margin, y)
    doc.setFont(undefined, 'normal')
    y += lines.length * (lineH || 6) + 3
  }

  // ── HEADER ──
  doc.setFillColor(15, 30, 46)
  doc.rect(0, 0, pageW, 22, 'F')

  // Tentar carregar logo, fallback para texto
  try {
    const logoUrl = window.location.origin + '/logo-manna.png'
    const img = await new Promise((resolve, reject) => {
      const i = new Image()
      i.crossOrigin = 'anonymous'
      i.onload = () => resolve(i)
      i.onerror = reject
      i.src = logoUrl
    })
    const canvas = document.createElement('canvas')
    canvas.width = img.width
    canvas.height = img.height
    const ctx = canvas.getContext('2d')
    ctx.drawImage(img, 0, 0)
    const imgData = canvas.toDataURL('image/png')
    // Logo proporcional — altura 12mm
    const logoH = 10
    const logoW = (img.width / img.height) * logoH
    doc.addImage(imgData, 'PNG', margin, 6, logoW, logoH)
  } catch {
    // Fallback texto
    doc.setTextColor(201, 168, 76)
    doc.setFontSize(16)
    doc.setFont(undefined, 'bold')
    doc.text('Manna', margin, 14)
    doc.setFont(undefined, 'normal')
    doc.setFontSize(8)
    doc.setTextColor(160, 160, 160)
    doc.text('Devocional Personalizado', margin + 22, 14)
  }

  y = 30

  // ── META — apenas data, sem estado emocional ──
  doc.setFontSize(8)
  doc.setTextColor(150, 150, 150)
  const dateStr = new Date(devo.date).toLocaleDateString('pt-BR', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })
  doc.text(dateStr.charAt(0).toUpperCase() + dateStr.slice(1), margin, y)
  y += 6

  // ── DIVIDER ──
  doc.setDrawColor(201, 168, 76)
  doc.setLineWidth(0.3)
  doc.line(margin, y, pageW - margin, y)
  y += 8

  // ── GREETING ──
  doc.setTextColor(201, 168, 76)
  doc.setFontSize(11)
  doc.setFont(undefined, 'italic')
  const greeting = `${devo.firstName}, esta é a palavra de Deus para você hoje.`
  const gLines = doc.splitTextToSize(greeting, maxW)
  doc.text(gLines, margin, y)
  doc.setFont(undefined, 'normal')
  y += gLines.length * 6 + 6

  // ── ABERTURA ──
  if (devo.abertura) {
    let abertura = cleanText(devo.abertura)
    const greetingPattern = new RegExp(devo.firstName + ',?\\s*esta [eé] a palavra de Deus para voc[eê] hoje\\.?\\s*', 'i')
    abertura = abertura.replace(greetingPattern, '').trim()
    if (abertura) {
      addPara(abertura, 50, 50, 50, 10.5, 6)
      y += 1
    }
  }

  // ── VERSÍCULO ──
  if (devo.versiculo) {
    checkPage(40)
    const vText = `"${cleanText(devo.versiculo)}"`
    doc.setFontSize(10.5)
    doc.setFont(undefined, 'italic')
    const vLines = doc.splitTextToSize(vText, maxW - 10)
    const boxH = vLines.length * 6 + 14
    doc.setFillColor(248, 244, 232)
    doc.roundedRect(margin, y, maxW, boxH, 2, 2, 'F')
    doc.setDrawColor(201, 168, 76)
    doc.setLineWidth(2)
    doc.line(margin, y, margin, y + boxH)
    doc.setLineWidth(0.3)
    doc.setTextColor(100, 70, 20)
    doc.text(vLines, margin + 8, y + 7)
    doc.setFont(undefined, 'normal')
    y += boxH + 3
    if (devo.referencia) {
      doc.setFontSize(8)
      doc.setTextColor(160, 110, 30)
      doc.text(cleanText(devo.referencia).toUpperCase(), margin + 8, y)
      y += 7
    }
    y += 3
  }

  // ── REFLEXÃO ──
  if (devo.reflexao) {
    const paras = cleanText(devo.reflexao).split(/\n\n+/)
    for (const para of paras) {
      if (para.trim()) {
        addPara(para.trim(), 45, 45, 45, 10.5, 6)
      }
    }
    y += 2
  }

  // ── ORAÇÃO ──
  if (devo.oracao) {
    checkPage(45)
    doc.setFontSize(7.5)
    doc.setTextColor(130, 90, 180)
    doc.setFont(undefined, 'bold')
    doc.text('ORAÇÃO', margin, y)
    doc.setFont(undefined, 'normal')
    y += 5
    const oText = cleanText(devo.oracao)
    doc.setFontSize(10.5)
    doc.setFont(undefined, 'italic')
    const oLines = doc.splitTextToSize(oText, maxW - 6)
    const oBoxH = oLines.length * 6 + 12
    doc.setFillColor(232, 236, 248)
    doc.roundedRect(margin, y, maxW, oBoxH, 2, 2, 'F')
    doc.setTextColor(50, 50, 80)
    doc.text(oLines, margin + 6, y + 7)
    doc.setFont(undefined, 'normal')
    y += oBoxH + 6
  }

  // ── FOOTER ──
  const totalPages = doc.internal.getNumberOfPages()
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p)
    const fY = 287
    doc.setDrawColor(201, 168, 76)
    doc.setLineWidth(0.3)
    doc.line(margin, fY - 5, pageW - margin, fY - 5)
    doc.setFontSize(7.5)
    doc.setTextColor(150, 150, 150)
    doc.text('Quer saber mais sobre como ser assinante do Manna?', pageW / 2, fY - 1, { align: 'center' })
    doc.setTextColor(201, 168, 76)
    doc.text('www.academiaporvoce.com/manna01', pageW / 2, fY + 4, { align: 'center' })
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
        text: 'Recebi este devocional personalizado. Que Deus abençoe você também! Conheça o Manna: www.academiaporvoce.com/manna01'
      })
      return
    } catch { /* fallthrough */ }
  }

  window.open(URL.createObjectURL(blob), '_blank')
}
