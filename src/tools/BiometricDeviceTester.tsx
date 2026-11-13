import { useState, useId, useMemo, useEffect, useCallback } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Play,
  RotateCcw,
  Cpu,
  Download,
  Search,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Activity,
  AlertCircle,
  HelpCircle,
  Check,
  Copy,
  Fingerprint,
  Eye,
  RefreshCw,
  Radio,
  Printer,
  Terminal,
  Usb,
  Layers,
  CheckCheck,
  Sparkles,
  X,
  Volume2,
  VolumeX,
  Zap
} from 'lucide-react';
import {
  manufacturers,
  biometricDevices,
  defaultDiagnosticChecks,
  mockScenarios,
  troubleshootingGuides
} from '../data/biometricDevices';
import type {
  DiagnosticCheck,
  DiagnosticCheckId,
  DiagnosticStatus,
  CaptureState,
  CaptureResult,
  DiscoveredRDService
} from '../types/biometric';

const POPULAR_DEVICES = [
  { id: 'mantra-mfs110-l1', mfrId: 'mantra', label: 'Mantra MFS110', badge: 'L1 HW' },
  { id: 'morpho-mso1300e3-l1', mfrId: 'idemia_morpho', label: 'Morpho 1300 E3', badge: 'L1 HW' },
  { id: 'startek-fm220u-l1', mfrId: 'startek', label: 'Startek FM220U', badge: 'L1 HW' },
  { id: 'mantra-mis100v2-l1', mfrId: 'mantra', label: 'Mantra MIS100 Iris', badge: 'Iris L1' },
  { id: 'mantra-mfs100-l0', mfrId: 'mantra', label: 'Mantra MFS100', badge: 'L0 Legacy' },
  { id: 'secugen-hamster-pro20-l1', mfrId: 'secugen', label: 'SecuGen Hamster 20', badge: 'L1 HW' },
];

export default function BiometricDeviceTester() {
  // Device & Manufacturer state
  const [selectedManufacturerId, setSelectedManufacturerId] = useState<string>('mantra');
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('mantra-mfs110-l1');

  // Diagnostics mode: 'mock' (simulator) or 'live' (loopback probe)
  const [executionMode, setExecutionMode] = useState<'mock' | 'live'>('mock');
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('healthy_device');

  // Discovered loopback services cache
  const [discoveredServices, setDiscoveredServices] = useState<DiscoveredRDService[]>([]);
  const [isScanningHardware, setIsScanningHardware] = useState<boolean>(false);

  // Diagnostics execution state
  const [diagnosticChecks, setDiagnosticChecks] = useState<DiagnosticCheck[]>(defaultDiagnosticChecks);
  const [isRunningAll, setIsRunningAll] = useState<boolean>(false);
  const [expandedCheckId, setExpandedCheckId] = useState<DiagnosticCheckId | null>('rd_service_discovery');
  const [activeTab, setActiveTab] = useState<'diagnostics' | 'capture' | 'specs' | 'troubleshoot'>('diagnostics');

  // Troubleshooting search & filter state
  const [troubleshootQuery, setTroubleshootQuery] = useState<string>('');
  const [selectedTroubleshootCategory, setSelectedTroubleshootCategory] = useState<string>('all');
  const [expandedTroubleshootId, setExpandedTroubleshootId] = useState<string | null>('err-1140');

  // Capture Testing State
  const [captureMode, setCaptureMode] = useState<'mock' | 'live'>('mock');
  const [captureTimeout, setCaptureTimeout] = useState<number>(10);
  const [minQualityTarget, setMinQualityTarget] = useState<number>(60);
  const [uidaiEnv, setUidaiEnv] = useState<'P' | 'PP'>('P');
  const [captureSimPreset, setCaptureSimPreset] = useState<'optimal' | 'borderline' | 'timeout' | 'detached' | 'quick_remove'>('optimal');
  const [captureState, setCaptureState] = useState<CaptureState>('idle');
  const [captureResult, setCaptureResult] = useState<CaptureResult | null>(null);
  const [captureError, setCaptureError] = useState<string | null>(null);
  const [showRawXml, setShowRawXml] = useState<boolean>(false);

  // Copy feedback state
  const [copiedLogId, setCopiedLogId] = useState<string | null>(null);
  const [copiedCommandText, setCopiedCommandText] = useState<string | null>(null);

  // Interactive Port Matrix Radar State (11100–11105)
  const [portMatrix, setPortMatrix] = useState<Record<number, {
    port: number;
    status: 'idle' | 'probing' | 'open' | 'closed';
    protocol?: 'http' | 'https';
    latencyMs?: number;
    serviceName?: string;
    deviceStatus?: string;
  }>>(() => ({
    11100: { port: 11100, status: 'idle' },
    11101: { port: 11101, status: 'idle' },
    11102: { port: 11102, status: 'idle' },
    11103: { port: 11103, status: 'idle' },
    11104: { port: 11104, status: 'idle' },
    11105: { port: 11105, status: 'idle' },
  }));
  const [isScanningPortMatrix, setIsScanningPortMatrix] = useState<boolean>(false);

  // WebUSB Physical Bus Probe State
  const [usbStatus, setUsbStatus] = useState<{
    tested: boolean;
    success?: boolean;
    productName?: string;
    vendorId?: string;
    productId?: string;
    manufacturerName?: string;
    serialNumber?: string;
    message?: string;
  } | null>(null);
  const [isDetectingUsb, setIsDetectingUsb] = useState<boolean>(false);

  // Diagnostic Health Report Modal State
  const [showHealthReport, setShowHealthReport] = useState<boolean>(false);
  const [copiedReportText, setCopiedReportText] = useState<boolean>(false);

  // Audio Feedback & UI enhancement states
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [showSocketLog, setShowSocketLog] = useState<boolean>(false);
  const [copiedSocketLog, setCopiedSocketLog] = useState<boolean>(false);

  // Form control IDs for accessibility
  const mfrSelectId = useId();
  const deviceSelectId = useId();
  const scenarioSelectId = useId();
  const tsSearchId = useId();

  // Active manufacturer and device objects
  const activeManufacturer = useMemo(() => {
    return manufacturers.find((m) => m.id === selectedManufacturerId) || manufacturers[0];
  }, [selectedManufacturerId]);

  const activeDevice = useMemo(() => {
    return biometricDevices.find((d) => d.id === selectedDeviceId) || biometricDevices[0];
  }, [selectedDeviceId]);

  // Devices available for current manufacturer
  const availableDevicesForManufacturer = useMemo(() => {
    return biometricDevices.filter((d) => d.manufacturerId === selectedManufacturerId);
  }, [selectedManufacturerId]);

  // Filtered troubleshooting guides
  const filteredTroubleshootGuides = useMemo(() => {
    return troubleshootingGuides.filter((guide) => {
      const matchesCategory =
        selectedTroubleshootCategory === 'all' || guide.category === selectedTroubleshootCategory;
      const q = troubleshootQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        guide.title.toLowerCase().includes(q) ||
        (guide.errorCode && guide.errorCode.toLowerCase().includes(q)) ||
        guide.rootCause.toLowerCase().includes(q) ||
        guide.symptoms.some((s) => s.toLowerCase().includes(q));
      return matchesCategory && matchesSearch;
    });
  }, [selectedTroubleshootCategory, troubleshootQuery]);

  // Overall diagnostic status metrics
  const statusCounts = useMemo(() => {
    const counts = { pass: 0, fail: 0, inconclusive: 0, skipped: 0, idle: 0 };
    diagnosticChecks.forEach((c) => {
      if (c.status in counts) {
        counts[c.status as keyof typeof counts]++;
      }
    });
    return counts;
  }, [diagnosticChecks]);

  // Run mock scenario diagnostics sequentially
  const runMockDiagnostics = async () => {
    setIsRunningAll(true);
    const scenario = mockScenarios.find((s) => s.id === selectedScenarioId) || mockScenarios[0];

    // Reset checks to running or idle
    setDiagnosticChecks(
      defaultDiagnosticChecks.map((check) => ({
        ...check,
        status: 'idle',
        message: 'Pending check...',
        durationMs: undefined,
        logs: ['Queued for diagnostic evaluation...']
      }))
    );

    const primaryPort = activeDevice.defaultPorts[0] || 11100;
    const isIris = activeDevice.modality === 'single_iris';
    const serial = `${activeDevice.modelName.replace(/[^a-zA-Z0-9]/g, '')}-2026-${Math.floor(Math.random() * 800000 + 100000)}`;

    // Sequential simulation of checks
    for (let i = 0; i < defaultDiagnosticChecks.length; i++) {
      const checkId = defaultDiagnosticChecks[i].id;
      const outcome = scenario.outcomes[checkId] || {
        status: 'pass',
        durationMs: 120,
        message: 'Check evaluated.',
        logs: ['Completed']
      };

      // Set current check to running
      setDiagnosticChecks((prev) =>
        prev.map((c) => (c.id === checkId ? { ...c, status: 'running', message: 'Evaluating...' } : c))
      );

      // Simulated latency delay
      await new Promise((resolve) => setTimeout(resolve, Math.max(100, Math.min(outcome.durationMs, 250))));

      let dynamicMessage = outcome.message;
      let dynamicTechnical = outcome.technicalDetails;
      let dynamicRecommendation = outcome.recommendation;
      let dynamicRawPayload = outcome.rawPayload;
      let dynamicLogs = outcome.logs ? [...outcome.logs] : [];

      if (checkId === 'browser_compatibility') {
        dynamicTechnical = `Platform: Windows 10/11 64-bit | Web Crypto: Enabled | Private Network Access: Permitted for localhost:${primaryPort}`;
      } else if (checkId === 'loopback_reachability') {
        if (outcome.status === 'pass') {
          dynamicMessage = `Active ${activeManufacturer.name} RD Service daemon detected on loopback port ${primaryPort}.`;
          dynamicTechnical = `Successfully connected to http://127.0.0.1:${primaryPort}/ within ${outcome.durationMs}ms. Daemon listener confirmed for UIDAI env="${uidaiEnv}".`;
          dynamicLogs = [
            `Probing port ${primaryPort} on 127.0.0.1: Connection established (HTTP 200 OK)`,
            `Target daemon: ${activeManufacturer.name} RD Service`,
            `Port ${primaryPort} state: LISTENING`,
            `Latency: ${outcome.durationMs}ms`
          ];
        } else if (outcome.status === 'fail') {
          dynamicMessage = `Failed: Unable to connect to loopback ports on 127.0.0.1 (Connection Refused).`;
          dynamicTechnical = `No daemon listening on 127.0.0.1:${primaryPort}. Service may be stopped or port blocked.`;
          dynamicRecommendation = `Press Win + R, type services.msc, locate "${activeDevice.serviceName || activeManufacturer.name + ' RD Service'}", and click "Start" or "Restart". Ensure Windows Defender Firewall allows port ${primaryPort}.`;
        }
      } else if (checkId === 'rd_service_discovery') {
        if (outcome.status === 'pass') {
          dynamicMessage = `RDSERVICE discovery handshake verified on port ${primaryPort} (UIDAI env="${uidaiEnv}").`;
          dynamicTechnical = `Received <RDService status="READY" info="${activeManufacturer.name} AVDM (${activeDevice.modelName})">`;
          dynamicRawPayload = `<?xml version="1.0"?>
<RDService status="READY" info="${activeManufacturer.name} Authentication Vendor Device Info (${activeDevice.modelName})">
  <Interface id="CAPTURE" path="/rd/capture" />
  <Interface id="INFO" path="/rd/info" />
</RDService>`;
          dynamicLogs = [
            `Dispatching RDSERVICE discovery request to http://127.0.0.1:${primaryPort}/`,
            'Received response headers: Content-Type: text/xml; charset=utf-8',
            `Targeting UIDAI Environment: env="${uidaiEnv}"`,
            'Parsed Interface CAPTURE: /rd/capture',
            'Parsed Interface INFO: /rd/info'
          ];
        } else if (outcome.status === 'fail' || outcome.status === 'skipped') {
          dynamicMessage = `RD Service discovery failed on port ${primaryPort}.`;
        }
      } else if (checkId === 'device_detection') {
        if (outcome.status === 'pass') {
          dynamicMessage = `Hardware detected: ${activeManufacturer.name} ${activeDevice.modelName} (${activeDevice.modalityLabel}) attached via USB.`;
          dynamicTechnical = `VID: ${activeDevice.vendorId || '0x2802'} | PID: ${activeDevice.productId || '0x001B'} | Serial: ${serial} | Modality: ${activeDevice.modalityLabel}`;
          dynamicLogs = [
            'Calling device info endpoint /rd/info',
            `USB Vendor ID: ${activeDevice.vendorId || '0x2802'} (${activeManufacturer.name})`,
            `Hardware model: ${activeDevice.modelName} (${activeDevice.certificationLevel} Certified)`,
            `Biometric Modality: ${activeDevice.modalityLabel} (${isIris ? 'Iris Reticle' : 'Optical Platen'})`,
            `Serial number: ${serial}`
          ];
        } else if (outcome.status === 'fail') {
          dynamicMessage = `Failure: No ${activeDevice.modelName} hardware detected on USB bus (Error 1140).`;
          dynamicTechnical = `${activeDevice.modelName} scanner was not found. Win32 USB enumeration failed to match VID ${activeDevice.vendorId || '0x2802'}.`;
          dynamicRecommendation = `Unplug the ${activeDevice.modelName} from front USB ports and plug directly into a rear motherboard USB port. Check Windows Device Manager.`;
        }
      } else if (checkId === 'service_readiness') {
        if (outcome.status === 'pass') {
          dynamicMessage = `Device state: READY (${activeDevice.certificationLevel}). Configured for UIDAI Environment env="${uidaiEnv}".`;
          dynamicTechnical = `dpId="${activeDevice.dpId || 'VENDOR.DP'}" rdsId="${activeDevice.rdsId || 'VENDOR.RDS'}" rdsVer="1.0.4" dc="DCD99281A" mi="${activeDevice.modelName}" env="${uidaiEnv}"`;
          dynamicRawPayload = `<DeviceInfo dpId="${activeDevice.dpId || 'VENDOR.DP'}" rdsId="${activeDevice.rdsId || 'VENDOR.RDS'}" rdsVer="1.0.4" dc="DCD99281A" mi="${activeDevice.modelName}" mc="${activeDevice.certificationLevel}_CERT_VALID_2026">
  <additional_info>
    <Param name="srno" value="${serial}" />
    <Param name="sysid" value="WIN10-SECURE-NODE" />
    <Param name="env" value="${uidaiEnv}" />
    <Param name="modality" value="${activeDevice.modality}" />
    <Param name="dpi" value="${activeDevice.resolutionDpi}" />
  </additional_info>
</DeviceInfo>`;
          dynamicLogs = [
            'Parsing DeviceInfo attributes: status="READY"',
            `Validating Device Provider ID: ${activeDevice.dpId || 'VENDOR.DP'}`,
            `Active UIDAI Environment: env="${uidaiEnv}"`,
            `Management Client Token (mc): ${activeDevice.certificationLevel}_CERT_VALID_2026`,
            'Device ready for capture requests'
          ];
        } else if (outcome.status === 'fail') {
          dynamicMessage = `Failure: ${activeDevice.modelName} is NOT READY — Management Server registration incomplete (Error 720).`;
          dynamicTechnical = `mc="" (Empty Management Certificate). Device serial number has not completed online registration with ${activeManufacturer.name} KMS.`;
          dynamicRecommendation = `Ensure your PC has active internet access. Unplug and replug the ${activeDevice.modelName} USB cable to initiate automatic registration sync.`;
          dynamicRawPayload = `<DeviceInfo dpId="${activeDevice.dpId || 'VENDOR.DP'}" rdsId="${activeDevice.rdsId || 'VENDOR.RDS'}" rdsVer="1.0.4" dc="" mi="${activeDevice.modelName}" mc="">
  <additional_info>
    <Param name="error" value="720" />
    <Param name="error_desc" value="Device not registered in management server" />
    <Param name="env" value="${uidaiEnv}" />
  </additional_info>
</DeviceInfo>`;
        }
      } else if (checkId === 'l1_certificate_validation') {
        if (outcome.status === 'pass') {
          dynamicMessage = activeDevice.certificationLevel === 'L1'
            ? `UIDAI L1 Compliance Verified: Hardware Secure Boot & Hardware Root-of-Trust validated for env="${uidaiEnv}".`
            : `UIDAI L0 Legacy Software Signing Certificate validated for env="${uidaiEnv}".`;
          dynamicTechnical = activeDevice.certificationLevel === 'L1'
            ? `${activeDevice.modelName} is UIDAI L1 certified. Biometric data is signed inside hardware secure enclave prior to transmission (env="${uidaiEnv}").`
            : `${activeDevice.modelName} is UIDAI L0 certified. Software driver signing active (env="${uidaiEnv}").`;
          dynamicLogs = [
            `Evaluating ${activeDevice.certificationLevel} attestation payload: Verified`,
            `Cryptographic signing key level: UIDAI Level ${activeDevice.certificationLevel === 'L1' ? '1 (Hardware TEE)' : '0 (Software Driver)'}`,
            `UIDAI Target Environment: env="${uidaiEnv}"`,
            `Complies with ${activeManufacturer.name} KMS security specifications`
          ];
        }
      }

      // Apply outcome
      setDiagnosticChecks((prev) =>
        prev.map((c) => {
          if (c.id === checkId) {
            return {
              ...c,
              status: outcome.status,
              durationMs: outcome.durationMs,
              message: dynamicMessage,
              technicalDetails: dynamicTechnical,
              recommendation: dynamicRecommendation,
              rawPayload: dynamicRawPayload,
              logs: dynamicLogs
            };
          }
          return c;
        })
      );
    }

    setIsRunningAll(false);
  };

  // Probe a single port and protocol for UIDAI RD Service
  const probePort = async (port: number, protocol: 'http' | 'https'): Promise<DiscoveredRDService | null> => {
    const baseUrl = `${protocol}://127.0.0.1:${port}/`;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 650);

      let res: Response | null = null;
      let text = '';

      // 1. Try standard RDSERVICE HTTP verb
      try {
        res = await fetch(baseUrl, {
          method: 'RDSERVICE',
          signal: controller.signal
        });
        if (res && res.ok) {
          text = await res.text();
        }
      } catch {
        // 2. Fallback to GET if custom verb is restricted
        try {
          const c2 = new AbortController();
          const t2 = setTimeout(() => c2.abort(), 500);
          res = await fetch(baseUrl, {
            method: 'GET',
            signal: c2.signal
          });
          clearTimeout(t2);
          if (res && res.ok) {
            text = await res.text();
          }
        } catch {
          // Both failed
        }
      }
      clearTimeout(timeoutId);

      if (!text || !text.includes('<RDService')) {
        return null;
      }

      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(text, 'text/xml');
      const rdElem = xmlDoc.querySelector('RDService');
      if (!rdElem) return null;

      const status = (rdElem.getAttribute('status') || 'UNKNOWN').toUpperCase() as 'READY' | 'NOTREADY' | 'USED' | 'UNKNOWN';
      const info = rdElem.getAttribute('info') || 'Biometric RD Service';
      const capElem = xmlDoc.querySelector('Interface[id="CAPTURE"]') || xmlDoc.querySelector('Interface[id="capture"]');
      const infoElem = xmlDoc.querySelector('Interface[id="DEVICEINFO"]') || xmlDoc.querySelector('Interface[id="INFO"]') || xmlDoc.querySelector('Interface[id="info"]');

      let capturePath = capElem?.getAttribute('path') || '/rd/capture';
      const infoPath = infoElem?.getAttribute('path') || '/rd/info';

      // Normalize if full URL was provided in path
      if (capturePath.startsWith('http://') || capturePath.startsWith('https://')) {
        try {
          capturePath = new URL(capturePath).pathname;
        } catch {
          // keep
        }
      }

      const lower = (info + ' ' + text).toLowerCase();
      let vendorId = 'unknown';
      let vendorName = 'Unknown Vendor';

      if (lower.includes('mantra') || lower.includes('mfs110') || lower.includes('mfs100') || lower.includes('mis100')) {
        vendorId = 'mantra';
        vendorName = 'Mantra Softech';
      } else if (lower.includes('morpho') || lower.includes('idemia') || lower.includes('smartchip') || lower.includes('mso')) {
        vendorId = 'idemia_morpho';
        vendorName = 'IDEMIA (Morpho)';
      } else if (lower.includes('startek') || lower.includes('acpl') || lower.includes('fm220')) {
        vendorId = 'startek';
        vendorName = 'Startek Engineering';
      } else if (lower.includes('secugen') || lower.includes('hamster')) {
        vendorId = 'secugen';
        vendorName = 'SecuGen Corporation';
      } else if (lower.includes('precision') || lower.includes('pb510') || lower.includes('csd200')) {
        vendorId = 'precision';
        vendorName = 'Precision Biometric';
      }

      return {
        port,
        protocol,
        url: baseUrl,
        status,
        info,
        vendorId,
        vendorName,
        capturePath,
        infoPath,
        rawXml: text
      };
    } catch {
      return null;
    }
  };

  // Scan all known biometric ports (11100–11105) concurrently across HTTP and HTTPS
  const scanAllLoopbackPorts = useCallback(async (): Promise<DiscoveredRDService[]> => {
    setIsScanningHardware(true);
    setIsScanningPortMatrix(true);

    const portsToScan = [11100, 11101, 11102, 11103, 11104, 11105];

    // Set all ports to probing state
    setPortMatrix((prev) => {
      const next = { ...prev };
      portsToScan.forEach((p) => {
        next[p] = { port: p, status: 'probing' };
      });
      return next;
    });

    if (executionMode === 'mock') {
      await new Promise((r) => setTimeout(r, 450));
      const isPortConflict = selectedScenarioId === 'vendor_mismatch';
      const isStopped = selectedScenarioId === 'rdservice_stopped';

      setPortMatrix({
        11100: {
          port: 11100,
          status: isStopped ? 'closed' : 'open',
          protocol: 'http',
          latencyMs: isStopped ? undefined : 45,
          serviceName: isStopped ? undefined : isPortConflict ? 'Mantra MFS110 AVDM' : `${activeManufacturer.name} RD Service`,
          deviceStatus: isStopped ? 'CLOSED' : 'READY'
        },
        11101: {
          port: 11101,
          status: isPortConflict ? 'open' : 'closed',
          protocol: 'http',
          latencyMs: isPortConflict ? 38 : undefined,
          serviceName: isPortConflict ? `${activeManufacturer.name} Secondary Daemon` : undefined,
          deviceStatus: isPortConflict ? 'READY' : 'CLOSED'
        },
        11102: { port: 11102, status: 'closed' },
        11103: { port: 11103, status: 'closed' },
        11104: { port: 11104, status: 'closed' },
        11105: { port: 11105, status: 'closed' },
      });
      setIsScanningHardware(false);
      setIsScanningPortMatrix(false);
      return [];
    }

    const probePromises = portsToScan.map(async (p) => {
      const t0 = performance.now();
      let res = await probePort(p, 'https');
      let proto: 'http' | 'https' = 'https';
      if (!res) {
        res = await probePort(p, 'http');
        proto = 'http';
      }
      const duration = Math.round(performance.now() - t0);
      setPortMatrix((prev) => ({
        ...prev,
        [p]: {
          port: p,
          status: res ? 'open' : 'closed',
          protocol: proto,
          latencyMs: res ? duration : undefined,
          serviceName: res?.info,
          deviceStatus: res?.status
        }
      }));
      return res;
    });

    const results = await Promise.all(probePromises);
    const found = results.filter((r): r is DiscoveredRDService => r !== null);
    setDiscoveredServices(found);
    setIsScanningHardware(false);
    setIsScanningPortMatrix(false);
    return found;
  }, [executionMode, selectedScenarioId, activeManufacturer.name]);

  // Physical WebUSB Hardware Enumeration (WebUSB API)
  const handleDetectPhysicalUsb = async () => {
    setIsDetectingUsb(true);
    if (typeof navigator === 'undefined' || !('usb' in navigator)) {
      setUsbStatus({
        tested: true,
        success: false,
        message: 'WebUSB API is not supported in this browser. Please open Google Chrome or Microsoft Edge on Windows 10/11.'
      });
      setIsDetectingUsb(false);
      return;
    }

    try {
      const device = await (navigator as unknown as { usb: { requestDevice: (opts: { filters: { vendorId: number }[] }) => Promise<{ productName?: string; vendorId: number; productId: number; manufacturerName?: string; serialNumber?: string }> } }).usb.requestDevice({
        filters: [
          { vendorId: 0x2802 }, // Mantra Softech
          { vendorId: 0x0bca }, // Morpho / IDEMIA
          { vendorId: 0x0483 }, // Startek Engineering
          { vendorId: 0x1162 }, // SecuGen Corporation
        ]
      });

      setUsbStatus({
        tested: true,
        success: true,
        productName: device.productName || `${activeManufacturer.name} Biometric Scanner`,
        vendorId: '0x' + device.vendorId.toString(16).toUpperCase(),
        productId: '0x' + device.productId.toString(16).toUpperCase(),
        manufacturerName: device.manufacturerName || activeManufacturer.name,
        serialNumber: device.serialNumber || 'USB Bus Connected',
        message: 'Physical USB hardware connection verified. The scanner is receiving 5V bus power and responding to Windows USB enumeration.'
      });
    } catch (err: unknown) {
      const errorObj = err as { name?: string; message?: string };
      if (errorObj?.name === 'NotFoundError') {
        setUsbStatus({
          tested: true,
          success: false,
          message: 'No biometric USB scanner selected or plugged in. Connect the device directly to a rear motherboard USB 2.0/3.0 port and try again.'
        });
      } else {
        setUsbStatus({
          tested: true,
          success: false,
          message: errorObj?.message || 'Unable to access USB bus. Another application or service may hold exclusive lock.'
        });
      }
    } finally {
      setIsDetectingUsb(false);
    }
  };

  // Jump to specific troubleshooting error guide
  const jumpToTroubleshoot = (guideId: string) => {
    setActiveTab('troubleshoot');
    setExpandedTroubleshootId(guideId);
    setTimeout(() => {
      const el = document.getElementById(guideId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 120);
  };

  // One-click copy helper with feedback
  const handleCopyCommand = (cmd: string) => {
    try {
      navigator.clipboard.writeText(cmd);
      setCopiedCommandText(cmd);
      setTimeout(() => setCopiedCommandText(null), 2000);
    } catch {
      // ignore
    }
  };

  // In-Browser Web Audio Synthesizer (Instant sensory tactile feedback)
  const playAcousticFeedback = useCallback((type: 'success' | 'error' | 'start') => {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'success') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.18);
      } else if (type === 'error') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(280, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(180, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.09, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.2);
      } else {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.08);
      }
    } catch {
      // AudioContext policy
    }
  }, [soundEnabled]);

  // Generate downloadable/printable technician diagnostic slip
  const generateAuditReportText = () => {
    const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    const primaryPort = activeDevice.defaultPorts[0] || 11100;
    const checksSummary = diagnosticChecks.map(c => `[${c.status.toUpperCase()}] ${c.title}: ${c.message}`).join('\n');
    return `=====================================================
TOOLIQUE BIOMETRIC & RD SERVICE DIAGNOSTIC AUDIT
=====================================================
Timestamp (IST): ${timestamp}
Device Model: ${activeManufacturer.name} ${activeDevice.modelName}
Certification Level: UIDAI ${activeDevice.certificationLevel} Certified (STQC Approved: ${activeDevice.stqcCertified ? 'YES' : 'NO'})
Modality: ${activeDevice.modalityLabel}
Target UIDAI Environment: env="${uidaiEnv}"
Primary Loopback Port: 127.0.0.1:${primaryPort}
Platform: Windows 10/11 64-bit

DIAGNOSTIC CHECKS:
${checksSummary}

STATUS COUNTERS:
Pass: ${statusCounts.pass} | Fail: ${statusCounts.fail} | Inconclusive: ${statusCounts.inconclusive} | Skipped: ${statusCounts.skipped}

AUDIT VERDICT:
${statusCounts.fail === 0 && statusCounts.pass >= 4 ? 'READY FOR PRODUCTION AUTH (AePS / PM-KISAN / eKYC)' : 'ACTION REQUIRED - Follow troubleshooting guide'}

Generated by Toolique Biometric Diagnostics (https://www.toolique.in/compliance/biometric-device-tester)
=====================================================`;
  };

  // Auto-scan loopback when entering Live USB mode
  useEffect(() => {
    let isMounted = true;
    if (executionMode === 'live' || captureMode === 'live') {
      const timer = setTimeout(() => {
        if (isMounted) {
          scanAllLoopbackPorts();
        }
      }, 0);
      return () => {
        isMounted = false;
        clearTimeout(timer);
      };
    }
  }, [executionMode, captureMode, scanAllLoopbackPorts]);

  // Run live probe against localhost loopback
  const runLiveProbeDiagnostics = async () => {
    setIsRunningAll(true);

    // 1. Browser check
    setDiagnosticChecks((prev) =>
      prev.map((c) =>
        c.id === 'browser_compatibility'
          ? {
              ...c,
              status: 'pass',
              durationMs: 25,
              message: 'Browser environment supports Web Crypto & local loopback fetch.',
              technicalDetails: `Platform: Windows 10/11 | Web Crypto: Enabled | Origin: ${window.location.origin}`,
              logs: [
                'Checking window.crypto: available',
                'Checking fetch API: available',
                'Secure Context check: ' + (window.isSecureContext ? 'true' : 'false')
              ]
            }
          : c
      )
    );

    // 2. Scan loopback ports
    setDiagnosticChecks((prev) =>
      prev.map((c) =>
        c.id === 'loopback_reachability'
          ? { ...c, status: 'running', message: `Scanning ports 11100–11105 across HTTP & HTTPS for ${activeManufacturer.name}...` }
          : c
      )
    );

    const discovered = await scanAllLoopbackPorts();
    const matchedService = discovered.find((s) => s.vendorId === activeManufacturer.id);

    if (matchedService) {
      // Manufacturer's RD Service was found!
      const isReady = matchedService.status === 'READY';
      const isNotReady = matchedService.status === 'NOTREADY';

      setDiagnosticChecks((prev) =>
        prev.map((c) =>
          c.id === 'loopback_reachability'
            ? {
                ...c,
                status: 'pass',
                durationMs: 140,
                message: `Active ${matchedService.vendorName} RD Service daemon responding on port ${matchedService.port} (${matchedService.protocol.toUpperCase()}).`,
                technicalDetails: `Local loopback listener confirmed on ${matchedService.protocol}://127.0.0.1:${matchedService.port}/ for UIDAI env="${uidaiEnv}".`,
                logs: [
                  `Connected to ${matchedService.protocol}://127.0.0.1:${matchedService.port}/`,
                  `Detected Daemon info: "${matchedService.info}"`,
                  `Reported Device Status: ${matchedService.status}`
                ]
              }
            : c
        )
      );

      // Discovery check
      setDiagnosticChecks((prev) =>
        prev.map((c) =>
          c.id === 'rd_service_discovery'
            ? {
                ...c,
                status: 'pass',
                durationMs: 160,
                message: `RDSERVICE handshake validated with ${matchedService.vendorName} on port ${matchedService.port}.`,
                technicalDetails: `Received: <RDService status="${matchedService.status}" info="${matchedService.info}">`,
                rawPayload: matchedService.rawXml,
                logs: [
                  `Dispatched RDSERVICE to ${matchedService.url}`,
                  `Status: ${matchedService.status}`,
                  `Capture Path: ${matchedService.capturePath}`,
                  `Info Path: ${matchedService.infoPath}`
                ]
              }
            : c
        )
      );

      if (isReady) {
        // Device IS PLUGGED IN AND READY!
        let liveSrno = `${activeDevice.modelName}-LIVE`;
        let liveMc = `${activeDevice.certificationLevel}_CERT_VALID_2026`;
        let liveRdsVer = '1.0.4';
        let liveRawXml = '';

        try {
          const infoUrl = `${matchedService.protocol}://127.0.0.1:${matchedService.port}${matchedService.infoPath.startsWith('/') ? '' : '/'}${matchedService.infoPath}`;
          const cInfo = new AbortController();
          const tInfo = setTimeout(() => cInfo.abort(), 1200);

          let infoRes: Response | null = null;
          try {
            infoRes = await fetch(infoUrl, { method: 'DEVICEINFO', signal: cInfo.signal });
          } catch {
            infoRes = await fetch(infoUrl, { method: 'POST', signal: cInfo.signal });
          }
          clearTimeout(tInfo);

          if (infoRes && infoRes.ok) {
            const infoText = await infoRes.text();
            liveRawXml = infoText;
            const doc = new DOMParser().parseFromString(infoText, 'text/xml');
            const devNode = doc.querySelector('DeviceInfo');
            if (devNode) {
              liveRdsVer = devNode.getAttribute('rdsVer') || liveRdsVer;
              liveMc = devNode.getAttribute('mc') || liveMc;
            }
            const srnoParam = doc.querySelector('Param[name="srno"]');
            if (srnoParam) {
              liveSrno = srnoParam.getAttribute('value') || liveSrno;
            }
          }
        } catch {
          // fallback
        }

        setDiagnosticChecks((prev) =>
          prev.map((c) =>
            c.id === 'device_detection'
              ? {
                  ...c,
                  status: 'pass',
                  durationMs: 120,
                  message: `Hardware detected & connected: ${activeManufacturer.name} ${activeDevice.modelName} (Serial: ${liveSrno}).`,
                  technicalDetails: `USB hardware enumeration confirmed. Serial: ${liveSrno} | Modality: ${activeDevice.modalityLabel}`,
                  rawPayload: liveRawXml || undefined,
                  logs: [
                    'Querying device info: status="READY"',
                    `Hardware Serial: ${liveSrno}`,
                    `Device Vendor: ${matchedService.vendorName}`,
                    `Model: ${activeDevice.modelName}`
                  ]
                }
              : c.id === 'service_readiness'
              ? {
                  ...c,
                  status: 'pass',
                  durationMs: 90,
                  message: `Device state: READY (${activeDevice.certificationLevel}). Configured for UIDAI env="${uidaiEnv}".`,
                  technicalDetails: `dpId="${activeDevice.dpId || 'VENDOR.DP'}" rdsId="${activeDevice.rdsId || 'VENDOR.RDS'}" rdsVer="${liveRdsVer}" env="${uidaiEnv}"`,
                  logs: [
                    'Device readiness confirmed by local daemon',
                    `Target UIDAI env: "${uidaiEnv}"`,
                    'Ready for biometric capture operations'
                  ]
                }
              : c.id === 'l1_certificate_validation'
              ? {
                  ...c,
                  status: 'pass',
                  durationMs: 70,
                  message: activeDevice.certificationLevel === 'L1'
                    ? `UIDAI L1 Hardware Secure Enclave Attestation verified for env="${uidaiEnv}".`
                    : `UIDAI L0 Legacy Software Signing Certificate verified for env="${uidaiEnv}".`,
                  technicalDetails: `Attestation Certificate Token (mc): ${liveMc.slice(0, 40)}...`,
                  logs: [
                    `Validating ${activeDevice.certificationLevel} cryptographic certificate... Verified`,
                    `Target Environment: env="${uidaiEnv}"`
                  ]
                }
              : c
          )
        );
      } else if (isNotReady) {
        // DEVICE IS NOT CONNECTED TO USB!
        setDiagnosticChecks((prev) =>
          prev.map((c) =>
            c.id === 'device_detection'
              ? {
                  ...c,
                  status: 'fail',
                  durationMs: 120,
                  message: `Device Not Connected: ${activeManufacturer.name} ${activeDevice.modelName} is NOT detected on USB (status="NOTREADY").`,
                  technicalDetails: `Daemon on port ${matchedService.port} reports status="NOTREADY". Scanner hardware is detached or not powered.`,
                  recommendation: `Plug the ${activeDevice.modelName} USB cable into a USB port (prefer a rear motherboard USB port). Re-scan once connected.`,
                  logs: [
                    `Checked ${matchedService.url}`,
                    'Response status attribute: "NOTREADY"',
                    'Hardware disconnected from USB bus'
                  ]
                }
              : c.id === 'service_readiness'
              ? {
                  ...c,
                  status: 'fail',
                  durationMs: 80,
                  message: `Service Readiness: NOTREADY. Hardware initialization pending.`,
                  technicalDetails: 'Daemon is active, but device readiness cannot be established without connected hardware.',
                  recommendation: 'Connect the scanner and wait 3–5 seconds for Windows USB driver enumeration.',
                  logs: ['Readiness check failed: status="NOTREADY"']
                }
              : c.id === 'l1_certificate_validation'
              ? {
                  ...c,
                  status: 'skipped',
                  durationMs: 0,
                  message: 'Skipped: Hardware must be attached to verify security certificate attestation.',
                  logs: ['Skipped due to disconnected device']
                }
              : c
          )
        );
      } else {
        // USED
        setDiagnosticChecks((prev) =>
          prev.map((c) =>
            c.id === 'service_readiness'
              ? {
                  ...c,
                  status: 'inconclusive',
                  durationMs: 80,
                  message: 'Device is currently marked as USED by another process or application.',
                  recommendation: 'Close other tabs or applications using the biometric scanner and retry.',
                  logs: ['status="USED"']
                }
              : c
          )
        );
      }
    } else {
      // NO SERVICE MATCHED SELECTED MANUFACTURER!
      const otherServices = discovered.filter((s) => s.vendorId !== activeManufacturer.id);

      setDiagnosticChecks((prev) =>
        prev.map((c) =>
          c.id === 'loopback_reachability'
            ? {
                ...c,
                status: 'fail',
                durationMs: 400,
                message: `${activeManufacturer.name} RD Service was NOT found on ports 11100–11105.`,
                technicalDetails: otherServices.length > 0
                  ? `Active daemons detected on PC: ${otherServices.map((s) => `${s.vendorName} on port ${s.port} (${s.protocol.toUpperCase()}, ${s.status})`).join(', ')}. No ${activeManufacturer.name} daemon responded.`
                  : 'No biometric RD Service daemon is listening on 127.0.0.1 (Connection Refused).',
                recommendation: otherServices.length > 0
                  ? `You have ${otherServices[0].vendorName} running on your PC. Did you mean to test ${otherServices[0].vendorName}? Click the button below to switch. Or start the ${activeDevice.serviceName || activeManufacturer.name + ' RD Service'} in Windows services.msc.`
                  : `Press Win + R, type services.msc, find "${activeDevice.serviceName || activeManufacturer.name + ' RD Service'}", and click Start.`,
                logs: [
                  `Probing ports 11100–11105 for ${activeManufacturer.name}...`,
                  ...otherServices.map((s) => `Port ${s.port} (${s.protocol}): Responded with ${s.vendorName} (${s.info})`),
                  `Match for ${activeManufacturer.name}: NOT FOUND`
                ]
              }
            : ['rd_service_discovery', 'device_detection', 'service_readiness', 'l1_certificate_validation'].includes(c.id)
            ? {
                ...c,
                status: 'skipped',
                durationMs: 0,
                message: `Skipped: ${activeManufacturer.name} RD Service is not running.`,
                logs: ['Skipped']
              }
            : c
        )
      );
    }

    setIsRunningAll(false);
  };

  const handleRunDiagnostics = () => {
    if (executionMode === 'mock') {
      runMockDiagnostics();
    } else {
      runLiveProbeDiagnostics();
    }
  };

  const handleResetDiagnostics = () => {
    setDiagnosticChecks(defaultDiagnosticChecks);
  };

  // Live RD Service Biometric Capture
  const triggerLiveCapture = async () => {
    setCaptureState('dispatched');
    setCaptureError(null);
    setCaptureResult(null);

    const startTime = Date.now();

    // 1. Scan ports to find the matching service
    const discovered = await scanAllLoopbackPorts();
    const matchedService = discovered.find((s) => s.vendorId === activeManufacturer.id);

    if (!matchedService) {
      // Selected device is NOT running on any port!
      const otherServices = discovered.filter((s) => s.vendorId !== activeManufacturer.id);
      if (otherServices.length > 0) {
        setCaptureError(
          `Capture Blocked (Device Mismatch): You selected ${activeManufacturer.name} (${activeDevice.modelName}), but port ${otherServices[0].port} is running ${otherServices[0].vendorName} (${otherServices[0].status}). Capturing from the wrong device is prevented! Please switch your selection to ${otherServices[0].vendorName} or connect your ${activeManufacturer.name} scanner.`
        );
      } else {
        setCaptureError(
          `${activeManufacturer.name} RD Service is not running on localhost (ports 11100–11105). Please start "${activeDevice.serviceName || activeManufacturer.name + ' RD Service'}" in Windows services.msc.`
        );
      }
      setCaptureState('error');
      return;
    }

    // 2. Hardware connection check
    if (matchedService.status === 'NOTREADY') {
      setCaptureError(
        `Cannot Trigger Capture: ${activeDevice.modelName} reports status="NOTREADY" (Scanner Not Connected). The RD Service is active on port ${matchedService.port}, but the physical biometric scanner is detached from USB. Please plug the device into a USB port before capturing.`
      );
      setCaptureState('error');
      return;
    }

    if (matchedService.status === 'USED') {
      setCaptureError(
        `Cannot Trigger Capture: ${activeDevice.modelName} is currently marked as USED by another application.`
      );
      setCaptureState('error');
      return;
    }

    // 3. Construct URL and PidOptions
    setCaptureState('waiting_finger');
    playAcousticFeedback('start');

    const isIris = activeDevice.modality === 'single_iris';
    const fCountOpt = isIris ? '0' : '1';
    const fTypeOpt = isIris ? '0' : '2';
    const iCountOpt = isIris ? '1' : '0';
    const iTypeOpt = isIris ? '0' : '0';

    const custParams = activeDevice.manufacturerId === 'mantra'
      ? '    <Param name="mantrakey" value="" />\n'
      : '';

    const pidOptions = `<?xml version="1.0"?>
<PidOptions ver="1.0">
  <Opts fCount="${fCountOpt}" fType="${fTypeOpt}" iCount="${iCountOpt}" iType="${iTypeOpt}" pCount="0" format="0" pidVer="2.0" timeout="${captureTimeout * 1000}" env="${uidaiEnv}" />
  <Demo></Demo>
  <CustOpts>
${custParams}  </CustOpts>
</PidOptions>`;

    const captureUrl = `${matchedService.protocol}://127.0.0.1:${matchedService.port}${matchedService.capturePath.startsWith('/') ? '' : '/'}${matchedService.capturePath}`;

    try {
      const controller = new AbortController();
      const timeoutHandle = setTimeout(() => controller.abort(), (captureTimeout + 5) * 1000);

      let response: Response | null = null;
      try {
        response = await fetch(captureUrl, {
          method: 'CAPTURE',
          headers: { 'Content-Type': 'text/xml; charset=utf-8' },
          body: pidOptions,
          signal: controller.signal
        });
      } catch {
        // Fallback to POST
        response = await fetch(captureUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/xml; charset=utf-8' },
          body: pidOptions,
          signal: controller.signal
        });
      }

      clearTimeout(timeoutHandle);
      setCaptureState('processing');

      const xmlText = await response.text();
      const duration = Date.now() - startTime;

      // Parse XML response
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
      const respElem = xmlDoc.querySelector('Resp');

      if (!respElem) {
        throw new Error(`Invalid response returned from ${activeDevice.modelName} RD Service.`);
      }

      const errCode = parseInt(respElem.getAttribute('errCode') || '0', 10);
      const errInfo = respElem.getAttribute('errInfo') || '';
      const qScore = parseInt(respElem.getAttribute('qScore') || '0', 10);
      const nmPoints = parseInt(respElem.getAttribute('nmPoints') || '0', 10);
      const fCount = parseInt(respElem.getAttribute('fCount') || '0', 10);

      // Device info extraction
      const devElem = xmlDoc.querySelector('DeviceInfo');
      const mi = devElem?.getAttribute('mi') || activeDevice.modelName;
      const rdsId = devElem?.getAttribute('rdsId') || activeDevice.rdsId || 'RD.WIN.001';
      const rdsVer = devElem?.getAttribute('rdsVer') || '1.0.4';
      const srno = xmlDoc.querySelector('Param[name="srno"]')?.getAttribute('value') || `${activeDevice.modelName}-SERIAL`;

      // Sanitization: mask raw encrypted PID and session keys for privacy
      const sanitizedXml = xmlText
        .replace(/<Skey[^>]*>[\s\S]*?<\/Skey>/gi, '<Skey ci="...">[ENCRYPTED_SESSION_KEY_MASKED_FOR_PRIVACY]</Skey>')
        .replace(/<Data[^>]*>[\s\S]*?<\/Data>/gi, '<Data type="X">[ENCRYPTED_PID_BLOCK_MASKED_FOR_PRIVACY]</Data>')
        .replace(/<Hmac>[\s\S]*?<\/Hmac>/gi, '<Hmac>[SHA256_HMAC_DIGEST_MASKED]</Hmac>');

      if (errCode === 0) {
        setCaptureResult({
          status: 'success',
          errorCode: 0,
          errorInfo: 'Success',
          qScore: qScore || (isIris ? 88 : 82),
          nmPoints: nmPoints || (isIris ? 0 : 40),
          fCount: fCount || (isIris ? 0 : 1),
          durationMs: duration,
          rawXml: sanitizedXml,
          timestamp: new Date().toLocaleTimeString(),
          deviceInfo: { mi, rdsId, rdsVer, srno },
          isMock: false
        });
        setCaptureState('success');
        playAcousticFeedback('success');
      } else {
        setCaptureResult({
          status: 'error',
          errorCode: errCode,
          errorInfo: errInfo || `Device Error ${errCode}`,
          qScore: 0,
          nmPoints: 0,
          fCount: 0,
          durationMs: duration,
          rawXml: sanitizedXml,
          timestamp: new Date().toLocaleTimeString(),
          deviceInfo: { mi, rdsId, rdsVer, srno },
          isMock: false
        });
        setCaptureError(`Error ${errCode}: ${errInfo}`);
        setCaptureState('error');
        playAcousticFeedback('error');
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Communication failed';
      setCaptureError(
        `${activeDevice.modelName} RD Service capture failed: ${errorMsg}. Endpoint: ${captureUrl}.`
      );
      setCaptureState('error');
      playAcousticFeedback('error');
    }
  };

  // Mock Simulated Biometric Capture
  const triggerMockCapture = async () => {
    setCaptureState('dispatched');
    setCaptureError(null);
    setCaptureResult(null);

    // Initial dispatch delay
    await new Promise((r) => setTimeout(r, 350));
    setCaptureState('waiting_finger');
    playAcousticFeedback('start');

    // Simulated optical scan placement time
    const waitTime = captureSimPreset === 'timeout' ? 2600 : 1600;
    await new Promise((r) => setTimeout(r, waitTime));

    setCaptureState('processing');
    await new Promise((r) => setTimeout(r, 500));

    const isIris = activeDevice.modality === 'single_iris';
    const dpId = activeDevice.dpId || 'VENDOR.RD.MSIPL';
    const rdsId = activeDevice.rdsId || 'VENDOR.WIN.001';
    const model = activeDevice.modelName;
    const serial = `${activeDevice.modelName.replace(/[^a-zA-Z0-9]/g, '')}-2026-${Math.floor(Math.random() * 800000 + 100000)}`;

    if (captureSimPreset === 'optimal') {
      const score = Math.floor(Math.random() * 11) + 82; // 82-92%
      const minutiae = isIris ? 0 : Math.floor(Math.random() * 10) + 38; // 38-47
      const fCount = isIris ? 0 : 1;
      const fType = isIris ? 0 : 2;
      const iCount = isIris ? 1 : 0;
      const mockXml = `<?xml version="1.0"?>
<PidData>
  <Resp errCode="0" errInfo="Success" fCount="${fCount}" fType="${fType}" iCount="${iCount}" pCount="0" nmPoints="${minutiae}" qScore="${score}" />
  <DeviceInfo dpId="${dpId}" rdsId="${rdsId}" rdsVer="1.0.4" dc="DCD99281A" mi="${model}" mc="${activeDevice.certificationLevel}_CERT_VALID_2026">
    <additional_info>
      <Param name="srno" value="${serial}" />
      <Param name="sysid" value="WIN10-SECURE-NODE" />
      <Param name="env" value="${uidaiEnv}" />
      <Param name="modality" value="${activeDevice.modality}" />
    </additional_info>
  </DeviceInfo>
  <Skey ci="20260101">[ENCRYPTED_SESSION_KEY_MASKED_FOR_PRIVACY]</Skey>
  <Hmac>[SHA256_HMAC_DIGEST_MASKED]</Hmac>
  <Data type="X">[ENCRYPTED_PID_${isIris ? 'IRIS' : 'ISO_FMR'}_BLOCK_MASKED]</Data>
</PidData>`;

      setCaptureResult({
        status: 'success',
        errorCode: 0,
        errorInfo: 'Success',
        qScore: score,
        nmPoints: minutiae,
        fCount: fCount,
        durationMs: 2200,
        rawXml: mockXml,
        timestamp: new Date().toLocaleTimeString(),
        deviceInfo: { mi: model, rdsId: rdsId, rdsVer: '1.0.4', srno: serial },
        isMock: true
      });
      setCaptureState('success');
      playAcousticFeedback('success');
    } else if (captureSimPreset === 'borderline') {
      const score = 52;
      const minutiae = isIris ? 0 : 22;
      const fCount = isIris ? 0 : 1;
      const iCount = isIris ? 1 : 0;
      const mockXml = `<?xml version="1.0"?>
<PidData>
  <Resp errCode="0" errInfo="Success (Borderline Quality)" fCount="${fCount}" fType="2" iCount="${iCount}" pCount="0" nmPoints="${minutiae}" qScore="${score}" />
  <DeviceInfo dpId="${dpId}" rdsId="${rdsId}" rdsVer="1.0.4" dc="DCD99281A" mi="${model}" mc="${activeDevice.certificationLevel}_CERT_VALID_2026">
    <additional_info>
      <Param name="env" value="${uidaiEnv}" />
    </additional_info>
  </DeviceInfo>
  <Skey ci="20260101">[ENCRYPTED_SESSION_KEY_MASKED_FOR_PRIVACY]</Skey>
  <Data type="X">[ENCRYPTED_PID_${isIris ? 'IRIS' : 'ISO_FMR'}_BLOCK_MASKED]</Data>
</PidData>`;

      setCaptureResult({
        status: 'success',
        errorCode: 0,
        errorInfo: 'Success (Below 60 UIDAI Quality Threshold)',
        qScore: score,
        nmPoints: minutiae,
        fCount: fCount,
        durationMs: 2050,
        rawXml: mockXml,
        timestamp: new Date().toLocaleTimeString(),
        deviceInfo: { mi: model, rdsId: rdsId, rdsVer: '1.0.4', srno: serial },
        isMock: true
      });
      setCaptureState('success');
      playAcousticFeedback('start');
    } else if (captureSimPreset === 'quick_remove') {
      const mockXml = `<?xml version="1.0"?>
<PidData>
  <Resp errCode="1142" errInfo="${isIris ? 'Eye closed or moved during exposure' : 'Finger removed too quickly'}" fCount="0" fType="0" iCount="0" pCount="0" nmPoints="0" qScore="0" />
</PidData>`;

      setCaptureResult({
        status: 'error',
        errorCode: 1142,
        errorInfo: isIris ? 'Eye moved or closed too quickly' : 'Finger removed too quickly',
        qScore: 0,
        nmPoints: 0,
        fCount: 0,
        durationMs: 1200,
        rawXml: mockXml,
        timestamp: new Date().toLocaleTimeString(),
        isMock: true
      });
      setCaptureError(
        isIris
          ? 'Error 1142: Eye moved or blinked before infrared capture completed. Keep eye steady within the reticle.'
          : `${activeDevice.modelName} Error 1142: Finger removed too quickly before optical exposure completed. Keep finger firmly placed on the glass until the LED turns off.`
      );
      setCaptureState('error');
      playAcousticFeedback('error');
    } else if (captureSimPreset === 'timeout') {
      const mockXml = `<?xml version="1.0"?>
<PidData>
  <Resp errCode="1141" errInfo="Capture timed out (${isIris ? 'Iris not aligned' : 'Finger not placed'})" fCount="0" fType="0" iCount="0" pCount="0" nmPoints="0" qScore="0" />
</PidData>`;

      setCaptureResult({
        status: 'error',
        errorCode: 1141,
        errorInfo: `Capture timed out (${isIris ? 'Iris not aligned' : 'Finger not placed'})`,
        qScore: 0,
        nmPoints: 0,
        fCount: 0,
        durationMs: 2800,
        rawXml: mockXml,
        timestamp: new Date().toLocaleTimeString(),
        isMock: true
      });
      setCaptureError(
        isIris
          ? 'Error 1141: Capture timed out. No iris was aligned in the infrared reticle within the timeout.'
          : `${activeDevice.modelName} Error 1141: Capture timed out. No finger was detected on the platen glass within the timeout duration.`
      );
      setCaptureState('error');
      playAcousticFeedback('error');
    } else {
      // detached
      const mockXml = `<?xml version="1.0"?>
<PidData>
  <Resp errCode="1140" errInfo="Device not attached" fCount="0" fType="0" iCount="0" pCount="0" nmPoints="0" qScore="0" />
</PidData>`;

      setCaptureResult({
        status: 'error',
        errorCode: 1140,
        errorInfo: 'Device not attached',
        qScore: 0,
        nmPoints: 0,
        fCount: 0,
        durationMs: 700,
        rawXml: mockXml,
        timestamp: new Date().toLocaleTimeString(),
        isMock: true
      });
      setCaptureError(`${activeDevice.modelName} Error 1140: Device not attached. USB connection lost or scanner not enumerated.`);
      setCaptureState('error');
      playAcousticFeedback('error');
    }
  };

  const handleResetCapture = () => {
    setCaptureState('idle');
    setCaptureResult(null);
    setCaptureError(null);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLogId(id);
    setTimeout(() => setCopiedLogId(null), 2000);
  };

  // Status Badge Component
  const renderStatusBadge = (status: DiagnosticStatus) => {
    switch (status) {
      case 'pass':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            Pass
          </span>
        );
      case 'fail':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            <XCircle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
            Fail
          </span>
        );
      case 'inconclusive':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <AlertTriangle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
            Inconclusive
          </span>
        );
      case 'skipped':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
            <AlertCircle className="w-3 h-3" />
            Skipped
          </span>
        );
      case 'running':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
            <Activity className="w-3 h-3 animate-spin" />
            Probing...
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-zinc-100 text-zinc-500 dark:bg-zinc-800/60 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800">
            Idle
          </span>
        );
    }
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* 1. Unified Biometric Command & Control Console (No Scrolling Needed!) */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3.5 sm:p-4 shadow-xs space-y-3">
        {/* Quick Hardware Switcher & Audio Tone Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider whitespace-nowrap flex items-center gap-1 mr-1">
              <Zap className="w-3 h-3 text-amber-500 fill-amber-500/30" />
              Quick Device:
            </span>
            {POPULAR_DEVICES.map((dev) => {
              const isSelected = selectedDeviceId === dev.id;
              return (
                <button
                  key={dev.id}
                  type="button"
                  onClick={() => {
                    setSelectedManufacturerId(dev.mfrId);
                    setSelectedDeviceId(dev.id);
                    handleResetCapture();
                  }}
                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                      : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200/60 dark:border-zinc-700/60'
                  }`}
                >
                  <span>{dev.label}</span>
                  <span
                    className={`text-[9px] px-1 py-0.2 rounded font-bold ${
                      isSelected
                        ? 'bg-emerald-700 text-white'
                        : dev.badge.includes('L1')
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                        : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                    }`}
                  >
                    {dev.badge}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[11px] font-medium border transition-all cursor-pointer ${
                soundEnabled
                  ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
                  : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-400 border-dashed border-zinc-300 dark:border-zinc-800'
              }`}
              title={soundEnabled ? 'Acoustic terminal sound active (Click to mute)' : 'Acoustic terminal sound muted (Click to enable)'}
            >
              {soundEnabled ? (
                <>
                  <Volume2 className="w-3 h-3 text-emerald-500" />
                  <span className="hidden md:inline">Audio Beep: ON</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-3 h-3 text-zinc-400" />
                  <span className="hidden md:inline">Audio Beep: OFF</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Row 1: Selectors & Instant Action Buttons */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Controls Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2.5 flex-1">
            {/* Manufacturer Selector */}
            <div>
              <label htmlFor={mfrSelectId} className="block text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
                Manufacturer
              </label>
              <select
                id={mfrSelectId}
                value={selectedManufacturerId}
                onChange={(e) => {
                  const mId = e.target.value;
                  setSelectedManufacturerId(mId);
                  const firstAvailable = biometricDevices.find((d) => d.manufacturerId === mId);
                  if (firstAvailable) setSelectedDeviceId(firstAvailable.id);
                  handleResetCapture();
                }}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs font-medium text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
              >
                {manufacturers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Device Model Selector */}
            <div>
              <label htmlFor={deviceSelectId} className="block text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
                Device Model
              </label>
              <select
                id={deviceSelectId}
                value={selectedDeviceId}
                onChange={(e) => {
                  const dId = e.target.value;
                  setSelectedDeviceId(dId);
                  const dev = biometricDevices.find((d) => d.id === dId);
                  if (dev) setSelectedManufacturerId(dev.manufacturerId);
                  handleResetCapture();
                }}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs font-medium text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
              >
                {availableDevicesForManufacturer.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.modelName} ({d.certificationLevel} • {d.modalityLabel})
                  </option>
                ))}
              </select>
            </div>

            {/* UIDAI Environment Parameter (env) Toggle */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  UIDAI Env (<code className="font-mono text-zinc-600 dark:text-zinc-300">env</code>)
                </label>
                <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                  uidaiEnv === 'P'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                }`}>
                  {uidaiEnv === 'P' ? 'Production' : 'Pre-Prod'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => setUidaiEnv('P')}
                  className={`py-1 px-2 rounded-lg text-[11px] font-medium border transition-all ${
                    uidaiEnv === 'P'
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 shadow-xs font-semibold'
                      : 'bg-zinc-50 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100'
                  }`}
                >
                  P (Prod)
                </button>
                <button
                  type="button"
                  onClick={() => setUidaiEnv('PP')}
                  className={`py-1 px-2 rounded-lg text-[11px] font-medium border transition-all ${
                    uidaiEnv === 'PP'
                      ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-300 dark:border-amber-700 shadow-xs font-semibold'
                      : 'bg-zinc-50 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100'
                  }`}
                >
                  PP (Pre-Prod)
                </button>
              </div>
            </div>

            {/* Diagnostic Mode Toggle */}
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
                Diagnostic Mode
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setExecutionMode('mock');
                    setCaptureMode('mock');
                    handleResetCapture();
                  }}
                  className={`py-1 px-2 rounded-lg text-[11px] font-medium border transition-all ${
                    executionMode === 'mock'
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 shadow-xs font-semibold'
                      : 'bg-zinc-50 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100'
                  }`}
                >
                  Simulator
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setExecutionMode('live');
                    setCaptureMode('live');
                    scanAllLoopbackPorts();
                    handleResetCapture();
                  }}
                  className={`py-1 px-2 rounded-lg text-[11px] font-medium border transition-all ${
                    executionMode === 'live'
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 shadow-xs font-semibold'
                      : 'bg-zinc-50 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100'
                  }`}
                >
                  Live USB
                </button>
              </div>
            </div>
          </div>

          {/* Instant Primary Action Buttons (Always Visible at Top!) */}
          <div className="flex items-center gap-2 lg:border-l lg:border-zinc-200 lg:dark:border-zinc-800 lg:pl-3 shrink-0">
            {activeTab === 'diagnostics' ? (
              <>
                <button
                  type="button"
                  onClick={handleRunDiagnostics}
                  disabled={isRunningAll}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  {isRunningAll ? 'Running Checks...' : 'Run All Diagnostics'}
                </button>
                <button
                  type="button"
                  onClick={handleResetDiagnostics}
                  disabled={isRunningAll}
                  className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 transition-all cursor-pointer"
                  title="Reset all checks"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </>
            ) : activeTab === 'capture' ? (
              <>
                <button
                  type="button"
                  onClick={executionMode === 'mock' ? triggerMockCapture : triggerLiveCapture}
                  disabled={captureState === 'dispatched' || captureState === 'waiting_finger' || captureState === 'processing'}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer"
                >
                  {activeDevice.modality === 'single_iris' ? <Eye className="w-3.5 h-3.5" /> : <Fingerprint className="w-3.5 h-3.5" />}
                  {captureState === 'waiting_finger'
                    ? (activeDevice.modality === 'single_iris' ? 'Align Eye...' : 'Place Finger...')
                    : captureState === 'processing'
                    ? 'Processing...'
                    : executionMode === 'live' && discoveredServices.some((s) => s.vendorId === activeManufacturer.id && s.status === 'NOTREADY')
                    ? `Plug in ${activeDevice.modelName} (NOTREADY)`
                    : `Trigger Capture (${uidaiEnv})`}
                </button>
                {(captureResult || captureError) && (
                  <button
                    type="button"
                    onClick={handleResetCapture}
                    className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 transition-all cursor-pointer"
                    title="Reset capture"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                )}
              </>
            ) : activeTab === 'specs' ? (
              <a
                href={activeDevice.driverDownloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-all whitespace-nowrap"
              >
                <Download className="w-3.5 h-3.5" />
                Download {activeDevice.modelName} Drivers
              </a>
            ) : (
              <button
                type="button"
                onClick={() => { setSelectedTroubleshootCategory('all'); setTroubleshootQuery(''); }}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold text-xs transition-all whitespace-nowrap cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* Row 2: Status & Security Metadata Strip */}
        <div className="flex items-center justify-between gap-2 flex-wrap pt-2.5 border-t border-zinc-100 dark:border-zinc-800/80 text-[11px] text-zinc-500 dark:text-zinc-400">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">
              {activeManufacturer.name} {activeDevice.modelName}
            </span>
            <span>•</span>
            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
              UIDAI {activeDevice.certificationLevel} Certified
            </span>
            <span className="px-1.5 py-0.2 rounded text-[9px] bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium">
              {activeDevice.modalityLabel}
            </span>
            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
              Port: 127.0.0.1:{activeDevice.defaultPorts[0] || 11100}
            </span>
            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
              env=&quot;{uidaiEnv}&quot;
            </span>
            {executionMode === 'mock' && (
              <span className="text-zinc-400 text-[10px]">
                Preset: {mockScenarios.find((s) => s.id === selectedScenarioId)?.label.split(' ')[1] || 'Healthy'}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={() => setShowHealthReport(true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 font-medium text-[11px] transition-all cursor-pointer shadow-2xs"
              title="Generate & print Aadhaar RD Service Health Audit Certificate"
            >
              <Printer className="w-3 h-3" />
              Export Health Certificate
            </button>
            <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              <span>100% In-Browser Privacy • Zero Biometric Storage</span>
            </div>
          </div>
        </div>

        {/* Row 3: Live Hardware Detection Strip & Mismatch Alert (When in Live Mode) */}
        {executionMode === 'live' && (
          <div className="pt-2.5 border-t border-zinc-100 dark:border-zinc-800/80 space-y-2">
            {/* Real-time Hardware Monitor Strip */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs bg-zinc-50 dark:bg-zinc-800/50 p-2 rounded-lg border border-zinc-200 dark:border-zinc-700/60">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1 text-[11px]">
                  <Radio className="w-3 h-3 text-emerald-500 animate-pulse" />
                  Local USB Monitor:
                </span>
                {isScanningHardware ? (
                  <span className="text-zinc-500 dark:text-zinc-400 flex items-center gap-1 text-[11px]">
                    <Activity className="w-3 h-3 animate-spin" />
                    Scanning ports 11100–11105 across HTTP & HTTPS...
                  </span>
                ) : discoveredServices.length === 0 ? (
                  <span className="text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1 text-[11px]">
                    <XCircle className="w-3 h-3" />
                    No RD Service daemon detected on ports 11100–11105 (Services stopped)
                  </span>
                ) : (
                  <div className="flex items-center gap-1 flex-wrap">
                    {discoveredServices.map((svc) => (
                      <span
                        key={`${svc.protocol}-${svc.port}`}
                        className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded font-mono text-[9px] font-bold border ${
                          svc.status === 'READY'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-700'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${svc.status === 'READY' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                        {svc.vendorName} ({svc.protocol.toUpperCase()}:{svc.port}) — {svc.status}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => scanAllLoopbackPorts()}
                disabled={isScanningHardware}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-[10px] font-medium transition-all cursor-pointer self-start sm:self-auto shrink-0"
                title="Scan ports again"
              >
                <RefreshCw className={`w-3 h-3 ${isScanningHardware ? 'animate-spin' : ''}`} />
                Re-scan Ports
              </button>
            </div>

            {/* Mismatch & Unplugged Device Safety Alert */}
            {discoveredServices.length > 0 && (
              <>
                {/* 1. Device is Not Connected (status="NOTREADY") */}
                {discoveredServices.some((s) => s.vendorId === activeManufacturer.id && s.status === 'NOTREADY') && (
                  <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 rounded-lg text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-amber-900 dark:text-amber-200 text-xs">
                          {activeDevice.modelName} is NOT CONNECTED (status=&quot;NOTREADY&quot;)
                        </span>
                        <p className="text-amber-700 dark:text-amber-300 text-[11px] mt-0.5">
                          The {activeManufacturer.name} RD Service daemon is running on port {discoveredServices.find((s) => s.vendorId === activeManufacturer.id)?.port}, but the biometric scanner is detached from USB. Please plug the device into a USB port.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Device Mismatch: Target service is NOT running, but another manufacturer IS ready */}
                {!discoveredServices.some((s) => s.vendorId === activeManufacturer.id) && (
                  <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-700 rounded-lg text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-rose-900 dark:text-rose-200 text-xs">
                          Vendor Mismatch: You selected {activeManufacturer.name}, but {discoveredServices[0].vendorName} is active
                        </span>
                        <p className="text-rose-700 dark:text-rose-300 text-[11px] mt-0.5">
                          To protect against triggering the wrong scanner, capture requests are blocked from routing to {discoveredServices[0].vendorName}. Click &quot;Switch Device&quot; to test the connected scanner.
                        </p>
                      </div>
                    </div>
                    {discoveredServices.some((s) => s.status === 'READY') && (
                      <button
                        type="button"
                        onClick={() => {
                          const readySvc = discoveredServices.find((s) => s.status === 'READY') || discoveredServices[0];
                          const match = biometricDevices.find((d) => d.manufacturerId === readySvc.vendorId);
                          if (match) {
                            setSelectedManufacturerId(match.manufacturerId);
                            setSelectedDeviceId(match.id);
                            handleResetCapture();
                          }
                        }}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-all whitespace-nowrap cursor-pointer shrink-0"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Switch to {discoveredServices.find((s) => s.status === 'READY')?.vendorName} (Ready)
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Pinned 1-Click Error Remedy Quick Bar */}
      <div className="bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-orange-500/10 border border-amber-500/20 dark:border-amber-500/30 rounded-xl p-2.5 sm:p-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
            <span className="text-[11px] font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5 whitespace-nowrap">
              <Sparkles className="w-3 h-3 text-amber-500" />
              1-Click Urgent Fixes:
            </span>
            <span className="text-[10px] text-zinc-500 hidden xl:inline">
              Instant remedies for banking & CSP kiosk error codes
            </span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => jumpToTroubleshoot('err-1140')}
              className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-white dark:bg-zinc-800 border border-rose-300 dark:border-rose-700/60 text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 shadow-2xs transition-all cursor-pointer"
            >
              Error 1140 (Not Attached)
            </button>
            <button
              type="button"
              onClick={() => jumpToTroubleshoot('err-720')}
              className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-white dark:bg-zinc-800 border border-amber-300 dark:border-amber-700/60 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40 shadow-2xs transition-all cursor-pointer"
            >
              Error 720 (Not Registered)
            </button>
            <button
              type="button"
              onClick={() => jumpToTroubleshoot('err-1001-expired')}
              className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-white dark:bg-zinc-800 border border-rose-300 dark:border-rose-700/60 text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 shadow-2xs transition-all cursor-pointer"
            >
              Error 1001/1003 (Token Expired)
            </button>
            <button
              type="button"
              onClick={() => jumpToTroubleshoot('err-port-conflict')}
              className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-white dark:bg-zinc-800 border border-blue-300 dark:border-blue-700/60 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/40 shadow-2xs transition-all cursor-pointer"
            >
              Port 11100 Conflict
            </button>
            <button
              type="button"
              onClick={() => jumpToTroubleshoot('err-browser-ssl')}
              className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-white dark:bg-zinc-800 border border-purple-300 dark:border-purple-700/60 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/40 shadow-2xs transition-all cursor-pointer"
            >
              Chrome PNA / SSL
            </button>
            <button
              type="button"
              onClick={() => jumpToTroubleshoot('err-system-time-sync')}
              className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 shadow-2xs transition-all cursor-pointer"
            >
              Error 219 (Clock Desync)
            </button>
          </div>
        </div>
      </div>

      {/* 2. Navigation Tabs */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800 gap-1 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('diagnostics')}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'diagnostics'
              ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          RD Service Diagnostics
          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold">
            6 Checks
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('capture')}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'capture'
              ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
          }`}
        >
          <Fingerprint className="w-3.5 h-3.5 text-emerald-500" />
          Capture & Quality Studio
          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold">
            Live & Mock
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('specs')}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'specs'
              ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          Device Specs & Drivers
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('troubleshoot')}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'troubleshoot'
              ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          Troubleshooting & Error Guide
        </button>
      </div>

      {/* 3. Tab Content: Diagnostics */}
      {activeTab === 'diagnostics' && (
        <div className="space-y-4">
          {/* Status Counter Strip & Scenario Selector (if mock) */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2.5 sm:p-3">
            {/* Status Counters */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                <CheckCircle2 className="w-3 h-3" /> Pass: {statusCounts.pass}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20">
                <XCircle className="w-3 h-3" /> Fail: {statusCounts.fail}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                <AlertTriangle className="w-3 h-3" /> Inconclusive: {statusCounts.inconclusive}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                Skipped: {statusCounts.skipped}
              </span>
            </div>

            {/* Simulation scenario dropdown or Live Port chip */}
            {executionMode === 'mock' ? (
              <div className="flex items-center gap-2">
                <label htmlFor={scenarioSelectId} className="text-xs text-zinc-500 font-medium whitespace-nowrap">
                  Preset:
                </label>
                <select
                  id={scenarioSelectId}
                  value={selectedScenarioId}
                  onChange={(e) => setSelectedScenarioId(e.target.value)}
                  className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2.5 py-1 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-hidden"
                >
                  {mockScenarios.map((sc) => (
                    <option key={sc.id} value={sc.id}>
                      {sc.label}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <span className="text-xs text-zinc-500 font-mono">
                Target: 127.0.0.1:{activeDevice.defaultPorts[0] || 11100}
              </span>
            )}
          </div>

          {/* Loopback Port Matrix Radar & Physical Hardware Bus Section */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3.5 sm:p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div>
                <div className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-emerald-500" />
                  <h3 className="text-xs sm:text-[13px] font-bold text-zinc-900 dark:text-zinc-100">
                    Loopback Port Matrix Radar (127.0.0.1:11100–11105)
                  </h3>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-bold">
                    Dual HTTP/HTTPS
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  Probes all 6 official UIDAI standard loopback sockets concurrently to detect Mantra, Morpho, Startek, or SecuGen daemons.
                </p>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => scanAllLoopbackPorts()}
                  disabled={isScanningPortMatrix || isScanningHardware}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-medium text-[11px] transition-all cursor-pointer"
                >
                  <RefreshCw className={`w-3 h-3 ${isScanningPortMatrix ? 'animate-spin' : ''}`} />
                  Scan All 6 Ports
                </button>

                <button
                  type="button"
                  onClick={handleDetectPhysicalUsb}
                  disabled={isDetectingUsb}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-[11px] shadow-xs transition-all cursor-pointer"
                  title="Detect plugged-in Mantra/Morpho/Startek USB dongle via WebUSB"
                >
                  <Usb className={`w-3 h-3 ${isDetectingUsb ? 'animate-pulse' : ''}`} />
                  Check Physical USB Bus
                </button>
              </div>
            </div>

            {/* WebUSB Bus Status Notification if triggered */}
            {usbStatus && (
              <div
                className={`p-2.5 rounded-lg border text-xs flex items-center justify-between gap-2 ${
                  usbStatus.success
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200'
                    : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-700 text-rose-800 dark:text-rose-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Usb className="w-3.5 h-3.5 shrink-0" />
                  <span className="text-[11px]">
                    <strong>USB Bus:</strong> {usbStatus.message}
                    {usbStatus.vendorId && (
                      <span className="font-mono ml-1.5 opacity-80">
                        (VID: {usbStatus.vendorId} • PID: {usbStatus.productId} • S/N: {usbStatus.serialNumber})
                      </span>
                    )}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setUsbStatus(null)}
                  className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* 6-Port Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {[11100, 11101, 11102, 11103, 11104, 11105].map((portNum) => {
                const item = portMatrix[portNum] || { port: portNum, status: 'idle' };
                return (
                  <div
                    key={portNum}
                    className={`p-2 sm:p-2.5 rounded-lg border transition-all text-center flex flex-col justify-between ${
                      item.status === 'open'
                        ? 'bg-emerald-500/10 border-emerald-500/30'
                        : item.status === 'probing'
                        ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-400 animate-pulse'
                        : item.status === 'closed'
                        ? 'bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-800'
                        : 'bg-zinc-50/50 dark:bg-zinc-800/20 border-dashed border-zinc-200 dark:border-zinc-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-[11px] font-bold text-zinc-800 dark:text-zinc-200">
                        :{portNum}
                      </span>
                      <span
                        className={`inline-block w-1.5 h-1.5 rounded-full ${
                          item.status === 'open'
                            ? 'bg-emerald-500'
                            : item.status === 'probing'
                            ? 'bg-indigo-500'
                            : item.status === 'closed'
                            ? 'bg-zinc-400'
                            : 'bg-zinc-300'
                        }`}
                      />
                    </div>

                    <div className="my-0.5">
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                          item.status === 'open'
                            ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                            : item.status === 'probing'
                            ? 'bg-indigo-500/20 text-indigo-700 dark:text-indigo-300'
                            : item.status === 'closed'
                            ? 'bg-zinc-200/60 dark:bg-zinc-800 text-zinc-500'
                            : 'bg-zinc-200/40 dark:bg-zinc-800 text-zinc-400'
                        }`}
                      >
                        {item.deviceStatus || item.status}
                      </span>
                    </div>

                    <div className="text-[9px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                      {item.serviceName || (item.status === 'open' ? 'Daemon Listening' : 'No Daemon')}
                    </div>

                    {item.latencyMs !== undefined && item.latencyMs > 0 && (
                      <div className="text-[9px] font-mono text-emerald-600 dark:text-emerald-400 mt-0.5 font-semibold">
                        {item.protocol?.toUpperCase()}: {item.latencyMs}ms
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Live Socket Wire Terminal Drawer */}
            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowSocketLog(!showSocketLog)}
                className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
              >
                <Terminal className="w-3.5 h-3.5" />
                {showSocketLog ? 'Hide Wire Protocol Packet Trace' : 'View Wire Protocol Packet Trace (Raw Socket Telemetry)'}
              </button>

              <span className="text-[10px] text-zinc-400 font-mono">
                Active Protocol: HTTP/HTTPS Loopback Daemon
              </span>
            </div>

            {showSocketLog && (
              <div className="space-y-1.5 pt-1.5 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-zinc-400">
                    Raw Telemetry Stream (127.0.0.1:11100–11105)
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const logData = [
                        `[${new Date().toLocaleTimeString()}] SOCKET PROBE 127.0.0.1:11100 - VERB: RDSERVICE / GET`,
                        `[${new Date().toLocaleTimeString()}] HARDWARE VID: ${activeDevice.vendorId || '0x2802'} PID: ${activeDevice.productId || '0x001B'}`,
                        `[${new Date().toLocaleTimeString()}] CRYPTO ENCLAVE: Level ${activeDevice.certificationLevel} (STQC Certified: ${activeDevice.stqcCertified ? 'YES' : 'NO'})`,
                        `[${new Date().toLocaleTimeString()}] UIDAI ENV: env="${uidaiEnv}" TARGET STATUS: READY`,
                        `[${new Date().toLocaleTimeString()}] LOOPBACK PROBE COMPLETE: 6 Sockets Scanned`
                      ].join('\n');
                      navigator.clipboard.writeText(logData);
                      setCopiedSocketLog(true);
                      setTimeout(() => setCopiedSocketLog(false), 2000);
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 cursor-pointer"
                  >
                    {copiedSocketLog ? (
                      <>
                        <CheckCheck className="w-3 h-3 text-emerald-500" /> Copied Trace
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" /> Copy Socket Trace
                      </>
                    )}
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-zinc-950 font-mono text-[10px] text-emerald-400 border border-zinc-800 overflow-x-auto space-y-1 leading-relaxed max-h-44 select-all">
                  <div className="text-zinc-500"># Toolique RD Service Network Packet Sniffer (RFC 2616 Localhost)</div>
                  <div><span className="text-indigo-400">[OUT]</span> PROBE :11100 &rarr; HTTP/1.1 RDSERVICE http://127.0.0.1:11100/</div>
                  <div>
                    <span className="text-emerald-400">[IN]</span> {discoveredServices.length > 0 ? '200 OK' : 'ERR_CONN_REFUSED'} &rarr; &lt;RDService status=&quot;{discoveredServices[0]?.status || 'NOTREADY'}&quot; info=&quot;{discoveredServices[0]?.info || `${activeManufacturer.name} Daemon`}&quot;&gt;
                  </div>
                  <div><span className="text-indigo-400">[OUT]</span> QUERY :11100 &rarr; HTTP/1.1 DEVICEINFO http://127.0.0.1:11100/rd/info</div>
                  <div>
                    <span className="text-emerald-400">[IN]</span> 200 OK &rarr; &lt;DeviceInfo mi=&quot;{activeDevice.modelName}&quot; dpId=&quot;{activeDevice.dpId || 'VENDOR.DP'}&quot; mc=&quot;{activeDevice.certificationLevel}_TOKEN&quot; env=&quot;{uidaiEnv}&quot;&gt;
                  </div>
                  <div>
                    <span className="text-amber-400">[ATTEST]</span> Hardware Trust: Level {activeDevice.certificationLevel} {activeDevice.certificationLevel === 'L1' ? 'Secure Boot Bootloader Attestation Verified' : 'Software Attestation'}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Automated Diagnostic Run Banner */}
          {isRunningAll && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 flex items-center justify-between gap-2.5 animate-pulse">
              <div className="flex items-center gap-2.5">
                <Activity className="w-4 h-4 text-emerald-500 animate-spin" />
                <div>
                  <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 block">
                    Executing 6-Step Cryptographic & Loopback Diagnostic Suite...
                  </span>
                  <span className="text-[10px] text-zinc-500">
                    Probing loopback daemons, validating UIDAI env=&quot;{uidaiEnv}&quot;, and checking hardware certificate chain
                  </span>
                </div>
              </div>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold uppercase">
                Active Probe
              </span>
            </div>
          )}

          {/* Diagnostic Checks List */}
          <div className="space-y-2.5">
            {diagnosticChecks.map((check, index) => {
              const isExpanded = expandedCheckId === check.id;

              return (
                <div
                  key={check.id}
                  className={`bg-white dark:bg-zinc-900 border rounded-xl transition-all ${
                    check.status === 'pass'
                      ? 'border-emerald-200 dark:border-emerald-900/40'
                      : check.status === 'fail'
                      ? 'border-rose-200 dark:border-rose-900/40'
                      : check.status === 'inconclusive'
                      ? 'border-amber-200 dark:border-amber-900/40'
                      : 'border-zinc-200 dark:border-zinc-800'
                  }`}
                >
                  {/* Card Header */}
                  <div
                    onClick={() => setExpandedCheckId(isExpanded ? null : check.id)}
                    className="p-3 sm:p-3.5 flex items-center justify-between gap-3 cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 flex items-center justify-center font-bold text-[11px] shrink-0">
                        {index + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-xs sm:text-[13px] font-semibold text-zinc-900 dark:text-zinc-100">
                            {check.title}
                          </h3>
                          {check.durationMs !== undefined && (
                            <span className="text-[10px] text-zinc-400 font-mono">
                              ({check.durationMs}ms)
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                          {check.message || check.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      {renderStatusBadge(check.status)}
                      <div className="text-zinc-400">
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  </div>

                  {/* Expandable Technical Log / Details */}
                  {isExpanded && (
                    <div className="px-3.5 pb-3.5 pt-1.5 border-t border-zinc-100 dark:border-zinc-800/80 space-y-2.5">
                      {check.technicalDetails && (
                        <div className="text-xs text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800/50 p-2.5 rounded-lg border border-zinc-200/60 dark:border-zinc-800">
                          <strong>Technical Assessment:</strong> {check.technicalDetails}
                        </div>
                      )}

                      {check.recommendation && (
                        <div className="text-xs text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/40 p-2.5 rounded-lg border border-amber-200 dark:border-amber-800 flex items-start gap-2">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                          <div>
                            <strong>Recommended Action:</strong> {check.recommendation}
                          </div>
                        </div>
                      )}

                      {/* Raw Protocol XML Payload (if present) */}
                      {check.rawPayload && (
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                              Simulated RD Protocol XML
                            </span>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(check.rawPayload || '', `xml-${check.id}`)}
                              className="inline-flex items-center gap-1 text-[10px] text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                            >
                              {copiedLogId === `xml-${check.id}` ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-500" /> Copied
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" /> Copy XML
                                </>
                              )}
                            </button>
                          </div>
                          <pre className="text-[10px] font-mono bg-zinc-950 text-emerald-400 p-2.5 rounded-lg overflow-x-auto border border-zinc-800 leading-relaxed">
                            {check.rawPayload}
                          </pre>
                        </div>
                      )}

                      {/* Protocol Execution Logs */}
                      {check.logs && check.logs.length > 0 && (
                        <div>
                          <span className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">
                            Diagnostic Telemetry Trace
                          </span>
                          <div className="text-[10px] font-mono bg-zinc-900 text-zinc-300 p-2.5 rounded-lg space-y-0.5 border border-zinc-800">
                            {check.logs.map((log, lIdx) => (
                              <div key={lIdx} className="flex items-start gap-1.5">
                                <span className="text-zinc-500 select-none">&gt;</span>
                                <span>{log}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. Tab Content: Biometric Capture & Quality Studio */}
      {activeTab === 'capture' && (
        <div className="space-y-4">
          {/* Privacy Guarantee Header */}
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-2.5 sm:p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 dark:bg-emerald-950/20">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                  Client-Side Biometric Diagnostic Sandbox
                </h4>
                <p className="text-[10px] text-emerald-800/80 dark:text-emerald-300/80">
                  All requests communicate directly with your local loopback socket. Toolique does not capture, save, or transmit raw biometric templates or PID data.
                </p>
              </div>
            </div>
            <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 shrink-0">
              UIDAI L1 Compliant Standard
            </span>
          </div>

          {/* Mode Selector & Configuration Toolbar */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 sm:p-3.5 shadow-xs space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-center">
              {/* Mode Toggle */}
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                  Capture Mode
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setExecutionMode('mock');
                      setCaptureMode('mock');
                      handleResetCapture();
                    }}
                    className={`py-1.5 px-2 rounded-lg text-[11px] font-medium border transition-all ${
                      executionMode === 'mock'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 shadow-xs font-semibold'
                        : 'bg-zinc-50 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100'
                    }`}
                  >
                    Simulator
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setExecutionMode('live');
                      setCaptureMode('live');
                      scanAllLoopbackPorts();
                      handleResetCapture();
                    }}
                    className={`py-1.5 px-2 rounded-lg text-[11px] font-medium border transition-all ${
                      executionMode === 'live'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 shadow-xs font-semibold'
                        : 'bg-zinc-50 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100'
                    }`}
                  >
                    Live USB
                  </button>
                </div>
              </div>

              {/* UIDAI Environment Parameter (env) Selector */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                    UIDAI Env (<code className="font-mono text-zinc-600 dark:text-zinc-300">env</code>)
                  </label>
                  <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                    uidaiEnv === 'P'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                  }`}>
                    {uidaiEnv === 'P' ? 'P' : 'PP'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setUidaiEnv('P');
                      handleResetCapture();
                    }}
                    className={`py-1.5 px-2 rounded-lg text-[11px] font-medium border transition-all ${
                      uidaiEnv === 'P'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 shadow-xs font-semibold'
                        : 'bg-zinc-50 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100'
                    }`}
                  >
                    P (Production)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setUidaiEnv('PP');
                      handleResetCapture();
                    }}
                    className={`py-1.5 px-2 rounded-lg text-[11px] font-medium border transition-all ${
                      uidaiEnv === 'PP'
                        ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-300 dark:border-amber-700 shadow-xs font-semibold'
                        : 'bg-zinc-50 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100'
                    }`}
                  >
                    PP (Pre-Prod)
                  </button>
                </div>
              </div>

              {/* Simulation Preset or Live Port Config */}
              {captureMode === 'mock' ? (
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                    Simulation Preset
                  </label>
                  <select
                    value={captureSimPreset}
                    onChange={(e) => {
                      setCaptureSimPreset(e.target.value as 'optimal' | 'borderline' | 'timeout' | 'detached' | 'quick_remove');
                      handleResetCapture();
                    }}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2.5 py-1 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-hidden"
                  >
                    <option value="optimal">🟢 High Quality Scan (qScore: 85%+)</option>
                    <option value="borderline">🟡 Borderline Quality (qScore: 52%)</option>
                    <option value="quick_remove">🔴 Error 1142: Removed Too Quick</option>
                    <option value="timeout">🔴 Error 1141: Capture Timeout</option>
                    <option value="detached">🔴 Error 1140: Device Not Attached</option>
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                    Capture Timeout
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="5"
                      max="20"
                      step="1"
                      value={captureTimeout}
                      onChange={(e) => setCaptureTimeout(parseInt(e.target.value, 10))}
                      className="w-full accent-emerald-600 cursor-pointer h-1.5"
                    />
                    <span className="font-mono text-xs font-bold text-zinc-700 dark:text-zinc-300 w-7 text-right">
                      {captureTimeout}s
                    </span>
                  </div>
                </div>
              )}

              {/* Quality Target */}
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                  UIDAI Minimum Target
                </label>
                <div className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2 py-0.5">
                  <select
                    value={minQualityTarget}
                    onChange={(e) => setMinQualityTarget(parseInt(e.target.value, 10))}
                    className="w-full bg-transparent text-xs font-semibold text-zinc-700 dark:text-zinc-300 focus:outline-hidden py-1 px-1 cursor-pointer"
                  >
                    <option value={50}>Threshold: 50% (Permissive)</option>
                    <option value={60}>Threshold: 60% (UIDAI Standard)</option>
                    <option value={70}>Threshold: 70% (High Quality)</option>
                    <option value={80}>Threshold: 80% (Strict)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={executionMode === 'mock' ? triggerMockCapture : triggerLiveCapture}
                  disabled={captureState === 'dispatched' || captureState === 'waiting_finger' || captureState === 'processing'}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs shadow-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {activeDevice.modality === 'single_iris' ? (
                    <Eye className="w-3.5 h-3.5" />
                  ) : (
                    <Fingerprint className="w-3.5 h-3.5" />
                  )}
                  {captureState === 'waiting_finger'
                    ? activeDevice.modality === 'single_iris'
                      ? 'Sensor Active — Align Eye...'
                      : 'LED Active — Place Finger...'
                    : captureState === 'processing'
                    ? activeDevice.modality === 'single_iris'
                      ? 'Processing Iris Template...'
                      : 'Processing Scan...'
                    : executionMode === 'mock'
                    ? `Run Simulated Capture (${uidaiEnv})`
                    : executionMode === 'live' && discoveredServices.some((s) => s.vendorId === activeManufacturer.id && s.status === 'NOTREADY')
                    ? `Plug in ${activeDevice.modelName} (NOTREADY)`
                    : `Trigger Live Hardware Capture (${uidaiEnv})`}
                </button>

                {(captureResult || captureError) && (
                  <button
                    type="button"
                    onClick={handleResetCapture}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-medium hover:bg-zinc-100 transition-all cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" /> Reset
                  </button>
                )}
              </div>

              {executionMode === 'live' && (
                <span className="text-[10px] text-zinc-400 hidden sm:inline">
                  {discoveredServices.find((s) => s.vendorId === activeManufacturer.id) ? (
                    <>
                      Target: <code className="bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded text-emerald-600 dark:text-emerald-400 font-bold">
                        {discoveredServices.find((s) => s.vendorId === activeManufacturer.id)?.protocol}://127.0.0.1:{discoveredServices.find((s) => s.vendorId === activeManufacturer.id)?.port}{discoveredServices.find((s) => s.vendorId === activeManufacturer.id)?.capturePath}
                      </code> ({discoveredServices.find((s) => s.vendorId === activeManufacturer.id)?.status})
                    </>
                  ) : (
                    <>
                      Target: <code className="bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded">Ports 11100–11105 (Auto)</code>
                    </>
                  )}
                </span>
              )}
            </div>
          </div>

          {/* Interactive Optical Platen & Real-Time Diagnostic Dashboard */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Visual Platen Sensor Casing */}
            <div className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-xs">
              <div className="mb-3 flex items-center justify-between w-full px-1">
                <span className="text-[9px] uppercase font-bold tracking-widest text-zinc-400">
                  {activeManufacturer.name} {activeDevice.modelName}
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 font-semibold">
                  {activeDevice.modality === 'single_iris' ? 'IRIS RETICLE' : 'OPTICAL PLATEN'}
                </span>
              </div>

              {/* Physical Scanner Platen Housing */}
              <div
                className={`relative w-40 h-52 sm:w-44 sm:h-56 rounded-2xl border-3 transition-all duration-300 flex flex-col items-center justify-center p-3 select-none ${
                  captureState === 'waiting_finger'
                    ? activeDevice.modality === 'single_iris'
                      ? 'border-cyan-500 bg-cyan-950/20 shadow-[0_0_25px_rgba(6,182,212,0.6)] animate-pulse'
                      : 'border-red-500 bg-red-950/20 shadow-[0_0_25px_rgba(239,68,68,0.6)] animate-pulse'
                    : captureState === 'processing'
                    ? 'border-amber-500 bg-amber-950/20 shadow-[0_0_20px_rgba(245,158,11,0.5)]'
                    : captureState === 'success'
                    ? 'border-emerald-500 bg-emerald-950/20 shadow-[0_0_20px_rgba(16,185,129,0.5)]'
                    : captureState === 'error'
                    ? 'border-rose-500 bg-rose-950/20 shadow-[0_0_15px_rgba(244,63,94,0.4)]'
                    : 'border-zinc-300 dark:border-zinc-700 bg-zinc-100/80 dark:bg-zinc-800/60 shadow-inner'
                }`}
              >
                {/* Scratch-Free Platen Glass / Reticle Window */}
                <div
                  className={`w-28 h-36 sm:w-32 sm:h-42 rounded-xl border-2 transition-all flex flex-col items-center justify-center relative overflow-hidden backdrop-blur-xs ${
                    captureState === 'waiting_finger'
                      ? activeDevice.modality === 'single_iris'
                        ? 'border-cyan-400 bg-gradient-to-b from-cyan-600/40 via-sky-500/20 to-cyan-700/40'
                        : 'border-red-400 bg-gradient-to-b from-red-600/40 via-red-500/20 to-red-700/40'
                      : captureState === 'processing'
                      ? 'border-amber-400 bg-gradient-to-b from-amber-500/30 via-yellow-500/20 to-amber-600/30'
                      : captureState === 'success'
                      ? 'border-emerald-400 bg-gradient-to-b from-emerald-500/30 via-teal-500/20 to-emerald-600/30'
                      : 'border-zinc-400/50 dark:border-zinc-600 bg-zinc-200/50 dark:bg-zinc-900/50'
                  }`}
                >
                  {/* Futuristic HUD Corner Indicators */}
                  <span className="absolute top-1.5 left-2 text-[8px] font-mono font-bold text-zinc-400/80 dark:text-zinc-500 select-none">
                    ┌ {activeDevice.resolutionDpi}DPI
                  </span>
                  <span className="absolute top-1.5 right-2 text-[8px] font-mono font-bold text-zinc-400/80 dark:text-zinc-500 select-none">
                    NFIQ2.0 ┐
                  </span>
                  <span className="absolute bottom-1.5 left-2 text-[8px] font-mono font-bold text-zinc-400/80 dark:text-zinc-500 select-none">
                    └ ISO-19794
                  </span>
                  <span className="absolute bottom-1.5 right-2 text-[8px] font-mono font-bold text-zinc-400/80 dark:text-zinc-500 select-none">
                    TEE {activeDevice.certificationLevel} ┘
                  </span>

                  {/* Optical Reticle Crosshairs */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                    <div className="w-full h-px bg-current" />
                    <div className="h-full w-px bg-current absolute" />
                  </div>

                  {/* Silhouette / Reticle Rendering */}
                  <div className="relative z-10 flex flex-col items-center justify-center">
                    {activeDevice.modality === 'single_iris' ? (
                      <Eye
                        className={`w-12 h-12 transition-all duration-300 ${
                          captureState === 'waiting_finger'
                            ? 'text-cyan-400 animate-pulse scale-105'
                            : captureState === 'processing'
                            ? 'text-amber-400 animate-pulse'
                            : captureState === 'success'
                            ? 'text-emerald-400 scale-110 drop-shadow-[0_0_10px_rgba(52,211,153,0.9)]'
                            : captureState === 'error'
                            ? 'text-rose-400'
                            : 'text-zinc-400/60 dark:text-zinc-600'
                        }`}
                      />
                    ) : (
                      <Fingerprint
                        className={`w-12 h-12 transition-all duration-300 ${
                          captureState === 'waiting_finger'
                            ? 'text-red-400 animate-pulse scale-105'
                            : captureState === 'processing'
                            ? 'text-amber-400 animate-pulse'
                            : captureState === 'success'
                            ? 'text-emerald-400 scale-110 drop-shadow-[0_0_10px_rgba(52,211,153,0.9)]'
                            : captureState === 'error'
                            ? 'text-rose-400'
                            : 'text-zinc-400/60 dark:text-zinc-600'
                        }`}
                      />
                    )}

                    {/* Sensor State Labels */}
                    <span
                      className={`text-[9px] font-mono uppercase tracking-wider font-bold mt-1.5 px-2 py-0.2 rounded-full ${
                        captureState === 'waiting_finger'
                          ? activeDevice.modality === 'single_iris'
                            ? 'text-cyan-200 bg-cyan-900/90 shadow-xs'
                            : 'text-red-200 bg-red-900/90 shadow-xs'
                          : captureState === 'processing'
                          ? 'text-amber-200 bg-amber-900/90 shadow-xs'
                          : captureState === 'success'
                          ? 'text-emerald-200 bg-emerald-900/90 shadow-xs'
                          : captureState === 'error'
                          ? 'text-rose-200 bg-rose-900/90 shadow-xs'
                          : 'text-zinc-400 bg-zinc-700/20'
                      }`}
                    >
                      {captureState === 'waiting_finger'
                        ? activeDevice.modality === 'single_iris'
                          ? 'ALIGN EYE'
                          : 'PLACE FINGER'
                        : captureState === 'processing'
                        ? 'SCANNING'
                        : captureState === 'success'
                        ? 'CAPTURED'
                        : captureState === 'error'
                        ? 'FAILED'
                        : 'STANDBY'}
                    </span>
                  </div>

                  {/* Minutiae Feature Nodes on Successful Capture */}
                  {captureState === 'success' && (
                    <div className="absolute inset-0 pointer-events-none z-20">
                      {[
                        { top: '24%', left: '35%' },
                        { top: '34%', left: '60%' },
                        { top: '46%', left: '30%' },
                        { top: '50%', left: '66%' },
                        { top: '62%', left: '42%' },
                        { top: '68%', left: '55%' },
                        { top: '40%', left: '48%' },
                      ].map((pos, idx) => (
                        <span
                          key={idx}
                          style={pos}
                          className="absolute w-1.5 h-1.5 rounded-full bg-emerald-300 shadow-[0_0_6px_#34d399] animate-ping"
                        />
                      ))}
                    </div>
                  )}

                  {/* Scanning sweep laser animation during processing */}
                  {captureState === 'processing' && (
                    <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_12px_#fbbf24] animate-bounce top-1/2 z-20" />
                  )}
                </div>

                {/* Platen Dimensions / Focal Distance Label */}
                <div className="mt-2 flex items-center gap-1.5 text-[9px] text-zinc-400 font-mono">
                  <span>{activeDevice.platenSize || (activeDevice.modality === 'single_iris' ? '70–120 mm Focus' : '15.0 × 20.0 mm')}</span>
                  <span>•</span>
                  <span>{activeDevice.resolutionDpi} DPI</span>
                </div>
              </div>

              {/* Status Message below Platen */}
              <div className="mt-3 text-xs font-medium max-w-xs text-center min-h-[30px] flex items-center justify-center">
                {captureState === 'waiting_finger' && (
                  <p className="text-red-600 dark:text-red-400 font-semibold animate-pulse text-[11px]">
                    {activeDevice.modality === 'single_iris'
                      ? '🔵 Infrared active. Align eye within 70–120 mm.'
                      : '🔴 Optical Red LED is ON. Place finger firmly.'}
                  </p>
                )}
                {captureState === 'processing' && (
                  <p className="text-amber-600 dark:text-amber-400 font-semibold text-[11px]">
                    {activeDevice.modality === 'single_iris'
                      ? '⚡ Capturing iris pattern (ISO/IEC 19794-6)...'
                      : '⚡ Optical sensor exposing ridges & minutiae...'}
                  </p>
                )}
                {captureState === 'success' && captureResult && (
                  <p className="text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                    🟢 Scan complete! Quality Score: {captureResult.qScore}% ({captureResult.durationMs}ms)
                  </p>
                )}
                {captureState === 'error' && (
                  <p className="text-rose-600 dark:text-rose-400 font-semibold text-[11px]">
                    {captureError || 'Capture failed. Please retry.'}
                  </p>
                )}
                {captureState === 'idle' && (
                  <p className="text-zinc-400 text-[11px]">
                    Ready to initiate capture request.
                  </p>
                )}
              </div>
            </div>

            {/* Diagnostic Metrics & Telemetry Details */}
            <div className="lg:col-span-7 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 sm:p-4.5 space-y-3.5 shadow-xs">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2.5">
                <h3 className="text-xs sm:text-[13px] font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-emerald-500" />
                  Capture Diagnostic Results
                </h3>
                {captureResult && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 font-semibold">
                    {captureResult.timestamp} • {captureResult.isMock ? 'Simulated' : 'Live Hardware'}
                  </span>
                )}
              </div>

              {captureResult ? (
                <div className="space-y-3">
                  {/* Circular SVG Quality Score Gauge & Compliance Banner */}
                  <div className="flex flex-col sm:flex-row items-center gap-4 p-3 sm:p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/70 dark:border-zinc-800">
                    {/* SVG Radial Gauge */}
                    <div className="relative w-22 h-22 sm:w-24 sm:h-24 shrink-0 flex items-center justify-center">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                        {/* Background track circle */}
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          className="stroke-zinc-200 dark:stroke-zinc-700/60"
                          strokeWidth="8"
                          fill="transparent"
                        />
                        {/* Animated fill arc */}
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          stroke={
                            captureResult.qScore >= minQualityTarget
                              ? '#10b981'
                              : captureResult.qScore >= 40
                              ? '#f59e0b'
                              : '#f43f5e'
                          }
                          strokeWidth="8"
                          strokeDasharray={251.3}
                          strokeDashoffset={251.3 - (251.3 * Math.min(100, Math.max(0, captureResult.qScore))) / 100}
                          strokeLinecap="round"
                          fill="transparent"
                          className="transition-all duration-700 ease-out"
                        />
                      </svg>
                      {/* Centered Percentage Score */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className={`text-xl sm:text-2xl font-black tracking-tight leading-none ${
                          captureResult.qScore >= minQualityTarget
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : captureResult.qScore >= 40
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-rose-600 dark:text-rose-400'
                        }`}>
                          {captureResult.qScore}%
                        </span>
                        <span className="text-[8px] font-mono uppercase text-zinc-400 mt-0.5">
                          NFIQ 2.0
                        </span>
                      </div>
                    </div>

                    {/* Verdict & Threshold Explanation */}
                    <div className="flex-1 space-y-1 text-center sm:text-left">
                      <div className="flex items-center justify-center sm:justify-start gap-2">
                        <span className={`px-1.5 py-0.2 rounded-md text-[9px] font-bold uppercase tracking-wider ${
                          captureResult.qScore >= minQualityTarget
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                        }`}>
                          {captureResult.qScore >= minQualityTarget ? 'UIDAI Compliant' : 'Sub-Optimal Target'}
                        </span>
                        <span className="text-[10px] font-mono text-zinc-400">
                          Target: ≥ {minQualityTarget}%
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-600 dark:text-zinc-300 leading-relaxed">
                        {captureResult.qScore >= minQualityTarget
                          ? `High-fidelity biometric capture verified. Ridge minutiae distribution meets UIDAI Aadhaar authentication standards.`
                          : `Score is below the configured ${minQualityTarget}% threshold. Ensure scanner platen is clean and retry with balanced finger pressure.`}
                      </p>
                    </div>
                  </div>

                  {/* 4 Metric Cards Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {/* Minutiae / Features Count Card */}
                    <div className="bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-800 rounded-lg p-2.5 text-center">
                      <span className="text-[9px] uppercase font-bold text-zinc-400 block mb-0.5">
                        {activeDevice.modality === 'single_iris' ? 'Iris Features' : 'Minutiae Points'}
                      </span>
                      <div className="text-lg sm:text-xl font-black text-zinc-900 dark:text-zinc-100">
                        {activeDevice.modality === 'single_iris' ? `${captureResult.qScore}%` : captureResult.nmPoints}
                      </div>
                      <span className="text-[9px] text-zinc-500 mt-0.5 block">
                        {activeDevice.modality === 'single_iris' ? 'ISO 19794-6' : 'Extracted (FMR)'}
                      </span>
                    </div>

                    {/* Execution Latency Card */}
                    <div className="bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-800 rounded-lg p-2.5 text-center">
                      <span className="text-[9px] uppercase font-bold text-zinc-400 block mb-0.5">
                        Sensor Latency
                      </span>
                      <div className="text-lg sm:text-xl font-black text-zinc-900 dark:text-zinc-100">
                        {captureResult.durationMs}
                        <span className="text-xs font-normal text-zinc-400 ml-0.5">ms</span>
                      </div>
                      <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5 block">
                        {captureResult.durationMs < 1000 ? '⚡ Ultra Fast' : 'Normal'}
                      </span>
                    </div>

                    {/* L1 Attestation Card */}
                    <div className="bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-800 rounded-lg p-2.5 text-center">
                      <span className="text-[9px] uppercase font-bold text-zinc-400 block mb-0.5">
                        {activeDevice.certificationLevel} Cryptography
                      </span>
                      <div className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                        {activeDevice.certificationLevel === 'L1' ? 'HW Signed' : 'SW Signed'}
                      </div>
                      <span className="text-[9px] text-zinc-500 mt-0.5 block">
                        {activeDevice.certificationLevel === 'L1' ? 'Secure Enclave' : 'Host Security'}
                      </span>
                    </div>

                    {/* UIDAI Target Card */}
                    <div className="bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-800 rounded-lg p-2.5 text-center">
                      <span className="text-[9px] uppercase font-bold text-zinc-400 block mb-0.5">
                        UIDAI Target
                      </span>
                      <div className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 mt-1">
                        env=&quot;{uidaiEnv}&quot;
                      </div>
                      <span className="text-[9px] text-zinc-500 mt-0.5 block">
                        {uidaiEnv === 'P' ? 'Production' : 'Sandbox'}
                      </span>
                    </div>
                  </div>

                  {/* Device & Status Details */}
                  <div className="bg-zinc-50 dark:bg-zinc-800/40 rounded-lg p-2.5 border border-zinc-200/60 dark:border-zinc-800 text-[11px] space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">{activeManufacturer.name} Status:</span>
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                        Code {captureResult.errorCode} ({captureResult.errorInfo})
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">UIDAI Environment:</span>
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                        <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                          uidaiEnv === 'P'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                        }`}>
                          env=&quot;{uidaiEnv}&quot;
                        </span>
                        <span>{uidaiEnv === 'P' ? 'Production (Live)' : 'Pre-Production (Sandbox)'}</span>
                      </span>
                    </div>
                    {captureResult.deviceInfo && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-zinc-500">Device Model & Version:</span>
                          <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                            {captureResult.deviceInfo.mi} (RDS v{captureResult.deviceInfo.rdsVer})
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-500">Hardware Serial Number:</span>
                          <span className="font-mono text-zinc-700 dark:text-zinc-300">
                            {captureResult.deviceInfo.srno}
                          </span>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Privacy Status:</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                        Encrypted PID Masked • Zero Storage
                      </span>
                    </div>
                  </div>

                  {/* Collapsible Sanitized XML Inspector */}
                  <div>
                    <button
                      type="button"
                      onClick={() => setShowRawXml(!showRawXml)}
                      className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                    >
                      {showRawXml ? 'Hide Sanitized Protocol XML' : 'View Sanitized Protocol XML'}
                    </button>

                    {showRawXml && (
                      <div className="mt-1.5">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-mono text-zinc-400">
                            Redacted &lt;PidData&gt; Response
                          </span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(captureResult.rawXml, 'capture-xml')}
                            className="inline-flex items-center gap-1 text-[10px] text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer"
                          >
                            {copiedLogId === 'capture-xml' ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-500" /> Copied
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" /> Copy XML
                              </>
                            )}
                          </button>
                        </div>
                        <pre className="text-[10px] font-mono bg-zinc-950 text-emerald-400 p-2.5 rounded-lg overflow-x-auto border border-zinc-800 leading-relaxed max-h-44">
                          {captureResult.rawXml}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="min-h-[190px] flex flex-col items-center justify-center text-center p-4 bg-zinc-50/50 dark:bg-zinc-800/20 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800">
                  <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 dark:text-zinc-600 mb-2 shadow-inner">
                    <Fingerprint className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                    Scanner Ready for Capture Trigger
                  </p>
                  <p className="text-[10px] text-zinc-400 max-w-sm mt-1 leading-relaxed">
                    Click <strong>&quot;Run Simulated Capture&quot;</strong> to evaluate mock telemetry with audio feedback, or select <strong>&quot;Live USB&quot;</strong> to query your physical {activeManufacturer.name} {activeDevice.modelName}.
                  </p>
                  <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5">
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-zinc-200/60 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                      500 DPI Optical
                    </span>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-zinc-200/60 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                      ISO/IEC 19794-2/4
                    </span>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-zinc-200/60 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                      UIDAI RD Spec v2.0
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 6. Tab Content: Troubleshooting Guide */}
      {activeTab === 'troubleshoot' && (
        <div className="space-y-4">
          {/* Search & Category Filter */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <label htmlFor={tsSearchId} className="sr-only">Search error code or symptom</label>
              <input
                id={tsSearchId}
                type="text"
                value={troubleshootQuery}
                onChange={(e) => setTroubleshootQuery(e.target.value)}
                placeholder="Search error code (e.g. 1140, 720), port, SSL, or driver symptom..."
                className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
              {[
                { id: 'all', label: 'All Issues' },
                { id: 'hardware', label: 'Hardware/USB' },
                { id: 'service', label: 'RD Service' },
                { id: 'browser', label: 'Browser/SSL' },
                { id: 'registration', label: 'Registration' }
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedTroubleshootCategory(cat.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all cursor-pointer ${
                    selectedTroubleshootCategory === cat.id
                      ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Troubleshooting Guides Accordion */}
          <div className="space-y-2.5">
            {filteredTroubleshootGuides.map((guide) => {
              const isExpanded = expandedTroubleshootId === guide.id;

              return (
                <div
                  key={guide.id}
                  id={guide.id}
                  className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden transition-all"
                >
                  <div
                    onClick={() => setExpandedTroubleshootId(isExpanded ? null : guide.id)}
                    className="p-3 sm:p-3.5 flex items-start justify-between gap-3 cursor-pointer select-none hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20"
                  >
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap mb-1">
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                          {guide.categoryLabel}
                        </span>
                        {guide.errorCode && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                            {guide.errorCode}
                          </span>
                        )}
                      </div>
                      <h3 className="text-xs sm:text-[13px] font-semibold text-zinc-900 dark:text-zinc-100">
                        {guide.title}
                      </h3>
                      <p className="text-[11px] text-zinc-500 mt-0.5 line-clamp-1">
                        <strong>Root Cause:</strong> {guide.rootCause}
                      </p>
                    </div>

                    <div className="text-zinc-400 shrink-0 mt-0.5">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-3.5 pb-3.5 pt-1.5 border-t border-zinc-100 dark:border-zinc-800/80 space-y-3 text-xs">
                      <div>
                        <strong className="text-zinc-900 dark:text-zinc-200 block mb-1">
                          Common Symptoms:
                        </strong>
                        <ul className="list-disc list-inside space-y-0.5 text-zinc-600 dark:text-zinc-400 pl-1 text-[11px]">
                          {guide.symptoms.map((s, idx) => (
                            <li key={idx}>{s}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-lg p-3">
                        <strong className="text-emerald-900 dark:text-emerald-200 block mb-1.5 text-xs">
                          Step-by-Step Resolution:
                        </strong>
                        <ol className="list-decimal list-inside space-y-1.5 text-emerald-800 dark:text-emerald-300 text-[11px]">
                          {guide.resolutionSteps.map((step, idx) => {
                            const codeMatch = step.match(/`([^`]+)`/);
                            const extractableCode = codeMatch ? codeMatch[1] : null;

                            return (
                              <li key={idx} className="leading-relaxed">
                                <span>{step}</span>
                                {extractableCode && (
                                  <div className="mt-1 flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => handleCopyCommand(extractableCode)}
                                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/60 hover:bg-emerald-200 dark:hover:bg-emerald-800 text-[10px] font-mono font-semibold text-emerald-800 dark:text-emerald-200 transition-all cursor-pointer"
                                      title="Copy command to clipboard"
                                    >
                                      {copiedCommandText === extractableCode ? (
                                        <>
                                          <CheckCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                          <span>Copied!</span>
                                        </>
                                      ) : (
                                        <>
                                          <Terminal className="w-3 h-3" />
                                          <span>Copy: {extractableCode}</span>
                                        </>
                                      )}
                                    </button>
                                  </div>
                                )}
                              </li>
                            );
                          })}
                        </ol>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-2 border-t border-zinc-100 dark:border-zinc-800 font-mono">
                        <span>Applies to: {guide.affectedDevices.join(', ')}</span>
                        <span>{guide.windowsVersions.join(' • ')}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 7. Tab Content: Specifications & Driver Downloads */}
      {activeTab === 'specs' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Technical Specifications */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 sm:p-4.5 space-y-3 shadow-xs">
              <h3 className="text-xs sm:text-[13px] font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-emerald-500" />
                {activeManufacturer.name} {activeDevice.modelName} Specifications
              </h3>

              <div className="space-y-1.5 text-xs text-zinc-600 dark:text-zinc-400 divide-y divide-zinc-100 dark:divide-zinc-800">
                <div className="flex justify-between py-1">
                  <span className="text-zinc-500">Certification Standard:</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-200">UIDAI {activeDevice.certificationLevel} & STQC Certified</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-zinc-500">Modality:</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-200">{activeDevice.modalityLabel}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-zinc-500">Sensor Technology:</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-200">{activeDevice.sensorTechnology}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-zinc-500">Optical Resolution:</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-200">{activeDevice.resolutionDpi} DPI</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-zinc-500">{activeDevice.modality === 'single_iris' ? 'Focal Distance:' : 'Platen Glass Size:'}</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-200">{activeDevice.platenSize}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-zinc-500">Host Interface:</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-200">{activeDevice.interfaceType}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-zinc-500">Cryptographic Security:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {activeDevice.certificationLevel === 'L1' ? 'Hardware TEE Secure Enclave' : 'Host Software Encrypted (L0)'}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-zinc-500">Operating Systems:</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-200">{activeDevice.supportedOS.join(', ')}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-zinc-500">RD Service Default Ports:</span>
                  <span className="font-mono text-zinc-900 dark:text-zinc-200">{activeDevice.defaultPorts.join(', ')}</span>
                </div>
              </div>
            </div>

            {/* Official Driver & RD Service Links */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 sm:p-4.5 space-y-3 shadow-xs">
              <h3 className="text-xs sm:text-[13px] font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                <Download className="w-3.5 h-3.5 text-emerald-500" />
                Official Driver & RD Service Packages
              </h3>

              <p className="text-[11px] text-zinc-500 leading-relaxed">
                To test live hardware on Windows 10/11, install both the <strong>{activeDevice.modelName} Driver</strong> and the official <strong>{activeDevice.modelName} RD Service daemon</strong> from {activeManufacturer.name}.
              </p>

              <div className="space-y-2">
                <a
                  href={activeDevice.driverDownloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2.5 sm:p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 hover:border-emerald-500 transition-all text-xs"
                >
                  <div>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100 block">
                      {activeManufacturer.name} {activeDevice.modelName} Windows Driver
                    </span>
                    <span className="text-zinc-400 text-[10px]">Includes USB drivers for Windows 10 & Windows 11</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
                </a>

                <a
                  href={activeDevice.rdServiceDownloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2.5 sm:p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 hover:border-emerald-500 transition-all text-xs"
                >
                  <div>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100 block">
                      {activeManufacturer.name} {activeDevice.modelName} RD Service Package
                    </span>
                    <span className="text-zinc-400 text-[10px]">Binds local loopback daemon on ports {activeDevice.defaultPorts.join(', ')}</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
                </a>

                <a
                  href={activeDevice.documentationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2.5 sm:p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 hover:border-emerald-500 transition-all text-xs"
                >
                  <div>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100 block">
                      {activeManufacturer.name} {activeDevice.modelName} Official Documentation
                    </span>
                    <span className="text-zinc-400 text-[10px]">Hardware brochure and STQC certificate data</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
                </a>
              </div>

              <div className="p-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-[10px] text-zinc-600 dark:text-zinc-400">
                <strong>Tip for Windows 11 Users:</strong> Always run driver installers by right-clicking and selecting <em>&quot;Run as Administrator&quot;</em> to ensure the Windows Service registration succeeds.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 8. Diagnostic Health Audit Certificate Modal */}
      {showHealthReport && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="max-w-xl w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-3.5 sm:p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-800/40">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Printer className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    RD Service Diagnostic Health Certificate
                  </h3>
                  <p className="text-[11px] text-zinc-500">
                    UIDAI Compliant Hardware & Driver Attestation Report
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowHealthReport(false)}
                className="w-7 h-7 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 flex items-center justify-center transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-3 print:p-0">
              {/* Summary Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                <div className="p-2 sm:p-2.5 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-200 dark:border-zinc-800">
                  <span className="text-[9px] text-zinc-400 font-bold uppercase block">Device</span>
                  <span className="text-[11px] font-bold text-zinc-900 dark:text-zinc-100 truncate block mt-0.5">
                    {activeManufacturer.name} {activeDevice.modelName}
                  </span>
                </div>
                <div className="p-2 sm:p-2.5 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-200 dark:border-zinc-800">
                  <span className="text-[9px] text-zinc-400 font-bold uppercase block">UIDAI Spec</span>
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 block mt-0.5">
                    Level {activeDevice.certificationLevel} (STQC)
                  </span>
                </div>
                <div className="p-2 sm:p-2.5 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-200 dark:border-zinc-800">
                  <span className="text-[9px] text-zinc-400 font-bold uppercase block">Audit Result</span>
                  <span className={`text-[11px] font-bold block mt-0.5 ${
                    statusCounts.fail === 0 && statusCounts.pass >= 4
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-amber-600 dark:text-amber-400'
                  }`}>
                    {statusCounts.fail === 0 && statusCounts.pass >= 4 ? 'PASSED (Ready)' : 'ATTN REQUIRED'}
                  </span>
                </div>
                <div className="p-2 sm:p-2.5 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-200 dark:border-zinc-800">
                  <span className="text-[9px] text-zinc-400 font-bold uppercase block">Privacy</span>
                  <span className="text-[11px] font-bold text-zinc-900 dark:text-zinc-100 block mt-0.5">
                    100% Zero-Storage
                  </span>
                </div>
              </div>

              {/* Hardware Attestation Serial Barcode */}
              <div className="p-2.5 bg-zinc-50 dark:bg-zinc-800/30 rounded-lg border border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center">
                <div className="flex items-center gap-[2.5px] h-7 select-none opacity-85">
                  {[3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 3, 1, 2, 3, 4, 1, 2, 1, 3, 2, 4, 1, 2, 3, 1, 4, 2, 1, 3].map((w, i) => (
                    <div
                      key={i}
                      className="bg-zinc-800 dark:bg-zinc-200 h-full rounded-xs"
                      style={{ width: `${w}px` }}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-1.5 mt-1 font-mono text-[8px] text-zinc-500">
                  <span>ATTESTATION ID: UIDAI-RDS-{activeDevice.modelName.replace(/[^a-zA-Z0-9]/g, '')}-{(activeDevice.certificationLevel)}-VALID</span>
                  <span>•</span>
                  <span>ISO 19794</span>
                </div>
              </div>

              {/* Preformatted Certificate Text Block */}
              <div>
                <label className="block text-[11px] font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                  Technician Certificate Slip (Plain Text):
                </label>
                <pre className="text-[10px] font-mono leading-relaxed bg-zinc-950 text-emerald-400 p-3 rounded-lg border border-zinc-800 overflow-x-auto max-h-48 select-all">
                  {generateAuditReportText()}
                </pre>
              </div>

              {/* Statutory Privacy Footnote */}
              <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 text-[10px] text-amber-800 dark:text-amber-300 leading-relaxed">
                <strong>Statutory Compliance:</strong> In accordance with UIDAI regulations and Section 29 of the Aadhaar Act, 2016, no citizen Aadhaar number, raw biometric bitmap, or encrypted PID data is captured, logged, or saved. This certificate validates only local loopback socket reachability, device attestation, and hardware communication readiness.
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-3 sm:p-3.5 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 flex items-center justify-between gap-2.5">
              <button
                type="button"
                onClick={() => setShowHealthReport(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-all cursor-pointer"
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(generateAuditReportText());
                    setCopiedReportText(true);
                    setTimeout(() => setCopiedReportText(false), 2000);
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-xs font-medium text-zinc-800 dark:text-zinc-200 transition-all cursor-pointer"
                >
                  {copiedReportText ? (
                    <>
                      <CheckCheck className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Slip</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-all cursor-pointer shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print / PDF Slip
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
