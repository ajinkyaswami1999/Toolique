import type {
  Manufacturer,
  BiometricDevice,
  DiagnosticCheck,
  MockScenario,
  TroubleshootingGuideItem
} from '../types/biometric';

export const manufacturers: Manufacturer[] = [
  {
    id: 'mantra',
    name: 'Mantra Softech India Pvt. Ltd.',
    shortName: 'Mantra',
    country: 'India 🇮🇳',
    description: 'India\'s leading biometric authentication hardware manufacturer, widely used for AePS, Ayushman Bharat, PM-KISAN, and eKYC.',
    website: 'https://www.mantratec.com',
    isAvailable: true
  },
  {
    id: 'idemia_morpho',
    name: 'IDEMIA (Morpho)',
    shortName: 'Morpho / IDEMIA',
    country: 'France / India 🇫🇷🇮🇳',
    description: 'Global biometric identification leader powering Morpho MSO 1300 E3 Series with optical fingerprint algorithms.',
    website: 'https://www.idemia.com',
    isAvailable: true
  },
  {
    id: 'startek',
    name: 'Startek Engineering',
    shortName: 'Startek',
    country: 'Taiwan / India 🇹🇼🇮🇳',
    description: 'Renowned maker of FM220U L0/L1 optical fingerprint scanners used in banking CSPs and digital verification kiosks.',
    website: 'https://www.startek-eng.com',
    isAvailable: true
  },
  {
    id: 'secugen',
    name: 'SecuGen Corporation',
    shortName: 'SecuGen',
    country: 'United States 🇺🇸',
    description: 'Manufacturer of optical fingerprint sensors including Hamster Pro 20 series with rugged prism surfaces.',
    website: 'https://www.secugen.com',
    isAvailable: true
  },
  {
    id: 'precision',
    name: 'Precision Biometric',
    shortName: 'Precision',
    country: 'India 🇮🇳',
    description: 'Indian biometric OEM specializing in PB510 optical fingerprint scanners and iris recognition systems.',
    website: 'https://www.precisionbiometric.com',
    isAvailable: true
  }
];

export const biometricDevices: BiometricDevice[] = [
  // Mantra Softech
  {
    id: 'mantra-mfs110-l1',
    manufacturerId: 'mantra',
    modelName: 'Mantra MFS110 L1',
    certificationLevel: 'L1',
    modality: 'single_fingerprint',
    modalityLabel: 'Single Optical Fingerprint Scanner',
    sensorTechnology: 'Optical Scratch-Free Sensor (Platen Glass)',
    resolutionDpi: 500,
    platenSize: '15.0 mm × 20.0 mm',
    interfaceType: 'USB 2.0 High Speed (Type-A / Type-C)',
    supportedOS: ['Windows 10 (32/64-bit)', 'Windows 11 (64-bit)', 'Android 7.0+', 'Linux Ubuntu'],
    defaultPorts: [11100, 11101, 11102, 11103, 11104, 11105],
    stqcCertified: true,
    uidaiL1Approved: true,
    vendorId: '0x2802',
    productId: '0x001B',
    dpId: 'MANTRA.MSIPL',
    rdsId: 'MANTRA.WIN.001',
    serviceName: 'MantraMFS110AVDM',
    driverDownloadUrl: 'https://download.mantratecapp.com',
    rdServiceDownloadUrl: 'https://download.mantratecapp.com',
    documentationUrl: 'https://www.mantratec.com/products/Fingerprint-Scanner/MFS110-L1',
    isAvailable: true
  },
  {
    id: 'mantra-mfs100-l0',
    manufacturerId: 'mantra',
    modelName: 'Mantra MFS100 L0 (Legacy)',
    certificationLevel: 'L0',
    modality: 'single_fingerprint',
    modalityLabel: 'Single Optical Fingerprint Scanner',
    sensorTechnology: 'Optical Sensor',
    resolutionDpi: 500,
    platenSize: '14.0 mm × 18.0 mm',
    interfaceType: 'USB 2.0 High Speed',
    supportedOS: ['Windows 7', 'Windows 8', 'Windows 10', 'Windows 11'],
    defaultPorts: [11100, 11101, 11102, 11103],
    stqcCertified: true,
    uidaiL1Approved: false,
    vendorId: '0x2802',
    productId: '0x001A',
    dpId: 'MANTRA.MSIPL',
    rdsId: 'MANTRA.WIN.001',
    serviceName: 'MantraAVDM',
    driverDownloadUrl: 'https://download.mantratecapp.com',
    rdServiceDownloadUrl: 'https://download.mantratecapp.com',
    documentationUrl: 'https://www.mantratec.com',
    isAvailable: true
  },
  {
    id: 'mantra-mis100v2-l1',
    manufacturerId: 'mantra',
    modelName: 'Mantra MIS100V2 L1 (Iris Scanner)',
    certificationLevel: 'L1',
    modality: 'single_iris',
    modalityLabel: 'Single Eye Iris Recognition Scanner',
    sensorTechnology: 'Infrared Dual LED Optical Sensor',
    resolutionDpi: 500,
    platenSize: 'Capture Distance: 70–120 mm',
    interfaceType: 'USB 2.0 High Speed',
    supportedOS: ['Windows 10', 'Windows 11', 'Android'],
    defaultPorts: [11100, 11101, 11102],
    stqcCertified: true,
    uidaiL1Approved: true,
    vendorId: '0x2802',
    productId: '0x002B',
    dpId: 'MANTRA.MSIPL',
    rdsId: 'MANTRA.WIN.001',
    serviceName: 'MantraMIS100V2AVDM',
    driverDownloadUrl: 'https://download.mantratecapp.com',
    rdServiceDownloadUrl: 'https://download.mantratecapp.com',
    documentationUrl: 'https://www.mantratec.com',
    isAvailable: true
  },

  // IDEMIA (Morpho)
  {
    id: 'morpho-mso1300e3-l1',
    manufacturerId: 'idemia_morpho',
    modelName: 'Morpho MSO 1300 E3 L1',
    certificationLevel: 'L1',
    modality: 'single_fingerprint',
    modalityLabel: 'Single Optical Fingerprint Scanner',
    sensorTechnology: 'Patented Morpho Optical Technology',
    resolutionDpi: 500,
    platenSize: '14.0 mm × 22.0 mm',
    interfaceType: 'USB 2.0 High Speed',
    supportedOS: ['Windows 10 (32/64-bit)', 'Windows 11 (64-bit)', 'Android'],
    defaultPorts: [11102, 11100, 11101, 11103],
    stqcCertified: true,
    uidaiL1Approved: true,
    vendorId: '0x079B',
    productId: '0x0045',
    dpId: 'IDEMIA.MSIPL',
    rdsId: 'IDEMIA.WIN.001',
    serviceName: 'RDServiceL1',
    driverDownloadUrl: 'https://www.idemia.com',
    rdServiceDownloadUrl: 'https://rdserviceonline.com',
    documentationUrl: 'https://www.idemia.com',
    isAvailable: true
  },
  {
    id: 'morpho-mso1300e3-l0',
    manufacturerId: 'idemia_morpho',
    modelName: 'Morpho MSO 1300 E3 L0 (Legacy)',
    certificationLevel: 'L0',
    modality: 'single_fingerprint',
    modalityLabel: 'Single Optical Fingerprint Scanner',
    sensorTechnology: 'Morpho Optical Technology',
    resolutionDpi: 500,
    platenSize: '14.0 mm × 22.0 mm',
    interfaceType: 'USB 2.0',
    supportedOS: ['Windows 7', 'Windows 8', 'Windows 10', 'Windows 11'],
    defaultPorts: [11101, 11100, 11102],
    stqcCertified: true,
    uidaiL1Approved: false,
    vendorId: '0x079B',
    productId: '0x0024',
    dpId: 'MORPHO.SMARTCHIP',
    rdsId: 'MORPHO.WIN.001',
    serviceName: 'MorphoRdServiceL0Soft',
    driverDownloadUrl: 'https://rdserviceonline.com',
    rdServiceDownloadUrl: 'https://rdserviceonline.com',
    documentationUrl: 'https://rdserviceonline.com',
    isAvailable: true
  },

  // Startek Engineering
  {
    id: 'startek-fm220u-l1',
    manufacturerId: 'startek',
    modelName: 'Startek FM220U L1',
    certificationLevel: 'L1',
    modality: 'single_fingerprint',
    modalityLabel: 'Single Optical Fingerprint Scanner',
    sensorTechnology: 'Patented Startek Optical Sensor',
    resolutionDpi: 500,
    platenSize: '15.0 mm × 20.0 mm',
    interfaceType: 'USB 2.0 High Speed',
    supportedOS: ['Windows 10', 'Windows 11', 'Linux'],
    defaultPorts: [11100, 11101, 11102],
    stqcCertified: true,
    uidaiL1Approved: true,
    vendorId: '0x0BCA',
    productId: '0x8220',
    dpId: 'STARTEK.ENG',
    rdsId: 'STARTEK.WIN.001',
    serviceName: 'ACPL_L1_RDSERVICE',
    driverDownloadUrl: 'https://www.startek-eng.com',
    rdServiceDownloadUrl: 'https://www.startek-eng.com',
    documentationUrl: 'https://www.startek-eng.com',
    isAvailable: true
  },
  {
    id: 'startek-fm220u-l0',
    manufacturerId: 'startek',
    modelName: 'Startek FM220U L0 (Legacy)',
    certificationLevel: 'L0',
    modality: 'single_fingerprint',
    modalityLabel: 'Single Optical Fingerprint Scanner',
    sensorTechnology: 'Startek Optical Sensor',
    resolutionDpi: 500,
    platenSize: '15.0 mm × 20.0 mm',
    interfaceType: 'USB 2.0',
    supportedOS: ['Windows 7', 'Windows 8', 'Windows 10', 'Windows 11'],
    defaultPorts: [11100, 11101],
    stqcCertified: true,
    uidaiL1Approved: false,
    vendorId: '0x0BCA',
    productId: '0x8210',
    dpId: 'STARTEK.ENG',
    rdsId: 'STARTEK.WIN.001',
    serviceName: 'ACPL_FM220_RDSERVICE',
    driverDownloadUrl: 'https://www.startek-eng.com',
    rdServiceDownloadUrl: 'https://www.startek-eng.com',
    documentationUrl: 'https://www.startek-eng.com',
    isAvailable: true
  },

  // SecuGen Corporation
  {
    id: 'secugen-hamster-pro20-l1',
    manufacturerId: 'secugen',
    modelName: 'SecuGen Hamster Pro 20 (HUPx) L1',
    certificationLevel: 'L1',
    modality: 'single_fingerprint',
    modalityLabel: 'Single Optical Fingerprint Scanner',
    sensorTechnology: 'Ruggedized Prism Optical Sensor (SEIR)',
    resolutionDpi: 500,
    platenSize: '16.1 mm × 18.2 mm',
    interfaceType: 'USB 2.0 High Speed',
    supportedOS: ['Windows 10', 'Windows 11', 'Android'],
    defaultPorts: [11100, 11101, 11102],
    stqcCertified: true,
    uidaiL1Approved: true,
    vendorId: '0x1162',
    productId: '0x2200',
    dpId: 'SECUGEN.CORP',
    rdsId: 'SECUGEN.WIN.001',
    driverDownloadUrl: 'https://www.secugen.com/download/',
    rdServiceDownloadUrl: 'https://www.secugen.com/download/',
    documentationUrl: 'https://www.secugen.com',
    isAvailable: true
  },
  {
    id: 'secugen-hamster-pro20-l0',
    manufacturerId: 'secugen',
    modelName: 'SecuGen Hamster Pro 20 L0 (Legacy)',
    certificationLevel: 'L0',
    modality: 'single_fingerprint',
    modalityLabel: 'Single Optical Fingerprint Scanner',
    sensorTechnology: 'Prism Optical Sensor',
    resolutionDpi: 500,
    platenSize: '16.1 mm × 18.2 mm',
    interfaceType: 'USB 2.0',
    supportedOS: ['Windows 7', 'Windows 8', 'Windows 10', 'Windows 11'],
    defaultPorts: [11100, 11101],
    stqcCertified: true,
    uidaiL1Approved: false,
    vendorId: '0x1162',
    productId: '0x0320',
    dpId: 'SECUGEN.CORP',
    rdsId: 'SECUGEN.WIN.001',
    driverDownloadUrl: 'https://www.secugen.com/download/',
    rdServiceDownloadUrl: 'https://www.secugen.com/download/',
    documentationUrl: 'https://www.secugen.com',
    isAvailable: true
  },

  // Precision Biometric
  {
    id: 'precision-pb510-l1',
    manufacturerId: 'precision',
    modelName: 'Precision PB510 L1',
    certificationLevel: 'L1',
    modality: 'single_fingerprint',
    modalityLabel: 'Single Optical Fingerprint Scanner',
    sensorTechnology: 'High Precision Scratch-Resistant Optical Glass',
    resolutionDpi: 500,
    platenSize: '15.0 mm × 20.0 mm',
    interfaceType: 'USB 2.0 High Speed',
    supportedOS: ['Windows 10', 'Windows 11'],
    defaultPorts: [11100, 11101, 11102],
    stqcCertified: true,
    uidaiL1Approved: true,
    vendorId: '0x1C7A',
    productId: '0x0510',
    dpId: 'PRECISION.BIO',
    rdsId: 'PRECISION.WIN.001',
    driverDownloadUrl: 'https://www.precisionbiometric.com',
    rdServiceDownloadUrl: 'https://www.precisionbiometric.com',
    documentationUrl: 'https://www.precisionbiometric.com',
    isAvailable: true
  },
  {
    id: 'precision-csd200',
    manufacturerId: 'precision',
    modelName: 'Precision CSD200 Optical',
    certificationLevel: 'L0',
    modality: 'single_fingerprint',
    modalityLabel: 'Single Optical Fingerprint Scanner',
    sensorTechnology: 'Standard Optical Glass Sensor',
    resolutionDpi: 500,
    platenSize: '14.0 mm × 18.0 mm',
    interfaceType: 'USB 2.0',
    supportedOS: ['Windows 7', 'Windows 8', 'Windows 10', 'Windows 11'],
    defaultPorts: [11100, 11101],
    stqcCertified: true,
    uidaiL1Approved: false,
    vendorId: '0x1C7A',
    productId: '0x0200',
    dpId: 'PRECISION.BIO',
    rdsId: 'PRECISION.WIN.001',
    driverDownloadUrl: 'https://www.precisionbiometric.com',
    rdServiceDownloadUrl: 'https://www.precisionbiometric.com',
    documentationUrl: 'https://www.precisionbiometric.com',
    isAvailable: true
  }
];

export const defaultDiagnosticChecks: DiagnosticCheck[] = [
  {
    id: 'browser_compatibility',
    title: '1. Browser Security Sandbox & Environment',
    description: 'Verifies browser transport capabilities, Private Network Access (PNA) permissions, and loopback communication rules on Windows 10/11.',
    status: 'idle',
    logs: ['Waiting to initialize environment audit...']
  },
  {
    id: 'loopback_reachability',
    title: '2. Local Loopback Socket Reachability',
    description: 'Scans vendor RD Service loopback ports (11100 through 11105 on 127.0.0.1) to confirm local daemon binding.',
    status: 'idle',
    logs: ['Ready to ping localhost socket ports...']
  },
  {
    id: 'rd_service_discovery',
    title: '3. RD Service Discovery Handshake',
    description: 'Executes standard RDSERVICE discovery verb on detected active loopback port to obtain driver runtime metadata.',
    status: 'idle',
    logs: ['Waiting for loopback handshake trigger...']
  },
  {
    id: 'device_detection',
    title: '4. Physical Hardware & USB Enumeration',
    description: 'Verifies USB biometric device attachment, Vendor ID (VID), Product ID (PID), and serial number registration.',
    status: 'idle',
    logs: ['Waiting for device enumeration check...']
  },
  {
    id: 'service_readiness',
    title: '5. Service Readiness & Registration State',
    description: 'Checks whether RD Service reports status="READY", validating Device Provider ID (dpId) and Management Client (mc).',
    status: 'idle',
    logs: ['Waiting for readiness verification...']
  },
  {
    id: 'l1_certificate_validation',
    title: '6. UIDAI Security & Certificate Attestation',
    description: 'Confirms cryptographic signing keys, hardware root-of-trust, and L0/L1 compliance per UIDAI security mandates.',
    status: 'idle',
    logs: ['Waiting for compliance verification...']
  }
];

export const mockScenarios: MockScenario[] = [
  {
    id: 'healthy_device',
    label: '🟢 All Checks Passing (Healthy Biometric Device)',
    description: 'Simulates a fully configured UIDAI biometric device connected to Windows 10/11 with RD Service active and ready.',
    outcomes: {
      browser_compatibility: {
        status: 'pass',
        durationMs: 45,
        message: 'Browser environment fully compatible with local loopback RD Service requests.',
        technicalDetails: 'User-Agent verified on Windows NT 10.0 (Win 10/11). Web Crypto API enabled. Private Network Access (PNA) permits loopback fetch.',
        logs: [
          'Checking window.crypto: available',
          'Evaluating Fetch API support: OK',
          'Detecting OS platform: Windows 10/11 64-bit detected',
          'Security context: Secure context confirmed'
        ]
      },
      loopback_reachability: {
        status: 'pass',
        durationMs: 120,
        message: 'Active vendor RD Service daemon detected on loopback port 11100.',
        technicalDetails: 'Successfully connected to http://127.0.0.1:11100/ within 120ms. Port is bound by local biometric driver daemon.',
        logs: [
          'Probing port 11100 on 127.0.0.1: Connection established (HTTP 200 OK)',
          'Port 11100 state: LISTENING',
          'Latency: 120ms'
        ]
      },
      rd_service_discovery: {
        status: 'pass',
        durationMs: 180,
        message: 'RDSERVICE verb returned valid discovery XML descriptor.',
        technicalDetails: 'Received <RDService status="READY" info="Biometric Authentication Vendor Device Info">',
        rawPayload: `<?xml version="1.0"?>
<RDService status="READY" info="Biometric Authentication Vendor Device Info">
  <Interface id="CAPTURE" path="/rd/capture" />
  <Interface id="INFO" path="/rd/info" />
</RDService>`,
        logs: [
          'Dispatching RDSERVICE discovery request to http://127.0.0.1:11100/',
          'Received response headers: Content-Type: text/xml; charset=utf-8',
          'Parsed Interface CAPTURE: /rd/capture',
          'Parsed Interface INFO: /rd/info'
        ]
      },
      device_detection: {
        status: 'pass',
        durationMs: 210,
        message: 'Hardware detected: Biometric USB Scanner attached and enumerated.',
        technicalDetails: 'Hardware USB descriptors verified. Device serial number synchronized.',
        logs: [
          'Calling device info endpoint /rd/info',
          'USB Vendor ID: Validated',
          'Hardware model: Connected',
          'Serial number: Verified'
        ]
      },
      service_readiness: {
        status: 'pass',
        durationMs: 160,
        message: 'Device state: READY. Ready for biometric workflow testing.',
        technicalDetails: 'dpId and rdsId verified. Management Client certificate valid.',
        rawPayload: `<DeviceInfo dpId="VENDOR.DP" rdsId="VENDOR.RDS" rdsVer="1.0.4" dc="DCD99281A" mi="BIOMETRIC-SCANNER" mc="CERT_VALID_2026">
  <additional_info>
    <Param name="srno" value="BIO-2026-884912" />
    <Param name="sysid" value="WIN10-SECURE-NODE" />
  </additional_info>
</DeviceInfo>`,
        logs: [
          'Parsing DeviceInfo attributes: status="READY"',
          'Validating Device Provider ID (dpId): Valid',
          'Management Client Token (mc): Present and signed',
          'Device ready for capture requests'
        ]
      },
      l1_certificate_validation: {
        status: 'pass',
        durationMs: 140,
        message: 'UIDAI Cryptographic Attestation Verified: Hardware/Software Signing validated.',
        technicalDetails: 'Device is STQC & UIDAI certified. Biometric data signing verified for selected environment.',
        logs: [
          'Evaluating attestation payload: Verified',
          'Cryptographic key level: UIDAI Approved',
          'Complies with UIDAI registered device specifications'
        ]
      }
    }
  },
  {
    id: 'device_unplugged',
    label: '🔴 Device Disconnected (USB Unplugged - Error 1140)',
    description: 'Simulates RD Service running properly, but the physical biometric USB cable is detached from the computer.',
    outcomes: {
      browser_compatibility: {
        status: 'pass',
        durationMs: 40,
        message: 'Browser environment compatible.',
        logs: ['Browser check: OK']
      },
      loopback_reachability: {
        status: 'pass',
        durationMs: 95,
        message: 'Vendor RD Service is running on port 11100.',
        logs: ['Connected to 127.0.0.1:11100']
      },
      rd_service_discovery: {
        status: 'pass',
        durationMs: 130,
        message: 'RD Service responded: status="NOTREADY".',
        technicalDetails: '<RDService status="NOTREADY" info="Device not attached">',
        rawPayload: `<?xml version="1.0"?>
<RDService status="NOTREADY" info="Device not attached">
  <Interface id="CAPTURE" path="/rd/capture" />
  <Interface id="INFO" path="/rd/info" />
</RDService>`,
        logs: [
          'RD Service reachable, but status attribute is "NOTREADY"'
        ]
      },
      device_detection: {
        status: 'fail',
        durationMs: 250,
        message: 'Failure: No biometric hardware detected on USB bus (Error 1140).',
        technicalDetails: 'Scanner was not found. Win32 USB hub enumeration failed to find device descriptor.',
        recommendation: 'Check USB cable. Try inserting into a direct USB 2.0/3.0 motherboard port rather than an unpowered USB hub. Ensure Windows device manager does not display an exclamation mark (!).',
        logs: [
          'Probing USB device descriptor...',
          'No USB device matched expected Vendor ID',
          'Returned Error Code: 1140 (Device not attached)'
        ]
      },
      service_readiness: {
        status: 'skipped',
        durationMs: 0,
        message: 'Skipped: Cannot check readiness while device is disconnected.',
        logs: ['Skipped due to prior failure']
      },
      l1_certificate_validation: {
        status: 'skipped',
        durationMs: 0,
        message: 'Skipped: Hardware must be attached to verify security certificate.',
        logs: ['Skipped due to prior failure']
      }
    }
  },
  {
    id: 'rdservice_stopped',
    label: '🔴 RD Service Daemon Stopped (Port Unreachable)',
    description: 'Simulates background vendor RD Service being stopped or blocked by Windows Defender Firewall.',
    outcomes: {
      browser_compatibility: {
        status: 'pass',
        durationMs: 42,
        message: 'Browser environment compatible.',
        logs: ['Browser check: OK']
      },
      loopback_reachability: {
        status: 'fail',
        durationMs: 1200,
        message: 'Failed: Unable to connect to loopback ports 11100–11105 (Connection Refused).',
        technicalDetails: 'Fetch to http://127.0.0.1:11100 resulted in ERR_CONNECTION_REFUSED. No daemon is listening on local ports.',
        recommendation: 'Press Win + R, type services.msc, locate your vendor RD Service, and click "Start" or "Restart". Ensure Windows Defender Firewall is not blocking port 11100.',
        logs: [
          'Probing port 11100 on 127.0.0.1... Connection refused',
          'Probing port 11101 on 127.0.0.1... Connection refused',
          'Probing port 11102 on 127.0.0.1... Connection refused',
          'Probing port 11103 on 127.0.0.1... Connection refused',
          'Probing port 11104 on 127.0.0.1... Connection refused',
          'Probing port 11105 on 127.0.0.1... Connection refused',
          'Result: No active RD Service listening'
        ]
      },
      rd_service_discovery: {
        status: 'skipped',
        durationMs: 0,
        message: 'Skipped: Loopback connection failed.',
        logs: ['Skipped']
      },
      device_detection: {
        status: 'skipped',
        durationMs: 0,
        message: 'Skipped: RD Service daemon is not running.',
        logs: ['Skipped']
      },
      service_readiness: {
        status: 'skipped',
        durationMs: 0,
        message: 'Skipped: Cannot query device status without active daemon.',
        logs: ['Skipped']
      },
      l1_certificate_validation: {
        status: 'skipped',
        durationMs: 0,
        message: 'Skipped.',
        logs: ['Skipped']
      }
    }
  },
  {
    id: 'mixed_content_block',
    label: '🟡 Browser HTTPS / Localhost Restriction (Inconclusive)',
    description: 'Simulates modern browser blocking unencrypted HTTP loopback requests from an HTTPS origin (Mixed Content / CORS).',
    outcomes: {
      browser_compatibility: {
        status: 'inconclusive',
        durationMs: 65,
        message: 'Inconclusive: Browser Mixed-Content or Private Network Access policy may restrict plain HTTP loopback calls.',
        technicalDetails: 'Request from HTTPS to http://127.0.0.1 may trigger browser security shield. Chrome & Edge require localhost allowance flags or HTTPS RD Service certificate.',
        recommendation: 'In Google Chrome or Microsoft Edge, navigate to chrome://flags/#allow-insecure-localhost and toggle to "Enabled". Alternatively, ensure your vendor RD Service is updated to the SSL-enabled build.',
        logs: [
          'Inspecting origin protocol: HTTPS',
          'Target socket protocol: HTTP (127.0.0.1:11100)',
          'Checking Private Network Access preflight behavior: Potential restriction flag detected',
          'Status set to Inconclusive pending browser permission verification'
        ]
      },
      loopback_reachability: {
        status: 'pass',
        durationMs: 140,
        message: 'Loopback port responded after browser preflight.',
        logs: ['Port 11100 reachable']
      },
      rd_service_discovery: {
        status: 'pass',
        durationMs: 170,
        message: 'Discovery completed.',
        logs: ['Discovery OK']
      },
      device_detection: {
        status: 'pass',
        durationMs: 190,
        message: 'Biometric hardware attached.',
        logs: ['Device detected']
      },
      service_readiness: {
        status: 'pass',
        durationMs: 150,
        message: 'Service is READY.',
        logs: ['Ready']
      },
      l1_certificate_validation: {
        status: 'pass',
        durationMs: 130,
        message: 'Certificate verified.',
        logs: ['Attestation verified']
      }
    }
  },
  {
    id: 'unregistered_management',
    label: '🟡 Management Server Sync Pending (Error 720 / Not Registered)',
    description: 'Device is connected and daemon is running, but the hardware has not completed online registration with vendor Management Server.',
    outcomes: {
      browser_compatibility: {
        status: 'pass',
        durationMs: 40,
        message: 'Browser environment OK.',
        logs: ['OK']
      },
      loopback_reachability: {
        status: 'pass',
        durationMs: 110,
        message: 'Port 11100 reachable.',
        logs: ['OK']
      },
      rd_service_discovery: {
        status: 'pass',
        durationMs: 140,
        message: 'Discovery responded: status="NOTREADY".',
        logs: ['Discovery responded']
      },
      device_detection: {
        status: 'pass',
        durationMs: 180,
        message: 'Biometric scanner detected via USB.',
        logs: ['Hardware present']
      },
      service_readiness: {
        status: 'fail',
        durationMs: 220,
        message: 'Failure: Device is NOT READY — Management Server registration incomplete (Error 720).',
        technicalDetails: 'mc="" (Empty Management Certificate). Device serial number has not completed online handshake with vendor Management Server (KMS).',
        recommendation: 'Ensure your Windows PC has active internet access. Unplug and replug the biometric USB cable to initiate automatic registration sync. If error persists, open vendor Client Tool and click "Initialize".',
        rawPayload: `<DeviceInfo dpId="VENDOR.DP" rdsId="VENDOR.RDS" rdsVer="1.0.4" dc="" mi="BIOMETRIC-SCANNER" mc="">
  <additional_info>
    <Param name="error" value="720" />
    <Param name="error_desc" value="Device not registered in management server" />
  </additional_info>
</DeviceInfo>`,
        logs: [
          'DeviceInfo query completed',
          'Attribute mc (Management Client) is empty',
          'Error 720: Device not registered with vendor Management Server'
        ]
      },
      l1_certificate_validation: {
        status: 'inconclusive',
        durationMs: 80,
        message: 'Inconclusive: Cryptographic token handshake pending online server registration.',
        logs: ['Attestation pending server sync']
      }
    }
  },
  {
    id: 'vendor_mismatch',
    label: '🟠 Device/Vendor Mismatch (Selected Device ≠ Active Port Service)',
    description: 'Simulates selecting a device (e.g. Morpho L1) when a different biometric scanner (e.g. Mantra MFS110) is active on the local port.',
    outcomes: {
      browser_compatibility: {
        status: 'pass',
        durationMs: 35,
        message: 'Browser environment supports loopback fetch.',
        logs: ['Environment OK']
      },
      loopback_reachability: {
        status: 'fail',
        durationMs: 120,
        message: 'Vendor Mismatch: Target RD Service not found on expected ports.',
        technicalDetails: 'Port 11100 is listening, but returned identity for a different biometric manufacturer.',
        recommendation: 'Check which scanner is physically connected. Use the Auto-Switch button to align your selection, or start the matching vendor RD Service.',
        logs: [
          'Probing ports 11100–11105...',
          'Port 11100 responded: info="Mantra MFS110 Authentication Vendor Device Manager"',
          'Mismatch detected: Active service does not match selected manufacturer'
        ]
      },
      rd_service_discovery: {
        status: 'fail',
        durationMs: 140,
        message: 'Mismatched discovery: Expected vendor daemon missing.',
        logs: ['Discovery rejected due to vendor mismatch']
      },
      device_detection: {
        status: 'fail',
        durationMs: 160,
        message: 'Selected hardware model not detected.',
        logs: ['Hardware mismatch: USB VID/PID does not match selected model']
      },
      service_readiness: {
        status: 'skipped',
        durationMs: 0,
        message: 'Skipped: Cannot evaluate readiness of mismatched hardware.',
        logs: ['Skipped']
      },
      l1_certificate_validation: {
        status: 'skipped',
        durationMs: 0,
        message: 'Skipped: Security certificates cannot be verified for mismatched device.',
        logs: ['Skipped']
      }
    }
  }
];

export const troubleshootingGuides: TroubleshootingGuideItem[] = [
  {
    id: 'err-1140',
    category: 'hardware',
    categoryLabel: 'Hardware & USB',
    title: 'Error 1140: Biometric Device Not Attached / USB Disconnected',
    errorCode: '1140 / -1140',
    symptoms: [
      'RD Service displays "Device not attached" or Error 1140.',
      'Sensor LED does not glow upon connection.',
      'Windows plays USB disconnect chime intermittently.'
    ],
    rootCause: 'Windows USB controller suspended the port power, the USB cable has voltage drop on front-panel ports, or device driver is unassigned.',
    resolutionSteps: [
      'Unplug the scanner from front USB ports and plug it directly into a rear motherboard USB port (prefer USB 2.0/3.0 port).',
      'Open Windows Device Manager (press Win + X, select Device Manager) and verify that your scanner appears under Universal Serial Bus devices with no yellow warning triangle (!).',
      'Disable USB Selective Suspend: Open Windows Power Options > Edit Plan Settings > Change advanced power settings > USB settings > USB selective suspend setting > set to "Disabled".',
      'Restart the vendor RD Service from Windows services.msc.'
    ],
    affectedDevices: ['Mantra (MFS110 L1, MFS100 L0)', 'IDEMIA / Morpho (MSO 1300 E3)', 'Startek (FM220U)', 'SecuGen (Hamster Pro 20)', 'Precision (PB510)'],
    windowsVersions: ['Windows 10 (32/64-bit)', 'Windows 11 (64-bit)']
  },
  {
    id: 'err-service-down',
    category: 'service',
    categoryLabel: 'RD Service Daemon',
    title: 'RD Service Not Running / Connection Refused on Loopback Ports',
    errorCode: 'CONN_REFUSED / Port 11100',
    symptoms: [
      'Tester shows "Failed: Unable to connect to loopback ports 11100–11105".',
      'Banking portal or AePS website shows "RD Service Not Found".',
      'No popup for "Device attached" when plugging in USB.'
    ],
    rootCause: 'The background Windows vendor service failed to auto-start during Windows boot or was stopped by an antivirus suite.',
    resolutionSteps: [
      'Press `Win + R` on your keyboard, type `services.msc`, and press Enter.',
      'Scroll down to find your vendor RD Service (e.g., Mantra AVDM, Morpho RD Service, Startek RD Service, SecuGen RD Service).',
      'Right-click the service and select "Restart" (or "Start" if stopped).',
      'Right-click > Properties > ensure "Startup type" is set to "Automatic".',
      'Open PowerShell as Administrator and run: `Get-Service *RD* | Restart-Service`.'
    ],
    affectedDevices: ['Mantra', 'IDEMIA / Morpho', 'Startek', 'SecuGen', 'Precision'],
    windowsVersions: ['Windows 10', 'Windows 11']
  },
  {
    id: 'err-720',
    category: 'registration',
    categoryLabel: 'Management Server',
    title: 'Error 720: Device Not Registered in Management Server (KMS)',
    errorCode: 'Error 720 / Unregistered',
    symptoms: [
      'Device light blinks once but capture does not start.',
      'RD Service Info status shows "NOTREADY" with error 720.',
      'AePS / PM-KISAN portal shows "Device authentication failed".'
    ],
    rootCause: 'Every UIDAI biometric device must register its unique hardware serial number with the manufacturer\'s cloud management server (KMS) over HTTPS. This occurs when the computer has no internet access or server sync failed.',
    resolutionSteps: [
      'Ensure the Windows 10/11 computer has a stable, active internet connection.',
      'Unplug the biometric USB cable, wait 5 seconds, and plug it back in. Observe the bottom-right taskbar for a popup notification stating "Device Attached" followed by "Device Ready for Use".',
      'Ensure port 443 (HTTPS) to the manufacturer management server is not blocked by corporate firewalls or proxies.',
      'Download and run the official vendor Test Tool as Administrator to force a server synchronization.'
    ],
    affectedDevices: ['All UIDAI L1 & L0 Certified Devices'],
    windowsVersions: ['Windows 10', 'Windows 11']
  },
  {
    id: 'err-browser-ssl',
    category: 'browser',
    categoryLabel: 'Browser & SSL Policy',
    title: 'Chrome / Edge Mixed Content & Localhost SSL Shield',
    errorCode: 'ERR_SSL_PROTOCOL_ERROR / PNA Block',
    symptoms: [
      'Tester or banking website stays stuck on "Searching for RD Service...".',
      'Browser Developer Console (F12) displays `Cross-Origin Request Blocked` or `Mixed Content: The page was loaded over HTTPS, but requested an insecure resource http://127.0.0.1:11100/`.',
      'Private Network Access (PNA) warning appears in browser console.'
    ],
    rootCause: 'Modern Chromium browsers (Chrome 120+, Edge 120+) strictly block unencrypted HTTP communication between HTTPS web applications and localhost (127.0.0.1) under Private Network Access security rules.',
    resolutionSteps: [
      'Open Google Chrome or Microsoft Edge and navigate to: `chrome://flags/#allow-insecure-localhost` (or `edge://flags/#allow-insecure-localhost`).',
      'Locate the setting "Allow invalid certificates for resources loaded from localhost" and change it from "Default" to "Enabled".',
      'Click the "Relaunch" button at the bottom of the browser window.',
      'Ensure your vendor RD Service is upgraded to the latest version supporting HTTPS loopback certificates.'
    ],
    affectedDevices: ['All Biometric RD Services (Mantra, Morpho, Startek, SecuGen, Precision)'],
    windowsVersions: ['Windows 10', 'Windows 11']
  },
  {
    id: 'err-l0-to-l1-migration',
    category: 'driver',
    categoryLabel: 'UIDAI L1 Mandate',
    title: 'UIDAI L0 Sunset & Mandatory Migration to Level 1 (L1) Hardware',
    errorCode: 'UIDAI Circular / L0 Expired',
    symptoms: [
      'Legacy L0 device works on tester but gets rejected with "L0 devices discontinued" on live government portals (AePS, Ayushman Bharat, DBT, Jeevan Pramaan).',
      'Portal reports "UIDAI Compliance Level 1 required".'
    ],
    rootCause: 'UIDAI issued a nationwide security mandate phasing out all Level 0 (L0) biometric devices. Level 1 (L1) devices feature hardware-level biometric signing and secure boot to prevent replay attacks.',
    resolutionSteps: [
      'Check the physical label on the back of your device. If it says "L0" or lacks the "L1" badge, it is a legacy device.',
      'Procure an authentic UIDAI-approved Level 1 scanner from an authorized vendor (Mantra, IDEMIA, Startek, SecuGen, or Precision).',
      'Uninstall legacy L0 drivers from Windows Control Panel > Programs and Features.',
      'Download and install the official L1 Driver and L1 RD Service package for your model.'
    ],
    affectedDevices: ['Legacy L0 Devices (Phased Out) -> Active L1 Certified Hardware'],
    windowsVersions: ['Windows 10', 'Windows 11']
  }
];
