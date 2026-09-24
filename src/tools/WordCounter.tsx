/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo, useRef } from 'react';
import {
  FileText,
  Copy,
  Trash2,
  Clock,
  Check,
  Download,
  Upload,
  BarChart3,
  BookOpen,
  Target,
  Share2,
  Hash,
  Search
} from 'lucide-react';

export type CaseType =
  | 'upper'
  | 'lower'
  | 'title'
  | 'sentence'
  | 'camel'
  | 'snake'
  | 'kebab'
  | 'capitalize';

export type TextTab = 'stats' | 'readability' | 'keywords' | 'social' | 'goals';

const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'as', 'at',
  'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'can', 'could',
  'did', 'do', 'does', 'doing', 'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had', 'has',
  'have', 'having', 'he', 'her', 'here', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'i', 'if',
  'in', 'into', 'is', 'it', 'its', 'itself', 'just', 'me', 'more', 'most', 'my', 'myself', 'no', 'nor',
  'not', 'now', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'our', 'ours', 'ourselves', 'out',
  'over', 'own', 'same', 'she', 'should', 'so', 'some', 'such', 'than', 'that', 'the', 'their', 'theirs',
  'them', 'themselves', 'then', 'there', 'these', 'they', 'this', 'those', 'through', 'to', 'too',
  'under', 'until', 'up', 'very', 'was', 'we', 'were', 'what', 'when', 'where', 'which', 'while', 'who',
  'whom', 'why', 'with', 'would', 'you', 'your', 'yours', 'yourself', 'yourselves'
]);

const SAMPLE_TEXTS = {
  blog: `The rapid evolution of generative artificial intelligence is transforming modern creative workflows. By automating repetitive documentation tasks, engineering teams can focus on high-impact architectural problem-solving.\n\nFrom automated unit test generation to real-time copy refinement, agentic coding systems are redefining productivity. Developers who harness these tools with strategic precision deliver scalable software faster while maintaining robust code quality standards. As the technology matures, thoughtful human oversight remains the cornerstone of resilient software engineering.`,
  essay: `In cognitive psychology, the concept of cognitive load theory posits that instructional design must accommodate the inherent limitations of human working memory. When educational materials present extraneous cognitive demands, the learner's capacity to synthesize germane schemas is significantly diminished.\n\nEmpirical research across multimedia environments indicates that dual-coding methodologies—combining coherent verbal explanations with synchronized visual models—foster superior conceptual retention and deep transfer across problem domains.`,
  social: `🚀 Supercharge your workflow! We just launched our brand new suite of 100% private, client-side developer utilities.\n\n✅ Zero server uploads\n✅ Instant WebAssembly performance\n✅ Free & open for everyone\n\nTry it now and take your productivity to the next level! 🔥 #WebDev #Productivity #TechTools`
};

const SOCIAL_LIMITS = [
  { platform: 'X / Twitter Post', maxChars: 280, idealWords: '30-50 words' },
  { platform: 'Threads Post', maxChars: 500, idealWords: '50-80 words' },
  { platform: 'LinkedIn Post', maxChars: 3000, idealWords: '150-300 words' },
  { platform: 'Instagram Caption', maxChars: 2200, idealWords: '100-150 words' },
  { platform: 'SEO Title Tag', maxChars: 60, idealWords: '6-10 words' },
  { platform: 'SEO Meta Description', maxChars: 160, idealWords: '20-26 words' },
  { platform: 'TikTok Caption', maxChars: 2200, idealWords: '50-100 words' },
  { platform: 'YouTube Title', maxChars: 100, idealWords: '8-12 words' }
];

export default function WordCounter() {
  const [text, setText] = useState<string>('');
  const [activeTab, setActiveTab] = useState<TextTab>('stats');
  const [copied, setCopied] = useState<boolean>(false);
  const [copiedReport, setCopiedReport] = useState<boolean>(false);
  
  // Custom Target Goals
  const [targetWords, setTargetWords] = useState<number>(500);
  const [targetType, setTargetType] = useState<'words' | 'chars'>('words');

  // Keyword filter settings
  const [ignoreStopWords, setIgnoreStopWords] = useState<boolean>(true);
  const [keywordNgram, setKeywordNgram] = useState<1 | 2 | 3>(1);
  const [keywordSearch, setKeywordSearch] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Syllable Counter Helper
  const countSyllablesInWord = (word: string): number => {
    const clean = word.toLowerCase().replace(/[^a-z]/g, '');
    if (!clean) return 0;
    if (clean.length <= 3) return 1;
    const cleaned = clean
      .replace(/(?:[^laeiouy]|ed|es|e)$/, '')
      .replace(/^y/, '');
    const matches = cleaned.match(/[aeiouy]{1,2}/g);
    return matches ? Math.max(1, matches.length) : 1;
  };

  // Comprehensive Real-time Analytics Calculation
  const stats = useMemo(() => {
    const cleanText = text.trim();
    const rawLength = text.length;

    if (!cleanText) {
      return {
        words: 0,
        characters: 0,
        charactersNoSpaces: 0,
        alphanumeric: 0,
        sentences: 0,
        paragraphs: 0,
        lines: 0,
        syllables: 0,
        complexWords: 0,
        uniqueWords: 0,
        lexicalDiversity: 0,
        avgWordLength: 0,
        avgSentenceLength: 0,
        readingTimeSeconds: 0,
        speakingTimeSeconds: 0,
        handwritingTimeSeconds: 0,
        fleschEase: 100,
        fleschGrade: 0,
        gunningFog: 0,
        ari: 0,
        shortestSentenceWords: 0,
        longestSentenceWords: 0
      };
    }

    // Words extraction
    const wordsArray = cleanText
      .split(/\s+/)
      .map(w => w.replace(/^[^\w\d]+|[^\w\d]+$/g, ''))
      .filter(Boolean);
    const wordCount = wordsArray.length;

    // Characters
    const charCountNoSpaces = text.replace(/\s/g, '').length;
    const alphanumericCount = (text.match(/[a-zA-Z0-9]/g) || []).length;

    // Sentences
    const sentencesArray = cleanText
      .split(/(?<=[.!?])\s+(?=[A-Z0-9"']|$)/)
      .map(s => s.trim())
      .filter(s => s.length > 0 && /\w/.test(s));
    const sentenceCount = Math.max(1, sentencesArray.length);

    // Paragraphs & Lines
    const paragraphsArray = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    const paragraphCount = Math.max(cleanText ? 1 : 0, paragraphsArray.length);
    const linesCount = text.split(/\n/).length;

    // Syllables & Complex Words
    let totalSyllables = 0;
    let complexWordCount = 0;
    const wordFrequencyMap: Record<string, number> = {};

    wordsArray.forEach(w => {
      const lower = w.toLowerCase();
      wordFrequencyMap[lower] = (wordFrequencyMap[lower] || 0) + 1;
      const syl = countSyllablesInWord(w);
      totalSyllables += syl;
      if (syl >= 3) complexWordCount++;
    });

    const uniqueWordCount = Object.keys(wordFrequencyMap).length;
    const lexicalDiversity = wordCount > 0 ? (uniqueWordCount / wordCount) * 100 : 0;

    // Averages
    const avgWordLength = wordCount > 0 ? charCountNoSpaces / wordCount : 0;
    const avgSentenceLength = sentenceCount > 0 ? wordCount / sentenceCount : 0;

    // Sentence Length extremes
    const sentenceWordLengths = sentencesArray.map(s => s.split(/\s+/).filter(Boolean).length);
    const shortestSentenceWords = sentenceWordLengths.length > 0 ? Math.min(...sentenceWordLengths) : 0;
    const longestSentenceWords = sentenceWordLengths.length > 0 ? Math.max(...sentenceWordLengths) : 0;

    // Time Estimators (in seconds)
    const readingTimeSeconds = Math.round((wordCount / 225) * 60); // 225 wpm
    const speakingTimeSeconds = Math.round((wordCount / 130) * 60); // 130 wpm
    const handwritingTimeSeconds = Math.round((wordCount / 20) * 60); // 20 wpm

    // Readability Scores
    // Flesch Reading Ease: 206.835 - 1.015 * (words/sentence) - 84.6 * (syllables/word)
    const syllablesPerWord = wordCount > 0 ? totalSyllables / wordCount : 1;
    const wordsPerSentence = wordCount > 0 ? wordCount / sentenceCount : 1;
    
    let fleschEase = 206.835 - (1.015 * wordsPerSentence) - (84.6 * syllablesPerWord);
    fleschEase = Math.max(0, Math.min(100, Math.round(fleschEase * 10) / 10));

    // Flesch-Kincaid Grade: 0.39 * (words/sentence) + 11.8 * (syllables/word) - 15.59
    let fleschGrade = (0.39 * wordsPerSentence) + (11.8 * syllablesPerWord) - 15.59;
    fleschGrade = Math.max(0, Math.round(fleschGrade * 10) / 10);

    // Gunning Fog Index: 0.4 * ((words/sentence) + 100 * (complexWords / words))
    const percentComplex = wordCount > 0 ? (complexWordCount / wordCount) * 100 : 0;
    let gunningFog = 0.4 * (wordsPerSentence + percentComplex);
    gunningFog = Math.max(0, Math.round(gunningFog * 10) / 10);

    // Automated Readability Index (ARI): 4.71 * (chars/words) + 0.5 * (words/sentences) - 21.43
    let ari = (4.71 * (charCountNoSpaces / Math.max(1, wordCount))) + (0.5 * wordsPerSentence) - 21.43;
    ari = Math.max(0, Math.round(ari * 10) / 10);

    return {
      words: wordCount,
      characters: rawLength,
      charactersNoSpaces: charCountNoSpaces,
      alphanumeric: alphanumericCount,
      sentences: sentenceCount,
      paragraphs: paragraphCount,
      lines: linesCount,
      syllables: totalSyllables,
      complexWords: complexWordCount,
      uniqueWords: uniqueWordCount,
      lexicalDiversity: Math.round(lexicalDiversity * 10) / 10,
      avgWordLength: Math.round(avgWordLength * 10) / 10,
      avgSentenceLength: Math.round(avgSentenceLength * 10) / 10,
      readingTimeSeconds,
      speakingTimeSeconds,
      handwritingTimeSeconds,
      fleschEase,
      fleschGrade,
      gunningFog,
      ari,
      shortestSentenceWords,
      longestSentenceWords
    };
  }, [text]);

  // Format Seconds to Minutes:Seconds
  const formatDuration = (totalSeconds: number) => {
    if (totalSeconds < 60) return `${totalSeconds}s`;
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
  };

  // Readability Label and Color
  const readabilityStatus = useMemo(() => {
    const ease = stats.fleschEase;
    if (ease >= 90) return { label: 'Very Easy (5th Grade)', color: 'text-emerald-600 dark:text-emerald-400', badge: 'bg-emerald-500/10 border-emerald-500/20' };
    if (ease >= 80) return { label: 'Easy (6th Grade)', color: 'text-emerald-600 dark:text-emerald-400', badge: 'bg-emerald-500/10 border-emerald-500/20' };
    if (ease >= 70) return { label: 'Fairly Easy (7th Grade)', color: 'text-teal-600 dark:text-teal-400', badge: 'bg-teal-500/10 border-teal-500/20' };
    if (ease >= 60) return { label: 'Standard (8th-9th Grade)', color: 'text-indigo-600 dark:text-indigo-400', badge: 'bg-indigo-500/10 border-indigo-500/20' };
    if (ease >= 50) return { label: 'Fairly Difficult (High School)', color: 'text-amber-600 dark:text-amber-400', badge: 'bg-amber-500/10 border-amber-500/20' };
    if (ease >= 30) return { label: 'Difficult (College Level)', color: 'text-orange-600 dark:text-orange-400', badge: 'bg-orange-500/10 border-orange-500/20' };
    return { label: 'Very Complex (Graduate / Academic)', color: 'text-red-600 dark:text-red-400', badge: 'bg-red-500/10 border-red-500/20' };
  }, [stats.fleschEase]);

  // Keyword Frequency & N-Gram Extraction
  const keywordFrequencies = useMemo(() => {
    if (!text.trim()) return [];
    const cleanWords = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 1);

    const freqMap: Record<string, number> = {};

    if (keywordNgram === 1) {
      cleanWords.forEach(w => {
        if (ignoreStopWords && STOP_WORDS.has(w)) return;
        freqMap[w] = (freqMap[w] || 0) + 1;
      });
    } else if (keywordNgram === 2) {
      for (let i = 0; i < cleanWords.length - 1; i++) {
        const w1 = cleanWords[i];
        const w2 = cleanWords[i + 1];
        if (ignoreStopWords && (STOP_WORDS.has(w1) && STOP_WORDS.has(w2))) continue;
        const phrase = `${w1} ${w2}`;
        freqMap[phrase] = (freqMap[phrase] || 0) + 1;
      }
    } else if (keywordNgram === 3) {
      for (let i = 0; i < cleanWords.length - 2; i++) {
        const w1 = cleanWords[i];
        const w2 = cleanWords[i + 1];
        const w3 = cleanWords[i + 2];
        if (ignoreStopWords && STOP_WORDS.has(w1) && STOP_WORDS.has(w2) && STOP_WORDS.has(w3)) continue;
        const phrase = `${w1} ${w2} ${w3}`;
        freqMap[phrase] = (freqMap[phrase] || 0) + 1;
      }
    }

    const totalCalculated = Object.values(freqMap).reduce((a, b) => a + b, 0) || 1;
    let list = Object.entries(freqMap).map(([phrase, count]) => ({
      phrase,
      count,
      density: Math.round((count / totalCalculated) * 1000) / 10
    }));

    if (keywordSearch.trim()) {
      const q = keywordSearch.toLowerCase();
      list = list.filter(item => item.phrase.includes(q));
    }

    return list.sort((a, b) => b.count - a.count).slice(0, 30);
  }, [text, keywordNgram, ignoreStopWords, keywordSearch]);

  // Case Transformation Engine
  const handleCaseTransform = (type: CaseType) => {
    if (!text) return;
    let result = text;

    switch (type) {
      case 'upper':
        result = text.toUpperCase();
        break;
      case 'lower':
        result = text.toLowerCase();
        break;
      case 'title':
        result = text.replace(/\w\S*/g, (txt) => {
          const lower = txt.toLowerCase();
          if (STOP_WORDS.has(lower) && !txt.match(/^[A-Z]/)) return lower;
          return txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase();
        });
        break;
      case 'sentence':
        result = text.toLowerCase().replace(/(^\s*|[.!?]\s+)([a-z])/g, (_, p1, p2) => p1 + p2.toUpperCase());
        break;
      case 'capitalize':
        result = text.replace(/\b\w/g, (char) => char.toUpperCase());
        break;
      case 'camel':
        result = text
          .toLowerCase()
          .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
          .replace(/^[A-Z]/, (chr) => chr.toLowerCase());
        break;
      case 'snake':
        result = text
          .trim()
          .toLowerCase()
          .replace(/[\s\W-]+/g, '_')
          .replace(/^_+|_+$/g, '');
        break;
      case 'kebab':
        result = text
          .trim()
          .toLowerCase()
          .replace(/[\s\W_]+/g, '-')
          .replace(/^-+|-+$/g, '');
        break;
    }
    setText(result);
  };

  // Quick Text Cleaners
  const handleCleanSpaces = () => {
    const cleaned = text
      .split('\n')
      .map(line => line.replace(/\s+/g, ' ').trim())
      .join('\n');
    setText(cleaned);
  };

  const handleRemoveEmptyLines = () => {
    const cleaned = text
      .split('\n')
      .filter(line => line.trim().length > 0)
      .join('\n');
    setText(cleaned);
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadText = () => {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'word_counter_document.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) setText(content);
      };
      reader.readAsText(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCopyFullReport = () => {
    const report = [
      `=== TOOLIQUE WRITING & TEXT ANALYSIS REPORT ===`,
      `Words: ${stats.words}`,
      `Characters (With Spaces): ${stats.characters}`,
      `Characters (No Spaces): ${stats.charactersNoSpaces}`,
      `Sentences: ${stats.sentences}`,
      `Paragraphs: ${stats.paragraphs}`,
      `Lines: ${stats.lines}`,
      `Vocabulary Richness (Lexical Diversity): ${stats.lexicalDiversity}% (${stats.uniqueWords} unique words)`,
      `Avg Word Length: ${stats.avgWordLength} chars/word`,
      `Avg Sentence Length: ${stats.avgSentenceLength} words/sentence`,
      `Estimated Silent Reading Time: ${formatDuration(stats.readingTimeSeconds)} (~225 wpm)`,
      `Estimated Speaking Presentation Time: ${formatDuration(stats.speakingTimeSeconds)} (~130 wpm)`,
      `Estimated Handwriting Time: ${formatDuration(stats.handwritingTimeSeconds)} (~20 wpm)`,
      `Flesch Reading Ease: ${stats.fleschEase}/100 (${readabilityStatus.label})`,
      `Flesch-Kincaid Grade Level: Grade ${stats.fleschGrade}`,
      `Gunning Fog Index: ${stats.gunningFog}`,
      `Automated Readability Index (ARI): ${stats.ari}`,
      `Report Generated: ${new Date().toLocaleString()}`,
      `Engine: Toolique In-Memory Natural Language Analyzer`
    ].join('\n');

    navigator.clipboard.writeText(report);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2500);
  };

  // Goal Progress Calculation
  const currentGoalValue = targetType === 'words' ? stats.words : stats.characters;
  const goalPercentage = targetWords > 0 ? Math.min(100, Math.round((currentGoalValue / targetWords) * 100)) : 0;
  const goalRemaining = Math.max(0, targetWords - currentGoalValue);

  return (
    <div className="max-w-7xl mx-auto space-y-6 text-left">
      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Text Area & Formatters (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="saas-card p-5 space-y-3">
            {/* Editor Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="text-xs font-bold text-zinc-900 dark:text-white">Editor Canvas</span>
                <span className="text-[11px] text-zinc-500 font-mono">
                  ({stats.words} words &bull; {stats.characters} chars)
                </span>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                {/* Quick Sample Buttons */}
                <button
                  onClick={() => setText(SAMPLE_TEXTS.blog)}
                  className="px-2 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 text-xs font-semibold hover:bg-indigo-50 dark:hover:bg-zinc-700 transition cursor-pointer"
                >
                  Sample Blog
                </button>
                <button
                  onClick={() => setText(SAMPLE_TEXTS.essay)}
                  className="px-2 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 text-xs font-semibold hover:bg-indigo-50 dark:hover:bg-zinc-700 transition cursor-pointer"
                >
                  Sample Essay
                </button>
                <button
                  onClick={() => setText(SAMPLE_TEXTS.social)}
                  className="px-2 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 text-xs font-semibold hover:bg-indigo-50 dark:hover:bg-zinc-700 transition cursor-pointer"
                >
                  Sample Social
                </button>

                <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-700 mx-0.5" />

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt, .md, .csv, .json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  title="Upload Text File (.txt, .md)"
                  className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                </button>
                <button
                  onClick={handleDownloadText}
                  disabled={!text}
                  title="Download as .txt"
                  className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition disabled:opacity-40 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={handleCopyText}
                  disabled={!text}
                  title="Copy Text to Clipboard"
                  className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition disabled:opacity-40 flex items-center gap-1 text-xs font-bold cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setText('')}
                  disabled={!text}
                  title="Clear Canvas"
                  className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition disabled:opacity-40 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Large Text Area */}
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste or write your text here to analyze words, reading speed, readability grade, and keyword density in real-time..."
              className="w-full h-80 sm:h-96 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white font-sans text-sm leading-relaxed focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-y"
            />

            {/* Case Converters & Text Cleaners Toolbar */}
            <div className="space-y-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Case Converters & Cleaners</span>
              </div>
              
              <div className="flex flex-wrap gap-1.5 text-xs">
                <button
                  onClick={() => handleCaseTransform('upper')}
                  disabled={!text}
                  className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-indigo-600 hover:text-white font-semibold transition disabled:opacity-40 cursor-pointer"
                >
                  UPPERCASE
                </button>
                <button
                  onClick={() => handleCaseTransform('lower')}
                  disabled={!text}
                  className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-indigo-600 hover:text-white font-semibold transition disabled:opacity-40 cursor-pointer"
                >
                  lowercase
                </button>
                <button
                  onClick={() => handleCaseTransform('title')}
                  disabled={!text}
                  className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-indigo-600 hover:text-white font-semibold transition disabled:opacity-40 cursor-pointer"
                >
                  Title Case
                </button>
                <button
                  onClick={() => handleCaseTransform('sentence')}
                  disabled={!text}
                  className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-indigo-600 hover:text-white font-semibold transition disabled:opacity-40 cursor-pointer"
                >
                  Sentence case
                </button>
                <button
                  onClick={() => handleCaseTransform('capitalize')}
                  disabled={!text}
                  className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-indigo-600 hover:text-white font-semibold transition disabled:opacity-40 cursor-pointer"
                >
                  Capitalize Words
                </button>
                <button
                  onClick={() => handleCaseTransform('camel')}
                  disabled={!text}
                  className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-indigo-600 hover:text-white font-semibold transition disabled:opacity-40 cursor-pointer"
                >
                  camelCase
                </button>
                <button
                  onClick={() => handleCaseTransform('snake')}
                  disabled={!text}
                  className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-indigo-600 hover:text-white font-semibold transition disabled:opacity-40 cursor-pointer"
                >
                  snake_case
                </button>
                <button
                  onClick={() => handleCaseTransform('kebab')}
                  disabled={!text}
                  className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-indigo-600 hover:text-white font-semibold transition disabled:opacity-40 cursor-pointer"
                >
                  kebab-case
                </button>
                <button
                  onClick={handleCleanSpaces}
                  disabled={!text}
                  className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 font-semibold transition disabled:opacity-40 cursor-pointer"
                >
                  Clean Spaces
                </button>
                <button
                  onClick={handleRemoveEmptyLines}
                  disabled={!text}
                  className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 font-semibold transition disabled:opacity-40 cursor-pointer"
                >
                  Strip Empty Lines
                </button>
              </div>
            </div>
          </div>

          {/* Quick Copy Report Action */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <span className="text-xs text-zinc-600 dark:text-zinc-400">
              Need a full analytics manifest for editors or clients?
            </span>
            <button
              onClick={handleCopyFullReport}
              disabled={!text}
              className="px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-bold hover:border-indigo-500 transition flex items-center gap-1.5 shadow-xs disabled:opacity-40 cursor-pointer"
            >
              {copiedReport ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-indigo-500" />}
              <span>{copiedReport ? 'Report Copied!' : 'Copy Full Report'}</span>
            </button>
          </div>
        </div>

        {/* Right Column: Multi-Tab Intelligence Panel (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Tab Navigation */}
          <div className="saas-card p-2">
            <div className="grid grid-cols-5 gap-1 bg-zinc-100 dark:bg-zinc-900/80 p-1 rounded-xl">
              {[
                { id: 'stats', label: 'Stats', icon: BarChart3 },
                { id: 'readability', label: 'Readability', icon: BookOpen },
                { id: 'keywords', label: 'Keywords', icon: Hash },
                { id: 'social', label: 'Social', icon: Share2 },
                { id: 'goals', label: 'Goals', icon: Target }
              ].map((tab) => {
                const Icon = tab.icon;
                const isSelected = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TextTab)}
                    className={`py-2 px-1 rounded-lg text-xs font-bold flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
                      isSelected
                        ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                        : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="text-[10px] sm:text-xs">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* TAB 1: Core Statistics */}
          {activeTab === 'stats' && (
            <div className="saas-card p-5 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Core Text Metrics
              </h3>

              {/* Primary Stat Badges */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                  <span className="text-[10px] font-bold uppercase text-indigo-600 dark:text-indigo-400 tracking-wider">Words</span>
                  <p className="text-2xl font-black text-indigo-700 dark:text-indigo-300 mt-0.5">{stats.words}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20">
                  <span className="text-[10px] font-bold uppercase text-purple-600 dark:text-purple-400 tracking-wider">Characters</span>
                  <p className="text-2xl font-black text-purple-700 dark:text-purple-300 mt-0.5">{stats.characters}</p>
                </div>
              </div>

              {/* Secondary Details Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
                  <span className="text-zinc-500">No Spaces</span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">{stats.charactersNoSpaces}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
                  <span className="text-zinc-500">Sentences</span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">{stats.sentences}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
                  <span className="text-zinc-500">Paragraphs</span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">{stats.paragraphs}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
                  <span className="text-zinc-500">Lines</span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">{stats.lines}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
                  <span className="text-zinc-500">Unique Words</span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">{stats.uniqueWords}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
                  <span className="text-zinc-500">Lexical Richness</span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">{stats.lexicalDiversity}%</span>
                </div>
              </div>

              {/* Time Estimators Card */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-850 border border-zinc-200 dark:border-zinc-800 space-y-3">
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-500" />
                  Estimated Time Duration
                </span>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">Silent Reading (225 wpm)</span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-md">
                      ~{formatDuration(stats.readingTimeSeconds)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">Speaking Speech (130 wpm)</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
                      ~{formatDuration(stats.speakingTimeSeconds)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">Handwriting Speed (20 wpm)</span>
                    <span className="font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md">
                      ~{formatDuration(stats.handwritingTimeSeconds)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Averages */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 text-center">
                  <p className="text-[10px] text-zinc-400 font-bold uppercase">Avg Word Length</p>
                  <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200 mt-1">{stats.avgWordLength} chars</p>
                </div>
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 text-center">
                  <p className="text-[10px] text-zinc-400 font-bold uppercase">Avg Sentence Length</p>
                  <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200 mt-1">{stats.avgSentenceLength} words</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Readability & Complexity */}
          {activeTab === 'readability' && (
            <div className="saas-card p-5 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Readability Indices
              </h3>

              {/* Flesch Reading Ease Hero */}
              <div className={`p-4 rounded-xl border ${readabilityStatus.badge} text-left space-y-1`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Flesch Reading Ease</span>
                  <span className={`text-xl font-black ${readabilityStatus.color}`}>
                    {stats.fleschEase} <span className="text-xs font-normal">/ 100</span>
                  </span>
                </div>
                <p className={`text-xs font-bold ${readabilityStatus.color}`}>{readabilityStatus.label}</p>
                <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden mt-2">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 via-indigo-500 to-red-500 transition-all duration-300"
                    style={{ width: `${stats.fleschEase}%` }}
                  />
                </div>
              </div>

              {/* Standard Formulas Breakdown */}
              <div className="space-y-2.5 text-xs">
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-zinc-900 dark:text-white">Flesch-Kincaid Grade Level</p>
                    <p className="text-[10px] text-zinc-400">US school education equivalent</p>
                  </div>
                  <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">Grade {stats.fleschGrade}</span>
                </div>

                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-zinc-900 dark:text-white">Gunning Fog Index</p>
                    <p className="text-[10px] text-zinc-400">Years of formal education required</p>
                  </div>
                  <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{stats.gunningFog}</span>
                </div>

                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-zinc-900 dark:text-white">Automated Readability Index (ARI)</p>
                    <p className="text-[10px] text-zinc-400">Character-based comprehension index</p>
                  </div>
                  <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{stats.ari}</span>
                </div>
              </div>

              {/* Structural Metrics */}
              <div className="p-3.5 rounded-xl bg-zinc-100 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Total Syllables:</span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">{stats.syllables}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Complex Words (3+ syllables):</span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">{stats.complexWords}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Longest Sentence:</span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">{stats.longestSentenceWords} words</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Keyword Density */}
          {activeTab === 'keywords' && (
            <div className="saas-card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-2">
                  <Hash className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  Keyword Frequency & Density
                </h3>
                <span className="text-[11px] text-zinc-400">{keywordFrequencies.length} terms</span>
              </div>

              {/* N-Gram & Filter Controls */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div className="flex rounded-lg bg-zinc-100 dark:bg-zinc-800 p-0.5 text-xs font-bold">
                  <button
                    onClick={() => setKeywordNgram(1)}
                    className={`px-2.5 py-1 rounded-md transition cursor-pointer ${keywordNgram === 1 ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-white shadow-xs' : 'text-zinc-500'}`}
                  >
                    1-Word
                  </button>
                  <button
                    onClick={() => setKeywordNgram(2)}
                    className={`px-2.5 py-1 rounded-md transition cursor-pointer ${keywordNgram === 2 ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-white shadow-xs' : 'text-zinc-500'}`}
                  >
                    2-Word
                  </button>
                  <button
                    onClick={() => setKeywordNgram(3)}
                    className={`px-2.5 py-1 rounded-md transition cursor-pointer ${keywordNgram === 3 ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-white shadow-xs' : 'text-zinc-500'}`}
                  >
                    3-Word
                  </button>
                </div>

                <label className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ignoreStopWords}
                    onChange={(e) => setIgnoreStopWords(e.target.checked)}
                    className="rounded accent-indigo-600 cursor-pointer"
                  />
                  <span>Ignore stop words</span>
                </label>
              </div>

              {/* Search filter */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Filter keywords..."
                  value={keywordSearch}
                  onChange={(e) => setKeywordSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Keywords Table List */}
              {keywordFrequencies.length > 0 ? (
                <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden max-h-72 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-zinc-100 dark:bg-zinc-800/90 text-zinc-500 sticky top-0">
                      <tr>
                        <th className="p-2.5 font-bold">Keyword / Phrase</th>
                        <th className="p-2.5 font-bold text-center">Count</th>
                        <th className="p-2.5 font-bold text-right">Density</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                      {keywordFrequencies.map((kw, idx) => (
                        <tr key={kw.phrase + idx} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                          <td className="p-2.5 font-medium text-zinc-800 dark:text-zinc-200 truncate max-w-[180px]">
                            {kw.phrase}
                          </td>
                          <td className="p-2.5 text-center font-bold text-zinc-700 dark:text-zinc-300">
                            {kw.count}
                          </td>
                          <td className="p-2.5 text-right font-mono font-bold text-indigo-600 dark:text-indigo-400">
                            {kw.density}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-zinc-400 bg-zinc-50 dark:bg-zinc-900/40 rounded-xl">
                  {text ? 'No matching keywords found.' : 'Enter text on the left to analyze keyword frequencies.'}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Social Media Limits */}
          {activeTab === 'social' && (
            <div className="saas-card p-5 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-2">
                <Share2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Social Media Character Limits
              </h3>

              <div className="space-y-3 text-xs">
                {SOCIAL_LIMITS.map((item) => {
                  const currentChars = stats.characters;
                  const percent = Math.min(100, Math.round((currentChars / item.maxChars) * 100));
                  const isOver = currentChars > item.maxChars;
                  const remaining = item.maxChars - currentChars;

                  return (
                    <div key={item.platform} className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-zinc-800 dark:text-zinc-200">{item.platform}</span>
                        <span className={`font-mono font-bold ${isOver ? 'text-red-500' : 'text-zinc-600 dark:text-zinc-400'}`}>
                          {currentChars} / {item.maxChars} chars
                        </span>
                      </div>

                      <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-200 ${isOver ? 'bg-red-500' : percent > 85 ? 'bg-amber-500' : 'bg-indigo-600'}`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-0.5">
                        <span>Ideal: {item.idealWords}</span>
                        <span className={isOver ? 'text-red-500 font-bold' : remaining <= 20 ? 'text-amber-500 font-bold' : ''}>
                          {isOver ? `${Math.abs(remaining)} chars over limit!` : `${remaining} chars left`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 5: Writing Goals Tracker */}
          {activeTab === 'goals' && (
            <div className="saas-card p-5 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Writing Target & Progress Goal
              </h3>

              {/* Goal Setup Controls */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <span className="text-zinc-500 font-semibold">Target Metric</span>
                  <select
                    value={targetType}
                    onChange={(e) => setTargetType(e.target.value as any)}
                    className="w-full p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white font-medium focus:outline-none focus:border-indigo-500"
                  >
                    <option value="words">Word Count</option>
                    <option value="chars">Character Count</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <span className="text-zinc-500 font-semibold">Target Goal</span>
                  <input
                    type="number"
                    min="1"
                    value={targetWords}
                    onChange={(e) => setTargetWords(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="w-full p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white font-bold focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Quick Preset Goals */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[
                  { label: 'Social Post (50w)', val: 50 },
                  { label: 'Short Abstract (150w)', val: 150 },
                  { label: 'Blog Article (500w)', val: 500 },
                  { label: 'Longform Essay (1,000w)', val: 1000 },
                  { label: 'Chapter (2,500w)', val: 2500 }
                ].map((g) => (
                  <button
                    key={g.label}
                    onClick={() => { setTargetType('words'); setTargetWords(g.val); }}
                    className={`px-2 py-0.5 rounded-lg text-[11px] font-bold border transition cursor-pointer ${
                      targetWords === g.val && targetType === 'words'
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>

              {/* Goal Progress Hero Card */}
              <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-center space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-indigo-700 dark:text-indigo-300">
                  <span>Current: {currentGoalValue} {targetType}</span>
                  <span>Goal: {targetWords} {targetType}</span>
                </div>

                <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-3 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 transition-all duration-300 rounded-full"
                    style={{ width: `${goalPercentage}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="font-black text-lg text-indigo-700 dark:text-indigo-300">
                    {goalPercentage}% Done
                  </span>
                  <span className="text-zinc-500 font-semibold">
                    {goalRemaining === 0 ? '🎉 Goal Achieved!' : `${goalRemaining} ${targetType} remaining`}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
