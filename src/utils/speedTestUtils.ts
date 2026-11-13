// Pure utility calculations for Internet Speed Test

export interface SuitabilityResult {
  status: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  desc: string;
}

export interface QualityAssessment {
  gaming: SuitabilityResult;
  streaming: SuitabilityResult;
  rtc: SuitabilityResult;
  upload: SuitabilityResult;
}

/**
 * Maps speed in Mbps non-linearly to speedometer needle angle (-120deg to +120deg).
 * Uses logarithmic scaling so 0-100 Mbps has wide resolution while 100-1000 Mbps scales smoothly.
 */
export function speedToAngle(speed: number, maxSpeed = 1000): number {
  if (!speed || speed <= 0) return -120;
  const clamped = Math.min(Math.max(speed, 0), maxSpeed);
  const fraction = Math.log10(1 + clamped / 2) / Math.log10(1 + maxSpeed / 2);
  return Number((-120 + fraction * 240).toFixed(1));
}

/**
 * Converts bits per second (bps) to Megabits per second (Mbps) rounded to 1 decimal place.
 */
export function bpsToMbps(bps?: number): number {
  if (typeof bps !== 'number' || isNaN(bps) || bps < 0) return 0;
  return Number((bps / 1_000_000).toFixed(1));
}

/**
 * Formats milliseconds to 1 decimal place.
 */
export function formatMs(ms?: number | null): number {
  if (typeof ms !== 'number' || isNaN(ms) || ms < 0) return 0;
  return Number(ms.toFixed(1));
}

/**
 * Masks IPv4 or IPv6 address for privacy preservation.
 */
export function maskIp(ip: string | null): string {
  if (!ip) return 'Unavailable';
  if (ip.includes('.')) {
    const parts = ip.split('.');
    if (parts.length === 4) return `${parts[0]}.${parts[1]}.***.***`;
  }
  if (ip.includes(':')) {
    const parts = ip.split(':');
    if (parts.length > 2) return `${parts[0]}:${parts[1]}:****:****`;
  }
  return ip.substring(0, 4) + '****';
}

/**
 * Evaluates real-world application suitability for gaming, 4K streaming, video calls, and cloud backups.
 */
export function evaluateConnectionQuality(
  downloadSpeed: number,
  uploadSpeed: number,
  ping: number,
  jitter: number
): QualityAssessment {
  // 1. Online Gaming (FPS / Esports)
  let gamingStatus: 'Excellent' | 'Good' | 'Fair' | 'Poor' = 'Fair';
  let gamingDesc = 'Suitable for casual multiplayer gaming.';
  if (ping > 0 && ping <= 25 && jitter <= 4) {
    gamingStatus = 'Excellent';
    gamingDesc = 'Ultra-low latency. Flawless for fast-twitch competitive esports (Valorant, CS2).';
  } else if (ping > 0 && ping <= 50 && jitter <= 10) {
    gamingStatus = 'Good';
    gamingDesc = 'Low latency with stable ping. Smooth multiplayer gameplay.';
  } else if (ping > 100 || jitter > 20) {
    gamingStatus = 'Poor';
    gamingDesc = 'High latency or fluctuating jitter. Noticeable input delay and rubber-banding likely.';
  }

  // 2. 4K & 8K Video Streaming
  let streamStatus: 'Excellent' | 'Good' | 'Fair' | 'Poor' = 'Fair';
  let streamDesc = 'Supports standard HD (1080p) video streaming.';
  if (downloadSpeed >= 50) {
    streamStatus = 'Excellent';
    streamDesc = 'Supports multiple simultaneous 4K/8K HDR streams with instant playback.';
  } else if (downloadSpeed >= 25) {
    streamStatus = 'Good';
    streamDesc = 'Easily handles 4K Ultra HD on Netflix, YouTube, or Prime Video without buffering.';
  } else if (downloadSpeed < 10 && downloadSpeed > 0) {
    streamStatus = 'Poor';
    streamDesc = 'May buffer frequently on 1080p and 4K streams. Best for 720p or lower.';
  }

  // 3. Video Calling & Remote Work
  let rtcStatus: 'Excellent' | 'Good' | 'Fair' | 'Poor' = 'Fair';
  let rtcDesc = 'Standard 720p video calls with occasional screen-sharing delays.';
  if (downloadSpeed >= 15 && uploadSpeed >= 5 && ping <= 50 && jitter <= 10) {
    rtcStatus = 'Excellent';
    rtcDesc = 'Studio-quality 1080p video calls and instant screen sharing on Zoom, Teams & Meet.';
  } else if (downloadSpeed >= 5 && uploadSpeed >= 2 && ping <= 100) {
    rtcStatus = 'Good';
    rtcDesc = 'Reliable HD video calls and smooth audio for everyday remote meetings.';
  } else if (downloadSpeed < 3 || uploadSpeed < 1) {
    rtcStatus = 'Poor';
    rtcDesc = 'Insufficient bandwidth. Video freeze, audio distortion, or dropped calls probable.';
  }

  // 4. Large File Uploads & Cloud Sync
  let uploadStatus: 'Excellent' | 'Good' | 'Fair' | 'Poor' = 'Fair';
  let uploadDesc = 'Moderate upload speed. Bulk file transfers will take noticeable time.';
  if (uploadSpeed >= 40) {
    uploadStatus = 'Excellent';
    uploadDesc = 'Lightning-fast cloud backups (Google Drive, Dropbox, YouTube 4K uploads).';
  } else if (uploadSpeed >= 15) {
    uploadStatus = 'Good';
    uploadDesc = 'Comfortable speed for code pushes, design files, and cloud document sync.';
  } else if (uploadSpeed < 5 && uploadSpeed > 0) {
    uploadStatus = 'Poor';
    uploadDesc = 'Constrained upstream pipe. Uploading multi-gigabyte files will take significant time.';
  }

  return {
    gaming: { status: gamingStatus, desc: gamingDesc },
    streaming: { status: streamStatus, desc: streamDesc },
    rtc: { status: rtcStatus, desc: rtcDesc },
    upload: { status: uploadStatus, desc: uploadDesc }
  };
}
