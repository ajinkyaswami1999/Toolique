import { useRef } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { ArrowRight, Download, Mail, Sparkles } from 'lucide-react';
import { socialLinks } from '../../config/socialLinks';
import { rotatingSubtitles, missionStatement } from '../../data/founder';
import RotatingText from './RotatingText';
import { GithubIcon, LinkedinIcon, InstagramIcon } from './icons';

interface HeroProps {
  scrollToSection: (id: string) => void;
}

const floatingBadges = [
  { label: 'Founder', className: '-top-3 -left-3' },
  { label: 'Builder', className: '-top-3 -right-3' },
  { label: 'AI', className: '-bottom-3 -left-3' },
  { label: 'Maker', className: '-bottom-3 -right-3' }
];

export default function Hero({ scrollToSection }: HeroProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-0.5, 0.5], [8, -8]);
  const rotateY = useTransform(x, [-0.5, 0.5], [-8, 8]);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <div className="p-6 sm:p-10 rounded-3xl border border-zinc-200/60 dark:border-zinc-800/60 bg-gradient-to-br from-white/70 to-white/30 dark:from-zinc-900/60 dark:to-zinc-950/30 backdrop-blur-md shadow-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/[0.05] dark:bg-indigo-500/[0.03] rounded-bl-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-teal-500/[0.05] dark:bg-teal-500/[0.03] rounded-tr-full pointer-events-none" />

      <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
        {/* Founder Photo */}
        <div
          ref={wrapperRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="relative shrink-0"
          style={{ perspective: 800 }}
        >
          <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-indigo-500 via-purple-500 to-teal-500 opacity-40 blur-xl hover:opacity-60 transition duration-300" />

          <motion.div
            style={{ rotateX, rotateY }}
            className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-3xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xl"
          >
            <img
              src="/founder.jpeg"
              alt="Ajinkya Swami"
              loading="eager"
              fetchPriority="high"
              className="w-full h-full object-cover"
            />
          </motion.div>

          {floatingBadges.map((badge, idx) => (
            <motion.div
              key={badge.label}
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: idx * 0.4 }}
              className={`absolute ${badge.className} px-2.5 py-1 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 shadow-md text-[10px] font-bold text-zinc-700 dark:text-zinc-200 z-20`}
            >
              {badge.label}
            </motion.div>
          ))}
        </div>

        <div className="space-y-4 text-center md:text-left flex-grow">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold uppercase tracking-wider">
            <Sparkles className="w-3 h-3" /> 👋 Founder Profile
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-zinc-900 dark:text-white">
            Ajinkya Swami
          </h1>
          <h2 className="text-lg sm:text-xl font-semibold text-zinc-600 dark:text-zinc-300 leading-relaxed">
            <RotatingText words={rotatingSubtitles} />
          </h2>
          <p className="text-sm sm:text-base text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-2xl font-medium">
            {missionStatement}
          </p>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
            {socialLinks.toolique && (
              <a href="/" className="saas-button-primary text-xs">
                Explore Toolique <ArrowRight className="w-3.5 h-3.5" />
              </a>
            )}
            <button
              onClick={() => scrollToSection('projects')}
              className="saas-button-secondary text-xs"
            >
              View Projects
            </button>
            <a
              href="/Ajinkya_Swami_QA_Resume.pdf"
              download
              className="saas-button-secondary text-xs"
            >
              Download Resume <Download className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={() => scrollToSection('connect')}
              className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800/80 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-xs font-bold text-zinc-600 dark:text-zinc-300 transition cursor-pointer"
            >
              Connect With Me
            </button>
          </div>

          <div className="flex items-center justify-center md:justify-start gap-3 pt-2">
            {socialLinks.github && (
              <a
                href={socialLinks.github}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-500/30 transition"
              >
                <GithubIcon className="w-4 h-4" />
              </a>
            )}
            {socialLinks.linkedin && (
              <a
                href={socialLinks.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-500/30 transition"
              >
                <LinkedinIcon className="w-4 h-4" />
              </a>
            )}
            {socialLinks.instagramPersonal && (
              <a
                href={socialLinks.instagramPersonal}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-500/30 transition"
              >
                <InstagramIcon className="w-4 h-4" />
              </a>
            )}
            {socialLinks.email && (
              <a
                href={`mailto:${socialLinks.email}`}
                className="w-9 h-9 rounded-full border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-500/30 transition"
              >
                <Mail className="w-4 h-4" />
              </a>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
