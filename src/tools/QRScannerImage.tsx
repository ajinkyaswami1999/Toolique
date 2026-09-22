import { useState, useRef, useEffect, useCallback } from 'react';
import {
  QrCode, Upload, Copy, Check, RotateCcw, ExternalLink,
  Camera, Video, Link as LinkIcon, CreditCard,
  MapPin, Calendar, Download,
  Sparkles, AlertCircle, Eye, EyeOff, History, Trash2
} from 'lucide-react';
import jsQR from 'jsqr';
import QRCode from 'qrcode';

type ScannerTab = 'upload' | 'camera' | 'url' | 'samples';
type PayloadType = 'url' | 'upi' | 'wifi' | 'vcard' | 'email' | 'sms' | 'geo' | 'event' | 'text';

interface ParsedPayload {
  type: PayloadType;
  raw: string;
  title: string;
  details: Record<string, any>;
}

interface ScanHistoryItem {
  id: string;
  timestamp: number;
  type: PayloadType;
  raw: string;
  title: string;
}

// Preset samples
const SAMPLE_PRESETS = [
  {
    id: 'upi',
    name: '💳 UPI Payment',
    desc: 'Merchant payment link (GooglePay / PhonePe / Paytm)',
    content: 'upi://pay?pa=merchant@okaxis&pn=Toolique%20India&am=499.00&cu=INR&tn=Developer%20Tools%20License',
    type: 'upi' as const
  },
  {
    id: 'wifi',
    name: '📶 Wi-Fi Hotspot',
    desc: 'WPA2 Office Network auto-connect',
    content: 'WIFI:S:Toolique_HighSpeed_5G;T:WPA;P:SuperSecretPass2026;H:false;;',
    type: 'wifi' as const
  },
  {
    id: 'vcard',
    name: '👤 vCard Contact',
    desc: 'Business profile with phone & email',
    content: `BEGIN:VCARD\nVERSION:3.0\nN:Swami;Ajinkya;;;\nFN:Ajinkya Swami\nORG:Toolique India\nTITLE:Founder & Lead Architect\nTEL;TYPE=CELL:+919876543210\nEMAIL:support@toolique.in\nURL:https://www.toolique.in\nADR:;;Pune;Maharashtra;;411001;India\nEND:VCARD`,
    type: 'vcard' as const
  },
  {
    id: 'url',
    name: '🌐 Web Link (HTTPS)',
    desc: 'Secure developer platform URL',
    content: 'https://www.toolique.in/developer/qr-scanner-image',
    type: 'url' as const
  },
  {
    id: 'geo',
    name: '📍 Geo Location',
    desc: 'Coordinates for GPS / Maps navigation',
    content: 'geo:18.5204,73.8567?q=18.5204,73.8567(Toolique%20HQ%20Pune)',
    type: 'geo' as const
  },
  {
    id: 'event',
    name: '📅 Calendar Event',
    desc: 'Developer Summit Conference reminder',
    content: 'BEGIN:VEVENT\nSUMMARY:Toolique Global Tech Keynote 2026\nLOCATION:Online Webinar\nDESCRIPTION:Explore 250+ new browser-sandboxed engineering tools.\nDTSTART:20261015T100000Z\nDTEND:20261015T120000Z\nEND:VEVENT',
    type: 'event' as const
  }
];

// Parser helper for any QR string payload
function parseQrContent(raw: string): ParsedPayload {
  const trimmed = raw.trim();

  // 1. UPI Payment URI
  if (trimmed.toLowerCase().startsWith('upi://pay')) {
    try {
      const url = new URL(trimmed.replace(/^upi:\/\/pay\?/i, 'https://dummy.com/?'));
      const pa = url.searchParams.get('pa') || '';
      const pn = url.searchParams.get('pn') || '';
      const am = url.searchParams.get('am') || '';
      const cu = url.searchParams.get('cu') || 'INR';
      const tn = url.searchParams.get('tn') || '';
      const tr = url.searchParams.get('tr') || '';

      return {
        type: 'upi',
        raw: trimmed,
        title: pn ? `UPI Payee: ${pn}` : `UPI: ${pa}`,
        details: { pa, pn, am, cu, tn, tr }
      };
    } catch {
      return { type: 'upi', raw: trimmed, title: 'UPI Payment Link', details: { pa: trimmed } };
    }
  }

  // 2. Wi-Fi Configuration (WIFI:S:...;T:...;P:...;;)
  if (trimmed.toUpperCase().startsWith('WIFI:')) {
    const ssidMatch = trimmed.match(/S:([^;]+)/i);
    const passMatch = trimmed.match(/P:([^;]+)/i);
    const typeMatch = trimmed.match(/T:([^;]+)/i);
    const hiddenMatch = trimmed.match(/H:([^;]+)/i);

    const ssid = ssidMatch ? ssidMatch[1] : 'Unknown Network';
    const password = passMatch ? passMatch[1] : '';
    const authType = typeMatch ? typeMatch[1] : 'WPA/WPA2';
    const hidden = hiddenMatch ? hiddenMatch[1].toLowerCase() === 'true' : false;

    return {
      type: 'wifi',
      raw: trimmed,
      title: `Wi-Fi: ${ssid}`,
      details: { ssid, password, authType, hidden }
    };
  }

  // 3. vCard / Contact Card
  if (trimmed.toUpperCase().includes('BEGIN:VCARD')) {
    const fnMatch = trimmed.match(/FN:([^\r\n]+)/i);
    const orgMatch = trimmed.match(/ORG:([^\r\n]+)/i);
    const titleMatch = trimmed.match(/TITLE:([^\r\n]+)/i);
    const emailMatch = trimmed.match(/EMAIL[^:]*:([^\r\n]+)/i);
    const telMatch = trimmed.match(/TEL[^:]*:([^\r\n]+)/i);
    const urlMatch = trimmed.match(/URL[^:]*:([^\r\n]+)/i);
    const adrMatch = trimmed.match(/ADR[^:]*:([^\r\n]+)/i);

    const fullName = fnMatch ? fnMatch[1] : 'Contact Card';
    const org = orgMatch ? orgMatch[1] : '';
    const jobTitle = titleMatch ? titleMatch[1] : '';
    const email = emailMatch ? emailMatch[1] : '';
    const phone = telMatch ? telMatch[1] : '';
    const website = urlMatch ? urlMatch[1] : '';
    const address = adrMatch ? adrMatch[1].replace(/;/g, ' ').trim() : '';

    return {
      type: 'vcard',
      raw: trimmed,
      title: `Contact: ${fullName}`,
      details: { fullName, org, jobTitle, email, phone, website, address }
    };
  }

  // 4. Calendar Event (iCalendar)
  if (trimmed.toUpperCase().includes('BEGIN:VEVENT')) {
    const sumMatch = trimmed.match(/SUMMARY:([^\r\n]+)/i);
    const locMatch = trimmed.match(/LOCATION:([^\r\n]+)/i);
    const descMatch = trimmed.match(/DESCRIPTION:([^\r\n]+)/i);
    const startMatch = trimmed.match(/DTSTART:([^\r\n]+)/i);
    const endMatch = trimmed.match(/DTEND:([^\r\n]+)/i);

    return {
      type: 'event',
      raw: trimmed,
      title: sumMatch ? sumMatch[1] : 'Calendar Event',
      details: {
        title: sumMatch ? sumMatch[1] : 'Event',
        location: locMatch ? locMatch[1] : '',
        description: descMatch ? descMatch[1] : '',
        dtStart: startMatch ? startMatch[1] : '',
        dtEnd: endMatch ? endMatch[1] : ''
      }
    };
  }

  // 5. Geo Location (geo:lat,lng)
  if (trimmed.toLowerCase().startsWith('geo:')) {
    const clean = trimmed.replace(/^geo:/i, '');
    const parts = clean.split('?')[0].split(',');
    const lat = parts[0]?.trim() || '';
    const lng = parts[1]?.trim() || '';
    const query = trimmed.includes('?q=') ? decodeURIComponent(trimmed.split('?q=')[1]) : `${lat},${lng}`;

    return {
      type: 'geo',
      raw: trimmed,
      title: `Location: ${lat}, ${lng}`,
      details: {
        lat,
        lng,
        mapUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query || `${lat},${lng}`)}`
      }
    };
  }

  // 6. Mailto
  if (trimmed.toLowerCase().startsWith('mailto:')) {
    const clean = trimmed.replace(/^mailto:/i, '');
    const [emailPart, queryPart] = clean.split('?');
    const params = new URLSearchParams(queryPart || '');
    const subject = params.get('subject') || '';
    const body = params.get('body') || '';

    return {
      type: 'email',
      raw: trimmed,
      title: `Email to: ${emailPart}`,
      details: { email: emailPart, subject, body }
    };
  }

  // 7. SMS (sms:+123456?body=...)
  if (trimmed.toLowerCase().startsWith('sms:')) {
    const clean = trimmed.replace(/^sms:/i, '');
    const [numPart, queryPart] = clean.split('?');
    const params = new URLSearchParams(queryPart || '');
    const body = params.get('body') || '';

    return {
      type: 'sms',
      raw: trimmed,
      title: `SMS to: ${numPart}`,
      details: { phone: numPart, body }
    };
  }

  // 8. Standard HTTP/HTTPS Web URL
  const urlPattern = /^(https?:\/\/)([\da-z.-]+)\.([a-z.]{2,10})([\/\w .-]*)*(\?[^#\s]*)?(#.*)?$/i;
  if (urlPattern.test(trimmed) || (trimmed.startsWith('http://') || trimmed.startsWith('https://'))) {
    try {
      const urlObj = new URL(trimmed);
      return {
        type: 'url',
        raw: trimmed,
        title: `Web URL: ${urlObj.hostname}`,
        details: {
          url: trimmed,
          protocol: urlObj.protocol,
          hostname: urlObj.hostname,
          pathname: urlObj.pathname,
          search: urlObj.search,
          isHttps: urlObj.protocol === 'https:'
        }
      };
    } catch {
      return {
        type: 'url',
        raw: trimmed,
        title: `Web URL`,
        details: { url: trimmed, isHttps: trimmed.startsWith('https://') }
      };
    }
  }

  // 9. Plain Text / JSON / Fallback
  let isJson = false;
  let formattedJson = '';
  if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
    try {
      formattedJson = JSON.stringify(JSON.parse(trimmed), null, 2);
      isJson = true;
    } catch {}
  }

  return {
    type: 'text',
    raw: trimmed,
    title: 'Text Content',
    details: {
      charCount: trimmed.length,
      wordCount: trimmed.split(/\s+/).filter(Boolean).length,
      isJson,
      formattedJson
    }
  };
}

export default function QRScannerImage() {
  const [activeTab, setActiveTab] = useState<ScannerTab>('upload');
  
  // Image Scanning State
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedResult, setParsedResult] = useState<ParsedPayload | null>(null);

  // URL input state
  const [urlInput, setUrlInput] = useState<string>('');

  // Camera Live Scanning State
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [hasTorch, setHasTorch] = useState<boolean>(false);
  const [isTorchOn, setIsTorchOn] = useState<boolean>(false);

  // UI helpers
  const [copied, setCopied] = useState<boolean>(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [scanHistory, setScanHistory] = useState<ScanHistoryItem[]>([]);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // References
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const visualCanvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Helper: Copy Text
  const copyToClipboard = (text: string, fieldId: string = 'main') => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    if (fieldId === 'main') {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else {
      setCopiedField(fieldId);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  // Record scan in history
  const recordHistory = useCallback((parsed: ParsedPayload) => {
    setScanHistory(prev => {
      // Avoid immediate duplicate
      if (prev.length > 0 && prev[0].raw === parsed.raw) return prev;
      const newItem: ScanHistoryItem = {
        id: Math.random().toString(36).substring(2, 9),
        timestamp: Date.now(),
        type: parsed.type,
        raw: parsed.raw,
        title: parsed.title
      };
      return [newItem, ...prev.slice(0, 19)]; // Keep last 20
    });
  }, []);

  // ----------------------------------------------------
  // MULTI-PASS QR DECODING ENGINE
  // ----------------------------------------------------
  const decodeImageData = useCallback((img: HTMLImageElement) => {
    setIsProcessing(true);
    setError(null);
    setParsedResult(null);

    const canvas = canvasRef.current;
    if (!canvas) {
      setIsProcessing(false);
      return;
    }
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) {
      setIsProcessing(false);
      return;
    }

    // Downscale oversized images to max 1200px to prevent CPU chokes while maintaining high scan fidelity
    const maxDim = 1200;
    let targetWidth = img.naturalWidth || img.width;
    let targetHeight = img.naturalHeight || img.height;

    if (targetWidth > maxDim || targetHeight > maxDim) {
      if (targetWidth > targetHeight) {
        targetHeight = Math.round((targetHeight * maxDim) / targetWidth);
        targetWidth = maxDim;
      } else {
        targetWidth = Math.round((targetWidth * maxDim) / targetHeight);
        targetHeight = maxDim;
      }
    }

    canvas.width = targetWidth;
    canvas.height = targetHeight;
    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

    // Multi-pass attempt logic
    let detectedCode: any = null;

    // PASS 1: Native raw pixel buffer with dual inversion attempts
    try {
      const rawImgData = ctx.getImageData(0, 0, targetWidth, targetHeight);
      detectedCode = jsQR(rawImgData.data, rawImgData.width, rawImgData.height, {
        inversionAttempts: 'attemptBoth'
      });
    } catch {}

    // PASS 2: If failed, apply high-contrast grayscale enhancement
    if (!detectedCode) {
      try {
        const imgData = ctx.getImageData(0, 0, targetWidth, targetHeight);
        const data = imgData.data;
        for (let i = 0; i < data.length; i += 4) {
          const avg = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
          // Binarize / High Contrast
          const val = avg > 128 ? 255 : 0;
          data[i] = val;
          data[i + 1] = val;
          data[i + 2] = val;
        }
        detectedCode = jsQR(data, imgData.width, imgData.height, {
          inversionAttempts: 'attemptBoth'
        });
      } catch {}
    }

    // PASS 3: If still failed, apply brightness booster
    if (!detectedCode) {
      try {
        const imgData = ctx.getImageData(0, 0, targetWidth, targetHeight);
        const data = imgData.data;
        for (let i = 0; i < data.length; i += 4) {
          // Increase luminance
          data[i] = Math.min(255, data[i] * 1.3);
          data[i + 1] = Math.min(255, data[i + 1] * 1.3);
          data[i + 2] = Math.min(255, data[i + 2] * 1.3);
        }
        detectedCode = jsQR(data, imgData.width, imgData.height, {
          inversionAttempts: 'attemptBoth'
        });
      } catch {}
    }

    setIsProcessing(false);

    if (detectedCode && detectedCode.data) {
      const parsed = parseQrContent(detectedCode.data);
      setParsedResult(parsed);
      recordHistory(parsed);
      setError(null);

      // Draw bounding box on visual canvas
      drawBoundingBox(img, detectedCode.location);
    } else {
      setParsedResult(null);
      setError('No QR code detected in the image. Please verify lighting, focus, or crop tighter around the QR code.');
    }
  }, [recordHistory]);

  // Draw Bounding Box highlight overlay
  const drawBoundingBox = (img: HTMLImageElement, location: any) => {
    const vCanvas = visualCanvasRef.current;
    if (!vCanvas || !location) return;
    const ctx = vCanvas.getContext('2d');
    if (!ctx) return;

    vCanvas.width = img.naturalWidth || img.width;
    vCanvas.height = img.naturalHeight || img.height;
    ctx.drawImage(img, 0, 0, vCanvas.width, vCanvas.height);

    // Draw glowing green highlight polygon
    ctx.lineWidth = Math.max(4, Math.round(vCanvas.width / 150));
    ctx.strokeStyle = '#10b981'; // Emerald
    ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';

    ctx.beginPath();
    ctx.moveTo(location.topLeftCorner.x, location.topLeftCorner.y);
    ctx.lineTo(location.topRightCorner.x, location.topRightCorner.y);
    ctx.lineTo(location.bottomRightCorner.x, location.bottomRightCorner.y);
    ctx.lineTo(location.bottomLeftCorner.x, location.bottomLeftCorner.y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Corner marks
    const drawCorner = (pt: { x: number; y: number }) => {
      ctx.fillStyle = '#6366f1';
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, Math.max(6, Math.round(vCanvas.width / 100)), 0, Math.PI * 2);
      ctx.fill();
    };

    drawCorner(location.topLeftCorner);
    drawCorner(location.topRightCorner);
    drawCorner(location.bottomRightCorner);
    drawCorner(location.bottomLeftCorner);
  };

  // Handle uploaded file
  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (PNG, JPG, WebP, SVG).');
      return;
    }
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setImageSrc(dataUrl);
      const img = new Image();
      img.onload = () => decodeImageData(img);
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  // Clipboard Paste (Ctrl+V) listener
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) {
            setActiveTab('upload');
            setFileName('Pasted_Clipboard_Image.png');
            processImageFile(file);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  // ----------------------------------------------------
  // LIVE CAMERA SCANNER LOOP
  // ----------------------------------------------------
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach(t => t.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: cameraFacing,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      cameraStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setIsCameraActive(true);

        // Check if torch / flashlight is supported
        const track = stream.getVideoTracks()[0];
        const capabilities: any = track.getCapabilities ? track.getCapabilities() : {};
        setHasTorch(Boolean(capabilities.torch));

        // Start requestAnimationFrame loop
        requestScanFrame();
      }
    } catch (err: any) {
      setCameraError(err?.message || 'Unable to access camera. Please allow camera permissions.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach(t => t.stop());
      cameraStreamRef.current = null;
    }
    setIsCameraActive(false);
    setIsTorchOn(false);
  };

  const toggleTorch = async () => {
    if (!cameraStreamRef.current) return;
    const track = cameraStreamRef.current.getVideoTracks()[0];
    if (!track) return;
    try {
      await (track as any).applyConstraints({
        advanced: [{ torch: !isTorchOn }]
      });
      setIsTorchOn(!isTorchOn);
    } catch {}
  };

  const requestScanFrame = () => {
    if (!videoRef.current || videoRef.current.readyState !== videoRef.current.HAVE_ENOUGH_DATA) {
      animationFrameRef.current = requestAnimationFrame(requestScanFrame);
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (ctx) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imgData.data, imgData.width, imgData.height, {
          inversionAttempts: 'attemptBoth'
        });

        if (code && code.data) {
          const parsed = parseQrContent(code.data);
          setParsedResult(parsed);
          recordHistory(parsed);
          stopCamera();
          return;
        }
      }
    }

    animationFrameRef.current = requestAnimationFrame(requestScanFrame);
  };

  // Stop camera on unmount or tab change
  useEffect(() => {
    if (activeTab !== 'camera') {
      stopCamera();
    }
    return () => stopCamera();
  }, [activeTab]);

  // Handle URL image load
  const handleFetchUrlImage = async () => {
    if (!urlInput.trim()) return;
    setError(null);
    setIsProcessing(true);
    setFileName(urlInput);

    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      setImageSrc(urlInput);
      decodeImageData(img);
    };
    img.onerror = () => {
      setIsProcessing(false);
      setError('Failed to load image from URL. Ensure the URL is public and allows CORS.');
    };
    img.src = urlInput.trim();
  };

  // Load Preset Sample
  const handleSelectPreset = async (preset: typeof SAMPLE_PRESETS[0]) => {
    setError(null);
    setFileName(preset.name);
    try {
      const dataUrl = await QRCode.toDataURL(preset.content, {
        width: 400,
        margin: 2,
        color: { dark: '#0f172a', light: '#ffffff' }
      });
      setImageSrc(dataUrl);
      const img = new Image();
      img.onload = () => decodeImageData(img);
      img.src = dataUrl;
    } catch (err: any) {
      setError('Failed to render sample QR: ' + err.message);
    }
  };

  // Download .vcf contact card
  const handleDownloadVCard = (raw: string, name: string) => {
    const blob = new Blob([raw], { type: 'text/vcard;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name.replace(/\s+/g, '_')}_contact.vcf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Download .ics calendar event
  const handleDownloadICS = (raw: string, title: string) => {
    const icsContent = `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Toolique//QRScanner//EN\n${raw}\nEND:VCALENDAR`;
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_')}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 text-left animate-fadeIn">
      {/* Hidden processing canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Top Studio Tabs & Reset */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200/80 dark:border-zinc-800/80 pb-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {[
            { id: 'upload', label: '📁 Upload & Paste (Ctrl+V)' },
            { id: 'camera', label: '📷 Live Webcam Scanner' },
            { id: 'url', label: '🔗 Image URL' },
            { id: 'samples', label: '✨ Sample QR Presets' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ScannerTab)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                  : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {parsedResult && (
          <button
            onClick={() => {
              setImageSrc(null);
              setFileName('');
              setParsedResult(null);
              setError(null);
              setUrlInput('');
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:border-indigo-400 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-zinc-500" />
            <span>Clear / New Scan</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Input Workspace */}
        <div className="lg:col-span-7 space-y-5">
          {/* TAB 1: UPLOAD & DRAG DROP */}
          {activeTab === 'upload' && (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                const file = e.dataTransfer.files?.[0];
                if (file) processImageFile(file);
              }}
              className={`p-8 rounded-3xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center min-h-[380px] bg-white dark:bg-zinc-900 ${
                isDragging
                  ? 'border-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/20'
                  : 'border-zinc-300 dark:border-zinc-800 hover:border-indigo-400'
              }`}
            >
              <input
                type="file"
                id="qr-file-input"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) processImageFile(file);
                }}
              />

              {!imageSrc ? (
                <label htmlFor="qr-file-input" className="flex flex-col items-center cursor-pointer text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-inner">
                    <Upload className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-zinc-900 dark:text-white">
                      Drop an image here or <span className="text-indigo-600 dark:text-indigo-400 underline">Browse Files</span>
                    </h4>
                    <p className="text-xs text-zinc-450 dark:text-zinc-500 mt-1">
                      Supports PNG, JPG, JPEG, WebP, SVG, and screenshot paste (<kbd className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-[10px] font-mono">Ctrl + V</kbd>)
                    </p>
                  </div>
                </label>
              ) : (
                <div className="w-full space-y-4 flex flex-col items-center">
                  <div className="flex items-center justify-between w-full px-2 text-xs font-bold text-zinc-500 border-b border-zinc-100 dark:border-zinc-800 pb-2">
                    <span className="truncate max-w-xs">{fileName || 'Loaded Image'}</span>
                    <label htmlFor="qr-file-input" className="text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer">
                      Upload Another
                    </label>
                  </div>

                  {/* Image Preview with Bounding Box Overlay */}
                  <div className="relative max-w-full rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-950/5 p-2 flex items-center justify-center">
                    <canvas
                      ref={visualCanvasRef}
                      className="max-h-[320px] max-w-full object-contain rounded-xl"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: LIVE CAMERA SCANNER */}
          {activeTab === 'camera' && (
            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                <h3 className="text-sm font-extrabold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Camera className="w-4 h-4 text-indigo-500" />
                  <span>Real-Time Webcam Scanner</span>
                </h3>

                {isCameraActive && (
                  <div className="flex items-center gap-2">
                    {hasTorch && (
                      <button
                        onClick={toggleTorch}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition ${
                          isTorchOn
                            ? 'bg-amber-500 text-white border-amber-600'
                            : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400'
                        }`}
                      >
                        Torch {isTorchOn ? 'ON' : 'OFF'}
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setCameraFacing(prev => prev === 'environment' ? 'user' : 'environment');
                        startCamera();
                      }}
                      className="px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:border-indigo-400 transition"
                    >
                      Flip Camera
                    </button>
                  </div>
                )}
              </div>

              {cameraError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 text-red-650 dark:text-red-400 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{cameraError}</span>
                </div>
              )}

              {!isCameraActive ? (
                <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <Video className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-zinc-900 dark:text-white">Enable Camera Access</h4>
                    <p className="text-xs text-zinc-450 dark:text-zinc-500 mt-1 max-w-sm">
                      Point your phone or webcam directly at a physical QR code. Decodes in real-time inside your browser RAM.
                    </p>
                  </div>
                  <button
                    onClick={startCamera}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-md shadow-indigo-500/20 cursor-pointer"
                  >
                    Start Camera Stream
                  </button>
                </div>
              ) : (
                <div className="relative rounded-2xl overflow-hidden border border-zinc-800 bg-black flex items-center justify-center">
                  <video
                    ref={videoRef}
                    className="max-h-[380px] w-full object-cover"
                    autoPlay
                    muted
                  />

                  {/* Scanning Guide Target Frame & Laser Line */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-56 h-56 border-2 border-indigo-400/80 rounded-2xl relative shadow-2xl overflow-hidden">
                      <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-pulse" style={{ animationDuration: '1.5s' }} />
                      <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-emerald-400" />
                      <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-emerald-400" />
                      <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-emerald-400" />
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-emerald-400" />
                    </div>
                  </div>

                  <button
                    onClick={stopCamera}
                    className="absolute top-3 right-3 px-3 py-1.5 rounded-xl bg-zinc-900/80 backdrop-blur-xs text-white text-xs font-bold border border-zinc-700 hover:bg-zinc-800 transition"
                  >
                    Stop Camera
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: IMAGE URL SCANNER */}
          {activeTab === 'url' && (
            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-4">
              <h3 className="text-sm font-extrabold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-800">
                <LinkIcon className="w-4 h-4 text-indigo-500" />
                <span>Scan Image from Remote URL</span>
              </h3>

              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-600 dark:text-zinc-300">
                  Image Direct URL (PNG, JPG, WebP)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://example.com/qr-code.png"
                    className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 text-zinc-900 dark:text-white text-xs font-medium focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    onClick={handleFetchUrlImage}
                    disabled={!urlInput.trim() || isProcessing}
                    className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs disabled:opacity-50 transition cursor-pointer"
                  >
                    {isProcessing ? 'Scanning...' : 'Scan URL'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SAMPLE PRESETS */}
          {activeTab === 'samples' && (
            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-4">
              <h3 className="text-sm font-extrabold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-800">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Test with Sample QR Codes</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SAMPLE_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset)}
                    className="p-3.5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/40 hover:border-indigo-500 hover:shadow-xs transition text-left group cursor-pointer"
                  >
                    <div className="font-bold text-xs text-zinc-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                      {preset.name}
                    </div>
                    <div className="text-[11px] text-zinc-500 mt-1">
                      {preset.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 rounded-2xl text-xs flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <strong className="font-bold">Scan Notice</strong>
                <p className="leading-relaxed">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Parsed Result & Action Hub */}
        <div className="lg:col-span-5 space-y-5">
          {parsedResult ? (
            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-5 animate-fadeIn">
              {/* Header Badge */}
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      Decoded Successfully
                    </span>
                    <h4 className="font-black text-sm text-zinc-900 dark:text-white">
                      {parsedResult.title}
                    </h4>
                  </div>
                </div>

                <button
                  onClick={() => copyToClipboard(parsedResult.raw, 'main')}
                  className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-bold hover:bg-indigo-100 transition flex items-center gap-1.5 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy All'}</span>
                </button>
              </div>

              {/* 1. UPI PAYMENT CARD */}
              {parsedResult.type === 'upi' && (
                <div className="space-y-3 bg-gradient-to-br from-indigo-50/50 to-purple-50/30 dark:from-indigo-950/30 dark:to-purple-950/20 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-900/50">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-500">UPI Payee ID (VPA):</span>
                    <button
                      onClick={() => copyToClipboard(parsedResult.details.pa, 'upi-vpa')}
                      className="text-xs font-black text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                    >
                      <span>{parsedResult.details.pa}</span>
                      {copiedField === 'upi-vpa' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>

                  {parsedResult.details.pn && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-500">Payee Name:</span>
                      <strong className="text-zinc-800 dark:text-zinc-200">{parsedResult.details.pn}</strong>
                    </div>
                  )}

                  {parsedResult.details.am && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-500">Requested Amount:</span>
                      <strong className="text-emerald-600 dark:text-emerald-400 font-black text-sm">
                        ₹{Number(parsedResult.details.am).toLocaleString('en-IN')} {parsedResult.details.cu}
                      </strong>
                    </div>
                  )}

                  {parsedResult.details.tn && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-500">Transaction Note:</span>
                      <span className="text-zinc-700 dark:text-zinc-300 font-medium">{parsedResult.details.tn}</span>
                    </div>
                  )}

                  <a
                    href={parsedResult.raw}
                    className="mt-2 w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Pay via UPI App</span>
                  </a>
                </div>
              )}

              {/* 2. WI-FI CONFIGURATION CARD */}
              {parsedResult.type === 'wifi' && (
                <div className="space-y-3 bg-zinc-50 dark:bg-zinc-950/40 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-500">Network Name (SSID):</span>
                    <button
                      onClick={() => copyToClipboard(parsedResult.details.ssid, 'wifi-ssid')}
                      className="font-bold text-zinc-900 dark:text-white flex items-center gap-1 hover:text-indigo-600"
                    >
                      <span>{parsedResult.details.ssid}</span>
                      {copiedField === 'wifi-ssid' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-500">Security Type:</span>
                    <strong className="text-zinc-700 dark:text-zinc-300">{parsedResult.details.authType}</strong>
                  </div>

                  {parsedResult.details.password && (
                    <div className="flex items-center justify-between text-xs pt-1 border-t border-zinc-100 dark:border-zinc-800">
                      <span className="text-zinc-500">Password:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-zinc-900 dark:text-white">
                          {showPassword ? parsedResult.details.password : '••••••••••••'}
                        </span>
                        <button
                          onClick={() => setShowPassword(!showPassword)}
                          className="p-1 rounded text-zinc-400 hover:text-zinc-600"
                        >
                          {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => copyToClipboard(parsedResult.details.password, 'wifi-pass')}
                          className="px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-[10px] font-bold text-zinc-700 dark:text-zinc-300 hover:bg-indigo-500 hover:text-white transition"
                        >
                          {copiedField === 'wifi-pass' ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 3. VCARD CONTACT CARD */}
              {parsedResult.type === 'vcard' && (
                <div className="space-y-3 bg-zinc-50 dark:bg-zinc-950/40 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-500">Full Name:</span>
                    <strong className="text-zinc-900 dark:text-white">{parsedResult.details.fullName}</strong>
                  </div>

                  {parsedResult.details.org && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-500">Organization:</span>
                      <span className="text-zinc-700 dark:text-zinc-300 font-semibold">{parsedResult.details.org}</span>
                    </div>
                  )}

                  {parsedResult.details.phone && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-500">Phone:</span>
                      <a href={`tel:${parsedResult.details.phone}`} className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">
                        {parsedResult.details.phone}
                      </a>
                    </div>
                  )}

                  {parsedResult.details.email && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-500">Email:</span>
                      <a href={`mailto:${parsedResult.details.email}`} className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">
                        {parsedResult.details.email}
                      </a>
                    </div>
                  )}

                  <button
                    onClick={() => handleDownloadVCard(parsedResult.raw, parsedResult.details.fullName)}
                    className="mt-2 w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download .VCF Contact Card</span>
                  </button>
                </div>
              )}

              {/* 4. WEB URL CARD */}
              {parsedResult.type === 'url' && (
                <div className="space-y-3 bg-zinc-50 dark:bg-zinc-950/40 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-500">Security Protocol:</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                      parsedResult.details.isHttps
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                    }`}>
                      {parsedResult.details.isHttps ? '🔒 Secure HTTPS' : '⚠️ Unencrypted HTTP'}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] text-zinc-400 font-bold">Full URL Destination:</span>
                    <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 font-mono text-xs text-indigo-600 dark:text-indigo-400 break-all">
                      {parsedResult.details.url}
                    </div>
                  </div>

                  <a
                    href={parsedResult.details.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Open Web Link in New Tab</span>
                  </a>
                </div>
              )}

              {/* 5. GEO LOCATION CARD */}
              {parsedResult.type === 'geo' && (
                <div className="space-y-3 bg-zinc-50 dark:bg-zinc-950/40 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-500">Coordinates:</span>
                    <strong className="text-zinc-900 dark:text-white font-mono">{parsedResult.details.lat}, {parsedResult.details.lng}</strong>
                  </div>

                  <a
                    href={parsedResult.details.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <MapPin className="w-4 h-4" />
                    <span>Open in Google Maps</span>
                  </a>
                </div>
              )}

              {/* 6. CALENDAR EVENT CARD */}
              {parsedResult.type === 'event' && (
                <div className="space-y-3 bg-zinc-50 dark:bg-zinc-950/40 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-500">Event Title:</span>
                    <strong className="text-zinc-900 dark:text-white">{parsedResult.details.title}</strong>
                  </div>
                  {parsedResult.details.location && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-500">Location:</span>
                      <span className="text-zinc-700 dark:text-zinc-300 font-semibold">{parsedResult.details.location}</span>
                    </div>
                  )}
                  <button
                    onClick={() => handleDownloadICS(parsedResult.raw, parsedResult.details.title)}
                    className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Download .ICS Calendar Event</span>
                  </button>
                </div>
              )}

              {/* Raw Payload Display with Syntax Box */}
              <div className="space-y-1.5 pt-2">
                <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  Raw Payload String ({parsedResult.raw.length} Characters)
                </span>
                <div className="p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-950/50 font-mono text-xs text-zinc-800 dark:text-zinc-200 break-all select-all max-h-48 overflow-y-auto leading-relaxed whitespace-pre-wrap">
                  {parsedResult.details.isJson ? parsedResult.details.formattedJson : parsedResult.raw}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-3xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 text-zinc-400 space-y-3">
              <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300 font-bold text-sm">
                <QrCode className="w-5 h-5 text-indigo-500" />
                <span>Ready to Scan</span>
              </div>
              <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                Upload an image, drop a screenshot with <kbd className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-[10px] font-mono">Ctrl+V</kbd>, or start your webcam. Parsed contents (UPI, Wi-Fi passwords, contact cards, web links) will be structured automatically.
              </p>
            </div>
          )}

          {/* Local Scan History List */}
          {scanHistory.length > 0 && (
            <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
                <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-indigo-500" />
                  Recent Scans ({scanHistory.length})
                </span>
                <button
                  onClick={() => setScanHistory([])}
                  className="text-[10px] font-bold text-rose-500 hover:underline flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  Clear
                </button>
              </div>

              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {scanHistory.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setParsedResult(parseQrContent(item.raw))}
                    className="w-full p-2.5 rounded-xl border border-zinc-100 dark:border-zinc-800 hover:border-indigo-400 bg-zinc-50/50 dark:bg-zinc-950/30 text-left transition flex items-center justify-between group"
                  >
                    <div className="truncate mr-2">
                      <div className="font-bold text-xs text-zinc-800 dark:text-zinc-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 truncate">
                        {item.title}
                      </div>
                      <div className="text-[10px] text-zinc-400 truncate font-mono">
                        {item.raw}
                      </div>
                    </div>
                    <span className="text-[9px] px-2 py-0.5 rounded-md bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-bold uppercase shrink-0">
                      {item.type}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
