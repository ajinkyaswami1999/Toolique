import * as Icons from 'lucide-react';

interface LucideIconProps {
  name: string;
  className?: string;
  size?: number;
}

export default function LucideIcon({ name, className = '', size }: LucideIconProps) {
  // Map string to Lucide component
  const IconComponent = (Icons as any)[name];

  if (!IconComponent) {
    // Return a default icon if not found
    return <Icons.HelpCircle className={className} size={size} />;
  }

  return <IconComponent className={className} size={size} />;
}
