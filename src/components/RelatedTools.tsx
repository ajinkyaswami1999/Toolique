import { toolsList } from '../data/tools';
import ToolCard from './ToolCard';

interface RelatedToolsProps {
  currentToolSlug: string;
  category: string;
}

export default function RelatedTools({ currentToolSlug, category }: RelatedToolsProps) {
  // Find tools in same category excluding current tool
  let related = toolsList.filter(
    (t) => t.category === category && t.slug !== currentToolSlug
  );

  // If we don't have enough, fill in with tools from other categories
  if (related.length < 3) {
    const extra = toolsList.filter(
      (t) => t.slug !== currentToolSlug && !related.some((r) => r.slug === t.slug)
    );
    related = [...related, ...extra].slice(0, 3);
  } else {
    related = related.slice(0, 3);
  }

  return (
    <section className="mt-12">
      <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white mb-6">
        Related Tools You Might Find Useful
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {related.map((tool) => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </div>
    </section>
  );
}
