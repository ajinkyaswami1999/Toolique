import { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import type { ToolFAQ } from '../data/tools';

interface FAQSectionProps {
  faqs: ToolFAQ[];
  title?: string;
}

export default function FAQSection({ faqs, title = 'Frequently Asked Questions' }: FAQSectionProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Guarantee 100% strict deduplication of questions
  const uniqueFaqs = useMemo(() => {
    if (!faqs || faqs.length === 0) return [];
    const seen = new Set<string>();
    return faqs.filter((faq) => {
      if (!faq || !faq.question || !faq.answer) return false;
      const key = faq.question.trim().toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [faqs]);

  const toggleFAQ = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  if (uniqueFaqs.length === 0) return null;

  return (
    <section className="mt-8 p-6 md:p-8 rounded-3xl saas-card border border-zinc-200/70 dark:border-zinc-800/70 shadow-xs">
      <h2 className="flex items-center gap-2.5 text-lg md:text-xl font-black text-zinc-900 dark:text-white mb-6">
        <div className="p-1.5 rounded-xl bg-pastel-lavender/30 text-indigo-600 dark:text-indigo-400 border border-pastel-lavender/50">
          <HelpCircle className="w-5 h-5" />
        </div>
        {title}
      </h2>
      <div className="space-y-3">
        {uniqueFaqs.map((faq, index) => {
          const isOpen = activeIndex === index;
          return (
            <div 
              key={index} 
              className="border-b border-zinc-100 dark:border-zinc-800/60 pb-3.5 last:border-none last:pb-0"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="flex justify-between items-center w-full text-left font-bold text-zinc-800 dark:text-zinc-200 hover:text-indigo-600 dark:hover:text-indigo-400 py-1.5 transition cursor-pointer"
                aria-expanded={isOpen}
              >
                <span className="pr-4 text-sm md:text-base">{faq.question}</span>
                {isOpen ? (
                  <ChevronUp className="w-4 h-4 text-zinc-400 shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-zinc-400 shrink-0" />
                )}
              </button>
              <div 
                className={`overflow-hidden transition-all duration-300 ${
                  isOpen ? 'max-h-[500px] mt-2 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <p className="text-zinc-600 dark:text-zinc-400 text-xs md:text-sm leading-relaxed whitespace-pre-line pl-1 pb-1">
                  {faq.answer}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

