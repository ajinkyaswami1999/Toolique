import { toolsList } from '../data/tools';
import ToolCard from './ToolCard';

interface RelatedToolsProps {
  currentToolSlug: string;
  category: string;
  stepperOnly?: boolean;
}

export default function RelatedTools({ currentToolSlug, category, stepperOnly = false }: RelatedToolsProps) {
  // If stepperOnly is requested, return null since workflows are now accessed via the top floating pill modal
  if (stepperOnly) {
    return null;
  }

  // Category-based related tools list
  let related = toolsList.filter(
    (t) => t.category === category && t.slug !== currentToolSlug
  );

  if (related.length < 3) {
    const extra = toolsList.filter(
      (t) => t.slug !== currentToolSlug && !related.some((r) => r.slug === t.slug)
    );
    related = [...related, ...extra].slice(0, 3);
  } else {
    related = related.slice(0, 3);
  }

  return (
    <section className="mt-12 text-left">
      <h2 className="text-xl md:text-2xl font-bold text-zinc-900 dark:text-white mb-6">
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
