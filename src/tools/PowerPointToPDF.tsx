import { useState } from 'react';
import { Upload, Download, CheckCircle2, AlertCircle, Loader2, Presentation } from 'lucide-react';
import { jsPDF } from 'jspdf';
import JSZip from 'jszip';

export default function PowerPointToPDF() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressText, setProgressText] = useState<string>('');
  const [outputBlob, setOutputBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile && (uploadedFile.name.endsWith('.pptx') || uploadedFile.type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation')) {
      setError(null);
      setFile(uploadedFile);
      setOutputBlob(null);
    } else {
      setError('Please select a valid PowerPoint presentation (.pptx). Older .ppt files are not supported.');
    }
  };

  const handleConvert = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);
    setProgressText('Extracting slides...');

    try {
      const arrayBuffer = await file.arrayBuffer();
      const zip = await JSZip.loadAsync(arrayBuffer);
      
      // Find all slide files: ppt/slides/slide1.xml, slide2.xml...
      const slideFiles: { name: string; num: number; fileRef: any }[] = [];
      
      zip.forEach((relativePath, fileRef) => {
        if (relativePath.startsWith('ppt/slides/slide') && relativePath.endsWith('.xml')) {
          const match = relativePath.match(/slide(\d+)\.xml$/);
          if (match) {
            slideFiles.push({
              name: relativePath,
              num: parseInt(match[1], 10),
              fileRef: fileRef,
            });
          }
        }
      });

      if (slideFiles.length === 0) {
        throw new Error('Invalid PPTX structure. No slide files found.');
      }

      // Sort slides numerically
      slideFiles.sort((a, b) => a.num - b.num);

      const doc = new jsPDF({
        orientation: 'l', // Slide format landscape
        unit: 'pt',
        format: 'a4',
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 54;
      const maxLineWidth = pageWidth - margin * 2;
      const totalSlides = slideFiles.length;

      for (let i = 0; i < totalSlides; i++) {
        const slide = slideFiles[i];
        setProgressText(`Converting slide ${i + 1} of ${totalSlides}...`);

        const xmlText = await slide.fileRef.async('text');
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, 'application/xml');

        // Extract all text elements (<a:t>) inside this slide
        const textElements = xmlDoc.getElementsByTagName('a:t');
        const textLines: string[] = [];

        for (let j = 0; j < textElements.length; j++) {
          const txtVal = textElements[j].textContent;
          if (txtVal && txtVal.trim()) {
            textLines.push(txtVal.trim());
          }
        }

        if (i > 0) {
          doc.addPage();
        }

        // Render slide frame border
        doc.setDrawColor(230, 235, 240);
        doc.rect(20, 20, pageWidth - 40, pageHeight - 40);

        // Render slide heading (first text line if available)
        let cursorY = margin + 10;
        doc.setFont('Helvetica', 'bold');
        
        let slideTitle = `Slide ${i + 1}`;
        let startTextIdx = 0;
        
        if (textLines.length > 0 && textLines[0].length < 60) {
          slideTitle = textLines[0];
          startTextIdx = 1;
        }

        doc.setFontSize(18);
        doc.text(slideTitle, margin, cursorY);
        
        // Horizontal separation bar
        cursorY += 12;
        doc.setDrawColor(99, 102, 241); // indigo accent line
        doc.line(margin, cursorY, pageWidth - margin, cursorY);
        cursorY += 28;

        // Render remaining text blocks
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(11);
        const lineHeight = 18;

        for (let j = startTextIdx; j < textLines.length; j++) {
          const textBlock = textLines[j];
          const splitLines = doc.splitTextToSize(textBlock, maxLineWidth);

          for (const line of splitLines) {
            if (cursorY + lineHeight > pageHeight - margin - 20) {
              break; // Slide text overflow limit
            }
            doc.text(line, margin, cursorY);
            cursorY += lineHeight;
          }
          cursorY += lineHeight / 2; // block spacing
        }

        // Draw Slide number footer
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(8);
        doc.text(`Slide ${i + 1} of ${totalSlides}`, pageWidth - margin - 40, pageHeight - 35);
      }

      const pdfBlob = doc.output('blob');
      setOutputBlob(pdfBlob);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred during PowerPoint conversion. Ensure it is a valid .pptx file.');
    } finally {
      setIsProcessing(false);
      setProgressText('');
    }
  };

  const handleDownload = () => {
    if (!outputBlob || !file) return;
    const url = URL.createObjectURL(outputBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${file.name.replace('.pptx', '')}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 text-left">
      {/* File upload */}
      <div className="md:col-span-7 space-y-6">
        <div className="saas-card p-6">
          <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-4">Select PowerPoint Presentation</h3>
          
          {!file ? (
            <div className="relative border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 text-center hover:border-indigo-500/50 dark:hover:border-indigo-400/50 transition-colors">
              <input
                type="file"
                accept=".pptx"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Upload className="w-10 h-10 mx-auto text-zinc-400 dark:text-zinc-650 mb-3" />
              <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Click to upload or drag & drop PPTX</p>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">Supports PowerPoint slide decks (.pptx)</p>
            </div>
          ) : (
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-lg shrink-0">
                  <Presentation className="w-4.5 h-4.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate pr-4">{file.name}</p>
                  <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-semibold">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                onClick={() => { setFile(null); setOutputBlob(null); }}
                className="text-xs font-semibold text-red-500 hover:text-red-650 cursor-pointer"
              >
                Remove
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Control panel */}
      <div className="md:col-span-5 space-y-6">
        <div className="saas-card p-6 text-center space-y-4">
          <h3 className="text-base font-bold text-zinc-900 dark:text-white text-left">Actions</h3>

          <button
            onClick={handleConvert}
            disabled={!file || isProcessing}
            className="w-full saas-button-primary py-3 flex items-center justify-center gap-2 font-bold cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4.5 h-4.5 animate-spin" />
                <span className="truncate">{progressText || 'Converting presentation...'}</span>
              </>
            ) : (
              <span>Convert to PDF</span>
            )}
          </button>

          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex gap-2.5 text-left">
              <AlertCircle className="w-4.5 h-4.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {outputBlob && (
            <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/15 text-left space-y-4">
              <div className="flex items-center gap-2.5 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span className="text-xs font-bold">Conversion Complete!</span>
              </div>
              <button
                onClick={handleDownload}
                className="w-full py-2.5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 text-xs font-bold flex items-center justify-center gap-2 shadow-sm hover:bg-zinc-800 dark:hover:bg-zinc-100 transition cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF Document</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
