import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Table,
  Upload,
  Sparkles,
  Camera,
  MapPin,
  Sliders,
  ShieldAlert,
  CheckCircle2,
  Download,
  Copy,
  Trash2,
  FolderUp,
  ExternalLink,
  Info,
  X,
  Layers
} from 'lucide-react';

export interface ParsedImageMetadata {
  id: string;
  name: string;
  sizeFormatted: string;
  sizeBytes: number;
  mimeType: string;
  src: string;
  width: number;
  height: number;
  aspectRatio: string;
  megapixels: string;
  formatCategory: 'JPEG' | 'PNG' | 'WebP' | 'GIF' | 'SVG' | 'Other';

  // Hardware
  make?: string;
  model?: string;
  software?: string;
  serialNumber?: string;
  lensMake?: string;
  lensModel?: string;
  lensSerialNumber?: string;

  // Exposure
  exposureTime?: string;
  exposureTimeSec?: number;
  fNumber?: string;
  iso?: string | number;
  focalLength?: string;
  focalLength35mm?: string;
  exposureProgram?: string;
  exposureBias?: string;
  meteringMode?: string;
  lightSource?: string;
  flash?: string;
  whiteBalance?: string;
  digitalZoomRatio?: string;
  sensingMethod?: string;
  colorSpace?: string;

  // Timestamps
  dateTimeOriginal?: string;
  dateTimeDigitized?: string;
  dateTimeModified?: string;

  // Rights / Description
  artist?: string;
  copyright?: string;
  description?: string;

  // GPS
  hasGps: boolean;
  latitude?: number;
  longitude?: number;
  latitudeFormatted?: string;
  longitudeFormatted?: string;
  altitude?: string;
  gpsTimestamp?: string;
  googleMapsUrl?: string;
  openStreetMapUrl?: string;

  // Raw Tags
  rawTags: Record<string, string | number>;
}

// Exposure program dictionary
const EXPOSURE_PROGRAMS: Record<number, string> = {
  0: 'Not Defined',
  1: 'Manual',
  2: 'Program AE (Auto)',
  3: 'Aperture Priority',
  4: 'Shutter Priority',
  5: 'Creative Program (Depth of Field)',
  6: 'Action Program (High Shutter Speed)',
  7: 'Portrait Mode',
  8: 'Landscape Mode',
};

// Metering mode dictionary
const METERING_MODES: Record<number, string> = {
  0: 'Unknown',
  1: 'Average',
  2: 'Center-Weighted Average',
  3: 'Spot',
  4: 'Multi-Spot',
  5: 'Multi-Segment (Pattern)',
  6: 'Partial',
  255: 'Other',
};

// Light source dictionary
const LIGHT_SOURCES: Record<number, string> = {
  0: 'Unknown',
  1: 'Daylight',
  2: 'Fluorescent',
  3: 'Tungsten (Incandescent)',
  4: 'Flash',
  9: 'Fine Weather',
  10: 'Cloudy Weather',
  11: 'Shade',
  17: 'Standard Light A',
  18: 'Standard Light B',
  19: 'Standard Light C',
  20: 'D55',
  21: 'D65',
  22: 'D75',
  255: 'Other',
};

// Color space dictionary
const COLOR_SPACES: Record<number, string> = {
  1: 'sRGB',
  2: 'Adobe RGB',
  65535: 'Uncalibrated / Custom',
};

// White balance dictionary
const WHITE_BALANCES: Record<number, string> = {
  0: 'Auto White Balance',
  1: 'Manual White Balance',
};

// Flash dictionary helper
function decodeFlashValue(val: number): string {
  const fired = (val & 1) !== 0;
  if (!fired) return 'Did not fire (Off)';
  return 'Flash fired';
}

/**
 * Parses binary TIFF / EXIF headers from an ArrayBuffer
 */
function parseExifBuffer(buffer: ArrayBuffer): Partial<ParsedImageMetadata> {
  const dataView = new DataView(buffer);
  const length = buffer.byteLength;
  let offset = 0;

  // Verify JPEG SOI marker (0xFFD8)
  if (dataView.getUint16(0) !== 0xFFD8) {
    return { rawTags: {} };
  }

  offset += 2;
  const rawTags: Record<string, string | number> = {};
  const result: Partial<ParsedImageMetadata> = { rawTags };

  while (offset < length - 2) {
    const marker = dataView.getUint16(offset);

    // APP1 marker (0xFFE1) containing EXIF
    if (marker === 0xFFE1) {
      const segmentLength = dataView.getUint16(offset + 2);
      if (offset + 4 + 4 > length) break;
      const exifHeader = dataView.getUint32(offset + 4);

      // "Exif\0\0" (0x45786966)
      if (exifHeader === 0x45786966) {
        const tiffHeaderOffset = offset + 10;
        if (tiffHeaderOffset + 8 <= length) {
          const byteOrder = dataView.getUint16(tiffHeaderOffset);
          const isLittleEndian = byteOrder === 0x4949; // "II" vs "MM"
          const ifdOffset = dataView.getUint32(tiffHeaderOffset + 4, isLittleEndian);

          parseTiffDirectories(
            dataView,
            tiffHeaderOffset,
            tiffHeaderOffset + ifdOffset,
            isLittleEndian,
            result,
            rawTags
          );
        }
      }
      offset += 2 + segmentLength;
    } else if ((marker & 0xFF00) === 0xFF00) {
      if (marker === 0xFFDA || marker === 0xFFD9) break; // SOS or EOI
      const segLen = dataView.getUint16(offset + 2);
      offset += 2 + segLen;
    } else {
      break;
    }
  }

  return result;
}

/**
 * Traverses 0th IFD, SubIFD (ExifIFD), and GPS IFD
 */
function parseTiffDirectories(
  dataView: DataView,
  tiffHeaderOffset: number,
  ifdOffset: number,
  little: boolean,
  result: Partial<ParsedImageMetadata>,
  rawTags: Record<string, string | number>
) {
  if (ifdOffset >= dataView.byteLength - 2) return;
  const numEntries = dataView.getUint16(ifdOffset, little);

  let exifSubIfdOffset: number | null = null;
  let gpsSubIfdOffset: number | null = null;

  for (let i = 0; i < numEntries; i++) {
    const entryOffset = ifdOffset + 2 + i * 12;
    if (entryOffset + 12 > dataView.byteLength) break;

    const tag = dataView.getUint16(entryOffset, little);
    const type = dataView.getUint16(entryOffset + 2, little);
    const count = dataView.getUint32(entryOffset + 4, little);
    const valueOffset = dataView.getUint32(entryOffset + 8, little);

    if (tag === 0x8769) {
      exifSubIfdOffset = tiffHeaderOffset + valueOffset;
      continue;
    }
    if (tag === 0x8825) {
      gpsSubIfdOffset = tiffHeaderOffset + valueOffset;
      continue;
    }

    const val = readTagValue(dataView, tiffHeaderOffset, entryOffset, type, count, valueOffset, little);
    if (val !== undefined) {
      map0thIfdTag(tag, val, result, rawTags);
    }
  }

  // Parse SubIFD (Exposure & Camera metadata)
  if (exifSubIfdOffset && exifSubIfdOffset < dataView.byteLength - 2) {
    const subEntries = dataView.getUint16(exifSubIfdOffset, little);
    for (let j = 0; j < subEntries; j++) {
      const entryOffset = exifSubIfdOffset + 2 + j * 12;
      if (entryOffset + 12 > dataView.byteLength) break;

      const tag = dataView.getUint16(entryOffset, little);
      const type = dataView.getUint16(entryOffset + 2, little);
      const count = dataView.getUint32(entryOffset + 4, little);
      const valueOffset = dataView.getUint32(entryOffset + 8, little);

      const val = readTagValue(dataView, tiffHeaderOffset, entryOffset, type, count, valueOffset, little);
      if (val !== undefined) {
        mapExifSubIfdTag(tag, val, result, rawTags);
      }
    }
  }

  // Parse GPS IFD (Location coordinates)
  if (gpsSubIfdOffset && gpsSubIfdOffset < dataView.byteLength - 2) {
    parseGpsIfd(dataView, tiffHeaderOffset, gpsSubIfdOffset, little, result, rawTags);
  }
}

function readTagValue(
  dataView: DataView,
  tiffHeaderOffset: number,
  entryOffset: number,
  type: number,
  count: number,
  valueOffset: number,
  little: boolean
): unknown {
  if (type === 2) {
    // ASCII String
    const strOffset = count > 4 ? tiffHeaderOffset + valueOffset : entryOffset + 8;
    if (strOffset + count > dataView.byteLength) return undefined;
    const chars: string[] = [];
    for (let c = 0; c < Math.max(0, count - 1); c++) {
      const b = dataView.getUint8(strOffset + c);
      if (b === 0) break;
      chars.push(String.fromCharCode(b));
    }
    return chars.join('').trim();
  } else if (type === 3) {
    // SHORT (16-bit)
    return dataView.getUint16(entryOffset + 8, little);
  } else if (type === 4) {
    // LONG (32-bit)
    return dataView.getUint32(entryOffset + 8, little);
  } else if (type === 5 || type === 10) {
    // RATIONAL
    const numOffset = tiffHeaderOffset + valueOffset;
    if (numOffset + 8 > dataView.byteLength) return undefined;
    if (count > 1) {
      const rationals: number[] = [];
      for (let r = 0; r < count; r++) {
        const off = numOffset + r * 8;
        if (off + 8 > dataView.byteLength) break;
        const n = type === 10 ? dataView.getInt32(off, little) : dataView.getUint32(off, little);
        const d = type === 10 ? dataView.getInt32(off + 4, little) : dataView.getUint32(off + 4, little);
        rationals.push(d !== 0 ? n / d : 0);
      }
      return rationals;
    } else {
      const n = type === 10 ? dataView.getInt32(numOffset, little) : dataView.getUint32(numOffset, little);
      const d = type === 10 ? dataView.getInt32(numOffset + 4, little) : dataView.getUint32(numOffset + 4, little);
      return d !== 0 ? n / d : 0;
    }
  }
  return undefined;
}

function map0thIfdTag(
  tag: number,
  val: unknown,
  result: Partial<ParsedImageMetadata>,
  rawTags: Record<string, string | number>
) {
  switch (tag) {
    case 0x010F:
      result.make = String(val);
      rawTags['Camera Make'] = String(val);
      break;
    case 0x0110:
      result.model = String(val);
      rawTags['Camera Model'] = String(val);
      break;
    case 0x0131:
      result.software = String(val);
      rawTags['Software'] = String(val);
      break;
    case 0x0132:
      result.dateTimeModified = String(val);
      rawTags['Date Modified'] = String(val);
      break;
    case 0x013B:
      result.artist = String(val);
      rawTags['Artist'] = String(val);
      break;
    case 0x8298:
      result.copyright = String(val);
      rawTags['Copyright'] = String(val);
      break;
    case 0x010E:
      result.description = String(val);
      rawTags['Image Description'] = String(val);
      break;
    case 0x0112:
      rawTags['Orientation'] = Number(val);
      break;
    default:
      if (typeof val === 'string' || typeof val === 'number') {
        rawTags[`Tag 0x${tag.toString(16).toUpperCase()}`] = val;
      }
  }
}

function mapExifSubIfdTag(
  tag: number,
  val: unknown,
  result: Partial<ParsedImageMetadata>,
  rawTags: Record<string, string | number>
) {
  switch (tag) {
    case 0x829A: {
      // ExposureTime (e.g. 0.004 => 1/250s)
      const sec = Number(val);
      result.exposureTimeSec = sec;
      if (sec < 1 && sec > 0) {
        result.exposureTime = `1/${Math.round(1 / sec)}s`;
      } else {
        result.exposureTime = `${sec}s`;
      }
      rawTags['Exposure Time'] = result.exposureTime;
      break;
    }
    case 0x829D: {
      // FNumber
      const fNum = Number(val);
      result.fNumber = `f/${fNum.toFixed(1)}`;
      rawTags['F-Number'] = result.fNumber;
      break;
    }
    case 0x8827: {
      // ISO
      result.iso = Number(val);
      rawTags['ISO Speed'] = Number(val);
      break;
    }
    case 0x8822: {
      // ExposureProgram
      const prog = EXPOSURE_PROGRAMS[Number(val)] || `Mode ${val}`;
      result.exposureProgram = prog;
      rawTags['Exposure Program'] = prog;
      break;
    }
    case 0x9003: {
      // DateTimeOriginal
      result.dateTimeOriginal = String(val);
      rawTags['Date Taken'] = String(val);
      break;
    }
    case 0x9004: {
      // DateTimeDigitized
      result.dateTimeDigitized = String(val);
      rawTags['Date Digitized'] = String(val);
      break;
    }
    case 0x9204: {
      // ExposureBiasValue
      const ev = Number(val);
      result.exposureBias = `${ev >= 0 ? '+' : ''}${ev.toFixed(2)} EV`;
      rawTags['Exposure Bias'] = result.exposureBias;
      break;
    }
    case 0x9207: {
      // MeteringMode
      const mMode = METERING_MODES[Number(val)] || `Code ${val}`;
      result.meteringMode = mMode;
      rawTags['Metering Mode'] = mMode;
      break;
    }
    case 0x9208: {
      // LightSource
      const ls = LIGHT_SOURCES[Number(val)] || `Code ${val}`;
      result.lightSource = ls;
      rawTags['Light Source'] = ls;
      break;
    }
    case 0x9209: {
      // Flash
      const fl = decodeFlashValue(Number(val));
      result.flash = fl;
      rawTags['Flash'] = fl;
      break;
    }
    case 0x920A: {
      // FocalLength
      const fl = Number(val);
      result.focalLength = `${fl.toFixed(1)} mm`;
      rawTags['Focal Length'] = result.focalLength;
      break;
    }
    case 0xA405: {
      // FocalLengthIn35mmFilm
      result.focalLength35mm = `${val} mm (35mm equiv)`;
      rawTags['Focal Length (35mm Equiv)'] = result.focalLength35mm;
      break;
    }
    case 0xA001: {
      // ColorSpace
      const cs = COLOR_SPACES[Number(val)] || `Code ${val}`;
      result.colorSpace = cs;
      rawTags['Color Space'] = cs;
      break;
    }
    case 0xA403: {
      // WhiteBalance
      const wb = WHITE_BALANCES[Number(val)] || `Code ${val}`;
      result.whiteBalance = wb;
      rawTags['White Balance'] = wb;
      break;
    }
    case 0xA404: {
      // DigitalZoomRatio
      const dz = Number(val);
      if (dz > 1) {
        result.digitalZoomRatio = `${dz.toFixed(1)}x`;
        rawTags['Digital Zoom'] = result.digitalZoomRatio;
      }
      break;
    }
    case 0xA431: {
      result.serialNumber = String(val);
      rawTags['Body Serial Number'] = String(val);
      break;
    }
    case 0xA433: {
      result.lensMake = String(val);
      rawTags['Lens Make'] = String(val);
      break;
    }
    case 0xA434: {
      result.lensModel = String(val);
      rawTags['Lens Model'] = String(val);
      break;
    }
    case 0xA435: {
      result.lensSerialNumber = String(val);
      rawTags['Lens Serial Number'] = String(val);
      break;
    }
    default:
      if (typeof val === 'string' || typeof val === 'number') {
        rawTags[`Tag 0x${tag.toString(16).toUpperCase()}`] = val;
      }
  }
}

function parseGpsIfd(
  dataView: DataView,
  tiffHeaderOffset: number,
  gpsOffset: number,
  little: boolean,
  result: Partial<ParsedImageMetadata>,
  rawTags: Record<string, string | number>
) {
  const numEntries = dataView.getUint16(gpsOffset, little);
  let latRef = 'N';
  let lonRef = 'E';
  let latCoords: number[] | null = null;
  let lonCoords: number[] | null = null;
  let altitudeNum: number | null = null;

  for (let i = 0; i < numEntries; i++) {
    const entryOffset = gpsOffset + 2 + i * 12;
    if (entryOffset + 12 > dataView.byteLength) break;

    const tag = dataView.getUint16(entryOffset, little);
    const type = dataView.getUint16(entryOffset + 2, little);
    const count = dataView.getUint32(entryOffset + 4, little);
    const valueOffset = dataView.getUint32(entryOffset + 8, little);

    const val = readTagValue(dataView, tiffHeaderOffset, entryOffset, type, count, valueOffset, little);

    if (tag === 0x0001) latRef = String(val || 'N');
    if (tag === 0x0002 && Array.isArray(val)) latCoords = val;
    if (tag === 0x0003) lonRef = String(val || 'E');
    if (tag === 0x0004 && Array.isArray(val)) lonCoords = val;
    if (tag === 0x0006 && typeof val === 'number') altitudeNum = val;
  }

  if (latCoords && lonCoords && latCoords.length >= 3 && lonCoords.length >= 3) {
    const latDec = latCoords[0] + latCoords[1] / 60 + latCoords[2] / 3600;
    const finalLat = latRef === 'S' ? -latDec : latDec;

    const lonDec = lonCoords[0] + lonCoords[1] / 60 + lonCoords[2] / 3600;
    const finalLon = lonRef === 'W' ? -lonDec : lonDec;

    result.hasGps = true;
    result.latitude = Number(finalLat.toFixed(6));
    result.longitude = Number(finalLon.toFixed(6));

    result.latitudeFormatted = `${latCoords[0]}° ${latCoords[1]}' ${latCoords[2].toFixed(1)}" ${latRef}`;
    result.longitudeFormatted = `${lonCoords[0]}° ${lonCoords[1]}' ${lonCoords[2].toFixed(1)}" ${lonRef}`;

    if (altitudeNum !== null) {
      result.altitude = `${altitudeNum.toFixed(1)} meters`;
      rawTags['GPS Altitude'] = result.altitude;
    }

    result.googleMapsUrl = `https://www.google.com/maps?q=${result.latitude},${result.longitude}`;
    result.openStreetMapUrl = `https://www.openstreetmap.org/?mlat=${result.latitude}&mlon=${result.longitude}#map=15/${result.latitude}/${result.longitude}`;

    rawTags['GPS Latitude'] = `${result.latitude} (${result.latitudeFormatted})`;
    rawTags['GPS Longitude'] = `${result.longitude} (${result.longitudeFormatted})`;
  }
}

export default function MetadataViewer() {
  const [images, setImages] = useState<ParsedImageMetadata[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'overview' | 'exposure' | 'camera' | 'gps' | 'raw'>('overview');
  const [searchTag, setSearchTag] = useState<string>('');
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const activeItem = images[selectedIndex] || null;

  // Process incoming file into ParsedImageMetadata
  const parseFile = async (file: File): Promise<ParsedImageMetadata> => {
    const url = URL.createObjectURL(file);
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

    // Read image dimensions
    const dimensions = await new Promise<{ width: number; height: number; aspect: string }>((resolve) => {
      const img = new Image();
      img.onload = () => {
        const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
        const div = gcd(img.naturalWidth, img.naturalHeight);
        const aspect = `${img.naturalWidth / div}:${img.naturalHeight / div}`;
        resolve({ width: img.naturalWidth, height: img.naturalHeight, aspect });
      };
      img.onerror = () => resolve({ width: 0, height: 0, aspect: 'N/A' });
      img.src = url;
    });

    // Detect format
    let formatCategory: ParsedImageMetadata['formatCategory'] = 'Other';
    if (file.type.includes('jpeg') || file.name.match(/\.jpe?g$/i)) formatCategory = 'JPEG';
    else if (file.type.includes('png') || file.name.match(/\.png$/i)) formatCategory = 'PNG';
    else if (file.type.includes('webp') || file.name.match(/\.webp$/i)) formatCategory = 'WebP';
    else if (file.type.includes('gif') || file.name.match(/\.gif$/i)) formatCategory = 'GIF';
    else if (file.type.includes('svg') || file.name.match(/\.svg$/i)) formatCategory = 'SVG';

    const megapixels = (dimensions.width > 0 && dimensions.height > 0)
      ? `${((dimensions.width * dimensions.height) / 1000000).toFixed(1)} MP`
      : 'N/A';

    // Parse binary EXIF buffer
    const arrayBuffer = await file.arrayBuffer();
    const exifParsed = parseExifBuffer(arrayBuffer);

    return {
      id,
      name: file.name,
      sizeFormatted: (file.size / 1024).toFixed(1) + ' KB',
      sizeBytes: file.size,
      mimeType: file.type || 'image/jpeg',
      src: url,
      width: dimensions.width,
      height: dimensions.height,
      aspectRatio: dimensions.aspect,
      megapixels,
      formatCategory,
      hasGps: !!exifParsed.hasGps,
      rawTags: exifParsed.rawTags || {},
      ...exifParsed,
    };
  };

  const handleIncomingFiles = useCallback(async (incomingFiles: FileList | File[]) => {
    setError(null);
    const validFiles = Array.from(incomingFiles).filter((f) => f.type.startsWith('image/'));

    if (validFiles.length === 0) {
      setError('Please select valid image files (JPG, PNG, WebP, SVG, AVIF, TIFF).');
      return;
    }

    try {
      const parsed = await Promise.all(validFiles.map(parseFile));
      setImages((prev) => {
        const updated = [...prev, ...parsed];
        if (prev.length === 0) setSelectedIndex(0);
        return updated;
      });
    } catch {
      setError('Could not parse metadata for one or more files.');
    }
  }, []);

  // Native Paste handler (Ctrl+V)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (!e.clipboardData) return;
      const items = e.clipboardData.items;
      const pastedFiles: File[] = [];

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) {
            const timestamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
            const renamed = new File([file], `screenshot-${timestamp}-${i + 1}.png`, {
              type: file.type || 'image/png',
            });
            pastedFiles.push(renamed);
          }
        }
      }

      if (pastedFiles.length > 0) {
        handleIncomingFiles(pastedFiles);
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [handleIncomingFiles]);

  // Load 3 Sample Photos with authentic EXIF data
  const handleLoadSampleImages = () => {
    setError(null);
    const samples: ParsedImageMetadata[] = [
      {
        id: 'sample-sony-banff',
        name: 'banff-national-park-sunset.jpg',
        sizeFormatted: '4.8 MB',
        sizeBytes: 5033164,
        mimeType: 'image/jpeg',
        src: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&auto=format&fit=crop&q=80',
        width: 9504,
        height: 6336,
        aspectRatio: '3:2',
        megapixels: '60.2 MP',
        formatCategory: 'JPEG',
        make: 'Sony',
        model: 'ILCE-7RM4 (Sony A7R IV)',
        lensMake: 'Sony',
        lensModel: 'FE 24-70mm F2.8 GM (SEL2470GM)',
        software: 'ILCE-7RM4 v1.20',
        serialNumber: '3819402',
        exposureTime: '1/160s',
        exposureTimeSec: 0.00625,
        fNumber: 'f/8.0',
        iso: 100,
        focalLength: '35.0 mm',
        focalLength35mm: '35 mm (35mm equiv)',
        exposureProgram: 'Aperture Priority',
        exposureBias: '0.00 EV',
        meteringMode: 'Multi-Segment (Pattern)',
        lightSource: 'Daylight',
        flash: 'Did not fire (Off)',
        whiteBalance: 'Daylight',
        colorSpace: 'Adobe RGB',
        dateTimeOriginal: '2026:09:18 19:42:15',
        dateTimeDigitized: '2026:09:18 19:42:15',
        dateTimeModified: '2026:09:19 10:14:02',
        artist: 'Landscape Master Works',
        copyright: '© 2026 Studio All Rights Reserved',
        hasGps: true,
        latitude: 51.1784,
        longitude: -115.5708,
        latitudeFormatted: "51° 10' 42.2\" N",
        longitudeFormatted: "115° 34' 14.9\" W",
        altitude: '1383 meters',
        googleMapsUrl: 'https://www.google.com/maps?q=51.1784,-115.5708',
        openStreetMapUrl: 'https://www.openstreetmap.org/?mlat=51.1784&mlon=-115.5708#map=15/51.1784/-115.5708',
        rawTags: {
          'Camera Make': 'Sony',
          'Camera Model': 'ILCE-7RM4',
          'Lens Model': 'FE 24-70mm F2.8 GM',
          'Exposure Time': '1/160s',
          'F-Number': 'f/8.0',
          'ISO Speed': 100,
          'Focal Length': '35.0 mm',
          'Exposure Program': 'Aperture Priority',
          'Metering Mode': 'Multi-Segment (Pattern)',
          'White Balance': 'Manual',
          'Color Space': 'Adobe RGB',
          'Date Taken': '2026:09:18 19:42:15',
          'GPS Latitude': "51.1784 (51° 10' 42.2\" N)",
          'GPS Longitude': "-115.5708 (115° 34' 14.9\" W)",
          'GPS Altitude': '1383 meters',
          'Software': 'Sony Image Edge Desktop',
        },
      },
      {
        id: 'sample-iphone-shibuya',
        name: 'shibuya-crossing-night.heic.jpg',
        sizeFormatted: '2.1 MB',
        sizeBytes: 2202009,
        mimeType: 'image/jpeg',
        src: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=1200&auto=format&fit=crop&q=80',
        width: 4032,
        height: 3024,
        aspectRatio: '4:3',
        megapixels: '12.2 MP',
        formatCategory: 'JPEG',
        make: 'Apple',
        model: 'iPhone 15 Pro',
        lensMake: 'Apple',
        lensModel: 'iPhone 15 Pro back triple camera 6.86mm f/1.78',
        software: 'iOS 18.1',
        exposureTime: '1/40s',
        exposureTimeSec: 0.025,
        fNumber: 'f/1.78',
        iso: 400,
        focalLength: '6.9 mm',
        focalLength35mm: '24 mm (35mm equiv)',
        exposureProgram: 'Program AE (Auto)',
        exposureBias: '-0.33 EV',
        meteringMode: 'Multi-Segment (Pattern)',
        lightSource: 'Unknown',
        flash: 'Did not fire (Off)',
        whiteBalance: 'Auto White Balance',
        colorSpace: 'Display P3',
        dateTimeOriginal: '2026:10:04 22:15:48',
        dateTimeDigitized: '2026:10:04 22:15:48',
        hasGps: true,
        latitude: 35.6595,
        longitude: 139.7004,
        latitudeFormatted: "35° 39' 34.2\" N",
        longitudeFormatted: "139° 42' 1.4\" E",
        altitude: '18 meters',
        googleMapsUrl: 'https://www.google.com/maps?q=35.6595,139.7004',
        openStreetMapUrl: 'https://www.openstreetmap.org/?mlat=35.6595&mlon=139.7004#map=15/35.6595/139.7004',
        rawTags: {
          'Camera Make': 'Apple',
          'Camera Model': 'iPhone 15 Pro',
          'Lens Model': 'iPhone 15 Pro back camera 6.86mm f/1.78',
          'Exposure Time': '1/40s',
          'F-Number': 'f/1.78',
          'ISO Speed': 400,
          'Focal Length': '6.9 mm',
          'Color Space': 'Display P3',
          'Date Taken': '2026:10:04 22:15:48',
          'GPS Latitude': "35.6595 (35° 39' 34.2\" N)",
          'GPS Longitude': "139.7004 (139° 42' 1.4\" E)",
          'GPS Altitude': '18 meters',
          'Host Computer': 'iPhone 15 Pro',
        },
      },
      {
        id: 'sample-canon-studio',
        name: 'commercial-fashion-studio.jpg',
        sizeFormatted: '8.4 MB',
        sizeBytes: 8808038,
        mimeType: 'image/jpeg',
        src: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1200&auto=format&fit=crop&q=80',
        width: 8192,
        height: 5464,
        aspectRatio: '3:2',
        megapixels: '44.8 MP',
        formatCategory: 'JPEG',
        make: 'Canon',
        model: 'Canon EOS R5',
        lensMake: 'Canon',
        lensModel: 'RF 85mm F1.2 L USM',
        software: 'Firmware Version 1.9.0',
        serialNumber: '082021004112',
        exposureTime: '1/1600s',
        exposureTimeSec: 0.000625,
        fNumber: 'f/1.4',
        iso: 50,
        focalLength: '85.0 mm',
        focalLength35mm: '85 mm (35mm equiv)',
        exposureProgram: 'Manual',
        exposureBias: '0.00 EV',
        meteringMode: 'Spot',
        lightSource: 'Flash',
        flash: 'Flash fired',
        whiteBalance: 'Manual White Balance',
        colorSpace: 'sRGB',
        dateTimeOriginal: '2026:08:12 14:02:33',
        artist: 'Editorial Studio Vogue',
        copyright: '© 2026 Commercial Rights Reserved',
        hasGps: false,
        rawTags: {
          'Camera Make': 'Canon',
          'Camera Model': 'Canon EOS R5',
          'Lens Model': 'RF 85mm F1.2 L USM',
          'Exposure Time': '1/1600s',
          'F-Number': 'f/1.4',
          'ISO Speed': 50,
          'Focal Length': '85.0 mm',
          'Exposure Program': 'Manual',
          'Flash': 'Flash fired',
          'Metering Mode': 'Spot',
          'Color Space': 'sRGB',
          'Date Taken': '2026:08:12 14:02:33',
        },
      },
    ];

    setImages(samples);
    setSelectedIndex(0);
  };

  // Remove single image
  const handleRemoveImage = (idxToRemove: number) => {
    setImages((prev) => {
      const filtered = prev.filter((_, idx) => idx !== idxToRemove);
      if (selectedIndex >= filtered.length) {
        setSelectedIndex(Math.max(0, filtered.length - 1));
      }
      return filtered;
    });
  };

  // Clear all
  const handleClearAll = () => {
    setImages([]);
    setSelectedIndex(0);
    setError(null);
  };

  // Copy structured metadata summary to clipboard
  const handleCopySummary = () => {
    if (!activeItem) return;
    const lines = [
      `=== Image Metadata Report: ${activeItem.name} ===`,
      `Dimensions: ${activeItem.width} × ${activeItem.height} px (${activeItem.aspectRatio}, ${activeItem.megapixels})`,
      `File Size: ${activeItem.sizeFormatted} (${activeItem.sizeBytes} bytes)`,
      `MIME Type: ${activeItem.mimeType}`,
      activeItem.make ? `Camera: ${activeItem.make} ${activeItem.model || ''}` : '',
      activeItem.lensModel ? `Lens: ${activeItem.lensModel}` : '',
      activeItem.exposureTime ? `Shutter: ${activeItem.exposureTime}` : '',
      activeItem.fNumber ? `Aperture: ${activeItem.fNumber}` : '',
      activeItem.iso ? `ISO: ${activeItem.iso}` : '',
      activeItem.focalLength ? `Focal Length: ${activeItem.focalLength} (${activeItem.focalLength35mm || ''})` : '',
      activeItem.dateTimeOriginal ? `Date Taken: ${activeItem.dateTimeOriginal}` : '',
      activeItem.hasGps ? `GPS: ${activeItem.latitude}, ${activeItem.longitude} (Alt: ${activeItem.altitude || 'N/A'})` : '',
      activeItem.hasGps ? `Google Maps: ${activeItem.googleMapsUrl}` : '',
      `\n--- Full Tag Dump ---`,
      ...Object.entries(activeItem.rawTags).map(([k, v]) => `${k}: ${v}`),
    ].filter(Boolean).join('\n');

    navigator.clipboard.writeText(lines);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  // Download metadata as JSON file
  const handleDownloadJson = () => {
    if (!activeItem) return;
    const exportObj = {
      file: {
        name: activeItem.name,
        size: activeItem.sizeFormatted,
        sizeBytes: activeItem.sizeBytes,
        mimeType: activeItem.mimeType,
        width: activeItem.width,
        height: activeItem.height,
        aspectRatio: activeItem.aspectRatio,
        megapixels: activeItem.megapixels,
      },
      camera: {
        make: activeItem.make,
        model: activeItem.model,
        software: activeItem.software,
        serialNumber: activeItem.serialNumber,
        lensMake: activeItem.lensMake,
        lensModel: activeItem.lensModel,
      },
      exposure: {
        exposureTime: activeItem.exposureTime,
        fNumber: activeItem.fNumber,
        iso: activeItem.iso,
        focalLength: activeItem.focalLength,
        focalLength35mm: activeItem.focalLength35mm,
        exposureProgram: activeItem.exposureProgram,
        meteringMode: activeItem.meteringMode,
        whiteBalance: activeItem.whiteBalance,
        flash: activeItem.flash,
        colorSpace: activeItem.colorSpace,
      },
      gps: activeItem.hasGps
        ? {
            latitude: activeItem.latitude,
            longitude: activeItem.longitude,
            latitudeFormatted: activeItem.latitudeFormatted,
            longitudeFormatted: activeItem.longitudeFormatted,
            altitude: activeItem.altitude,
            googleMapsUrl: activeItem.googleMapsUrl,
          }
        : null,
      rawTags: activeItem.rawTags,
    };

    const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `metadata_${activeItem.name.replace(/\.[^/.]+$/, '')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Download metadata as CSV
  const handleDownloadCsv = () => {
    if (!activeItem) return;
    const rows = [
      ['Metadata Field', 'Value'],
      ['File Name', activeItem.name],
      ['Resolution', `${activeItem.width}x${activeItem.height}`],
      ['Aspect Ratio', activeItem.aspectRatio],
      ['Megapixels', activeItem.megapixels],
      ['File Size', activeItem.sizeFormatted],
      ['MIME Type', activeItem.mimeType],
      ['Camera Make', activeItem.make || ''],
      ['Camera Model', activeItem.model || ''],
      ['Lens Model', activeItem.lensModel || ''],
      ['Exposure Time', activeItem.exposureTime || ''],
      ['F-Number', activeItem.fNumber || ''],
      ['ISO', activeItem.iso ? String(activeItem.iso) : ''],
      ['Focal Length', activeItem.focalLength || ''],
      ['Exposure Program', activeItem.exposureProgram || ''],
      ['Date Taken', activeItem.dateTimeOriginal || ''],
      ['GPS Latitude', activeItem.hasGps ? String(activeItem.latitude) : ''],
      ['GPS Longitude', activeItem.hasGps ? String(activeItem.longitude) : ''],
      ['GPS Altitude', activeItem.altitude || ''],
      ...Object.entries(activeItem.rawTags).map(([k, v]) => [k, String(v)]),
    ];

    const csvContent = rows
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `metadata_${activeItem.name.replace(/\.[^/.]+$/, '')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const filteredRawTags = activeItem
    ? Object.entries(activeItem.rawTags).filter(([key, val]) => {
        if (!searchTag.trim()) return true;
        const q = searchTag.toLowerCase();
        return key.toLowerCase().includes(q) || String(val).toLowerCase().includes(q);
      })
    : [];

  return (
    <div className="max-w-7xl mx-auto space-y-6 text-left">
      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-xl text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => setError(null)}
            className="p-1 hover:bg-red-500/20 rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* State A: Zero Images Loaded - Drag & Drop Intake */}
      {images.length === 0 ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragOver(false);
            if (e.dataTransfer.files) {
              handleIncomingFiles(e.dataTransfer.files);
            }
          }}
          className={`relative border-2 border-dashed rounded-3xl p-10 md:p-14 text-center transition-all duration-300 ${
            isDragOver
              ? 'border-indigo-500 bg-indigo-500/5 dark:bg-indigo-950/20 scale-[0.99]'
              : 'border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 hover:border-zinc-400 dark:hover:border-zinc-700'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files) handleIncomingFiles(e.target.files);
            }}
          />
          <input
            ref={folderInputRef}
            type="file"
            // @ts-expect-error webkitdirectory attribute is standard in Chromium/Firefox
            webkitdirectory=""
            directory=""
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files) handleIncomingFiles(e.target.files);
            }}
          />

          <div className="max-w-xl mx-auto flex flex-col items-center">
            <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 mb-5 shadow-inner">
              <Camera className="w-10 h-10" />
            </div>

            <h2 className="text-xl md:text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              Drop Photos to Inspect EXIF & Metadata
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2 mb-6">
              Read camera makes, lens models, shutter speed, aperture, ISO, and embedded GPS geolocation headers locally in your browser.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="saas-button-primary px-5 py-2.5 flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                <span>Select Images</span>
              </button>

              <button
                type="button"
                onClick={() => folderInputRef.current?.click()}
                className="px-4 py-2.5 rounded-xl border border-zinc-250 dark:border-zinc-750 bg-zinc-100 dark:bg-zinc-800/80 text-zinc-800 dark:text-zinc-200 font-semibold text-sm hover:bg-zinc-200 dark:hover:bg-zinc-700 transition flex items-center gap-2"
              >
                <FolderUp className="w-4 h-4" />
                <span>Upload Folder</span>
              </button>

              <button
                type="button"
                onClick={handleLoadSampleImages}
                className="px-4 py-2.5 rounded-xl border border-indigo-200 dark:border-indigo-900/40 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 font-semibold text-sm hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-indigo-500" />
                <span>Load 3 Pro Samples</span>
              </button>
            </div>

            <div className="mt-6 flex items-center gap-4 text-xs text-zinc-400 dark:text-zinc-500">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                Paste (Ctrl+V)
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                GPS Geolocation Decoder
              </span>
              <span>•</span>
              <span>100% Client-Side Privacy</span>
            </div>
          </div>
        </div>
      ) : (
        /* State B: Active Multi-Image Metadata Workspace */
        <div className="space-y-6">
          {/* Top Quick Actions Bar */}
          <div className="saas-card p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                <Table className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <span>Photo Queue ({images.length} {images.length === 1 ? 'file' : 'files'})</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-medium">
                    Active: #{selectedIndex + 1}
                  </span>
                </div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400">
                  {activeItem ? `${activeItem.name} (${activeItem.width}×${activeItem.height}px, ${activeItem.sizeFormatted})` : ''}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 rounded-lg border border-zinc-250 dark:border-zinc-750 bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-semibold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Add More</span>
              </button>

              <button
                type="button"
                onClick={handleCopySummary}
                className="px-3 py-1.5 rounded-lg border border-zinc-250 dark:border-zinc-750 bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-semibold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition flex items-center gap-1.5"
              >
                {copySuccess ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copySuccess ? 'Copied!' : 'Copy Summary'}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadJson}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 dark:bg-zinc-700 hover:bg-zinc-900 text-white text-xs font-semibold transition flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>JSON</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadCsv}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 dark:bg-zinc-700 hover:bg-zinc-900 text-white text-xs font-semibold transition flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>CSV</span>
              </button>

              <button
                type="button"
                onClick={handleClearAll}
                className="p-1.5 rounded-lg border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition"
                title="Clear all images"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Hidden File Picker */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files) handleIncomingFiles(e.target.files);
            }}
          />

          {/* Privacy Alert Banner if GPS coordinates are embedded */}
          {activeItem?.hasGps && (
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-start gap-3 text-xs text-amber-800 dark:text-amber-200">
              <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold text-sm text-amber-900 dark:text-amber-100">
                  Geolocation Privacy Notice: Embedded GPS Coordinates Detected
                </span>
                <p className="text-amber-700 dark:text-amber-300">
                  This photo contains exact GPS coordinates ({activeItem.latitudeFormatted}, {activeItem.longitudeFormatted}). Sharing this image publicly online will expose where and when the photo was captured.
                </p>
                <div className="pt-1 flex items-center gap-3">
                  <a
                    href={activeItem.googleMapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold underline flex items-center gap-1 text-amber-900 dark:text-amber-100 hover:text-amber-600"
                  >
                    <span>View on Google Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <span>•</span>
                  <a
                    href={activeItem.openStreetMapUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold underline flex items-center gap-1 text-amber-900 dark:text-amber-100 hover:text-amber-600"
                  >
                    <span>View on OpenStreetMap</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Main Inspection Grid: Left (Preview Card & Queue) + Right (Tabbed Metadata Viewer) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column (lg:col-span-4): Photo Preview + Quick Badges */}
            <div className="lg:col-span-4 space-y-4">
              <div className="saas-card p-4 space-y-4">
                <div className="relative w-full rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-950/5 dark:bg-zinc-950 flex items-center justify-center min-h-[220px] max-h-[340px]">
                  {activeItem && (
                    <img
                      src={activeItem.src}
                      alt={activeItem.name}
                      className="max-w-full max-h-[320px] object-contain rounded-lg"
                    />
                  )}
                  <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-sm text-white text-[10px] font-mono">
                    {activeItem?.formatCategory}
                  </span>
                </div>

                {/* Quick Key Metrics Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800">
                    <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider block">Dimensions</span>
                    <span className="font-bold text-zinc-800 dark:text-zinc-200 font-mono">
                      {activeItem?.width} × {activeItem?.height}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800">
                    <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider block">Megapixels</span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                      {activeItem?.megapixels}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800">
                    <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider block">Aspect Ratio</span>
                    <span className="font-bold text-zinc-800 dark:text-zinc-200 font-mono">
                      {activeItem?.aspectRatio}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800">
                    <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider block">File Size</span>
                    <span className="font-bold text-zinc-800 dark:text-zinc-200 font-mono">
                      {activeItem?.sizeFormatted}
                    </span>
                  </div>
                </div>
              </div>

              {/* Multi-Photo Filmstrip Queue */}
              <div className="saas-card p-4 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-indigo-500" />
                    <span>Photo Queue ({images.length})</span>
                  </span>
                  <span className="text-zinc-400 text-[11px]">Click to switch</span>
                </div>

                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
                  {images.map((img, idx) => {
                    const isSelected = idx === selectedIndex;
                    return (
                      <div
                        key={img.id}
                        onClick={() => setSelectedIndex(idx)}
                        className={`group p-2 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 ring-1 ring-indigo-500'
                            : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={img.src}
                            alt={img.name}
                            className="w-9 h-9 rounded-lg object-cover border border-zinc-200 dark:border-zinc-800 shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate">
                              {img.name}
                            </p>
                            <p className="text-[10px] text-zinc-400 truncate">
                              {img.width}×{img.height} • {img.sizeFormatted}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          {img.hasGps && (
                            <span title="Has GPS Geolocation">
                              <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveImage(idx);
                            }}
                            className="p-1 text-zinc-400 hover:text-red-500 rounded opacity-0 group-hover:opacity-100 transition"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Column (lg:col-span-8): Categorized Metadata Tabs */}
            <div className="lg:col-span-8 saas-card p-5 space-y-5">
              {/* Tabs Navigation */}
              <div className="flex flex-wrap border-b border-zinc-200 dark:border-zinc-800 pb-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setActiveTab('overview')}
                  className={`py-2 px-3 rounded-xl font-bold transition flex items-center gap-1.5 ${
                    activeTab === 'overview'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <Info className="w-3.5 h-3.5" />
                  <span>Overview</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('exposure')}
                  className={`py-2 px-3 rounded-xl font-bold transition flex items-center gap-1.5 ${
                    activeTab === 'exposure'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Exposure & Shooting</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('camera')}
                  className={`py-2 px-3 rounded-xl font-bold transition flex items-center gap-1.5 ${
                    activeTab === 'camera'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Camera & Hardware</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('gps')}
                  className={`py-2 px-3 rounded-xl font-bold transition flex items-center gap-1.5 ${
                    activeTab === 'gps'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>GPS Geolocation</span>
                  {activeItem?.hasGps && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('raw')}
                  className={`py-2 px-3 rounded-xl font-bold transition flex items-center gap-1.5 ${
                    activeTab === 'raw'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <Table className="w-3.5 h-3.5" />
                  <span>Raw Tags ({Object.keys(activeItem?.rawTags || {}).length})</span>
                </button>
              </div>

              {/* Tab 1: Overview & Exposure Triangle */}
              {activeTab === 'overview' && (
                <div className="space-y-5 text-xs">
                  {/* Big Exposure Triangle Banner */}
                  {(activeItem?.exposureTime || activeItem?.fNumber || activeItem?.iso) && (
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-500/20">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block mb-3">
                        Exposure Triangle
                      </span>
                      <div className="grid grid-cols-4 gap-3 text-center">
                        <div className="p-3 bg-white/80 dark:bg-zinc-900/80 rounded-xl shadow-xs">
                          <span className="text-[10px] text-zinc-400 block mb-1">Aperture</span>
                          <span className="text-base font-extrabold text-zinc-900 dark:text-zinc-100 font-mono">
                            {activeItem.fNumber || 'N/A'}
                          </span>
                        </div>
                        <div className="p-3 bg-white/80 dark:bg-zinc-900/80 rounded-xl shadow-xs">
                          <span className="text-[10px] text-zinc-400 block mb-1">Shutter</span>
                          <span className="text-base font-extrabold text-zinc-900 dark:text-zinc-100 font-mono">
                            {activeItem.exposureTime || 'N/A'}
                          </span>
                        </div>
                        <div className="p-3 bg-white/80 dark:bg-zinc-900/80 rounded-xl shadow-xs">
                          <span className="text-[10px] text-zinc-400 block mb-1">ISO</span>
                          <span className="text-base font-extrabold text-zinc-900 dark:text-zinc-100 font-mono">
                            {activeItem.iso || 'N/A'}
                          </span>
                        </div>
                        <div className="p-3 bg-white/80 dark:bg-zinc-900/80 rounded-xl shadow-xs">
                          <span className="text-[10px] text-zinc-400 block mb-1">Focal Length</span>
                          <span className="text-base font-extrabold text-zinc-900 dark:text-zinc-100 font-mono">
                            {activeItem.focalLength || 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Summary Properties Table */}
                  <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden divide-y divide-zinc-150 dark:divide-zinc-800">
                    <div className="flex justify-between p-3">
                      <span className="text-zinc-500 font-medium">Camera Equipment</span>
                      <span className="font-bold text-zinc-900 dark:text-zinc-100">
                        {activeItem?.make ? `${activeItem.make} ${activeItem.model || ''}` : 'No EXIF Camera Tag Found'}
                      </span>
                    </div>
                    {activeItem?.lensModel && (
                      <div className="flex justify-between p-3">
                        <span className="text-zinc-500 font-medium">Lens Attached</span>
                        <span className="font-bold text-zinc-900 dark:text-zinc-100">{activeItem.lensModel}</span>
                      </div>
                    )}
                    {activeItem?.dateTimeOriginal && (
                      <div className="flex justify-between p-3">
                        <span className="text-zinc-500 font-medium">Date & Time Taken</span>
                        <span className="font-bold text-zinc-900 dark:text-zinc-100 font-mono">{activeItem.dateTimeOriginal}</span>
                      </div>
                    )}
                    <div className="flex justify-between p-3">
                      <span className="text-zinc-500 font-medium">Resolution & Megapixels</span>
                      <span className="font-bold text-zinc-900 dark:text-zinc-100 font-mono">
                        {activeItem?.width} × {activeItem?.height} px ({activeItem?.megapixels})
                      </span>
                    </div>
                    <div className="flex justify-between p-3">
                      <span className="text-zinc-500 font-medium">MIME Type & Container</span>
                      <span className="font-bold text-zinc-900 dark:text-zinc-100 font-mono">{activeItem?.mimeType}</span>
                    </div>
                    <div className="flex justify-between p-3">
                      <span className="text-zinc-500 font-medium">Color Space</span>
                      <span className="font-bold text-zinc-900 dark:text-zinc-100">{activeItem?.colorSpace || 'sRGB (Default)'}</span>
                    </div>
                    {activeItem?.artist && (
                      <div className="flex justify-between p-3">
                        <span className="text-zinc-500 font-medium">Artist / Photographer</span>
                        <span className="font-bold text-zinc-900 dark:text-zinc-100">{activeItem.artist}</span>
                      </div>
                    )}
                    {activeItem?.copyright && (
                      <div className="flex justify-between p-3">
                        <span className="text-zinc-500 font-medium">Copyright Notice</span>
                        <span className="font-bold text-zinc-900 dark:text-zinc-100">{activeItem.copyright}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 2: Exposure & Shooting Details */}
              {activeTab === 'exposure' && (
                <div className="space-y-4 text-xs">
                  <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden divide-y divide-zinc-150 dark:divide-zinc-800">
                    <div className="flex justify-between p-3">
                      <span className="text-zinc-500 font-medium">Shutter Speed / Exposure Time</span>
                      <span className="font-bold text-zinc-900 dark:text-zinc-100 font-mono">
                        {activeItem?.exposureTime || 'N/A'} {activeItem?.exposureTimeSec ? `(${activeItem.exposureTimeSec}s)` : ''}
                      </span>
                    </div>
                    <div className="flex justify-between p-3">
                      <span className="text-zinc-500 font-medium">Aperture (F-Stop)</span>
                      <span className="font-bold text-zinc-900 dark:text-zinc-100 font-mono">{activeItem?.fNumber || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between p-3">
                      <span className="text-zinc-500 font-medium">ISO Speed Rating</span>
                      <span className="font-bold text-zinc-900 dark:text-zinc-100 font-mono">{activeItem?.iso || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between p-3">
                      <span className="text-zinc-500 font-medium">Focal Length</span>
                      <span className="font-bold text-zinc-900 dark:text-zinc-100 font-mono">{activeItem?.focalLength || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between p-3">
                      <span className="text-zinc-500 font-medium">Focal Length (35mm Equivalent)</span>
                      <span className="font-bold text-zinc-900 dark:text-zinc-100 font-mono">{activeItem?.focalLength35mm || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between p-3">
                      <span className="text-zinc-500 font-medium">Exposure Program</span>
                      <span className="font-bold text-zinc-900 dark:text-zinc-100">{activeItem?.exposureProgram || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between p-3">
                      <span className="text-zinc-500 font-medium">Exposure Compensation (Bias)</span>
                      <span className="font-bold text-zinc-900 dark:text-zinc-100 font-mono">{activeItem?.exposureBias || '0.00 EV'}</span>
                    </div>
                    <div className="flex justify-between p-3">
                      <span className="text-zinc-500 font-medium">Metering Mode</span>
                      <span className="font-bold text-zinc-900 dark:text-zinc-100">{activeItem?.meteringMode || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between p-3">
                      <span className="text-zinc-500 font-medium">White Balance</span>
                      <span className="font-bold text-zinc-900 dark:text-zinc-100">{activeItem?.whiteBalance || 'Auto'}</span>
                    </div>
                    <div className="flex justify-between p-3">
                      <span className="text-zinc-500 font-medium">Flash Status</span>
                      <span className="font-bold text-zinc-900 dark:text-zinc-100">{activeItem?.flash || 'Off'}</span>
                    </div>
                    <div className="flex justify-between p-3">
                      <span className="text-zinc-500 font-medium">Digital Zoom Ratio</span>
                      <span className="font-bold text-zinc-900 dark:text-zinc-100">{activeItem?.digitalZoomRatio || 'None (1.0x)'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Camera & Hardware Details */}
              {activeTab === 'camera' && (
                <div className="space-y-4 text-xs">
                  <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden divide-y divide-zinc-150 dark:divide-zinc-800">
                    <div className="flex justify-between p-3">
                      <span className="text-zinc-500 font-medium">Camera Manufacturer</span>
                      <span className="font-bold text-zinc-900 dark:text-zinc-100">{activeItem?.make || 'Unknown'}</span>
                    </div>
                    <div className="flex justify-between p-3">
                      <span className="text-zinc-500 font-medium">Camera Model</span>
                      <span className="font-bold text-zinc-900 dark:text-zinc-100">{activeItem?.model || 'Unknown'}</span>
                    </div>
                    <div className="flex justify-between p-3">
                      <span className="text-zinc-500 font-medium">Camera Body Serial</span>
                      <span className="font-bold text-zinc-900 dark:text-zinc-100 font-mono">{activeItem?.serialNumber || 'Not Stamped'}</span>
                    </div>
                    <div className="flex justify-between p-3">
                      <span className="text-zinc-500 font-medium">Lens Model</span>
                      <span className="font-bold text-zinc-900 dark:text-zinc-100">{activeItem?.lensModel || 'Built-in / Unknown'}</span>
                    </div>
                    <div className="flex justify-between p-3">
                      <span className="text-zinc-500 font-medium">Lens Manufacturer</span>
                      <span className="font-bold text-zinc-900 dark:text-zinc-100">{activeItem?.lensMake || 'Unknown'}</span>
                    </div>
                    <div className="flex justify-between p-3">
                      <span className="text-zinc-500 font-medium">Firmware / Software Version</span>
                      <span className="font-bold text-zinc-900 dark:text-zinc-100 font-mono">{activeItem?.software || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 4: GPS Geolocation & Map Link */}
              {activeTab === 'gps' && (
                <div className="space-y-4 text-xs">
                  {activeItem?.hasGps ? (
                    <div className="space-y-4">
                      <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                            <span className="font-bold text-sm text-emerald-950 dark:text-emerald-200">
                              Precise Geolocation Data Available
                            </span>
                          </div>
                          <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-full">
                            GPS Locked
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
                            <span className="text-[10px] text-zinc-400 block font-semibold mb-1">Latitude</span>
                            <div className="font-bold text-zinc-900 dark:text-zinc-100 font-mono">
                              {activeItem.latitude}°
                            </div>
                            <div className="text-[11px] text-zinc-500 font-mono mt-0.5">
                              {activeItem.latitudeFormatted}
                            </div>
                          </div>

                          <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
                            <span className="text-[10px] text-zinc-400 block font-semibold mb-1">Longitude</span>
                            <div className="font-bold text-zinc-900 dark:text-zinc-100 font-mono">
                              {activeItem.longitude}°
                            </div>
                            <div className="text-[11px] text-zinc-500 font-mono mt-0.5">
                              {activeItem.longitudeFormatted}
                            </div>
                          </div>
                        </div>

                        {activeItem.altitude && (
                          <div className="flex justify-between items-center px-1">
                            <span className="text-zinc-600 dark:text-zinc-400">Altitude above sea level:</span>
                            <span className="font-bold text-zinc-800 dark:text-zinc-200 font-mono">{activeItem.altitude}</span>
                          </div>
                        )}

                        <div className="pt-2 flex flex-wrap gap-2">
                          <a
                            href={activeItem.googleMapsUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition flex items-center gap-1.5"
                          >
                            <span>Open in Google Maps</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>

                          <a
                            href={activeItem.openStreetMapUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="px-4 py-2 rounded-xl border border-zinc-250 dark:border-zinc-750 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-semibold text-xs hover:bg-zinc-100 dark:hover:bg-zinc-700 transition flex items-center gap-1.5"
                          >
                            <span>Open in OpenStreetMap</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl space-y-2">
                      <MapPin className="w-8 h-8 text-zinc-300 dark:text-zinc-700 mx-auto" />
                      <p className="font-bold text-zinc-800 dark:text-zinc-200">No GPS Coordinates in this Image</p>
                      <p className="text-[11px] text-zinc-400 max-w-sm mx-auto">
                        This image either had GPS location tracking disabled when shot, or the coordinates were stripped during web compression.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 5: Raw EXIF Tags Dump with Search Filter */}
              {activeTab === 'raw' && (
                <div className="space-y-4 text-xs">
                  <div className="flex items-center justify-between gap-4">
                    <input
                      type="text"
                      placeholder="Filter raw tags (e.g. ISO, Model, Date)..."
                      value={searchTag}
                      onChange={(e) => setSearchTag(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-xs focus:ring-1 focus:ring-indigo-500"
                    />
                    <span className="text-[11px] text-zinc-400 shrink-0 font-mono">
                      {filteredRawTags.length} tags
                    </span>
                  </div>

                  <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden divide-y divide-zinc-150 dark:divide-zinc-800 max-h-[420px] overflow-y-auto scrollbar-thin">
                    {filteredRawTags.length > 0 ? (
                      filteredRawTags.map(([tag, val]) => (
                        <div key={tag} className="flex justify-between p-2.5 text-xs">
                          <span className="text-zinc-500 font-medium truncate max-w-[240px]">{tag}</span>
                          <span className="font-bold text-zinc-900 dark:text-zinc-100 font-mono truncate max-w-[320px] text-right">
                            {String(val)}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="p-6 text-center text-zinc-400">
                        No tags match your search query.
                      </div>
                    )}
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
