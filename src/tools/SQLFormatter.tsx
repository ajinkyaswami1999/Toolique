import { useState, useEffect, useMemo, useCallback } from 'react';
import { format as formatSQLWithEngine } from 'sql-formatter';
import {
  Database,
  Copy,
  Check,
  Sparkles,
  Trash2,
  ArrowDownUp,
  Download,
  Code2,
  History,
  AlertTriangle,
  Info,
  ShieldAlert,
  FileCode2,
  Sliders,
  CheckCircle2
} from 'lucide-react';

type SqlDialect =
  | 'postgresql'
  | 'mysql'
  | 'transactsql'
  | 'plsql'
  | 'sqlite'
  | 'bigquery'
  | 'snowflake'
  | 'redshift'
  | 'mariadb'
  | 'clickhouse'
  | 'duckdb'
  | 'trino'
  | 'sql';

type IndentStyle = 'standard' | 'tabularLeft' | 'tabularRight';
type CaseTransform = 'upper' | 'lower' | 'preserve';

interface DialectConfig {
  id: SqlDialect;
  name: string;
  badge: string;
  desc: string;
  category: 'Popular' | 'Data Warehouse' | 'Embedded & Relational';
}

const DIALECTS: DialectConfig[] = [
  { id: 'postgresql', name: 'PostgreSQL', badge: 'PG', desc: 'Postgres 12+ JSONB, Window & CTEs', category: 'Popular' },
  { id: 'mysql', name: 'MySQL', badge: 'MY', desc: 'MySQL 8.0+ syntax, Backticks & Upsert', category: 'Popular' },
  { id: 'transactsql', name: 'SQL Server (T-SQL)', badge: 'MSSQL', desc: 'Microsoft T-SQL & Stored Procs', category: 'Popular' },
  { id: 'plsql', name: 'Oracle (PL/SQL)', badge: 'ORA', desc: 'Oracle DB, ROWNUM & Packages', category: 'Popular' },
  { id: 'sqlite', name: 'SQLite', badge: 'SQLITE', desc: 'Lightweight embedded database', category: 'Embedded & Relational' },
  { id: 'mariadb', name: 'MariaDB', badge: 'MARIA', desc: 'MariaDB relational engine', category: 'Embedded & Relational' },
  { id: 'bigquery', name: 'Google BigQuery', badge: 'BQ', desc: 'Google Cloud BigQuery SQL', category: 'Data Warehouse' },
  { id: 'snowflake', name: 'Snowflake', badge: 'SNOW', desc: 'Snowflake Cloud Data Platform', category: 'Data Warehouse' },
  { id: 'redshift', name: 'Amazon Redshift', badge: 'RED', desc: 'AWS Data Warehouse SQL', category: 'Data Warehouse' },
  { id: 'clickhouse', name: 'ClickHouse', badge: 'CH', desc: 'High performance OLAP SQL', category: 'Data Warehouse' },
  { id: 'duckdb', name: 'DuckDB', badge: 'DUCK', desc: 'In-process analytical OLAP database', category: 'Data Warehouse' },
  { id: 'trino', name: 'Trino / Presto', badge: 'TRINO', desc: 'Distributed SQL query engine', category: 'Data Warehouse' },
  { id: 'sql', name: 'Standard ANSI SQL', badge: 'ANSI', desc: 'Standard ANSI SQL-92/99/2016', category: 'Embedded & Relational' }
];

const SAMPLE_QUERIES = [
  {
    name: 'Multi-Table JOIN & Window Ranking',
    dialect: 'postgresql' as SqlDialect,
    desc: 'Complex aggregation, window ranking, and conditional filters',
    sql: `select o.order_id, u.full_name as customer_name, u.email, sum(oi.quantity * oi.unit_price) as total_order_amount, count(distinct oi.product_id) as distinct_items_count, row_number() over (partition by u.country order by sum(oi.quantity * oi.unit_price) desc) as country_revenue_rank, case when sum(oi.quantity * oi.unit_price) > 1000 then 'VIP Priority' when sum(oi.quantity * oi.unit_price) between 500 and 1000 then 'Standard High' else 'Regular' end as order_tier from orders as o inner join users as u on o.user_id = u.id inner join order_items as oi on oi.order_id = o.order_id left join product_discounts as pd on pd.product_id = oi.product_id and pd.is_active = true where o.status in ('completed', 'shipped') and o.created_at >= '2026-01-01 00:00:00' and u.is_verified = true group by o.order_id, u.full_name, u.email, u.country having sum(oi.quantity * oi.unit_price) >= 150 order by total_order_amount desc, o.order_id asc limit 50 offset 0;`
  },
  {
    name: 'Recursive CTE & Hierarchy Tree',
    dialect: 'postgresql' as SqlDialect,
    desc: 'Common Table Expression for organizational reporting structure',
    sql: `with recursive employee_hierarchy as (select employee_id, first_name, last_name, manager_id, job_title, 1 as hierarchy_level, cast(first_name || ' ' || last_name as varchar(1000)) as management_chain from employees where manager_id is null union all select e.employee_id, e.first_name, e.last_name, e.manager_id, e.job_title, eh.hierarchy_level + 1, cast(eh.management_chain || ' -> ' || e.first_name || ' ' || e.last_name as varchar(1000)) from employees e inner join employee_hierarchy eh on e.manager_id = eh.employee_id) select hierarchy_level, employee_id, first_name, last_name, job_title, management_chain from employee_hierarchy order by hierarchy_level asc, last_name asc;`
  },
  {
    name: 'MySQL UPSERT (Duplicate Key Update)',
    dialect: 'mysql' as SqlDialect,
    desc: 'Bulk inventory insert with atomic key update',
    sql: `insert into product_inventory (sku, warehouse_code, quantity_on_hand, reserved_quantity, reorder_point, last_restocked_at) values ('SKU-HEADSET-PRO-01', 'WH_MUMBAI_01', 150, 12, 30, now()), ('SKU-KEYBOARD-RGB-02', 'WH_BLR_02', 85, 5, 20, now()), ('SKU-MONITOR-4K-03', 'WH_DELHI_03', 40, 2, 10, now()) on duplicate key update quantity_on_hand = product_inventory.quantity_on_hand + values(quantity_on_hand), last_restocked_at = values(last_restocked_at), reserved_quantity = product_inventory.reserved_quantity;`
  },
  {
    name: 'DDL Schema Creation with Constraints',
    dialect: 'transactsql' as SqlDialect,
    desc: 'Table creation with primary, foreign keys & check constraints',
    sql: `create table customers_secure (customer_id uniqueidentifier not null default newid(), organization_id int not null, company_name nvarchar(255) not null, tax_identifier varchar(50) null, billing_email nvarchar(320) not null, account_balance decimal(18,4) not null default 0.0000, risk_score int not null default 100, is_active bit not null default 1, created_at datetimeoffset not null default sysdatetimeoffset(), updated_at datetimeoffset not null default sysdatetimeoffset(), constraint pk_customers_secure primary key clustered (customer_id), constraint fk_customers_org foreign key (organization_id) references organizations(id) on delete cascade, constraint chk_risk_score check (risk_score between 0 and 1000), constraint uq_customer_tax_org unique (organization_id, tax_identifier));`
  },
  {
    name: 'BigQuery / Analytics Pivot & Aggregation',
    dialect: 'bigquery' as SqlDialect,
    desc: 'Analytical partitioned aggregation with date truncation',
    sql: `with daily_funnel as (select date_trunc(event_timestamp, day) as event_date, traffic_source, device_category, count(distinct user_pseudo_id) as total_visitors, countif(event_name = 'view_item') as product_views, countif(event_name = 'add_to_cart') as cart_adds, countif(event_name = 'purchase') as successful_checkouts, sum(case when event_name = 'purchase' then event_value_in_usd else 0 end) as gross_revenue_usd from \`gcp-analytics-prod.ecommerce.events_*\` where _table_suffix between '20260101' and '20260331' and geo_country = 'India' group by 1, 2, 3) select event_date, traffic_source, device_category, total_visitors, product_views, cart_adds, successful_checkouts, gross_revenue_usd, safe_divide(successful_checkouts, total_visitors) * 100 as visitor_to_purchase_cvr_pct from daily_funnel order by event_date desc, gross_revenue_usd desc limit 100;`
  }
];

export default function SQLFormatter() {
  const [inputSql, setInputSql] = useState<string>(SAMPLE_QUERIES[0].sql);
  const [outputSql, setOutputSql] = useState<string>('');
  const [selectedDialect, setSelectedDialect] = useState<SqlDialect>('postgresql');

  // Formatting Config Options
  const [keywordCase, setKeywordCase] = useState<CaseTransform>('upper');
  const [dataTypeCase, setDataTypeCase] = useState<CaseTransform>('upper');
  const [functionCase, setFunctionCase] = useState<CaseTransform>('upper');
  const [indentStyle, setIndentStyle] = useState<IndentStyle>('standard');
  const [tabWidth, setTabWidth] = useState<number>(2);
  const useTabs = false;
  const [logicalOperatorNewline, setLogicalOperatorNewline] = useState<'before' | 'after'>('before');
  const expressionWidth = 80;
  const linesBetweenQueries = 1;
  const [autoFormatOnType, setAutoFormatOnType] = useState<boolean>(true);

  // Active Workspace Tabs
  const [activeTab, setActiveTab] = useState<'format' | 'code' | 'linter' | 'history'>('format');
  const [codeLanguage, setCodeLanguage] = useState<'python' | 'javascript' | 'java' | 'php' | 'csharp' | 'go' | 'rust'>('python');

  // Interactive state
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [historyItems, setHistoryItems] = useState<{ id: string; timestamp: string; dialect: string; query: string }[]>([]);
  const [formatError, setFormatError] = useState<string | null>(null);

  // Load history from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('toolique_sql_formatter_history_v1');
      if (stored) setHistoryItems(JSON.parse(stored));
    } catch {}
  }, []);

  const saveHistory = (items: typeof historyItems) => {
    try {
      localStorage.setItem('toolique_sql_formatter_history_v1', JSON.stringify(items));
    } catch {}
  };

  // Core Formatting Function
  const executeFormatting = useCallback(
    (sqlToFormat: string, dialect: SqlDialect = selectedDialect) => {
      if (!sqlToFormat || !sqlToFormat.trim()) {
        setOutputSql('');
        setFormatError(null);
        return;
      }

      try {
        const formatted = formatSQLWithEngine(sqlToFormat, {
          language: dialect,
          tabWidth: tabWidth,
          useTabs: useTabs,
          keywordCase: keywordCase,
          dataTypeCase: dataTypeCase,
          functionCase: functionCase,
          indentStyle: indentStyle,
          logicalOperatorNewline: logicalOperatorNewline,
          expressionWidth: expressionWidth,
          linesBetweenQueries: linesBetweenQueries
        });

        setOutputSql(formatted);
        setFormatError(null);
      } catch (err: any) {
        setFormatError(err?.message || 'Error formatting SQL syntax.');
        // Fallback to basic clause newline splitting
        try {
          let fallback = sqlToFormat.replace(/\s+/g, ' ');
          if (keywordCase === 'upper') {
            const keywords = ['SELECT', 'FROM', 'WHERE', 'JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'GROUP BY', 'ORDER BY', 'HAVING', 'LIMIT', 'OFFSET', 'UNION', 'INSERT INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE'];
            keywords.forEach((k) => {
              fallback = fallback.replace(new RegExp(`\\b${k}\\b`, 'gi'), k);
            });
          }
          const breakKeywords = ['FROM', 'WHERE', 'GROUP BY', 'ORDER BY', 'HAVING', 'LIMIT', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'JOIN', 'UNION', 'VALUES', 'SET'];
          breakKeywords.forEach((k) => {
            fallback = fallback.replace(new RegExp(`\\s*\\b${k}\\b`, 'gi'), `\n${k}`);
          });
          setOutputSql(fallback);
        } catch {
          setOutputSql(sqlToFormat);
        }
      }
    },
    [
      selectedDialect,
      tabWidth,
      useTabs,
      keywordCase,
      dataTypeCase,
      functionCase,
      indentStyle,
      logicalOperatorNewline,
      expressionWidth,
      linesBetweenQueries
    ]
  );

  // Trigger format on mount & whenever parameters change if auto-format is on
  useEffect(() => {
    if (autoFormatOnType) {
      executeFormatting(inputSql, selectedDialect);
    }
  }, [inputSql, selectedDialect, autoFormatOnType, executeFormatting]);

  // Minify Action
  const handleMinify = () => {
    if (!inputSql.trim()) return;
    const minified = inputSql
      .replace(/\/\*[\s\S]*?\*\/|--.*$/gm, '') // Remove comments
      .replace(/\s+/g, ' ')
      .trim();
    setOutputSql(minified);
  };

  // Add current query to history
  const handleSaveToHistory = () => {
    if (!outputSql.trim()) return;
    const newItem = {
      id: `sql-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      dialect: selectedDialect,
      query: outputSql
    };
    const updated = [newItem, ...historyItems].slice(0, 30);
    setHistoryItems(updated);
    saveHistory(updated);
  };

  // Copy to clipboard helper
  const handleCopy = (text: string, key = 'output') => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Download .sql file
  const handleDownload = () => {
    if (!outputSql) return;
    const blob = new Blob([outputSql], { type: 'text/sql;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `formatted-query-${selectedDialect}-${Date.now()}.sql`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Query Inspector / Linter Analysis
  const queryAnalysis = useMemo(() => {
    const raw = outputSql || inputSql || '';
    if (!raw.trim()) {
      return {
        tableCount: 0,
        tokenCount: 0,
        lineCount: 0,
        charCount: 0,
        complexityScore: 'Clean',
        warnings: [],
        tables: []
      };
    }

    const lines = raw.split('\n');
    const charCount = raw.length;
    const tokens = raw.match(/\b[A-Za-z0-9_]+\b/g) || [];

    // Extract table names
    const tableMatches = new Set<string>();
    const fromJoinRegex = /\b(?:FROM|JOIN|INTO|UPDATE|TABLE)\s+([`"']?[a-zA-Z0-9_]+[`"']?(?:\.[`"']?[a-zA-Z0-9_]+[`"']*)?)/gi;
    let match;
    while ((match = fromJoinRegex.exec(raw)) !== null) {
      if (match[1]) {
        const cleanName = match[1].replace(/[`"']/g, '').trim();
        if (!['SELECT', 'WHERE', 'SET', 'VALUES', 'DEFAULT'].includes(cleanName.toUpperCase())) {
          tableMatches.add(cleanName);
        }
      }
    }

    // Identify anti-patterns and performance warnings
    const warnings: { type: 'critical' | 'warning' | 'info'; title: string; desc: string }[] = [];

    if (/\bSELECT\s+\*/i.test(raw)) {
      warnings.push({
        type: 'warning',
        title: 'Wildcard Projection (SELECT *)',
        desc: 'Requesting all columns prevents covering index usage and wastes network I/O. Specify explicit column lists in production queries.'
      });
    }

    if (/\bLIKE\s+['"]%[^'"]+['"]/i.test(raw)) {
      warnings.push({
        type: 'warning',
        title: 'Leading Wildcard (LIKE \'%term\')',
        desc: 'A leading wildcard forces a full table scan and bypasses standard B-Tree indexes. Consider full-text search indexes or trigram matching.'
      });
    }

    if ((/\bUPDATE\b/i.test(raw) || /\bDELETE\s+FROM\b/i.test(raw)) && !/\bWHERE\b/i.test(raw)) {
      warnings.push({
        type: 'critical',
        title: 'Missing WHERE Clause on UPDATE / DELETE',
        desc: 'Executing UPDATE or DELETE statements without a WHERE predicate will alter or erase all rows in the entire table.'
      });
    }

    if (/\bNOT\s+IN\s*\(\s*SELECT\b/i.test(raw)) {
      warnings.push({
        type: 'info',
        title: 'NOT IN (SELECT ...) Subquery',
        desc: 'If the subquery returns a single NULL value, NOT IN evaluates to UNKNOWN and returns 0 rows. Prefer NOT EXISTS or LEFT JOIN WHERE col IS NULL.'
      });
    }

    if ((raw.match(/\bJOIN\b/gi) || []).length >= 5) {
      warnings.push({
        type: 'info',
        title: 'High Table Join Depth',
        desc: 'Joining 5+ tables in a single query increases query planner complexity. Verify foreign key indexes exist on all joined keys.'
      });
    }

    let complexityScore: 'Low' | 'Moderate' | 'High' | 'Complex' = 'Low';
    if (tokens.length > 200 || tableMatches.size >= 4 || raw.includes('OVER (') || raw.includes('WITH ')) {
      complexityScore = 'Complex';
    } else if (tokens.length > 100 || tableMatches.size >= 3) {
      complexityScore = 'High';
    } else if (tokens.length > 40 || tableMatches.size >= 2) {
      complexityScore = 'Moderate';
    }

    return {
      tableCount: tableMatches.size,
      tables: Array.from(tableMatches),
      tokenCount: tokens.length,
      lineCount: lines.length,
      charCount,
      complexityScore,
      warnings
    };
  }, [outputSql, inputSql]);

  // Multi-Language Code Embedder Generator
  const embeddedCodeSnippet = useMemo(() => {
    const targetSql = outputSql || inputSql || '';
    if (!targetSql.trim()) return '// Paste or format SQL to generate embedded code';

    switch (codeLanguage) {
      case 'python':
        return `# Python (SQLAlchemy / psycopg2 / asyncpg)\nquery = """\n${targetSql}\n"""\n\n# Execute with SQLAlchemy\n# result = session.execute(text(query))\n# rows = result.fetchall()`;
      case 'javascript':
        return `// JavaScript / TypeScript (Node.js / Bun / Prisma / Drizzle)\nimport { sql } from 'drizzle-orm'; // or pg / mysql2\n\nconst query = sql\`\n${targetSql}\n\`;\n\n// const { rows } = await pool.query(query);`;
      case 'java':
        return `// Java 15+ Text Block (JDBC / Spring Data / Hibernate)\nString sql = """\n${targetSql}\n""";\n\n// PreparedStatement stmt = connection.prepareStatement(sql);\n// ResultSet rs = stmt.executeQuery();`;
      case 'php':
        return `<?php\n// PHP (PDO / Doctrine DBAL)\n$sql = <<<SQL\n${targetSql}\nSQL;\n\n// $stmt = $pdo->prepare($sql);\n// $stmt->execute();\n// $data = $stmt->fetchAll(PDO::FETCH_ASSOC);`;
      case 'csharp':
        return `// C# 11+ Raw String Literal (.NET / Dapper / Entity Framework)\nvar sql = """\n${targetSql}\n""";\n\n// using var connection = new SqlConnection(connString);\n// var results = await connection.QueryAsync<dynamic>(sql);`;
      case 'go':
        return `// Go (database/sql / sqlx / pgx)\nquery := \`\n${targetSql}\n\`\n\n// rows, err := db.QueryContext(ctx, query)\n// if err != nil { return err }`;
      case 'rust':
        return `// Rust (sqlx / tokio-postgres)\nlet query = r#"\n${targetSql}\n"#;\n\n// let rows = sqlx::query(query).fetch_all(&pool).await?;`;
      default:
        return targetSql;
    }
  }, [outputSql, inputSql, codeLanguage]);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-5 text-left font-sans select-none">
      {/* Studio Container Card with Adaptive Theme */}
      <div className="bg-white/90 dark:bg-[#0d121f] text-zinc-800 dark:text-slate-200 p-4 sm:p-5 md:p-6 rounded-3xl border border-zinc-200/90 dark:border-slate-800 shadow-xl dark:shadow-2xl backdrop-blur-md space-y-5 transition-colors duration-300">
        
        {/* TOP TOOLBAR: Dialect Picker, Quick Samples & Main Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-zinc-200/80 dark:border-slate-800/80">
          
          {/* Dialect Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-zinc-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Database className="w-4 h-4 text-indigo-500 dark:text-teal-400" />
              Dialect:
            </span>
            <select
              value={selectedDialect}
              onChange={(e) => {
                const nextDialect = e.target.value as SqlDialect;
                setSelectedDialect(nextDialect);
                executeFormatting(inputSql, nextDialect);
              }}
              className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-slate-700 bg-zinc-50 dark:bg-[#111728] text-xs font-bold text-zinc-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer shadow-2xs"
            >
              <optgroup label="Popular Engines">
                {DIALECTS.filter((d) => d.category === 'Popular').map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Data Warehouses">
                {DIALECTS.filter((d) => d.category === 'Data Warehouse').map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Embedded & Relational">
                {DIALECTS.filter((d) => d.category === 'Embedded & Relational').map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Quick Starter Queries */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
            <span className="text-[11px] font-bold text-zinc-400 dark:text-slate-500 uppercase tracking-wider shrink-0">
              Templates:
            </span>
            {SAMPLE_QUERIES.map((sample, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setInputSql(sample.sql);
                  setSelectedDialect(sample.dialect);
                  executeFormatting(sample.sql, sample.dialect);
                }}
                className="px-2.5 py-1 rounded-lg border border-zinc-200/80 dark:border-slate-800 bg-zinc-100/70 hover:bg-zinc-200/80 dark:bg-[#111728] dark:hover:bg-slate-800 text-[11px] font-semibold text-zinc-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-teal-400 transition cursor-pointer shrink-0 shadow-2xs"
                title={sample.desc}
              >
                {sample.name}
              </button>
            ))}
          </div>

          {/* Top Action Buttons */}
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={handleMinify}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-slate-700 bg-zinc-100 hover:bg-zinc-200/80 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-zinc-700 dark:text-slate-300 transition cursor-pointer shadow-2xs"
              title="Minify SQL query into a single compact line"
            >
              <ArrowDownUp className="w-3.5 h-3.5" /> Minify
            </button>
            <button
              onClick={() => executeFormatting(inputSql, selectedDialect)}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-xs font-bold text-white shadow-md shadow-indigo-500/20 active:scale-95 transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" /> Format SQL
            </button>
          </div>
        </div>

        {/* FORMATTING PREFERENCES ACCORDION / TOOLBAR */}
        <div className="p-3.5 rounded-2xl bg-zinc-50/80 dark:bg-[#111728] border border-zinc-200/80 dark:border-slate-800/80 space-y-3 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 font-bold text-zinc-700 dark:text-slate-300">
              <Sliders className="w-4 h-4 text-indigo-500 dark:text-teal-400" />
              <span>Formatting Preferences:</span>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-zinc-600 dark:text-slate-400">
              {/* Keyword Casing */}
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-[11px]">Keywords:</span>
                <select
                  value={keywordCase}
                  onChange={(e) => {
                    const next = e.target.value as CaseTransform;
                    setKeywordCase(next);
                  }}
                  className="px-2 py-1 rounded-lg border border-zinc-200 dark:border-slate-700 bg-white dark:bg-[#090d17] text-zinc-800 dark:text-slate-200 text-xs font-bold cursor-pointer"
                >
                  <option value="upper">UPPERCASE</option>
                  <option value="lower">lowercase</option>
                  <option value="preserve">Preserve</option>
                </select>
              </div>

              {/* Indent Style */}
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-[11px]">Layout:</span>
                <select
                  value={indentStyle}
                  onChange={(e) => {
                    const next = e.target.value as IndentStyle;
                    setIndentStyle(next);
                  }}
                  className="px-2 py-1 rounded-lg border border-zinc-200 dark:border-slate-700 bg-white dark:bg-[#090d17] text-zinc-800 dark:text-slate-200 text-xs font-bold cursor-pointer"
                >
                  <option value="standard">Standard Indent</option>
                  <option value="tabularLeft">Tabular Left (DBA Align)</option>
                  <option value="tabularRight">Tabular Right (River Align)</option>
                </select>
              </div>

              {/* Indent Spacing */}
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-[11px]">Spaces:</span>
                <select
                  value={tabWidth}
                  onChange={(e) => setTabWidth(Number(e.target.value))}
                  className="px-2 py-1 rounded-lg border border-zinc-200 dark:border-slate-700 bg-white dark:bg-[#090d17] text-zinc-800 dark:text-slate-200 text-xs font-bold cursor-pointer"
                >
                  <option value={2}>2 Spaces</option>
                  <option value={4}>4 Spaces</option>
                </select>
              </div>

              {/* Functions Casing */}
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-[11px]">Functions:</span>
                <select
                  value={functionCase}
                  onChange={(e) => {
                    const next = e.target.value as CaseTransform;
                    setFunctionCase(next);
                  }}
                  className="px-2 py-1 rounded-lg border border-zinc-200 dark:border-slate-700 bg-white dark:bg-[#090d17] text-zinc-800 dark:text-slate-200 text-xs font-bold cursor-pointer"
                >
                  <option value="upper">UPPERCASE</option>
                  <option value="lower">lowercase</option>
                  <option value="preserve">Preserve</option>
                </select>
              </div>

              {/* Data Types Casing */}
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-[11px]">Types:</span>
                <select
                  value={dataTypeCase}
                  onChange={(e) => {
                    const next = e.target.value as CaseTransform;
                    setDataTypeCase(next);
                  }}
                  className="px-2 py-1 rounded-lg border border-zinc-200 dark:border-slate-700 bg-white dark:bg-[#090d17] text-zinc-800 dark:text-slate-200 text-xs font-bold cursor-pointer"
                >
                  <option value="upper">UPPERCASE</option>
                  <option value="lower">lowercase</option>
                  <option value="preserve">Preserve</option>
                </select>
              </div>

              {/* Logical Operator Newlines */}
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-[11px]">AND/OR:</span>
                <select
                  value={logicalOperatorNewline}
                  onChange={(e) => setLogicalOperatorNewline(e.target.value as any)}
                  className="px-2 py-1 rounded-lg border border-zinc-200 dark:border-slate-700 bg-white dark:bg-[#090d17] text-zinc-800 dark:text-slate-200 text-xs font-bold cursor-pointer"
                >
                  <option value="before">Newline Before</option>
                  <option value="after">Newline After</option>
                </select>
              </div>

              {/* Auto format toggle */}
              <label className="flex items-center gap-1.5 cursor-pointer font-bold text-zinc-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={autoFormatOnType}
                  onChange={(e) => setAutoFormatOnType(e.target.checked)}
                  className="rounded accent-indigo-600 cursor-pointer"
                />
                <span>Live Format</span>
              </label>
            </div>
          </div>
        </div>

        {/* WORKSPACE SUB-TABS (Format View, Embed Code, Linter & Metrics, History) */}
        <div className="flex items-center justify-between border-b border-zinc-200/80 dark:border-slate-800 pb-2 text-xs font-bold text-zinc-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('format')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition cursor-pointer ${
                activeTab === 'format'
                  ? 'text-indigo-700 dark:text-white bg-indigo-50 dark:bg-slate-800 font-black shadow-2xs border border-indigo-200 dark:border-slate-700'
                  : 'hover:text-zinc-900 dark:hover:text-slate-200 hover:bg-zinc-100 dark:hover:bg-slate-800/40'
              }`}
            >
              <FileCode2 className="w-3.5 h-3.5" />
              <span>SQL Editor</span>
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition cursor-pointer ${
                activeTab === 'code'
                  ? 'text-indigo-700 dark:text-white bg-indigo-50 dark:bg-slate-800 font-black shadow-2xs border border-indigo-200 dark:border-slate-700'
                  : 'hover:text-zinc-900 dark:hover:text-slate-200 hover:bg-zinc-100 dark:hover:bg-slate-800/40'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Embed in Code</span>
            </button>
            <button
              onClick={() => setActiveTab('linter')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition cursor-pointer ${
                activeTab === 'linter'
                  ? 'text-indigo-700 dark:text-white bg-indigo-50 dark:bg-slate-800 font-black shadow-2xs border border-indigo-200 dark:border-slate-700'
                  : 'hover:text-zinc-900 dark:hover:text-slate-200 hover:bg-zinc-100 dark:hover:bg-slate-800/40'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Query Inspector</span>
              {queryAnalysis.warnings.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-600 dark:text-amber-400">
                  {queryAnalysis.warnings.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition cursor-pointer ${
                activeTab === 'history'
                  ? 'text-indigo-700 dark:text-white bg-indigo-50 dark:bg-slate-800 font-black shadow-2xs border border-indigo-200 dark:border-slate-700'
                  : 'hover:text-zinc-900 dark:hover:text-slate-200 hover:bg-zinc-100 dark:hover:bg-slate-800/40'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Saved History ({historyItems.length})</span>
            </button>
          </div>

          {/* Quick Metrics Tag */}
          <div className="hidden sm:flex items-center gap-2 text-[11px] font-mono text-zinc-500 dark:text-slate-400">
            <span>{queryAnalysis.lineCount} lines</span>
            <span>•</span>
            <span>{queryAnalysis.tokenCount} tokens</span>
            <span>•</span>
            <span
              className={`px-2 py-0.5 rounded-md font-bold uppercase ${
                queryAnalysis.complexityScore === 'Complex'
                  ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                  : queryAnalysis.complexityScore === 'High'
                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                  : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {queryAnalysis.complexityScore} Complexity
            </span>
          </div>
        </div>

        {/* 1. TAB: MAIN SQL FORMATTER WORKSPACE */}
        {activeTab === 'format' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Left Raw SQL Input Pane */}
            <div className="flex flex-col h-[560px] p-4 rounded-2xl bg-zinc-50/80 dark:bg-[#111728] border border-zinc-200/80 dark:border-slate-800 space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-zinc-200/70 dark:border-slate-800/80">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-zinc-700 dark:text-slate-200 uppercase tracking-wider">
                    Raw SQL Input
                  </span>
                  <span className="text-[10px] font-mono text-zinc-400">
                    ({(new Blob([inputSql]).size / 1024).toFixed(1)} KB)
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setInputSql('');
                      setOutputSql('');
                    }}
                    className="p-1.5 text-zinc-400 hover:text-rose-500 dark:text-slate-500 dark:hover:text-rose-400 rounded-lg hover:bg-zinc-200/60 dark:hover:bg-slate-800 transition cursor-pointer"
                    title="Clear Raw SQL"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <textarea
                value={inputSql}
                onChange={(e) => setInputSql(e.target.value)}
                placeholder="Paste messy, unformatted SQL query here (SELECT, INSERT, UPDATE, CREATE TABLE, CTE)..."
                className="flex-1 w-full p-3.5 bg-white dark:bg-[#070b14] border border-zinc-200 dark:border-slate-800 rounded-xl font-mono text-xs leading-relaxed text-zinc-900 dark:text-slate-100 placeholder-zinc-400 dark:placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 resize-none"
                spellCheck={false}
              />
            </div>

            {/* Right Formatted SQL Output Pane */}
            <div className="flex flex-col h-[560px] p-4 rounded-2xl bg-zinc-50/80 dark:bg-[#111728] border border-zinc-200/80 dark:border-slate-800 space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-zinc-200/70 dark:border-slate-800/80">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-zinc-700 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    Formatted SQL
                  </span>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-teal-500/10 text-indigo-700 dark:text-teal-400 uppercase">
                    {selectedDialect}
                  </span>
                </div>

                {outputSql && (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={handleSaveToHistory}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-200/80 hover:bg-zinc-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-zinc-700 dark:text-slate-300 transition cursor-pointer shadow-2xs"
                      title="Save query to history"
                    >
                      <History className="w-3 h-3" /> Save
                    </button>
                    <button
                      onClick={handleDownload}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-200/80 hover:bg-zinc-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-zinc-700 dark:text-slate-300 transition cursor-pointer shadow-2xs"
                      title="Download .sql file"
                    >
                      <Download className="w-3 h-3" /> .SQL
                    </button>
                    <button
                      onClick={() => handleCopy(outputSql, 'formatted')}
                      className="flex items-center gap-1 px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white transition cursor-pointer shadow-sm shadow-indigo-500/20"
                      title="Copy formatted SQL to clipboard"
                    >
                      {copiedKey === 'formatted' ? (
                        <>
                          <Check className="w-3 h-3" /> Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" /> Copy
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {formatError && (
                <div className="px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-400 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{formatError}</span>
                </div>
              )}

              {outputSql ? (
                <div className="flex-1 flex bg-white dark:bg-[#070b14] rounded-xl border border-zinc-200 dark:border-slate-800 text-xs font-mono overflow-hidden shadow-inner">
                  {/* Line Numbers */}
                  <div className="py-3 px-2 bg-zinc-100 dark:bg-[#04070d] text-zinc-400 dark:text-slate-600 select-none text-right font-mono text-[11px] leading-relaxed border-r border-zinc-200 dark:border-slate-800/80 min-w-[36px]">
                    {outputSql.split('\n').map((_, i) => (
                      <div key={i}>{i + 1}</div>
                    ))}
                  </div>
                  {/* Formatted Code View */}
                  <pre className="flex-1 p-3 overflow-auto text-zinc-900 dark:text-teal-300 font-mono text-xs leading-relaxed whitespace-pre select-text">
                    <code>{outputSql}</code>
                  </pre>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-zinc-400 dark:text-slate-500 text-center p-8 space-y-3 bg-white dark:bg-[#070b14] rounded-xl border border-dashed border-zinc-200 dark:border-slate-800">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-slate-800/60 flex items-center justify-center text-indigo-500 dark:text-teal-400">
                    <Database className="w-6 h-6" />
                  </div>
                  <div className="text-xs font-bold text-zinc-700 dark:text-slate-300">Ready to Format SQL</div>
                  <p className="text-[11px] max-w-sm">
                    Enter your query on the left and click <strong>Format SQL</strong> to beautify statements across PostgreSQL, MySQL, T-SQL, Oracle, and BigQuery.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2. TAB: EMBED CODE GENERATOR */}
        {activeTab === 'code' && (
          <div className="p-4 sm:p-5 rounded-2xl bg-zinc-50/80 dark:bg-[#111728] border border-zinc-200/80 dark:border-slate-800 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-200/80 dark:border-slate-800">
              <div>
                <div className="font-bold text-xs text-zinc-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Code2 className="w-4 h-4 text-indigo-500" />
                  Code Embedder & String Escaper
                </div>
                <div className="text-[11px] text-zinc-500 dark:text-slate-400">
                  Embed your formatted SQL into your programming language or ORM framework
                </div>
              </div>

              {/* Language Pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: 'python', label: 'Python' },
                  { id: 'javascript', label: 'JavaScript / TS' },
                  { id: 'java', label: 'Java' },
                  { id: 'php', label: 'PHP' },
                  { id: 'csharp', label: 'C# / .NET' },
                  { id: 'go', label: 'Go' },
                  { id: 'rust', label: 'Rust' }
                ].map((lang) => (
                  <button
                    key={lang.id}
                    onClick={() => setCodeLanguage(lang.id as any)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      codeLanguage === lang.id
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'bg-zinc-200/70 dark:bg-slate-800 text-zinc-600 dark:text-slate-400 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Code Output Box */}
            <div className="relative">
              <pre className="p-4 rounded-xl bg-white dark:bg-[#070b14] border border-zinc-200 dark:border-slate-800 font-mono text-xs text-zinc-900 dark:text-indigo-300 overflow-x-auto leading-relaxed max-h-[460px]">
                <code>{embeddedCodeSnippet}</code>
              </pre>
              <button
                onClick={() => handleCopy(embeddedCodeSnippet, 'embedded')}
                className="absolute top-3 right-3 flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-slate-800 hover:bg-zinc-200 dark:hover:bg-slate-700 text-xs font-bold text-zinc-700 dark:text-slate-300 transition cursor-pointer shadow-2xs border border-zinc-200/80 dark:border-slate-700"
              >
                {copiedKey === 'embedded' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" /> Copied Code!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Copy Code
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* 3. TAB: QUERY INSPECTOR & LINTER */}
        {activeTab === 'linter' && (
          <div className="p-4 sm:p-5 rounded-2xl bg-zinc-50/80 dark:bg-[#111728] border border-zinc-200/80 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200/80 dark:border-slate-800">
              <div>
                <div className="font-bold text-xs text-zinc-800 dark:text-slate-200 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-indigo-500" />
                  Query Structure & Linter Analysis
                </div>
                <div className="text-[11px] text-zinc-500 dark:text-slate-400">
                  Static analysis checking for potential anti-patterns and performance bottlenecks
                </div>
              </div>
            </div>

            {/* Metrics Chips */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-white dark:bg-[#070b14] border border-zinc-200 dark:border-slate-800 space-y-1">
                <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Identified Tables</div>
                <div className="text-lg font-black text-indigo-600 dark:text-indigo-400 font-mono">
                  {queryAnalysis.tableCount}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-white dark:bg-[#070b14] border border-zinc-200 dark:border-slate-800 space-y-1">
                <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Total Tokens</div>
                <div className="text-lg font-black text-indigo-600 dark:text-indigo-400 font-mono">
                  {queryAnalysis.tokenCount}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-white dark:bg-[#070b14] border border-zinc-200 dark:border-slate-800 space-y-1">
                <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Line Count</div>
                <div className="text-lg font-black text-indigo-600 dark:text-indigo-400 font-mono">
                  {queryAnalysis.lineCount}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-white dark:bg-[#070b14] border border-zinc-200 dark:border-slate-800 space-y-1">
                <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Complexity</div>
                <div className="text-lg font-black text-indigo-600 dark:text-indigo-400 font-mono">
                  {queryAnalysis.complexityScore}
                </div>
              </div>
            </div>

            {/* Identified Tables List */}
            {queryAnalysis.tables.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-bold text-zinc-700 dark:text-slate-300">Referenced Database Tables:</div>
                <div className="flex flex-wrap gap-1.5">
                  {queryAnalysis.tables.map((t, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-slate-800 text-indigo-700 dark:text-teal-400 border border-indigo-200 dark:border-slate-700 font-mono text-xs font-bold"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Warnings List */}
            <div className="space-y-2.5 pt-2">
              <div className="text-xs font-bold text-zinc-700 dark:text-slate-300">Linter Diagnostics & Rules:</div>
              {queryAnalysis.warnings.length === 0 ? (
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>No obvious syntax anti-patterns or missing WHERE risks detected in this query!</span>
                </div>
              ) : (
                queryAnalysis.warnings.map((w, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-xl border text-xs space-y-1 ${
                      w.type === 'critical'
                        ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-300'
                        : w.type === 'warning'
                        ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-300'
                        : 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-900/50 text-indigo-800 dark:text-indigo-300'
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1.5">
                      {w.type === 'critical' ? (
                        <AlertTriangle className="w-4 h-4 text-rose-500" />
                      ) : (
                        <Info className="w-4 h-4 text-amber-500" />
                      )}
                      <span>{w.title}</span>
                    </div>
                    <p className="text-[11px] leading-relaxed opacity-90">{w.desc}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* 4. TAB: SAVED HISTORY */}
        {activeTab === 'history' && (
          <div className="p-4 sm:p-5 rounded-2xl bg-zinc-50/80 dark:bg-[#111728] border border-zinc-200/80 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200/80 dark:border-slate-800">
              <div className="font-bold text-xs text-zinc-800 dark:text-slate-200 flex items-center gap-1.5">
                <History className="w-4 h-4 text-indigo-500" />
                Local Query History
              </div>
              {historyItems.length > 0 && (
                <button
                  onClick={() => {
                    if (confirm('Clear all saved SQL history?')) {
                      setHistoryItems([]);
                      saveHistory([]);
                    }
                  }}
                  className="text-xs text-rose-600 hover:underline font-bold cursor-pointer"
                >
                  Clear All History
                </button>
              )}
            </div>

            {historyItems.length === 0 ? (
              <div className="p-8 text-center text-zinc-400 dark:text-slate-500 text-xs font-mono">
                No saved queries yet. Click <strong>Save</strong> on any formatted query to bookmark it here.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
                {historyItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-white dark:bg-[#070b14] border border-zinc-200 dark:border-slate-800 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-slate-800 text-indigo-700 dark:text-teal-400 font-mono text-[10px] font-bold uppercase">
                          {item.dialect}
                        </span>
                        <span className="text-zinc-400 text-[10px] font-mono">{item.timestamp}</span>
                      </div>
                      <pre className="text-zinc-700 dark:text-slate-300 font-mono text-[11px] truncate">
                        {item.query.replace(/\n/g, ' ')}
                      </pre>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => {
                          setInputSql(item.query);
                          setSelectedDialect(item.dialect as any);
                          setActiveTab('format');
                          executeFormatting(item.query, item.dialect as any);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-zinc-700 dark:text-slate-200 font-bold text-xs transition cursor-pointer"
                      >
                        Load
                      </button>
                      <button
                        onClick={() => handleCopy(item.query, item.id)}
                        className="p-1.5 text-zinc-400 hover:text-zinc-800 dark:text-slate-400 dark:hover:text-white rounded transition cursor-pointer"
                        title="Copy query"
                      >
                        {copiedKey === item.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
