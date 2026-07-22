import { useState } from 'react';
import { Database, Copy, Check, Sparkles, Trash2, ArrowDownUp } from 'lucide-react';

export default function SQLFormatter() {
  const [inputSql, setInputSql] = useState<string>('');
  const [outputSql, setOutputSql] = useState<string>('');
  const [capitalize, setCapitalize] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  const sampleQueries = [
    {
      name: 'Simple SELECT',
      query: 'select id,name,email from users where status=\'active\' order by created_at desc limit 10;',
    },
    {
      name: 'JOIN Query',
      query: 'select orders.id, users.name, products.title, orders.total from orders join users on orders.user_id = users.id join order_items on order_items.order_id = orders.id join products on order_items.product_id = products.id where orders.status = \'completed\' group by orders.id order by orders.total desc;',
    },
    {
      name: 'Complex INSERT',
      query: 'insert into analytics_logs (event_name, user_id, ip_address, created_at, metadata) values (\'click_signup\', 492, \'192.168.1.1\', now(), \'{"browser": "Chrome"}\');',
    }
  ];

  const sqlKeywords = [
    'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'JOIN', 'ON', 'GROUP BY', 'ORDER BY', 
    'HAVING', 'LIMIT', 'OFFSET', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'OUTER JOIN',
    'INSERT INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE', 'CREATE TABLE', 'DROP TABLE',
    'INDEX', 'AS', 'IN', 'IS NULL', 'IS NOT NULL', 'LIKE', 'INTO', 'UNION', 'ALL',
    'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'DESC', 'ASC', 'HAVING', 'DISTINCT'
  ];

  const formatSQL = () => {
    if (!inputSql.trim()) {
      setOutputSql('');
      return;
    }

    let sql = inputSql;

    // 1. Minify/Strip linebreaks first to normalize
    sql = sql.replace(/\s+/g, ' ');

    // 2. Capitalize keywords if checked
    if (capitalize) {
      sqlKeywords.forEach((keyword) => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        sql = sql.replace(regex, keyword);
      });
    }

    // 3. Add Line breaks & Indent before major clauses
    const breakKeywords = [
      'FROM', 'WHERE', 'GROUP BY', 'ORDER BY', 'HAVING', 'LIMIT', 'OFFSET',
      'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'OUTER JOIN', 'JOIN', 'UNION',
      'SET', 'VALUES'
    ];

    breakKeywords.forEach((keyword) => {
      // Find keywords that aren't preceded by a newline yet
      const regex = new RegExp(`(?<!\\n)\\s*\\b${keyword}\\b`, 'g');
      sql = sql.replace(regex, `\n${keyword}`);
    });

    // Indent AND/OR statements under WHERE
    sql = sql.replace(/(?<!\n)\s*\b(AND|OR)\b/g, '\n  $1');

    // Split SELECT columns if there are many?
    // We can keep it simple: clean indent on main keywords
    const lines = sql.split('\n');
    const formatted = lines
      .map((line) => {
        const trimmed = line.trim();
        // Add indentation for sub-clauses
        if (trimmed.startsWith('AND') || trimmed.startsWith('OR') || trimmed.startsWith('ON')) {
          return '  ' + trimmed;
        }
        return trimmed;
      })
      .join('\n');

    setOutputSql(formatted);
  };

  const minifySQL = () => {
    if (!inputSql.trim()) return;
    const minified = inputSql.replace(/\s+/g, ' ').trim();
    setOutputSql(minified);
  };

  const copyToClipboard = () => {
    if (!outputSql) return;
    navigator.clipboard.writeText(outputSql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clear = () => {
    setInputSql('');
    setOutputSql('');
  };

  return (
    <div className="space-y-6">
      {/* Samples section */}
      <div className="flex flex-wrap items-center gap-2.5">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Load Sample SQL:</span>
        {sampleQueries.map((sample, idx) => (
          <button
            key={idx}
            onClick={() => {
              setInputSql(sample.query);
              setOutputSql('');
            }}
            className="px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-teal-600 transition"
          >
            {sample.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Text Area */}
        <div className="flex flex-col h-[600px] p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1">
              <Database className="w-4 h-4 text-slate-400" />
              Raw Query
            </span>
            <button
              onClick={clear}
              className="p-1 rounded-lg hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 transition cursor-pointer"
              title="Clear input"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <textarea
            value={inputSql}
            onChange={(e) => setInputSql(e.target.value)}
            className="flex-grow w-full p-4 rounded-xl border border-slate-100 dark:border-slate-800 focus:outline-none focus:border-teal-500 bg-slate-50/50 dark:bg-slate-950/50 font-mono text-sm leading-relaxed text-slate-800 dark:text-slate-150 resize-none"
            placeholder="Paste your raw, messy SQL query here..."
          />
          <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/50">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 cursor-pointer">
              <input
                type="checkbox"
                checked={capitalize}
                onChange={(e) => setCapitalize(e.target.checked)}
                className="rounded border-slate-350 text-teal-600 focus:ring-teal-500 w-3.5 h-3.5"
              />
              <span>Capitalize Keywords (SELECT, FROM)</span>
            </label>
            <div className="flex gap-2">
              <button
                onClick={minifySQL}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 transition cursor-pointer"
              >
                <ArrowDownUp className="w-3.5 h-3.5" />
                <span>Minify</span>
              </button>
              <button
                onClick={formatSQL}
                className="flex items-center gap-1 px-4 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-xs font-bold text-white shadow-sm transition cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Format SQL</span>
              </button>
            </div>
          </div>
        </div>

        {/* Output Area */}
        <div className="flex flex-col h-[600px] p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm text-slate-800 dark:text-slate-200">
          <div className="flex justify-between items-center mb-3 border-b border-slate-100 dark:border-slate-800/80 pb-2.5">
            <span className="text-sm font-bold text-slate-700 dark:text-slate-250">Beautified SQL</span>
            {outputSql && (
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 transition cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            )}
          </div>
          {outputSql ? (
            <pre className="flex-grow w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-100 dark:border-zinc-800/50 font-mono text-sm leading-relaxed overflow-auto text-teal-700 dark:text-teal-400">
              <code>{outputSql}</code>
            </pre>
          ) : (
            <div className="flex-grow flex flex-col items-center justify-center text-slate-400 dark:text-slate-555 text-center p-6">
              <Database className="w-12 h-12 mb-3 text-slate-300 dark:text-slate-700" />
              <p className="text-sm">Click "Format SQL" or "Minify" on the left to see beautified output here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

