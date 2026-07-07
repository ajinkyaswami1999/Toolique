import { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Download, Monitor, Tablet, Phone, Sparkles } from 'lucide-react';

export default function HTMLPlayground() {
  const [htmlCode, setHtmlCode] = useState('<div class="card">\n  <h1>Welcome to Toolique</h1>\n  <p>Edit this HTML/CSS sandbox and view live previews below.</p>\n  <button class="btn">Explore Academy</button>\n</div>');
  const [cssCode, setCssCode] = useState('body {\n  font-family: system-ui, sans-serif;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  min-height: 90vh;\n  margin: 0;\n  background: linear-gradient(135deg, #4f46e5, #06b6d4);\n}\n.card {\n  background: rgba(255, 255, 255, 0.95);\n  padding: 2.5rem;\n  border-radius: 20px;\n  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);\n  text-align: center;\n  max-width: 320px;\n}\nh1 {\n  color: #1e1b4b;\n  margin-top: 0;\n  font-size: 1.5rem;\n}\np {\n  color: #4b5563;\n  font-size: 0.875rem;\n  line-height: 1.5;\n}\n.btn {\n  background: #4f46e5;\n  color: white;\n  border: none;\n  padding: 0.75rem 1.5rem;\n  border-radius: 10px;\n  font-weight: 700;\n  cursor: pointer;\n  transition: 0.2s;\n}\n.btn:hover {\n  background: #4338ca;\n}');
  
  const [iframeSrcDoc, setIframeSrcDoc] = useState('');
  const [previewWidth, setPreviewWidth] = useState<'100%' | '768px' | '375px'>('100%');

  // Trigger preview compilation
  const handleCompile = () => {
    const combined = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>${cssCode}</style>
        </head>
        <body>
          ${htmlCode}
        </body>
      </html>
    `;
    setIframeSrcDoc(combined);
  };

  // Compile automatically on start
  useEffect(() => {
    handleCompile();
  }, []);

  const handleDownload = () => {
    const combined = `<!DOCTYPE html><html><head><style>${cssCode}</style></head><body>${htmlCode}</body></html>`;
    const blob = new Blob([combined], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'toolique-visualizer-project.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200/50 dark:border-zinc-800/50 pb-4">
        <div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-indigo-500" /> HTML & CSS Sandbox
          </h3>
          <p className="text-[11px] text-zinc-500 mt-0.5">Edit markup and styles with real-time responsive browser rendering.</p>
        </div>

        {/* View Width Resizers */}
        <div className="flex items-center gap-2">
          <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl">
            <button
              onClick={() => setPreviewWidth('100%')}
              className={`p-1.5 rounded-lg transition cursor-pointer ${previewWidth === '100%' ? 'bg-indigo-600 text-white' : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'}`}
              title="Desktop View"
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPreviewWidth('768px')}
              className={`p-1.5 rounded-lg transition cursor-pointer ${previewWidth === '768px' ? 'bg-indigo-600 text-white' : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'}`}
              title="Tablet View"
            >
              <Tablet className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPreviewWidth('375px')}
              className={`p-1.5 rounded-lg transition cursor-pointer ${previewWidth === '375px' ? 'bg-indigo-600 text-white' : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'}`}
              title="Mobile View"
            >
              <Phone className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleDownload}
            className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900 cursor-pointer"
            title="Download Single Index HTML File"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={handleCompile}
            className="saas-button-primary py-2 px-4 text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-white" /> Compile Preview
          </button>
        </div>
      </div>

      {/* Editor Split Windows */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase">index.html</span>
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-850 overflow-hidden shadow-sm">
            <Editor
              height="200px"
              language="html"
              value={htmlCode}
              onChange={(val: string | undefined) => setHtmlCode(val || '')}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 11,
                fontFamily: 'Fira Code, monospace',
                automaticLayout: true,
                scrollBeyondLastLine: false,
                padding: { top: 6, bottom: 6 }
              }}
            />
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-550 uppercase">style.css</span>
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-850 overflow-hidden shadow-sm">
            <Editor
              height="200px"
              language="css"
              value={cssCode}
              onChange={(val: string | undefined) => setCssCode(val || '')}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 11,
                fontFamily: 'Fira Code, monospace',
                automaticLayout: true,
                scrollBeyondLastLine: false,
                padding: { top: 6, bottom: 6 }
              }}
            />
          </div>
        </div>
      </div>

      {/* Compiled Sandbox Iframe view container */}
      <div className="space-y-1 flex flex-col items-center">
        <div className="w-full text-left">
          <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-550 uppercase block mb-1">Live responsive preview:</span>
        </div>
        <div 
          className="border border-zinc-200 dark:border-zinc-850 bg-white rounded-2xl overflow-hidden transition-all duration-300 max-w-full"
          style={{ width: previewWidth, height: '340px' }}
        >
          <iframe
            srcDoc={iframeSrcDoc}
            className="w-full h-full border-0 bg-white"
            title="Live Markup Render Panel"
            sandbox="allow-scripts"
          />
        </div>
      </div>
    </div>
  );
}
