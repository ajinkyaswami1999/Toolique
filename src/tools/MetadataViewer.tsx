import { useState } from 'react';
import { FileText, Upload, RotateCcw, Table, Eye, AlertCircle } from 'lucide-react';

interface ExifMetadata {
  [key: string]: string | number;
}

export default function MetadataViewer() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  
  const [basicDetails, setBasicDetails] = useState<{
    size: string;
    type: string;
    width: number;
    height: number;
    aspectRatio: string;
  } | null>(null);

  const [exifData, setExifData] = useState<ExifMetadata | null>(null);
  const [error, setError] = useState<string | null>(null);

  // File upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file.');
        return;
      }
      setError(null);
      setFileName(file.name);

      const sizeStr = (file.size / 1024).toFixed(1) + ' KB';
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setImageSrc(result);

        const img = new Image();
        img.src = result;
        img.onload = () => {
          // Gcf GCD helper for aspect ratio
          const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
          const divisor = gcd(img.width, img.height);
          const aspect = `${img.width / divisor}:${img.height / divisor}`;

          setBasicDetails({
            size: sizeStr,
            type: file.type,
            width: img.width,
            height: img.height,
            aspectRatio: aspect,
          });
        };
      };
      reader.readAsDataURL(file);

      // Parse EXIF ArrayBuffer
      const bufReader = new FileReader();
      bufReader.onload = (event) => {
        const buffer = event.target?.result as ArrayBuffer;
        try {
          const parsed = parseExif(buffer);
          setExifData(Object.keys(parsed).length > 0 ? parsed : null);
        } catch (err) {
          setExifData(null);
        }
      };
      bufReader.readAsArrayBuffer(file);
    }
  };

  // Basic EXIF Header parser
  const parseExif = (buffer: ArrayBuffer): ExifMetadata => {
    const dataView = new DataView(buffer);
    const length = buffer.byteLength;
    let offset = 0;

    // Check SOI marker (0xFFD8)
    if (dataView.getUint16(0) !== 0xFFD8) {
      return {}; // Not a JPEG
    }

    offset += 2;
    const tags: ExifMetadata = {};

    while (offset < length - 2) {
      const marker = dataView.getUint16(offset);
      
      // APP1 segment is where EXIF metadata lives
      if (marker === 0xFFE1) {
        const exifHeader = dataView.getUint32(offset + 4);
        
        // Exif\0\0 header (0x45786966)
        if (exifHeader === 0x45786966) {
          const tiffHeaderOffset = offset + 10;
          
          // Little or Big Endian?
          const isLittleEndian = dataView.getUint16(tiffHeaderOffset) === 0x4949;
          
          const ifdOffset = dataView.getUint32(tiffHeaderOffset + 4, isLittleEndian);
          
          parseIFD(dataView, tiffHeaderOffset, tiffHeaderOffset + ifdOffset, isLittleEndian, tags);
        }
        break;
      }
      
      offset += 2 + dataView.getUint16(offset + 2);
    }

    return tags;
  };

  // Helper to parse TIFF IFD directories
  const parseIFD = (
    dataView: DataView,
    tiffHeaderOffset: number,
    ifdOffset: number,
    little: boolean,
    tags: ExifMetadata
  ) => {
    const numEntries = dataView.getUint16(ifdOffset, little);
    
    // EXIF key tags
    const exifTags: Record<number, string> = {
      0x010F: 'Camera Make',
      0x0110: 'Camera Model',
      0x0132: 'Date Modified',
      0x9003: 'Date Taken',
      0x829A: 'Exposure Time (sec)',
      0x829D: 'Aperture (F-Stop)',
      0x8827: 'ISO Speed',
      0x920A: 'Focal Length (mm)',
      0x013B: 'Artist / Owner',
      0x010E: 'Description',
      0x0131: 'Software',
    };

    for (let i = 0; i < numEntries; i++) {
      const entryOffset = ifdOffset + 2 + i * 12;
      const tag = dataView.getUint16(entryOffset, little);
      
      if (exifTags[tag]) {
        const type = dataView.getUint16(entryOffset + 2, little);
        const count = dataView.getUint32(entryOffset + 4, little);
        const valueOffset = dataView.getUint32(entryOffset + 8, little);

        let value: string | number = '';

        if (type === 2) {
          // ASCII String
          const strOffset = count > 4 ? tiffHeaderOffset + valueOffset : entryOffset + 8;
          const bytes = [];
          for (let j = 0; j < count - 1; j++) {
            bytes.push(dataView.getUint8(strOffset + j));
          }
          value = String.fromCharCode(...bytes).trim();
        } else if (type === 3) {
          // Short integer
          value = dataView.getUint16(entryOffset + 8, little);
        } else if (type === 4) {
          // Long integer
          value = dataView.getUint32(entryOffset + 8, little);
        } else if (type === 5 || type === 10) {
          // Rational number (numerator / denominator)
          const numOffset = tiffHeaderOffset + valueOffset;
          const num = dataView.getUint32(numOffset, little);
          const den = dataView.getUint32(numOffset + 4, little);
          value = den !== 0 ? Number((num / den).toFixed(3)) : `${num}/${den}`;
        }

        if (value) {
          tags[exifTags[tag]] = value;
        }
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 text-left">
      {/* File Details Grid */}
      <div className="md:col-span-4 p-6 saas-card space-y-5">
        <div className="flex justify-between items-center border-b border-zinc-150 dark:border-zinc-800/80 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Table className="w-4.5 h-4.5" />
            </div>
            <h3 className="font-bold text-zinc-950 dark:text-white text-sm">Image Specs</h3>
          </div>
          {imageSrc && (
            <button
              onClick={() => {
                setImageSrc(null);
                setFileName('');
                setBasicDetails(null);
                setExifData(null);
              }}
              className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              title="Reset Upload"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Basic specifications list */}
        {basicDetails ? (
          <div className="space-y-4">
            <div>
              <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">General Specs</span>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-zinc-100 dark:border-zinc-800/60">
                  <span className="text-zinc-500">File Name</span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200 truncate max-w-[180px]">{fileName}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-zinc-100 dark:border-zinc-800/60">
                  <span className="text-zinc-500">File Size</span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">{basicDetails.size}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-zinc-100 dark:border-zinc-800/60">
                  <span className="text-zinc-500">MIME Type</span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200 font-mono">{basicDetails.type}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-zinc-100 dark:border-zinc-800/60">
                  <span className="text-zinc-500">Dimensions</span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200 font-mono">
                    {basicDetails.width} &times; {basicDetails.height} px
                  </span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-zinc-500">Aspect Ratio</span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200 font-mono">{basicDetails.aspectRatio}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-xs text-zinc-400 dark:text-zinc-550 leading-relaxed bg-zinc-50 dark:bg-zinc-950/40 p-4 rounded-xl space-y-1.5 border border-zinc-100 dark:border-zinc-800/60">
            <div className="flex gap-1.5 items-start">
              <Eye className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
              <span className="font-semibold text-zinc-650 dark:text-zinc-300">EXIF Meta Viewer</span>
            </div>
            <p>Select any JPEG or camera photo to parse exposure time, ISO speed, camera models, and GPS headers directly in browser.</p>
          </div>
        )}
      </div>

      {/* Workspace / EXIF Metadata list table */}
      <div className="md:col-span-8 p-6 saas-card flex flex-col min-h-[400px]">
        {error && (
          <div className="mb-4 w-full p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!imageSrc ? (
          <label className="flex-grow w-full flex flex-col justify-center items-center py-12 border-2 border-dashed border-zinc-300 dark:border-zinc-800 rounded-2xl cursor-pointer hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 transition-all duration-300">
            <Upload className="w-10 h-10 text-zinc-400 dark:text-zinc-600 mb-3" />
            <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Upload Image to View Metadata</span>
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1">JPEG, PNG, WebP supported</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </label>
        ) : (
          <div className="space-y-6 w-full flex-grow flex flex-col">
            <div className="flex justify-between items-center w-full px-1 text-[10px] text-zinc-400 dark:text-zinc-550 font-bold uppercase tracking-wider">
              <span>Parsed EXIF headers</span>
            </div>

            {exifData ? (
              <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden divide-y divide-zinc-100 dark:divide-zinc-800/80">
                {Object.entries(exifData).map(([tag, val]) => (
                  <div key={tag} className="flex justify-between p-3.5 text-xs">
                    <span className="text-zinc-450 dark:text-zinc-500 font-semibold">{tag}</span>
                    <span className="font-bold text-zinc-800 dark:text-zinc-200 font-mono">{val}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-grow flex flex-col items-center justify-center py-12 text-center text-zinc-400 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
                <FileText className="w-8 h-8 text-zinc-350 dark:text-zinc-700 mb-2.5" />
                <span className="text-xs font-bold">No EXIF Metadata Found</span>
                <p className="text-[10px] text-zinc-500 max-w-xs mt-1">
                  Photos direct from cameras (mostly JPEGs) contain EXIF headers. Compressed web exports usually strip EXIF to save size.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
