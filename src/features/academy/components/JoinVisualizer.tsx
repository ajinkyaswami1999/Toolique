import { useState } from 'react';

interface Row {
  id: number;
  name: string;
  orderId: number | null;
  item: string | null;
}

export default function JoinVisualizer() {
  const [joinType, setJoinType] = useState<'inner' | 'left' | 'right' | 'full'>('inner');

  const customers = [
    { id: 1, name: 'Amit' },
    { id: 2, name: 'Priya' },
    { id: 3, name: 'Rohan' }
  ];

  const orders = [
    { orderId: 101, item: 'Laptop', customerId: 1 },
    { orderId: 102, item: 'Phone', customerId: 2 },
    { orderId: 103, item: 'Tablet', customerId: 4 } // Non-matching customer
  ];

  // Compute Join results based on type
  const getJoinResults = (): Row[] => {
    switch (joinType) {
      case 'inner':
        return customers
          .filter(c => orders.some(o => o.customerId === c.id))
          .map(c => {
            const o = orders.find(o => o.customerId === c.id)!;
            return { id: c.id, name: c.name, orderId: o.orderId, item: o.item };
          });
      case 'left':
        return customers.map(c => {
          const o = orders.find(o => o.customerId === c.id);
          return {
            id: c.id,
            name: c.name,
            orderId: o ? o.orderId : null,
            item: o ? o.item : null
          };
        });
      case 'right':
        return orders.map(o => {
          const c = customers.find(c => c.id === o.customerId);
          return {
            id: o.customerId,
            name: c ? c.name : 'NULL',
            orderId: o.orderId,
            item: o.item
          };
        });
      case 'full': {
        const results: Row[] = [];
        // Customers with or without matches
        customers.forEach(c => {
          const o = orders.find(o => o.customerId === c.id);
          results.push({
            id: c.id,
            name: c.name,
            orderId: o ? o.orderId : null,
            item: o ? o.item : null
          });
        });
        // Unmatched orders
        orders.forEach(o => {
          if (!customers.some(c => c.id === o.customerId)) {
            results.push({
              id: o.customerId,
              name: 'NULL',
              orderId: o.orderId,
              item: o.item
            });
          }
        });
        return results;
      }
      default:
        return [];
    }
  };

  const results = getJoinResults();

  return (
    <div className="space-y-6 p-6 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white/40 dark:bg-zinc-950/40 backdrop-blur-md text-left">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white">SQL JOIN Visualizer</h3>
          <p className="text-[11px] text-zinc-500 mt-0.5">Toggle between JOIN queries to inspect how records merge.</p>
        </div>

        {/* Action Toggle buttons */}
        <div className="flex flex-wrap gap-1 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl">
          {(['inner', 'left', 'right', 'full'] as const).map(type => (
            <button
              key={type}
              onClick={() => setJoinType(type)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition cursor-pointer ${
                joinType === type
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              {type} JOIN
            </button>
          ))}
        </div>
      </div>

      {/* Visual tables comparison layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Input Tables */}
        <div className="md:col-span-4 space-y-4">
          {/* Customers */}
          <div className="space-y-1">
            <h4 className="text-[9px] font-black text-zinc-400 dark:text-zinc-550 uppercase">Table A: Customers</h4>
            <div className="overflow-x-auto border border-zinc-200 dark:border-zinc-850 rounded-lg text-[10px]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-50 dark:bg-zinc-900 text-zinc-500 border-b border-zinc-200 dark:border-zinc-800">
                    <th className="p-2 font-bold">id</th>
                    <th className="p-2 font-bold">name</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200/40 dark:divide-zinc-800/40">
                  {customers.map(c => {
                    const isHighlighted = joinType !== 'right' || orders.some(o => o.customerId === c.id);
                    return (
                      <tr key={c.id} className={isHighlighted ? 'bg-indigo-500/[0.04]' : 'opacity-40'}>
                        <td className="p-2 font-mono font-bold">{c.id}</td>
                        <td className="p-2 font-medium">{c.name}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Orders */}
          <div className="space-y-1">
            <h4 className="text-[9px] font-black text-zinc-400 dark:text-zinc-550 uppercase">Table B: Orders</h4>
            <div className="overflow-x-auto border border-zinc-200 dark:border-zinc-850 rounded-lg text-[10px]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-50 dark:bg-zinc-900 text-zinc-500 border-b border-zinc-200 dark:border-zinc-800">
                    <th className="p-2 font-bold">orderId</th>
                    <th className="p-2 font-bold">item</th>
                    <th className="p-2 font-bold">customerId</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200/40 dark:divide-zinc-800/40 font-medium">
                  {orders.map(o => {
                    const isHighlighted = joinType !== 'left' || customers.some(c => c.id === o.customerId);
                    return (
                      <tr key={o.orderId} className={isHighlighted ? 'bg-teal-500/[0.04]' : 'opacity-40'}>
                        <td className="p-2 font-mono font-bold">{o.orderId}</td>
                        <td className="p-2">{o.item}</td>
                        <td className="p-2 font-mono font-bold">{o.customerId}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Venn Diagrams Explanatory Center Column */}
        <div className="md:col-span-3 flex flex-col items-center justify-center p-4 border border-zinc-200/50 dark:border-zinc-850/50 bg-zinc-50/50 dark:bg-zinc-950/20 rounded-2xl">
          <div className="relative w-36 h-24 flex items-center justify-center">
            {/* Left Circle */}
            <div className={`absolute left-4 w-18 h-18 rounded-full border-2 border-indigo-500 transition-all ${
              joinType === 'left' || joinType === 'full' 
                ? 'bg-indigo-500/20' 
                : joinType === 'inner'
                ? 'bg-transparent'
                : 'bg-transparent'
            }`} />
            {/* Right Circle */}
            <div className={`absolute right-4 w-18 h-18 rounded-full border-2 border-teal-500 transition-all ${
              joinType === 'right' || joinType === 'full' 
                ? 'bg-teal-500/20' 
                : joinType === 'inner'
                ? 'bg-transparent'
                : 'bg-transparent'
            }`} />
            {/* Intersecting region highlight */}
            {joinType === 'inner' && (
              <div className="absolute w-6 h-10 bg-indigo-500/30 rounded-full border-r border-l border-indigo-500/40 pointer-events-none" />
            )}
          </div>
          <span className="text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400 mt-2">
            {joinType} JOIN Diagram
          </span>
        </div>

        {/* Output Join Table */}
        <div className="md:col-span-5 space-y-1">
          <h4 className="text-[9px] font-black text-zinc-400 dark:text-zinc-555 uppercase">JOIN Output Result Table</h4>
          <div className="overflow-x-auto border border-zinc-200 dark:border-zinc-800 rounded-lg text-[10px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-100 dark:bg-zinc-900 text-zinc-650 border-b border-zinc-200 dark:border-zinc-800">
                  <th className="p-2 font-bold">name</th>
                  <th className="p-2 font-bold">orderId</th>
                  <th className="p-2 font-bold">item</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/50 dark:divide-zinc-850/80 font-medium">
                {results.map((row, idx) => (
                  <tr key={idx} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition">
                    <td className="p-2 font-semibold text-zinc-900 dark:text-zinc-150">{row.name}</td>
                    <td className="p-2 font-mono font-bold text-zinc-500">{row.orderId || 'NULL'}</td>
                    <td className="p-2 text-zinc-655 dark:text-zinc-400">{row.item || 'NULL'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
