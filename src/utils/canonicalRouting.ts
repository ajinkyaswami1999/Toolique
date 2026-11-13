export function getToolCanonicalPath(category: string, slug: string): string {
  if (category === 'civil') {
    return `/civil/${slug}`;
  } else if (category === 'architecture') {
    return `/architecture/${slug}`;
  } else if (['developer', 'web'].includes(category)) {
    return `/developer/${slug}`;
  } else if (category === 'qa') {
    return `/qa/${slug}`;
  } else if (category === '3d-printing') {
    return `/3d-printing-tools/${slug}`;
  } else if (category === 'economics') {
    return `/economics/${slug}`;
  } else if (category === 'pdf') {
    return `/pdf/${slug}`;
  } else if (['compliance', 'dpdp-privacy', 'rbi-financial', 'uidai-aadhaar', 'audit-evidence'].includes(category)) {
    return `/compliance/${slug}`;
  } else {
    return `/calculators/${slug}`;
  }
}

export function getCategoryCanonicalPath(category: string): string {
  if (category === 'civil' || category === 'architecture') {
    return `/architecture`;
  } else if (['developer', 'web', 'security'].includes(category)) {
    return `/developer`;
  } else if (category === 'qa') {
    return `/qa`;
  } else if (category === 'finance') {
    return `/finance`;
  } else if (category === 'economics') {
    return `/economics`;
  } else if (category === '3d-printing') {
    return `/3d-printing-tools`;
  } else if (category === 'pdf') {
    return `/pdf`;
  } else if (['compliance', 'dpdp-privacy', 'rbi-financial', 'uidai-aadhaar', 'audit-evidence'].includes(category)) {
    return `/compliance`;
  } else {
    return `/calculators`;
  }
}
