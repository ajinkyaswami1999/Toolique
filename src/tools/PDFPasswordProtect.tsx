/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  FileText,
  Download,
  AlertCircle,
  Loader2,
  Lock,
  ShieldCheck,
  Check,
  CheckCircle2,
  Copy,
  Sparkles,
  Eye,
  EyeOff,
  KeyRound,
  Printer,
  Trash2,
  ExternalLink,
  X,
  FileCheck,
  Shield,
  Layers,
  Settings2
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { pdfjs } from '../utils/pdfWorker';

type ResolutionPreset = 'standard' | 'high' | 'ultra';
type SecurityProfile = 'maximum' | 'standard' | 'fillable' | 'custom';

interface DocumentInfo {
  name: string;
  size: number;
  numPages: number;
  coverThumbnail: string;
  width: number;
  height: number;
}

export default function PDFPasswordProtect() {
  // Document State
  const [file, setFile] = useState<File | null>(null);
  const [docInfo, setDocInfo] = useState<DocumentInfo | null>(null);
  const [isReadingFile, setIsReadingFile] = useState<boolean>(false);
  const [fileError, setFileError] = useState<string | null>(null);

  // Security & Password State
  const [userPassword, setUserPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [useSeparateOwnerPassword, setUseSeparateOwnerPassword] = useState<boolean>(false);
  const [ownerPassword, setOwnerPassword] = useState<string>('');
  const [showOwnerPassword, setShowOwnerPassword] = useState<boolean>(false);

  // Security Permissions Configuration
  const [securityProfile, setSecurityProfile] = useState<SecurityProfile>('standard');
  const [allowPrinting, setAllowPrinting] = useState<boolean>(true);
  const [allowCopying, setAllowCopying] = useState<boolean>(false);
  const [allowModifying, setAllowModifying] = useState<boolean>(false);
  const [allowAnnotating, setAllowAnnotating] = useState<boolean>(false);

  // Quality & Resolution Setting
  const [resolutionPreset, setResolutionPreset] = useState<ResolutionPreset>('standard');

  // Encryption Execution State
  const [isEncrypting, setIsEncrypting] = useState<boolean>(false);
  const [progress, setProgress] = useState<{ current: number; total: number; stage: string; percent: number }>({
    current: 0,
    total: 0,
    stage: '',
    percent: 0
  });
  const [encryptedBlobInfo, setEncryptedBlobInfo] = useState<{ blob: Blob; url: string; size: number } | null>(null);
  const [encryptionError, setEncryptionError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Drag & drop ref
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clean up blob URL on unmount
  useEffect(() => {
    return () => {
      if (encryptedBlobInfo?.url) {
        URL.revokeObjectURL(encryptedBlobInfo.url);
      }
    };
  }, [encryptedBlobInfo]);

  // Sync security profile to individual permissions
  const handleProfileChange = (profile: SecurityProfile) => {
    setSecurityProfile(profile);
    if (profile === 'maximum') {
      setAllowPrinting(false);
      setAllowCopying(false);
      setAllowModifying(false);
      setAllowAnnotating(false);
    } else if (profile === 'standard') {
      setAllowPrinting(true);
      setAllowCopying(false);
      setAllowModifying(false);
      setAllowAnnotating(false);
    } else if (profile === 'fillable') {
      setAllowPrinting(true);
      setAllowCopying(false);
      setAllowModifying(false);
      setAllowAnnotating(true);
    }
  };

  // Compute password strength score (0 to 100)
  const passwordStrength = useMemo(() => {
    if (!userPassword) return { score: 0, label: 'Empty', color: 'bg-zinc-200 dark:bg-zinc-700' };

    let score = 0;
    if (userPassword.length >= 8) score += 25;
    if (userPassword.length >= 12) score += 15;
    if (/[a-z]/.test(userPassword) && /[A-Z]/.test(userPassword)) score += 20;
    if (/[0-9]/.test(userPassword)) score += 20;
    if (/[^a-zA-Z0-9]/.test(userPassword)) score += 20;

    if (score < 40) return { score, label: 'Weak', color: 'bg-red-500' };
    if (score < 70) return { score, label: 'Fair', color: 'bg-amber-500' };
    if (score < 90) return { score, label: 'Strong', color: 'bg-indigo-500' };
    return { score: 100, label: 'Very Strong', color: 'bg-emerald-500' };
  }, [userPassword]);

  // Generate strong random password
  const generateStrongPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*()_+~';
    let generated = '';
    const array = new Uint32Array(16);
    crypto.getRandomValues(array);
    for (let i = 0; i < 16; i++) {
      generated += chars[array[i] % chars.length];
    }
    setUserPassword(generated);
    setConfirmPassword(generated);
    setShowPassword(true);
    setShowConfirmPassword(true);
    setEncryptedBlobInfo(null);
  };

  // Copy password to clipboard
  const handleCopyPassword = () => {
    if (!userPassword) return;
    navigator.clipboard.writeText(userPassword);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Inspect uploaded PDF file and generate cover thumbnail
  const processUploadedFile = async (uploadedFile: File) => {
    setFileError(null);
    setEncryptionError(null);
    setEncryptedBlobInfo(null);
    setIsReadingFile(true);

    try {
      const buffer = await uploadedFile.arrayBuffer();
      const loadingTask = pdfjs.getDocument({
        data: buffer,
        cMapUrl: 'https://unpkg.com/pdfjs-dist@6.0.227/cmaps/',
        cMapPacked: true
      });

      const pdf = await loadingTask.promise;
      const numPages = pdf.numPages;

      // Render cover page thumbnail
      const page1 = await pdf.getPage(1);
      const viewport = page1.getViewport({ scale: 0.4 });
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d', { alpha: false });

      let coverThumbnail = '';
      if (ctx) {
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        await page1.render({
          canvasContext: ctx,
          viewport: viewport,
          canvas: canvas
        }).promise;

        coverThumbnail = canvas.toDataURL('image/jpeg', 0.8);
      }

      setFile(uploadedFile);
      setDocInfo({
        name: uploadedFile.name,
        size: uploadedFile.size,
        numPages,
        coverThumbnail,
        width: Math.round(viewport.width / 0.4),
        height: Math.round(viewport.height / 0.4)
      });
    } catch (err: any) {
      console.error('PDF parsing error:', err);
      if (err?.name === 'PasswordException') {
        setFileError('This PDF document is already password-protected. Please use the PDF Unlock tool to unprotect or modify it.');
      } else {
        setFileError(err.message || 'Failed to read PDF document. Ensure the file is not corrupted.');
      }
      setFile(null);
      setDocInfo(null);
    } finally {
      setIsReadingFile(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = e.target.files?.[0];
    if (uploaded) {
      if (uploaded.type !== 'application/pdf' && !uploaded.name.toLowerCase().endsWith('.pdf')) {
        setFileError('Please upload a valid PDF document (.pdf file only).');
        return;
      }
      processUploadedFile(uploaded);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) {
      if (dropped.type !== 'application/pdf' && !dropped.name.toLowerCase().endsWith('.pdf')) {
        setFileError('Please drop a valid PDF document (.pdf format).');
        return;
      }
      processUploadedFile(dropped);
    }
  };

  const handleReset = () => {
    if (encryptedBlobInfo?.url) {
      URL.revokeObjectURL(encryptedBlobInfo.url);
    }
    setFile(null);
    setDocInfo(null);
    setUserPassword('');
    setConfirmPassword('');
    setOwnerPassword('');
    setEncryptedBlobInfo(null);
    setFileError(null);
    setEncryptionError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Execute In-Browser PDF Encryption
  const handleEncryptPDF = async () => {
    if (!file || !docInfo) return;

    if (!userPassword) {
      setEncryptionError('Please specify an open password for the document.');
      return;
    }

    if (userPassword !== confirmPassword) {
      setEncryptionError('Password and confirmation do not match. Please verify.');
      return;
    }

    setIsEncrypting(true);
    setEncryptionError(null);
    setProgress({ current: 0, total: docInfo.numPages, stage: 'Preparing document encryption...', percent: 0 });

    try {
      const buffer = await file.arrayBuffer();
      const loadingTask = pdfjs.getDocument({
        data: buffer,
        cMapUrl: 'https://unpkg.com/pdfjs-dist@6.0.227/cmaps/',
        cMapPacked: true
      });
      const pdf = await loadingTask.promise;
      const numPages = pdf.numPages;

      // Scale factor according to resolution preset
      const scaleMultiplier = resolutionPreset === 'ultra' ? 2.5 : resolutionPreset === 'high' ? 2.0 : 1.5;
      const imageQuality = resolutionPreset === 'ultra' ? 0.95 : 0.9;

      // Permissions mapping for jsPDF
      const permissions: Array<'print' | 'modify' | 'copy' | 'annot-forms'> = [];
      if (allowPrinting) permissions.push('print');
      if (allowCopying) permissions.push('copy');
      if (allowModifying) permissions.push('modify');
      if (allowAnnotating) permissions.push('annot-forms');

      const finalOwnerPassword = useSeparateOwnerPassword && ownerPassword.trim()
        ? ownerPassword.trim()
        : userPassword + '_owner_' + Math.random().toString(36).substring(2, 7);

      let encryptedDoc: jsPDF | null = null;

      for (let i = 1; i <= numPages; i++) {
        setProgress({
          current: i,
          total: numPages,
          stage: `Encrypting & compiling page ${i} of ${numPages}...`,
          percent: Math.round(((i - 1) / numPages) * 90)
        });

        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: scaleMultiplier });

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { alpha: false });
        if (!ctx) throw new Error('Failed to initialize canvas renderer.');

        canvas.width = viewport.width;
        canvas.height = viewport.height;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        await page.render({
          canvasContext: ctx,
          viewport: viewport,
          canvas: canvas
        }).promise;

        const imgData = canvas.toDataURL('image/jpeg', imageQuality);

        // Native dimensions in PDF points
        const unscaledViewport = page.getViewport({ scale: 1.0 });
        const ptWidth = unscaledViewport.width;
        const ptHeight = unscaledViewport.height;
        const isLandscape = ptWidth > ptHeight;

        if (i === 1) {
          encryptedDoc = new jsPDF({
            orientation: isLandscape ? 'l' : 'p',
            unit: 'pt',
            format: [ptWidth, ptHeight],
            encryption: {
              userPassword: userPassword,
              ownerPassword: finalOwnerPassword,
              userPermissions: permissions as any
            }
          });
          encryptedDoc.addImage(imgData, 'JPEG', 0, 0, ptWidth, ptHeight, undefined, 'FAST');
        } else if (encryptedDoc) {
          encryptedDoc.addPage([ptWidth, ptHeight], isLandscape ? 'l' : 'p');
          encryptedDoc.addImage(imgData, 'JPEG', 0, 0, ptWidth, ptHeight, undefined, 'FAST');
        }
      }

      if (!encryptedDoc) throw new Error('Document creation failed.');

      setProgress({
        current: numPages,
        total: numPages,
        stage: 'Finalizing 128-bit security headers...',
        percent: 98
      });

      const outputBlob = encryptedDoc.output('blob');
      const outputUrl = URL.createObjectURL(outputBlob);

      setEncryptedBlobInfo({
        blob: outputBlob,
        url: outputUrl,
        size: outputBlob.size
      });

      setProgress({
        current: numPages,
        total: numPages,
        stage: 'Complete!',
        percent: 100
      });
    } catch (err: any) {
      console.error('Encryption failed:', err);
      setEncryptionError(err.message || 'An error occurred while securing the PDF document.');
    } finally {
      setIsEncrypting(false);
    }
  };

  const handleDownload = () => {
    if (!encryptedBlobInfo || !file) return;
    const cleanName = file.name.replace(/\.[^/.]+$/, '');
    const link = document.createElement('a');
    link.href = encryptedBlobInfo.url;
    link.download = `${cleanName}_protected.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenInNewTab = () => {
    if (!encryptedBlobInfo) return;
    window.open(encryptedBlobInfo.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 text-left">
      {/* Privacy & Engine Assurance Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-indigo-50/70 dark:bg-indigo-950/25 border border-indigo-200/70 dark:border-indigo-800/40 rounded-2xl text-xs">
        <div className="flex items-center gap-2.5 text-indigo-950 dark:text-indigo-200">
          <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <span>
            <strong className="font-semibold text-indigo-900 dark:text-indigo-100">100% Client-Side Encryption:</strong> Your document and password never leave your device. Encrypted in browser memory with standard ISO 32000 128-bit security.
          </span>
        </div>
        <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-medium shrink-0">
          <Lock className="w-3.5 h-3.5 text-indigo-500" />
          <span>RC4-128 Standard Cryptography</span>
        </div>
      </div>

      {/* Upload Zone (When No File Loaded) */}
      {!file && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`saas-card relative border-2 border-dashed p-10 sm:p-14 text-center transition-all ${
            isDragging
              ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 scale-[0.99]'
              : 'border-zinc-250 dark:border-zinc-800 hover:border-indigo-400/80 bg-zinc-50/40 dark:bg-zinc-900/30'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            aria-label="Upload PDF document to encrypt"
          />

          <div className="max-w-md mx-auto space-y-4 pointer-events-none">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-sm">
              <Lock className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <p className="text-base font-bold text-zinc-900 dark:text-white">
                Drop your PDF here or <span className="text-indigo-600 dark:text-indigo-400 underline">browse</span>
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Encrypt PDF with secure open password and custom permissions
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-[11px] text-zinc-400 dark:text-zinc-500 font-medium">
              <span className="px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800/60">Open Password</span>
              <span>•</span>
              <span className="px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800/60">Print/Copy Permissions</span>
              <span>•</span>
              <span className="px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800/60">Password Generator</span>
              <span>•</span>
              <span className="px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800/60">Zero Cloud Uploads</span>
            </div>
          </div>
        </div>
      )}

      {/* Reading File Spinner */}
      {isReadingFile && (
        <div className="saas-card p-10 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 dark:text-indigo-400 mx-auto" />
          <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Inspecting document structure...</p>
        </div>
      )}

      {/* File Level Error Alert */}
      {fileError && (
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-xs flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="space-y-1 flex-1">
            <p className="font-bold">Cannot Load PDF</p>
            <p className="text-red-600 dark:text-red-400">{fileError}</p>
          </div>
          <button
            onClick={() => setFileError(null)}
            className="p-1 text-red-500 hover:text-red-700 dark:hover:text-red-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Configuration & Encryption Workspace */}
      {file && docInfo && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Security Settings & Password */}
          <div className="lg:col-span-7 space-y-6">
            {/* Document Info Card */}
            <div className="saas-card p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 min-w-0">
                {docInfo.coverThumbnail ? (
                  <div className="w-12 h-14 bg-zinc-100 dark:bg-zinc-800 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700 shrink-0 shadow-2xs">
                    <img
                      src={docInfo.coverThumbnail}
                      alt="Cover Preview"
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="p-3 bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-bold text-zinc-900 dark:text-white truncate max-w-sm sm:max-w-md">
                    {docInfo.name}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-0.5">
                    <span>{(docInfo.size / (1024 * 1024)).toFixed(2)} MB</span>
                    <span>•</span>
                    <span>{docInfo.numPages} {docInfo.numPages === 1 ? 'page' : 'pages'}</span>
                    <span>•</span>
                    <span>{docInfo.width}×{docInfo.height} pt</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleReset}
                className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-1.5 transition cursor-pointer shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5 text-zinc-500" />
                <span>Change PDF</span>
              </button>
            </div>

            {/* Password Credentials Panel */}
            <div className="saas-card p-6 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-150 dark:border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-indigo-500" />
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Document Passwords</h3>
                </div>

                <button
                  type="button"
                  onClick={generateStrongPassword}
                  className="px-2.5 py-1 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/60 border border-indigo-200/80 dark:border-indigo-800/80 text-indigo-700 dark:text-indigo-300 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Generate Strong Password</span>
                </button>
              </div>

              {/* Set Open Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-bold text-zinc-700 dark:text-zinc-300">
                    Open / User Password <span className="text-red-500">*</span>
                  </label>
                  {userPassword && (
                    <button
                      type="button"
                      onClick={handleCopyPassword}
                      className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      {isCopied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      <span>{isCopied ? 'Copied!' : 'Copy Password'}</span>
                    </button>
                  )}
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={userPassword}
                    onChange={(e) => {
                      setUserPassword(e.target.value);
                      setEncryptedBlobInfo(null);
                    }}
                    placeholder="Enter document open password..."
                    className="w-full px-4 py-2.5 pr-10 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-850 text-xs text-zinc-900 dark:text-zinc-100 font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {userPassword && (
                  <div className="space-y-1 pt-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-zinc-500 dark:text-zinc-400 font-medium">Password Strength</span>
                      <span className="font-bold text-zinc-700 dark:text-zinc-300">
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${passwordStrength.color} transition-all duration-300`}
                        style={{ width: `${passwordStrength.score}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Confirm Open Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setEncryptedBlobInfo(null);
                    }}
                    placeholder="Re-type document password..."
                    className="w-full px-4 py-2.5 pr-10 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-850 text-xs text-zinc-900 dark:text-zinc-100 font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {confirmPassword && (
                  <p
                    className={`text-[11px] font-semibold ${
                      userPassword === confirmPassword
                        ? 'text-emerald-600 dark:text-emerald-400 flex items-center gap-1'
                        : 'text-red-500'
                    }`}
                  >
                    {userPassword === confirmPassword ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Passwords match!</span>
                      </>
                    ) : (
                      'Passwords do not match'
                    )}
                  </p>
                )}
              </div>

              {/* Advanced Owner Password Toggle */}
              <div className="pt-2 border-t border-zinc-150 dark:border-zinc-800 space-y-3">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={useSeparateOwnerPassword}
                    onChange={(e) => setUseSeparateOwnerPassword(e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-indigo-600 focus:ring-indigo-500 border-zinc-300 dark:border-zinc-700 cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Set separate Owner/Master Password (for managing permissions)
                  </span>
                </label>

                {useSeparateOwnerPassword && (
                  <div className="space-y-1.5 pl-5 animate-in fade-in duration-200">
                    <label className="text-xs font-bold text-zinc-600 dark:text-zinc-400">
                      Owner Password
                    </label>
                    <div className="relative">
                      <input
                        type={showOwnerPassword ? 'text' : 'password'}
                        value={ownerPassword}
                        onChange={(e) => setOwnerPassword(e.target.value)}
                        placeholder="Owner password (optional)..."
                        className="w-full px-3 py-2 pr-10 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-850 text-xs text-zinc-900 dark:text-zinc-100 font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowOwnerPassword(!showOwnerPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
                      >
                        {showOwnerPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Granular Permissions Panel */}
            <div className="saas-card p-6 space-y-4">
              <div className="flex items-center gap-2 border-b border-zinc-150 dark:border-zinc-800 pb-3">
                <Shield className="w-4 h-4 text-indigo-500" />
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Security & Permissions</h3>
              </div>

              {/* Security Profile Presets */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'maximum', label: '🛡️ Maximum', desc: 'Read-only, no print' },
                  { id: 'standard', label: '📄 Standard', desc: 'Print allowed' },
                  { id: 'fillable', label: '✏️ Fillable', desc: 'Forms & print' },
                  { id: 'custom', label: '⚙️ Custom', desc: 'Granular controls' }
                ].map((prof) => (
                  <button
                    key={prof.id}
                    type="button"
                    onClick={() => handleProfileChange(prof.id as SecurityProfile)}
                    className={`p-2.5 rounded-xl text-left border transition cursor-pointer ${
                      securityProfile === prof.id
                        ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-500 text-indigo-900 dark:text-indigo-200'
                        : 'bg-zinc-50/50 dark:bg-zinc-900/30 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-850'
                    }`}
                  >
                    <p className="text-xs font-bold">{prof.label}</p>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">{prof.desc}</p>
                  </button>
                ))}
              </div>

              {/* Permission Checkboxes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <label className="flex items-start gap-2.5 p-2.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-900/20 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={allowPrinting}
                    onChange={(e) => {
                      setAllowPrinting(e.target.checked);
                      setSecurityProfile('custom');
                    }}
                    className="w-4 h-4 mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 border-zinc-300 dark:border-zinc-700 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                      <Printer className="w-3.5 h-3.5 text-zinc-500" />
                      Allow Printing
                    </span>
                    <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block mt-0.5">
                      Recipients can print physical copies
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-2.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-900/20 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={allowCopying}
                    onChange={(e) => {
                      setAllowCopying(e.target.checked);
                      setSecurityProfile('custom');
                    }}
                    className="w-4 h-4 mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 border-zinc-300 dark:border-zinc-700 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                      <Copy className="w-3.5 h-3.5 text-zinc-500" />
                      Allow Copying Content
                    </span>
                    <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block mt-0.5">
                      Allow extracting text & graphics
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-2.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-900/20 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={allowModifying}
                    onChange={(e) => {
                      setAllowModifying(e.target.checked);
                      setSecurityProfile('custom');
                    }}
                    className="w-4 h-4 mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 border-zinc-300 dark:border-zinc-700 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                      <FileCheck className="w-3.5 h-3.5 text-zinc-500" />
                      Allow Modifying Content
                    </span>
                    <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block mt-0.5">
                      Allow inserting, deleting, or reordering
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-2.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-900/20 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={allowAnnotating}
                    onChange={(e) => {
                      setAllowAnnotating(e.target.checked);
                      setSecurityProfile('custom');
                    }}
                    className="w-4 h-4 mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 border-zinc-300 dark:border-zinc-700 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-zinc-500" />
                      Allow Forms & Annotations
                    </span>
                    <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block mt-0.5">
                      Allow filling PDF fields & comments
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column: Resolution, Compilation & Output */}
          <div className="lg:col-span-5 space-y-6">
            {/* Resolution Preset Card */}
            <div className="saas-card p-6 space-y-4">
              <div className="flex items-center gap-2 border-b border-zinc-150 dark:border-zinc-800 pb-3">
                <Settings2 className="w-4 h-4 text-indigo-500" />
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Render Resolution</h3>
              </div>

              <div className="space-y-2">
                {[
                  { id: 'standard', title: 'Standard (150 DPI)', desc: 'Fast rendering, compact file size, sharp text' },
                  { id: 'high', title: 'High (200 DPI)', desc: 'Recommended for reports and detailed diagrams' },
                  { id: 'ultra', title: 'Ultra (300 DPI)', desc: 'Maximum print-ready resolution' }
                ].map((item) => (
                  <label
                    key={item.id}
                    className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition ${
                      resolutionPreset === item.id
                        ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30'
                        : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-900/10 hover:bg-zinc-100 dark:hover:bg-zinc-850'
                    }`}
                  >
                    <input
                      type="radio"
                      name="resolution"
                      checked={resolutionPreset === item.id}
                      onChange={() => setResolutionPreset(item.id as ResolutionPreset)}
                      className="mt-0.5 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-bold text-zinc-900 dark:text-white block">{item.title}</span>
                      <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block mt-0.5">{item.desc}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Actions & Execution Card */}
            <div className="saas-card p-6 space-y-4">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Execute Encryption</h3>

              <button
                type="button"
                onClick={handleEncryptPDF}
                disabled={isEncrypting || !userPassword || userPassword !== confirmPassword}
                className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
              >
                {isEncrypting ? (
                  <>
                    <Loader2 className="w-4.5 h-4.5 animate-spin" />
                    <span>Encrypting PDF...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4.5 h-4.5" />
                    <span>{encryptedBlobInfo ? 'Re-encrypt PDF' : 'Encrypt & Lock PDF'}</span>
                  </>
                )}
              </button>

              {/* Progress Indicator */}
              {isEncrypting && (
                <div className="space-y-2 pt-2 text-xs">
                  <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400">
                    <span className="font-semibold">{progress.stage}</span>
                    <span className="font-mono">{progress.percent}%</span>
                  </div>
                  <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 transition-all duration-200"
                      style={{ width: `${progress.percent}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Error Message */}
              {encryptionError && (
                <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{encryptionError}</span>
                </div>
              )}

              {/* Success Result Panel */}
              {encryptedBlobInfo && (
                <div className="p-5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center gap-2.5 text-emerald-700 dark:text-emerald-300">
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    <span className="text-xs font-bold">PDF Locked & Encrypted!</span>
                  </div>

                  <div className="space-y-1 text-xs text-zinc-600 dark:text-zinc-400">
                    <div className="flex justify-between">
                      <span>Protected Size:</span>
                      <span className="font-bold text-zinc-900 dark:text-white">
                        {(encryptedBlobInfo.size / (1024 * 1024)).toFixed(2)} MB
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pages Protected:</span>
                      <span className="font-bold text-zinc-900 dark:text-white">{docInfo.numPages}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Security:</span>
                      <span className="font-bold text-zinc-900 dark:text-white">RC4-128 Standard</span>
                    </div>
                  </div>

                  <div className="pt-2 space-y-2">
                    <button
                      onClick={handleDownload}
                      className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Encrypted PDF</span>
                    </button>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={handleOpenInNewTab}
                        className="py-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-750 transition cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Test Password</span>
                      </button>

                      <button
                        onClick={handleCopyPassword}
                        className="py-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-750 transition cursor-pointer"
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{isCopied ? 'Copied' : 'Copy Key'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
