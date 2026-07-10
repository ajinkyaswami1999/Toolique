import type { LucideIcon } from 'lucide-react';

export interface GitHubProfile {
  avatar_url: string;
  name: string;
  login: string;
  bio: string;
  public_repos: number;
  followers: number;
  following: number;
}

export interface NavSection {
  id: string;
  name: string;
  icon: LucideIcon;
}

export interface Milestone {
  year: string;
  title: string;
  desc: string;
  icon: LucideIcon;
}

export interface BuildCategory {
  name: string;
  path: string;
  icon: LucideIcon;
  desc: string;
}

export interface SkillCategory {
  category: string;
  skills: string[];
  icon: LucideIcon;
}

export interface Project {
  name: string;
  desc: string;
  tech: string[];
  url: string;
  icon: LucideIcon;
}

export interface CoreValue {
  title: string;
  desc: string;
}

export interface FunFact {
  title: string;
  desc: string;
  icon: LucideIcon;
}

export interface TrustMetric {
  id: string;
  icon: LucideIcon;
  label: string;
  value?: number;
  suffix?: string;
  isBadge?: boolean;
}

export interface AboutHighlight {
  label: string;
  icon: LucideIcon;
}

export interface BrandCta {
  label: string;
  href: string;
  external: boolean;
}

export interface Brand {
  name: string;
  badgeLabel: string;
  badgeColorClass: string;
  desc: string;
  previewIcon: LucideIcon;
  statLine: string;
  primaryCta: BrandCta;
  secondaryCta: BrandCta;
}
