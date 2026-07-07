import { useState } from 'react';
import { Shuffle, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { flashcardsList, type Flashcard } from '../data/flashcards';

export default function FlashcardViewer() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [cards, setCards] = useState<Flashcard[]>(flashcardsList);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownCount, setKnownCount] = useState<string[]>([]);

  const filteredCards = selectedCategory === 'all' 
    ? cards 
    : cards.filter(c => c.category === selectedCategory);

  const currentCard = filteredCards[currentIndex];

  const handleNext = () => {
    if (filteredCards.length === 0) return;
    setIsFlipped(false);
    setCurrentIndex(prev => (prev + 1) % filteredCards.length);
  };

  const handlePrev = () => {
    if (filteredCards.length === 0) return;
    setIsFlipped(false);
    setCurrentIndex(prev => (prev - 1 + filteredCards.length) % filteredCards.length);
  };

  const handleShuffle = () => {
    setIsFlipped(false);
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentIndex(0);
  };

  const handleMarkKnown = () => {
    if (!currentCard) return;
    if (!knownCount.includes(currentCard.id)) {
      setKnownCount([...knownCount, currentCard.id]);
    }
    handleNext();
  };

  const categories = ['all', 'sql', 'python', 'javascript', 'react', 'qa'];

  return (
    <div className="space-y-6 p-6 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white/40 dark:bg-zinc-950/40 backdrop-blur-md text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Revision Flashcards</h3>
          <p className="text-[11px] text-zinc-500 mt-0.5">Quickly revise concepts. Flip the cards to verify answers.</p>
        </div>

        {/* Category select tabs */}
        <div className="flex flex-wrap gap-1 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl shrink-0">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setCurrentIndex(0);
                setIsFlipped(false);
              }}
              className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-850 dark:hover:text-zinc-250'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {currentCard ? (
        <div className="max-w-md mx-auto space-y-6">
          {/* Flippable Card Container */}
          <div 
            onClick={() => setIsFlipped(!isFlipped)}
            className="w-full h-56 relative cursor-pointer select-none group"
            style={{ perspective: '1000px' }}
          >
            {/* Inner rotatable block */}
            <div 
              className={`w-full h-full rounded-2xl border transition-all duration-500 shadow-sm relative`}
              style={{
                transformStyle: 'preserve-3d',
                transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
              }}
            >
              {/* Front Side */}
              <div 
                className="absolute inset-0 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col justify-between items-center text-center backface-hidden"
                style={{ backfaceVisibility: 'hidden' }}
              >
                <span className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  {currentCard.category}
                </span>
                <p className="text-sm font-bold text-zinc-850 dark:text-zinc-150 px-4 leading-relaxed">
                  {currentCard.front}
                </p>
                <span className="text-[10px] text-zinc-400 flex items-center gap-1.5 font-bold uppercase tracking-wider">
                  <RefreshCw className="w-3.5 h-3.5" /> Tap to Flip
                </span>
              </div>

              {/* Back Side */}
              <div 
                className="absolute inset-0 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex flex-col justify-between items-center text-center backface-hidden"
                style={{
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)'
                }}
              >
                <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  Answer / Code
                </span>
                <p className="text-xs font-medium text-zinc-655 dark:text-zinc-300 px-2 leading-relaxed">
                  {currentCard.back}
                </p>
                <span className="text-[10px] text-zinc-400 flex items-center gap-1.5 font-bold uppercase tracking-wider">
                  <RefreshCw className="w-3.5 h-3.5" /> Tap to Flip
                </span>
              </div>
            </div>
          </div>

          {/* Cards controls indicators */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold text-zinc-450 dark:text-zinc-500">
                {currentIndex + 1} / {filteredCards.length}
              </span>
              <button
                onClick={handleNext}
                className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleShuffle}
                className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider cursor-pointer"
                title="Shuffle Deck"
              >
                <Shuffle className="w-3.5 h-3.5" /> Shuffle
              </button>
              <button
                onClick={handleMarkKnown}
                className="saas-button-primary py-2 px-3 text-[10px] font-black uppercase tracking-wider cursor-pointer"
              >
                Got It!
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-10 text-xs text-zinc-450 dark:text-zinc-600">
          No flashcards available in this category.
        </div>
      )}
    </div>
  );
}
