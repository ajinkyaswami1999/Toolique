export type CertificationLevel = 'L0' | 'L1';

export type BiometricModality =
  | 'single_fingerprint'
  | 'dual_fingerprint'
  | 'single_iris'
  | 'dual_iris'
  | 'face_auth';

export type DiagnosticStatus = 'pass' | 'fail' | 'skipped' | 'inconclusive' | 'running' | 'idle';

export type DiagnosticCheckId =
  | 'browser_compatibility'
  | 'loopback_reachability'
  | 'rd_service_discovery'
  | 'device_detection'
  | 'service_readiness'
  | 'l1_certificate_validation';

export interface Manufacturer {
  id: string;
  name: string;
  shortName: string;
  country: string;
  description: string;
  website: string;
  isAvailable: boolean;
  comingSoon?: boolean;
}

export interface BiometricDevice {
  id: string;
  manufacturerId: string;
  modelName: string;
  certificationLevel: CertificationLevel;
  modality: BiometricModality;
  modalityLabel: string;
  sensorTechnology: string;
  resolutionDpi: number;
  platenSize: string;
  interfaceType: string;
  supportedOS: string[];
  defaultPorts: number[];
  stqcCertified: boolean;
  uidaiL1Approved: boolean;
  driverDownloadUrl: string;
  rdServiceDownloadUrl: string;
  documentationUrl: string;
  isAvailable: boolean;
  vendorId?: string;
  productId?: string;
  dpId?: string;
  rdsId?: string;
  serviceName?: string;
}

export interface DiscoveredRDService {
  port: number;
  protocol: 'http' | 'https';
  url: string;
  status: 'READY' | 'NOTREADY' | 'USED' | 'UNKNOWN';
  info: string;
  vendorId: string;
  vendorName: string;
  capturePath: string;
  infoPath: string;
  rawXml: string;
}

export interface DiagnosticCheck {
  id: DiagnosticCheckId;
  title: string;
  description: string;
  status: DiagnosticStatus;
  durationMs?: number;
  message?: string;
  technicalDetails?: string;
  recommendation?: string;
  rawPayload?: string;
  logs?: string[];
}

export interface MockScenario {
  id: string;
  label: string;
  description: string;
  outcomes: Record<DiagnosticCheckId, {
    status: DiagnosticStatus;
    durationMs: number;
    message: string;
    technicalDetails?: string;
    recommendation?: string;
    rawPayload?: string;
    logs: string[];
  }>;
}

export interface TroubleshootingGuideItem {
  id: string;
  category: 'driver' | 'service' | 'browser' | 'hardware' | 'registration';
  categoryLabel: string;
  title: string;
  errorCode?: string;
  symptoms: string[];
  rootCause: string;
  resolutionSteps: string[];
  affectedDevices: string[];
  windowsVersions: string[];
}

export type CaptureState =
  | 'idle'
  | 'dispatched'
  | 'waiting_finger'
  | 'processing'
  | 'success'
  | 'error';

export interface CaptureResult {
  status: 'success' | 'error';
  errorCode: number;
  errorInfo: string;
  qScore: number;
  nmPoints: number;
  fCount: number;
  durationMs: number;
  rawXml: string;
  timestamp: string;
  deviceInfo?: {
    mi: string;
    rdsId: string;
    rdsVer: string;
    srno?: string;
  };
  isMock: boolean;
}
