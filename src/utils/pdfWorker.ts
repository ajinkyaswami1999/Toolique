import * as pdfjs from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

if (typeof window !== 'undefined') {
  // Priority: bundled Vite asset -> public root worker -> jsdelivr CDN
  try {
    pdfjs.GlobalWorkerOptions.workerSrc =
      pdfWorker ||
      '/pdf.worker.min.mjs' ||
      `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version || '6.0.227'}/build/pdf.worker.min.mjs`;
  } catch (e) {
    console.warn('PDF worker setup warning:', e);
  }
}

export { pdfjs };
export default pdfjs;
