
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Order, Client, SystemSettings } from './types';

export const generatePDF = (type: 'PEDIDO' | 'OS', order: Order, action: 'save' | 'print' = 'save', showValues: boolean = true) => {
  const doc = new jsPDF();
  const settingsStr = localStorage.getItem('quickprint_settings');
  
  const settings: SystemSettings = settingsStr ? JSON.parse(settingsStr) : {
    companyName: 'QUICKPRINT PRO',
    companyTagline: 'Soluções Gráficas',
    cnpj: '00.000.000/0001-00',
    address: 'Endereço da Empresa',
    phone: '(00) 00000-0000',
    email: 'contato@empresa.com',
    website: 'www.quickprint.com.br',
    pixKey: '62.287.343/0001-36',
    pdfIntroText: 'Este texto irá aparecer no início da proposta enviada para o cliente, caso não queira inserir uma introdução basta deixar este espaço em branco.',
    primaryColor: '#2563eb',
    estimateValidityDays: 7,
    defaultFooterNote: 'Agradecemos a sua preferência!',
    accounts: [],
    paymentMethods: []
  };

  const clientsStr = localStorage.getItem('quickprint_clients');
  const clients: Client[] = clientsStr ? JSON.parse(clientsStr) : [];
  const client = clients.find(c => c.id === order.clientId);

  const margin = 15;
  let currentY = 20;

  // --- CABEÇALHO ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(settings.companyName.toUpperCase(), margin, currentY);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text(settings.address, margin, currentY + 5);
  doc.text(`Tel: ${settings.phone}`, margin, currentY + 9);

  // Lado Direito do Cabeçalho
  const rightAlignX = 195;
  doc.text(`Email: ${settings.email}`, rightAlignX, currentY + 5, { align: 'right' });
  doc.text(`CNPJ: ${settings.cnpj}`, rightAlignX, currentY + 9, { align: 'right' });
  doc.text(`PIX: ${settings.pixKey}`, rightAlignX, currentY + 13, { align: 'right' });

  currentY += 22;

  // --- BARRA DE TÍTULO (CINZA CLARO) ---
  doc.setFillColor(242, 242, 242);
  doc.rect(margin, currentY, 180, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  
  const docTitle = type === 'PEDIDO' ? `PEDIDO Nº ${order.orderNumber}` : `ORDEM DE SERVIÇO (PRODUÇÃO) Nº ${order.orderNumber}`;
  doc.text(docTitle, 105, currentY + 5.5, { align: 'center' });
  doc.text(new Date(order.date + 'T12:00:00').toLocaleDateString('pt-BR'), rightAlignX - 5, currentY + 5.5, { align: 'right' });

  currentY += 12;

  // Texto Introdutório Dinâmico (Apenas no Pedido)
  if (type === 'PEDIDO' && settings.pdfIntroText) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(80, 80, 80);
    const splitIntro = doc.splitTextToSize(settings.pdfIntroText, 180);
    doc.text(splitIntro, margin, currentY);
    currentY += (splitIntro.length * 4) + 4;
  }

  // --- DADOS DO CLIENTE ---
  doc.setFillColor(242, 242, 242);
  doc.rect(margin, currentY, 180, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text("DADOS DO CLIENTE", margin + 2, currentY + 4.5);
  currentY += 6;

  const clientData = [
    [{ content: 'Cliente:', styles: { fontStyle: 'bold', cellWidth: 20 } }, order.clientName, { content: 'CNPJ/CPF:', styles: { fontStyle: 'bold', cellWidth: 25 } }, client?.document || ""],
    [{ content: 'Endereço:', styles: { fontStyle: 'bold' } }, client?.address || "", { content: 'CEP:', styles: { fontStyle: 'bold' } }, ""],
    [{ content: 'Cidade:', styles: { fontStyle: 'bold' } }, client?.city || "São Paulo", { content: 'Estado:', styles: { fontStyle: 'bold' } }, "SP"],
    [{ content: 'Telefone:', styles: { fontStyle: 'bold' } }, client?.phone || "", { content: 'E-mail:', styles: { fontStyle: 'bold' } }, client?.email || ""]
  ];

  autoTable(doc, {
    body: clientData as any,
    startY: currentY,
    theme: 'grid',
    styles: { 
      fontSize: 8, 
      cellPadding: 1.5, 
      lineColor: [220, 220, 220],
      lineWidth: 0.05
    },
    margin: { left: margin, right: margin },
  });

  currentY = (doc as any).lastAutoTable.finalY + 8;

  // --- PRODUTOS / SERVIÇOS ---
  doc.setFillColor(242, 242, 242);
  doc.rect(margin, currentY, 180, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.text("PRODUTOS / SERVIÇOS", margin + 2, currentY + 4.5);
  currentY += 6;

  let tableHeaders = ["ITEM", "NOME", "QTD."];
  if (showValues) {
    tableHeaders.push("VR. UNIT.", "SUB TOTAL");
  } else {
    tableHeaders.push("OBSERVAÇÕES TÉCNICAS");
  }

  const itemRows = (order.items || []).map((item, idx) => {
    const row = [(idx + 1).toString(), item.serviceName, item.quantity.toString()];
    if (showValues) {
      row.push(item.price.toFixed(2), (item.price * item.quantity).toFixed(2));
    } else {
      row.push(item.observations || "-");
    }
    return row;
  });

  autoTable(doc, {
    head: [tableHeaders],
    body: itemRows,
    startY: currentY,
    theme: 'grid',
    headStyles: { 
      fillColor: [255, 255, 255], 
      textColor: [0, 0, 0], 
      fontStyle: 'bold', 
      lineWidth: 0.05, 
      lineColor: [220, 220, 220] 
    },
    styles: { 
      fontSize: 8, 
      cellPadding: 2, 
      lineColor: [220, 220, 220],
      lineWidth: 0.05
    },
    columnStyles: {
      0: { cellWidth: 15, halign: 'center' },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 20, halign: 'center' },
      3: { cellWidth: showValues ? 25 : 60, halign: showValues ? 'right' : 'left' },
      4: { cellWidth: 25, halign: 'right' },
    }
  });

  currentY = (doc as any).lastAutoTable.finalY;

  if (showValues && type === 'PEDIDO') {
    // Linha de Total no Pedido
    doc.setFillColor(242, 242, 242);
    doc.rect(margin, currentY, 180, 6, 'F');
    doc.setFont('helvetica', 'bold');
    doc.text(`TOTAL DO PEDIDO: R$ ${order.total.toFixed(2)}`, rightAlignX - 2, currentY + 4.5, { align: 'right' });
    currentY += 12;

    // --- DADOS DO PAGAMENTO ---
    doc.setFillColor(242, 242, 242);
    doc.rect(margin, currentY, 180, 6, 'F');
    doc.text("DADOS DO PAGAMENTO", margin + 2, currentY + 4.5);
    currentY += 6;

    const paymentRows = [
      [
        new Date(order.date + 'T12:00:00').toLocaleDateString('pt-BR'),
        order.total.toFixed(2),
        order.entryMethod || "PIX",
        order.entry > 0 ? `Sinal de R$ ${order.entry.toFixed(2)} recebido.` : "Aguardando pagamento"
      ]
    ];

    autoTable(doc, {
      head: [["VENCIMENTO", "VALOR", "FORMA DE PAGAMENTO", "OBSERVAÇÃO"]],
      body: paymentRows,
      startY: currentY,
      theme: 'grid',
      headStyles: { 
        fillColor: [255, 255, 255], 
        textColor: [0, 0, 0], 
        fontStyle: 'bold', 
        lineWidth: 0.05, 
        lineColor: [220, 220, 220] 
      },
      styles: { 
        fontSize: 8, 
        lineColor: [220, 220, 220],
        lineWidth: 0.05
      }
    });
    
    currentY = (doc as any).lastAutoTable.finalY + 8;

    // --- SEÇÃO DE OBSERVAÇÕES ---
    doc.setFillColor(242, 242, 242);
    doc.rect(margin, currentY, 180, 6, 'F');
    doc.setFont('helvetica', 'bold');
    doc.text("Observações", margin + 2, currentY + 4.5);
    currentY += 20;

    // --- ASSINATURA (Apenas no Pedido) ---
    const signatureY = 270;
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.3);
    doc.line(55, signatureY, 155, signatureY);
    doc.setFontSize(8);
    doc.setTextColor(0, 0, 0);
    doc.text("Assinatura do cliente", 105, signatureY + 5, { align: 'center' });
  } 

  // RODAPÉ DINÂMICO
  const footerY = 285;
  doc.setFontSize(7);
  doc.setTextColor(150, 150, 150);
  doc.text(settings.defaultFooterNote, 105, footerY, { align: 'center' });

  // EXECUÇÃO
  if (action === 'print') {
    doc.autoPrint();
    window.open(doc.output('bloburl'), '_blank');
  } else {
    const fileName = showValues ? `PEDIDO_${order.orderNumber}.pdf` : `OS_PROD_${order.orderNumber}.pdf`;
    doc.save(fileName);
  }
};
