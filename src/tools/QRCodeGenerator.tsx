import { useState, useRef, useEffect, useCallback } from 'react';
import QRCode from 'qrcode';
import { jsPDF } from 'jspdf';
import {
  QrCode, Link as LinkIcon, Wifi, CreditCard, User, Mail,
  Phone, MapPin, Calendar, FileText, Download, Copy, Check,
  RotateCcw, Sparkles, Palette, ShieldCheck, AlertTriangle,
  Printer, Image as ImageIcon, Eye, EyeOff, FileCode
} from 'lucide-react';

// Payload Types
type PayloadType = 'url' | 'wifi' | 'upi' | 'vcard' | 'whatsapp' | 'email' | 'sms' | 'geo' | 'event' | 'text';
type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';
type FrameType = 'none' | 'top-banner' | 'bottom-banner' | 'card-badge';
type CenterLogoType = 'none' | 'preset' | 'custom';
type ModuleStyle = 'square' | 'rounded' | 'dots';

// Preset Color Palettes
interface ColorPalette {
  name: string;
  fg: string;
  bg: string;
  gradient?: { start: string; end: string };
}

const COLOR_PALETTES: ColorPalette[] = [
  { name: 'Classic Charcoal', fg: '#09090b', bg: '#ffffff' },
  { name: 'Midnight Indigo', fg: '#3730a3', bg: '#f8fafc', gradient: { start: '#312e81', end: '#4f46e5' } },
  { name: 'Emerald Trust', fg: '#065f46', bg: '#f0fdf4', gradient: { start: '#047857', end: '#10b981' } },
  { name: 'Crimson Sunset', fg: '#991b1b', bg: '#fff1f2', gradient: { start: '#b91c1c', end: '#f43f5e' } },
  { name: 'Cyberpunk Neon', fg: '#0f172a', bg: '#fdf4ff', gradient: { start: '#7c3aed', end: '#06b6d4' } },
  { name: 'Royal Gold', fg: '#78350f', bg: '#fffbeb', gradient: { start: '#b45309', end: '#f59e0b' } },
  { name: 'Dark Slate Inverted', fg: '#ffffff', bg: '#09090b' },
];

// Preset Logo Icons
const PRESET_LOGOS = [
  { id: 'globe', label: 'Website', icon: LinkIcon, color: '#3b82f6' },
  { id: 'wifi', label: 'Wi-Fi', icon: Wifi, color: '#10b981' },
  { id: 'upi', label: 'Payment', icon: CreditCard, color: '#6366f1' },
  { id: 'user', label: 'Contact', icon: User, color: '#8b5cf6' },
  { id: 'mail', label: 'Email', icon: Mail, color: '#ef4444' },
  { id: 'phone', label: 'Phone', icon: Phone, color: '#14b8a6' },
  { id: 'map', label: 'Location', icon: MapPin, color: '#f59e0b' },
  { id: 'cal', label: 'Event', icon: Calendar, color: '#ec4899' },
];

// 1-Click Interactive Test Templates
const TEST_TEMPLATES = [
  {
    name: '☕ Coffee Shop Wi-Fi',
    type: 'wifi' as PayloadType,
    data: { ssid: 'Artisan_Roasters_Guest', password: 'BrewCoffee2026!', encryption: 'WPA', hidden: false },
    palette: COLOR_PALETTES[1]
  },
  {
    name: '💳 Merchant UPI Payment',
    type: 'upi' as PayloadType,
    data: { vpa: 'toolique.merchant@okhdfcbank', name: 'Toolique Digital Store', amount: '499', note: 'Invoice #8402', currency: 'INR' },
    palette: COLOR_PALETTES[2]
  },
  {
    name: '🍕 Restaurant Digital Menu',
    type: 'url' as PayloadType,
    data: { url: 'https://toolique.com/demo-menu' },
    palette: COLOR_PALETTES[0]
  },
  {
    name: '💼 Executive vCard Card',
    type: 'vcard' as PayloadType,
    data: { firstName: 'Alex', lastName: 'Morgan', org: 'Toolique Labs', title: 'Principal Architect', phone: '+1 555-019-2834', email: 'alex@toolique.com', url: 'https://toolique.com', address: 'Bangalore, India' },
    palette: COLOR_PALETTES[4]
  }
];

interface SessionHistoryItem {
  id: string;
  type: PayloadType;
  title: string;
  payloadString: string;
  dataUrl: string;
  timestamp: number;
}

export default function QRCodeGenerator() {
  // Active Payload Type
  const [payloadType, setPayloadType] = useState<PayloadType>('url');

  // Payload Form States
  const [url, setUrl] = useState<string>('https://toolique.com');
  
  // Wi-Fi
  const [wifiSsid, setWifiSsid] = useState<string>('MyHomeWiFi');
  const [wifiPassword, setWifiPassword] = useState<string>('SecurePassword123');
  const [wifiEncryption, setWifiEncryption] = useState<'WPA' | 'WEP' | 'nopass'>('WPA');
  const [wifiHidden, setWifiHidden] = useState<boolean>(false);
  const [showWifiPassword, setShowWifiPassword] = useState<boolean>(false);

  // UPI Payment (India / Global standard)
  const [upiVpa, setUpiVpa] = useState<string>('merchant@okhdfcbank');
  const [upiName, setUpiName] = useState<string>('Toolique Merchant');
  const [upiAmount, setUpiAmount] = useState<string>('299');
  const [upiNote, setUpiNote] = useState<string>('Digital Order #1042');

  // vCard Contact
  const [vcardFirst, setVcardFirst] = useState<string>('Ajinkya');
  const [vcardLast, setVcardLast] = useState<string>('Swami');
  const [vcardOrg, setVcardOrg] = useState<string>('Toolique India');
  const [vcardTitle, setVcardTitle] = useState<string>('Founder & Lead Developer');
  const [vcardPhone, setVcardPhone] = useState<string>('+91 98765 43210');
  const [vcardEmail, setVcardEmail] = useState<string>('ajinkya@toolique.com');
  const [vcardUrl, setVcardUrl] = useState<string>('https://toolique.com');
  const [vcardAddress, setVcardAddress] = useState<string>('Pune, Maharashtra, India');

  // WhatsApp
  const [waPhone, setWaPhone] = useState<string>('+919876543210');
  const [waMessage, setWaMessage] = useState<string>('Hi! I would like to inquire about your services.');

  // Email
  const [emailTo, setEmailTo] = useState<string>('support@toolique.com');
  const [emailSubject, setEmailSubject] = useState<string>('Product Inquiry');
  const [emailBody, setEmailBody] = useState<string>('Hello,\n\nI would like to learn more about your platform.');

  // SMS
  const [smsPhone, setSmsPhone] = useState<string>('+919876543210');
  const [smsMessage, setSmsMessage] = useState<string>('Hello! Please callback regarding my order.');

  // Geo Location
  const [geoLat, setGeoLat] = useState<string>('18.5204');
  const [geoLng, setGeoLng] = useState<string>('73.8567');
  const [geoQuery, setGeoQuery] = useState<string>('Pune, Maharashtra');

  // Calendar Event
  const [eventTitle, setEventTitle] = useState<string>('Toolique Tech Keynote 2026');
  const [eventLocation, setEventLocation] = useState<string>('Online / Main Stage');
  const [eventStart, setEventStart] = useState<string>('2026-10-15T10:00');
  const [eventEnd, setEventEnd] = useState<string>('2026-10-15T11:30');
  const [eventDescription, setEventDescription] = useState<string>('Annual product keynote and live developer demos.');

  // Plain Text
  const [plainText, setPlainText] = useState<string>('Welcome to Toolique - Fast, client-side utility suite!');

  // Styling & Customization States
  const [fgColor, setFgColor] = useState<string>('#09090b');
  const [bgColor, setBgColor] = useState<string>('#ffffff');
  const [useGradient, setUseGradient] = useState<boolean>(false);
  const [gradientStart, setGradientStart] = useState<string>('#312e81');
  const [gradientEnd, setGradientEnd] = useState<string>('#4f46e5');
  const [gradientAngle, setGradientAngle] = useState<number>(135);
  const [moduleStyle, setModuleStyle] = useState<ModuleStyle>('square');

  const [eccLevel, setEccLevel] = useState<ErrorCorrectionLevel>('H');
  const [quietZoneMargin, setQuietZoneMargin] = useState<number>(3);
  const [qrSize, setQrSize] = useState<number>(1024);

  // Center Logo
  const [centerLogoType, setCenterLogoType] = useState<CenterLogoType>('none');
  const [selectedPresetLogo, setSelectedPresetLogo] = useState<string>('globe');
  const [customLogoSrc, setCustomLogoSrc] = useState<string | null>(null);
  const [logoSizePercent, setLogoSizePercent] = useState<number>(22);

  // Call-to-Action Frame
  const [frameType, setFrameType] = useState<FrameType>('none');
  const [frameText, setFrameText] = useState<string>('SCAN ME');
  const [frameBgColor, setFrameBgColor] = useState<string>('#09090b');
  const [frameTextColor, setFrameTextColor] = useState<string>('#ffffff');

  // Session History & UI Helpers
  const [copiedNotification, setCopiedNotification] = useState<boolean>(false);
  const [svgOutput, setSvgOutput] = useState<string>('');
  const [sessionHistory, setSessionHistory] = useState<SessionHistoryItem[]>([]);

  // Refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // ----------------------------------------------------
  // CONSTRUCT STRUCTURED PAYLOAD STRING
  // ----------------------------------------------------
  const getCompiledPayload = useCallback((): string => {
    switch (payloadType) {
      case 'url': {
        let trimmed = url.trim();
        if (trimmed && !trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
          trimmed = 'https://' + trimmed;
        }
        return trimmed || 'https://toolique.com';
      }
      case 'wifi': {
        const cleanSsid = wifiSsid.replace(/([\\;,:"])/g, '\\$1');
        const cleanPass = wifiPassword.replace(/([\\;,:"])/g, '\\$1');
        return `WIFI:S:${cleanSsid};T:${wifiEncryption};P:${cleanPass};H:${wifiHidden};;`;
      }
      case 'upi': {
        const cleanVpa = upiVpa.trim();
        const cleanName = encodeURIComponent(upiName.trim());
        const cleanAmount = upiAmount.trim() ? `&am=${encodeURIComponent(upiAmount.trim())}` : '';
        const cleanNote = upiNote.trim() ? `&tn=${encodeURIComponent(upiNote.trim())}` : '';
        return `upi://pay?pa=${cleanVpa}&pn=${cleanName}${cleanAmount}${cleanNote}&cu=INR`;
      }
      case 'vcard': {
        return [
          'BEGIN:VCARD',
          'VERSION:3.0',
          `N:${vcardLast.trim()};${vcardFirst.trim()};;;`,
          `FN:${vcardFirst.trim()} ${vcardLast.trim()}`,
          vcardOrg.trim() ? `ORG:${vcardOrg.trim()}` : '',
          vcardTitle.trim() ? `TITLE:${vcardTitle.trim()}` : '',
          vcardPhone.trim() ? `TEL;TYPE=CELL:${vcardPhone.trim()}` : '',
          vcardEmail.trim() ? `EMAIL:${vcardEmail.trim()}` : '',
          vcardUrl.trim() ? `URL:${vcardUrl.trim()}` : '',
          vcardAddress.trim() ? `ADR:;;${vcardAddress.trim()};;;;` : '',
          'END:VCARD'
        ].filter(Boolean).join('\n');
      }
      case 'whatsapp': {
        const cleanPhone = waPhone.replace(/[^0-9]/g, '');
        const cleanMsg = encodeURIComponent(waMessage.trim());
        return `https://wa.me/${cleanPhone}${cleanMsg ? `?text=${cleanMsg}` : ''}`;
      }
      case 'email': {
        const cleanSub = encodeURIComponent(emailSubject.trim());
        const cleanBody = encodeURIComponent(emailBody.trim());
        return `mailto:${emailTo.trim()}?subject=${cleanSub}&body=${cleanBody}`;
      }
      case 'sms': {
        const cleanNum = smsPhone.trim();
        const cleanMsg = smsMessage.trim();
        return `smsto:${cleanNum}:${cleanMsg}`;
      }
      case 'geo': {
        const cleanLat = geoLat.trim();
        const cleanLng = geoLng.trim();
        const cleanQ = geoQuery.trim() ? `?q=${encodeURIComponent(geoQuery.trim())}` : '';
        return `geo:${cleanLat},${cleanLng}${cleanQ}`;
      }
      case 'event': {
        const formatDate = (dStr: string) => dStr.replace(/[-:]/g, '') + '00Z';
        return [
          'BEGIN:VEVENT',
          `SUMMARY:${eventTitle.trim()}`,
          `LOCATION:${eventLocation.trim()}`,
          `DESCRIPTION:${eventDescription.trim()}`,
          eventStart ? `DTSTART:${formatDate(eventStart)}` : '',
          eventEnd ? `DTEND:${formatDate(eventEnd)}` : '',
          'END:VEVENT'
        ].filter(Boolean).join('\n');
      }
      case 'text':
      default:
        return plainText.trim() || 'Toolique';
    }
  }, [
    payloadType, url, wifiSsid, wifiPassword, wifiEncryption, wifiHidden,
    upiVpa, upiName, upiAmount, upiNote, vcardFirst, vcardLast,
    vcardOrg, vcardTitle, vcardPhone, vcardEmail, vcardUrl, vcardAddress,
    waPhone, waMessage, emailTo, emailSubject, emailBody, smsPhone,
    smsMessage, geoLat, geoLng, geoQuery, eventTitle, eventLocation,
    eventStart, eventEnd, eventDescription, plainText
  ]);

  // ----------------------------------------------------
  // CONTRAST & SCANABILITY CALCULATOR
  // ----------------------------------------------------
  const calculateLuminance = (hex: string): number => {
    let c = hex.replace('#', '');
    if (c.length === 3) c = c.split('').map(x => x + x).join('');
    const num = parseInt(c, 16);
    const r = ((num >> 16) & 255) / 255;
    const g = ((num >> 8) & 255) / 255;
    const b = (num & 255) / 255;
    const a = [r, g, b].map(v => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
    return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
  };

  const getContrastRatio = (): number => {
    const l1 = calculateLuminance(fgColor);
    const l2 = calculateLuminance(bgColor);
    const brightest = Math.max(l1, l2);
    const darkest = Math.min(l1, l2);
    return (brightest + 0.05) / (darkest + 0.05);
  };

  const contrastRatio = getContrastRatio();

  // ----------------------------------------------------
  // DIRECT 2D MATRIX CANVAS RENDERING ENGINE
  // ----------------------------------------------------
  const renderQRCode = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const payload = getCompiledPayload();

    try {
      // 1. Generate Raw QR Code Data Matrix
      const qrData = QRCode.create(payload || ' ', {
        errorCorrectionLevel: eccLevel
      });

      const modCount = qrData.modules.size;
      const totalCells = modCount + quietZoneMargin * 2;
      const cellSize = qrSize / totalCells;

      // Also generate vector SVG string for vector export
      const svgStr = await QRCode.toString(payload || ' ', {
        type: 'svg',
        margin: quietZoneMargin,
        errorCorrectionLevel: eccLevel,
        color: {
          dark: useGradient ? gradientStart : fgColor,
          light: bgColor === 'transparent' ? '#ffffff00' : bgColor
        }
      });
      setSvgOutput(svgStr);

      // 2. Set Dimensions for Main Output (including Frame Padding if active)
      let totalWidth = qrSize;
      let totalHeight = qrSize;
      let qrOffsetY = 0;
      let frameBannerHeight = 0;

      if (frameType === 'top-banner' || frameType === 'bottom-banner') {
        frameBannerHeight = Math.round(qrSize * 0.18);
        totalHeight = qrSize + frameBannerHeight;
        if (frameType === 'top-banner') {
          qrOffsetY = frameBannerHeight;
        }
      } else if (frameType === 'card-badge') {
        const padding = Math.round(qrSize * 0.08);
        frameBannerHeight = Math.round(qrSize * 0.14);
        totalWidth = qrSize + padding * 2;
        totalHeight = qrSize + frameBannerHeight + padding * 2;
        qrOffsetY = padding + frameBannerHeight;
      }

      canvas.width = totalWidth;
      canvas.height = totalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, totalWidth, totalHeight);

      // 3. Render Card/Outer Background
      if (frameType === 'card-badge') {
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        const r = Math.round(totalWidth * 0.04);
        ctx.roundRect ? ctx.roundRect(0, 0, totalWidth, totalHeight, r) : ctx.rect(0, 0, totalWidth, totalHeight);
        ctx.fill();
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = Math.round(totalWidth * 0.01);
        ctx.stroke();
      }

      // QR Area Background
      const qrStartX = (totalWidth - qrSize) / 2;
      ctx.fillStyle = bgColor;
      ctx.fillRect(qrStartX, qrOffsetY, qrSize, qrSize);

      // 4. Set Module Color Fill (Solid or Linear Gradient)
      if (useGradient) {
        const rad = (gradientAngle * Math.PI) / 180;
        const cx = qrStartX + qrSize / 2;
        const cy = qrOffsetY + qrSize / 2;
        const half = qrSize / 2;
        const x1 = cx - half * Math.cos(rad);
        const y1 = cy - half * Math.sin(rad);
        const x2 = cx + half * Math.cos(rad);
        const y2 = cy + half * Math.sin(rad);

        const grad = ctx.createLinearGradient(x1, y1, x2, y2);
        grad.addColorStop(0, gradientStart);
        grad.addColorStop(1, gradientEnd);
        ctx.fillStyle = grad;
      } else {
        ctx.fillStyle = fgColor;
      }

      // 5. Draw QR Modules Directly from Matrix
      for (let r = 0; r < modCount; r++) {
        for (let c = 0; c < modCount; c++) {
          if (qrData.modules.get(r, c)) {
            const mx = qrStartX + (c + quietZoneMargin) * cellSize;
            const my = qrOffsetY + (r + quietZoneMargin) * cellSize;

            if (moduleStyle === 'rounded') {
              ctx.beginPath();
              const modRadius = cellSize * 0.35;
              ctx.roundRect
                ? ctx.roundRect(mx, my, cellSize + 0.3, cellSize + 0.3, modRadius)
                : ctx.rect(mx, my, cellSize + 0.3, cellSize + 0.3);
              ctx.fill();
            } else if (moduleStyle === 'dots') {
              ctx.beginPath();
              ctx.arc(mx + cellSize / 2, my + cellSize / 2, cellSize * 0.45, 0, Math.PI * 2);
              ctx.fill();
            } else {
              // Standard Crisp Square (with subpixel overlap to prevent seams)
              ctx.fillRect(mx, my, cellSize + 0.5, cellSize + 0.5);
            }
          }
        }
      }

      // 6. Render Center Logo / Icon Badge
      if (centerLogoType !== 'none') {
        const logoSize = Math.round(qrSize * (logoSizePercent / 100));
        const logoX = qrStartX + (qrSize - logoSize) / 2;
        const logoY = qrOffsetY + (qrSize - logoSize) / 2;
        const badgePadding = Math.round(logoSize * 0.15);

        // Draw White Protective Center Badge
        ctx.save();
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.18)';
        ctx.shadowBlur = Math.round(logoSize * 0.12);
        ctx.beginPath();
        const badgeR = Math.round(logoSize * 0.22);
        ctx.roundRect
          ? ctx.roundRect(logoX - badgePadding, logoY - badgePadding, logoSize + badgePadding * 2, logoSize + badgePadding * 2, badgeR)
          : ctx.rect(logoX - badgePadding, logoY - badgePadding, logoSize + badgePadding * 2, logoSize + badgePadding * 2);
        ctx.fill();
        ctx.restore();

        // Render Custom Uploaded Logo or Preset
        if (centerLogoType === 'custom' && customLogoSrc) {
          const logoImg = new Image();
          logoImg.src = customLogoSrc;
          await new Promise((resolve) => {
            if (logoImg.complete) resolve(null);
            else logoImg.onload = () => resolve(null);
          });
          ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
        } else if (centerLogoType === 'preset') {
          const p = PRESET_LOGOS.find(l => l.id === selectedPresetLogo) || PRESET_LOGOS[0];
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(logoX + logoSize / 2, logoY + logoSize / 2, logoSize * 0.42, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.font = `bold ${Math.round(logoSize * 0.45)}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(p.label.charAt(0).toUpperCase(), logoX + logoSize / 2, logoY + logoSize / 2 + 1);
        }
      }

      // 7. Render Frame Call-to-Action Banner if active
      if (frameType !== 'none' && frameText.trim()) {
        ctx.save();
        const bannerFontSize = Math.round(frameBannerHeight * 0.45);
        ctx.font = `900 ${bannerFontSize}px Montserrat, Arial Black, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        if (frameType === 'top-banner') {
          ctx.fillStyle = frameBgColor;
          ctx.fillRect(0, 0, totalWidth, frameBannerHeight);
          ctx.fillStyle = frameTextColor;
          ctx.fillText(frameText.toUpperCase(), totalWidth / 2, frameBannerHeight / 2);
        } else if (frameType === 'bottom-banner') {
          ctx.fillStyle = frameBgColor;
          ctx.fillRect(0, qrSize, totalWidth, frameBannerHeight);
          ctx.fillStyle = frameTextColor;
          ctx.fillText(frameText.toUpperCase(), totalWidth / 2, qrSize + frameBannerHeight / 2);
        } else if (frameType === 'card-badge') {
          ctx.fillStyle = frameBgColor;
          const bannerY = qrOffsetY + qrSize + Math.round(frameBannerHeight * 0.2);
          const bannerW = totalWidth * 0.75;
          const bannerH = frameBannerHeight * 0.8;
          const bannerX = (totalWidth - bannerW) / 2;

          ctx.beginPath();
          ctx.roundRect
            ? ctx.roundRect(bannerX, bannerY, bannerW, bannerH, Math.round(bannerH * 0.3))
            : ctx.rect(bannerX, bannerY, bannerW, bannerH);
          ctx.fill();

          ctx.fillStyle = frameTextColor;
          ctx.fillText(frameText.toUpperCase(), totalWidth / 2, bannerY + bannerH / 2);
        }
        ctx.restore();
      }
    } catch (err) {
      console.error('QR Render failed:', err);
    }
  }, [
    getCompiledPayload, qrSize, quietZoneMargin, eccLevel, fgColor,
    bgColor, useGradient, gradientStart, gradientEnd, gradientAngle,
    moduleStyle, centerLogoType, selectedPresetLogo, customLogoSrc,
    logoSizePercent, frameType, frameText, frameBgColor, frameTextColor
  ]);

  // Trigger render on state updates
  useEffect(() => {
    renderQRCode();
  }, [renderQRCode]);

  // ----------------------------------------------------
  // LOGO UPLOAD HANDLER
  // ----------------------------------------------------
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setCustomLogoSrc(event.target.result as string);
        setCenterLogoType('custom');
        setEccLevel('H');
      }
    };
    reader.readAsDataURL(file);
  };

  // ----------------------------------------------------
  // APPLY THEME PALETTE
  // ----------------------------------------------------
  const applyPalette = (p: ColorPalette) => {
    setFgColor(p.fg);
    setBgColor(p.bg);
    if (p.gradient) {
      setUseGradient(true);
      setGradientStart(p.gradient.start);
      setGradientEnd(p.gradient.end);
    } else {
      setUseGradient(false);
    }
  };

  // ----------------------------------------------------
  // 1-CLICK TEST TEMPLATE LOADER
  // ----------------------------------------------------
  const loadTestTemplate = (t: typeof TEST_TEMPLATES[0]) => {
    setPayloadType(t.type);
    applyPalette(t.palette);
    if (t.type === 'wifi') {
      setWifiSsid(t.data.ssid || '');
      setWifiPassword(t.data.password || '');
    } else if (t.type === 'upi') {
      setUpiVpa(t.data.vpa || '');
      setUpiName(t.data.name || '');
      setUpiAmount(t.data.amount || '');
      setUpiNote(t.data.note || '');
    } else if (t.type === 'url') {
      setUrl(t.data.url || '');
    } else if (t.type === 'vcard') {
      setVcardFirst(t.data.firstName || '');
      setVcardLast(t.data.lastName || '');
      setVcardOrg(t.data.org || '');
      setVcardTitle(t.data.title || '');
      setVcardPhone(t.data.phone || '');
      setVcardEmail(t.data.email || '');
      setVcardUrl(t.data.url || '');
      setVcardAddress(t.data.address || '');
    }
  };

  // ----------------------------------------------------
  // EXPORT HANDLERS (PNG, SVG, PDF, CLIPBOARD)
  // ----------------------------------------------------
  const downloadPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `qr-code-${payloadType}-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();

    recordHistory(dataUrl);
  };

  const downloadSVG = () => {
    if (!svgOutput) return;
    const blob = new Blob([svgOutput], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `qr-code-${payloadType}-${Date.now()}.svg`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadPDF = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const qrImgData = canvas.toDataURL('image/png');

    // Header Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(15, 23, 42);
    doc.text('Scan to Connect / Pay', pageWidth / 2, 35, { align: 'center' });

    // Subtitle description
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(100, 116, 139);
    doc.text('Point your smartphone camera at this QR code to access instantly.', pageWidth / 2, 44, { align: 'center' });

    // QR Code Image (centered)
    const qrSizeMm = 110;
    const qrX = (pageWidth - qrSizeMm) / 2;
    doc.addImage(qrImgData, 'PNG', qrX, 55, qrSizeMm, qrSizeMm);

    // Payload details box
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(pageWidth / 2 - 60, 175, 120, 24, 3, 3, 'F');
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text(`Type: ${payloadType.toUpperCase()} • Generated via Toolique Studio`, pageWidth / 2, 189, { align: 'center' });

    doc.save(`qr-code-flyer-${payloadType}-${Date.now()}.pdf`);
  };

  const copyToClipboard = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        setCopiedNotification(true);
        setTimeout(() => setCopiedNotification(false), 2500);
      }, 'image/png');
    } catch {
      alert('Clipboard copy is not supported on this browser. Use Download PNG instead.');
    }
  };

  const recordHistory = (dataUrl: string) => {
    const item: SessionHistoryItem = {
      id: `qr-${Date.now()}`,
      type: payloadType,
      title: payloadType.toUpperCase() + ' QR Code',
      payloadString: getCompiledPayload(),
      dataUrl,
      timestamp: Date.now()
    };
    setSessionHistory(prev => [item, ...prev.slice(0, 7)]);
  };

  const resetToDefaults = () => {
    setPayloadType('url');
    setUrl('https://toolique.com');
    setFgColor('#09090b');
    setBgColor('#ffffff');
    setUseGradient(false);
    setCenterLogoType('none');
    setFrameType('none');
    setModuleStyle('square');
    setEccLevel('H');
    setQuietZoneMargin(3);
  };

  return (
    <div className="w-full space-y-6 text-left">
      {/* ---------------------------------------------------- */}
      {/* TOP BAR: Payload Type Switcher & Presets */}
      {/* ---------------------------------------------------- */}
      <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-zinc-900 dark:text-white font-bold text-sm">
            <QrCode className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>Select QR Code Type:</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
              <span className="text-[11px] font-bold text-zinc-400 uppercase mr-1 hidden sm:inline">Presets:</span>
              {TEST_TEMPLATES.map((tmpl, idx) => (
                <button
                  key={idx}
                  onClick={() => loadTestTemplate(tmpl)}
                  className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-zinc-700 dark:text-zinc-300 text-xs font-semibold transition cursor-pointer shrink-0"
                >
                  {tmpl.name}
                </button>
              ))}
            </div>

            <button
              onClick={resetToDefaults}
              className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 cursor-pointer"
              title="Reset QR Code Settings"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Payload Type Tabs */}
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-800/70 rounded-xl">
          {[
            { id: 'url', label: 'URL', icon: LinkIcon },
            { id: 'wifi', label: 'Wi-Fi', icon: Wifi },
            { id: 'upi', label: 'UPI Pay', icon: CreditCard },
            { id: 'vcard', label: 'vCard', icon: User },
            { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquareIcon },
            { id: 'email', label: 'Email', icon: Mail },
            { id: 'sms', label: 'SMS', icon: Phone },
            { id: 'geo', label: 'Location', icon: MapPin },
            { id: 'event', label: 'Event', icon: Calendar },
            { id: 'text', label: 'Text', icon: FileText },
          ].map((tab) => {
            const isSelected = payloadType === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setPayloadType(tab.id as PayloadType)}
                className={`py-2 px-1 rounded-lg text-xs font-bold flex flex-col items-center gap-1 transition cursor-pointer ${
                  isSelected
                    ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[11px] truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* MAIN TWO-COLUMN STUDIO WORKSPACE */}
      {/* ---------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ==================================================== */}
        {/* LEFT COLUMN: Input Form & Customization Tools */}
        {/* ==================================================== */}
        <div className="lg:col-span-6 space-y-6">
          {/* Card 1: Content Data Form */}
          <div className="saas-card p-6 space-y-4">
            <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <span className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-indigo-500" />
                <span>Content Configuration ({payloadType.toUpperCase()})</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold uppercase">
                Static QR (Never Expires)
              </span>
            </h3>

            {/* URL Form */}
            {payloadType === 'url' && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Target Website URL</label>
                <div className="relative">
                  <LinkIcon className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-medium focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Wi-Fi Form */}
            {payloadType === 'wifi' && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Network Name (SSID)</label>
                  <input
                    type="text"
                    value={wifiSsid}
                    onChange={(e) => setWifiSsid(e.target.value)}
                    placeholder="e.g. CoffeeShop_Guest"
                    className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-medium focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Security Encryption</label>
                    <select
                      value={wifiEncryption}
                      onChange={(e) => setWifiEncryption(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold"
                    >
                      <option value="WPA">WPA / WPA2 / WPA3 (Standard)</option>
                      <option value="WEP">WEP (Legacy)</option>
                      <option value="nopass">None (Open Network)</option>
                    </select>
                  </div>

                  {wifiEncryption !== 'nopass' && (
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-xs font-bold text-zinc-700 dark:text-zinc-300">
                        <span>Password</span>
                        <button
                          type="button"
                          onClick={() => setShowWifiPassword(!showWifiPassword)}
                          className="text-[10px] text-zinc-400 hover:text-zinc-600 flex items-center gap-1 cursor-pointer"
                        >
                          {showWifiPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          <span>{showWifiPassword ? 'Hide' : 'Show'}</span>
                        </button>
                      </div>
                      <input
                        type={showWifiPassword ? 'text' : 'password'}
                        value={wifiPassword}
                        onChange={(e) => setWifiPassword(e.target.value)}
                        placeholder="Wi-Fi Password"
                        className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-medium focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                  )}
                </div>

                <label className="flex items-center gap-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={wifiHidden}
                    onChange={(e) => setWifiHidden(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Hidden Network (SSID Broadcast Disabled)</span>
                </label>
              </div>
            )}

            {/* UPI Payment Form */}
            {payloadType === 'upi' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Payee VPA / UPI ID</label>
                    <input
                      type="text"
                      value={upiVpa}
                      onChange={(e) => setUpiVpa(e.target.value)}
                      placeholder="e.g. name@okhdfcbank"
                      className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-medium focus:border-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Payee Name</label>
                    <input
                      type="text"
                      value={upiName}
                      onChange={(e) => setUpiName(e.target.value)}
                      placeholder="e.g. Toolique Merchant"
                      className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-medium focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Amount (₹ INR Optional)</label>
                    <input
                      type="number"
                      value={upiAmount}
                      onChange={(e) => setUpiAmount(e.target.value)}
                      placeholder="e.g. 499"
                      className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-medium focus:border-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Transaction Note</label>
                    <input
                      type="text"
                      value={upiNote}
                      onChange={(e) => setUpiNote(e.target.value)}
                      placeholder="e.g. Bill payment"
                      className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-medium focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* vCard Form */}
            {payloadType === 'vcard' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">First Name</label>
                    <input
                      type="text"
                      value={vcardFirst}
                      onChange={(e) => setVcardFirst(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-medium"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Last Name</label>
                    <input
                      type="text"
                      value={vcardLast}
                      onChange={(e) => setVcardLast(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Organization / Company</label>
                    <input
                      type="text"
                      value={vcardOrg}
                      onChange={(e) => setVcardOrg(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-medium"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Job Title</label>
                    <input
                      type="text"
                      value={vcardTitle}
                      onChange={(e) => setVcardTitle(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Phone Number</label>
                    <input
                      type="tel"
                      value={vcardPhone}
                      onChange={(e) => setVcardPhone(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-medium"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Email Address</label>
                    <input
                      type="email"
                      value={vcardEmail}
                      onChange={(e) => setVcardEmail(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Website URL</label>
                    <input
                      type="url"
                      value={vcardUrl}
                      onChange={(e) => setVcardUrl(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-medium"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">City / Address</label>
                    <input
                      type="text"
                      value={vcardAddress}
                      onChange={(e) => setVcardAddress(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-medium"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* WhatsApp Form */}
            {payloadType === 'whatsapp' && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Phone Number (with Country Code)</label>
                  <input
                    type="text"
                    value={waPhone}
                    onChange={(e) => setWaPhone(e.target.value)}
                    placeholder="e.g. +919876543210"
                    className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Pre-filled Chat Message</label>
                  <textarea
                    value={waMessage}
                    onChange={(e) => setWaMessage(e.target.value)}
                    rows={3}
                    placeholder="Hello! I'd like to chat..."
                    className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-medium resize-none"
                  />
                </div>
              </div>
            )}

            {/* Email Form */}
            {payloadType === 'email' && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Recipient Email</label>
                  <input
                    type="email"
                    value={emailTo}
                    onChange={(e) => setEmailTo(e.target.value)}
                    placeholder="recipient@example.com"
                    className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Subject</label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder="Subject line"
                    className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Email Body</label>
                  <textarea
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    rows={3}
                    className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-medium resize-none"
                  />
                </div>
              </div>
            )}

            {/* SMS Form */}
            {payloadType === 'sms' && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Phone Number</label>
                  <input
                    type="tel"
                    value={smsPhone}
                    onChange={(e) => setSmsPhone(e.target.value)}
                    placeholder="+91 9876543210"
                    className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">SMS Message</label>
                  <textarea
                    value={smsMessage}
                    onChange={(e) => setSmsMessage(e.target.value)}
                    rows={3}
                    placeholder="Type SMS text..."
                    className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-medium resize-none"
                  />
                </div>
              </div>
            )}

            {/* Geo Location Form */}
            {payloadType === 'geo' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Latitude</label>
                    <input
                      type="text"
                      value={geoLat}
                      onChange={(e) => setGeoLat(e.target.value)}
                      placeholder="18.5204"
                      className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-medium"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Longitude</label>
                    <input
                      type="text"
                      value={geoLng}
                      onChange={(e) => setGeoLng(e.target.value)}
                      placeholder="73.8567"
                      className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-medium"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Location Label / Query</label>
                  <input
                    type="text"
                    value={geoQuery}
                    onChange={(e) => setGeoQuery(e.target.value)}
                    placeholder="e.g. Pune City Center"
                    className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-medium"
                  />
                </div>
              </div>
            )}

            {/* Calendar Event Form */}
            {payloadType === 'event' && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Event Title</label>
                  <input
                    type="text"
                    value={eventTitle}
                    onChange={(e) => setEventTitle(e.target.value)}
                    placeholder="Event Title"
                    className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Location / Venue</label>
                  <input
                    type="text"
                    value={eventLocation}
                    onChange={(e) => setEventLocation(e.target.value)}
                    placeholder="Venue or Online URL"
                    className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-medium"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Start Date & Time</label>
                    <input
                      type="datetime-local"
                      value={eventStart}
                      onChange={(e) => setEventStart(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-medium"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">End Date & Time</label>
                    <input
                      type="datetime-local"
                      value={eventEnd}
                      onChange={(e) => setEventEnd(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-medium"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Description</label>
                  <textarea
                    value={eventDescription}
                    onChange={(e) => setEventDescription(e.target.value)}
                    rows={2}
                    className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-medium resize-none"
                  />
                </div>
              </div>
            )}

            {/* Plain Text Form */}
            {payloadType === 'text' && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Raw Text Content</label>
                <textarea
                  value={plainText}
                  onChange={(e) => setPlainText(e.target.value)}
                  rows={4}
                  placeholder="Enter any text, crypto wallet address, or code snippet..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-medium resize-none"
                />
              </div>
            )}
          </div>

          {/* Card 2: Visual Styling, Colors, Logo & Frame */}
          <div className="saas-card p-6 space-y-5">
            <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <Palette className="w-4 h-4 text-indigo-500" />
              <span>Design, Colors & Brand Customization</span>
            </h3>

            {/* Module Shapes */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-zinc-500 uppercase">Module Shape</span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'square', label: 'Classic Square' },
                  { id: 'rounded', label: 'Smooth Rounded' },
                  { id: 'dots', label: 'Circular Dots' },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setModuleStyle(s.id as ModuleStyle)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition cursor-pointer text-center ${
                      moduleStyle === s.id
                        ? 'bg-indigo-600 text-white border-transparent shadow-xs'
                        : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Theme Presets */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-zinc-500 uppercase">Color Themes</span>
              <div className="flex flex-wrap gap-2">
                {COLOR_PALETTES.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => applyPalette(p)}
                    className="group px-2.5 py-1 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-indigo-400 bg-white dark:bg-zinc-900 text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                  >
                    <span
                      className="w-3 h-3 rounded-full border border-black/10 shrink-0"
                      style={{ background: p.gradient ? `linear-gradient(135deg, ${p.gradient.start}, ${p.gradient.end})` : p.fg }}
                    />
                    <span className="text-zinc-700 dark:text-zinc-300">{p.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Colors & Gradients */}
            <div className="grid grid-cols-2 gap-4 pt-1">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Foreground Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={fgColor}
                    onChange={(e) => {
                      setFgColor(e.target.value);
                      setUseGradient(false);
                    }}
                    className="w-8 h-8 rounded-lg border border-zinc-300 dark:border-zinc-700 cursor-pointer p-0.5 bg-transparent"
                  />
                  <input
                    type="text"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="w-24 px-2 py-1 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-mono rounded-lg"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Background Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={bgColor === 'transparent' ? '#ffffff' : bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-8 h-8 rounded-lg border border-zinc-300 dark:border-zinc-700 cursor-pointer p-0.5 bg-transparent"
                  />
                  <input
                    type="text"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-24 px-2 py-1 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-mono rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* Linear Gradient Toggle */}
            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Linear Color Gradient</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useGradient}
                    onChange={(e) => setUseGradient(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-zinc-300 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              {useGradient && (
                <div className="space-y-3 pt-1">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase">Gradient Start</label>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="color"
                          value={gradientStart}
                          onChange={(e) => setGradientStart(e.target.value)}
                          className="w-7 h-7 rounded border border-zinc-300 dark:border-zinc-700 cursor-pointer p-0 bg-transparent"
                        />
                        <span className="text-[10px] font-mono text-zinc-500">{gradientStart}</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase">Gradient End</label>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="color"
                          value={gradientEnd}
                          onChange={(e) => setGradientEnd(e.target.value)}
                          className="w-7 h-7 rounded border border-zinc-300 dark:border-zinc-700 cursor-pointer p-0 bg-transparent"
                        />
                        <span className="text-[10px] font-mono text-zinc-500">{gradientEnd}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-bold text-zinc-600 dark:text-zinc-400">
                      <span>Gradient Angle</span>
                      <span>{gradientAngle}°</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={360}
                      value={gradientAngle}
                      onChange={(e) => setGradientAngle(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Center Logo Section */}
            <div className="space-y-3 p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-indigo-500" />
                  <span>Center Logo / Brand Icon</span>
                </span>
                <div className="flex rounded-lg border border-zinc-200 dark:border-zinc-800 p-0.5 bg-white dark:bg-zinc-900">
                  <button
                    onClick={() => setCenterLogoType('none')}
                    className={`px-2 py-0.5 text-[10px] font-bold rounded cursor-pointer ${
                      centerLogoType === 'none' ? 'bg-indigo-600 text-white' : 'text-zinc-500'
                    }`}
                  >
                    None
                  </button>
                  <button
                    onClick={() => {
                      setCenterLogoType('preset');
                      setEccLevel('H');
                    }}
                    className={`px-2 py-0.5 text-[10px] font-bold rounded cursor-pointer ${
                      centerLogoType === 'preset' ? 'bg-indigo-600 text-white' : 'text-zinc-500'
                    }`}
                  >
                    Presets
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className={`px-2 py-0.5 text-[10px] font-bold rounded cursor-pointer ${
                      centerLogoType === 'custom' ? 'bg-indigo-600 text-white' : 'text-zinc-500'
                    }`}
                  >
                    Upload
                  </button>
                </div>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleLogoUpload}
                accept="image/png,image/jpeg,image/svg+xml"
                className="hidden"
              />

              {centerLogoType === 'preset' && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {PRESET_LOGOS.map((logo) => (
                    <button
                      key={logo.id}
                      onClick={() => setSelectedPresetLogo(logo.id)}
                      className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                        selectedPresetLogo === logo.id
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400'
                          : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400'
                      }`}
                    >
                      <logo.icon className="w-3.5 h-3.5" style={{ color: logo.color }} />
                      <span>{logo.label}</span>
                    </button>
                  ))}
                </div>
              )}

              {centerLogoType === 'custom' && customLogoSrc && (
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <img src={customLogoSrc} alt="Custom Logo" className="w-8 h-8 rounded border border-zinc-300 dark:border-zinc-700 object-contain p-0.5 bg-white" />
                    <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Custom Logo Active</span>
                  </div>
                  <button
                    onClick={() => {
                      setCustomLogoSrc(null);
                      setCenterLogoType('none');
                    }}
                    className="text-xs text-red-500 hover:underline cursor-pointer font-bold"
                  >
                    Remove
                  </button>
                </div>
              )}

              {centerLogoType !== 'none' && (
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between text-[11px] font-bold text-zinc-600 dark:text-zinc-400">
                    <span>Center Logo Scale</span>
                    <span>{logoSizePercent}%</span>
                  </div>
                  <input
                    type="range"
                    min={15}
                    max={30}
                    value={logoSizePercent}
                    onChange={(e) => setLogoSizePercent(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>
              )}
            </div>

            {/* Call-to-Action Frame Section */}
            <div className="space-y-3 p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Call-to-Action Frame</span>
                </span>
                <select
                  value={frameType}
                  onChange={(e) => setFrameType(e.target.value as any)}
                  className="px-2 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold"
                >
                  <option value="none">No Frame</option>
                  <option value="top-banner">Top Banner</option>
                  <option value="bottom-banner">Bottom Banner</option>
                  <option value="card-badge">Card Badge</option>
                </select>
              </div>

              {frameType !== 'none' && (
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase">Banner Text</label>
                    <input
                      type="text"
                      value={frameText}
                      onChange={(e) => setFrameText(e.target.value)}
                      placeholder="e.g. SCAN ME"
                      className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-bold uppercase"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase">Frame Color</label>
                    <div className="flex items-center gap-1.5 mt-1">
                      <input
                        type="color"
                        value={frameBgColor}
                        onChange={(e) => setFrameBgColor(e.target.value)}
                        className="w-7 h-7 rounded border border-zinc-300 dark:border-zinc-700 cursor-pointer p-0 bg-transparent"
                      />
                      <input
                        type="color"
                        value={frameTextColor}
                        onChange={(e) => setFrameTextColor(e.target.value)}
                        className="w-7 h-7 rounded border border-zinc-300 dark:border-zinc-700 cursor-pointer p-0 bg-transparent"
                        title="Text Color"
                      />
                      <span className="text-[10px] font-mono text-zinc-500">{frameBgColor}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Error Correction & Margin Advanced Controls */}
            <div className="grid grid-cols-2 gap-4 pt-1">
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  <span>Error Correction (ECC)</span>
                  <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">{eccLevel} (30%)</span>
                </div>
                <select
                  value={eccLevel}
                  onChange={(e) => setEccLevel(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold"
                >
                  <option value="L">L - Low (7% Recovery)</option>
                  <option value="M">M - Medium (15% Recovery)</option>
                  <option value="Q">Q - Quartile (25% Recovery)</option>
                  <option value="H">H - High (30% Recovery Best for Logos)</option>
                </select>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  <span>Quiet Margin</span>
                  <span className="font-mono text-zinc-500">{quietZoneMargin} blocks</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={6}
                  value={quietZoneMargin}
                  onChange={(e) => setQuietZoneMargin(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 mt-2"
                />
              </div>
            </div>

            {/* Output Resolution Setting */}
            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-xs font-bold text-zinc-700 dark:text-zinc-300">
                <span>Output Resolution</span>
                <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">{qrSize} × {qrSize} px</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[512, 1024, 2048, 4096].map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setQrSize(sz)}
                    className={`py-1.5 rounded-lg text-xs font-bold border transition cursor-pointer ${
                      qrSize === sz
                        ? 'bg-indigo-600 text-white border-transparent'
                        : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400'
                    }`}
                  >
                    {sz === 4096 ? '4K Ultra' : sz === 2048 ? '2K Print' : `${sz}px`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ==================================================== */}
        {/* RIGHT COLUMN: Interactive Live Canvas & Vector Exports */}
        {/* ==================================================== */}
        <div className="lg:col-span-6 space-y-6">
          <div className="saas-card p-6 flex flex-col items-center justify-between space-y-6 text-center">
            {/* Top Toolbar */}
            <div className="w-full flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800 text-xs">
              <span className="font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-indigo-500" />
                <span>Live QR Output Preview</span>
              </span>

              {/* Scanability Badge */}
              <div className="flex items-center gap-1.5">
                {contrastRatio >= 4.5 ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Scan Contrast: {contrastRatio.toFixed(1)}:1 (Excellent)</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 text-[10px] font-bold">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Low Contrast ({contrastRatio.toFixed(1)}:1)</span>
                  </span>
                )}
              </div>
            </div>

            {/* Canvas Render Container */}
            <div className="p-6 rounded-2xl bg-zinc-900 shadow-xl border border-zinc-800 flex items-center justify-center max-w-full overflow-hidden">
              <canvas
                ref={canvasRef}
                className="max-w-full max-h-[380px] object-contain rounded-xl shadow-md transition"
                style={{ width: '320px', height: 'auto' }}
              />
            </div>

            {/* Export Actions Grid */}
            <div className="w-full space-y-3 pt-2">
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={downloadPNG}
                  className="saas-button-primary py-3 flex items-center justify-center gap-1.5 text-xs font-bold cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PNG</span>
                </button>

                <button
                  onClick={downloadSVG}
                  className="py-3 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:border-indigo-400 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                  title="Download scalable vector SVG for print"
                >
                  <FileCode className="w-4 h-4 text-indigo-500" />
                  <span>Vector SVG</span>
                </button>

                <button
                  onClick={downloadPDF}
                  className="py-3 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:border-indigo-400 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                  title="Generate print-ready flyer PDF"
                >
                  <Printer className="w-4 h-4 text-emerald-500" />
                  <span>Print PDF Flyer</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={copyToClipboard}
                  className="flex-1 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-850 hover:bg-zinc-100 text-zinc-700 dark:text-zinc-300 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {copiedNotification ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedNotification ? 'Image Copied to Clipboard!' : 'Copy to Clipboard'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Session History Card */}
          {sessionHistory.length > 0 && (
            <div className="saas-card p-5 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-zinc-500 uppercase">
                <span>Recent Generated QR Codes</span>
                <span className="text-[10px] text-zinc-400 font-normal">{sessionHistory.length} saved</span>
              </div>
              <div className="flex items-center gap-3 overflow-x-auto pb-1">
                {sessionHistory.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      const link = document.createElement('a');
                      link.download = `re-export-${item.type}.png`;
                      link.href = item.dataUrl;
                      link.click();
                    }}
                    className="relative w-20 h-20 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shrink-0 p-1 group cursor-pointer"
                    title={`Click to re-download: ${item.title}`}
                  >
                    <img src={item.dataUrl} alt={item.title} className="w-full h-full object-contain rounded" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 rounded-xl transition flex items-center justify-center text-white">
                      <Download className="w-4 h-4" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Simple MessageSquare icon component
function MessageSquareIcon(props: any) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  );
}
