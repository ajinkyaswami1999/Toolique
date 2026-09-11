import { useRef } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { 
  ArrowRight, 
  Sparkles, 
  Terminal, 
  Cpu, 
  ShieldCheck, 
  Code2, 
  Box,
  Mail,
  Zap,
  Activity,
  CheckCircle2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { socialLinks } from '../../config/socialLinks';
import { rotatingSubtitles, missionStatement } from '../../data/founder';
import RotatingText from './RotatingText';
import { GithubIcon, LinkedinIcon, InstagramIcon } from './icons';

interface HeroProps {
  scrollToSection: (id: string) => void;
}

const floatingBadges = [
  { label: 'Founder', icon: Sparkles, color: 'text-indigo-500 dark:text-indigo-400', border: 'border-indigo-500/30', className: '-top-3.5 -left-3.5' },
  { label: 'QA Architect', icon: ShieldCheck, color: 'text-emerald-500 dark:text-emerald-400', border: 'border-emerald-500/30', className: '-top-3.5 -right-3.5' },
  { label: 'Full-Stack', icon: Code2, color: 'text-sky-500 dark:text-sky-400', border: 'border-sky-500/30', className: '-bottom-3.5 -left-3.5' },
  { label: 'Maker & 3D', icon: Box, color: 'text-purple-500 dark:text-purple-400', border: 'border-purple-500/30', className: '-bottom-3.5 -right-3.5' }
];

export default function Hero({ scrollToSection }: HeroProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-0.5, 0.5], [12, -12]);
  const rotateY = useTransform(x, [-0.5, 0.5], [-12, 12]);
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
    <div className="relative p-6 sm:p-10 lg:p-12 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 bg-gradient-to-br from-white/95 via-white/70 to-indigo-50/30 dark:from-zinc-900/90 dark:via-zinc-950/70 dark:to-indigo-950/20 backdrop-blur-xl shadow-xl shadow-indigo-500/5 dark:shadow-none overflow-hidden text-left">
      
      {/* Decorative ambient background glows */}
      <div 
        className="absolute -top-12 -right-12 w-64 h-64 rounded-full pointer-events-none opacity-40 dark:opacity-20 blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(99, 102, 241, 0.4) 0%, transparent 70%)' }}
      />
      <div 
        className="absolute -bottom-12 -left-12 w-64 h-64 rounded-full pointer-events-none opacity-40 dark:opacity-20 blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(20, 184, 166, 0.35) 0%, transparent 70%)' }}
      />

      <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-12 relative z-10">
        
        {/* Developer System Insignia / 3D Monogram Avatar (No Personal Photo) */}
        <div
          ref={wrapperRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="relative shrink-0 select-none py-2"
          style={{ perspective: 1000 }}
        >
          {/* Pulsing Ambient Avatar Glow */}
          <div className="absolute -inset-3 rounded-3xl bg-gradient-to-tr from-indigo-500/30 via-purple-500/30 to-teal-500/30 opacity-60 blur-2xl group-hover:opacity-100 transition-opacity duration-700 animate-pulse" />

          <motion.div
            style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
            className="relative w-44 h-44 sm:w-52 sm:h-52 rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 border-2 border-indigo-500/40 dark:border-indigo-400/40 shadow-2xl flex flex-col items-center justify-between p-4 overflow-hidden group cursor-pointer"
          >
            {/* Background Circuit Grid Pattern */}
            <div className="absolute inset-0 bg-dot-grid opacity-30 group-hover:opacity-50 transition-opacity duration-500" />
            
            {/* Subtle Neon Horizon Scanline */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-teal-400 to-transparent opacity-75" />
            
            {/* Top Status Bar in Monogram Avatar */}
            <div className="relative z-10 w-full flex items-center justify-between">
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[9px] font-mono font-bold text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>ONLINE</span>
              </div>
              <div className="flex items-center gap-1 text-[9px] font-mono text-zinc-500">
                <Terminal className="w-3 h-3 text-indigo-400" />
                <span>v2.4</span>
              </div>
            </div>

            {/* Central Stylized Monogram */}
            <div className="relative z-10 flex flex-col items-center justify-center my-auto">
              <div className="relative flex items-baseline">
                <span className="text-5xl sm:text-6xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-teal-400 via-indigo-300 to-purple-400 drop-shadow-md font-mono select-none">
                  AS
                </span>
                <span className="ml-1 text-indigo-400 text-sm font-mono font-bold animate-pulse">
                  _
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[9px] font-mono text-zinc-400 uppercase tracking-widest mt-1 bg-zinc-800/80 px-2.5 py-0.5 rounded-md border border-zinc-700/60">
                <Cpu className="w-3 h-3 text-indigo-400" />
                <span>ARCHITECT</span>
              </div>
            </div>

            {/* Telemetry Micro-Bar at Base */}
            <div className="relative z-10 w-full pt-1.5 border-t border-zinc-800/80 flex items-center justify-between text-[8px] font-mono text-zinc-400">
              <span className="text-teal-400 flex items-center gap-0.5">
                <Zap className="w-2.5 h-2.5" /> 100% RAM
              </span>
              <span className="text-purple-400">0B SERVER</span>
            </div>

            {/* Glowing Accent Border Strip */}
            <div className="absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r from-teal-400 via-indigo-500 to-purple-500" />
          </motion.div>

          {/* Floating Badges with Orbital Micro-Animations */}
          {floatingBadges.map((badge, idx) => {
            const BadgeIcon = badge.icon;
            return (
              <motion.div
                key={badge.label}
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: idx * 0.45 }}
                className={`absolute ${badge.className} px-3 py-1 rounded-full bg-white/95 dark:bg-zinc-900/95 border ${badge.border} shadow-lg text-[10px] font-bold text-zinc-800 dark:text-zinc-200 z-20 flex items-center gap-1.5 backdrop-blur-md hover:scale-105 transition-transform`}
              >
                <BadgeIcon className={`w-3.5 h-3.5 ${badge.color}`} />
                <span>{badge.label}</span>
              </motion.div>
            );
          })}
        </div>

        {/* Founder Bio & Narrative */}
        <div className="space-y-4 text-center lg:text-left flex-grow">
          
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20 text-[10px] font-black uppercase tracking-wider shadow-2xs">
              <Sparkles className="w-3 h-3 text-indigo-500" />
              <span>Software Architect & Founder</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-black uppercase tracking-wider shadow-2xs">
              <Activity className="w-3 h-3 text-emerald-500" />
              <span>274+ Live Tools</span>
            </div>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-zinc-900 dark:text-white leading-[1.08]">
            Ajinkya Swami
          </h1>

          <div className="text-sm sm:text-lg font-bold text-indigo-600 dark:text-indigo-400 min-h-[1.75rem] flex items-center justify-center lg:justify-start gap-2 font-mono">
            <span className="text-zinc-400 dark:text-zinc-600 font-sans">&gt;</span>
            <RotatingText words={rotatingSubtitles} />
          </div>

          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl font-normal mx-auto lg:mx-0">
            {missionStatement}
          </p>

          {/* Quick Highlight Pillars */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 py-1 max-w-xl mx-auto lg:mx-0 text-left">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-500 shrink-0" />
              <span>QA & Test Automation</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span>100% Client-Side RAM</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-purple-500 shrink-0" />
              <span>3D Prototyping Maker</span>
            </div>
          </div>

          {/* CTA Action Bar */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5 pt-2">
            <Link to="/tools" className="saas-button-primary py-2.5 px-5 text-xs font-black inline-flex items-center gap-2 cursor-pointer shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/30">
              <span>Explore Toolique (274+ Tools)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <Link to="/why-toolique" className="saas-button-secondary py-2.5 px-4 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Why Toolique</span>
            </Link>

            <button
              onClick={() => scrollToSection('brands')}
              className="saas-button-secondary py-2.5 px-4 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Box className="w-3.5 h-3.5 text-purple-500" />
              <span>Voxelique Studio</span>
            </button>

            <button
              onClick={() => scrollToSection('connect')}
              className="px-4 py-2.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 hover:border-indigo-500/40 text-xs font-bold text-zinc-700 dark:text-zinc-300 transition cursor-pointer shadow-2xs"
            >
              Connect Directly
            </button>
          </div>

          {/* Social Profiles Grid */}
          <div className="flex items-center justify-center lg:justify-start gap-2.5 pt-2">
            {socialLinks.github && (
              <a
                href={socialLinks.github}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 flex items-center justify-center text-zinc-650 dark:text-zinc-350 hover:text-zinc-950 dark:hover:text-white hover:border-zinc-400 dark:hover:border-zinc-600 hover:scale-105 transition shadow-2xs"
                title="GitHub Profile (@ajinkyaswami1999)"
                aria-label="GitHub Profile"
              >
                <GithubIcon className="w-4 h-4" />
              </a>
            )}
            {socialLinks.linkedin && (
              <a
                href={socialLinks.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 flex items-center justify-center text-zinc-650 dark:text-zinc-350 hover:text-[#0077b5] hover:border-[#0077b5]/40 hover:scale-105 transition shadow-2xs"
                title="LinkedIn Profile"
                aria-label="LinkedIn Profile"
              >
                <LinkedinIcon className="w-4 h-4" />
              </a>
            )}
            {socialLinks.instagramPersonal && (
              <a
                href={socialLinks.instagramPersonal}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 flex items-center justify-center text-zinc-650 dark:text-zinc-350 hover:text-pink-500 hover:border-pink-500/40 hover:scale-105 transition shadow-2xs"
                title="Personal Instagram (@2ajinkya6)"
                aria-label="Personal Instagram"
              >
                <InstagramIcon className="w-4 h-4" />
              </a>
            )}
            {socialLinks.email && (
              <a
                href={`mailto:${socialLinks.email}`}
                className="w-9 h-9 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 flex items-center justify-center text-zinc-650 dark:text-zinc-350 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-500/40 hover:scale-105 transition shadow-2xs"
                title="Email Ajinkya Swami"
                aria-label="Email Ajinkya Swami"
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


