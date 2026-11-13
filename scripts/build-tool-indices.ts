import fs from 'fs';
import { toolsList } from '../src/data/tools';

const slugMap: Record<string, string> = {};
const searchTools = toolsList.map(t => {
  slugMap[t.slug] = t.category;
  return {
    id: t.id,
    name: t.name,
    category: t.category,
    slug: t.slug,
    icon: t.icon,
    shortDescription: t.shortDescription,
    keywords: t.keywords || []
  };
});

const heroTools = toolsList.slice(0, 72).map(t => ({
  id: t.id,
  name: t.name,
  category: t.category
}));

const slugMapContent = `// Auto-generated lightweight tool slug to category map for O(1) routing
export const TOOL_SLUG_TO_CATEGORY: Record<string, string> = ${JSON.stringify(slugMap, null, 2)};
`;
fs.writeFileSync('src/data/tools/slugMap.ts', slugMapContent, 'utf8');

const searchIndexContent = `// Auto-generated lightweight search index (~30 KB vs 1.16 MB full tools list)
export interface SearchToolItem {
  id: string;
  name: string;
  category: string;
  slug: string;
  icon: string;
  shortDescription: string;
  keywords: string[];
}

export const searchTools: SearchToolItem[] = ${JSON.stringify(searchTools, null, 2)};
`;
fs.writeFileSync('src/data/tools/searchIndex.ts', searchIndexContent, 'utf8');

const heroToolsContent = `// Auto-generated lightweight marquee tools list for decorative backgrounds (~2 KB)
export interface HeroMarqueeTool {
  id: string;
  name: string;
  category: string;
}

export const HERO_MARQUEE_TOOLS: HeroMarqueeTool[] = ${JSON.stringify(heroTools, null, 2)};
`;
fs.writeFileSync('src/data/tools/heroTools.ts', heroToolsContent, 'utf8');

console.log('Generated slugMap, searchIndex, and heroTools successfully!');
console.log('Total tools mapped:', Object.keys(slugMap).length);
