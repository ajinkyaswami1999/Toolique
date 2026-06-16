import { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import type { ToolFAQ } from '../data/tools';

interface FAQSectionProps {
  faqs: ToolFAQ[];
  title?: string;
}

export default function FAQSection({ faqs, title = 'Frequently Asked Questions' }: FAQSectionProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  if (!faqs || faqs.length === 0) return null;

  return (
    <section className="mt-12 p-6 md:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
      <h2 className="flex items-center gap-2.5 text-xl md:text-2xl font-bold text-slate-800 dark:text-white mb-6">
        <HelpCircle className="w-6 h-6 text-teal-600 dark:text-teal-400" />
        {title}
      </h2>
      <div className="space-y-4">
        {faqs.map((faq, index) => {
          const isOpen = activeIndex === index;
          return (
            <div 
              key={index} 
              className="border-b border-slate-100 dark:border-slate-800/60 pb-4 last:border-none last:pb-0"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="flex justify-between items-center w-full text-left font-semibold text-slate-700 dark:text-slate-200 hover:text-teal-600 dark:hover:text-teal-400 py-2 transition"
                aria-expanded={isOpen}
              >
                <span className="pr-4 text-base md:text-lg">{faq.question}</span>
                {isOpen ? (
                  <ChevronUp className="w-5 h-5 text-slate-400 shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                )}
              </button>
              <div 
                className={`overflow-hidden transition-all duration-300 ${
                  isOpen ? 'max-h-[500px] mt-2 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed whitespace-pre-line pl-1 pb-2">
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
