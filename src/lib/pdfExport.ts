import { jsPDF } from "jspdf";
import { ScriptBlock, ScriptMetadata } from "../types";

export function exportToPDF(metadata: ScriptMetadata, blocks: ScriptBlock[]) {
  // Screenplay format standard:
  // Courier 12pt
  // 1 inch = 72 points
  // Page size: US Letter (8.5 x 11 inches) -> 612 x 792 points
  // Margins:
  // Top: 1"
  // Bottom: 1"
  // Left: 1.5"
  // Right: 1"
  
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "in",
    format: "letter"
  });

  doc.setFont("courier", "normal");
  doc.setFontSize(12);

  const PAGE_HEIGHT = 11;
  const TOP_MARGIN = 1;
  const BOTTOM_MARGIN = 1;
  
  let currentY = TOP_MARGIN;
  let currentPage = 1; // 1 is the first script page

  const drawWatermark = () => {
    if (metadata.watermark) {
      doc.setFont("courier", "normal");
      doc.setFontSize(60);
      doc.setTextColor(240, 240, 240); // slightly lighter
      doc.text(metadata.watermark.toUpperCase(), 4.25, 5.5, { align: 'center', angle: 45 });
      doc.setTextColor(0, 0, 0); // reset
      doc.setFontSize(12);
    }
  };

  const addNewPage = () => {
    doc.addPage();
    currentPage++;
    currentY = TOP_MARGIN;
    
    // Add page number in top right corner for script pages 2 and beyond
    if (currentPage > 1) {
      doc.setFont("courier", "normal");
      doc.setFontSize(12);
      // Place page number at exactly 7.5 inches from left (1 inch from right on 8.5" width)
      doc.text(`${currentPage}.`, 7.2, 0.5);
    }
    
    drawWatermark();
  };

  // Title Page
  if (metadata.title) {
    // Add watermark to title page FIRST so it's behind text
    if (metadata.watermark) {
      doc.setFontSize(60);
      doc.setTextColor(240, 240, 240); // make it very light
      doc.text(metadata.watermark.toUpperCase(), 4.25, 5.5, { align: 'center', angle: 45 });
      doc.setTextColor(0, 0, 0); // reset
      doc.setFontSize(12);
    }

    if (metadata.coverImage) {
      try {
        // Simple center logic: 3x3 inches.
        doc.addImage(metadata.coverImage, 'JPEG', 2.75, 1, 3, 3);
      } catch (e) {
        console.error("Failed to add cover image to PDF", e);
      }
    }

    doc.setFont("courier", "normal");
    
    // Vertically center title
    doc.text(metadata.title.toUpperCase(), 4.25, 4, { align: 'center' });
    
    if (metadata.basedOn) {
      doc.text("based on", 4.25, 4.4, { align: 'center' });
      doc.text(metadata.basedOn, 4.25, 4.6, { align: 'center' });
    }

    if (metadata.author) {
      doc.text("written by", 4.25, 5.0, { align: 'center' });
      doc.text(metadata.author, 4.25, 5.2, { align: 'center' });
    }

    if (metadata.revisions) {
      doc.text("Revisions:", 7.5, 8.5, { align: 'right' });
      const revLines = metadata.revisions.split('\n');
      revLines.forEach((l, i) => {
        doc.text(l, 7.5, 8.7 + (i * 0.2), { align: 'right' });
      });
    }

    if (metadata.draftNumber) {
      doc.text(`Draft: ${metadata.draftNumber}`, 7.5, 8.1, { align: 'right' });
    }

    if (metadata.draftDate) {
      doc.text(metadata.draftDate, 7.5, 8.3, { align: 'right' });
    }

    if (metadata.contact) {
      const contactLines = metadata.contact.split('\n');
      let contactY = 9;
      contactLines.forEach(line => {
        doc.text(line, 1.5, contactY);
        contactY += 0.2;
      });
    }

    doc.addPage(); // Add the first script page without triggering addNewPage logic yet
    currentY = TOP_MARGIN;
    // currentPage remains 1
    drawWatermark();
  } else {
    // If no title page, draw watermark on the very first page
    drawWatermark();
  }

  const getLeftMargin = (type: string) => {
    switch (type) {
      case 'scene': return 1.5;
      case 'action': return 1.5;
      case 'character': return 3.7;
      case 'dialogue': return 2.5;
      case 'parenthetical': return 3.1;
      case 'transition': return 5.5;
      case 'shot': return 1.5;
      default: return 1.5;
    }
  };

  const getWidth = (type: string) => {
    switch (type) {
      case 'scene': return 6.0;
      case 'action': return 6.0;
      case 'character': return 3.8;
      case 'dialogue': return 3.5;
      case 'parenthetical': return 2.0;
      case 'transition': return 2.0;
      case 'shot': return 6.0;
      default: return 6.0;
    }
  };

  let sceneNumber = 1;
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    
    // Add space before certain blocks
    if (block.type === 'scene' || block.type === 'transition' || block.type === 'shot') {
      if (currentY > TOP_MARGIN) {
         currentY += 0.17; // Roughly 1 blank line
      }
    }
    
    if (block.type === 'character' && i > 0 && blocks[i-1].type !== 'scene') {
       if (currentY > TOP_MARGIN) {
         currentY += 0.17;
       }
    }

    const margin = getLeftMargin(block.type);
    const maxWidth = getWidth(block.type);
    
    let text = block.content;
    if (block.type === 'scene' || block.type === 'transition' || block.type === 'shot' || block.type === 'character') {
      text = text.toUpperCase();
    }

    const splitText = doc.splitTextToSize(text, maxWidth);
    
    // Check if we need a new page
    if (currentY + (splitText.length * 0.17) > PAGE_HEIGHT - BOTTOM_MARGIN) {
      addNewPage();
    }

    // Draw the text
    if (block.type === 'transition') {
      doc.text(splitText, 7.5, currentY, { align: 'right' });
    } else {
      doc.text(splitText, margin, currentY, { align: 'left' });
    }

    if (block.type === 'scene') {
      doc.text(`${sceneNumber}`, 1.0, currentY, { align: 'left' });
      doc.text(`${sceneNumber}`, 7.5, currentY, { align: 'right' });
      sceneNumber++;
    }
    currentY += (splitText.length * 0.17);
    
    if (block.type === 'scene' || block.type === 'action' || block.type === 'transition' || block.type === 'shot') {
       // add empty line after action/scene
       if (i < blocks.length - 1 && blocks[i+1].type !== 'dialogue') {
         currentY += 0.17;
       }
    }
  }

  const versionStr = metadata.version ? `_v${metadata.version}` : '';
  doc.save(`${metadata.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'screenplay'}${versionStr}.pdf`);
}
