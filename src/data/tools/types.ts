export interface ToolFAQ {
  question: string;
  answer: string;
}

export interface ToolSection {
  title: string;
  content: string;
}

export interface Tool {
  id: string;
  slug: string;
  name: string;
  category: 'finance' | 'civil' | 'architecture' | 'interior' | 'electrical' | 'pdf' | 'image' | 'developer' | 'web' | 'text' | 'social' | 'datetime' | 'unit' | 'security' | 'student' | 'automobile' | 'business' | 'health' | '3d-printing' | 'math-studio' | 'qa' | 'economics' | 'compliance' | 'dpdp-privacy' | 'rbi-financial' | 'uidai-aadhaar' | 'audit-evidence';
  subcategory?: string;
  shortDescription: string;
  metaTitle?: string;
  metaDescription: string;
  keywords: string[];
  icon: string;
  howToUse: string[];
  faqs: ToolFAQ[];
  sections: ToolSection[];
  hideLayoutHeader?: boolean;
}
