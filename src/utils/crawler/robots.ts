/**
 * Robots.txt Parsing and Matcher utility.
 */

/**
 * Parses robots.txt file contents and extracts disallow paths for wildcard '*' or 'toolique-crawler'.
 */
export function parseRobotsTxt(robotsText: string): string[] {
  const disallows: string[] = [];
  const lines = robotsText.split('\n');
  let isTargetUA = false;

  for (const line of lines) {
    const cleanLine = line.trim();
    if (!cleanLine || cleanLine.startsWith('#')) continue;

    const parts = cleanLine.split(':');
    if (parts.length < 2) continue;

    const directive = parts[0].trim().toLowerCase();
    const value = parts.slice(1).join(':').trim();

    if (directive === 'user-agent') {
      const ua = value.toLowerCase();
      isTargetUA = (ua === '*' || ua === 'toolique-crawler');
    } else if (isTargetUA && directive === 'disallow') {
      if (value) {
        disallows.push(value);
      }
    }
  }

  return disallows;
}

/**
 * Checks if a path is allowed under the parsed disallow rules list.
 */
export function isAllowedByRobots(urlPath: string, disallows: string[]): boolean {
  if (disallows.length === 0) return true;
  
  // Clean paths check
  const pathToCheck = urlPath || '/';
  
  return !disallows.some(rule => {
    // Simple matching wildcard format conversion or prefix match
    const cleanRule = rule.trim();
    if (!cleanRule) return false;
    
    // Replace wildcard symbols with safe string checks
    if (cleanRule === '/') return pathToCheck === '/';
    
    return pathToCheck.startsWith(cleanRule);
  });
}
