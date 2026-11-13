import type { Tool } from './types';

export const complianceTools: Tool[] = [
  {
    id: 'BiometricDeviceTester',
    slug: 'biometric-device-tester',
    name: 'Biometric Device Tester & UIDAI RD Service Diagnostics (L0 & L1)',
    category: 'uidai-aadhaar',
    shortDescription: 'Test Aadhaar biometric fingerprint and iris scanners (Mantra, Morpho, Startek, SecuGen, Precision), verify RD Service loopback connectivity on Windows 10/11, test capture in Production & Pre-Production (P/PP), and troubleshoot UIDAI errors.',
    metaTitle: 'Mantra & Morpho RD Service Test Online | UIDAI L1/L0 Biometric Device Tester',
    metaDescription: 'Free online Mantra (MFS110 L1 / MFS100), Morpho (MSO 1300 E3), Startek & SecuGen RD Service tester for Windows 10/11 & Android. Check loopback ports 11100–11105, test capture in P/PP environment, resolve Error 1140, 720, 1001, and verify STQC L1 certification for AePS, PM-KISAN & eKYC.',
    keywords: [
      'Mantra RD service test online',
      'Morpho RD service test page online',
      'Biometric device tester',
      'RD Service test online',
      'Mantra MFS110 L1 tester',
      'Morpho MSO 1300 E3 RD service',
      'Startek FM220U RD service test',
      'SecuGen Hamster Pro 20 RD service',
      'Precision PB510 L1 tester',
      'UIDAI L1 biometric device test',
      'Aadhaar biometric tester',
      'RD service port 11100 test',
      'UIDAI env P vs PP capture test',
      'Error 1140 device not attached solution',
      'Error 720 not registered in management server fix',
      'Error 1001 device not whitelisted fix',
      'AePS biometric scanner test online',
      'Iris scanner RD service test online',
      'CSC VLE biometric device check'
    ],
    icon: 'Fingerprint',
    howToUse: [
      'Select your biometric hardware manufacturer (Mantra, Morpho, Startek, SecuGen, Precision) and specific device model.',
      'Select your UIDAI Environment: Production ("P") for live auth or Pre-Production ("PP") for sandbox staging.',
      'Choose between "Mock Simulator" for sandbox testing or "Live USB" to test your local Windows 10/11 machine.',
      'Click "Run All Diagnostics" or "Trigger Biometric Capture" to test RD Service connectivity, USB detection, and sensor response.',
      'Use the Interactive Port Matrix Radar (11100–11105) to detect active daemons and verify socket latency.',
      'Review real-time Pass, Fail, Inconclusive, and Skipped badges, and inspect protocol XML telemetry or troubleshooting steps.',
      'Click "Export Health Report" to copy or print a verified hardware diagnostic certificate for banking support.'
    ],
    faqs: [
      {
        question: 'How do I test my Mantra MFS110 L1 or MFS100 scanner online?',
        answer: 'Plug your Mantra scanner into a rear USB port on your Windows 10/11 PC. Select "Mantra" and your model in Toolique, switch mode to "Live USB", and click "Run All Diagnostics". The tester will probe loopback ports 11100–11105, verify that the Mantra AVDM service is listening, inspect registration status with Mantra KMS, and test biometric capture with live quality score feedback.'
      },
      {
        question: 'How do I test Morpho (IDEMIA) MSO 1300 E3 RD Service online?',
        answer: 'Ensure the Morpho RD Service driver is installed from rdserviceonline.com. Select "IDEMIA (Morpho)" in the tester. The tool sends an HTTP RDSERVICE handshake to local ports (default 11100) to verify device info and capture readiness. If you receive Error 1001 or 1003, check your annual RD Service whitelisting validity.'
      },
      {
        question: 'What is the difference between UIDAI L0 and L1 biometric devices?',
        answer: 'Level 0 (L0) devices sign biometric data at the software/driver layer, making them vulnerable to software tampering or replay attacks. Level 1 (L1) devices like the Mantra MFS110 L1 and Morpho MSO 1300 E3 L1 sign the biometric sample using hardware cryptographic keys inside a trusted execution environment (TEE/Secure Boot) embedded directly on the physical scanner before transmitting data to the PC.'
      },
      {
        question: 'Which loopback ports does biometric RD Service use on Windows 10 and 11?',
        answer: 'UIDAI Registered Device specifications mandate vendor daemons to listen on local loopback IP 127.0.0.1 across port range 11100 to 11105. By default, Mantra, Morpho, Startek, and SecuGen prioritize port 11100. If 11100 is occupied by another process, the daemon incrementally binds to 11101, 11102, up to 11105.'
      },
      {
        question: 'How do I resolve Mantra Error 1140 ("Device not attached")?',
        answer: 'Error 1140 occurs when the RD Service daemon is running but cannot detect the physical MFS110/MFS100 USB device. To resolve it: (1) Connect the scanner directly to a rear motherboard USB 2.0 or 3.0 port rather than an unpowered USB hub, (2) Disable Windows USB Selective Suspend in Power Options, (3) Check Device Manager to ensure the device shows up under USB devices without an exclamation mark, and (4) Restart the Mantra RD Service in services.msc.'
      },
      {
        question: 'What causes Mantra Error 720 ("Device not registered in management server")?',
        answer: 'Error 720 indicates that the hardware serial number has not completed online key exchange with Mantra\'s cloud Management Server. Every UIDAI L1 device must synchronize its cryptographic certificate with the manufacturer. Ensure your PC has active internet access, unplug the USB cable, wait 5 seconds, and plug it back in so the daemon can automatically complete online registration.'
      },
      {
        question: 'What causes Morpho Error 1001 or 1003 ("Device not whitelisted / validity expired")?',
        answer: 'Error 1001 or 1003 indicates that the annual RD Service AMC subscription for your Morpho scanner has expired or the serial number is not registered on rdserviceonline.com. Visit rdserviceonline.com, check device validity using the serial number on the bottom label, renew the token if expired, and reconnect the device.'
      },
      {
        question: 'Why does Google Chrome or Microsoft Edge block localhost RD Service requests?',
        answer: 'Modern web browsers enforce Private Network Access (PNA) and Mixed-Content policies, which restrict unencrypted HTTP requests from HTTPS websites to 127.0.0.1. To allow testing, open chrome://flags/#allow-insecure-localhost (or edge://flags/#allow-insecure-localhost), enable the flag, and restart the browser, or ensure you are running the latest SSL-enabled RD Service package.'
      },
      {
        question: 'How do I fix UIDAI Error 219 / 811 ("Timestamp out of sync")?',
        answer: 'UIDAI authentication servers enforce strict replay protection. If the Windows clock differs by more than ±5 minutes from Indian Standard Time (IST), the encrypted timestamp in the PID block is rejected. Right-click the Windows clock, select "Adjust date and time", turn on "Set time automatically", set Time Zone to (UTC+05:30) Chennai, Kolkata, Mumbai, New Delhi, and click "Sync now".'
      },
      {
        question: 'Which biometric scanners are required for AePS cash withdrawal and PM-KISAN in 2026?',
        answer: 'UIDAI circulars have phased out Level 0 (L0) devices across all commercial banking and citizen service networks. AePS (NPCI), DigiPay (CSC), Spice Money, Fino Payments Bank, Payworld, and PM-KISAN require certified Level 1 (L1) devices such as the Mantra MFS110 L1, Morpho MSO 1300 E3 L1, Startek FM220U L1, or SecuGen Hamster Pro 20 L1.'
      },
      {
        question: 'Does Toolique collect or upload my fingerprint data?',
        answer: 'Never. Toolique is architected on a zero-retention, client-side first foundation. We do not capture, record, save, or transmit fingerprint templates, ISO minutiae (FMR/FIR), PID blocks, or personal identity numbers. The tool is strictly designed for hardware health checks, driver verification, port reachability audits, and technician troubleshooting.'
      },
      {
        question: 'How do I restart the RD Service daemon in Windows 10/11?',
        answer: 'Press Win + R on your Windows keyboard, type services.msc, and press Enter. Locate your vendor service ("Mantra AVDM", "Morpho RD Service", "Startek RD Service", or "SecuGen RD Service") in the services list, right-click it, and select "Restart". Alternatively, open PowerShell as Administrator and run: Get-Service *RD* | Restart-Service.'
      }
    ],
    sections: [
      {
        title: 'Architecture of the UIDAI Registered Device (RD) Service Ecosystem',
        content: 'The Unique Identification Authority of India (UIDAI) mandated the Registered Device (RD) Service architecture to replace public device models. Under this model, biometric hardware vendors develop a local daemon service (AVDM - Authentication Vendor Device Module) that abstracts the physical scanner. Web applications and banking portals (AePS, eKYC, Jeevan Pramaan) never directly access raw biometric hardware or raw images; instead, they communicate over HTTP/HTTPS loopback sockets with the vendor RD Service, which encrypts biometric samples into standard PID (Personal Identity Data) blocks using UIDAI 2048-bit public keys.'
      },
      {
        title: 'UIDAI L1 Security Architecture: Hardware Key Signing vs L0 Legacy Software',
        content: 'UIDAI circulars mandated the phase-out of Level 0 (L0) devices in favor of Level 1 (L1) devices such as the Mantra MFS110 L1 and Morpho MSO 1300 E3 L1. While L0 devices performed encryption and digital signing within software drivers running on the host Windows machine, L1 devices feature dedicated secure microcontrollers with hardware-enforced Secure Boot and tamper-proof cryptographic enclaves. The biometric capture, quality evaluation, and asymmetric key signing take place entirely on the sensor hardware before the encrypted payload ever touches the host operating system, preventing man-in-the-middle and replay exploits.'
      },
      {
        title: 'Localhost Loopback Network Flow & Port Allocation (11100–11105)',
        content: 'The RD Service specification establishes that vendor daemons must listen on local loopback sockets (127.0.0.1) across port range 11100 to 11105. When an authentication web application loads, it performs discovery by scanning each port sequentially with an HTTP RDSERVICE verb. Once an active daemon responds, the client queries /rd/info to inspect device registration (dpId, rdsId, mi, mc) before triggering an encrypted /rd/capture request. Firewalls, corporate VPNs, and conflicting port bindings must allow local loopback traffic on these dedicated ports.'
      },
      {
        title: 'Quick Reference: Common RD Service Error Codes & 1-Minute Solutions',
        content: '• Error 1140 (Mantra): Device not attached. Plug directly into rear motherboard USB 2.0/3.0 port and disable USB selective suspend.\n• Error 720 (Mantra): Device not registered in management server. Verify PC internet connection and reconnect USB cable.\n• Error 1001 / 1003 (Morpho / Startek): Validity expired. Check serial number on rdserviceonline.com and renew annual token.\n• Error 219 (UIDAI): Timestamp out of sync. Synchronize Windows clock with IST (UTC+05:30).\n• Port 11100 Blocked: Run "netstat -ano | findstr :11100" in CMD as Administrator to terminate conflicting process.\n• PNA Mixed Content Block: Navigate to chrome://flags/#allow-insecure-localhost and set to "Enabled".'
      },
      {
        title: 'Browser Security Constraints: Private Network Access (PNA) & Mixed Content',
        content: 'Modern web browsers (Google Chrome 120+, Microsoft Edge, Mozilla Firefox) enforce strict security boundaries between public internet origins and private/loopback IP addresses (127.0.0.1). When an HTTPS web page attempts to fetch http://127.0.0.1:11100, the browser blocks the connection unless Private Network Access (PNA) preflight headers (Access-Control-Allow-Private-Network) and CORS headers are returned by the vendor daemon, or the user configures the localhost insecure flag in chrome://flags/#allow-insecure-localhost.'
      },
      {
        title: 'Windows 10/11 Driver & USB Host Controller Troubleshooting',
        content: 'Biometric optical sensors require consistent 5V/500mA USB bus power. On Windows 10 and Windows 11, aggressive power-saving policies such as USB Selective Suspend often power down the platen LED, leading to intermittent disconnects and Error 1140. Technicians should ensure the device is plugged directly into a high-speed motherboard USB port, verify driver installation in Device Manager under Universal Serial Bus devices, and confirm that the background service is set to Automatic startup in services.msc.'
      },
      {
        title: 'Privacy and Zero-Retention Architecture: Protecting Citizen Biometric Data',
        content: 'In strict alignment with the Digital Personal Data Protection (DPDP) Act 2023 and UIDAI Information Security Regulations, Toolique does not capture, store, log, or forward biometric information. The Biometric Device Tester is strictly designed for hardware health checks, driver verification, port reachability audits, and technician troubleshooting. Biometric capture is intentionally locked in this stage to guarantee complete user privacy and compliance.'
      }
    ]
  },
  {
    id: 'DPDPReadinessEvaluator',
    slug: 'dpdp-readiness-evaluator',
    name: 'DPDP Act 2023 Readiness Evaluator & SDF Assessment',
    category: 'dpdp-privacy',
    shortDescription: 'Assess enterprise compliance with the Digital Personal Data Protection (DPDP) Act 2023, calculate Significant Data Fiduciary (SDF) status under Section 10, simulate Section 33 statutory penalties up to ₹250 Crores, and generate Section 5 bilingual consent notices.',
    metaTitle: 'DPDP Act 2023 Readiness Evaluator & SDF Assessment | Toolique',
    metaDescription: 'Free DPDP Act 2023 readiness assessment tool. Audit enterprise data governance across 8 statutory pillars, determine Significant Data Fiduciary (SDF) status, simulate DPDP penalties up to ₹250 Cr, and draft Section 5 consent notices.',
    keywords: [
      'DPDP Act 2023',
      'Digital Personal Data Protection Act India',
      'Significant Data Fiduciary SDF',
      'DPDP penalty calculator',
      'DPDP Section 33 penalties',
      'DPDP consent notice generator',
      'Data Protection Board of India',
      'Data Fiduciary compliance checklist',
      'Data Protection Officer DPO mandate India',
      'Data Protection Impact Assessment DPIA'
    ],
    icon: 'Shield',
    howToUse: [
      'Review the 8 statutory DPDP compliance pillars and mark the implementation status of each obligation in your organization.',
      'Navigate to the "Significant Data Fiduciary (SDF) Calculator" tab to evaluate volume, sensitivity, and systemic risk criteria under Section 10.',
      'Use the "Section 33 Penalty Simulator" to calculate statutory financial exposures (up to ₹250 Crores per breach incident) based on severity factors.',
      'Open the "Section 5 Consent Notice Generator" to configure data processing purposes, DPO contacts, and grievance mechanisms in itemized, bilingual format.',
      'Export the complete Readiness Audit Report and copy the generated Consent Notice directly into your production application.'
    ],
    faqs: [
      {
        question: 'What is the Digital Personal Data Protection (DPDP) Act, 2023?',
        answer: 'The DPDP Act, 2023 is India\'s comprehensive statutory framework regulating the processing of digital personal data. It establishes legal grounds for data processing based on consent or legitimate uses, enforces data principal rights (access, correction, erasure, grievance redressal), mandates security safeguards, and establishes the Data Protection Board of India (DPBI) with enforcement powers.'
      },
      {
        question: 'What is a Significant Data Fiduciary (SDF) under Section 10?',
        answer: 'The Central Government may designate any Data Fiduciary or class of Data Fiduciaries as a Significant Data Fiduciary (SDF) based on factors including volume and sensitivity of personal data processed, risk to the rights of Data Principals, potential impact on the sovereignty and integrity of India, electoral democracy, and state security. SDFs have heightened obligations including appointing an India-resident DPO, conducting periodic Data Protection Impact Assessments (DPIA), and engaging independent data auditors.'
      },
      {
        question: 'What are the maximum statutory penalties under DPDP Section 33?',
        answer: 'The Schedule to Section 33 of the DPDP Act sets significant monetary penalties based on violation category: Failure to take reasonable security safeguards to prevent a personal data breach carries a penalty up to ₹250 Crores; Failure to notify the Board and affected data principals of a breach carries up to ₹200 Crores; Non-compliance with additional obligations regarding children\'s data carries up to ₹200 Crores; Non-compliance with SDF obligations carries up to ₹150 Crores.'
      },
      {
        question: 'What are the mandatory elements of a Section 5 Consent Notice?',
        answer: 'Under Section 5 of the DPDP Act, every request for consent must be accompanied or preceded by an itemized notice stating: (1) The specific personal data sought and purpose of processing, (2) The manner in which Data Principals may exercise withdrawal and grievance redressal rights, (3) The manner in which complaints may be lodged with the Data Protection Board of India, and (4) Contact details of the Data Protection Officer (DPO) or grievance officer. The notice must be accessible in English or any of the 22 languages specified in the Eighth Schedule to the Constitution of India.'
      },
      {
        question: 'Does the DPDP Act apply to processing outside of India?',
        answer: 'Yes. Under Section 3(b), the Act applies to the processing of digital personal data outside the territory of India if such processing is in connection with any activity related to offering goods or services to Data Principals within India.'
      }
    ],
    sections: [
      {
        title: 'Core Principles of the Digital Personal Data Protection Act, 2023',
        content: 'The DPDP Act, 2023 replaces the legacy Section 43A regime of the Information Technology Act, 2000 and the SPDI Rules, 2011. It introduces clear fiduciary accountability, replacing generic consent terms with itemized, unambiguous, and freely given consent notices. Data Fiduciaries must implement organizational and technical security measures, ensure data accuracy, cease processing upon consent withdrawal, and enforce statutory data minimization and erasure schedules.'
      },
      {
        title: 'Significant Data Fiduciary (SDF) Classification Architecture',
        content: 'Entities classified as SDFs under Section 10 are subjected to higher regulatory standards. These fiduciaries must appoint a Data Protection Officer who resides in India, reports directly to the Board of Directors, and serves as the official point of contact for the Data Protection Board. SDFs must also appoint an independent data auditor to evaluate DPDP compliance and carry out periodic Data Protection Impact Assessments (DPIA) prior to deploying high-risk data processing systems.'
      },
      {
        title: 'Statutory Penalty Enforcement Mechanism under Section 33',
        content: 'The Data Protection Board of India is empowered to adjudicate complaints, order inquiries, issue directions, and impose monetary penalties up to ₹250 Crores per violation. In determining penalty quantum, the Board evaluates the nature, gravity, and duration of the breach, the type of data affected, repetitive nature of infractions, degree of financial gain or loss avoided, and whether the fiduciary took timely mitigation and notification actions.'
      },
      {
        title: 'Section 5 Notice Architecture and Eighth Schedule Multi-Lingual Delivery',
        content: 'Section 5 requires clear, intelligible, and standalone notices before collecting personal data. Consent obtained through dark patterns or deceptive designs is invalid under statutory interpretation. Organizations serving Indian consumers must provide option to view notices in English as well as any of the 22 constitutional scheduled languages (such as Hindi, Marathi, Tamil, Bengali, Telugu, and Gujarati).'
      }
    ]
  },
  {
    id: 'RBIDigitalLendingChecker',
    slug: 'rbi-digital-lending-checker',
    name: 'RBI Digital Lending Guidelines & FLDG Compliance Checker',
    category: 'rbi-financial',
    shortDescription: 'Audit FinTech and Lending Service Provider (LSP) compliance with the RBI Digital Lending Guidelines (DLG), calculate the statutory 5% First Loss Default Guarantee (FLDG) portfolio cap, and compute transparent Key Fact Statement (KFS) True APR.',
    metaTitle: 'RBI Digital Lending Guidelines & FLDG Compliance Checker | Toolique',
    metaDescription: 'Audit FinTech & RE operations against RBI Digital Lending Guidelines. Calculate FLDG 5% portfolio limits, verify direct escrow disbursement routing, and compute Key Fact Statement (KFS) True APR.',
    keywords: [
      'RBI Digital Lending Guidelines',
      'FLDG calculator',
      'First Loss Default Guarantee 5 percent',
      'Lending Service Provider LSP audit',
      'Regulated Entity RE compliance',
      'Key Fact Statement KFS calculator',
      'Annual Percentage Rate APR calculation',
      'RBI FinTech circular',
      'Digital lending escrow routing',
      'DLG compliance checklist'
    ],
    icon: 'Landmark',
    howToUse: [
      'Navigate to the "DLG Compliance Checklist" to audit operations across direct fund disbursement, borrower consent, privacy, and grievance redressal.',
      'Open the "5% FLDG Portfolio Calculator" and enter the total outstanding loan portfolio to calculate maximum permissible guarantee exposure under the June 2023 circular.',
      'Check guarantee structures against RBI guidelines: Fixed Deposit lien, Bank Guarantee, or cash margin held with the lending RE.',
      'Use the "KFS True APR Calculator" to compute the annualized all-inclusive borrowing cost, incorporating processing fees, verification charges, insurance, and statutory taxes.',
      'Export the generated DLG Audit Sheet and KFS APR Breakdown for credit committees, internal audit, and statutory RBI inspections.'
    ],
    faqs: [
      {
        question: 'What are the RBI Digital Lending Guidelines (DLG)?',
        answer: 'The RBI Digital Lending Guidelines (DLG), issued under circular DOR.CRE.REC.66/21.07.001/2022-23, establish that all loan disbursements and repayments must execute directly between the bank account of the Regulated Entity (Bank/NBFC) and the borrower, without pass-through via third-party pool accounts of Lending Service Providers (LSPs). It mandates transparent disclosures, cooling-off periods, and strict privacy controls.'
      },
      {
        question: 'What is the First Loss Default Guarantee (FLDG) 5% cap?',
        answer: 'Under the RBI circular on Default Loss Guarantee (DLG) in Digital Lending dated June 8, 2023, Regulated Entities entering into DLG arrangements with Lending Service Providers (LSPs) must ensure that the total amount of DLG cover on any outstanding portfolio does not exceed five percent (5%) of the amount of that loan portfolio.'
      },
      {
        question: 'Which forms of DLG collateral are permitted by RBI?',
        answer: 'REs can accept DLG only in three specified forms: (1) Cash deposited with the RE, (2) Fixed Deposits maintained with a Scheduled Commercial Bank with a lien marked in favor of the RE, or (3) Bank Guarantee issued in favor of the RE.'
      },
      {
        question: 'What is the Key Fact Statement (KFS) mandate?',
        answer: 'The Key Fact Statement (KFS) is a standardized document that must be provided to every digital borrower prior to loan agreement execution. It discloses the sanctioned loan amount, tenure, repayment frequency, itemized fee schedule, cooling-off look-up period, and the True Annual Percentage Rate (APR) representing the comprehensive annual cost of credit.'
      },
      {
        question: 'Can LSPs store biometric or location data of borrowers?',
        answer: 'No. RBI DLG strictly prohibits digital lending apps (DLAs) from accessing mobile device media, contact lists, call logs, or storing biometric data. One-time access to camera, microphone, or location is permitted solely for KYC onboarding with explicit, purpose-bound borrower consent.'
      }
    ],
    sections: [
      {
        title: 'Core Architecture of the RBI Digital Lending Regulatory Framework',
        content: 'The RBI DLG framework establishes a clear separation of roles between Regulated Entities (REs - Commercial Banks, NBFCs) and Lending Service Providers (LSPs). All credit underwriting, credit decisions, and loan agreements must remain the sole responsibility of the RE. Pass-through or pool accounts managed by FinTech intermediaries are explicitly barred, ensuring all financial flows execute via direct bank-to-bank NEFT/RTGS/IMPS rails.'
      },
      {
        title: 'Statutory 5% FLDG Ceiling and Risk Underwriting Restrictions',
        content: 'The RBI circular on Default Loss Guarantee (DLG) issued on June 8, 2023 formalized risk-sharing arrangements between REs and FinTech LSPs. The total contractual guarantee exposure is capped strictly at 5% of the outstanding portfolio. Implicit or unbacked guarantees are prohibited, and REs must verify invocation timelines, capital adequacy recognition, and credit bureau reporting under individual borrower identifiers.'
      },
      {
        title: 'Annual Percentage Rate (APR) Transparency in Key Fact Statements',
        content: 'To prevent predatory digital lending and deceptive nominal interest rates, RBI mandates the computation of the True Annual Percentage Rate (APR). The APR is calculated using the internal rate of return (XIRR) method, incorporating all upfront processing fees, verification expenses, insurance premiums, and statutory administrative charges into the total cost of credit over the loan tenure.'
      },
      {
        title: 'Data Governance and Device Permission Boundaries for DLAs',
        content: 'Digital Lending Apps operating in India must enforce strict privacy controls. Blanket device permissions (contacts, files, call logs) are prohibited. Loan agreements must provide a statutory look-up / cooling-off period during which borrowers can exit the loan by repaying the principal without prepayment penalty.'
      }
    ]
  },
  {
    id: 'AadhaarVaultValidator',
    slug: 'aadhaar-data-vault-validator',
    name: 'UIDAI Aadhaar Data Vault & Verhoeff Checksum Validator',
    category: 'uidai-aadhaar',
    shortDescription: 'Validate 12-digit Aadhaar numbers using the official UIDAI Dihedral D5 Verhoeff checksum algorithm, format statutory masked Aadhaar (XXXX-XXXX-1234), and simulate Aadhaar Data Vault (ADV) surrogate tokenization with zero server storage.',
    metaTitle: 'UIDAI Aadhaar Data Vault & Verhoeff Checksum Validator | Toolique',
    metaDescription: 'Validate Aadhaar numbers with the official Verhoeff D5 dihedral algorithm, generate masked Aadhaar (XXXX-XXXX-1234), and simulate Aadhaar Data Vault (ADV) tokenization with zero server retention.',
    keywords: [
      'Aadhaar validator',
      'Verhoeff algorithm Aadhaar',
      'UIDAI checksum validation',
      'Aadhaar Data Vault ADV',
      'Masked Aadhaar generator',
      'ADV tokenization simulation',
      'Aadhaar compliance tool',
      'UIDAI circular compliance',
      'Dihedral group D5 check digit',
      'Aadhaar Act 2016 regulations'
    ],
    icon: 'Fingerprint',
    howToUse: [
      'Enter or paste a 12-digit Aadhaar number into the validator input.',
      'The engine immediately runs the official Dihedral Group D5 Verhoeff checksum algorithm to verify structural and mathematical validity.',
      'View the real-time Masked Aadhaar format (XXXX-XXXX-1234) required for public storage and display under UIDAI regulations.',
      'Navigate to the "Aadhaar Data Vault (ADV)" tab to simulate surrogate token generation (UUIDv4 ADV Reference Key) and inspect vault encryption specifications.',
      'Explore UIDAI compliance guidelines regarding Hardware Security Modules (HSM), AES-256 key management, and statutory audit readiness.'
    ],
    faqs: [
      {
        question: 'What is the Verhoeff algorithm and why does UIDAI use it for Aadhaar?',
        answer: 'The Verhoeff algorithm is a decimal check digit algorithm based on the dihedral group D5 of permutations. UIDAI chose the Verhoeff algorithm for 12-digit Aadhaar numbers because it detects all single-digit transcription errors and 100% of adjacent two-digit transposition errors, providing vastly superior error detection compared to Luhn (mod 10).'
      },
      {
        question: 'What is an Aadhaar Data Vault (ADV)?',
        answer: 'An Aadhaar Data Vault (ADV) is a dedicated, logically and physically separated encrypted secure data repository mandated by UIDAI circulars. Any entity that stores Aadhaar numbers (such as AUAs, KUAs, and sub-AUAs) must never store raw Aadhaar numbers in business databases or application tables. Instead, the raw Aadhaar is stored exclusively inside the vault, and replaced in transactional systems by an internal surrogate token (Reference Key).'
      },
      {
        question: 'What is the legal mandate for Masked Aadhaar?',
        answer: 'Under UIDAI regulations and RBI/IRDAI KYC circulars, entities that are not permitted to retain raw Aadhaar numbers must redact or mask the first 8 digits of the Aadhaar number, leaving only the last 4 digits visible (formatted as XXXX-XXXX-1234). Storing unmasked Aadhaar numbers on un-vaulted drives is a punishable offense under Section 42 of the Aadhaar Act, 2016.'
      },
      {
        question: 'What encryption standards are required for the Aadhaar Data Vault?',
        answer: 'The Aadhaar Data Vault must employ AES-256 encryption with GCM or CBC mode, using cryptographic keys managed inside a FIPS 140-2 Level 3 validated Hardware Security Module (HSM). The vault database must reside in a restricted network zone (VLAN/DMZ) with no direct internet access.'
      },
      {
        question: 'Does Toolique store or transmit the Aadhaar numbers entered here?',
        answer: 'Never. Toolique executes 100% client-side inside your browser sandbox. No Aadhaar numbers, hashes, or keystrokes are transmitted across any network or recorded in server logs, adhering strictly to zero-knowledge privacy standards.'
      }
    ],
    sections: [
      {
        title: 'Mathematical Mechanics of the Verhoeff Dihedral D5 Algorithm',
        content: 'The Verhoeff algorithm operates over the symmetric group of permutations of order 10, using dihedral group D5 multiplication and permutation matrices. Every digit of the 12-digit Aadhaar number is transformed using a permutation index based on its reverse position modulo 8. If the cumulative product evaluates to zero, the Aadhaar number is mathematically valid.'
      },
      {
        title: 'UIDAI Aadhaar Data Vault (ADV) Architecture Guidelines',
        content: 'UIDAI circular No. 11020/205/2017-UIDAI mandated the Aadhaar Data Vault for all ecosystem partners. The vault functions as an isolated enclave: business applications send the raw Aadhaar to the vault over mutual TLS (mTLS), which encrypts the number using an HSM-backed master key, generates a non-deterministic surrogate reference token, and returns the token to the application.'
      },
      {
        title: 'Statutory Penalties under Section 42 of the Aadhaar Act, 2016',
        content: 'Unauthorized storage, transmission, or disclosure of raw identity information or Aadhaar numbers is an offense under Section 42 and 43 of the Aadhaar (Targeted Delivery of Financial and Other Subsidies, Benefits and Services) Act, 2016, carrying imprisonment up to 3 years and substantial financial penalties.'
      },
      {
        title: 'Masked Aadhaar Implementation for KYC Intermediaries',
        content: 'For offline KYC, e-KYC paperless verification, and document archives, entities must strictly mask the initial 8 digits of the physical or digital Aadhaar card. Both visual PDFs and OCR extraction databases must mask digits 1 through 8 prior to archival.'
      }
    ]
  },
  {
    id: 'CERTInIncidentCalculator',
    slug: 'cert-in-incident-calculator',
    name: 'CERT-In 6-Hour Incident Reporter & Evidence Manifest Generator',
    category: 'audit-evidence',
    shortDescription: 'Calculate the mandatory 6-hour CERT-In incident reporting countdown under IT Act § 70B, verify 180-day ICT logs retention compliance with India NPL NTP stratum, and generate Section 65B / BSA 2023 Digital Evidence Certificates.',
    metaTitle: 'CERT-In 6-Hour Incident Reporter & Section 65B Evidence Generator | Toolique',
    metaDescription: 'Track mandatory 6-hour CERT-In cybersecurity incident reporting deadlines under IT Act § 70B, audit 180-day log retention capacity with NPL NTP, and generate Section 65B / BSA 2023 evidence certificates.',
    keywords: [
      'CERT-In incident reporting',
      '6 hour incident reporting clock',
      'CERT-In Directions 2022',
      'IT Act Section 70B',
      '180 days log retention India',
      'NPL India NTP synchronization',
      'Section 65B Indian Evidence Act',
      'Bharatiya Sakshya Adhiniyam Section 63',
      'BSA 2023 digital evidence certificate',
      'Cybersecurity compliance India'
    ],
    icon: 'FileCheck',
    howToUse: [
      'Set the timestamp when your organization first noticed or became aware of the cybersecurity incident.',
      'Monitor the live statutory 6-hour countdown clock indicating time remaining to submit the initial incident report to CERT-In.',
      'Select the statutory incident classification from the 20 official Annexure I types under CERT-In Directions 2022.',
      'Review and customize the pre-filled CERT-In Statutory Incident Report draft, and copy or email directly to incident@cert-in.org.in.',
      'Navigate to the "180-Day Log Retention" tab to calculate storage capacity and generate Linux/Windows NTP configuration for NPL-India clock sync.',
      'Open the "Sec 65B / BSA 63 Evidence Certificate" tab to compute SHA-256 hashes of digital logs client-side and generate court-admissible electronic evidence certificates.'
    ],
    faqs: [
      {
        question: 'What is the CERT-In 6-hour incident reporting mandate?',
        answer: 'Under Direction No. 20(3)/2022-CERT-In issued on April 28, 2022 under Section 70B(6) of the Information Technology Act, 2000, all service providers, intermediaries, data centers, body corporate, and government organizations in India must mandatorily report cybersecurity incidents to CERT-In within 6 hours of noticing or being brought to notice of such incidents.'
      },
      {
        question: 'Which cybersecurity incident types must be reported under Annexure I?',
        answer: 'Annexure I specifies 20 incident categories, including targeted scanning/probing, compromise of critical systems, unauthorized access of IT systems, website defacement, ransomware and malware attacks, attacks on databases/mail/DNS, identity theft/phishing, DoS/DDoS attacks, attacks on Critical Information Infrastructure (CII), data breaches/leaks, attacks on digital payment systems (UPI/AePS), and supply chain compromises.'
      },
      {
        question: 'What is the mandatory 180-day system logs retention requirement?',
        answer: 'CERT-In Directions 2022 require all service providers, intermediaries, data centers, and body corporate to enable and maintain logs of all their ICT systems securely within the Indian jurisdiction for a rolling period of 180 consecutive days. The logs must be furnished to CERT-In upon order.'
      },
      {
        question: 'Why is time synchronization with NPL-India mandatory?',
        answer: 'ICT systems must synchronize their system clocks with the Network Time Protocol (NTP) servers of the National Physical Laboratory (NPL) or Inter-University Centre for Astronomy and Astrophysics (IUCAA), or servers traceable to them. This ensures legal defensibility and forensic synchronization of timestamps across logs during incident investigation.'
      },
      {
        question: 'What is the difference between Section 65B (Evidence Act) and Section 63 (BSA 2023)?',
        answer: 'Section 65B of the Indian Evidence Act, 1872 required a written certificate confirming lawful custody, normal device operation, and cryptographic integrity for electronic records to be admissible in court. Effective July 1, 2024, the Bharatiya Sakshya Adhiniyam, 2023 (BSA) replaced the Evidence Act, with Section 63 now governing electronic evidence admissibility under identical high standards of custodial certification and cryptographic verification.'
      }
    ],
    sections: [
      {
        title: 'Statutory Powers of CERT-In under Section 70B of the IT Act, 2000',
        content: 'The Indian Computer Emergency Response Team (CERT-In) functions as the national nodal agency for responding to computer security incidents. Under Section 70B(6) and Directions 2022, failure to report designated incidents within the mandatory 6-hour window or failure to retain logs for 180 days constitutes an offense punishable under Section 70B(7) with imprisonment up to 1 year, a fine up to ₹1,00,000, or both.'
      },
      {
        title: 'Forensic Time Synchronization Architecture with NPL-India NTP Stratum',
        content: 'Discrepancies in system time between distributed microservices, firewalls, and cloud load balancers can invalidate forensic timelines. CERT-In Directions 2022 mandate time synchronization with the National Physical Laboratory (NPL-India, time.nplindia.org) or IUCAA (time.iucaa.in). Enterprise infrastructure must configure Chrony or NTP daemons to synchronize with Indian Stratum-1 time servers.'
      },
      {
        title: 'Admissibility of Digital Evidence under BSA 2023 Section 63 / Sec 65B',
        content: 'In legal proceedings before Indian courts, digital logs, database exports, and packet captures are classified as secondary electronic evidence. Under the Supreme Court landmark ruling in Arjun Panditrao Khotkar v. Kailash Kushanrao Gorantyal (2020), a formal certificate signed by the person in lawful control of the computer system is mandatory for admissibility. The certificate identifies the device, affirms normal operational integrity, and provides cryptographic SHA-256 digests.'
      },
      {
        title: '180-Day Rolling Log Retention Strategies and Cold Storage Archival',
        content: 'To fulfill the 180-day retention mandate cost-effectively, organizations implement tiered data lakes. Hot logs (Syslog, CloudTrail, VPC Flow Logs, WAF) remain searchable in Elasticsearch/OpenSearch for 30–60 days, then transition to append-only, immutable WORM (Write Once Read Many) cold storage (such as AWS S3 Glacier Vault Lock or Azure Immutable Blob) with SHA-256 integrity checksums within Indian sovereign data centers.'
      }
    ]
  },
  {
    "id": "DPDPComplianceChecklist",
    "slug": "dpdp-compliance-checklist",
    "name": "DPDP Compliance Checklist & Statutory Penalty Simulator",
    "category": "dpdp-privacy",
    "shortDescription": "Audit organizational compliance against the 8 statutory pillars of the Digital Personal Data Protection (DPDP) Act 2023, calculate Significant Data Fiduciary (SDF) status under Section 10, and simulate Section 33 statutory penalties up to ₹250 Crores.",
    "metaTitle": "DPDP Compliance Checklist & Penalty Simulator | Toolique",
    "metaDescription": "Free online DPDP Act 2023 compliance checklist. Audit your enterprise against 8 statutory pillars, determine Significant Data Fiduciary (SDF) criteria, simulate DPDP penalties, and draft Section 5 bilingual notices.",
    "keywords": [
      "DPDP compliance checklist",
      "DPDP Act 2023 checklist",
      "Significant Data Fiduciary SDF calculator",
      "DPDP penalty calculator",
      "Data Protection Board of India"
    ],
    "icon": "Shield",
    "howToUse": [
      "Evaluate your organization against the 8 statutory DPDP compliance pillars.",
      "Navigate to the SDF Assessment tab to determine if heightened Section 10 obligations apply.",
      "Use the Penalty Simulator to calculate financial exposure under DPDP Section 33 based on severity factors.",
      "Generate a customized, multi-lingual Section 5 notice and export the Readiness Audit Report."
    ],
    "faqs": [
      {
        "question": "What is the Digital Personal Data Protection (DPDP) Act, 2023?",
        "answer": "The DPDP Act, 2023 is India's statutory privacy framework regulating digital personal data processing, establishing Data Principal rights, and imposing penalties up to ₹250 Cr for breaches."
      },
      {
        "question": "What are the maximum penalties under Section 33?",
        "answer": "Penalties range up to ₹250 Crores for failure to take reasonable security safeguards, ₹200 Crores for failure to report breaches to DPBI, and ₹200 Crores for children's data violations."
      }
    ],
    "sections": [
      {
        "title": "Core Architecture of the DPDP Act 2023",
        "content": "The Act replaces legacy Section 43A of the IT Act, requiring clear, unconditional, and itemized consent notices alongside strict data minimization and purpose limitation."
      }
    ]
  },
  {
    "id": "PIIDataScanner",
    "slug": "pii-aadhaar-data-scanner",
    "name": "PII & Aadhaar Data Scanner (Verhoeff & Luhn Validated)",
    "category": "dpdp-privacy",
    "shortDescription": "Scan text, logs, and database extracts for Personally Identifiable Information (PII) including 12-digit Aadhaar numbers with Verhoeff dihedral D5 checksum verification, PAN, Passport, Voter ID, Phone numbers, and payment cards with Luhn check.",
    "metaTitle": "PII & Aadhaar Data Scanner (Verhoeff & Luhn) | Toolique",
    "metaDescription": "Client-side PII detector. Scan logs and files for Aadhaar numbers verified via Verhoeff D5 algorithm, PAN, Voter ID, Passport, Phone, Email, and Luhn payment cards.",
    "keywords": [
      "PII scanner India",
      "Aadhaar Verhoeff scanner",
      "PAN card regex detector",
      "Client side PII redaction",
      "DPDP data discovery"
    ],
    "icon": "Search",
    "howToUse": [
      "Paste server logs, CSV extracts, JSON payloads, or code snippets into the input field.",
      "The scanner analyzes text in real time using Verhoeff Dihedral D5 for Aadhaar and Luhn for cards.",
      "Review detected PII items categorized by severity with line and character references.",
      "Click \"Sanitize & Redact All\" to export a clean version with zero sensitive citizen data."
    ],
    "faqs": [
      {
        "question": "Does this tool transmit scanned PII to any server?",
        "answer": "Never. All scanning and mathematical Verhoeff checksums execute 100% locally in your browser memory via JavaScript regex engines."
      }
    ],
    "sections": [
      {
        "title": "Verhoeff D5 Algorithm in Indian Identity Validation",
        "content": "Unlike simple mod 10 checks, the Verhoeff dihedral D5 algorithm detects 100% of single-digit transcription errors and adjacent transpositions in 12-digit Aadhaar numbers."
      }
    ]
  },
  {
    "id": "PersonalDataMaskingTool",
    "slug": "personal-data-masking-tool",
    "name": "Personal Data Masking & Redaction Tool",
    "category": "dpdp-privacy",
    "shortDescription": "Transform sensitive personal identity records into compliant masked formats: Aadhaar (XXXX-XXXX-1234), PAN (ABCDE****F), Email (u***r@domain.com), Phone (+91-******3210), and Card (****-****-****-1234).",
    "metaTitle": "Personal Data Masking & Redaction Tool | Toolique",
    "metaDescription": "Mask personal data client-side under DPDP and UIDAI rules. Mask Aadhaar to XXXX-XXXX-1234, PAN to ABCDE****F, credit cards, phones, and emails with live side-by-side preview.",
    "keywords": [
      "personal data masking tool",
      "Aadhaar masking XXXX",
      "PAN masking tool",
      "PII redaction tool",
      "DPDP anonymization"
    ],
    "icon": "EyeOff",
    "howToUse": [
      "Configure masking options for Aadhaar, PAN, Email, Phone, and Credit Cards.",
      "Paste data in single value mode or batch tabular/JSON format.",
      "View real-time side-by-side masked results.",
      "Copy masked text or download the redacted dataset."
    ],
    "faqs": [
      {
        "question": "What is the statutory requirement for masked Aadhaar?",
        "answer": "Under UIDAI regulations and RBI/SEBI KYC circulars, entities without authorized Aadhaar Data Vaults must mask the initial 8 digits of Aadhaar (XXXX-XXXX-1234)."
      }
    ],
    "sections": [
      {
        "title": "Data Anonymization vs Pseudonymization under DPDP",
        "content": "Masking replaces identifying middle characters with asterisks or X characters, preventing casual exposure while preserving terminal digits for verification."
      }
    ]
  },
  {
    "id": "ConsentRecordValidator",
    "slug": "consent-record-validator",
    "name": "DPDP Consent Record & Section 5 Notice Validator",
    "category": "dpdp-privacy",
    "shortDescription": "Validate digital consent records against DPDP Act Section 5 & 6 standards. Verify itemized purpose specification, withdrawal mechanisms, DPO contact details, absence of dark patterns, and cryptographic tamper-proof hashes.",
    "metaTitle": "DPDP Consent Record & Section 5 Validator | Toolique",
    "metaDescription": "Audit consent notices and records against DPDP Act 2023 Section 5 & 6. Verify itemized purposes, clear withdrawal mechanisms, absence of pre-ticked dark patterns, and SHA-256 integrity.",
    "keywords": [
      "DPDP consent record validator",
      "Section 5 consent notice audit",
      "DPDP dark pattern checker",
      "consent architecture India"
    ],
    "icon": "FileCheck",
    "howToUse": [
      "Enter or inspect consent payload attributes: Notice Version, Itemized Purposes, DPO details.",
      "Run the statutory checklist to verify affirmative action and absence of pre-ticked boxes.",
      "Generate a tamper-evident SHA-256 digest of the consent agreement.",
      "Export the Consent Audit Certificate."
    ],
    "faqs": [
      {
        "question": "Are pre-ticked consent checkboxes permitted under DPDP?",
        "answer": "No. Section 6(1) requires consent to be free, specific, informed, and unambiguous with clear affirmative action. Pre-ticked boxes or bundled terms are statutory violations."
      }
    ],
    "sections": [
      {
        "title": "Statutory Ingredients of a Valid Consent Notice",
        "content": "Section 5 mandates that every consent request must specify the personal data collected, specific purpose, manner of exercising rights, and complaint procedure before the DPBI."
      }
    ]
  },
  {
    "id": "PrivacyPolicyChecklist",
    "slug": "privacy-policy-checklist",
    "name": "DPDP Privacy Policy Statutory Checklist",
    "category": "dpdp-privacy",
    "shortDescription": "Evaluate corporate privacy policies against 12 mandatory statutory clauses required by the Digital Personal Data Protection Act 2023, score policy readiness, and generate standardized legal boilerplate clauses.",
    "metaTitle": "DPDP Privacy Policy Statutory Checklist | Toolique",
    "metaDescription": "Audit your company privacy policy against DPDP Act 2023 mandatory clauses. Verify children's data clauses, DPO contact details, cross-border transfer disclosures, and grievance mechanisms.",
    "keywords": [
      "DPDP privacy policy checklist",
      "privacy policy audit India",
      "DPDP mandatory policy clauses",
      "DPO disclosure India"
    ],
    "icon": "BookOpen",
    "howToUse": [
      "Review your privacy policy against the 12 statutory clauses.",
      "Mark each requirement as Compliant, In Progress, or Gap.",
      "Inspect the live Policy Compliance Score and identify missing disclosures.",
      "Copy pre-drafted legal boilerplate clauses directly into your policy document."
    ],
    "faqs": [
      {
        "question": "Is naming a Data Protection Officer (DPO) mandatory in the privacy policy?",
        "answer": "Yes. Section 5(1)(iv) requires publishing the contact details of the DPO or grievance officer authorized to respond to Data Principals."
      }
    ],
    "sections": [
      {
        "title": "Aligning Website Privacy Policies with DPDP 2023",
        "content": "Indian privacy policies must transition away from legacy SPDI Rules 2011 to itemized DPDP statutory disclosures including grievance escalation timelines to the DPBI."
      }
    ]
  },
  {
    "id": "DataRetentionPlanner",
    "slug": "data-retention-planner",
    "name": "Data Retention & Section 8(7) Erasure Planner",
    "category": "dpdp-privacy",
    "shortDescription": "Plan statutory data retention schedules and deletion timelines across DPDP Section 8(7), CERT-In 180-day ICT logs, Income Tax 7-year records, and PMLA 5-year rules. Generate signed Certificates of Data Destruction.",
    "metaTitle": "Data Retention & Section 8(7) Erasure Planner | Toolique",
    "metaDescription": "Calculate data retention limits under DPDP Section 8(7), CERT-In 180 days, PMLA, and Income Tax Act. Schedule automated deletion policies and generate Certificates of Data Destruction.",
    "keywords": [
      "data retention planner India",
      "DPDP Section 8(7) erasure",
      "CERT-In 180 days log retention",
      "data destruction certificate"
    ],
    "icon": "Clock",
    "howToUse": [
      "Select data classification (Financial, Customer PII, Employee Data, Server Logs).",
      "View conflicting statutory limits (DPDP purpose fulfillment vs PMLA/IT Act minimums).",
      "Set disposal target dates and calculate retention countdowns.",
      "Generate court-admissible signed Certificate of Secure Data Destruction."
    ],
    "faqs": [
      {
        "question": "When must personal data be erased under DPDP Section 8(7)?",
        "answer": "A Data Fiduciary must erase personal data upon withdrawal of consent or as soon as the specified purpose is no longer being served, unless retention is mandated by another Indian law."
      }
    ],
    "sections": [
      {
        "title": "Harmonizing DPDP Erasure with PMLA and Tax Retention Mandates",
        "content": "While DPDP mandates data deletion upon purpose completion, overriding laws such as PMLA (5 years) and Income Tax Act (7 years) take precedence under statutory exemption Section 17."
      }
    ]
  },
  {
    "id": "DataBreachAssessment",
    "slug": "data-breach-assessment",
    "name": "DPDP Data Breach Severity & DPBI Notification Evaluator",
    "category": "dpdp-privacy",
    "shortDescription": "Assess personal data breach incidents under DPDP Section 8(6), calculate statutory penalty exposures up to ₹250 Crores under Section 33, and generate statutory breach notification drafts for the Data Protection Board of India (DPBI).",
    "metaTitle": "DPDP Data Breach Severity & DPBI Notification Evaluator | Toolique",
    "metaDescription": "Assess data breach severity under DPDP Act 2023. Calculate Section 33 fine exposures up to ₹250 Cr, determine notification mandates, and draft statutory DPBI and user breach notices.",
    "keywords": [
      "DPDP data breach assessment",
      "DPBI breach notification draft",
      "DPDP penalty exposure calculator",
      "Section 8(6) personal data breach"
    ],
    "icon": "AlertTriangle",
    "howToUse": [
      "Enter breach details: Volume of records, data sensitivity, and containment status.",
      "Inspect statutory penalty exposure simulation under Section 33 (Schedule entries 1 and 2).",
      "Generate standardized breach notification letters for the Data Protection Board of India.",
      "Copy affected Data Principal communication templates."
    ],
    "faqs": [
      {
        "question": "Is it mandatory to notify affected users of a data breach under DPDP?",
        "answer": "Yes. Section 8(6) mandates notifying both the Data Protection Board of India and each affected Data Principal in the form and manner prescribed."
      }
    ],
    "sections": [
      {
        "title": "Statutory Breach Notification Framework under Section 8(6)",
        "content": "Failure to inform the DPBI and affected individuals carries independent statutory penalties up to ₹200 Crores under Entry 2 of the Section 33 Schedule."
      }
    ]
  },
  {
    "id": "DataPrincipalRightsTracker",
    "slug": "data-principal-rights-tracker",
    "name": "Data Principal Rights (DPR) & 30-Day SLA Tracker",
    "category": "dpdp-privacy",
    "shortDescription": "Manage and track Data Principal Rights (DPR) intake under DPDP Act Sections 11, 12, and 13. Track statutory 30-day resolution countdowns, categorize access/correction/erasure requests, and generate formal response letters.",
    "metaTitle": "Data Principal Rights (DPR) & 30-Day SLA Tracker | Toolique",
    "metaDescription": "Manage DPDP Data Principal rights requests. Track 30-day statutory resolution SLAs for Section 11 access, Section 12 correction/erasure, and generate response letters.",
    "keywords": [
      "Data Principal Rights tracker",
      "DPDP access correction erasure",
      "DPR request SLA manager",
      "DPDP grievance redressal"
    ],
    "icon": "Users",
    "howToUse": [
      "Log incoming citizen requests: Right to Access (Sec 11), Correction/Erasure (Sec 12), Grievance (Sec 13).",
      "Monitor the statutory countdown timer indicating days remaining to fulfill the request.",
      "Update fulfillment status and attach verification notes.",
      "Generate formal statutory fulfillment response letters."
    ],
    "faqs": [
      {
        "question": "What rights do Data Principals have under the DPDP Act?",
        "answer": "Data Principals have the right to obtain summary of personal data processed, identities of third parties shared with, correction of inaccurate data, erasure upon purpose completion, and grievance redressal."
      }
    ],
    "sections": [
      {
        "title": "Operationalizing Data Principal Rights Workflows",
        "content": "Fiduciaries must provide automated or human-in-the-loop workflows to respond to citizen rights within reasonable statutory timelines prior to citizen escalation to the DPBI."
      }
    ]
  },
  {
    "id": "RBIComplianceChecklist",
    "slug": "rbi-compliance-checklist",
    "name": "RBI Compliance Checklist & Digital Lending Guidelines (DLG)",
    "category": "rbi-financial",
    "shortDescription": "Audit NBFC and FinTech digital lending operations against the RBI Digital Lending Guidelines (DLG), test the statutory 5% First Loss Default Guarantee (FLDG) ceiling, and compute Key Fact Statement (KFS) True APR.",
    "metaTitle": "RBI Compliance Checklist & Digital Lending Guidelines | Toolique",
    "metaDescription": "Audit FinTech and NBFC compliance with RBI Digital Lending Guidelines (DLG). Calculate 5% FLDG portfolio limits, verify direct account-to-account escrow routing, and simulate KFS True APR.",
    "keywords": [
      "RBI compliance checklist",
      "RBI Digital Lending Guidelines DLG",
      "FLDG 5 percent cap calculator",
      "Key Fact Statement KFS True APR",
      "FinTech compliance India"
    ],
    "icon": "Landmark",
    "howToUse": [
      "Review operations against the DLG statutory checklist across direct fund routing, borrower consent, and privacy.",
      "Use the 5% FLDG Portfolio Calculator to check if contractual guarantee exposures breach statutory limits.",
      "Simulate True APR using the KFS calculator, factoring in all processing fees and third-party charges.",
      "Export the complete RBI Digital Lending Audit Report."
    ],
    "faqs": [
      {
        "question": "What is the First Loss Default Guarantee (FLDG) 5% cap?",
        "answer": "Under the RBI circular dated June 8, 2023, Regulated Entities entering into DLG arrangements with LSPs must ensure the total DLG cover does not exceed 5% of the outstanding portfolio."
      }
    ],
    "sections": [
      {
        "title": "Direct Disbursement Mandate in Digital Lending",
        "content": "RBI DLG strictly bars pass-through or pool accounts managed by FinTech intermediaries. All loan drawdowns and repayments must execute directly between the RE and borrower accounts."
      }
    ]
  },
  {
    "id": "KYCAMLControlAssessment",
    "slug": "kyc-aml-control-assessment",
    "name": "RBI KYC/AML Control Assessment & 10% UBO Identifier",
    "category": "rbi-financial",
    "shortDescription": "Audit Customer Due Diligence (CDD), Politically Exposed Persons (PEP) controls, 10% Ultimate Beneficial Ownership (UBO) thresholds under PMLA 2023, V-CIP video KYC guidelines, and Small Account limits.",
    "metaTitle": "RBI KYC/AML Control Assessment & 10% UBO Identifier | Toolique",
    "metaDescription": "Evaluate KYC/AML compliance under RBI Master Direction & PMLA 2023. Test 10% corporate UBO thresholds, audit V-CIP video onboarding controls, and verify Small Account ceiling limits.",
    "keywords": [
      "RBI KYC AML assessment",
      "10 percent UBO calculator PMLA",
      "V-CIP video KYC audit",
      "Small account balance limit RBI",
      "Customer Due Diligence CDD"
    ],
    "icon": "UserCheck",
    "howToUse": [
      "Audit CDD and AML controls across Risk Profiling, V-CIP, Small Accounts, and Sanctions Screening.",
      "Use the 10% UBO Identifier to determine natural person beneficial owners under amended PMLA 2023 rules.",
      "Verify Small Account limits (₹50k balance, ₹1L annual credits, ₹10k monthly debits).",
      "Export the formal KYC/AML Compliance Workpaper."
    ],
    "faqs": [
      {
        "question": "What is the revised UBO threshold under PMLA 2023?",
        "answer": "The Ministry of Finance amended the PMLA rules in March 2023, reducing the beneficial ownership threshold for corporate entities from 25% down to 10%."
      }
    ],
    "sections": [
      {
        "title": "V-CIP Technical Controls under RBI KYC Master Direction",
        "content": "Video Customer Identification Process (V-CIP) mandates real-time GPS coordinate capture within Indian borders, AI facial match against OVD photos, and live PAN API verification with NSDL/Protean."
      }
    ]
  },
  {
    "id": "DigitalPaymentSecurityChecklist",
    "slug": "digital-payment-security-checklist",
    "name": "RBI Digital Payment Security Controls (MD-DPSC) Checklist",
    "category": "rbi-financial",
    "shortDescription": "Audit digital payment systems against the RBI Master Direction on Digital Payment Security Controls (MD-DPSC). Evaluate AFA 2-factor authentication, Card-on-File Tokenization (CoFT), mobile app root detection, and SSL pinning.",
    "metaTitle": "RBI Digital Payment Security Controls (MD-DPSC) Checklist | Toolique",
    "metaDescription": "Audit payment gateways and mobile banking against RBI MD-DPSC 2021. Check AFA 2FA, Card-on-File Tokenization (CoFT), 5-min auto-logout, root detection, and SSL pinning.",
    "keywords": [
      "RBI digital payment security checklist",
      "MD-DPSC 2021 audit",
      "Card on File Tokenization CoFT",
      "AFA two factor authentication RBI",
      "Mobile app SSL pinning"
    ],
    "icon": "CreditCard",
    "howToUse": [
      "Evaluate your payment infrastructure against the statutory security controls matrix.",
      "Explore the Threat & Defense Simulator to inspect countermeasures against MITM and SIM swaps.",
      "Review compliance with Card-on-File Tokenization (CoFT) and escrow account segregation.",
      "Export the Digital Payment Security Audit Memorandum."
    ],
    "faqs": [
      {
        "question": "Can merchants store raw credit or debit card numbers?",
        "answer": "No. RBI's CoFT guidelines prohibit merchants and payment aggregators from storing actual card numbers (PAN), CVV, or expiry. All stored cards must be surrogate network tokens."
      }
    ],
    "sections": [
      {
        "title": "Mobile Application Security Standards in Indian Banking",
        "content": "RBI MD-DPSC Section 27 requires banking apps to actively detect rooted/jailbroken devices, modified bootloaders, and enforce SSL certificate pinning against MITM proxies."
      }
    ]
  },
  {
    "id": "TransactionReversalSLACalculator",
    "slug": "transaction-reversal-sla-calculator",
    "name": "RBI Transaction Reversal SLA & ₹100/Day Compensation Calculator",
    "category": "rbi-financial",
    "shortDescription": "Calculate statutory turnaround time (TAT) deadlines and ₹100/day customer delayed compensation for failed transactions across UPI (T+1), ATM (T+5), IMPS (T+1), and Card POS/E-Com under RBI Circular DPSS.CO.PD No.629.",
    "metaTitle": "RBI Transaction Reversal SLA & ₹100/Day Compensation Calculator | Toolique",
    "metaDescription": "Calculate turnaround deadlines and statutory ₹100 per day compensation for failed UPI, ATM, IMPS, and card transactions under RBI TAT Harmonisation Circular DPSS.CO.PD No.629.",
    "keywords": [
      "RBI transaction reversal calculator",
      "UPI failed transaction compensation",
      "ATM failed cash ₹100 per day",
      "RBI TAT harmonisation circular",
      "Banking Ombudsman complaint draft"
    ],
    "icon": "Clock",
    "howToUse": [
      "Select payment channel (UPI, ATM, IMPS, Card POS/E-Commerce, BBPS, PPI).",
      "Enter transaction date, transaction amount, and reference/RRN number.",
      "View statutory SLA deadline and delay days elapsed.",
      "Calculate automatic statutory compensation (₹100/day) and export the Banking Ombudsman grievance notice."
    ],
    "faqs": [
      {
        "question": "Does the customer need to file a claim to receive ₹100/day compensation?",
        "answer": "Under RBI Circular DPSS.CO.PD No.629, banks must proactively credit ₹100 per day of delay directly into the customer's account without requiring a separate claim."
      }
    ],
    "sections": [
      {
        "title": "Statutory Harmonisation of Turn Around Time (TAT)",
        "content": "RBI established strict harmonized TAT timelines (T+1 for UPI/IMPS, T+5 for ATM/POS) to eliminate customer grievance friction across interconnected payment rails."
      }
    ]
  },
  {
    "id": "APISecurityChecklist",
    "slug": "api-security-checklist",
    "name": "RBI API Security & FinTech Gateway Checklist",
    "category": "rbi-financial",
    "shortDescription": "Audit Open Banking, UPI switches, and Account Aggregator APIs against RBI Master Direction on IT Governance 2023. Generate and verify client-side HMAC-SHA256 payload signatures and mTLS 1.2+ controls.",
    "metaTitle": "RBI API Security & FinTech Gateway Checklist | Toolique",
    "metaDescription": "Audit financial APIs against RBI Master Direction on IT Governance 2023. Verify mTLS 1.2+, OAuth 2.0 PKCE, 90-day secret rotation, and test in-browser HMAC-SHA256 payload signing.",
    "keywords": [
      "RBI API security checklist",
      "mTLS financial gateway",
      "HMAC SHA256 signature generator",
      "Account Aggregator API security",
      "OWASP API top 10 banking"
    ],
    "icon": "Code",
    "howToUse": [
      "Audit your API architecture against authentication, encryption, rate limiting, and secrets hygiene pillars.",
      "Use the in-browser HMAC-SHA256 Payload Signer to test cryptographic headers with your API secret.",
      "Review field-level encryption (FLE) requirements for sensitive banking attributes.",
      "Export the API Security & FinTech Governance Audit Report."
    ],
    "faqs": [
      {
        "question": "Is mutual TLS (mTLS) mandatory for partner integrations in Indian banking?",
        "answer": "Yes. RBI MD-IT Governance 2023 mandates two-way mutual TLS using SHA-256 certificates from certified CAs for all B2B partner integrations."
      }
    ],
    "sections": [
      {
        "title": "Cryptographic Integrity & Non-Repudiation in Financial APIs",
        "content": "Payload signatures (HMAC-SHA256 or RSA-PSS) prevent tampering and replay attacks across intermediate API gateways and Account Aggregator data pipelines."
      }
    ]
  },
  {
    "id": "VendorRiskAssessment",
    "slug": "vendor-risk-assessment",
    "name": "RBI IT Outsourcing & Vendor Risk Assessment",
    "category": "rbi-financial",
    "shortDescription": "Evaluate vendor materiality under Chapter III of the RBI Master Direction on Outsourcing of IT Services (April 2023), audit mandatory Right-to-Audit clauses, data localization, and BCP failover drills.",
    "metaTitle": "RBI IT Outsourcing & Vendor Risk Assessment | Toolique",
    "metaDescription": "Assess third-party FinTech vendors against RBI Outsourcing Master Direction 2023. Evaluate Material Outsourcing criteria, audit contractual Right-to-Audit clauses, and sub-contracting safeguards.",
    "keywords": [
      "RBI IT outsourcing assessment",
      "Vendor risk assessment RBI",
      "Material outsourcing Chapter III",
      "Vendor right to audit clause",
      "SaaS due diligence banking"
    ],
    "icon": "Building",
    "howToUse": [
      "Use the Materiality Evaluator to classify vendor arrangements into Tier-1 Material or Tier-2 Non-Material.",
      "Audit vendor contract language against mandatory clauses: Right-to-Audit, Data Localization, 2-Hour Breach SLA.",
      "Inspect concentration risk and single point of failure (SPOF) criteria.",
      "Export the Board IT Strategy Committee Assessment Workpaper."
    ],
    "faqs": [
      {
        "question": "Can regulated entities outsource core management functions?",
        "answer": "No. RBI directions explicitly prohibit outsourcing of core management functions including credit underwriting, policy formulation, and compliance oversight."
      }
    ],
    "sections": [
      {
        "title": "Unrestricted Right-to-Audit Mandate in Vendor Contracts",
        "content": "Outsourcing agreements must grant REs, internal/external auditors, and RBI supervisory officials unrestricted access to inspect physical facilities, cloud accounts, and system logs."
      }
    ]
  },
  {
    "id": "AccessControlAudit",
    "slug": "access-control-audit",
    "name": "RBI Access Control & Maker-Checker Audit",
    "category": "rbi-financial",
    "shortDescription": "Audit Segregation of Duties (SoD), Maker-Checker dual authorization for financial disbursements, Privileged Access Management (PAM), quarterly User Access Reviews (UAR), and 24-hour offboarding SLAs.",
    "metaTitle": "RBI Access Control & Maker-Checker Audit | Toolique",
    "metaDescription": "Audit access governance against RBI Cyber Security Framework. Simulate Maker-Checker dual control for financial transactions, evaluate PAM controls, and review quarterly UAR schedules.",
    "keywords": [
      "RBI access control audit",
      "Maker checker segregation of duties",
      "Privileged Access Management PAM",
      "Quarterly user access review UAR",
      "24 hour offboarding SLA"
    ],
    "icon": "Key",
    "howToUse": [
      "Audit internal access governance across Maker-Checker, PAM, Quarterly UAR, and Dormancy.",
      "Test the Maker-Checker simulator to verify dual-control validation and prevent self-approvals.",
      "Review automated disablement rules for 90-day dormant user accounts.",
      "Export the Access Governance & SoD Audit Workpaper."
    ],
    "faqs": [
      {
        "question": "What is Maker-Checker segregation under RBI guidelines?",
        "answer": "Maker-Checker requires that no single employee can both initiate and authorize high-value transactions or critical system parameter changes without independent secondary approval."
      }
    ],
    "sections": [
      {
        "title": "Privileged Session Recording and Keystroke Auditing",
        "content": "Production administrative sessions accessing core banking databases must enforce hardware MFA, ephemeral JIT credentials, and immutable session video/keystroke recordings."
      }
    ]
  },
  {
    "id": "RegulatoryCircularTracker",
    "slug": "regulatory-circular-tracker",
    "name": "RBI & Financial Regulatory Circular Tracker",
    "category": "rbi-financial",
    "shortDescription": "Track landmark directions, circulars, and compliance implementation deadlines across RBI, NPCI, and SEBI (MD-IT Governance, DLG, KFS APR, CoFT, and E-Mandates).",
    "metaTitle": "RBI & Financial Regulatory Circular Tracker | Toolique",
    "metaDescription": "Track RBI, NPCI, and SEBI regulatory circulars and compliance deadlines. Monitor implementation status for MD-IT 2023, DLG June 2023, KFS 2024, and CoFT Tokenization.",
    "keywords": [
      "RBI regulatory circular tracker",
      "RBI circular compliance deadlines",
      "NPCI circular implementation",
      "FinTech statutory tracking India"
    ],
    "icon": "Calendar",
    "howToUse": [
      "Search and filter circulars by regulator (RBI, NPCI, SEBI) or entity applicability.",
      "Inspect effective implementation deadlines and statutory action items.",
      "Mark internal status (Implemented, In Progress, Under Review) to track organizational readiness.",
      "Export the complete Circular Compliance Calendar and Action Matrix."
    ],
    "faqs": [
      {
        "question": "What is the compliance deadline for the RBI KFS Master Direction?",
        "answer": "The RBI Master Direction on Key Fact Statement (KFS) for Retail and MSME Loans took effect on October 1, 2024, requiring mandatory True APR disclosures."
      }
    ],
    "sections": [
      {
        "title": "Managing Regulatory Velocity in Indian FinTech",
        "content": "Regulated entities and FinTech partners must maintain structured compliance matrices to monitor frequent circular notifications and align engineering sprints with statutory deadlines."
      }
    ]
  },
  {
    "id": "AadhaarDataMaskingTool",
    "slug": "aadhaar-data-masking-tool",
    "name": "UIDAI Aadhaar Data Masking & Batch Redaction Tool",
    "category": "uidai-aadhaar",
    "shortDescription": "Generate statutory XXXX-XXXX-1234 masked Aadhaar numbers with official Dihedral D5 Verhoeff checksum validation. Redact raw 12-digit numbers in batch text, CSV, and SQL dumps with zero server retention.",
    "metaTitle": "UIDAI Aadhaar Data Masking & Batch Redaction Tool | Toolique",
    "metaDescription": "Mask Aadhaar numbers client-side under UIDAI regulations. Validate 12-digit numbers with Verhoeff D5 algorithm, mask to XXXX-XXXX-1234, and batch redact SQL and CSV logs.",
    "keywords": [
      "Aadhaar data masking tool",
      "Masked Aadhaar generator XXXX",
      "Verhoeff checksum Aadhaar",
      "UIDAI redaction tool",
      "Aadhaar batch masker"
    ],
    "icon": "Fingerprint",
    "howToUse": [
      "Enter a 12-digit Aadhaar number to verify with the official Verhoeff D5 algorithm.",
      "Select masking character (X or *) and delimiter format (hyphen, space, or compact).",
      "Switch to Batch Redaction to sanitize database exports, logs, and CSV files in browser memory.",
      "Download the sanitized file with zero raw citizen numbers."
    ],
    "faqs": [
      {
        "question": "What is the penalty for storing unmasked Aadhaar numbers?",
        "answer": "Storing or publishing unmasked Aadhaar numbers without an authorized Aadhaar Data Vault is an offense under Section 42 of the Aadhaar Act, 2016 carrying up to 3 years imprisonment."
      }
    ],
    "sections": [
      {
        "title": "The Verhoeff Dihedral D5 Checksum Standard",
        "content": "UIDAI uses the Verhoeff algorithm to eliminate human entry errors. It uses group theory permutations over dihedral group D5 to detect all adjacent transposition errors."
      }
    ]
  },
  {
    "id": "EKYCDataValidator",
    "slug": "ekyc-data-validator",
    "name": "UIDAI Paperless Offline e-KYC (XML / ZIP) Validator",
    "category": "uidai-aadhaar",
    "shortDescription": "Validate UIDAI Paperless Offline e-KYC XML and ZIP payloads. Inspect Proof of Identity (Poi), Proof of Address (Poa), Base64 photo blocks, XML-DSig digital signatures, and test 4-character Share Code hashing.",
    "metaTitle": "UIDAI Paperless Offline e-KYC (XML / ZIP) Validator | Toolique",
    "metaDescription": "Validate Offline Aadhaar XML payloads client-side. Inspect Poi, Poa, Base64 portraits, verify XML-DSig enveloped signatures, and validate 4-character Share Code hashing.",
    "keywords": [
      "UIDAI offline eKYC validator",
      "Aadhaar offline XML validator",
      "XML-DSig signature check Aadhaar",
      "Offline eKYC share code parser"
    ],
    "icon": "FileCode",
    "howToUse": [
      "Paste your Offline e-KYC XML payload or load the provided UIDAI sample.",
      "Enter the 4-character resident Share Code.",
      "Inspect extracted demographic metadata (Name, DOB, Gender, Address, Reference ID).",
      "Verify XML-DSig digital signature block presence and copy extracted metadata."
    ],
    "faqs": [
      {
        "question": "Does the Offline e-KYC XML contain the resident's Aadhaar number?",
        "answer": "No. The XML never contains the raw 12-digit Aadhaar number; it contains only a reference ID and demographic data signed digitally by UIDAI."
      }
    ],
    "sections": [
      {
        "title": "Offline e-KYC Cryptographic Architecture",
        "content": "Paperless Offline e-KYC provides tamper-proof identity verification without requiring active biometric scanner connections by relying on UIDAI's RSA-SHA256 digital signature."
      }
    ]
  },
  {
    "id": "AadhaarXMLValidator",
    "slug": "aadhaar-xml-validator",
    "name": "UIDAI Auth 2.5 & e-KYC 2.5 XML Schema Validator",
    "category": "uidai-aadhaar",
    "shortDescription": "Lint and validate UIDAI Authentication 2.5 & e-KYC 2.5 request XML payloads against official XSD schemas. Check mandatory attributes: ac, sa, ver=\"2.5\", txn, lk, <Uses>, and <Skey ci=\"...\">.",
    "metaTitle": "UIDAI Auth 2.5 & e-KYC 2.5 XML Schema Validator | Toolique",
    "metaDescription": "Validate UIDAI Auth 2.5 XML request schemas. Check mandatory ac, sa, ver=2.5, license keys, Uses biometric flags, and Skey public certificate identifiers.",
    "keywords": [
      "UIDAI Auth 2.5 XML validator",
      "e-KYC 2.5 schema validation",
      "AUA Sub-AUA XML linter",
      "Aadhaar API specifications"
    ],
    "icon": "Code",
    "howToUse": [
      "Paste your Auth 2.5 or Kyc 2.5 XML request payload.",
      "The engine immediately parses and checks all mandatory UIDAI attributes and namespaces.",
      "Inspect schema validation errors and best practice advisories.",
      "Copy the verified compliant XML payload."
    ],
    "faqs": [
      {
        "question": "Why is ver=\"2.5\" mandatory for UIDAI authentication?",
        "answer": "UIDAI sunset legacy Auth 1.6 and 2.0 protocols to enforce Registered Device (RD Service) biometric encryption and eliminate replay attacks."
      }
    ],
    "sections": [
      {
        "title": "Key Attributes of Auth 2.5 Requests",
        "content": "Auth 2.5 requires precise pairing of License Key (lk), Sub-AUA (sa), AUA (ac), Registered Device metadata (<Meta>), and RSA encrypted session key (<Skey>)."
      }
    ]
  },
  {
    "id": "KYCNameDOBMatchAnalyzer",
    "slug": "kyc-name-dob-match-analyzer",
    "name": "KYC Name & Date of Birth (DOB) Fuzzy Match Analyzer",
    "category": "uidai-aadhaar",
    "shortDescription": "Perform multi-metric fuzzy name matching (Jaro-Winkler, Levenshtein, Token Sort Ratio) and DOB tolerance checking between Aadhaar, PAN, and Bank Account records to automate KYC onboarding decisions.",
    "metaTitle": "KYC Name & DOB Fuzzy Match Analyzer | Toolique",
    "metaDescription": "Compare customer names and DOB across Aadhaar, PAN, and Bank records using Jaro-Winkler and Token Sort fuzzy matching. Detect inverted names and Day/Month swaps.",
    "keywords": [
      "KYC name match analyzer",
      "Jaro Winkler name matching India",
      "Token Sort Ratio Aadhaar PAN",
      "KYC DOB tolerance check",
      "Fuzzy matching onboarding"
    ],
    "icon": "Users",
    "howToUse": [
      "Enter Document 1 (e.g. Aadhaar) and Document 2 (e.g. PAN or Bank) name and DOB.",
      "Review algorithm breakdown: Token Sort Ratio (handles inverted names), Jaro-Winkler, and DOB Swap Detection.",
      "Inspect the Composite KYC Decision: Auto-Approved (>=85%), Manual Review (65-84%), or Rejected (<65%).",
      "Copy the audit trail record for compliance documentation."
    ],
    "faqs": [
      {
        "question": "How does Token Sort Ratio handle Indian inverted names?",
        "answer": "Token Sort splits names into individual words, sorts them alphabetically, and compares strings, ensuring that \"Rahul Sharma\" and \"Sharma Rahul\" yield a 100% match score."
      }
    ],
    "sections": [
      {
        "title": "Automating Straight-Through Processing (STP) in KYC",
        "content": "Financial institutions combine fuzzy string matching with Year-of-Birth tolerance to minimize false rejections caused by clerical errors and regional naming conventions."
      }
    ]
  },
  {
    "id": "RDServiceHealthTester",
    "slug": "rd-service-health-tester",
    "name": "UIDAI Registered Device (RD Service) Health Diagnostic Suite",
    "category": "uidai-aadhaar",
    "shortDescription": "Audit local loopback ports (11100–11105) for certified UIDAI Registered Device services (Mantra, Morpho, Startek, SecuGen), evaluate L0 vs L1 compliance, and diagnose driver connectivity.",
    "metaTitle": "UIDAI Registered Device (RD Service) Health Diagnostic Suite | Toolique",
    "metaDescription": "Test local loopback ports (11100 to 11105) for certified UIDAI Registered Devices (Mantra, Morpho, SecuGen). Diagnose L0 vs L1 compliance and resolve driver Error 1140.",
    "keywords": [
      "RD service tester",
      "UIDAI Registered Device port test",
      "Mantra MFS100 RD service test",
      "Morpho RD service loopback probe",
      "L1 biometric compliance"
    ],
    "icon": "Activity",
    "howToUse": [
      "Click \"Probe Ports\" to scan local loopback ports 11100 through 11105 for active RD services.",
      "Review open/closed status for biometric vendor drivers.",
      "Inspect L0 vs L1 hardware security requirements.",
      "Follow step-by-step troubleshooting tips for Error 1140 and USB selective suspend issues."
    ],
    "faqs": [
      {
        "question": "What is the difference between L0 and L1 Registered Devices?",
        "answer": "L0 devices handle biometric signing at the host software level, whereas L1 devices execute biometric capture, signing, and encryption entirely inside hardware secure crypto chips."
      }
    ],
    "sections": [
      {
        "title": "UIDAI L1 Registered Device Mandate",
        "content": "UIDAI directives require transitioning all Aadhaar authentication deployments to L1 certified hardware to prevent deepfakes and software-level biometric capture injection."
      }
    ]
  },
  {
    "id": "AuthResponseAnalyzer",
    "slug": "auth-response-analyzer",
    "name": "UIDAI Authentication & e-KYC Error Code Analyzer",
    "category": "uidai-aadhaar",
    "shortDescription": "Decode UIDAI numeric error return codes (100, 300, 400, 500, 510, 800, 995, 998). Inspect root causes, developer technical fixes, and user-facing remediation advice.",
    "metaTitle": "UIDAI Authentication & e-KYC Error Code Analyzer | Toolique",
    "metaDescription": "Decode UIDAI Auth and eKYC error codes (100, 300, 400, 500, 800, 995, 998). Inspect root causes, developer API fixes, and user remediation guidance.",
    "keywords": [
      "UIDAI error code decoder",
      "Aadhaar auth error 300",
      "Aadhaar error 998 Verhoeff",
      "eKYC error code fix",
      "UIDAI AuthRes parser"
    ],
    "icon": "Search",
    "howToUse": [
      "Paste an `<AuthRes>` XML snippet or search by error code (e.g. 100, 300, 995).",
      "Inspect the error category, root cause, and developer technical fix.",
      "View citizen/resident advice (e.g. biometric lock in mAadhaar app).",
      "Copy error analysis for technical escalation tickets."
    ],
    "faqs": [
      {
        "question": "What causes Error Code 995 in Aadhaar authentication?",
        "answer": "Error 995 indicates that the resident has locked their biometric data using the UIDAI mAadhaar app or myaadhaar portal. The resident must unlock biometrics temporarily."
      }
    ],
    "sections": [
      {
        "title": "Demographic vs Biometric Error Taxonomy",
        "content": "UIDAI error codes are categorized into demographic mismatches (100/200), biometric low-quality (300/310), device crypto errors (500/520), and identity CIDR status (995-998)."
      }
    ]
  },
  {
    "id": "PIDXMLStructureValidator",
    "slug": "pid-xml-structure-validator",
    "name": "UIDAI PID (Personal Identity Data) XML Structure Inspector",
    "category": "uidai-aadhaar",
    "shortDescription": "Inspect and validate internal UIDAI PID block XML specifications, ISO 19794-2 biometric minutiae tags, demographic `<Demo>` structures, and verify AES-256 encryption hygiene.",
    "metaTitle": "UIDAI PID (Personal Identity Data) XML Structure Inspector | Toolique",
    "metaDescription": "Validate UIDAI PID block XML structures. Inspect ISO 19794-2 biometric minutiae records, Demo tags, and verify AES-256 session key wrapping.",
    "keywords": [
      "UIDAI PID XML validator",
      "Personal Identity Data PID block",
      "ISO 19794-2 FMR minutiae",
      "Aadhaar biometric XML inspection"
    ],
    "icon": "FileCode",
    "howToUse": [
      "Paste raw PID XML block or load the sample template.",
      "Verify `<Demo>`, `<Bios>`, and `<Pv>` structure against UIDAI 2.0 specifications.",
      "Check ISO 19794-2 FMR/FIR biometric modality attributes.",
      "Inspect encryption notices reminding developers that plaintext PID must never traverse public networks."
    ],
    "faqs": [
      {
        "question": "Can raw PID data be transmitted in plaintext?",
        "answer": "Never. Plaintext PID blocks must be encrypted using an AES-256 session key inside the RD Service and wrapped in `<Data type=\"X\">` before transmission."
      }
    ],
    "sections": [
      {
        "title": "PID Block Architecture and Biometric Standards",
        "content": "The PID block packages resident demographic claims, ISO 19794-2 fingerprint minutiae, and timestamps into a unified structure sealed by cryptographic digests."
      }
    ]
  },
  {
    "id": "AadhaarDataExposureScanner",
    "slug": "aadhaar-data-exposure-scanner",
    "name": "Enterprise Aadhaar Data Exposure & ADV Scanner",
    "category": "uidai-aadhaar",
    "shortDescription": "Audit server logs, SQL dumps, and JSON payloads for un-vaulted raw 12-digit Aadhaar numbers using Verhoeff verification, identify ADV compliance breaches, and perform 1-click in-memory redaction.",
    "metaTitle": "Enterprise Aadhaar Data Exposure & ADV Scanner | Toolique",
    "metaDescription": "Audit logs, code, and databases for exposed Aadhaar numbers with Verhoeff D5 algorithm validation. Detect Aadhaar Data Vault (ADV) violations and redact client-side.",
    "keywords": [
      "Aadhaar data exposure scanner",
      "Aadhaar Data Vault ADV audit",
      "Aadhaar leak detector",
      "Section 42 Aadhaar Act compliance",
      "Log sanitizer Aadhaar"
    ],
    "icon": "Search",
    "howToUse": [
      "Paste application logs, database dumps, CSVs, or code snippets into the scanner.",
      "The engine flags genuine 12-digit Aadhaar numbers that pass the Verhoeff checksum.",
      "Differentiates between critical unmasked leaks, masked numbers (XXXX), and false positives.",
      "Click \"Copy Sanitized Logs\" or download the redacted output with all numbers masked."
    ],
    "faqs": [
      {
        "question": "What is an Aadhaar Data Vault (ADV)?",
        "answer": "An Aadhaar Data Vault is an isolated, encrypted database enclave mandated by UIDAI where raw Aadhaar numbers are stored securely and replaced with surrogate reference tokens in transactional systems."
      }
    ],
    "sections": [
      {
        "title": "ADV Implementation Mandate for KYC Ecosystem",
        "content": "All entities handling Aadhaar numbers must deploy an ADV with FIPS 140-2 Level 3 HSM encryption, ensuring raw citizen numbers never persist in general application logs or transactional databases."
      }
    ]
  },
  {
    "id": "ComplianceAuditChecklist",
    "slug": "compliance-audit-checklist",
    "name": "Enterprise Unified Compliance Audit Checklist",
    "category": "audit-evidence",
    "shortDescription": "Unified compliance checklist cross-referencing ISO/IEC 27001:2022, CERT-In Directions 2022, DPDP Act 2023, and RBI Master Direction on IT Governance. Score control maturity and export formal audit workpapers.",
    "metaTitle": "Enterprise Unified Compliance Audit Checklist | Toolique",
    "metaDescription": "Multi-framework compliance checklist for Indian enterprises. Audit ISO 27001, CERT-In, DPDP 2023, and RBI MD-IT controls with interactive scoring and workpaper export.",
    "keywords": [
      "enterprise compliance audit checklist",
      "ISO 27001 CERT-In DPDP unified audit",
      "RBI MD-IT audit checklist",
      "regulatory compliance workpaper"
    ],
    "icon": "FileCheck",
    "howToUse": [
      "Filter controls by framework (ISO 27001, CERT-In, DPDP, RBI) or view all unified controls.",
      "Mark operational implementation status: Compliant, In Review, or Gap.",
      "Review the overall Compliance Readiness Score and mandatory evidence needed for each control.",
      "Export the complete Enterprise Compliance Audit Workpaper."
    ],
    "faqs": [
      {
        "question": "Why is a unified audit framework beneficial?",
        "answer": "It harmonizes overlapping controls across ISO 27001, CERT-In, DPDP, and RBI, allowing organizations to collect evidence once and satisfy multiple statutory audits."
      }
    ],
    "sections": [
      {
        "title": "Unified Control Architecture for Indian Enterprises",
        "content": "Cross-referencing technical controls across ISO standards and Indian statutory directives reduces audit fatigue and guarantees regulatory defensibility before supervisory bodies."
      }
    ]
  },
  {
    "id": "AuditEvidenceOrganizer",
    "slug": "audit-evidence-organizer",
    "name": "Secure Audit Evidence Organizer & Chain of Custody Packager",
    "category": "audit-evidence",
    "shortDescription": "Catalog audit artifacts, compute in-browser SHA-256 cryptographic hashes, track custodian metadata, and export court-admissible electronic evidence manifests under BSA 2023 Section 63 / Evidence Act Section 65B.",
    "metaTitle": "Secure Audit Evidence Organizer & Chain of Custody Packager | Toolique",
    "metaDescription": "Organize compliance audit evidence with in-browser SHA-256 cryptographic hashing. Generate chain of custody manifests defensible under BSA 2023 Section 63 / Sec 65B.",
    "keywords": [
      "audit evidence organizer",
      "BSA 2023 section 63 evidence manifest",
      "SHA-256 evidence hashing",
      "chain of custody audit",
      "electronic evidence certificate"
    ],
    "icon": "FolderArchive",
    "howToUse": [
      "Register evidence artifacts (Policies, VAPT reports, User Access Reviews, Cloud Logs).",
      "Generate instant SHA-256 cryptographic hashes client-side using WebCrypto.",
      "Specify custodian, regulatory mapping, and collection timestamp.",
      "Export the cryptographic Chain of Custody Manifest in JSON or signed text format."
    ],
    "faqs": [
      {
        "question": "What is the role of cryptographic hashes in legal evidence admissibility?",
        "answer": "Under Section 63 of the Bharatiya Sakshya Adhiniyam, 2023 (formerly Section 65B), cryptographic SHA-256 digests prove that digital records have not been altered since collection."
      }
    ],
    "sections": [
      {
        "title": "Chain of Custody and Custodial Certification",
        "content": "Maintaining an immutable chain of custody with documented custodian identity and hash verification is mandatory for secondary digital evidence admissibility in Indian courts."
      }
    ]
  },
  {
    "id": "ControlGapAssessment",
    "slug": "control-gap-assessment",
    "name": "Compliance & Security Control Gap Assessment",
    "category": "audit-evidence",
    "shortDescription": "Assess internal security controls across Level 0 to Level 5 CMMI maturity, calculate residual risk gaps against statutory benchmarks, and generate targeted compensating control roadmaps.",
    "metaTitle": "Compliance & Security Control Gap Assessment | Toolique",
    "metaDescription": "Evaluate organizational security control maturity from Level 0 to Level 5 (CMMI / NIST). Calculate maturity gaps and recommend automated compensating controls.",
    "keywords": [
      "control gap assessment",
      "CMMI security maturity evaluation",
      "NIST CSF maturity levels",
      "compensating controls compliance",
      "security audit roadmap"
    ],
    "icon": "ShieldAlert",
    "howToUse": [
      "Adjust current maturity levels (Level 0 to Level 5) across core security domains.",
      "Compare against statutory target maturity baselines.",
      "Inspect high-deficit gaps (gap >= 2 levels) and review recommended compensating controls.",
      "Export the complete Maturity Gap Assessment & Remediation Roadmap."
    ],
    "faqs": [
      {
        "question": "What is a compensating control in compliance audits?",
        "answer": "A compensating control is an alternative security measure that provides equivalent protection when a standard control cannot be implemented due to technical or business constraints."
      }
    ],
    "sections": [
      {
        "title": "CMMI Maturity Tiers in Cybersecurity Governance",
        "content": "Maturity progresses from ad-hoc reactive processes (Level 1) to documented SOPs (Level 3), quantitatively measured metrics (Level 4), and automated self-healing systems (Level 5)."
      }
    ]
  },
  {
    "id": "RiskRegisterGenerator",
    "slug": "risk-register-generator",
    "name": "Enterprise 5×5 Risk Matrix & Statutory Risk Register Studio",
    "category": "audit-evidence",
    "shortDescription": "Score inherent and residual risks under ISO 31000 and ISO/IEC 27005 using an interactive 5×5 Likelihood vs Impact risk matrix. Visualize risk heatmaps and export CSV risk registers.",
    "metaTitle": "Enterprise 5×5 Risk Matrix & Statutory Risk Register Studio | Toolique",
    "metaDescription": "Create enterprise risk registers with interactive 5x5 Likelihood vs Impact heatmaps under ISO 31000 / ISO 27005. Calculate inherent and residual risk scores, export to CSV.",
    "keywords": [
      "5x5 risk matrix calculator",
      "ISO 31000 risk register generator",
      "inherent vs residual risk calculator",
      "enterprise risk heatmap",
      "cyber risk register CSV"
    ],
    "icon": "ShieldAlert",
    "howToUse": [
      "Log threat scenarios and assign Likelihood (1-5) and Impact (1-5).",
      "Select treatment strategy (Mitigate, Transfer, Avoid, Accept) and document existing controls.",
      "Inspect the interactive 5×5 Risk Heatmap grid showing distribution of risks across cells.",
      "Export the Risk Register to CSV or copy the executive report."
    ],
    "faqs": [
      {
        "question": "How is Inherent Risk Score calculated?",
        "answer": "Inherent Risk Score is the product of Likelihood (1–5) and Impact (1–5), resulting in a score between 1 and 25, categorized into Low, Medium, High, or Critical."
      }
    ],
    "sections": [
      {
        "title": "ISO 31000 Risk Management Methodology",
        "content": "Systematic risk registers identify vulnerabilities, prioritize mitigation investments, and ensure residual risk remains within acceptable Board-approved risk appetite."
      }
    ]
  },
  {
    "id": "RemediationTracker",
    "slug": "remediation-tracker",
    "name": "Remediation Tracker & Corrective Action (CAPA) Manager",
    "category": "audit-evidence",
    "shortDescription": "Track audit non-conformities, penetration testing vulnerabilities, and regulatory inspection corrective actions with automated SLA aging counters (P0 7d, P1 15d, P2 30d, P3 60d) under ISO 27001 Clause 10.",
    "metaTitle": "Remediation Tracker & Corrective Action (CAPA) Manager | Toolique",
    "metaDescription": "Track audit findings and CAPA action items with automated SLA aging countdowns (P0 to P3). Monitor resolution rates and export executive closure reports.",
    "keywords": [
      "remediation tracker CAPA",
      "ISO 27001 clause 10 corrective actions",
      "audit finding closure tracker",
      "VAPT remediation SLA",
      "compliance overdue alerts"
    ],
    "icon": "ListTodo",
    "howToUse": [
      "Log audit findings from VAPT, RBI inspections, internal audits, or DPDP reviews.",
      "Assign priority tiers (P0 Blocker, P1 Critical, P2 High, P3 Medium) with target resolution dates.",
      "Monitor overdue SLA alerts and update workflow status (Open, In Progress, Verification, Closed).",
      "Export the CAPA Closure Report for executive committees and external auditors."
    ],
    "faqs": [
      {
        "question": "What is CAPA in compliance auditing?",
        "answer": "CAPA stands for Corrective and Preventive Actions, a formal framework for identifying root causes of audit non-conformities and implementing permanent controls to prevent recurrence."
      }
    ],
    "sections": [
      {
        "title": "Managing Vulnerability Remediation SLAs",
        "content": "Statutory bodies like CERT-In and RBI enforce strict closure timelines for critical vulnerabilities (typically within 7 to 15 calendar days of discovery)."
      }
    ]
  },
  {
    "id": "PolicyDocumentAnalyzer",
    "slug": "policy-document-analyzer",
    "name": "Statutory Policy Completeness & Mandatory Clause Verifier",
    "category": "audit-evidence",
    "shortDescription": "Audit internal corporate policies for mandatory statutory clauses, version control metadata headers, annual review cadences, board approval statements, and disciplinary enforcement language.",
    "metaTitle": "Statutory Policy Completeness & Mandatory Clause Verifier | Toolique",
    "metaDescription": "Audit corporate information security and privacy policies for mandatory statutory clauses, version control headers, board approvals, and annual review statements.",
    "keywords": [
      "policy document analyzer",
      "ISO 27001 policy clause checker",
      "mandatory privacy policy clauses",
      "board approval statement policy",
      "policy health score"
    ],
    "icon": "BookOpen",
    "howToUse": [
      "Paste internal policy text (InfoSec Policy, Privacy Policy, AUP, Incident Response Plan).",
      "The analyzer scans text for version control headers, board approvals, statutory citations, and review cadences.",
      "Inspect the Policy Health Score and identify missing mandatory clauses.",
      "Copy recommended legal boilerplate clauses directly into your policy."
    ],
    "faqs": [
      {
        "question": "Why are version control headers mandatory in audit policies?",
        "answer": "Under ISO 27001 Clause 7.5, auditors require formal version numbers, effective dates, and approval timestamps to ensure current policies are actively enforced."
      }
    ],
    "sections": [
      {
        "title": "Policy Lifecycle Management and Annual Audits",
        "content": "Dormant or unreviewed policies can invalidate organizational compliance defenses during regulatory inspections. Annual board re-certification is an essential requirement."
      }
    ]
  },
  {
    "id": "AuditReportGenerator",
    "slug": "audit-report-generator",
    "name": "Executive Audit Report Builder & Attestation Studio",
    "category": "audit-evidence",
    "shortDescription": "Compile formal ISO 19011 compliant executive audit reports. Formulate audit opinions (Unqualified, Qualified, Adverse), tally findings severity, and generate print-ready attestation reports with auditor sign-offs.",
    "metaTitle": "Executive Audit Report Builder & Attestation Studio | Toolique",
    "metaDescription": "Generate executive compliance audit reports under ISO 19011. Draft audit opinions, summarize critical/high findings, and produce print-ready auditor attestation documents.",
    "keywords": [
      "executive audit report generator",
      "ISO 19011 audit report builder",
      "auditor attestation sign off",
      "qualified audit opinion report",
      "compliance audit executive summary"
    ],
    "icon": "Award",
    "howToUse": [
      "Enter auditee details, lead auditor credentials, audit period, and scope.",
      "Select overall audit opinion (Unqualified, Qualified, or Adverse).",
      "Input findings count by severity (Critical, High, Medium, Low) and write executive commentary.",
      "Click \"Print / PDF\" to generate a clean, print-ready formal audit report."
    ],
    "faqs": [
      {
        "question": "What is a Qualified Audit Opinion?",
        "answer": "A Qualified Opinion indicates that while general controls are functional, specific identified non-conformities exist that require documented management remediation."
      }
    ],
    "sections": [
      {
        "title": "ISO 19011 Reporting Guidelines",
        "content": "Formal audit reports must clearly state the audit scope, standards evaluated, objective findings, risk levels, and an unambiguous professional opinion from the lead auditor."
      }
    ]
  },
  {
    "id": "RegulatoryEvidenceMapping",
    "slug": "regulatory-evidence-mapping",
    "name": "Cross-Regulatory Evidence Mapping Matrix (One-to-Many)",
    "category": "audit-evidence",
    "shortDescription": "Map single operational evidence artifacts across DPDP Act 2023, RBI MD-IT 2023, CERT-In Directions 2022, ISO 27001:2022, and UIDAI regulations to eliminate 70%+ redundant audit preparation.",
    "metaTitle": "Cross-Regulatory Evidence Mapping Matrix (One-to-Many) | Toolique",
    "metaDescription": "Eliminate duplicate audit effort with a cross-regulatory evidence matrix. Map single technical artifacts across DPDP, RBI MD-IT, CERT-In, ISO 27001, and UIDAI.",
    "keywords": [
      "cross regulatory evidence mapping",
      "one to many compliance matrix",
      "DPDP RBI CERTIn ISO mapping",
      "audit efficiency multiplier",
      "unified compliance evidence"
    ],
    "icon": "Layers",
    "howToUse": [
      "Search operational evidence artifacts (e.g. VAPT reports, MFA logs, WORM log archives).",
      "View multi-framework mapping showing how 1 artifact satisfies 4+ statutory mandates.",
      "Inspect the Efficiency Multiplier metric demonstrating reduced audit workload.",
      "Export the complete Cross-Regulatory Mapping Matrix to CSV or copy the summary."
    ],
    "faqs": [
      {
        "question": "How does evidence mapping reduce audit effort?",
        "answer": "By demonstrating that one rigorous technical control (such as bi-annual VAPT) satisfies DPDP, RBI, CERT-In, and ISO 27001 simultaneously, teams avoid duplicate work."
      }
    ],
    "sections": [
      {
        "title": "The \"Collect Once, Satisfy Many\" Compliance Model",
        "content": "Modern compliance architectures map underlying engineering telemetry to multiple statutory standards, slashing enterprise audit overhead while increasing accuracy."
      }
    ]
  }
];
