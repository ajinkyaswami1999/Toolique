import { useState } from 'react';
import { FileText, Upload, Download, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { jsPDF } from 'jspdf';
import JSZip from 'jszip';

export default function WordToPDF() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [outputBlob, setOutputBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile && (uploadedFile.name.endsWith('.docx') || uploadedFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
      setError(null);
      setFile(uploadedFile);
      setOutputBlob(null);
    } else {
      setError('Please select a valid Word document (.docx). Older .doc files are not supported.');
    }
  };

  const handleConvert = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const zip = await JSZip.loadAsync(arrayBuffer);
      const docXmlFile = zip.file('word/document.xml');
      
      if (!docXmlFile) {
        throw new Error('Invalid DOCX structure. Could not find word/document.xml');
      }

      const xmlText = await docXmlFile.async('text');
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, 'application/xml');
      
      // Extract all paragraphs (<w:p>)
      const paragraphs = xmlDoc.getElementsByTagName('w:p');
      const paragraphTexts: string[] = [];

      for (let i = 0; i < paragraphs.length; i++) {
        const p = paragraphs[i];
        // Extract all text elements (<w:t>) inside this paragraph
        const textElements = p.getElementsByTagName('w:t');
        let text = '';
        for (let j = 0; j < textElements.length; j++) {
          text += textElements[j].textContent || '';
        }
        paragraphTexts.push(text);
      }

      // Generate PDF using jsPDF
      const doc = new jsPDF({
        orientation: 'p',
        unit: 'pt',
        format: 'a4',
      });

      const margin = 54; // 0.75 inch margins
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const maxLineWidth = pageWidth - margin * 2;
      
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(11);
      
      let cursorY = margin;
      const lineHeight = 16;

      for (const pText of paragraphTexts) {
        // Skip empty paragraphs (simple spacing)
        if (!pText.trim()) {
          cursorY += lineHeight / 2;
          continue;
        }

        // Split text to fit the page width
        const lines: string[] = doc.splitTextToSize(pText, maxLineWidth);

        for (const line of lines) {
          if (cursorY + lineHeight > pageHeight - margin) {
            doc.addPage();
            cursorY = margin;
          }
          doc.text(line, margin, cursorY);
          cursorY += lineHeight;
        }
        
        // Add paragraph spacing
        cursorY += lineHeight / 2;
      }

      const pdfBlob = doc.output('blob');
      setOutputBlob(pdfBlob);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred during Word document conversion. Ensure it is a valid .docx file.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!outputBlob || !file) return;
    const url = URL.createObjectURL(outputBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${file.name.replace('.docx', '')}.pdf`;
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
          <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-4">Select Word Document</h3>
          
          {!file ? (
            <div className="relative border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 text-center hover:border-indigo-500/50 dark:hover:border-indigo-400/50 transition-colors">
              <input
                type="file"
                accept=".docx"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Upload className="w-10 h-10 mx-auto text-zinc-400 dark:text-zinc-650 mb-3" />
              <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Click to upload or drag & drop DOCX</p>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">Supports Microsoft Word documents (.docx)</p>
            </div>
          ) : (
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg shrink-0">
                  <FileText className="w-4.5 h-4.5" />
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
                <span>Converting document...</span>
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
