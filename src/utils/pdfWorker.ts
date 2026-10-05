import * as pdfjs from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

if (typeof window !== 'undefined') {
  // Use Vite bundled asset URL with fallback to local public root worker
  pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker || '/pdf.worker.min.mjs';
}

export { pdfjs };
export default pdfjs;
