export interface CurrencyOption {
  code: string;
  symbol: string;
  name: string;
  flag?: string;
}

export const SUPPORTED_CURRENCIES: CurrencyOption[] = [
  { code: 'USD', symbol: '$', name: 'USD ($)', flag: '🇺🇸' },
  { code: 'INR', symbol: '₹', name: 'INR (₹)', flag: '🇮🇳' },
  { code: 'EUR', symbol: '€', name: 'EUR (€)', flag: '🇪🇺' },
  { code: 'GBP', symbol: '£', name: 'GBP (£)', flag: '🇬🇧' },
  { code: 'JPY', symbol: '¥', name: 'JPY (¥)', flag: '🇯🇵' },
  { code: 'CAD', symbol: 'C$', name: 'CAD (C$)', flag: '🇨🇦' },
  { code: 'AUD', symbol: 'A$', name: 'AUD (A$)', flag: '🇦🇺' },
  { code: 'AED', symbol: 'AED ', name: 'AED (د.إ)', flag: '🇦🇪' },
  { code: 'SGD', symbol: 'S$', name: 'SGD (S$)', flag: '🇸🇬' },
  { code: 'CHF', symbol: 'CHF ', name: 'CHF (Fr)', flag: '🇨🇭' },
  { code: 'CNY', symbol: '¥', name: 'CNY (¥)', flag: '🇨🇳' },
  { code: 'BRL', symbol: 'R$', name: 'BRL (R$)', flag: '🇧🇷' },
  { code: 'ZAR', symbol: 'R ', name: 'ZAR (R)', flag: '🇿🇦' },
];

export function formatCurrency(
  amount: number,
  currencySymbol: string = '$',
  decimals: number = 2
): string {
  if (isNaN(amount) || !isFinite(amount)) return `${currencySymbol}0.00`;
  const formattedNumber = Math.abs(amount).toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  const sign = amount < 0 ? '-' : '';
  return `${sign}${currencySymbol}${formattedNumber}`;
}
