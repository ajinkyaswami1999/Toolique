import { Mail } from 'lucide-react';
import { socialLinks } from '../../config/socialLinks';
import type { GitHubProfile } from '../../types/founder';
import { GithubIcon, LinkedinIcon, InstagramIcon } from './icons';

interface ConnectProps {
  githubData: GitHubProfile | null;
  loadingGithub: boolean;
}

export default function Connect({ githubData, loadingGithub }: ConnectProps) {
  return (
    <div className="space-y-8">
      <div className="relative p-8 sm:p-10 rounded-3xl border border-zinc-200/60 dark:border-zinc-800/60 bg-gradient-to-br from-indigo-500/[0.06] via-white/40 to-teal-500/[0.06] dark:from-indigo-500/[0.04] dark:via-zinc-950/40 dark:to-teal-500/[0.04] backdrop-blur-md text-center overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-indigo-500/[0.06] dark:bg-indigo-500/[0.03] rounded-full blur-[100px] pointer-events-none -z-10" />
        <h2 className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-white">
          Let's Build Something Amazing Together
        </h2>
        <p className="text-sm sm:text-base text-zinc-500 dark:text-zinc-400 mt-3 max-w-xl mx-auto">
          Have an idea, a collaboration, or just want to talk engineering and 3D printing? Reach out on any platform below.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* GitHub Card */}
        {socialLinks.github && (
          <div className="col-span-1 md:col-span-6 p-6 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-gradient-to-br from-white/70 to-white/30 dark:from-zinc-900/60 dark:to-zinc-950/30 shadow-sm space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-zinc-900 dark:bg-zinc-800 text-white flex items-center justify-center">
                <GithubIcon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-zinc-900 dark:text-white">GitHub</h4>
                <p className="text-[10px] text-zinc-400 font-mono">@{githubData?.login || 'ajinkyaswami1999'}</p>
              </div>
            </div>

            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed min-h-[2.5rem]">
              {githubData?.bio || 'QA Automation Engineer & Full-Stack Builder | Passionate about building products, 3D printing, and automation.'}
            </p>

            <div className="grid grid-cols-3 gap-2 py-2 border-y border-zinc-200/50 dark:border-zinc-800 text-center">
              <div>
                <span className="block text-sm font-black text-zinc-900 dark:text-white">
                  {loadingGithub ? '...' : githubData?.public_repos || '40+'}
                </span>
                <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase">Repositories</span>
              </div>
              <div>
                <span className="block text-sm font-black text-zinc-900 dark:text-white">
                  {loadingGithub ? '...' : githubData?.followers || '100+'}
                </span>
                <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase">Followers</span>
              </div>
              <div>
                <span className="block text-sm font-black text-zinc-900 dark:text-white">
                  {loadingGithub ? '...' : githubData?.following || '80+'}
                </span>
                <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase">Following</span>
              </div>
            </div>

            <a
              href={socialLinks.github}
              target="_blank"
              rel="noopener noreferrer"
              className="saas-button-primary text-xs w-full"
            >
              View Repositories
            </a>
          </div>
        )}

        {/* LinkedIn & Instagram Cards */}
        <div className="col-span-1 md:col-span-6 space-y-4">
          {socialLinks.linkedin && (
            <div className="p-4 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white/20 dark:bg-zinc-950/20 flex items-center justify-between group hover:border-indigo-500/30 transition-all duration-300">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#0077b5]/10 text-[#0077b5] flex items-center justify-center">
                  <LinkedinIcon className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200">LinkedIn</h4>
                  <p className="text-[10px] text-zinc-500 font-semibold">Ajinkya Swami</p>
                </div>
              </div>
              <a
                href={socialLinks.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 rounded-lg bg-[#0077b5] hover:bg-[#00629b] text-white font-bold text-[10px] transition"
              >
                Connect
              </a>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {socialLinks.instagramPersonal && (
              <a
                href={socialLinks.instagramPersonal}
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white/20 dark:bg-zinc-950/20 hover:border-indigo-500/30 transition-all duration-300 flex flex-col justify-between h-28 group"
              >
                <div className="w-8 h-8 rounded-lg bg-pink-500/10 text-pink-600 dark:text-pink-400 flex items-center justify-center">
                  <InstagramIcon className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">Instagram</h4>
                  <p className="text-[9px] text-zinc-400 font-mono mt-0.5">@2ajinkya6</p>
                </div>
              </a>
            )}

            {socialLinks.instagramVoxelique && (
              <a
                href={socialLinks.instagramVoxelique}
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white/20 dark:bg-zinc-950/20 hover:border-indigo-500/30 transition-all duration-300 flex flex-col justify-between h-28 group"
              >
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <InstagramIcon className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">Voxelique</h4>
                  <p className="text-[9px] text-zinc-400 font-mono mt-0.5">@voxelique</p>
                </div>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Premium Contact Buttons */}
      <div className="p-6 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white/30 dark:bg-zinc-950/30 backdrop-blur-md text-center space-y-4">
        <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
          Contact
        </h4>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {socialLinks.github && (
            <a href={socialLinks.github} target="_blank" rel="noopener noreferrer" className="saas-button-secondary text-xs flex items-center gap-1.5">
              <GithubIcon className="w-4 h-4" /> GitHub
            </a>
          )}
          {socialLinks.linkedin && (
            <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="saas-button-secondary text-xs flex items-center gap-1.5">
              <LinkedinIcon className="w-4 h-4" /> LinkedIn
            </a>
          )}
          {socialLinks.instagramPersonal && (
            <a href={socialLinks.instagramPersonal} target="_blank" rel="noopener noreferrer" className="saas-button-secondary text-xs flex items-center gap-1.5">
              <InstagramIcon className="w-4 h-4" /> Instagram
            </a>
          )}
          {socialLinks.email && (
            <a href={`mailto:${socialLinks.email}`} className="saas-button-secondary text-xs flex items-center gap-1.5">
              <Mail className="w-4 h-4" /> Email
            </a>
          )}
          {socialLinks.toolique && (
            <a href="/" className="saas-button-secondary text-xs flex items-center gap-1.5">
              Toolique
            </a>
          )}
          {socialLinks.voxelique && (
            <a href={socialLinks.voxelique} target="_blank" rel="noopener noreferrer" className="saas-button-secondary text-xs flex items-center gap-1.5">
              Voxelique
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
