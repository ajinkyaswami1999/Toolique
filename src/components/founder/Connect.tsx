import { useState } from 'react';
import { Mail, Check, Copy, Sparkles, ExternalLink } from 'lucide-react';
import { socialLinks } from '../../config/socialLinks';
import type { GitHubProfile } from '../../types/founder';
import { GithubIcon, LinkedinIcon, InstagramIcon } from './icons';

interface ConnectProps {
  githubData: GitHubProfile | null;
  loadingGithub: boolean;
}

export default function Connect({ githubData, loadingGithub }: ConnectProps) {
  const [copied, setCopied] = useState(false);
  const email = socialLinks.email || 'support@toolique.in';

  const copyEmail = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 text-left">
      {/* Top Ambient Banner */}
      <div className="relative p-8 sm:p-12 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 bg-gradient-to-br from-indigo-500/[0.08] via-white/80 to-teal-500/[0.08] dark:from-indigo-500/[0.06] dark:via-zinc-900/80 dark:to-teal-500/[0.06] backdrop-blur-xl text-center overflow-hidden shadow-sm">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 bg-indigo-500/[0.08] dark:bg-indigo-500/[0.04] rounded-full blur-[100px] pointer-events-none -z-10" />
        
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20 text-[10px] font-black uppercase tracking-wider mb-3">
          <Sparkles className="w-3 h-3 text-indigo-500" />
          <span>Open for Collaborations & Engineering</span>
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-zinc-900 dark:text-white tracking-tight">
          Let's Build Something Great Together
        </h2>
        <p className="text-xs sm:text-sm text-zinc-650 dark:text-zinc-400 mt-3 max-w-xl mx-auto leading-relaxed">
          Have an idea for a high-utility browser tool, a 3D manufacturing project, or want to discuss QA automation frameworks? I'm always excited to connect with fellow makers.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Live GitHub Card */}
        {socialLinks.github && (
          <div className="lg:col-span-6 p-6 sm:p-8 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-900/70 backdrop-blur-xl shadow-2xs space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-900 dark:bg-zinc-800 text-white flex items-center justify-center shadow-md">
                    <GithubIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-zinc-900 dark:text-white">GitHub Profile</h4>
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 font-mono font-bold">@{githubData?.login || 'ajinkyaswami1999'}</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  LIVE API
                </span>
              </div>

              <p className="text-xs sm:text-sm text-zinc-650 dark:text-zinc-400 leading-relaxed font-normal min-h-[2.5rem]">
                {githubData?.bio || 'QA Automation Engineer & Full-Stack Builder | Passionate about building products, 3D printing, and zero-knowledge web tools.'}
              </p>

              <div className="grid grid-cols-3 gap-2 py-3 border-y border-zinc-200/60 dark:border-zinc-800 text-center">
                <div className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/40">
                  <span className="block text-base sm:text-lg font-black text-zinc-900 dark:text-white">
                    {loadingGithub ? '...' : githubData?.public_repos || '42+'}
                  </span>
                  <span className="text-[9px] font-bold text-zinc-450 dark:text-zinc-500 uppercase tracking-wider">Repositories</span>
                </div>
                <div className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/40">
                  <span className="block text-base sm:text-lg font-black text-zinc-900 dark:text-white">
                    {loadingGithub ? '...' : githubData?.followers || '120+'}
                  </span>
                  <span className="text-[9px] font-bold text-zinc-450 dark:text-zinc-500 uppercase tracking-wider">Followers</span>
                </div>
                <div className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/40">
                  <span className="block text-base sm:text-lg font-black text-zinc-900 dark:text-white">
                    {loadingGithub ? '...' : githubData?.following || '85+'}
                  </span>
                  <span className="text-[9px] font-bold text-zinc-450 dark:text-zinc-500 uppercase tracking-wider">Following</span>
                </div>
              </div>
            </div>

            <a
              href={socialLinks.github}
              target="_blank"
              rel="noopener noreferrer"
              className="saas-button-primary py-3 px-4 text-xs font-black w-full inline-flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <GithubIcon className="w-4 h-4" />
              <span>Explore GitHub Repositories</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}

        {/* Social Channels & Direct Contact */}
        <div className="lg:col-span-6 space-y-4 flex flex-col justify-between">
          
          {/* LinkedIn Channel */}
          {socialLinks.linkedin && (
            <div className="p-4 sm:p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-900/70 backdrop-blur-xl flex items-center justify-between group hover:border-[#0077b5]/50 hover:shadow-md transition-all duration-300">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#0077b5]/10 text-[#0077b5] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <LinkedinIcon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-zinc-900 dark:text-white">LinkedIn</h4>
                  <p className="text-xs text-zinc-500 font-semibold">Ajinkya Swami</p>
                </div>
              </div>
              <a
                href={socialLinks.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-[#0077b5] hover:bg-[#00629b] text-white font-bold text-xs transition inline-flex items-center gap-1.5 shadow-sm"
              >
                <span>Connect</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}

          {/* Instagram Dual Channels */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {socialLinks.instagramPersonal && (
              <a
                href={socialLinks.instagramPersonal}
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-900/70 backdrop-blur-xl hover:border-pink-500/40 hover:shadow-md transition-all duration-300 flex flex-col justify-between h-28 group"
              >
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-pink-500/10 text-pink-600 dark:text-pink-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <InstagramIcon className="w-4.5 h-4.5" />
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-zinc-400 group-hover:text-pink-500 transition" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-zinc-900 dark:text-white group-hover:text-pink-600 dark:group-hover:text-pink-400 transition">Personal IG</h4>
                  <p className="text-[10px] text-zinc-500 font-mono">@2ajinkya6</p>
                </div>
              </a>
            )}

            {socialLinks.instagramVoxelique && (
              <a
                href={socialLinks.instagramVoxelique}
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-900/70 backdrop-blur-xl hover:border-purple-500/40 hover:shadow-md transition-all duration-300 flex flex-col justify-between h-28 group"
              >
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <InstagramIcon className="w-4.5 h-4.5" />
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-zinc-400 group-hover:text-purple-500 transition" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-zinc-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition">Voxelique 3D</h4>
                  <p className="text-[10px] text-zinc-500 font-mono">@voxelique</p>
                </div>
              </a>
            )}
          </div>

          {/* Copyable Direct Email Card */}
          <div className="p-4 sm:p-5 rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-500/5 via-teal-500/5 to-purple-500/5 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div className="text-left">
                <span className="text-[10px] font-bold text-zinc-450 dark:text-zinc-500 uppercase tracking-wider block">Direct Email</span>
                <span className="text-xs sm:text-sm font-mono font-bold text-zinc-900 dark:text-white select-all">{email}</span>
              </div>
            </div>

            <button
              onClick={copyEmail}
              className="saas-button-secondary py-2 px-3.5 text-xs font-bold w-full sm:w-auto inline-flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400 font-black">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Copy Address</span>
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

