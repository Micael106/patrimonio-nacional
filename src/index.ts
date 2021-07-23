import { PDFDocument } from 'pdf-lib'
import template from '../assets/template'
import QRCode from 'qrcode'
import * as fs from 'fs'

async function run() {
  console.log("Iniciando...")
  const initial = 500
  const final = 510

  // Arquivo principal
  const pdfDoc = await PDFDocument.create()

  // Gerar o QR-Code
  await Promise.all(Array<Number>(10).fill(0).map((_, idx) => initial + idx + 1).map(async (id) => {
    // Carrega o template vazio
    const templatePdf = await PDFDocument.load(template)
    const idS = id.toString()
    const zeros = Array(8 - idS.length).fill(0).join("")
    const idSS = `${zeros}${idS}`
    templatePdf.getForm().getTextField("id").setText(idSS)
    templatePdf.save()
    // Gera o QRCode em formato DataURI (base64)
    // @ts-ignore
    const qrcodeBase64 = await QRCode.toBuffer(`https://patrimonio.nacionalserv.com/consulta?id=${id}`)
    const tempDoc = await PDFDocument.create()
    const qrcodePdfImg = await tempDoc.embedPng("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQYV2NgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII=")
    // Adiciona o qrcode ao template PDF
    //console.log("tamanho: ", templatePdf.getPages().length)
    const copiedPage = (await pdfDoc.copyPages(templatePdf, [0]))[0]
    copiedPage.drawImage(qrcodePdfImg, {
      height: copiedPage.getWidth() * 0.9, width: copiedPage.getWidth() * 0.9, x: copiedPage.getX()+5, y:  copiedPage.getY()+5
    })
    pdfDoc.addPage(copiedPage)
  }))

  const pdfFile = await pdfDoc.save()
  fs.appendFileSync("./result.pdf", Buffer.from(pdfFile))
}

run()