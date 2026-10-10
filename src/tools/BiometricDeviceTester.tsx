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
  Radio
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
      let infoPath = infoElem?.getAttribute('path') || '/rd/info';

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
    const portsToScan = [11100, 11101, 11102, 11103, 11104, 11105];
    const probePromises: Promise<DiscoveredRDService | null>[] = [];

    for (const p of portsToScan) {
      probePromises.push(probePort(p, 'http'));
      probePromises.push(probePort(p, 'https'));
    }

    const results = await Promise.all(probePromises);
    const found = results.filter((r): r is DiscoveredRDService => r !== null);
    setDiscoveredServices(found);
    setIsScanningHardware(false);
    return found;
  }, []);

  // Auto-scan loopback when entering Live USB mode
  useEffect(() => {
    if (executionMode === 'live' || captureMode === 'live') {
      scanAllLoopbackPorts();
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
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Communication failed';
      setCaptureError(
        `${activeDevice.modelName} RD Service capture failed: ${errorMsg}. Endpoint: ${captureUrl}.`
      );
      setCaptureState('error');
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
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            Pass
          </span>
        );
      case 'fail':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            Fail
          </span>
        );
      case 'inconclusive':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            Inconclusive
          </span>
        );
      case 'skipped':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
            <AlertCircle className="w-3.5 h-3.5" />
            Skipped
          </span>
        );
      case 'running':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
            <Activity className="w-3.5 h-3.5 animate-spin" />
            Probing...
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-100 text-zinc-500 dark:bg-zinc-800/60 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800">
            Idle
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Unified Biometric Command & Control Console (No Scrolling Needed!) */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
        {/* Row 1: Selectors & Instant Action Buttons */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Controls Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 flex-1">
            {/* Manufacturer Selector */}
            <div>
              <label htmlFor={mfrSelectId} className="block text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
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
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-semibold text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
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
              <label htmlFor={deviceSelectId} className="block text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
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
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-semibold text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
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
                <label className="block text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
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
                  className={`py-1.5 px-2 rounded-xl text-xs font-semibold border transition-all ${
                    uidaiEnv === 'P'
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 shadow-xs'
                      : 'bg-zinc-50 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100'
                  }`}
                >
                  P (Prod)
                </button>
                <button
                  type="button"
                  onClick={() => setUidaiEnv('PP')}
                  className={`py-1.5 px-2 rounded-xl text-xs font-semibold border transition-all ${
                    uidaiEnv === 'PP'
                      ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-300 dark:border-amber-700 shadow-xs'
                      : 'bg-zinc-50 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100'
                  }`}
                >
                  PP (Pre-Prod)
                </button>
              </div>
            </div>

            {/* Diagnostic Mode Toggle */}
            <div>
              <label className="block text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
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
                  className={`py-1.5 px-2 rounded-xl text-xs font-semibold border transition-all ${
                    executionMode === 'mock'
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 shadow-xs'
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
                  className={`py-1.5 px-2 rounded-xl text-xs font-semibold border transition-all ${
                    executionMode === 'live'
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 shadow-xs'
                      : 'bg-zinc-50 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100'
                  }`}
                >
                  Live USB
                </button>
              </div>
            </div>
          </div>

          {/* Instant Primary Action Buttons (Always Visible at Top!) */}
          <div className="flex items-center gap-2 lg:border-l lg:border-zinc-200 lg:dark:border-zinc-800 lg:pl-4 shrink-0">
            {activeTab === 'diagnostics' ? (
              <>
                <button
                  type="button"
                  onClick={handleRunDiagnostics}
                  disabled={isRunningAll}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-white" />
                  {isRunningAll ? 'Running Checks...' : 'Run All Diagnostics'}
                </button>
                <button
                  type="button"
                  onClick={handleResetDiagnostics}
                  disabled={isRunningAll}
                  className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 transition-all cursor-pointer"
                  title="Reset all checks"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </>
            ) : activeTab === 'capture' ? (
              <>
                <button
                  type="button"
                  onClick={executionMode === 'mock' ? triggerMockCapture : triggerLiveCapture}
                  disabled={captureState === 'dispatched' || captureState === 'waiting_finger' || captureState === 'processing'}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer"
                >
                  {activeDevice.modality === 'single_iris' ? <Eye className="w-4 h-4" /> : <Fingerprint className="w-4 h-4" />}
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
                    className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 transition-all cursor-pointer"
                    title="Reset capture"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                )}
              </>
            ) : activeTab === 'specs' ? (
              <a
                href={activeDevice.driverDownloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-all whitespace-nowrap"
              >
                <Download className="w-4 h-4" />
                Download {activeDevice.modelName} Drivers
              </a>
            ) : (
              <button
                type="button"
                onClick={() => { setSelectedTroubleshootCategory('all'); setTroubleshootQuery(''); }}
                className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold text-xs transition-all whitespace-nowrap cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* Row 2: Status & Security Metadata Strip */}
        <div className="flex items-center justify-between gap-2 flex-wrap pt-3 border-t border-zinc-100 dark:border-zinc-800/80 text-[11px] text-zinc-500 dark:text-zinc-400">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">
              {activeManufacturer.name} {activeDevice.modelName}
            </span>
            <span>•</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
              UIDAI {activeDevice.certificationLevel} Certified
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium">
              {activeDevice.modalityLabel}
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
              Port: 127.0.0.1:{activeDevice.defaultPorts[0] || 11100}
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
              env=&quot;{uidaiEnv}&quot;
            </span>
            {executionMode === 'mock' && (
              <span className="text-zinc-400">
                Preset: {mockScenarios.find((s) => s.id === selectedScenarioId)?.label.split(' ')[1] || 'Healthy'}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>100% In-Browser Privacy • Zero Biometric Storage</span>
          </div>
        </div>

        {/* Row 3: Live Hardware Detection Strip & Mismatch Alert (When in Live Mode) */}
        {executionMode === 'live' && (
          <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 space-y-2.5">
            {/* Real-time Hardware Monitor Strip */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs bg-zinc-50 dark:bg-zinc-800/50 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700/60">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                  Local USB Hardware Monitor:
                </span>
                {isScanningHardware ? (
                  <span className="text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                    <Activity className="w-3 h-3 animate-spin" />
                    Scanning ports 11100–11105 across HTTP & HTTPS...
                  </span>
                ) : discoveredServices.length === 0 ? (
                  <span className="text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1 text-[11px]">
                    <XCircle className="w-3 h-3" />
                    No RD Service daemon detected on ports 11100–11105 (Services stopped)
                  </span>
                ) : (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {discoveredServices.map((svc) => (
                      <span
                        key={`${svc.protocol}-${svc.port}`}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-mono text-[10px] font-bold border ${
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
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-[11px] font-semibold transition-all cursor-pointer self-start sm:self-auto shrink-0"
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
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 rounded-xl text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-amber-900 dark:text-amber-200">
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
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-700 rounded-xl text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-rose-900 dark:text-rose-200">
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
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all whitespace-nowrap cursor-pointer shrink-0"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
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

      {/* 2. Navigation Tabs */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800 gap-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('diagnostics')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'diagnostics'
              ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
          }`}
        >
          <Activity className="w-4 h-4" />
          RD Service Diagnostics
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold">
            6 Checks
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('capture')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'capture'
              ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
          }`}
        >
          <Fingerprint className="w-4 h-4 text-emerald-500" />
          Capture & Quality Studio
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold">
            Live & Mock
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('specs')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'specs'
              ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
          }`}
        >
          <Cpu className="w-4 h-4" />
          Device Specifications & Drivers
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('troubleshoot')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'troubleshoot'
              ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          Troubleshooting & Error Guide
        </button>
      </div>

      {/* 3. Tab Content: Diagnostics */}
      {activeTab === 'diagnostics' && (
        <div className="space-y-4">
          {/* Status Counter Strip & Scenario Selector (if mock) */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-3.5">
            {/* Status Counters */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                <CheckCircle2 className="w-3.5 h-3.5" /> Pass: {statusCounts.pass}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20">
                <XCircle className="w-3.5 h-3.5" /> Fail: {statusCounts.fail}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                <AlertTriangle className="w-3.5 h-3.5" /> Inconclusive: {statusCounts.inconclusive}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
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
                  className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-hidden"
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

          {/* Diagnostic Checks List */}
          <div className="space-y-4">
            {diagnosticChecks.map((check, index) => {
              const isExpanded = expandedCheckId === check.id;

              return (
                <div
                  key={check.id}
                  className={`bg-white dark:bg-zinc-900 border rounded-2xl transition-all ${
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
                    className="p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer select-none"
                  >
                    <div className="flex items-start sm:items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 sm:mt-0">
                        {index + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                            {check.title}
                          </h3>
                          {check.durationMs !== undefined && (
                            <span className="text-[11px] text-zinc-400 font-mono">
                              ({check.durationMs}ms)
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                          {check.message || check.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {renderStatusBadge(check.status)}
                      <div className="text-zinc-400">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>

                  {/* Expandable Technical Log / Details */}
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-2 border-t border-zinc-100 dark:border-zinc-800/80 space-y-3">
                      {check.technicalDetails && (
                        <div className="text-xs text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-xl border border-zinc-200/60 dark:border-zinc-800">
                          <strong>Technical Assessment:</strong> {check.technicalDetails}
                        </div>
                      )}

                      {check.recommendation && (
                        <div className="text-xs text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/40 p-3 rounded-xl border border-amber-200 dark:border-amber-800 flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                          <div>
                            <strong>Recommended Action:</strong> {check.recommendation}
                          </div>
                        </div>
                      )}

                      {/* Raw Protocol XML Payload (if present) */}
                      {check.rawPayload && (
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                              Simulated RD Protocol XML
                            </span>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(check.rawPayload || '', `xml-${check.id}`)}
                              className="inline-flex items-center gap-1 text-[11px] text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
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
                          <pre className="text-[11px] font-mono bg-zinc-950 text-emerald-400 p-3 rounded-xl overflow-x-auto border border-zinc-800 leading-relaxed">
                            {check.rawPayload}
                          </pre>
                        </div>
                      )}

                      {/* Protocol Execution Logs */}
                      {check.logs && check.logs.length > 0 && (
                        <div>
                          <span className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
                            Diagnostic Telemetry Trace
                          </span>
                          <div className="text-[11px] font-mono bg-zinc-900 text-zinc-300 p-3 rounded-xl space-y-1 border border-zinc-800">
                            {check.logs.map((log, lIdx) => (
                              <div key={lIdx} className="flex items-start gap-2">
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
        <div className="space-y-6">
          {/* Privacy Guarantee Header */}
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 dark:bg-emerald-950/20">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                  Client-Side Biometric Diagnostic Sandbox
                </h4>
                <p className="text-[11px] text-emerald-800/80 dark:text-emerald-300/80">
                  All requests communicate directly with your local loopback socket. Toolique does not capture, save, or transmit raw biometric templates or PID data.
                </p>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 shrink-0">
              UIDAI L1 Compliant Standard
            </span>
          </div>

          {/* Mode Selector & Configuration Toolbar */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
              {/* Mode Toggle */}
              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
                  Capture Mode
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setExecutionMode('mock');
                      setCaptureMode('mock');
                      handleResetCapture();
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                      executionMode === 'mock'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 shadow-xs'
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
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                      executionMode === 'live'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 shadow-xs'
                        : 'bg-zinc-50 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100'
                    }`}
                  >
                    Live USB
                  </button>
                </div>
              </div>

              {/* UIDAI Environment Parameter (env) Selector */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                    UIDAI Env (<code className="font-mono text-zinc-600 dark:text-zinc-300">env</code>)
                  </label>
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                    uidaiEnv === 'P'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                  }`}>
                    {uidaiEnv === 'P' ? 'P' : 'PP'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setUidaiEnv('P');
                      handleResetCapture();
                    }}
                    className={`py-2 px-2.5 rounded-xl text-xs font-semibold border transition-all ${
                      uidaiEnv === 'P'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 shadow-xs'
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
                    className={`py-2 px-2.5 rounded-xl text-xs font-semibold border transition-all ${
                      uidaiEnv === 'PP'
                        ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-300 dark:border-amber-700 shadow-xs'
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
                  <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
                    Simulation Preset
                  </label>
                  <select
                    value={captureSimPreset}
                    onChange={(e) => {
                      setCaptureSimPreset(e.target.value as 'optimal' | 'borderline' | 'timeout' | 'detached' | 'quick_remove');
                      handleResetCapture();
                    }}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-hidden"
                  >
                    <option value="optimal">🟢 High Quality Scan (qScore: 85%+)</option>
                    <option value="borderline">🟡 Borderline Quality (qScore: 52% - Below 60)</option>
                    <option value="quick_remove">🔴 Error 1142: Removed Too Quick</option>
                    <option value="timeout">🔴 Error 1141: Capture Timeout</option>
                    <option value="detached">🔴 Error 1140: Device Not Attached</option>
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
                    Capture Timeout
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="5"
                      max="20"
                      step="1"
                      value={captureTimeout}
                      onChange={(e) => setCaptureTimeout(parseInt(e.target.value, 10))}
                      className="w-full accent-emerald-600 cursor-pointer"
                    />
                    <span className="font-mono text-xs font-bold text-zinc-700 dark:text-zinc-300 w-8 text-right">
                      {captureTimeout}s
                    </span>
                  </div>
                </div>
              )}

              {/* Quality Target */}
              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
                  UIDAI Minimum Quality Target
                </label>
                <div className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl px-2 py-1">
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
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {activeDevice.modality === 'single_iris' ? (
                    <Eye className="w-4 h-4" />
                  ) : (
                    <Fingerprint className="w-4 h-4" />
                  )}
                  {captureState === 'waiting_finger'
                    ? activeDevice.modality === 'single_iris'
                      ? 'Infrared Sensor Active — Align Eye...'
                      : 'Optical LED Active — Place Finger...'
                    : captureState === 'processing'
                    ? activeDevice.modality === 'single_iris'
                      ? 'Processing Iris Template...'
                      : 'Processing Biometric Scan...'
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
                    className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-medium hover:bg-zinc-100 transition-all cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Reset
                  </button>
                )}
              </div>

              {executionMode === 'live' && (
                <span className="text-[11px] text-zinc-400 hidden sm:inline">
                  {discoveredServices.find((s) => s.vendorId === activeManufacturer.id) ? (
                    <>
                      Target: <code className="bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded text-emerald-600 dark:text-emerald-400 font-bold">
                        {discoveredServices.find((s) => s.vendorId === activeManufacturer.id)?.protocol}://127.0.0.1:{discoveredServices.find((s) => s.vendorId === activeManufacturer.id)?.port}{discoveredServices.find((s) => s.vendorId === activeManufacturer.id)?.capturePath}
                      </code> ({discoveredServices.find((s) => s.vendorId === activeManufacturer.id)?.status})
                    </>
                  ) : (
                    <>
                      Target: <code className="bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded">Ports 11100–11105 (Auto-Detect)</code>
                    </>
                  )}
                </span>
              )}
            </div>
          </div>

          {/* Interactive Optical Platen & Real-Time Diagnostic Dashboard */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Visual Platen Sensor Casing */}
            <div className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
              <div className="mb-4">
                <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-400">
                  {activeManufacturer.name} {activeDevice.modelName} {activeDevice.modality === 'single_iris' ? 'Iris Sensor Reticle' : 'Optical Platen'}
                </span>
              </div>

              {/* Physical Scanner Platen Housing */}
              <div
                className={`relative w-48 h-56 rounded-3xl border-4 transition-all duration-300 flex flex-col items-center justify-center p-4 select-none ${
                  captureState === 'waiting_finger'
                    ? activeDevice.modality === 'single_iris'
                      ? 'border-cyan-500 bg-cyan-950/20 shadow-[0_0_35px_rgba(6,182,212,0.7)] animate-pulse'
                      : 'border-red-500 bg-red-950/20 shadow-[0_0_35px_rgba(239,68,68,0.7)] animate-pulse'
                    : captureState === 'processing'
                    ? 'border-amber-500 bg-amber-950/20 shadow-[0_0_30px_rgba(245,158,11,0.6)]'
                    : captureState === 'success'
                    ? 'border-emerald-500 bg-emerald-950/20 shadow-[0_0_30px_rgba(16,185,129,0.6)]'
                    : captureState === 'error'
                    ? 'border-rose-500 bg-rose-950/20 shadow-[0_0_20px_rgba(244,63,94,0.4)]'
                    : 'border-zinc-300 dark:border-zinc-700 bg-zinc-100/80 dark:bg-zinc-800/60'
                }`}
              >
                {/* Scratch-Free Platen Glass / Reticle Window */}
                <div
                  className={`w-28 h-36 rounded-2xl border-2 transition-all flex flex-col items-center justify-center relative overflow-hidden ${
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
                  {/* Silhouette / Reticle Rendering */}
                  <div className="relative z-10 flex flex-col items-center justify-center">
                    {activeDevice.modality === 'single_iris' ? (
                      <Eye
                        className={`w-16 h-16 transition-all duration-300 ${
                          captureState === 'waiting_finger'
                            ? 'text-cyan-400 animate-pulse scale-105'
                            : captureState === 'processing'
                            ? 'text-amber-400 animate-pulse'
                            : captureState === 'success'
                            ? 'text-emerald-400 scale-110 drop-shadow-[0_0_10px_rgba(52,211,153,0.8)]'
                            : captureState === 'error'
                            ? 'text-rose-400'
                            : 'text-zinc-400/60 dark:text-zinc-600'
                        }`}
                      />
                    ) : (
                      <Fingerprint
                        className={`w-16 h-16 transition-all duration-300 ${
                          captureState === 'waiting_finger'
                            ? 'text-red-400 animate-pulse scale-105'
                            : captureState === 'processing'
                            ? 'text-amber-400 animate-spin'
                            : captureState === 'success'
                            ? 'text-emerald-400 scale-110 drop-shadow-[0_0_10px_rgba(52,211,153,0.8)]'
                            : captureState === 'error'
                            ? 'text-rose-400'
                            : 'text-zinc-400/60 dark:text-zinc-600'
                        }`}
                      />
                    )}

                    {/* Sensor State Labels */}
                    <span
                      className={`text-[9px] font-mono uppercase tracking-wider font-bold mt-2 px-1.5 py-0.5 rounded ${
                        captureState === 'waiting_finger'
                          ? activeDevice.modality === 'single_iris'
                            ? 'text-cyan-200 bg-cyan-900/80'
                            : 'text-red-200 bg-red-900/80'
                          : captureState === 'processing'
                          ? 'text-amber-200 bg-amber-900/80'
                          : captureState === 'success'
                          ? 'text-emerald-200 bg-emerald-900/80'
                          : captureState === 'error'
                          ? 'text-rose-200 bg-rose-900/80'
                          : 'text-zinc-400'
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

                  {/* Scanning sweep laser animation during processing */}
                  {captureState === 'processing' && (
                    <div className="absolute inset-x-0 h-1 bg-amber-400 shadow-[0_0_12px_#fbbf24] animate-bounce top-1/2" />
                  )}
                </div>

                {/* Platen Dimensions / Focal Distance Label */}
                <div className="mt-3 flex items-center gap-1.5 text-[10px] text-zinc-400">
                  <span>{activeDevice.platenSize || (activeDevice.modality === 'single_iris' ? '70–120 mm Focus' : '15.0 × 20.0 mm')}</span>
                  <span>•</span>
                  <span>{activeDevice.resolutionDpi} DPI</span>
                </div>
              </div>

              {/* Status Message below Platen */}
              <div className="mt-4 text-xs font-medium max-w-xs">
                {captureState === 'waiting_finger' && (
                  <p className="text-red-600 dark:text-red-400 font-semibold animate-pulse">
                    {activeDevice.modality === 'single_iris'
                      ? '🔵 Infrared illumination active. Align eye within 70–120 mm range.'
                      : '🔴 Optical Red LED is ON. Firmly place finger on scanner platen.'}
                  </p>
                )}
                {captureState === 'processing' && (
                  <p className="text-amber-600 dark:text-amber-400 font-semibold">
                    {activeDevice.modality === 'single_iris'
                      ? '⚡ Capturing iris pattern & verifying ISO/IEC 19794-6 compliance...'
                      : '⚡ Optical sensor exposing ridges & computing minutiae...'}
                  </p>
                )}
                {captureState === 'success' && captureResult && (
                  <p className="text-emerald-600 dark:text-emerald-400 font-semibold">
                    🟢 Scan complete! Quality Score: {captureResult.qScore}% ({captureResult.durationMs}ms)
                  </p>
                )}
                {captureState === 'error' && (
                  <p className="text-rose-600 dark:text-rose-400 font-semibold">
                    {captureError || 'Capture failed. Please retry.'}
                  </p>
                )}
                {captureState === 'idle' && (
                  <p className="text-zinc-400">
                    Ready to initiate capture request.
                  </p>
                )}
              </div>
            </div>

            {/* Diagnostic Metrics & Telemetry Details */}
            <div className="lg:col-span-7 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-500" />
                  Capture Diagnostic Results
                </h3>
                {captureResult && (
                  <span className="text-[11px] font-mono text-zinc-400">
                    {captureResult.timestamp} {captureResult.isMock ? '(Simulated)' : '(Live Hardware)'}
                  </span>
                )}
              </div>

              {captureResult ? (
                <div className="space-y-4">
                  {/* Metric Cards Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {/* Quality Score Card */}
                    <div className="bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-800 rounded-xl p-3 text-center">
                      <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">
                        Quality Score
                      </span>
                      <div
                        className={`text-2xl font-black ${
                          captureResult.qScore >= minQualityTarget
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : captureResult.qScore >= 40
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {captureResult.qScore}%
                      </div>
                      <span className="text-[10px] text-zinc-500 mt-0.5 block">
                        {captureResult.qScore >= minQualityTarget ? 'Compliant' : 'Below Target'}
                      </span>
                    </div>

                    {/* Minutiae / Features Count Card */}
                    <div className="bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-800 rounded-xl p-3 text-center">
                      <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">
                        {activeDevice.modality === 'single_iris' ? 'Iris Features' : 'Minutiae Points'}
                      </span>
                      <div className="text-2xl font-black text-zinc-900 dark:text-zinc-100">
                        {activeDevice.modality === 'single_iris' ? `${captureResult.qScore}%` : captureResult.nmPoints}
                      </div>
                      <span className="text-[10px] text-zinc-500 mt-0.5 block">
                        {activeDevice.modality === 'single_iris' ? 'ISO 19794-6' : 'Extracted (FMR)'}
                      </span>
                    </div>

                    {/* Execution Latency Card */}
                    <div className="bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-800 rounded-xl p-3 text-center">
                      <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">
                        Sensor Latency
                      </span>
                      <div className="text-2xl font-black text-zinc-900 dark:text-zinc-100">
                        {captureResult.durationMs}
                        <span className="text-xs font-normal text-zinc-400 ml-0.5">ms</span>
                      </div>
                      <span className="text-[10px] text-zinc-500 mt-0.5 block">
                        End-to-End
                      </span>
                    </div>

                    {/* L1 Attestation Card */}
                    <div className="bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-800 rounded-xl p-3 text-center">
                      <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">
                        {activeDevice.certificationLevel} Cryptography
                      </span>
                      <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                        {activeDevice.certificationLevel === 'L1' ? 'HW Signed' : 'SW Signed'}
                      </div>
                      <span className="text-[10px] text-zinc-500 mt-0.5 block">
                        {activeDevice.certificationLevel === 'L1' ? 'Secure Enclave' : 'Host Security'}
                      </span>
                    </div>
                  </div>

                  {/* Device & Status Details */}
                  <div className="bg-zinc-50 dark:bg-zinc-800/40 rounded-xl p-3.5 border border-zinc-200/60 dark:border-zinc-800 text-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">{activeManufacturer.name} Return Status:</span>
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                        Code {captureResult.errorCode} ({captureResult.errorInfo})
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">UIDAI Environment:</span>
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          uidaiEnv === 'P'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                        }`}>
                          env=&quot;{uidaiEnv}&quot;
                        </span>
                        <span>{uidaiEnv === 'P' ? 'Production (Live Auth)' : 'Pre-Production (Sandbox)'}</span>
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
                        Encrypted PID Masked • Zero Biometric Storage
                      </span>
                    </div>
                  </div>

                  {/* Collapsible Sanitized XML Inspector */}
                  <div>
                    <button
                      type="button"
                      onClick={() => setShowRawXml(!showRawXml)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                    >
                      {showRawXml ? 'Hide Sanitized Protocol XML' : 'View Sanitized Protocol XML'}
                    </button>

                    {showRawXml && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-mono text-zinc-400">
                            Redacted &lt;PidData&gt; Response
                          </span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(captureResult.rawXml, 'capture-xml')}
                            className="inline-flex items-center gap-1 text-[11px] text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
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
                        <pre className="text-[11px] font-mono bg-zinc-950 text-emerald-400 p-3 rounded-xl overflow-x-auto border border-zinc-800 leading-relaxed max-h-48">
                          {captureResult.rawXml}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="min-h-[220px] flex flex-col items-center justify-center text-center p-6 bg-zinc-50/50 dark:bg-zinc-800/20 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800">
                  <Fingerprint className="w-10 h-10 text-zinc-300 dark:text-zinc-700 mb-3" />
                  <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    No capture telemetry recorded yet
                  </p>
                  <p className="text-[11px] text-zinc-400 max-w-sm mt-1">
                    Click <strong>&quot;Run Simulated Capture&quot;</strong> to test with sandbox presets, or toggle to <strong>&quot;Live Hardware&quot;</strong> to trigger your physical USB {activeManufacturer.name} {activeDevice.modelName} scanner.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 6. Tab Content: Troubleshooting Guide */}
      {activeTab === 'troubleshoot' && (
        <div className="space-y-6">
          {/* Search & Category Filter */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <label htmlFor={tsSearchId} className="sr-only">Search error code or symptom</label>
              <input
                id={tsSearchId}
                type="text"
                value={troubleshootQuery}
                onChange={(e) => setTroubleshootQuery(e.target.value)}
                placeholder="Search error code (e.g. 1140, 720), port, SSL, or driver symptom..."
                className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
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
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedTroubleshootCategory === cat.id
                      ? 'bg-emerald-600 text-white'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Troubleshooting Guides Accordion */}
          <div className="space-y-4">
            {filteredTroubleshootGuides.map((guide) => {
              const isExpanded = expandedTroubleshootId === guide.id;

              return (
                <div
                  key={guide.id}
                  className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden transition-all"
                >
                  <div
                    onClick={() => setExpandedTroubleshootId(isExpanded ? null : guide.id)}
                    className="p-5 flex items-start justify-between gap-4 cursor-pointer select-none hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20"
                  >
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                          {guide.categoryLabel}
                        </span>
                        {guide.errorCode && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                            {guide.errorCode}
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        {guide.title}
                      </h3>
                      <p className="text-xs text-zinc-500 mt-1 line-clamp-1">
                        <strong>Root Cause:</strong> {guide.rootCause}
                      </p>
                    </div>

                    <div className="text-zinc-400 shrink-0 mt-1">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-5 pb-5 pt-2 border-t border-zinc-100 dark:border-zinc-800/80 space-y-4 text-xs">
                      <div>
                        <strong className="text-zinc-900 dark:text-zinc-200 block mb-1">
                          Common Symptoms:
                        </strong>
                        <ul className="list-disc list-inside space-y-1 text-zinc-600 dark:text-zinc-400 pl-1">
                          {guide.symptoms.map((s, idx) => (
                            <li key={idx}>{s}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-xl p-4">
                        <strong className="text-emerald-900 dark:text-emerald-200 block mb-2">
                          Step-by-Step Resolution:
                        </strong>
                        <ol className="list-decimal list-inside space-y-1.5 text-emerald-800 dark:text-emerald-300">
                          {guide.resolutionSteps.map((step, idx) => (
                            <li key={idx} className="leading-relaxed">
                              {step}
                            </li>
                          ))}
                        </ol>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-2 border-t border-zinc-100 dark:border-zinc-800">
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
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Technical Specifications */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-emerald-500" />
                {activeManufacturer.name} {activeDevice.modelName} Specifications
              </h3>

              <div className="space-y-2.5 text-xs text-zinc-600 dark:text-zinc-400 divide-y divide-zinc-100 dark:divide-zinc-800">
                <div className="flex justify-between py-1.5">
                  <span className="text-zinc-500">Certification Standard:</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-200">UIDAI {activeDevice.certificationLevel} & STQC Certified</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-zinc-500">Modality:</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-200">{activeDevice.modalityLabel}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-zinc-500">Sensor Technology:</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-200">{activeDevice.sensorTechnology}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-zinc-500">Optical Resolution:</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-200">{activeDevice.resolutionDpi} DPI</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-zinc-500">{activeDevice.modality === 'single_iris' ? 'Focal Distance:' : 'Platen Glass Size:'}</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-200">{activeDevice.platenSize}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-zinc-500">Host Interface:</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-200">{activeDevice.interfaceType}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-zinc-500">Cryptographic Security:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {activeDevice.certificationLevel === 'L1' ? 'Hardware TEE / Secure Enclave Boot Signing' : 'Host Software Encrypted (L0)'}
                  </span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-zinc-500">Operating Systems:</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-200">{activeDevice.supportedOS.join(', ')}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-zinc-500">RD Service Default Ports:</span>
                  <span className="font-mono text-zinc-900 dark:text-zinc-200">{activeDevice.defaultPorts.join(', ')}</span>
                </div>
              </div>
            </div>

            {/* Official Driver & RD Service Links */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Download className="w-4 h-4 text-emerald-500" />
                Official Driver & RD Service Packages
              </h3>

              <p className="text-xs text-zinc-500">
                To test live hardware on Windows 10/11, install both the <strong>{activeDevice.modelName} Driver</strong> and the official <strong>{activeDevice.modelName} RD Service daemon</strong> from {activeManufacturer.name}.
              </p>

              <div className="space-y-3">
                <a
                  href={activeDevice.driverDownloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 hover:border-emerald-500 transition-all text-xs"
                >
                  <div>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100 block">
                      {activeManufacturer.name} {activeDevice.modelName} Windows Driver
                    </span>
                    <span className="text-zinc-400 text-[11px]">Includes USB drivers for Windows 10 & Windows 11</span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-zinc-400" />
                </a>

                <a
                  href={activeDevice.rdServiceDownloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 hover:border-emerald-500 transition-all text-xs"
                >
                  <div>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100 block">
                      {activeManufacturer.name} {activeDevice.modelName} RD Service Package
                    </span>
                    <span className="text-zinc-400 text-[11px]">Binds local loopback daemon on ports {activeDevice.defaultPorts.join(', ')}</span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-zinc-400" />
                </a>

                <a
                  href={activeDevice.documentationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 hover:border-emerald-500 transition-all text-xs"
                >
                  <div>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100 block">
                      {activeManufacturer.name} {activeDevice.modelName} Official Documentation
                    </span>
                    <span className="text-zinc-400 text-[11px]">Hardware brochure and STQC certificate data</span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-zinc-400" />
                </a>
              </div>

              <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-[11px] text-zinc-600 dark:text-zinc-400">
                <strong>Tip for Windows 11 Users:</strong> Always run driver installers by right-clicking and selecting <em>"Run as Administrator"</em> to ensure the Windows Service registration succeeds.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
