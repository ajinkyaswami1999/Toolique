export interface ToolFAQ {
  question: string;
  answer: string;
}

export interface ToolSection {
  title: string;
  content: string;
}

export interface Tool {
  id: string;
  slug: string;
  name: string;
  category: 'finance' | 'civil' | 'architecture' | 'interior' | 'pdf' | 'image' | 'developer' | 'web' | 'text' | 'social' | 'datetime' | 'unit' | 'security' | 'student' | 'automobile' | 'business' | 'health';
  shortDescription: string;
  metaDescription: string;
  keywords: string[];
  icon: string;
  howToUse: string[];
  faqs: ToolFAQ[];
  sections: ToolSection[];
}

export const toolsList: Tool[] = [
  {
    id: 'GSTCalculator',
    slug: 'gst-calculator',
    name: 'GST Calculator',
    category: 'finance',
    shortDescription: 'Calculate Indian Goods and Services Tax (GST) for adding or removing GST percentages.',
    metaDescription: 'Free online Indian GST Calculator. Calculate CGST, SGST, IGST and net amount for adding or removing 5%, 12%, 18%, and 28% GST rates instantly in browser.',
    keywords: ['GST Calculator', 'Indian GST Calculator', 'Calculate SGST CGST', 'Add GST online', 'Remove GST online', 'GST rates India'],
    icon: 'Percent',
    howToUse: [
      'Enter the initial amount (price of product/service).',
      'Select the applicable GST slab (5%, 12%, 18%, 28%) or enter a custom rate.',
      'Choose whether to "Add GST" (calculate tax on top of amount) or "Remove GST" (calculate base price from inclusive amount).',
      'View the calculated Base Amount, CGST (Central GST), SGST (State GST), and Total Amount instantly.'
    ],
    faqs: [
      {
        question: 'What is GST and how does this calculator help?',
        answer: 'GST stands for Goods and Services Tax, a unified indirect tax structure introduced in India. This calculator helps business owners, consumers, and accountants easily compute tax splits (CGST & SGST) or extract the base price from a GST-inclusive amount.'
      },
      {
        question: 'How are CGST and SGST calculated?',
        answer: 'For intra-state transactions in India, GST is split equally between the Central Government (CGST) and State Government (SGST). For example, on an 18% GST rate, CGST is 9% and SGST is 9%.'
      },
      {
        question: 'Is there any charge to use this GST calculator?',
        answer: 'No, this GST calculator is 100% free and runs entirely in your web browser. No registration or payment is required.'
      }
    ],
    sections: [
      {
        title: 'What is GST (Goods & Services Tax)?',
        content: 'GST is a destination-based tax levied on the consumption of goods and services. It was introduced in India on July 1, 2017, to replace multiple cascading indirect taxes such as Service Tax, VAT, Central Excise, Entry Tax, and Octroi. It is structured to bring uniformity and transparency to the taxation system.'
      },
      {
        title: 'Primary GST Slabs in India',
        content: 'Currently, goods and services are classified under five primary tax slabs in India:\n- **0% (Exempted)**: Essential items like fresh milk, curd, fresh fruits, vegetables, and unbranded grains.\n- **5%**: Items of basic necessity like tea, coffee, edible oil, sugar, spices, and lifesaving drugs.\n- **12%**: Includes items like butter, cheese, ghee, fruit juices, computers, and mobile phones.\n- **18%**: The standard slab for most services (including IT, consulting, hotel stays), restaurants, toothpaste, soap, and capital goods.\n- **28%**: Applied to luxury and sin goods such as luxury cars, motorbikes, carbonated drinks, and air conditioners.'
      },
      {
        title: 'GST Calculation Formula',
        content: 'The calculator uses the following formulas for computations:\n\n1. **Add GST Mode (GST Inclusive)**:\n   - GST Amount = (Base Amount × GST Rate) / 100\n   - Total Amount = Base Amount + GST Amount\n\n2. **Remove GST Mode (GST Exclusive)**:\n   - Base Amount = (Total Amount × 100) / (100 + GST Rate)\n   - GST Amount = Total Amount - Base Amount'
      }
    ]
  },
  {
    id: 'SIPCalculator',
    slug: 'sip-calculator',
    name: 'SIP Calculator',
    category: 'finance',
    shortDescription: 'Estimate the future returns of your Systematic Investment Plans (SIP) in mutual funds.',
    metaDescription: 'Calculate the maturity value and wealth gains of your monthly Mutual Fund Systematic Investment Plan (SIP) based on expected annual returns and investment tenure.',
    keywords: ['SIP Calculator', 'Mutual Fund SIP Calculator', 'Wealth Calculator India', 'SIP return estimator', 'Systematic Investment Plan calculator'],
    icon: 'TrendingUp',
    howToUse: [
      'Enter your desired Monthly Investment amount in Rupees.',
      'Enter the Expected Annual Return Rate (%) you anticipate from the mutual fund.',
      'Choose the Time Period in years for which you plan to invest.',
      'Review the summary displaying your Total Invested Amount, Estimated Returns, and Total Maturity Value, accompanied by a growth breakdown table.'
    ],
    faqs: [
      {
        question: 'What is a Systematic Investment Plan (SIP)?',
        answer: 'SIP is a method of investing a fixed amount of money regularly in mutual funds, allowing you to invest small amounts over time and benefit from rupee cost averaging and compounding returns.'
      },
      {
        question: 'What is the formula used to calculate SIP returns?',
        answer: 'The SIP maturity amount is calculated using the formula: M = P × [((1 + i)^n - 1) / i] × (1 + i), where M is maturity value, P is monthly investment, i is periodic rate of interest (annual return / 12 / 100), and n is total number of monthly payments.'
      },
      {
        question: 'Are actual SIP returns guaranteed?',
        answer: 'No, mutual fund investments are subject to market risks. The returns calculated here are projections based on the constant growth rate you specify, for estimation purposes.'
      }
    ],
    sections: [
      {
        title: 'What is a Systematic Investment Plan (SIP)?',
        content: 'A Systematic Investment Plan (SIP) is an investment route offered by mutual funds where you invest a fixed sum of money at predefined intervals (usually monthly). Instead of trying to time the volatile stock market, a SIP allows you to accumulate shares/units steadily, instilling financial discipline and harnessing compounding.'
      },
      {
        title: 'SIP vs Fixed Deposit (FD)',
        content: 'Investing in SIPs and Fixed Deposits serves different risk appetites:\n- **Return Rate**: SIP returns are market-linked, historically yielding 12% to 15% per annum over long terms, whereas FDs offer guaranteed but lower returns of 6% to 7%.\n- **Risk**: SIPs have moderate to high risk depending on the fund category, while FDs have zero market risk.\n- **Inflation Protection**: Equity-linked SIPs are excellent tools to beat inflation, whereas FDs barely keep up with it.'
      },
      {
        title: 'SIP Compounding Formula',
        content: 'The maturity value is estimated using the formula:\n\n**M = P × [ ( (1 + i)ⁿ - 1 ) / i ] × (1 + i)**\n\nWhere:\n- **M**: Future Maturity Value\n- **P**: Monthly Investment Amount\n- **i**: Monthly Interest Rate (Annual Rate / 12 / 100)\n- **n**: Total Number of Installments (Months × Years)'
      }
    ]
  },
  {
    id: 'EMICalculator',
    slug: 'emi-calculator',
    name: 'EMI Calculator',
    category: 'finance',
    shortDescription: 'Compute your monthly Home, Car, or Personal loan EMIs and see amortization schedules.',
    metaDescription: 'Calculate Equated Monthly Installment (EMI) for Home Loan, Car Loan or Personal Loan in India. View detailed interest splits and monthly amortization schedules.',
    keywords: ['EMI Calculator', 'Home Loan EMI Calculator', 'Car Loan Calculator', 'Personal Loan EMI', 'Amortization schedule calculator'],
    icon: 'CreditCard',
    howToUse: [
      'Enter the total Loan Amount (Principal) you wish to borrow.',
      'Enter the Annual Interest Rate (%) charged by the bank.',
      'Enter the Loan Tenure in years or months.',
      'Examine the Monthly EMI, Total Interest Payable, and Total Amount to be repaid. You can also view a year-by-year repayment breakdown.'
    ],
    faqs: [
      {
        question: 'What does EMI mean?',
        answer: 'EMI stands for Equated Monthly Installment. It is the fixed amount you pay to a bank or lender every month until the loan is fully paid off, consisting of both principal and interest components.'
      },
      {
        question: 'How is the EMI calculated?',
        answer: 'EMI is calculated using the formula: EMI = [P x R x (1+R)^N]/[((1+R)^N)-1], where P is Principal loan amount, R is monthly interest rate (Annual Rate / 12 / 100), and N is loan tenure in number of months.'
      },
      {
        question: 'How does loan tenure affect the EMI?',
        answer: 'A longer tenure reduces your monthly EMI payments but increases the overall interest paid over the life of the loan. A shorter tenure increases the monthly EMI but saves you money on interest.'
      }
    ],
    sections: [
      {
        title: 'The Mathematical Formula for EMI',
        content: 'Loan installments are computed worldwide using this standard reducing-balance formula:\n\n**EMI = [P × r × (1 + r)ⁿ] / [ (1 + r)ⁿ - 1 ]**\n\nWhere:\n- **P**: Loan Principal Amount (the borrowed sum)\n- **r**: Monthly Interest Rate (Annual Rate / 12 / 100)\n- **n**: Loan Tenure in number of months'
      },
      {
        title: 'Loan Examples & Benchmarks',
        content: 'Here are typical benchmark examples:\n- **Home Loan**: ₹30 Lakhs at 8.5% interest for 20 years. EMI works out to approx. ₹26,035/mo. Total interest paid is ₹32.48 Lakhs.\n- **Car Loan**: ₹7 Lakhs at 9.5% interest for 5 years. EMI works out to approx. ₹14,701/mo. Total interest paid is ₹1.82 Lakhs.\n- **Personal Loan**: ₹2 Lakhs at 12% interest for 3 years. EMI works out to approx. ₹6,643/mo. Total interest paid is ₹39,146.'
      },
      {
        title: 'Major Indian Banks Interest Rate Guide',
        content: 'Typical interest rates across banks range as follows:\n- **Home Loans (SBI, HDFC, ICICI)**: 8.40% to 9.50% p.a.\n- **Car Loans (Axis, HDFC, SBI)**: 8.75% to 11.50% p.a.\n- **Personal Loans (All Banks)**: 10.50% to 18.00% p.a. depending on credit score (CIBIL).'
      }
    ]
  },
  {
    id: 'AgeCalculator',
    slug: 'age-calculator',
    name: 'Age Calculator',
    category: 'datetime',
    shortDescription: 'Calculate your exact age in years, months, weeks, days, and countdown to next birthday.',
    metaDescription: 'Free online Age Calculator. Calculate your exact age from date of birth in years, months, days, hours, and find out the remaining days until your next birthday.',
    keywords: ['Age Calculator', 'Exact Age Calculator', 'DOB Calculator', 'Calculate age online', 'Birthday countdown'],
    icon: 'Calendar',
    howToUse: [
      'Select your Date of Birth using the calendar input.',
      'Specify the "Age at Date" (defaults to current date, but can be customized).',
      'Click "Calculate" (or watch it update dynamically) to see your age broken down into years, months, days, weeks, hours, and minutes.',
      'Check the countdown timer showing months and days left until your next birthday.'
    ],
    faqs: [
      {
        question: 'How does the Age Calculator compute months and days?',
        answer: 'The calculator accounts for leap years and the varying number of days in each calendar month to give you the most mathematically precise breakdown of your age.'
      },
      {
        question: 'Can I calculate my age on a specific future or past date?',
        answer: 'Yes! You can change the "Calculate Age at" field to any date in the past or future to see what your age was or will be at that time.'
      }
    ],
    sections: [
      {
        title: 'Why Calculate Exact Age?',
        content: 'An age calculator is essential for several standard scenarios:\n- **Eligibility Verification**: Checking if you meet the exact age requirements for state examinations, government job forms, or school admissions.\n- **Insurance Policies**: Premium rates for health or term insurance are calculated based on your exact age in years and months.\n- **Legal Milestones**: Determining dates for retirement, voter registration, or pension eligibility.'
      },
      {
        title: 'How Age is Computed Mathematically',
        content: 'Calculating age seems simple but is complex due to:\n1. **Varying Month Lengths**: Calendar months contain 28, 29, 30, or 31 days.\n2. **Leap Years**: Adding a day in February every 4 years (29 days).\n\nOur system determines full elapsed calendar years first, followed by remaining complete months, and converts fractional weeks and remaining days precisely.'
      }
    ]
  },
  {
    id: 'ExperienceCalculator',
    slug: 'experience-calculator',
    name: 'Experience Calculator',
    category: 'datetime',
    shortDescription: 'Compute your total professional work experience in years, months, and days.',
    metaDescription: 'Calculate exact total work experience between multiple joining and relieving dates. Perfect for creating resumes, job applications, and HR payroll calculations.',
    keywords: ['Work Experience Calculator', 'Job Experience Calculator', 'Resume builder tool', 'Calculate total experience', 'HR tool experience calculator'],
    icon: 'Briefcase',
    howToUse: [
      'Click "Add Employment Period" if you want to compute cumulative experience across multiple jobs.',
      'For each job period, input the Joining Date (Start) and Relieving Date (End). Check "Currently Working Here" for your active job.',
      'The calculator will sum all periods, accounting for standard calendar months, and output your total experience in Years, Months, and Days.'
    ],
    faqs: [
      {
        question: 'Does this calculator support overlapping job periods?',
        answer: 'This calculator sums the durations of each period independently. If your periods overlap, it will add them together rather than merging them, so it is best to enter non-overlapping career intervals.'
      },
      {
        question: 'How is a month defined in experience calculations?',
        answer: 'It calculates months based on standard calendar intervals between dates. If the days exceed the days in the current month, they are converted into a fractional month or added as remaining days.'
      }
    ],
    sections: [
      {
        title: 'Importance of Professional Work Experience Calculation',
        content: 'Accurate experience tracking is vital for several professional milestones:\n- **Resume Building**: Specifying exact experience (e.g., 5 Years, 8 Months) rather than rounding off values.\n- **HR Onboarding**: Human Resource departments use total experience to determine payroll brackets, seniority, and leave balances.\n- **Gratuity Eligibility**: In India, employees are eligible for Gratuity payouts after completing 5 years of continuous service.'
      },
      {
        title: 'How Cumulative Job Periods are Aggregated',
        content: 'The Experience Calculator sums individual start and end dates. Total days are compiled and divided into standardized months (assuming 30 days per month for remainders) and 12-month blocks are rolled over into full years.'
      }
    ]
  },
  {
    id: 'SQLFormatter',
    slug: 'sql-formatter',
    name: 'SQL Formatter',
    category: 'developer',
    shortDescription: 'Beautify, format, and align raw SQL queries online to make them readable.',
    metaDescription: 'Format and beautify raw SQL statements. Indent SELECT, FROM, WHERE, JOIN clauses, capitalize keywords, and clean up messy database queries instantly.',
    keywords: ['SQL Formatter', 'Beautify SQL', 'SQL query aligner', 'Format SQL online', 'Clean SQL queries', 'Database query developer tool'],
    icon: 'Database',
    howToUse: [
      'Paste your raw, messy, or unformatted SQL query into the text area.',
      'Choose whether to capitalize SQL keywords (e.g. SELECT, INSERT, UPDATE).',
      'Click "Format SQL" to output a clean, indented query with appropriate newlines.',
      'Click "Copy to Clipboard" to use it in your database editor, or "Minify" to compress the SQL into a single line.'
    ],
    faqs: [
      {
        question: 'What databases are supported by this formatter?',
        answer: 'Since it formats standard SQL syntax, it works perfectly for MySQL, PostgreSQL, Microsoft SQL Server, Oracle, SQLite, and MariaDB queries.'
      },
      {
        question: 'Is my SQL code secure?',
        answer: 'Yes! The formatting is executed entirely in your browser using local client-side scripts. No SQL queries or data are sent to any external server.'
      }
    ],
    sections: [
      {
        title: 'Why is SQL Formatting Crucial?',
        content: 'Readable code is maintainable code. Raw SQL queries generated by ORMs or written in a hurry are often single-line blocks that are hard to debug. Proper indentation allows developers to quickly spot missing JOIN conditions, misplaced WHERE filters, or syntax errors.'
      },
      {
        title: 'SQL Formatting Best Practices',
        content: 'Standard SQL guidelines suggest:\n- **Capitalize Key Reserved Words**: Keywords like `SELECT`, `FROM`, `WHERE`, `JOIN`, `AND` should be in uppercase to distinguish them from column or table names.\n- **NewLine Indentation**: Place clauses like `FROM`, `WHERE`, and `ORDER BY` on new lines.\n- **Align Joined Tables**: Indent conditions after `ON` and inner join operators.'
      }
    ]
  },
  {
    id: 'JSONFormatter',
    slug: 'json-formatter',
    name: 'JSON Formatter & Validator',
    category: 'developer',
    shortDescription: 'Validate, format, parse, and beautify JSON strings with interactive tree options.',
    metaDescription: 'Beautify, validate, and parse raw JSON strings. Find missing braces, format with custom indentation (2 or 4 spaces), and minify JSON files instantly.',
    keywords: ['JSON Formatter', 'Validate JSON online', 'JSON Beautifier', 'Parse JSON error finder', 'Minify JSON code'],
    icon: 'Code2',
    howToUse: [
      'Paste your raw JSON text into the source input field.',
      'Click "Beautify" to format it with clean structure and proper indentation. Select indentation size (2 or 4 spaces).',
      'If there are syntax errors, the built-in validator will highlight the exact error message and the position of the issue.',
      'Use "Minify" to strip whitespace, "Copy" to save the formatted result, or "Clear" to reset.'
    ],
    faqs: [
      {
        question: 'How does the JSON validator show errors?',
        answer: 'If the JSON is invalid, the calculator catches the standard JavaScript JSON parse error, pointing out the exact token or position where the syntax breaks.'
      },
      {
        question: 'Can I format large JSON structures?',
        answer: 'Yes, because the calculations are performed on your local computer, this tool can process large JSON files quickly without uploading bandwidth lag.'
      }
    ],
    sections: [
      {
        title: 'What is JSON (JavaScript Object Notation)?',
        content: 'JSON is a lightweight, language-independent data interchange format. It uses human-readable text to store and transmit data objects consisting of attribute-value pairs and arrays. It is the primary format used in modern REST APIs, web apps, and configuration files.'
      },
      {
        title: 'Common JSON Syntax Violations',
        content: 'JSON validation typically fails due to:\n- **Single Quotes**: JSON standards strictly mandate double quotes (`"key": "value"`) for keys and string values.\n- **Trailing Commas**: A trailing comma after the last item in an array or object is invalid in JSON.\n- **Missing Brackets**: Unequal open and close curly braces (`{}`) or square brackets (`[]`).'
      }
    ]
  },
  {
    id: 'QRCodeGenerator',
    slug: 'qr-code-generator',
    name: 'QR Code Generator',
    category: 'social',
    shortDescription: 'Generate high-quality QR codes for URLs, text, Wi-Fi details, and download them.',
    metaDescription: 'Create custom QR codes for websites, texts, and contact details. Customize colors, sizes, and download the QR code as PNG in-browser.',
    keywords: ['QR Code Generator', 'Make QR code free', 'Download QR code PNG', 'Custom QR color generator', 'No-expiry QR code generator'],
    icon: 'QrCode',
    howToUse: [
      'Type or paste your URL, phone number, or custom text in the content box.',
      'Customize the background and foreground colors to match your brand.',
      'Adjust the size of the QR code.',
      'Click "Download PNG" to download a clean, high-resolution QR code directly to your device.'
    ],
    faqs: [
      {
        question: 'Do these QR codes expire?',
        answer: 'No! The generated QR codes encode static text directly into the pattern, meaning they will function indefinitely and never expire.'
      },
      {
        question: 'Can I use these QR codes for commercial projects?',
        answer: 'Yes, these QR codes are free for commercial or personal use without any licensing restrictions.'
      }
    ],
    sections: [
      {
        title: 'How Do QR Codes Store Information?',
        content: 'QR (Quick Response) codes are two-dimensional matrix barcodes. They represent alphanumeric characters in black and white squares (modules) arranged in a grid. Scanners detect standard positioning anchors (the three squares at the corners) to orient and decode the text or URL instantly.'
      },
      {
        title: 'Static vs Dynamic QR Codes',
        content: '- **Static QR Codes**: The data is encoded directly into the pattern itself. They are free, permanent, and never expire. However, the content cannot be modified once generated.\n- **Dynamic QR Codes**: Encode a short redirect link pointing to a server. You can change the destination URL later and track scan statistics.'
      }
    ]
  },
  {
    id: 'ImageCompressor',
    slug: 'image-compressor',
    name: 'Image Compressor',
    category: 'image',
    shortDescription: 'Compress PNG, JPEG, and WebP images to smaller sizes without losing quality.',
    metaDescription: 'Compress JPEG, PNG, and WebP images online for free in your browser. Reduce file size up to 90% while preserving visual clarity for SEO page speed.',
    keywords: ['Image Compressor', 'Reduce photo size', 'Compress JPEG online', 'Resize PNG image', 'Website image optimizer', 'In-browser image compressor'],
    icon: 'FileImage',
    howToUse: [
      'Drag and drop or select your image (JPEG, PNG, WebP) from your device.',
      'Adjust the compression quality slider (from 10% to 100%). Lower values reduce file size more but may affect detail.',
      'Optionally set a maximum width/height if you want to resize the image resolution.',
      'Review the real-time file size comparison (Original vs Compressed) and click "Download Compressed Image".'
    ],
    faqs: [
      {
        question: 'Is it safe to upload private images here?',
        answer: 'Yes, completely safe! This tool uses HTML5 Canvas APIs inside your local browser. Your images are never uploaded to any server, keeping your private documents 100% confidential.'
      },
      {
        question: 'Will image compression affect SEO?',
        answer: 'Yes, positively! Compressed, fast-loading images speed up your page load times, which is a major factor in Google page experience rankings.'
      }
    ],
    sections: [
      {
        title: 'Why is Image Optimization Vital for SEO?',
        content: 'Page speed is a core ranking factor in search engines. High-resolution photos taken on modern cameras are often several megabytes in size, resulting in high bounce rates on mobile networks. Compressing images reduces bandwidth consumption and boosts Google Core Web Vitals (LCP) performance.'
      },
      {
        title: 'Lossy vs Lossless Compression',
        content: '- **Lossy Compression**: Strips unnoticeable image details to reduce file size dramatically (often 70% to 90%). Supported by JPEG and WebP formats.\n- **Lossless Compression**: Reconstructs pixel data perfectly but yields smaller file size reductions (e.g., PNG optimization).'
      }
    ]
  },
  {
    id: 'UPIQRGenerator',
    slug: 'upi-qr-generator',
    name: 'UPI QR Code Generator',
    category: 'security',
    shortDescription: 'Create standard Indian UPI payment QR codes for fast mobile scans and transfers.',
    metaDescription: 'Generate dynamic UPI QR codes for GPAY, PhonePe, Paytm, BHIM and Amazon Pay. Insert UPI ID, Payee Name, Amount, and Remarks for easy scans.',
    keywords: ['UPI QR Generator', 'Paytm QR maker', 'PhonePe QR code online', 'Indian UPI payment QR', 'Dynamic UPI QR generator', 'Bhumi QR code maker'],
    icon: 'Scan',
    howToUse: [
      'Enter the receiver UPI ID (e.g., username@bankname or mobile@upi).',
      'Enter the payee/business name.',
      'Optionally, specify a fixed transaction amount (in INR) and a transaction note (e.g., "Office Lunch").',
      'The UPI-compliant QR code is generated instantly. Test it by scanning with any Indian UPI app (BHIM, Google Pay, PhonePe, Paytm), and download the QR image.'
    ],
    faqs: [
      {
        question: 'Is this UPI QR code compatible with all UPI apps?',
        answer: 'Yes, the QR code uses the official NPCI (National Payments Corporation of India) UPI URI specification, which is supported by Google Pay, PhonePe, BHIM, Paytm, WhatsApp Pay, and all major bank UPI apps.'
      },
      {
        question: 'Does this generator charge a commission or process payments?',
        answer: 'No, this generator simply encodes the payment instructions into a standard format QR code. The actual payment transfer is completed directly between the sender and receiver bank accounts via the scanning app. We do not handle or track any funds.'
      }
    ],
    sections: [
      {
        title: 'How a UPI QR Code Works',
        content: 'Unified Payments Interface (UPI) is a real-time instant payment system developed by NPCI. A UPI QR code contains a specific payment link scheme:\n\n`upi://pay?pa=payee@bank&pn=Name&am=Amount&cu=INR`\n\nWhen scanned, the UPI application parses this URL structure to identify the receiver VPA and pre-fill details.'
      },
      {
        title: 'Security and Authentication',
        content: 'Static UPI QR codes do not require access to your bank PIN or passwords to be generated. They are public keys, meaning they are completely safe to print, put up in shops, or share with customers. The sender is the one who initiates the authentication.'
      }
    ]
  },
  {
    id: 'TDSCalculator',
    slug: 'tds-calculator',
    name: 'TDS Calculator (India)',
    category: 'finance',
    shortDescription: 'Calculate tax deducted at source (TDS) under various sections of Indian Income Tax Act.',
    metaDescription: 'Calculate TDS (Tax Deducted at Source) under sections 194C, 194J, 194I, 194H of the Indian Income Tax Act based on payee category and amount.',
    keywords: ['TDS Calculator', 'Tax Deducted at Source calculator', 'Section 194J TDS rate', 'Section 194C TDS rate', 'Indian TDS tax tool', 'Income tax TDS calculation'],
    icon: 'Calculator',
    howToUse: [
      'Enter the gross amount payable or invoice value (excluding GST if applicable).',
      'Select the Income Tax Section (e.g. 194J for Professional Fees, 194C for Contractors, 194I for Rent).',
      'Select the Payee Type (Individual/HUF or Company/Partnership Firm) as TDS rates vary by category.',
      'Review the TDS Rate, the calculated Deducted Tax Amount, and the Net Payable Amount.'
    ],
    faqs: [
      {
        question: 'What is TDS?',
        answer: 'Tax Deducted at Source (TDS) is a mechanism under the Indian Income Tax Act where a person or business responsible for making specified payments (like salary, commission, rent, professional fees) deducts tax before paying the balance.'
      },
      {
        question: 'What are the common TDS sections and rates?',
        answer: 'Common sections include: Sec 194C (Contractors: 1% for Individual/HUF, 2% for others), Sec 194J (Professional fees: 10%, Technical service/Royalty: 2%), Sec 194I (Rent on Land/Building: 10%, Rent on Plant/Machinery: 2%), and Sec 194H (Commission: 5%).'
      },
      {
        question: 'When is TDS not applicable?',
        answer: 'TDS is generally not deducted if the total payment to a party in a single financial year is below specified thresholds (e.g. Rs. 30,000 for Sec 194C single invoice, or Rs. 1,00,000 cumulative; Rs. 30,000 for Sec 194J; Rs. 2,40,000 for Sec 194I rent).'
      }
    ],
    sections: [
      {
        title: 'What is Tax Deducted at Source (TDS)?',
        content: 'TDS is an indirect tax collection mechanism regulated under the Income Tax Act, 1961. The paying authority (deductor) deducts a percentage of the payment at the source and deposits it with the Income Tax Department on behalf of the receiver (deductee).'
      },
      {
        title: 'Common TDS Sections & Thresholds',
        content: '- **Section 194C (Contractors)**: Rate is 1% for Individuals/HUF and 2% for Corporate Payees. Threshold: ₹30,000 for a single transaction or ₹1,00,000 aggregate annually.\n- **Section 194J (Professional Services)**: Rate is 10% for professional services/director fees and 2% for technical services/call centres. Threshold: ₹30,000 annually.\n- **Section 194I (Rent)**: Rate is 10% for land/building rent and 2% for plant/machinery leasing. Threshold: ₹2,40,000 annually.'
      }
    ]
  },
  {
    id: 'InHandSalaryCalculator',
    slug: 'in-hand-salary-calculator',
    name: 'In-Hand Salary Calculator',
    category: 'finance',
    shortDescription: 'Estimate your monthly take-home salary after PF, Professional Tax, and Income Tax deductions.',
    metaDescription: 'Calculate your monthly In-Hand Salary from annual CTC in India. Compare tax liability under the New and Old Tax Regimes, including EPF and Professional Tax deductions.',
    keywords: ['In-Hand Salary Calculator', 'CTC to Inhand Salary', 'Take-home salary India', 'New vs Old Tax Regime calculator', 'EPF deduction calculator', 'Salary income tax split'],
    icon: 'Wallet',
    howToUse: [
      'Enter your Annual Gross CTC (Cost to Company).',
      'Specify any annual variable pay or performance bonus included in the CTC (which is paid yearly).',
      'Select the monthly Employee Provident Fund (EPF) option (12% of basic or custom amount).',
      'Choose whether to calculate based on the New Tax Regime (default) or Old Tax Regime.',
      'Check the detailed report showing the monthly basic pay, EPF deduction, Professional Tax (usually Rs. 200), calculated Income Tax, and final estimated monthly take-home salary.'
    ],
    faqs: [
      {
        question: 'What is the difference between CTC and In-hand salary?',
        answer: 'CTC (Cost to Company) is the total annual expense an employer incurs on an employee. In-hand salary is the actual net amount credited to your bank account every month after statutory deductions like EPF, Professional Tax, and Income Tax (TDS).'
      },
      {
        question: 'Should I choose the New or Old Tax Regime?',
        answer: 'The New Tax Regime offers lower tax slabs but removes most deductions (like 80C, 80D, HRA). The Old Tax Regime has higher tax slabs but allows standard tax savings. For high-earning individuals with no investments, the New Regime is generally beneficial, while those with significant investments/home loans may benefit from the Old Regime.'
      },
      {
        question: 'What is the standard Professional Tax in India?',
        answer: 'Professional Tax is a state-level tax on professions, trades, and employments. In most Indian states, the maximum Professional Tax is capped at Rs. 2,500 per annum, usually deducted as Rs. 200 per month (and Rs. 300 in February).'
      }
    ],
    sections: [
      {
        title: 'CTC vs Gross Salary vs Take-Home Salary',
        content: '- **CTC (Cost to Company)**: Includes all benefits such as Employer PF contributions, Gratuity, Health Insurance, and Variable Bonus.\n- **Gross Salary**: CTC minus variable pay and Employer PF contributions.\n- **Take-Home (In-Hand) Salary**: The net monthly credited sum after subtracting Employee PF (12%), Professional Tax (PT), and Income Tax TDS.'
      },
      {
        title: 'New vs Old Tax Regime Comparison',
        content: '- **New Regime (Standard)**: Offers lower tax rates across slabs. A standard deduction of ₹75,000 applies. No exemptions under Section 80C, HRA, or 80D can be claimed.\n- **Old Regime**: Offers higher tax rates but allows exemptions of up to ₹1.5 Lakhs under 80C (PPF, ELSS), HRA deductions, and ₹25,000/50,000 under 80D.'
      }
    ]
  },
  {
    id: 'FDCalculator',
    slug: 'fd-calculator',
    name: 'Fixed Deposit (FD) Calculator',
    category: 'finance',
    shortDescription: 'Calculate the maturity value and interest earned on your Fixed Deposit (FD) instantly.',
    metaDescription: 'Calculate Fixed Deposit (FD) interest and maturity amount online. Supports quarterly, monthly, half-yearly, and yearly compounding frequencies for all major Indian banks.',
    keywords: ['FD Calculator', 'Fixed Deposit Calculator', 'FD Interest Rates India', 'Calculate FD maturity online', 'SBI FD calculator'],
    icon: 'Landmark',
    howToUse: [
      'Enter the Principal Amount you wish to invest.',
      'Enter the Annual Interest Rate (%) offered by the bank.',
      'Enter the Tenure in years, months, or days.',
      'Choose the compounding frequency (Quarterly is standard for Indian banks).',
      'Review the total Invested Amount, total Interest Earned, and Maturity Value.'
    ],
    faqs: [
      {
        question: 'What is a Fixed Deposit (FD)?',
        answer: 'A Fixed Deposit is a secure financial instrument offered by banks and non-banking financial companies (NBFCs) in India where you invest a lump sum for a fixed tenure at a guaranteed interest rate.'
      },
      {
        question: 'How does the FD Calculator compute interest?',
        answer: 'For tenures longer than 6 months, Indian banks generally calculate interest on a quarterly compounding basis. The formula is: A = P(1 + r/n)^(nt), where A is maturity value, P is principal, r is annual rate of interest, n is compounding frequency per year, and t is total years.'
      },
      {
        question: 'What is the difference between Cumulative and Non-Cumulative FDs?',
        answer: 'In a Cumulative FD, interest is compounded and paid along with the principal at maturity, maximizing wealth growth. In a Non-Cumulative FD, interest is paid out at regular intervals (monthly, quarterly) to provide a steady income stream.'
      }
    ],
    sections: [
      {
        title: 'Understanding Fixed Deposits in India',
        content: 'Fixed Deposits (FDs) are one of the most popular savings options in India due to their low-risk nature and guaranteed returns. Unlike equity mutual funds or stocks, FDs are not subject to market volatility. The deposit insurance scheme (DICGC) also secures bank deposits up to ₹5 Lakhs per account, making FDs extremely safe.'
      },
      {
        title: 'FD Calculation & Compounding Formula',
        content: 'The maturity amount of a Fixed Deposit is calculated using the compound interest formula:\n\n**A = P × (1 + r / n)^(n × t)**\n\nWhere:\n- **A**: Maturity Amount\n- **P**: Principal Investment Amount\n- **r**: Annual Rate of Interest (as a decimal, e.g. 7.1% = 0.071)\n- **n**: Number of compounding periods per year (monthly = 12, quarterly = 4, half-yearly = 2, yearly = 1)\n- **t**: Total tenure of the investment in years.'
      },
      {
        title: 'Tax Implications on FD Returns (TDS)',
        content: 'Interest earned on FDs is fully taxable under the head "Income from Other Sources". Banks deduct Tax Deducted at Source (TDS) at 10% if the annual interest exceeds ₹40,000 (₹50,000 for senior citizens). If your total income is below the taxable limit, you can submit Form 15G or Form 15H to prevent TDS deductions.'
      }
    ]
  },
  {
    id: 'RDCalculator',
    slug: 'rd-calculator',
    name: 'Recurring Deposit (RD) Calculator',
    category: 'finance',
    shortDescription: 'Calculate the maturity amount and total interest earned on your monthly Recurring Deposit (RD).',
    metaDescription: 'Calculate Recurring Deposit (RD) maturity value and interest. Compute monthly savings accumulation with quarterly compounding to match Indian bank passbooks.',
    keywords: ['RD Calculator', 'Recurring Deposit Calculator', 'RD interest rates', 'Post office RD calculator', 'Monthly savings calculator India'],
    icon: 'TrendingUp',
    howToUse: [
      'Enter your Monthly Deposit amount in Rupees.',
      'Enter the Annual Interest Rate (%) offered by the bank.',
      'Enter the investment Tenure in years or months.',
      'Review the summary showing your Total Amount Deposited, Interest Earned, and final Maturity Value.'
    ],
    faqs: [
      {
        question: 'What is a Recurring Deposit (RD)?',
        answer: 'A Recurring Deposit is a special type of term deposit which allows people to make regular monthly investments and earn interest rates comparable to Fixed Deposits.'
      },
      {
        question: 'How is RD interest calculated in India?',
        answer: 'RD interest is compounded quarterly. Since deposits are made monthly, the formula sums up compound interest for each installment individually based on the number of months it remains with the bank.'
      },
      {
        question: 'Can I withdraw my RD before the tenure ends?',
        answer: 'Yes, premature withdrawal of RD is allowed, but banks usually charge a penalty (typically 0.5% to 1% lower than the applicable rate for the period the deposit remained with the bank).'
      }
    ],
    sections: [
      {
        title: 'What is a Recurring Deposit (RD)?',
        content: 'A Recurring Deposit (RD) is an investment tool that helps individuals with a regular source of income to build a savings pool. Instead of investing a lump sum like in an FD, you invest a fixed monthly amount for a pre-determined period. RDs are ideal for individuals who want to build a secure financial cushion without committing large lump sums upfront.'
      },
      {
        title: 'RD Compounding Formula',
        content: 'The maturity amount of a Recurring Deposit is calculated using the formula prescribed by the Indian Banks Association (IBA):\n\n**M = P × [ (1 + i)ⁿ - 1 ] / [ 1 - (1 + i)^(-1/3) ]**\n\nWhere:\n- **M**: Maturity Value\n- **P**: Monthly Installment Amount\n- **i**: Interest rate per quarter (r / 400)\n- **n**: Number of quarters (Number of months / 3)'
      }
    ]
  },
  {
    id: 'PPFCalculator',
    slug: 'ppf-calculator',
    name: 'Public Provident Fund (PPF) Calculator',
    category: 'finance',
    shortDescription: 'Estimate the interest earned, yearly balances, and maturity value of your PPF investments.',
    metaDescription: 'Free online PPF Calculator for India. Calculate public provident fund maturity amount, interest earned, and tax exemptions under Section 80C instantly.',
    keywords: ['PPF Calculator', 'Public Provident Fund', 'PPF returns calculator', 'PPF interest rate 2026', 'Section 80C tax saver'],
    icon: 'Coins',
    howToUse: [
      'Enter your Yearly Investment amount (maximum ₹1.5 Lakhs per year).',
      'Select the PPF Interest Rate (current rate is 7.1% p.a.).',
      'Choose the total duration (minimum lock-in is 15 years, extendable in blocks of 5 years).',
      'Review the detailed year-by-year compounding sheet and maturity values.'
    ],
    faqs: [
      {
        question: 'What is the Public Provident Fund (PPF)?',
        answer: 'PPF is a long-term government-backed savings scheme in India designed to provide retirement security with attractive tax-free interest rates.'
      },
      {
        question: 'When is PPF interest calculated and credited?',
        answer: 'PPF interest is calculated monthly based on the lowest balance in the account between the 5th and the last day of the month, but it is credited to the account once a year on March 31st.'
      },
      {
        question: 'What does the EEE tax status of PPF mean?',
        answer: 'EEE stands for Exempt-Exempt-Exempt. It means that the principal invested (up to ₹1.5 Lakhs under Sec 80C), the interest earned, and the final maturity amount are all completely exempt from income tax.'
      }
    ],
    sections: [
      {
        title: 'Why Choose Public Provident Fund (PPF)?',
        content: 'PPF is one of the safest tax-saving instruments in India because it is directly backed by the Central Government. It offers guaranteed, tax-free returns and is immune to court attachments. A PPF account has a maturity period of 15 years, which can be extended indefinitely in blocks of 5 years.'
      },
      {
        title: 'PPF Interest Calculation Rule',
        content: 'Interest is calculated on the lowest balance in the account between the close of the 5th day and the end of the month. Therefore, to maximize interest earnings, PPF subscribers should deposit their annual contributions on or before the 5th of April each financial year.'
      }
    ]
  },
  {
    id: 'NPSCalculator',
    slug: 'nps-calculator',
    name: 'National Pension System (NPS) Calculator',
    category: 'finance',
    shortDescription: 'Calculate your pension, lump sum corpus, and retirement wealth using the NPS retirement tool.',
    metaDescription: 'Calculate National Pension Scheme (NPS) corpus, monthly pension amount, and lump sum payouts. Model equity vs debt allocations for tax saving under Sec 80CCD.',
    keywords: ['NPS Calculator', 'National Pension System', 'Pension calculator India', 'NPS tax exemption', 'Retirement planning tools'],
    icon: 'Wallet',
    howToUse: [
      'Input your current age and planned retirement age (default: 60).',
      'Enter your Monthly NPS Contribution.',
      'Adjust your Expected Annual Return (%) based on your asset allocation (Equity/Debt).',
      'Select the percentage of corpus to purchase annuity (minimum 40% is mandatory at retirement).',
      'Adjust the expected annuity return rate (standard is 6% to 7%).',
      'Examine the total accumulated wealth, lump sum withdrawal amount, and expected monthly pension.'
    ],
    faqs: [
      {
        question: 'What is the National Pension System (NPS)?',
        answer: 'NPS is a voluntary, long-term retirement savings scheme designed to enable systematic savings during working life, managed by professional fund managers (PFM) regulated by PFRDA.'
      },
      {
        question: 'What are the tax benefits of NPS?',
        answer: 'NPS contributions are eligible for deduction up to ₹1.5 Lakhs under Sec 80C, plus an additional exclusive deduction of ₹50,000 under Section 80CCD(1B).'
      },
      {
        question: 'Is NPS withdrawal completely tax-free at age 60?',
        answer: 'Yes. At age 60, you can withdraw up to 60% of the corpus as a tax-free lump sum. The remaining 40% must be used to purchase a pension annuity, which is taxable as regular income in the year received.'
      }
    ],
    sections: [
      {
        title: 'Understanding the National Pension System (NPS)',
        content: 'The National Pension System is an excellent tool for retirement wealth building. It lets you allocate your savings into three major asset classes: Equity (E), Corporate Bonds (C), and Government Securities (G). This flex-choice enables investors to earn higher returns than traditional EPF or PPF options.'
      },
      {
        title: 'Annuity and Pension Rules',
        content: 'When you reach the age of 60, you are allowed to withdraw a maximum of 60% of the accumulated corpus tax-free. The remaining 40% must be reinvested into a life annuity program via an Annuity Service Provider (ASP) to guarantee a regular monthly pension for the rest of your life.'
      }
    ]
  },
  {
    id: 'GratuityCalculator',
    slug: 'gratuity-calculator',
    name: 'Gratuity Calculator',
    category: 'finance',
    shortDescription: 'Calculate the gratuity amount you are entitled to receive upon leaving a job or retiring.',
    metaDescription: 'Calculate your Gratuity payout in India online under the Payment of Gratuity Act. Enter basic salary, DA, and years of service to view estimated payouts instantly.',
    keywords: ['Gratuity Calculator', 'Payment of Gratuity Act', 'Calculate gratuity online', 'Retirement gratuity formula', 'Gratuity eligibility India'],
    icon: 'Calculator',
    howToUse: [
      'Enter your Last Drawn Monthly Basic Salary + Dearness Allowance (DA).',
      'Enter your total years of continuous service with the employer.',
      'View the estimated Gratuity payment amount instantly.'
    ],
    faqs: [
      {
        question: 'What is Gratuity?',
        answer: 'Gratuity is a financial perk given by an employer to an employee in appreciation for services rendered during their tenure, regulated under the Payment of Gratuity Act, 1972.'
      },
      {
        question: 'What is the eligibility for receiving Gratuity?',
        answer: 'Under the Payment of Gratuity Act, an employee is eligible to receive gratuity only after completing a minimum of 5 years of continuous service with the same employer.'
      },
      {
        question: 'What is the mathematical formula for gratuity?',
        answer: 'The gratuity amount is calculated using the formula: Gratuity = (15 × Last Drawn Salary × Years of Service) / 26. Here, "Last Drawn Salary" includes Basic Salary and Dearness Allowance (DA).'
      }
    ],
    sections: [
      {
        title: 'The Payment of Gratuity Act, 1972',
        content: 'Gratuity is a statutory retirement benefit paid to employees in India. It applies to all factories, mines, oilfields, plantations, ports, railways, shops, and establishments that employ 10 or more people on any day of the preceding 12 months. Once an establishment comes under the purview of this Act, it remains covered even if the employee strength falls below 10.'
      },
      {
        title: 'Gratuity Calculation Formula',
        content: 'The gratuity calculation is standardized as follows:\n\n**Gratuity = ( 15 × Last Drawn Salary × Years of Service ) / 26**\n\nWhere:\n- **Last Drawn Salary**: Basic Salary + Dearness Allowance (DA)\n- **Years of Service**: Total years of continuous employment. A fraction of service exceeding 6 months is rounded up to a full year (e.g. 5 years and 7 months is counted as 6 years).'
      }
    ]
  },
  {
    id: 'HRACalculator',
    slug: 'hra-calculator',
    name: 'HRA Calculator',
    category: 'finance',
    shortDescription: 'Calculate the tax-exempt portion of your House Rent Allowance (HRA) to reduce income tax.',
    metaDescription: 'Calculate HRA tax exemptions under Section 10(13A) of the Income Tax Act. Compare metro vs non-metro exemptions based on basic salary, HRA received, and rent paid.',
    keywords: ['HRA Calculator', 'House Rent Allowance exemption', 'Calculate HRA tax rebate', 'Section 10(13A) HRA rules', 'Metro vs non metro HRA'],
    icon: 'Home',
    howToUse: [
      'Enter your Monthly Basic Salary + Dearness Allowance (DA).',
      'Enter your Monthly HRA received from your employer.',
      'Enter the actual Monthly Rent paid to your landlord.',
      'Specify whether you reside in a metro city (Delhi, Mumbai, Kolkata, Chennai) or a non-metro city.',
      'Review the calculated Exempted HRA (tax-free) and Taxable HRA amounts.'
    ],
    faqs: [
      {
        question: 'What is HRA exemption under Section 10(13A)?',
        answer: 'House Rent Allowance (HRA) is paid by employers to help employees cover rental housing costs. Section 10(13A) of the Income Tax Act allows a part of this allowance to be tax-exempt based on specific conditions.'
      },
      {
        question: 'What are the three criteria for HRA tax exemption?',
        answer: 'The tax-exempt HRA is the minimum of: (1) Actual HRA received, (2) Actual rent paid minus 10% of basic salary, or (3) 50% of basic salary (for metro cities) or 40% of basic salary (for non-metro cities).'
      },
      {
        question: 'Can I claim HRA if I live in my own house?',
        answer: 'No, you cannot claim HRA exemption if you reside in your own house or if you do not incur any actual expenditure on rent.'
      }
    ],
    sections: [
      {
        title: 'Understanding House Rent Allowance (HRA) Exemption',
        content: 'HRA is a major tax-saving component for salaried individuals in India. To claim HRA exemption under the Old Tax Regime, you must be a rent-paying tenant residing in a rented property. Note that HRA exemptions are not available if you choose the New Tax Regime.'
      },
      {
        title: 'Metro vs Non-Metro HRA Rules',
        content: 'The Income Tax rules classify only four cities as metros for HRA calculations: Mumbai, Delhi, Kolkata, and Chennai. For these four cities, HRA exemption limits are capped at 50% of Basic Salary + DA. For all other cities in India (including tech hubs like Bangalore, Hyderabad, and Pune), the limit is capped at 40% of Basic Salary + DA.'
      }
    ]
  },
  {
    id: 'CAGRCalculator',
    slug: 'cagr-calculator',
    name: 'CAGR Calculator',
    category: 'finance',
    shortDescription: 'Compute the Compound Annual Growth Rate (CAGR) of your mutual funds or investments.',
    metaDescription: 'Calculate Compound Annual Growth Rate (CAGR) online. Enter initial and final values along with the time period to get accurate annual compounding return percentages.',
    keywords: ['CAGR Calculator', 'Compound Annual Growth Rate', 'Calculate mutual fund CAGR', 'Annualized returns calculator', 'Investment growth calculator'],
    icon: 'Percent',
    howToUse: [
      'Enter the Beginning Value (initial purchase price/investment).',
      'Enter the Ending Value (current value or redemption price).',
      'Enter the Time Period in years.',
      'View the CAGR percentage instantly.'
    ],
    faqs: [
      {
        question: 'What is CAGR?',
        answer: 'CAGR stands for Compound Annual Growth Rate. It represents the mean annual growth rate of an investment over a specified period of time longer than one year, assuming the investment compounds steadily.'
      },
      {
        question: 'What is the formula used for CAGR?',
        answer: 'The formula is: CAGR = ((Ending Value / Beginning Value) ^ (1 / t)) - 1, where t is the total duration in years.'
      },
      {
        question: 'Why is CAGR preferred over absolute returns?',
        answer: 'Absolute return only shows the total growth percentage without considering time. CAGR factors in the time value of money, letting you compare the performance of different asset classes over identical periods.'
      }
    ],
    sections: [
      {
        title: 'What is CAGR (Compound Annual Growth Rate)?',
        content: 'CAGR is not a real-world return rate; rather, it is a representational figure. It describes the rate at which an investment would have grown if it had grown at a steady, constant compounding rate every single year over the entire investment horizon.'
      },
      {
        title: 'CAGR Formula and Mathematics',
        content: 'The math behind CAGR is computed using this algebraic formulation:\n\n**CAGR = [ ( Ending Value / Beginning Value )^(1 / t) ] − 1**\n\nWhere:\n- **Ending Value**: Final valuation of the asset\n- **Beginning Value**: Initial cost of the asset\n- **t**: Total elapsed years (can be fractional, e.g. 2.5 years)'
      }
    ]
  },
  {
    id: 'GSTIncExcCalculator',
    slug: 'gst-inclusive-exclusive-calculator',
    name: 'GST Inclusive/Exclusive Calculator',
    category: 'finance',
    shortDescription: 'Compare GST inclusive and exclusive pricing calculations side-by-side.',
    metaDescription: 'Add or extract GST percentages. Compare GST Inclusive and Exclusive calculations side-by-side for 5%, 12%, 18%, and 28% tax slabs instantly.',
    keywords: ['GST Inclusive Exclusive', 'Add GST online', 'Extract GST formula', 'Indian tax calculator inclusive', 'Calculate CGST SGST online'],
    icon: 'Percent',
    howToUse: [
      'Enter the base or total amount in the input field.',
      'Select the tax slab (5%, 12%, 18%, 28% or enter custom).',
      'Examine the side-by-side split showing Net Price, GST Amount, CGST/SGST split, and Final Invoice values.'
    ],
    faqs: [
      {
        question: 'What is GST Inclusive price?',
        answer: 'A GST inclusive price means the displayed price already includes the tax amount. The base price must be extracted to know the pre-tax cost.'
      },
      {
        question: 'What is GST Exclusive price?',
        answer: 'A GST exclusive price means the displayed price does not contain tax. GST will be added on top of this value to find the final billing amount.'
      },
      {
        question: 'How do I extract GST from an inclusive amount?',
        answer: 'To extract GST: GST Amount = Total Amount - (Total Amount × 100) / (100 + GST Rate).'
      }
    ],
    sections: [
      {
        title: 'GST Inclusive vs Exclusive Pricing',
        content: 'Understanding tax splits is vital for compliance and transparent billing. A GST Inclusive amount represents the total cost to the customer. When creating bills in India, businesses must separately list CGST and SGST splits to file their monthly GSTR-1 returns accurately.'
      }
    ]
  },
  {
    id: 'PercentageCalculator',
    slug: 'percentage-calculator',
    name: 'Percentage Calculator',
    category: 'student',
    shortDescription: 'Perform quick percentage calculations, ratio analyses, and percentage change outputs.',
    metaDescription: 'Free online Percentage Calculator. Solve "X% of Y", "X is what % of Y", and percentage increase/decrease instantly in your local browser.',
    keywords: ['Percentage Calculator', 'Calculate percentage change', 'What is percentage increase', 'Find ratio percentage', 'Percentage growth online'],
    icon: 'Percent',
    howToUse: [
      'For Value calculation: Enter percentage X and total value Y.',
      'For Ratio: Enter numerator X and denominator Y to find the percentage.',
      'For Change: Enter initial value X and target value Y to find percentage increase or decrease.'
    ],
    faqs: [
      {
        question: 'How do you calculate a basic percentage?',
        answer: 'A percentage is a fraction out of 100. To find X% of Y, the formula is: (X × Y) / 100.'
      },
      {
        question: 'How do you calculate percentage change?',
        answer: 'Subtract the old value from the new value, divide the difference by the old value, and multiply the result by 100.'
      }
    ],
    sections: [
      {
        title: 'The Practical Importance of Percentages',
        content: 'Percentages are used daily for calculating discounts in stores, comparing quarterly company returns, estimating salary hikes, and calculating interest rates on loans.'
      }
    ]
  },
  {
    id: 'DateCalculator',
    slug: 'date-calculator',
    name: 'Date Calculator',
    category: 'datetime',
    shortDescription: 'Add or subtract years, months, weeks, and days from a given date.',
    metaDescription: 'Perform date calculations online. Add or subtract years, months, and days from any calendar date instantly, accounting for leap years.',
    keywords: ['Date Calculator', 'Add days to date', 'Subtract months from date', 'Date offset tool', 'Calendar math calculator'],
    icon: 'Calendar',
    howToUse: [
      'Select your Start Date using the calendar picker.',
      'Select the operation: "Add Time" or "Subtract Time".',
      'Enter the offsets for Years, Months, Weeks, and Days.',
      'Review the calculated Target Date, Day of the Year, and Leap Year status.'
    ],
    faqs: [
      {
        question: 'How does the Date Calculator handle leap years?',
        answer: 'The calculator uses JavaScript Date objects which automatically adjust for leap years (e.g. adding 1 year to February 28, 2024 results in February 28, 2025).'
      },
      {
        question: 'Can I add weeks and days together?',
        answer: 'Yes! The offsets are accumulated. Entering 1 week and 3 days is treated as adding or subtracting a total of 10 days.'
      }
    ],
    sections: [
      {
        title: 'The Mathematics of Date Offsets',
        content: 'Date addition and subtraction are essential for calculating invoice payment terms (e.g., Net 30), contract milestones, vaccine doses, project sprints, and legal notice timelines.'
      }
    ]
  },
  {
    id: 'DaysBetweenDates',
    slug: 'days-between-dates',
    name: 'Days Between Dates',
    category: 'datetime',
    shortDescription: 'Calculate the total days, weeks, months, and years between two dates.',
    metaDescription: 'Calculate the number of days between two dates. View duration breakdowns in years, months, weeks, and hours. Option to include the end date.',
    keywords: ['Days Between Dates', 'Date duration calculator', 'Count days between dates', 'Calculate time difference', 'Days counter online'],
    icon: 'Calendar',
    howToUse: [
      'Select the Start Date.',
      'Select the End Date.',
      'Check the option "Include end date" if you want to include both boundary days.',
      'View the total days difference and Y-M-D calendar breakdown.'
    ],
    faqs: [
      {
        question: 'Does this calculator support daylight saving shifts?',
        answer: 'Yes, dates are normalized to midnight UTC to ensure that daylight saving switches do not introduce fractional days or errors.'
      },
      {
        question: 'What is the purpose of "Include End Date"?',
        answer: 'For many legal and rental contracts, the end date is inclusive, requiring an extra day to be added to the duration count.'
      }
    ],
    sections: [
      {
        title: 'Why Count Days Between Dates?',
        content: 'Calculating the exact duration between dates is crucial for maturity calculations of bonds, calculating elapsed interest, lease durations, academic terms, and project tracking.'
      }
    ]
  },
  {
    id: 'CurrencyConverter',
    slug: 'currency-converter',
    name: 'Currency Converter',
    category: 'business',
    shortDescription: 'Convert values between major world currencies like INR, USD, EUR, and GBP.',
    metaDescription: 'Free online Currency Converter. Convert USD, INR, EUR, GBP, AED, CAD, AUD, and SGD using static reference rates. Fast, secure, and offline-ready.',
    keywords: ['Currency Converter', 'USD to INR rate', 'Convert EUR to INR', 'GBP conversion online', 'Exchange rate calculator'],
    icon: 'Globe',
    howToUse: [
      'Enter the amount you wish to convert.',
      'Select the source currency (From) and target currency (To).',
      'Click the Swap button if you wish to invert the currencies.',
      'Review the converted output and popular conversion rates against INR.'
    ],
    faqs: [
      {
        question: 'Does this currency converter use live rates?',
        answer: 'This converter uses static reference rates that are cached locally. It is intended for quick estimations without requiring an active internet connection.'
      },
      {
        question: 'How secure is this converter?',
        answer: '100% secure! No APIs are queried and no details are shared. All calculations run strictly in your web browser.'
      }
    ],
    sections: [
      {
        title: 'Global Currency Conversions',
        content: 'Converting currencies is essential for travelers, cross-border freelancers, and export-import businesses. Understanding current rates helps estimate costs and pricing in native currencies.'
      }
    ]
  },
  {
    id: 'UnitConverter',
    slug: 'unit-converter',
    name: 'Unit Converter',
    category: 'unit',
    shortDescription: 'Convert standard units of Length, Weight, Temperature, and Area.',
    metaDescription: 'Free online Unit Converter. Convert between Metric and Imperial units for length, weight, area, and temperature instantly in your browser.',
    keywords: ['Unit Converter', 'Convert kg to lbs', 'Celsius to Fahrenheit formula', 'Area converter online', 'Metric conversion tool'],
    icon: 'Ruler',
    howToUse: [
      'Select the measurement category: Length, Weight, Temperature, or Area.',
      'Enter the numerical value to convert.',
      'Select the source unit and target unit.',
      'Review the result and standard conversion formulas.'
    ],
    faqs: [
      {
        question: 'How are unit ratios calculated?',
        answer: 'All ratios are calibrated against SI standard base units (meters for length, kilograms for weight, square meters for area) to ensure precision.'
      },
      {
        question: 'How is temperature conversion handled?',
        answer: 'Unlike linear units, temperature scales use offsets. The tool applies standard Celsius, Fahrenheit, and Kelvin equations directly.'
      }
    ],
    sections: [
      {
        title: 'Standardizing Conversions',
        content: 'Converting between Metric and Imperial systems is essential in engineering, cooking, scientific calculations, and international trade.'
      }
    ]
  },
  {
    id: 'Base64Tool',
    slug: 'base64-encoder-decoder',
    name: 'Base64 Encoder/Decoder',
    category: 'developer',
    shortDescription: 'Encode and decode strings and text files into standard Base64 format.',
    metaDescription: 'Convert plain text to Base64 and vice-versa. Supports secure UTF-8 formatting, local file uploads, and text downloads in browser.',
    keywords: ['Base64 Encoder', 'Base64 Decoder', 'Base64 online converter', 'UTF-8 Base64 tool', 'Developer string encoder'],
    icon: 'Code2',
    howToUse: [
      'Choose the operation mode: Encode or Decode.',
      'Paste your text into the input field or upload a file.',
      'View the real-time Base64 result, download it as a text file, or copy it to your clipboard.'
    ],
    faqs: [
      {
        question: 'What is Base64?',
        answer: 'Base64 is a binary-to-text encoding scheme that represents binary data in an ASCII string format. It is commonly used when transferring data over channels that only support text.'
      },
      {
        question: 'Is Base64 a form of encryption?',
        answer: 'No, Base64 is merely an encoding format and offers no security. Anyone can easily decode a Base64 string back to its original plaintext.'
      }
    ],
    sections: [
      {
        title: 'Why use Base64 encoding?',
        content: 'Base64 is widely used in email protocols (MIME), embedding images directly in HTML/CSS stylesheets, and sending binary attachments in JSON API payloads.'
      }
    ]
  },
  {
    id: 'JWTDecoder',
    slug: 'jwt-decoder',
    name: 'JWT Decoder',
    category: 'developer',
    shortDescription: 'Decode JSON Web Tokens (JWT) header, payload, and signatures instantly.',
    metaDescription: 'Parse and validate JSON Web Tokens (JWT) online. View header claims, payload values, signature details, and token expiration statuses in real-time.',
    keywords: ['JWT Decoder', 'Decode JSON Web Token', 'JWT expiry check', 'JWT payload parser', 'Developer debugging tool'],
    icon: 'Key',
    howToUse: [
      'Paste your encoded JSON Web Token (JWT) into the text box.',
      'Review the token expiration status and timestamps.',
      'Inspect the formatted JSON structures for the Header and Payload segments.'
    ],
    faqs: [
      {
        question: 'What is a JSON Web Token (JWT)?',
        answer: 'A JWT is an open standard (RFC 7519) that defines a compact and self-contained way for securely transmitting information between parties as a JSON object.'
      },
      {
        question: 'Can this tool verify token signatures?',
        answer: 'No. Signature verification requires the server-side secret key or public certificate. This tool decodes and parses the structure for debugging client claims.'
      }
    ],
    sections: [
      {
        title: 'Decoding JWT Structure',
        content: 'A JWT is composed of three parts separated by dots (.): Header, Payload, and Signature. The Header contains metadata, the Payload houses custom data claims, and the Signature validates message integrity.'
      }
    ]
  },
  {
    id: 'UUIDGenerator',
    slug: 'uuid-generator',
    name: 'UUID Generator',
    category: 'developer',
    shortDescription: 'Generate multiple standard random UUID v4 strings instantly.',
    metaDescription: 'Generate random UUID v4 strings in bulk. Choose quantities, casing, and hyphen options. Copy all results in one click.',
    keywords: ['UUID Generator', 'Generate UUID v4', 'Bulk GUID generator', 'Random unique identifier', 'API UUID generator'],
    icon: 'Fingerprint',
    howToUse: [
      'Enter the number of UUIDs you want to generate (up to 100).',
      'Select whether to include hyphens and capital letters.',
      'Click Generate and copy individual UUIDs or the entire list.'
    ],
    faqs: [
      {
        question: 'What is a UUID?',
        answer: 'A Universally Unique Identifier (UUID) is a 128-bit label used for information in computer systems to uniquely identify records without central coordination.'
      },
      {
        question: 'How unique is a UUID v4?',
        answer: 'UUID v4 relies on random numbers. The probability of generating a duplicate is so infinitesimally small that it is considered virtually impossible.'
      }
    ],
    sections: [
      {
        title: 'Understanding UUID v4',
        content: 'UUID version 4 is generated using random or pseudo-random numbers. Out of 128 bits, 6 bits are reserved for variant and version, leaving 122 bits of random data.'
      }
    ]
  },
  {
    id: 'HashGenerator',
    slug: 'hash-generator',
    name: 'Hash Generator',
    category: 'developer',
    shortDescription: 'Calculate MD5, SHA-1, SHA-256, and SHA-512 cryptographic checksums.',
    metaDescription: 'Generate cryptographic hashes from text. View MD5, SHA-1, SHA-256, and SHA-512 hashes simultaneously in real-time inside your browser.',
    keywords: ['Hash Generator', 'MD5 generator online', 'Calculate SHA-256', 'SHA-512 hash creator', 'Cryptographic checksum tool'],
    icon: 'KeyRound',
    howToUse: [
      'Type or paste your text string into the input box.',
      'View the computed MD5, SHA-1, SHA-256, and SHA-512 hashes automatically in real-time.',
      'Click Copy next to any hash to save it.'
    ],
    faqs: [
      {
        question: 'Is my text safe when generating hashes?',
        answer: 'Yes, hashing is computed completely in your browser. No text is uploaded to any server, keeping credentials secure.'
      },
      {
        question: 'What is the difference between encryption and hashing?',
        answer: 'Encryption is a two-way function used to hide data that can be decrypted later. Hashing is a one-way mathematical function that converts input into a fixed-length string, which cannot be reversed.'
      }
    ],
    sections: [
      {
        title: 'Cryptographic Hash Families',
        content: 'SHA-256 and SHA-512 are part of the SHA-2 family and remain highly secure for data integrity verification, password storage, and digital signatures. MD5 and SHA-1 are legacy hashes now used only for non-security checks due to collision vulnerabilities.'
      }
    ]
  },
  {
    id: 'URLEncoderDecoder',
    slug: 'url-encoder-decoder',
    name: 'URL Encoder/Decoder',
    category: 'developer',
    shortDescription: 'Encode and decode query strings and URIs into standard percent-encoded formats.',
    metaDescription: 'Encode or decode URLs and query parameters online. Select between component or full URL modes for standard percent-encoding compliance.',
    keywords: ['URL Encoder', 'URL Decoder', 'Percent encoding online', 'encodeURIComponent tool', 'Developer URL formatter'],
    icon: 'Link',
    howToUse: [
      'Select the mode: URL Encode or URL Decode.',
      'Select whether to process the full URL or just a single component.',
      'Paste your string and view the result instantly.'
    ],
    faqs: [
      {
        question: 'Why do we need URL encoding?',
        answer: 'URLs can only be sent over the internet using the ASCII character-set. URL encoding converts non-ASCII characters and delimiters into percent-encoded hex equivalents.'
      },
      {
        question: 'What is the difference between encodeURI and encodeURIComponent?',
        answer: 'encodeURI preserves URL structure characters like ?, =, & and /. encodeURIComponent encodes all special characters to make them safe as single query parameters.'
      }
    ],
    sections: [
      {
        title: 'URL Percent Encoding Guidelines',
        content: 'URL encoding replaces unsafe ASCII characters with a % followed by two hexadecimal digits. Spaces are typically encoded as %20 or +.'
      }
    ]
  },
  {
    id: 'RegexTester',
    slug: 'regex-tester',
    name: 'Regex Tester',
    category: 'developer',
    shortDescription: 'Test regular expressions in real-time with visual matching highlights.',
    metaDescription: 'Online Regular Expression (Regex) tester. Write patterns, apply global, case-insensitive, or multiline flags, and view matching capture groups instantly.',
    keywords: ['Regex Tester', 'Test regular expression', 'Regex matcher online', 'JavaScript regex tester', 'Regex capture groups'],
    icon: 'Search',
    howToUse: [
      'Enter the regular expression pattern (e.g. [a-z]+) without trailing/leading slashes.',
      'Configure flags: Global (g), Case-insensitive (i), Multiline (m).',
      'Type or paste your test subject text in the text box.',
      'View highlighted matches in the visual viewer and inspect matching index details.'
    ],
    faqs: [
      {
        question: 'What is a regular expression (Regex)?',
        answer: 'A regular expression is a sequence of characters that forms a search pattern, used for string matching, search and replace operations, and data validations.'
      },
      {
        question: 'What does the Global (g) flag do?',
        answer: 'The global flag causes the regular expression to match all occurrences in the subject string, rather than stopping after the first match.'
      }
    ],
    sections: [
      {
        title: 'Regular Expression syntax',
        content: 'Regex is a powerful matching syntax supported by all programming languages. Key tokens include . (any character), \\d (digits), \\w (alphanumeric), * (0 or more times), + (1 or more times), and parenthesis () for capture grouping.'
      }
    ]
  }
,
  {
  "id": "ConstructionCostCalculator",
  "slug": "construction-cost-calculator",
  "name": "Construction Cost Calculator",
  "category": "architecture",
  "shortDescription": "Estimate the total cost of construction based on built-up area, quality, and location.",
  "metaDescription": "Free online House Construction Cost Calculator in India. Estimate total budget, material split, and labor split based on quality grades.",
  "keywords": [
    "construction cost calculator",
    "building cost estimator",
    "house construction cost India",
    "material labor split calculator"
  ],
  "icon": "Hammer",
  "howToUse": [
    "Enter the built-up area in square feet.",
    "Select the construction quality: Economy, Standard, or Premium.",
    "Select the city tier or location multiplier.",
    "View the estimated cost breakdown, including material and labor splits."
  ],
  "faqs": [
    {
      "question": "What is the average construction cost per sq ft in India?",
      "answer": "The average construction cost in India ranges from ₹1,200 to ₹1,800 per sq ft for basic/standard quality, and can exceed ₹2,500 per sq ft for premium quality."
    },
    {
      "question": "What is the standard ratio of material to labor in construction?",
      "answer": "In general, materials constitute 60% of the total budget, while labor makes up the remaining 40%."
    }
  ],
  "sections": [
    {
      "title": "What is Construction Cost?",
      "content": "Construction cost refers to the total expenditure incurred to erect a physical building structure. It includes site preparation, excavation, foundation, brickwork, RCC columns, plastering, wiring, plumbing, and finishing."
    },
    {
      "title": "Material vs Labor cost split",
      "content": "Building materials (cement, steel, bricks, sand, aggregate, wood, tiles) typically make up about 60% to 65% of the construction budget. Onsite labor (masonry, carpentry, electrical, plumbing labor) accounts for 35% to 40%."
    }
  ]
},
  {
  "id": "BOQCalculator",
  "slug": "boq-calculator",
  "name": "BOQ (Bill of Quantities) Calculator",
  "category": "civil",
  "shortDescription": "Generate material quantity estimates for construction projects.",
  "metaDescription": "Free online BOQ Calculator. Generate structural cement, steel, bricks, sand, and aggregate quantity requirements based on built-up area.",
  "keywords": [
    "BOQ Calculator",
    "Bill of Quantities online",
    "material estimator",
    "cement sand steel estimation",
    "civil BOQ tool"
  ],
  "icon": "Hammer",
  "howToUse": [
    "Enter the total proposed built-up area of your building.",
    "Modify the estimated unit rates for cement, steel, sand, and bricks if needed.",
    "View the required quantities and estimated structural building costs instantly."
  ],
  "faqs": [
    {
      "question": "What is a Bill of Quantities (BOQ)?",
      "answer": "A BOQ is a construction document prepared by a quantity surveyor or civil engineer that lists all materials, parts, and labor costs for a construction project."
    },
    {
      "question": "Are these BOQ estimates final?",
      "answer": "These estimates use standard civil engineering thumb rules for residential construction and should be used for rough planning only."
    }
  ],
  "sections": [
    {
      "title": "What is a BOQ (Bill of Quantities)?",
      "content": "A Bill of Quantities is a comprehensive schedule of materials, labor, and equipment needed for a construction contract, allowing builders to estimate accurate tender proposals."
    },
    {
      "title": "BOQ Estimation Thumb-Rule Formula",
      "content": "Our calculator utilizes standard residential material coefficients:\n- Cement: 0.4 Bags per sq ft\n- Steel: 4.0 Kg per sq ft\n- Sand: 1.8 Cubic feet per sq ft\n- Aggregate: 1.35 Cubic feet per sq ft\n- Bricks: 1.4 Bricks per sq ft"
    }
  ]
},
  {
  "id": "ConcreteCalculator",
  "slug": "concrete-calculator",
  "name": "Concrete Calculator",
  "category": "civil",
  "shortDescription": "Calculate concrete volume and ingredient requirements for cement, sand, and aggregate.",
  "metaDescription": "Online Concrete Calculator. Calculate concrete dry volumes, bags of cement, sand, and aggregate needed for rectangular slabs, beams, or columns.",
  "keywords": [
    "Concrete Calculator",
    "concrete mix ratio calculator",
    "cement sand aggregate calculator",
    "dry volume concrete",
    "M20 concrete mix"
  ],
  "icon": "Hammer",
  "howToUse": [
    "Enter the dimensions of your concrete structure (length, width, and thickness).",
    "Select the concrete mix grade (M5, M10, M15, M20, M25).",
    "Set the wastage buffer percentage (default is 5%).",
    "View the total wet volume, dry volume, bags of cement, sand tons, and aggregate tons needed."
  ],
  "faqs": [
    {
      "question": "Why does concrete shrink during mixing?",
      "answer": "Concrete shrinks when water fills the air voids between cement particles. To compensate, a dry volume multiplier of 1.54 is standard in civil calculations."
    },
    {
      "question": "What mix ratio is M20 concrete?",
      "answer": "M20 grade concrete has a volume ratio of 1:1.5:3 (1 part cement, 1.5 parts sand, and 3 parts aggregate)."
    }
  ],
  "sections": [
    {
      "title": "Concrete Dry vs Wet Volume calculation",
      "content": "The volume of wet concrete poured is always less than the dry volume of ingredients mixed. Dry Volume is computed as:\nDry Volume = Wet Volume × 1.54"
    },
    {
      "title": "Concrete Grade Mix Ratios",
      "content": "- **M10**: 1 : 3 : 6 (Cement : Sand : Aggregate) - Used for PCC foundations.\n- **M15**: 1 : 2 : 4 - Used for small pavements and yard floors.\n- **M20**: 1 : 1.5 : 3 - Standard grade for residential columns, slabs, and beams.\n- **M25**: 1 : 1 : 2 - High strength grade for heavily loaded pillars and footings."
    }
  ]
},
  {
  "id": "BrickCalculator",
  "slug": "brick-calculator",
  "name": "Brick Calculator",
  "category": "civil",
  "shortDescription": "Calculate masonry material requirements for brick walls.",
  "metaDescription": "Free online Brick Calculator. Estimate total number of bricks, cement bags, and sand required for 4.5\" partition and 9\" load-bearing brick walls.",
  "keywords": [
    "Brick Calculator",
    "brick masonry calculator",
    "mortar estimation",
    "number of bricks in wall",
    "brick count calculator"
  ],
  "icon": "Hammer",
  "howToUse": [
    "Enter the wall length and height.",
    "Select the wall thickness (4.5 inches or 9 inches).",
    "Choose the brick size preset (Traditional Clay or Modular Blocks).",
    "Set mortar mix ratio and wastage allowances to view total material and cost outputs."
  ],
  "faqs": [
    {
      "question": "How many bricks are in a 9-inch thick wall?",
      "answer": "Typically, a 9-inch wall requires approximately 10 to 12 bricks per square foot of surface area depending on brick size."
    },
    {
      "question": "What mortar ratio is recommended for wall brickwork?",
      "answer": "A 1:4 mix (1 cement, 4 sand) is recommended for half-brick partition walls (4.5\"), while a 1:6 mix is standard for full 9\" external walls."
    }
  ],
  "sections": [
    {
      "title": "Brick Wall Masonry Math",
      "content": "Brick masonry calculations compute the volume of the wall, subtracts standard door/window openings, estimates the number of bricks based on volumetric size including 10mm mortar joints, and determines mortar volumes."
    },
    {
      "title": "Standard Brick Dimensions",
      "content": "- **Traditional Indian Brick**: 9\" × 4.5\" × 3\" (approx. 228mm x 114mm x 76mm)\n- **Modular Standard Brick**: 190mm × 90mm × 90mm (nominal 200mm x 100mm x 100mm including mortar)"
    }
  ]
},
  {
  "id": "RCCCalculator",
  "slug": "rcc-calculator",
  "name": "RCC Calculator",
  "category": "civil",
  "shortDescription": "Calculate reinforced cement concrete quantities including steel and shuttering.",
  "metaDescription": "Free online RCC Calculator. Calculate total concrete volume, steel reinforcement weight, and shuttering board area for building structures.",
  "keywords": [
    "RCC Calculator",
    "reinforced concrete calculator",
    "steel weight in concrete",
    "shuttering area calculator",
    "IS 456 concrete steel ratios"
  ],
  "icon": "Hammer",
  "howToUse": [
    "Input structural dimensions: Length, Width, and Thickness/Depth.",
    "Select steel density ratio (e.g. 1.0% for slabs, 2.0% for columns).",
    "Enter unit rates to generate detailed material cost splits."
  ],
  "faqs": [
    {
      "question": "What is RCC?",
      "answer": "RCC stands for Reinforced Cement Concrete, which combines the high compressive strength of concrete with the high tensile strength of steel rebars."
    },
    {
      "question": "How is steel weight estimated in concrete?",
      "answer": "Steel is calculated as a volume ratio percentage of the total concrete mass, multiplying the volume of steel by the density of steel (7,850 kg/m³)."
    }
  ],
  "sections": [
    {
      "title": "RCC Volume & Steel Weight calculations",
      "content": "The weight of reinforcement steel is calculated by taking a percentage of the total concrete volume. A standard rule of thumb is:\nSteel Weight (kg) = Concrete Volume (m³) × Steel Ratio (%) × 7850 kg/m³"
    },
    {
      "title": "Standard Steel Ratios u/s IS 456 Guidelines",
      "content": "- **Slabs**: 0.7% to 1.0% of concrete volume\n- **Beams**: 1.0% to 2.0% of concrete volume\n- **Columns**: 1.5% to 3.0% of concrete volume\n- **Footings**: 0.5% to 0.8% of concrete volume"
    }
  ]
},
  {
  "id": "SteelWeightCalculator",
  "slug": "steel-weight-calculator",
  "name": "Steel Weight Calculator",
  "category": "civil",
  "shortDescription": "Calculate the weight of structural steel bars, plates, flats, and profiles.",
  "metaDescription": "Online Steel Weight Calculator. Calculate weights of TMT rebar, round bars, flat sections, angles, and channels instantly.",
  "keywords": [
    "Steel Weight Calculator",
    "TMT bar weight formula",
    "D2/162 steel weight",
    "steel flat weight calculator",
    "structural steel weight"
  ],
  "icon": "Hammer",
  "howToUse": [
    "Select the steel profile: TMT rebar, Round bar, Flats, Angles, or Channels.",
    "Input the dimensions (diameter, thickness, length, or width).",
    "Input the quantity to see total weight in kilograms and tons."
  ],
  "faqs": [
    {
      "question": "What is the D²/162 formula?",
      "answer": "It is a shortcut to calculate the weight of a round steel bar per meter. Weight (kg/m) = Diameter(mm) × Diameter(mm) / 162.28."
    },
    {
      "question": "What is the density of structural steel?",
      "answer": "The density of steel is assumed to be 7,850 kg per cubic meter or 7.85 grams per cubic centimeter."
    }
  ],
  "sections": [
    {
      "title": "Structural Steel Weight Formula",
      "content": "Round steel bars are calculated using standard cylindrical volumes:\nWeight = Length × (π × Diameter² / 4) × Steel Density\nThis simplifies to the classic site formula:\nWeight per meter (kg) = Diameter (mm) × Diameter (mm) / 162.28"
    },
    {
      "title": "Standard TMT Rebar Diameter Weights",
      "content": "- **8 mm**: 0.395 kg/m\n- **10 mm**: 0.617 kg/m\n- **12 mm**: 0.888 kg/m\n- **16 mm**: 1.580 kg/m\n- **20 mm**: 2.470 kg/m\n- **25 mm**: 3.858 kg/m"
    }
  ]
},
  {
  "id": "ColumnDesignCalculator",
  "slug": "column-design-calculator",
  "name": "Column Design Calculator",
  "category": "civil",
  "shortDescription": "Estimate concrete volume, main rebar weights, and column casing shuttering area.",
  "metaDescription": "Free online Column Design Calculator. Estimate concrete, vertical steel bars, stirrups, and shuttering area for building columns.",
  "keywords": [
    "Column Design Calculator",
    "column concrete steel calculator",
    "column stirrups estimator",
    "vertical rebar calculator",
    "IS 456 column design"
  ],
  "icon": "Hammer",
  "howToUse": [
    "Enter column width, depth, and height.",
    "Select the vertical rebar count and rebar diameter.",
    "Enter stirrup diameter and tie spacing.",
    "View structural quantities and cost estimates."
  ],
  "faqs": [
    {
      "question": "What is the minimum steel percentage in columns?",
      "answer": "Under IS 456, vertical reinforcement in columns must be at least 0.8% of the total cross-sectional area."
    },
    {
      "question": "What spacing is standard for lateral ties (stirrups)?",
      "answer": "Stirrups are typically spaced at 100mm near beam-column joints, and 150mm in mid-spans."
    }
  ],
  "sections": [
    {
      "title": "Structural Columns Design Criteria",
      "content": "Columns are primary vertical members that transfer compression loads down to footings. Design factors include axial loads, buckling ratios, concrete cover protection (minimum 40mm), and lateral confinement ties."
    },
    {
      "title": "Minimum Rebar Standards",
      "content": "- Rectangular columns require a minimum of 4 longitudinal bars.\n- Circular columns require a minimum of 6 longitudinal bars.\n- Minimum bar diameter should not be less than 12mm."
    }
  ]
},
  {
  "id": "SlabCalculator",
  "slug": "slab-calculator",
  "name": "Slab Calculator",
  "category": "civil",
  "shortDescription": "Calculate concrete volume, reinforcement grids, and estimated billing costs for slabs.",
  "metaDescription": "Online Concrete Slab Calculator. Calculate concrete, reinforcement steel meshes, formwork, and billing for G+0/G+1 slabs.",
  "keywords": [
    "Slab Calculator",
    "roof slab concrete calculator",
    "slab reinforcement steel weight",
    "concrete slab estimator",
    "IS 456 slab cover"
  ],
  "icon": "Hammer",
  "howToUse": [
    "Enter the length, width, and thickness of the slab.",
    "Enter rebar spacing and bar diameter to estimate reinforcement weight.",
    "Input standard material prices to view the billing report."
  ],
  "faqs": [
    {
      "question": "What is the standard thickness of a residential roof slab?",
      "answer": "Residential building slabs are commonly designed with a thickness of 5 inches (125mm) or 6 inches (150mm)."
    },
    {
      "question": "What is clear cover for slabs?",
      "answer": "Standard clear cover for concrete slabs is 15mm to 20mm to protect reinforcement steel mesh from rusting."
    }
  ],
  "sections": [
    {
      "title": "Slab Concrete Volume calculations",
      "content": "Concrete volume is a direct cubic dimension calculation:\nVolume = Length × Width × Thickness\nDry materials are then estimated using the M20 or M25 dry volume coefficient of 1.54."
    },
    {
      "title": "Slab Reinforcement Grid specifications",
      "content": "Main reinforcement bars are laid along the shorter span, while distribution reinforcement is laid along the longer span. Standard residential rebar spacings range from 100mm to 150mm center-to-center."
    }
  ]
},
  {
  "id": "FoundationCalculator",
  "slug": "foundation-calculator",
  "name": "Foundation Calculator",
  "category": "civil",
  "shortDescription": "Calculate excavation soil volumes, PCC mud-mat concrete, and structural RCC footing quantities.",
  "metaDescription": "Free online Foundation Calculator. Calculate soil excavation pit volumes, sand filling, PCC beds, and RCC column footings.",
  "keywords": [
    "Foundation Calculator",
    "footing concrete calculator",
    "soil excavation calculator",
    "PCC mud-mat calculator",
    "isolated footing design"
  ],
  "icon": "Hammer",
  "howToUse": [
    "Enter the footing length, width, and excavation depth.",
    "Specify sand filling thickness and PCC bed thickness.",
    "Input the RCC footing pad dimensions.",
    "Select rebar configurations to view excavation, concrete, and steel results."
  ],
  "faqs": [
    {
      "question": "What is PCC in foundations?",
      "answer": "PCC stands for Plain Cement Concrete. A thin layer of PCC (usually M10 mix, 3-4 inches thick) is laid at the bottom of excavation pits to create a clean base for steel footings."
    },
    {
      "question": "What depth is safe for residential footings?",
      "answer": "Safe isolated footing excavation depths depend on soil bearing capacity, but a minimum of 4 to 5 feet is standard for residential houses."
    }
  ],
  "sections": [
    {
      "title": "Excavation soil volume calculations",
      "content": "Soil excavation volume is computed based on pit footprint dimensions:\nExcavation Volume = Length × Width × Depth\nWe add a 10% volume allowance for manual sloped excavation or machinery errors."
    },
    {
      "title": "PCC Base Foundations & Footings",
      "content": "- **Sand Bedding**: Standard 3-inch thick compacted sand bed is laid first to absorb moisture.\n- **PCC Bed**: 3-inch M10 concrete mix is laid next.\n- **RCC Pad**: The main reinforced footing pad (typically 12\" thickness) is poured on top."
    }
  ]
},
  {
  "id": "FARFSICalculator",
  "slug": "far-fsi-calculator",
  "name": "FAR / FSI Calculator",
  "category": "architecture",
  "shortDescription": "Calculate Floor Area Ratio (FAR) and Floor Space Index (FSI) for plot clearances.",
  "metaDescription": "Free online FAR / FSI Calculator. Check permissible built-up limits, floors, and utilized area ratios according to municipal bylaws.",
  "keywords": [
    "FAR FSI Calculator",
    "Floor Area Ratio calculator",
    "Floor Space Index India",
    "municipal built-up compliance",
    "max buildable area"
  ],
  "icon": "Compass",
  "howToUse": [
    "Enter the plot area in square feet or square meters.",
    "Specify the local permissible FSI/FAR value.",
    "Input planned built-up area per floor and number of floors.",
    "Verify FSI compliance status and check remaining buildable area."
  ],
  "faqs": [
    {
      "question": "What is FAR and FSI?",
      "answer": "Floor Area Ratio (FAR) and Floor Space Index (FSI) are identical metrics representing the ratio of total floor area across all building levels to the plot area."
    },
    {
      "question": "What is the formula for FSI?",
      "answer": "FSI = Total Built-up Area / Plot Area. For example, on a 2000 sq ft plot with an FSI of 1.5, the total buildable floor area is 3000 sq ft."
    }
  ],
  "sections": [
    {
      "title": "What is Floor Space Index?",
      "content": "FSI is a zoning restriction used by local municipal development bodies to control building density, traffic management, and utility load distributions in urban areas."
    },
    {
      "title": "FAR Calculation Formulas",
      "content": "1. **Max Buildable Area** = Plot Area × FSI Value\n2. **Utilized Area** = Built-up Area per Floor × Number of Floors\n3. **Remaining Area** = Max Buildable Area - Utilized Area"
    }
  ]
},
  {
  "id": "StaircaseCalculator",
  "slug": "staircase-calculator",
  "name": "Staircase Calculator",
  "category": "architecture",
  "shortDescription": "Calculate stair riser heights, tread depths, number of steps, and pitch angles.",
  "metaDescription": "Free online Staircase Calculator. Estimate number of risers, tread sizes, total horizontal run, and staircase pitch angles in Imperial and Metric.",
  "keywords": [
    "Staircase Calculator",
    "riser tread calculator",
    "stair pitch angle",
    "stair design online",
    "building code stairs"
  ],
  "icon": "Compass",
  "howToUse": [
    "Select unit mode: Imperial (inches) or Metric (cm).",
    "Input the total floor-to-floor height (rise).",
    "Input target riser height and tread depth values.",
    "Check the actual riser height, steps count, run, and compliance indicators."
  ],
  "faqs": [
    {
      "question": "What riser height is recommended for comfortable stairs?",
      "answer": "A riser height between 6 to 7 inches (15 to 18 cm) is recommended for comfortable residential walking stairs."
    },
    {
      "question": "How is the staircase pitch angle calculated?",
      "answer": "The stair angle is calculated using the inverse tangent of the riser height divided by the tread depth (Pitch = arctan(Riser/Tread) * 180 / pi)."
    }
  ],
  "sections": [
    {
      "title": "Staircase Layout Criteria",
      "content": "Proper stair design prevents tripping. It requires balancing riser height (vertical step distance) and tread depth (horizontal foot spacing) to match human walking strides."
    },
    {
      "title": "Riser-Tread Walking Comfort Rule",
      "content": "A standard architectural comfort index is:\n2 × Riser + Tread = 24 to 25 inches (60 to 64 cm)"
    }
  ]
},
  {
  "id": "RoomAreaCalculator",
  "slug": "room-area-calculator",
  "name": "Room Area Calculator",
  "category": "architecture",
  "shortDescription": "Add multiple rooms to build a layout and estimate Carpet, Built-up, and Super Built-up areas.",
  "metaDescription": "Interactive Room Area Calculator. Add bedrooms, kitchens, balconies, specify wall thickness, and check total carpet and built-up areas.",
  "keywords": [
    "Room Area Calculator",
    "carpet built up calculator",
    "super built up area tool",
    "multiple rooms area calculator",
    "room square footage"
  ],
  "icon": "Compass",
  "howToUse": [
    "Select unit system (Feet or Meters).",
    "Add rooms to the list, inputting length and width for each.",
    "Check or uncheck \"RERA Carpet\" to toggle RERA classifications.",
    "Input wall thickness, loading factor, and cost rates to view property metrics."
  ],
  "faqs": [
    {
      "question": "What is RERA Carpet Area?",
      "answer": "RERA Carpet Area includes usable floor area of rooms + internal partition walls, but excludes external walls, service shafts, and private balconies."
    },
    {
      "question": "How is wall area estimated here?",
      "answer": "It estimates wall area by calculating room perimeters and multiplying by the specified wall thickness."
    }
  ],
  "sections": [
    {
      "title": "Carpet vs Built-up Area explained",
      "content": "Carpet area represents net usable floor area inside structural walls. Built-up area includes carpet area, thickness of all internal and external walls, and private balconies."
    },
    {
      "title": "Super Built-up Area & Loading factor",
      "content": "Super Built-up Area is the built-up area plus a proportionate share of common lobbies, staircase wells, lifts, and security cabins. Loading factor represents this markup (typically 25-35%)."
    }
  ]
},
  {
  "id": "CarpetAreaCalculator",
  "slug": "carpet-area-calculator",
  "name": "Carpet Area Calculator",
  "category": "architecture",
  "shortDescription": "Convert between Carpet, Built-up, and Super Built-up areas using standard ratios.",
  "metaDescription": "Free online Carpet Area Calculator. Quick conversion tool to find RERA Carpet area from Super Built-up area and vice versa.",
  "keywords": [
    "Carpet Area Calculator",
    "convert super built up to carpet",
    "carpet to built up formula",
    "RERA area converter",
    "apartment carpet estimator"
  ],
  "icon": "Compass",
  "howToUse": [
    "Select your input area type: Carpet, Built-up, or Super Built-up.",
    "Enter the area value in square feet or square meters.",
    "Adjust wall ratios, balcony space ratios, and loading factor sliders.",
    "View RERA carpet, net usable, and built-up splits instantly."
  ],
  "faqs": [
    {
      "question": "How do I extract RERA carpet area from Super Built-up?",
      "answer": "Divide the Super Built-up area by (1 + loading factor/100) to find the Built-up area, then subtract wall and balcony shares."
    },
    {
      "question": "Is a loading factor of 30% normal?",
      "answer": "Yes, modern high-rise apartments with wide lobbies, double lifts, and clubhouses routinely have loading factors between 25% and 35%."
    }
  ],
  "sections": [
    {
      "title": "RERA Carpet Definition",
      "content": "Under the Real Estate Regulation Act, developers are legally obligated to disclose the RERA Carpet Area (net usable floor area + internal walls) so buyers pay only for private usable space."
    },
    {
      "title": "How to compute Carpet from Built-up",
      "content": "Carpet Area = Built-up Area - Balcony Area - External Walls Area (typically 5-6% of flat size)."
    }
  ]
},
  {
  "id": "FloorTileCalculator",
  "slug": "floor-tile-calculator",
  "name": "Floor Tile Calculator",
  "category": "architecture",
  "shortDescription": "Calculate floor tile quantities, tile wastage buffers, and box quantities.",
  "metaDescription": "Online Floor Tile Calculator. Calculate vitrified, ceramic, or wooden floor tile counts, required boxes, and costs based on floor dimensions.",
  "keywords": [
    "Floor Tile Calculator",
    "how many tiles do I need",
    "floor tile box count",
    "vitrified tile count estimator",
    "floor area tiles"
  ],
  "icon": "Compass",
  "howToUse": [
    "Select unit mode: Imperial (ft/in) or Metric (m/cm).",
    "Input floor length and width.",
    "Select a standard tile preset size or set custom dimensions.",
    "Configure wastage buffers and box packing quantities to view material and cost outputs."
  ],
  "faqs": [
    {
      "question": "How many tiles are standard in a box?",
      "answer": "Standard 2x2 feet (60x60 cm) tiles typically come in boxes of 4, while larger 4x2 feet tiles come in boxes of 2."
    },
    {
      "question": "Why do I need a wastage buffer for tiles?",
      "answer": "Cutting tiles for borders, door frames, and corners generates waste. Standard guidelines recommend adding an 8% to 10% wastage buffer."
    }
  ],
  "sections": [
    {
      "title": "Tile count calculation guidelines",
      "content": "First, find the floor area (Length × Width). Then, divide the floor area by the surface area of a single tile. Finally, round up to the next integer and apply wastage buffers."
    },
    {
      "title": "Standard Tile Size references",
      "content": "- **Small Bathroom**: 1x1 ft (30x30 cm)\n- **Living/Bedroom**: 2x2 ft (60x60 cm) or 32x32 in (80x80 cm)\n- **Premium Large Vitrified**: 4x2 ft (120x60 cm)"
    }
  ]
},
  {
  "id": "PaintCalculator",
  "slug": "paint-calculator",
  "name": "Paint Calculator",
  "category": "architecture",
  "shortDescription": "Calculate wall and ceiling paint volumes in liters, subtracting window/door areas.",
  "metaDescription": "Free online Paint Calculator. Estimate total paint liters required for rooms based on surface area, coats, and paint quality.",
  "keywords": [
    "Paint Calculator",
    "room paint estimator",
    "how many liters of paint",
    "wall surface paint calculator",
    "house painting budget"
  ],
  "icon": "Compass",
  "howToUse": [
    "Enter room Length, Width, and Height dimensions.",
    "Check whether to include the ceiling area.",
    "Input door and window counts to subtract their area.",
    "Select paint quality and coats to view the total liters and material cost."
  ],
  "faqs": [
    {
      "question": "How many square feet does a liter of paint cover?",
      "answer": "A standard liter of plastic emulsion covers approximately 100 to 120 sq ft for two coats (or 200-240 sq ft for a single coat)."
    },
    {
      "question": "Do I need 2 coats of paint?",
      "answer": "Yes, 2 coats are recommended to hide plaster imperfections, achieve rich color depth, and ensure durability."
    }
  ],
  "sections": [
    {
      "title": "Wall surface area calculations",
      "content": "Gross wall surface area is calculated as:\nWall Area = 2 × (Length + Width) × Height\nWe then add the ceiling area (Length × Width) and subtract openings (Standard Door: 21 sq ft, Window: 16 sq ft)."
    },
    {
      "title": "Paint coverage per liter standards",
      "content": "- **Economy Distemper**: 80 sq ft / liter (2 coats)\n- **Standard Acrylic Emulsion**: 100 sq ft / liter (2 coats)\n- **Premium/Luxury Emulsion**: 140 sq ft / liter (2 coats)"
    }
  ]
},
  {
  "id": "WallpaperCalculator",
  "slug": "wallpaper-calculator",
  "name": "Wallpaper Calculator",
  "category": "architecture",
  "shortDescription": "Calculate wallpaper rolls based on wall area and pattern match repeat margins.",
  "metaDescription": "Free online Wallpaper Calculator. Calculate standard rolls, pattern repeat margins, and total project costs based on wall size.",
  "keywords": [
    "Wallpaper Calculator",
    "wallpaper rolls estimator",
    "wallpaper roll size India",
    "pattern repeat wallpaper calculator",
    "wall decor calculator"
  ],
  "icon": "Compass",
  "howToUse": [
    "Enter wall width and wall height.",
    "Select roll size preset (Standard or Large Roll).",
    "Input the pattern repeat length (set to 0 for solid colors).",
    "View net rolls, wastage allowances, and total rolls needed."
  ],
  "faqs": [
    {
      "question": "What is the size of a standard wallpaper roll?",
      "answer": "A standard wallpaper roll is typically 33 feet (10m) long and 21 inches (53cm) wide, covering 57.42 square feet."
    },
    {
      "question": "What is pattern repeat?",
      "answer": "Pattern repeat is the vertical distance between identical design elements. Matching patterns side-by-side creates waste, requiring extra rolls."
    }
  ],
  "sections": [
    {
      "title": "Wall area measurements for Wallpaper",
      "content": "Measure the height and total horizontal width of the wall you want to paper. Area is calculated as Width × Height. Doors and windows are usually not subtracted because you need full strips to cut around them."
    },
    {
      "title": "Wallpaper roll dimensions reference",
      "content": "- **Standard Roll**: 33 ft × 21 in (10m x 53cm) = 57.4 sq ft / 5.3 sq m\n- **Double/Large Roll**: 33 ft × 41 in (10m x 106cm) = 112.5 sq ft / 10.6 sq m"
    }
  ]
},
  {
  "id": "FlooringCostCalculator",
  "slug": "flooring-cost-calculator",
  "name": "Flooring Cost Calculator",
  "category": "interior",
  "shortDescription": "Estimate material and labor costs for tiles, Indian marble, Italian marble, and wooden flooring.",
  "metaDescription": "Free online Flooring Cost Calculator. Compare vitrified tiles, marble, granite, and hardwood installation budgets per square foot.",
  "keywords": [
    "Flooring Cost Calculator",
    "marble flooring installation cost",
    "vitrified tile flooring price",
    "wooden flooring cost India",
    "granite flooring cost"
  ],
  "icon": "Palette",
  "howToUse": [
    "Enter the flooring area in square feet or square meters.",
    "Select a material preset (Vitrified, Indian Marble, Italian Marble, Wood).",
    "Adjust wastage buffer percentage.",
    "Review material cost, labor cost, and total flooring project budget."
  ],
  "faqs": [
    {
      "question": "What is the cost of vitrified tile flooring in India?",
      "answer": "Materials cost between ₹60 to ₹100 per sq ft, and labor installation costs are about ₹20 to ₹30 per sq ft."
    },
    {
      "question": "Why is Italian marble flooring labor so expensive?",
      "answer": "Italian marble is soft and prone to cracking, requiring specialized backing mesh, epoxy adhesives, and multi-stage diamond polishing labor (₹120-200/sq ft)."
    }
  ],
  "sections": [
    {
      "title": "Tile vs Marble flooring cost comparisons",
      "content": "Vitrified tiles are pre-polished and laid quickly, keeping labor costs low. Marble is laid as raw slabs, requiring mortar backing, joint grouting, and post-installation diamond polishing."
    },
    {
      "title": "Labor installation charges guidelines",
      "content": "- **Vitrified Tiles**: ₹25 per sq ft\n- **Indian Marble**: ₹60 - ₹80 per sq ft (including polishing)\n- **Italian Marble**: ₹120 - ₹180 per sq ft (including polishing)\n- **Wooden Flooring**: ₹30 per sq ft"
    }
  ]
},
  {
  "id": "FalseCeilingCalculator",
  "slug": "false-ceiling-calculator",
  "name": "False Ceiling Calculator",
  "category": "interior",
  "shortDescription": "Calculate POP, Gypsum board, and PVC false ceiling sheet costs, cove lights, and labor.",
  "metaDescription": "Online False Ceiling Calculator. Estimate material and labor prices for Gypsum, POP, or PVC ceilings including cove lightings.",
  "keywords": [
    "False Ceiling Calculator",
    "POP ceiling cost calculator",
    "gypsum ceiling rate per sq ft",
    "cove lighting cost estimator",
    "renovation ceiling cost"
  ],
  "icon": "Palette",
  "howToUse": [
    "Enter ceiling Length and Width.",
    "Select ceiling material (Gypsum, POP, PVC, Wood).",
    "Select design complexity (Flat, Step, or Designer).",
    "Toggle cove lighting and specify wastage buffers."
  ],
  "faqs": [
    {
      "question": "Which is better: Gypsum or POP?",
      "answer": "Gypsum board is lightweight, fast to install, and has seamless joints. POP (Plaster of Paris) is highly customizable for designer curves but takes longer and is messy to apply."
    },
    {
      "question": "How is cove lighting estimated?",
      "answer": "Cove lighting is calculated per running foot (Rft) of the perimeter ceiling drop where LED strip slots are made."
    }
  ],
  "sections": [
    {
      "title": "POP vs Gypsum ceilings comparison",
      "content": "Gypsum boards are factory-made panels screwed to steel ceiling channel frameworks. POP is plaster powder mixed with water and applied over metal meshes onsite, allowing high artistic freedom."
    },
    {
      "title": "Complexity markups and cove light pricing",
      "content": "- **Step Ceiling**: Adds ~15% material/labor charges for vertical drop bands.\n- **Designer CNC/Curves**: Adds ~35% markup.\n- **LED Cove Strip**: Estimated at ₹120 to ₹180 per running foot for strips + driver wiring."
    }
  ]
},
  {
  "id": "ModularKitchenCostCalculator",
  "slug": "modular-kitchen-cost-calculator",
  "name": "Modular Kitchen Cost Calculator",
  "category": "interior",
  "shortDescription": "Estimate modular kitchen prices based on layouts, finishes, countertops, and lofts.",
  "metaDescription": "Free online Modular Kitchen Cost Calculator. Estimate costs for Straight, L-shape, U-shape, or Parallel kitchens in Laminate, Acrylic, or PU.",
  "keywords": [
    "Modular Kitchen Cost Calculator",
    "L shape kitchen cost",
    "acrylic kitchen price per foot",
    "modular kitchen cost estimator",
    "kitchen design budget"
  ],
  "icon": "Palette",
  "howToUse": [
    "Select kitchen shape: Straight, Parallel, L-Shape, or U-Shape.",
    "Enter counter length, loft length, and tall unit counts.",
    "Select cabinet finish (Laminate, Acrylic, PU Paint).",
    "Select hardware quality and countertop slabs to view the final quote."
  ],
  "faqs": [
    {
      "question": "What is the running foot rate of a modular kitchen?",
      "answer": "Rates vary by finish. Laminate kitchen packages range from ₹1,400 to ₹1,800 per running foot, while acrylic ranges from ₹2,000 to ₹2,500."
    },
    {
      "question": "Does modular kitchen cost include chimney and hob?",
      "answer": "No, modular kitchen quotes cover woodwork cabinet boxes, shutters, countertop, and hardware channels. Electrical appliances are extra."
    }
  ],
  "sections": [
    {
      "title": "Modular Kitchen layout shapes",
      "content": "- **Straight**: Single wall counter, best for studio flats.\n- **L-Shape**: Most popular layout, utilizes corner areas efficiently.\n- **U-Shape**: Covers three walls, providing maximum counter workspace.\n- **Parallel**: Double counters running opposite, ideal for narrow corridor kitchens."
    },
    {
      "title": "Finish options (Acrylic vs Laminate)",
      "content": "- **Laminate**: Matte/gloss, highly durable, scratch-resistant, budget-friendly.\n- **Acrylic**: Ultra-high gloss, premium mirror finish, prone to finger smudges.\n- **PU Paint/Duco**: Seamless luxury spray-paint, rich colors, expensive."
    }
  ]
},
  {
  "id": "WardrobeCostCalculator",
  "slug": "wardrobe-cost-calculator",
  "name": "Wardrobe Cost Calculator",
  "category": "interior",
  "shortDescription": "Calculate wardrobe cabinet cost based on sliding or hinged doors, finishes, and loft options.",
  "metaDescription": "Online Wardrobe Cost Calculator. Estimate hinged or sliding wardrobe budgets, premium fittings, and overhead storage loft costs.",
  "keywords": [
    "Wardrobe Cost Calculator",
    "sliding wardrobe cost estimator",
    "wardrobe cost per sq ft",
    "hinged wardrobe price",
    "bedroom wardrobe planner"
  ],
  "icon": "Palette",
  "howToUse": [
    "Select unit and enter wardrobe width and height.",
    "Select door type: Hinged (swing) or Sliding.",
    "Toggle overhead lofts and specify loft height.",
    "Select exterior finish and interior accessory levels."
  ],
  "faqs": [
    {
      "question": "Which is cheaper: sliding or hinged wardrobes?",
      "answer": "Hinged wardrobes are cheaper (₹1,300 - ₹1,500/sq ft). Sliding wardrobes cost ₹1,800 - ₹2,200/sq ft because they require specialized sliding track mechanisms."
    },
    {
      "question": "How is wardrobe area calculated for billing?",
      "answer": "Wardrobes are billed based on facade square feet (Width × Height of the wardrobe front)."
    }
  ],
  "sections": [
    {
      "title": "Wardrobe sq ft calculation guides",
      "content": "Measure the width and height of the wall niche where the wardrobe will sit. Multiply Width × Height to find the front face area. Example: A 6ft width × 7ft height wardrobe equals 42 square feet."
    },
    {
      "title": "Sliding vs Hinged door mechanisms",
      "content": "- **Hinged**: Classic doors swinging outwards, requiring front floor clearance but exposing the entire wardrobe interior when opened.\n- **Sliding**: Modern doors sliding sideways on tracks, saving floor space in compact rooms but exposing only half of the wardrobe at a time."
    }
  ]
},
  {
    "id": "ImageCropper",
    "slug": "image-cropper",
    "name": "Image Cropper",
    "category": "image",
    "shortDescription": "Crop images to custom dimensions, locks aspect ratio options, and edit boundaries in browser.",
    "metaDescription": "Free online Image Cropper tool. Crop JPG, PNG, and WebP images to standard aspect ratios (1:1, 16:9, 4:3) or custom free-hand shapes locally.",
    "keywords": [
      "Image Cropper",
      "Crop photo online",
      "Cut image dimensions",
      "Crop JPG PNG",
      "Resize image bounds"
    ],
    "icon": "Crop",
    "howToUse": [
      "Select or drag-and-drop an image from your device.",
      "Select your preferred aspect ratio preset (Free, 1:1, 16:9, 4:3).",
      "Drag and resize the overlay crop window on the image preview.",
      "Click the \"Download Crop\" button to compile and save the cropped image."
    ],
    "faqs": [
      {
        "question": "Are my cropped images uploaded to any servers?",
        "answer": "No. The image cropping is performed completely locally inside your web browser sandbox using HTML5 Canvas. No file is ever sent to our servers."
      },
      {
        "question": "Does aspect ratio lock prevent free-form scaling?",
        "answer": "Yes. Locking the aspect ratio (like 16:9 or 1:1) forces the crop bounds to scale symmetrically, preserving the selected proportions."
      }
    ],
    "sections": [
      {
        "title": "Image Cropping Fundamentals",
        "content": "Cropping is the process of removing unwanted outer areas from an image. It is used to improve framing, change aspect ratios, or isolate a specific subject. Doing this client-side prevents bandwidth usage and keeps private photos secure."
      }
    ]
  },
  {
    "id": "ImageResizer",
    "slug": "image-resizer",
    "name": "Image Resizer",
    "category": "image",
    "shortDescription": "Resize images by pixel width/height or scaling percentage with aspect ratio locks.",
    "metaDescription": "Free online Image Resizer. Adjust width and height of JPG, PNG, and WebP images. Lock aspect ratio or scale images by percentage instantly.",
    "keywords": [
      "Image Resizer",
      "Resize photo online",
      "Change image dimensions",
      "Scale image percentage",
      "Resize JPG PNG"
    ],
    "icon": "Sliders",
    "howToUse": [
      "Choose the image file you wish to resize.",
      "Enter new width or height in pixels, or use the scaling percentage slider.",
      "Keep the \"Aspect Ratio Locked\" to avoid warping the image.",
      "Download the resized image in PNG format."
    ],
    "faqs": [
      {
        "question": "What is the benefit of keeping Aspect Ratio locked?",
        "answer": "Locking aspect ratio ensures that when you adjust the width, the height scales proportionally, preventing the image from looking stretched or squished."
      },
      {
        "question": "Will resizing reduce the file size of the image?",
        "answer": "Yes, reducing the pixel resolution of an image naturally reduces its raw byte size, making it faster to load on websites."
      }
    ],
    "sections": [
      {
        "title": "Pixel Dimensions vs File Size",
        "content": "An image is made of pixels. Reducing the dimensions (e.g. from 4000x3000 to 800x600) decreases the total pixel count, which dramatically lowers file size while maintaining visibility at standard display sizes."
      }
    ]
  },
  {
    "id": "ImageConverter",
    "slug": "image-converter",
    "name": "Image Converter",
    "category": "image",
    "shortDescription": "Convert images between formats (PNG, JPEG, WebP, GIF, BMP) in bulk with quality controls.",
    "metaDescription": "Convert images to PNG, JPG, WebP, GIF, and BMP format online. Bulk convert multiple images and download as a single ZIP file.",
    "keywords": [
      "Image Converter",
      "Convert JPG to PNG",
      "WebP to JPG converter",
      "Bulk image converter",
      "Convert photo format"
    ],
    "icon": "RefreshCw",
    "howToUse": [
      "Upload one or multiple images from your device.",
      "Select your desired target format (JPEG, PNG, WebP, GIF, BMP) in the settings panel.",
      "For JPEG and WebP, adjust the compression quality slider.",
      "Click \"Convert Images\" and download individually or as a single compiled ZIP."
    ],
    "faqs": [
      {
        "question": "Which image format offers the best compression?",
        "answer": "WebP is highly recommended for web use as it offers superior lossy and lossless compression compared to older formats like JPEG and PNG."
      },
      {
        "question": "Can I convert multiple formats at the same time?",
        "answer": "Yes, you can load images of mixed formats (PNG, JPG, etc.) and convert them all to the selected target format in a single action."
      }
    ],
    "sections": [
      {
        "title": "Understanding Web Image Formats",
        "content": "- **JPEG**: Best for photos, uses lossy compression.\n- **PNG**: Supports transparency, uses lossless compression.\n- **WebP**: Modern web standard, offers small sizes for both transparent and photographic content."
      }
    ]
  },
  {
    "id": "ImageRotator",
    "slug": "image-rotator",
    "name": "Image Rotator",
    "category": "image",
    "shortDescription": "Rotate images clockwise/counter-clockwise, flip horizontally or vertically, and adjust custom angles.",
    "metaDescription": "Rotate and flip images online for free. Adjust rotation angle by degrees or mirror photos horizontally/vertically with live preview.",
    "keywords": [
      "Image Rotator",
      "Rotate photo online",
      "Flip image horizontal",
      "Mirror image vertically",
      "Rotate JPG PNG"
    ],
    "icon": "RotateCw",
    "howToUse": [
      "Upload your image to the workspace.",
      "Use the quick buttons to rotate 90 degrees or mirror/flip the image.",
      "Adjust the slider to rotate by custom degrees (0 to 360).",
      "Download your transformed image instantly."
    ],
    "faqs": [
      {
        "question": "Does custom degree rotation crop the image corners?",
        "answer": "No. The canvas size dynamically expands to fit the rotated dimensions so that the entire image remains fully visible."
      },
      {
        "question": "Will rotating affect transparency in PNGs?",
        "answer": "No, transparent backgrounds are preserved when rotating PNG or WebP images."
      }
    ],
    "sections": [
      {
        "title": "Image Mirroring and Rotations",
        "content": "Flipping horizontally creates a mirror image, which is useful for correcting front-camera selfies. Custom angle rotations use trigonometric coordinates to map pixels onto an expanded canvas boundary."
      }
    ]
  },
  {
    "id": "ImageWatermark",
    "slug": "image-watermark",
    "name": "Add Watermark to Image",
    "category": "image",
    "shortDescription": "Add text or logo image watermarks to protect your photos with custom opacity and grid positioning.",
    "metaDescription": "Add watermark to images online for free. Protect photos with text or logo overlays, configure transparency, sizing, and position grids.",
    "keywords": [
      "Add Watermark to Image",
      "Watermark photo online",
      "Protect images copyright",
      "Logo watermark maker",
      "Overlay text on image"
    ],
    "icon": "Type",
    "howToUse": [
      "Upload the primary image you wish to protect.",
      "Choose between \"Text\" or \"Logo\" watermark settings.",
      "Configure the watermark (enter text/upload logo, choose size, color, opacity).",
      "Select a grid position (Center, Corners) or choose the \"Tiled\" repeating layout."
    ],
    "faqs": [
      {
        "question": "What is the purpose of a tiled watermark?",
        "answer": "A tiled watermark repeats the text or logo across the entire image in a grid, making it much harder to crop out or remove than a single corner mark."
      },
      {
        "question": "Can I upload a transparent PNG logo as a watermark?",
        "answer": "Yes, transparent PNG or WebP logos are supported and recommended, preserving their transparency when overlaid."
      }
    ],
    "sections": [
      {
        "title": "Copyright Protection with Watermarks",
        "content": "Watermarking is a visual signature placed on photos to claim ownership. Lowering the opacity ensures the watermark protects the work without blocking the primary visual elements."
      }
    ]
  },
  {
    "id": "ImageBlur",
    "slug": "image-blur",
    "name": "Blur Image",
    "category": "image",
    "shortDescription": "Apply Gaussian blur to images with adjustable intensity sliders.",
    "metaDescription": "Blur images online for free. Adjust Gaussian blur radius for photos to create smooth background effects instantly in browser.",
    "keywords": [
      "Blur Image",
      "Blur photo background",
      "Gaussian blur online",
      "Smoothen image pixels",
      "Blur image tool"
    ],
    "icon": "Layers",
    "howToUse": [
      "Upload the image you want to blur.",
      "Adjust the blur intensity slider (from 0px to 60px).",
      "Review the live preview on the canvas workspace.",
      "Download the blurred image in PNG format."
    ],
    "faqs": [
      {
        "question": "How is the blur effect computed?",
        "answer": "The blur uses high-performance hardware-accelerated canvas filter properties (`blur(Xpx)`), rendering the blurred pixels instantly in browser memory."
      },
      {
        "question": "Can I blur only a specific portion of the image?",
        "answer": "Currently, this tool applies Gaussian blur to the entire image. To blur a specific area, you can crop that segment first."
      }
    ],
    "sections": [
      {
        "title": "Gaussian Blur Applications",
        "content": "Gaussian blur is a math filter that averages pixel colors with surrounding values. It is commonly used to create decorative backgrounds, protect text privacy, or reduce digital noise."
      }
    ]
  },
  {
    "id": "BackgroundRemover",
    "slug": "background-remover",
    "name": "Remove Background",
    "category": "image",
    "shortDescription": "Remove backgrounds from images using local pixel color keying with tolerance controls.",
    "metaDescription": "Erase background from images online for free. Select key colors and adjust tolerance sliders to create transparent PNGs locally.",
    "keywords": [
      "Remove Background",
      "Background remover online",
      "Make image transparent",
      "Chroma key eraser",
      "Transparent PNG maker"
    ],
    "icon": "Pipette",
    "howToUse": [
      "Upload an image with a solid or high-contrast background.",
      "Click on the color picker tool or click directly on any pixel in the background preview.",
      "Adjust the tolerance slider to expand or narrow the erased color range.",
      "Adjust the edge smoothing slider and click download to save as a transparent PNG."
    ],
    "faqs": [
      {
        "question": "Does this tool support automatic AI background removal?",
        "answer": "No, this tool uses chroma-key color thresholding running locally in your browser. This guarantees 100% data privacy and runs without external server costs."
      },
      {
        "question": "Why does parts of the subject get erased as well?",
        "answer": "If the subject contains colors similar to the background, increasing tolerance will key them out too. Adjust the tolerance lower or choose a more distinct color."
      }
    ],
    "sections": [
      {
        "title": "Color Keying / Chroma Key Basics",
        "content": "Color keying maps each pixel to its RGB channels and calculates the distance to the target color. Pixels falling within the tolerance threshold are assigned an alpha value of 0 (transparency)."
      }
    ]
  },
  {
    "id": "MetadataViewer",
    "slug": "metadata-viewer",
    "name": "Image Metadata Viewer",
    "category": "image",
    "shortDescription": "View basic image specifications and decode EXIF header metadata from camera photos.",
    "metaDescription": "Read image metadata online. View file sizes, resolutions, aspect ratios, and extract EXIF headers (ISO, aperture, exposure, camera model).",
    "keywords": [
      "Image Metadata Viewer",
      "Read EXIF online",
      "View photo details",
      "Image property reader",
      "Camera metadata checker"
    ],
    "icon": "Table",
    "howToUse": [
      "Select a photo from your device (JPEG/JPG is highly recommended).",
      "The general properties (resolution, size, type) will display immediately.",
      "Review the EXIF headers section for camera make, model, exposure settings, and date taken details."
    ],
    "faqs": [
      {
        "question": "Why does my image show no EXIF metadata?",
        "answer": "Most image uploads on social media, messaging apps, or optimization tools strip EXIF data to protect user privacy and minimize file sizes."
      },
      {
        "question": "Does this metadata viewer store my GPS locations?",
        "answer": "No. The file data is parsed entirely locally in your browser tab. No location details, camera tags, or image properties are sent to any server."
      }
    ],
    "sections": [
      {
        "title": "What is EXIF Data?",
        "content": "EXIF (Exchangeable Image File Format) is a metadata standard embedded inside image files. It stores details written by digital cameras and smartphones, such as date/time, camera model, coordinates, and exposure information."
      }
    ]
  },
  {
    "id": "ImageToBase64",
    "slug": "image-to-base64",
    "name": "Convert Image to Base64",
    "category": "image",
    "shortDescription": "Convert images to Base64 data strings, HTML image tags, and CSS background properties.",
    "metaDescription": "Convert JPG, PNG, and WebP images to Base64 online. Generate raw base64 data strings, HTML img tags, and CSS background url codes.",
    "keywords": [
      "Convert Image to Base64",
      "Image to Base64 online",
      "Base64 image encoder",
      "Generate data URL",
      "Embed image base64"
    ],
    "icon": "FileCode",
    "howToUse": [
      "Upload the image you wish to convert.",
      "Select the target format: Data URL, Raw String, HTML snippet, or CSS rule.",
      "Review the character count and copy the generated base64 string directly."
    ],
    "faqs": [
      {
        "question": "What is a Base64 Image?",
        "answer": "A Base64 image is a binary-to-text representation of an image file. It allows developers to embed image data directly inside HTML, CSS, or JSON files."
      },
      {
        "question": "Does Base64 increase the size of the image?",
        "answer": "Yes, Base64 encoding increases file size by approximately 33% compared to raw binary data. Use it primarily for small icons and inline SVGs."
      }
    ],
    "sections": [
      {
        "title": "Use Cases for Inline Base64 Images",
        "content": "Inline images eliminate HTTP roundtrips, speeding up single-page loads for tiny icons or template files. However, because they increase size and cannot be cached independently, avoid base64 encoding for larger gallery photos."
      }
    ]
  },
  {
    "id": "Base64ToImage",
    "slug": "base64-to-image",
    "name": "Base64 to Image",
    "category": "image",
    "shortDescription": "Paste Base64 code or data URIs to reconstruct and download the original image.",
    "metaDescription": "Decode Base64 string to image online. Paste raw base64 or Data URI code to preview, inspect, and download original image files.",
    "keywords": [
      "Base64 to Image",
      "Base64 image decoder",
      "Convert Base64 to JPG",
      "Base64 string to PNG",
      "Decode base64 code"
    ],
    "icon": "Eye",
    "howToUse": [
      "Paste your Base64 string into the text input area.",
      "The tool will automatically parse the data, detect the format, and render a preview.",
      "Review dimensions and click \"Download Image\" to save the file."
    ],
    "faqs": [
      {
        "question": "What formats can be decoded back to images?",
        "answer": "The decoder automatically parses raw base64, data URIs (`data:image/png;base64,...`), CSS rules, and HTML `<img>` tag snippets for PNG, JPEG, WebP, and GIF."
      },
      {
        "question": "How does it detect the correct image format?",
        "answer": "It parses the header prefix or inspects the initial byte signatures (magic bytes) of the raw base64 string to identify MIME formats."
      }
    ],
    "sections": [
      {
        "title": "Base64 Decoding Mechanics",
        "content": "Decoding takes ASCII base64 characters and converts them back to a raw binary array buffer. The browser then creates an in-memory object URL allowing the image to render and download."
      }
    ]
  },
  {
    "id": "ImagesToZip",
    "slug": "images-to-zip",
    "name": "Convert Multiple Images to ZIP",
    "category": "image",
    "shortDescription": "Select and package multiple images into a single compressed ZIP archive locally.",
    "metaDescription": "Compress multiple images to ZIP online. Package photo selections into a single zip download file entirely in browser.",
    "keywords": [
      "Convert Multiple Images to ZIP",
      "Images to ZIP converter",
      "Zip photos online",
      "Compress folder images",
      "Pack files to zip"
    ],
    "icon": "Archive",
    "howToUse": [
      "Select or drag-and-drop multiple image files into the upload box.",
      "Review and manage the selected files list (remove unwanted items).",
      "Click \"Compile ZIP Archive\" to create the zip folder locally.",
      "Download the compiled `.zip` file with a single click."
    ],
    "faqs": [
      {
        "question": "Is there a limit on the number of images I can zip?",
        "answer": "There is no strict limit, but zipping runs inside your browser memory. Processing hundreds of megabytes of images at once can slow down older devices."
      },
      {
        "question": "Are the files zipped securely?",
        "answer": "Yes, compression runs 100% locally in your browser memory. Your files are never uploaded to any remote server."
      }
    ],
    "sections": [
      {
        "title": "Benefits of Client-Side Zipping",
        "content": "Zipping locally allows you to package and download bulk assets instantly without spending data bandwidth to upload files to a server, providing perfect security for private snapshots."
      }
    ]
  },
  {
    "id": "ImageColorPicker",
    "slug": "image-color-picker",
    "name": "Image Color Picker",
    "category": "image",
    "shortDescription": "Extract pixel color codes from images with a magnifying zoom loupe overlay.",
    "metaDescription": "Pick color from image online. Hover with magnifying glass zoom and click to copy hex, rgb, and hsl color codes from any pixel.",
    "keywords": [
      "Image Color Picker",
      "Pick color from image",
      "Hex color dropper",
      "Find pixel color online",
      "Color identifier from photo"
    ],
    "icon": "Pipette",
    "howToUse": [
      "Upload the image from which you want to pick colors.",
      "Hover over the image canvas. A zoom loupe overlay will follow your cursor.",
      "Click to lock-select the color of that pixel.",
      "Copy Hex, RGB, or HSL codes from the sidebar panel."
    ],
    "faqs": [
      {
        "question": "How accurate is the magnifying loupe?",
        "answer": "It zooms into the exact pixel coordinate on the canvas, showing a 9x9 grid of pixels around the cursor for precise color selections."
      },
      {
        "question": "What color formats does this tool output?",
        "answer": "It outputs standard CSS hexadecimal (#Hex), rgb(r, g, b), and hsl(h, s, l) codes ready to copy directly into designs."
      }
    ],
    "sections": [
      {
        "title": "Color Codes in Web Development",
        "content": "- **HEX**: Alphanumeric representation of Red, Green, and Blue intensity in base-16.\n- **RGB**: Specifies additive red, green, blue channels directly.\n- **HSL**: Stands for Hue, Saturation, Lightness, offering a more human-intuitive model for editing colors."
      }
    ]
  },
  {
    "id": "QRScannerImage",
    "slug": "qr-scanner-image",
    "name": "QR Code Scanner From Image",
    "category": "image",
    "shortDescription": "Scan and decode QR codes from image files locally inside browser memory.",
    "metaDescription": "Scan QR code from image online. Upload JPG, PNG or WebP files and parse QR link or text contents instantly u/s local canvas decoding.",
    "keywords": [
      "QR Code Scanner From Image",
      "Read QR code from file",
      "QR decoder from photo",
      "Online QR reader image",
      "Scan QR code photo"
    ],
    "icon": "QrCode",
    "howToUse": [
      "Select or drag-and-drop a photo containing a QR code.",
      "The scanner will analyze the image data instantly in browser.",
      "Review the decoded text result. Click copy or follow link shortcuts."
    ],
    "faqs": [
      {
        "question": "Will this scanner work on blur or skewed QR codes?",
        "answer": "Yes, the decoder (jsQR) contains error correction algorithms to resolve slightly skewed, rotated, or blurry QR codes, provided they are in focus."
      },
      {
        "question": "Can it scan QR codes from screenshots?",
        "answer": "Yes. Any screenshot, photo, or downloaded graphic containing a QR code can be parsed and decoded."
      }
    ],
    "sections": [
      {
        "title": "How QR Code Scanning Works",
        "content": "QR (Quick Response) codes contain black square blocks arranged in a square grid on a white background. The scanner reads these blocks as binary data, applies Reed-Solomon error correction, and extracts the encoded text strings."
      }
    ]
  },
  {
    id: 'PDFMerge',
    slug: 'pdf-merge',
    name: 'PDF Merge',
    category: 'pdf',
    shortDescription: 'Combine multiple PDF files into a single document client-side.',
    metaDescription: 'Free online PDF Merge tool. Combine multiple PDF documents into one PDF file easily and securely in your browser without uploading to any server.',
    keywords: ['Merge PDF', 'Combine PDF files', 'Join PDF online', 'PDF merger free', 'Local PDF combiner'],
    icon: 'Combine',
    howToUse: [
      'Click Upload or drag & drop multiple PDF files into the upload zone.',
      'Rearrange the uploaded files by dragging them up or down in the list.',
      'Click the "Merge PDFs" button to combine the documents.',
      'Your merged PDF file will download automatically.'
    ],
    faqs: [
      {
        question: 'Is there a limit on the number of PDFs I can merge?',
        answer: 'No, there is no hard limit on the number of files you can combine, but merging very large PDFs may take more memory in your browser.'
      },
      {
        question: 'Are my PDF files uploaded to a server?',
        answer: 'No. The entire merging process happens 100% locally in your web browser. No files are uploaded to our servers, ensuring absolute privacy.'
      }
    ],
    sections: [
      {
        title: 'Why Merge PDFs Locally?',
        content: 'Merging PDFs locally is the safest way to handle documents containing sensitive business or personal information. Unlike traditional online PDF tools that upload your files to external servers, local merging preserves your document integrity and guarantees that your data never leaves your computer.'
      }
    ]
  },
  {
    id: 'PDFSplit',
    slug: 'pdf-split',
    name: 'PDF Split',
    category: 'pdf',
    shortDescription: 'Extract specific pages or split a PDF document by ranges.',
    metaDescription: 'Free online PDF Splitter. Extract specific pages or split PDF by custom ranges locally in your browser. Fast, secure, and completely serverless.',
    keywords: ['Split PDF', 'Extract pages from PDF', 'Split PDF range', 'PDF splitter free', 'Cut PDF pages online'],
    icon: 'Scissors',
    howToUse: [
      'Upload a single PDF document.',
      'Choose whether to extract specific pages (e.g. 1, 3, 5) or split by ranges (e.g. 1-3, 4-6).',
      'Input the desired pages or ranges.',
      'Click "Split PDF" to generate and download the split document(s).'
    ],
    faqs: [
      {
        question: 'How do I specify multiple ranges to split?',
        answer: 'Use commas to separate multiple ranges, such as 1-3, 4-6. This will extract pages 1 through 3 as one document, and 4 through 6 as another.'
      },
      {
        question: 'Can I split password-protected PDFs?',
        answer: 'You will need to unlock the PDF first using our PDF Unlock tool before splitting it, as encrypted PDFs cannot be parsed directly.'
      }
    ],
    sections: [
      {
        title: 'PDF Splitting Modes',
        content: '1. **Extract Page List**: Select individual page numbers (e.g., 2, 5, 9) to extract only those pages into a new PDF document.\n2. **Split Ranges**: Define ranges (e.g. 1-5, 6-10) to slice a larger report into smaller, manageable chapters.'
      }
    ]
  },
  {
    id: 'PDFCompressor',
    slug: 'pdf-compressor',
    name: 'PDF Compressor',
    category: 'pdf',
    shortDescription: 'Reduce PDF file size by compressing images client-side.',
    metaDescription: 'Free online PDF Compressor. Reduce PDF file size locally in your browser by optimizing image assets. Safe, secure, and fast.',
    keywords: ['Compress PDF', 'Reduce PDF size', 'PDF size reducer', 'Compress PDF client side', 'Shrink PDF file size'],
    icon: 'FileDown',
    howToUse: [
      'Upload the PDF file you wish to compress.',
      'Select a compression level: Low (maximum quality), Medium (recommended balance), or High (smallest file size).',
      'Click "Compress PDF" to optimize.',
      'The compressed PDF will download automatically with a smaller file size.'
    ],
    faqs: [
      {
        question: 'How does client-side PDF compression work?',
        answer: 'It renders PDF pages onto standard canvases, applies high-efficiency image compression to the layouts, and outputs a rewritten PDF structure.'
      },
      {
        question: 'Does PDF compression reduce text quality?',
        answer: 'No, textual elements remain sharp. The compressor primarily targets embedded images and graphics which contribute to the bulk of the file size.'
      }
    ],
    sections: [
      {
        title: 'Understanding PDF Compression Levels',
        content: '- **Low Compression**: Minimal change in resolution, best for high-fidelity architectural drawings.\n- **Medium Compression**: Re-encodes images at 150 DPI, ideal for typical corporate slideshows and business agreements.\n- **High Compression**: Re-encodes at 72 DPI, ideal for quick drafts and mobile distributions.'
      }
    ]
  },
  {
    id: 'PDFPageRemover',
    slug: 'pdf-page-remover',
    name: 'PDF Page Remover',
    category: 'pdf',
    shortDescription: 'Delete selected pages from a PDF document visually.',
    metaDescription: 'Free online PDF Page Remover. Delete unwanted pages from your PDF visually in your browser. Fast, secure, and client-side.',
    keywords: ['Delete pages from PDF', 'Remove PDF pages', 'PDF page remover', 'Erase PDF pages online', 'PDF editor free'],
    icon: 'FileMinus',
    howToUse: [
      'Upload a PDF document to load its pages.',
      'Select the pages you want to delete by clicking on their thumbnails.',
      'Click the "Remove Selected Pages" button.',
      'Download the updated PDF with the chosen pages removed.'
    ],
    faqs: [
      {
        question: 'Can I undo a page deletion?',
        answer: 'You can uncheck a thumbnail before downloading to restore the page. Once the file is downloaded, the pages are permanently removed from the output.'
      },
      {
        question: 'How many pages can I delete at once?',
        answer: 'You can select and remove any number of pages, up to all but one page (PDFs must have at least 1 page).'
      }
    ],
    sections: [
      {
        title: 'Visual PDF Page Management',
        content: 'Our visual interface renders a thumbnail preview of each page using HTML5 Canvas. This lets you visually identify and select unwanted pages (such as blank pages or draft versions) before rendering the output.'
      }
    ]
  },
  {
    id: 'PDFPageReorder',
    slug: 'pdf-page-reorder',
    name: 'PDF Page Reorder',
    category: 'pdf',
    shortDescription: 'Rearrange the page order of a PDF using drag & drop.',
    metaDescription: 'Free online PDF Page Reorder tool. Rearrange PDF pages visually via drag & drop. 100% secure, private, and client-side.',
    keywords: ['Reorder PDF pages', 'Rearrange PDF pages', 'PDF page organizer', 'Move PDF pages', 'Organize PDF files'],
    icon: 'ArrowUpDown',
    howToUse: [
      'Upload a PDF file to see page thumbnails.',
      'Click and drag a page thumbnail to its new position.',
      'Verify the new page sequence.',
      'Click "Save PDF" to download the reordered document.'
    ],
    faqs: [
      {
        question: 'Is it easy to drag pages on mobile devices?',
        answer: 'Yes, the page reordering interface supports touch gestures on mobile devices and tablets for easy page sorting.'
      },
      {
        question: 'Can I insert new blank pages here?',
        answer: 'This tool is currently designed for rearranging existing pages. To merge different documents, use the PDF Merge tool.'
      }
    ],
    sections: [
      {
        title: 'Client-Side PDF Organization',
        content: 'Rearranging pages visually allows you to fix misordered scans, index slide presentations, or organize report headers immediately before delivery, without needing heavy desktop software.'
      }
    ]
  },
  {
    id: 'PDFRotate',
    slug: 'pdf-rotate',
    name: 'PDF Rotate',
    category: 'pdf',
    shortDescription: 'Rotate pages of a PDF document visually.',
    metaDescription: 'Free online PDF Rotator. Rotate individual pages or all pages of a PDF by 90, 180, or 270 degrees locally in browser.',
    keywords: ['Rotate PDF', 'Turn PDF pages', 'Rotate PDF pages online', 'PDF page rotator', 'Fix upside down PDF'],
    icon: 'RotateCw',
    howToUse: [
      'Upload a PDF file.',
      'Click the rotate buttons on individual page thumbnails, or click "Rotate All Pages".',
      'Select rotation angles (90° CW, 90° CCW, or 180°).',
      'Click "Save Rotated PDF" to download.'
    ],
    faqs: [
      {
        question: 'Will the rotation be saved permanently?',
        answer: 'Yes. The rotation tag of the selected pages is updated within the PDF structure, so it displays correctly in any standard PDF viewer.'
      },
      {
        question: 'Can I rotate only odd or even pages?',
        answer: 'Yes, our batch tools allow quick selection and rotation filters for odd pages, even pages, or the entire document.'
      }
    ],
    sections: [
      {
        title: 'Fixing Scanned Documents',
        content: 'Scanned invoices and documents often end up rotated sideways or upside-down. This tool updates the PDF `/Rotate` dictionary key on a page level, meaning pages are permanently corrected without compressing or lowering the document quality.'
      }
    ]
  },
  {
    id: 'PDFPasswordProtect',
    slug: 'pdf-password-protect',
    name: 'PDF Password Protect',
    category: 'pdf',
    shortDescription: 'Encrypt a PDF document with a secure password.',
    metaDescription: 'Free online PDF Password Protect. Encrypt your PDF files with user passwords to prevent unauthorized access. Safe and secure client-side encryption.',
    keywords: ['Password protect PDF', 'Encrypt PDF online', 'Secure PDF file', 'Add password to PDF', 'PDF locker free'],
    icon: 'Lock',
    howToUse: [
      'Upload the PDF file you wish to lock.',
      'Type a secure password in the input field.',
      'Confirm the password.',
      'Click "Lock PDF" to encrypt and download the secured document.'
    ],
    faqs: [
      {
        question: 'What type of encryption is used?',
        answer: 'We use standard PDF security handlers (including standard RC4/MD5 128-bit encryption) to ensure compatibility across Acrobat Reader and browsers.'
      },
      {
        question: 'Can I recover the PDF if I forget the password?',
        answer: 'No. Since the password is never uploaded to any server, there is no way to recover or reset it. Make sure to remember your password.'
      }
    ],
    sections: [
      {
        title: 'Why Password-Protect Your PDFs?',
        content: 'Encrypting files with a password restricts unauthorized views, protecting critical customer details, payroll, or business receipts when sending attachments over email or chat applications.'
      }
    ]
  },
  {
    id: 'PDFUnlock',
    slug: 'pdf-unlock',
    name: 'PDF Unlock',
    category: 'pdf',
    shortDescription: 'Remove password protection from secure PDFs.',
    metaDescription: 'Free online PDF Unlocker. Remove security passwords and restrictions from your PDF files locally. Fast, secure, and 100% private.',
    keywords: ['Unlock PDF', 'Decrypt PDF online', 'Remove password from PDF', 'PDF password remover', 'Unprotect PDF free'],
    icon: 'Unlock',
    howToUse: [
      'Upload a password-protected PDF file.',
      'Enter the correct document password.',
      'Click "Decrypt PDF".',
      'Download the unprotected PDF file which can now be opened without a password.'
    ],
    faqs: [
      {
        question: 'Do I need to know the password to unlock it?',
        answer: 'Yes, this tool removes passwords from documents you own or have authorized access to. It is not designed to crack passwords.'
      },
      {
        question: 'Will this remove copying and printing restrictions too?',
        answer: 'Yes. The decryption process removes all security dictionaries, lifting printing, copying, and editing restrictions.'
      }
    ],
    sections: [
      {
        title: 'Unlocking PDF Workflows',
        content: 'Unlocking documents removes the constant password prompt, allowing easier archiving, reading on smart devices, and seamless uploads into document index tools.'
      }
    ]
  },
  {
    id: 'PDFWatermark',
    slug: 'pdf-watermark',
    name: 'PDF Watermark',
    category: 'pdf',
    shortDescription: 'Add text or image watermarks to a PDF document.',
    metaDescription: 'Free online PDF Watermark. Add custom text or image logos onto your PDF pages. Customize position, opacity, scale, and rotation in-browser.',
    keywords: ['Watermark PDF', 'Add logo to PDF', 'PDF watermarker online', 'Stamp PDF pages', 'Brand PDF documents'],
    icon: 'FileSignature',
    howToUse: [
      'Upload a PDF document.',
      'Choose "Text Watermark" (input your text, select font, size, color) or "Image Watermark" (upload an image logo).',
      'Adjust settings like Opacity, Rotation angle, and Placement position.',
      'Click "Apply Watermark" and download the stamped PDF.'
    ],
    faqs: [
      {
        question: 'Will the watermark appear on all pages?',
        answer: 'Yes, the watermark will be drawn on every page of the document by default, but you can choose to skip the first page.'
      },
      {
        question: 'Can the watermark be easily removed?',
        answer: 'No, the watermark is rendered directly as content streams inside the PDF pages, making it permanent for standard readers.'
      }
    ],
    sections: [
      {
        title: 'Branding and Protecting Intellectual Property',
        content: 'Watermarks (like "CONFIDENTIAL", "DRAFT", or your company logo) protect your business drafts from being shared without credit or used before final review.'
      }
    ]
  },
  {
    id: 'PDFPageNumbering',
    slug: 'pdf-page-numbering',
    name: 'PDF Page Numbering',
    category: 'pdf',
    shortDescription: 'Add running page numbers to a PDF document.',
    metaDescription: 'Free online PDF Page Numbering tool. Add running numbers (e.g. Page X of Y) to headers or footers. Safe and client-side.',
    keywords: ['Add page numbers to PDF', 'PDF page numbering', 'Page numbers header footer', 'Number PDF pages online', 'PDF editor numbers'],
    icon: 'Hash',
    howToUse: [
      'Upload the PDF file.',
      'Select number format (e.g., "1", "Page 1", "Page 1 of 10").',
      'Select position (Bottom Right, Bottom Center, Top Right, etc.) and margin offsets.',
      'Click "Add Page Numbers" to generate and download.'
    ],
    faqs: [
      {
        question: 'Can I start numbering from a specific page?',
        answer: 'Yes, you can set the "Start Page" index (e.g., start numbering from page 2 to skip a cover page).'
      },
      {
        question: 'Can I choose the font size and color?',
        answer: 'Yes, the controls let you adjust font size, color (dark or light), and font style (Standard, Bold, Italic).'
      }
    ],
    sections: [
      {
        title: 'Professional Document Indexing',
        content: 'Adding page numbers organizes reports, contracts, and manuals, making it easy for readers to reference specific sections during discussions or presentations.'
      }
    ]
  },
  {
    id: 'ExtractTextPDF',
    slug: 'extract-text-pdf',
    name: 'Extract Text From PDF',
    category: 'pdf',
    shortDescription: 'Extract plain text content from a PDF file locally.',
    metaDescription: 'Free online PDF Text Extractor. Extract plain text from PDF documents in browser without uploads. View preview and download as TXT.',
    keywords: ['Extract text from PDF', 'PDF to text converter', 'Read PDF text online', 'PDF text scraper', 'Convert PDF to TXT'],
    icon: 'FileSearch',
    howToUse: [
      'Upload a PDF document.',
      'The tool will automatically parse text content from each page.',
      'Review the extracted text preview in the editor box.',
      'Click "Download Text" to save as a plain `.txt` file.'
    ],
    faqs: [
      {
        question: 'Can this extract text from scanned images or photos?',
        answer: 'This is a text parser, not an OCR (Optical Character Recognition) tool. It extracts native searchable text from digital PDFs, not scanned images.'
      },
      {
        question: 'Does it preserve document formatting?',
        answer: 'It extracts words in layout order. While margins are lost, paragraph and line splits are preserved to maintain readability.'
      }
    ],
    sections: [
      {
        title: 'Fast and Private Text Scrapes',
        content: 'Local text extraction parses PDF layout streams in browser memory, letting you extract copyable texts, logs, or lists from massive files instantly without server latency.'
      }
    ]
  },
  {
    id: 'PDFMetadataViewer',
    slug: 'pdf-metadata-viewer',
    name: 'PDF Metadata Viewer',
    category: 'pdf',
    shortDescription: 'Inspect properties and metadata tags of a PDF file.',
    metaDescription: 'Free online PDF Metadata Viewer. Inspect PDF properties, creation date, modifications, author, version, and producer tags locally.',
    keywords: ['PDF metadata viewer', 'Inspect PDF tags', 'Check PDF properties', 'Read PDF author title', 'PDF file inspector'],
    icon: 'Info',
    howToUse: [
      'Upload a PDF document.',
      'The viewer will read and parse standard document dictionaries.',
      'Inspect metadata like Author, Title, Creator, Producer, Creation/Mod Date, Page Count, and file metrics.'
    ],
    faqs: [
      {
        question: 'Can I edit the metadata here?',
        answer: 'This version is a read-only viewer. To write custom metadata, use dedicated PDF editing tools.'
      },
      {
        question: 'Why is some metadata missing?',
        answer: 'Metadata fields are optional. If the document creator did not specify a Title or Author, the corresponding fields will show as "Not Specified".'
      }
    ],
    sections: [
      {
        title: 'Verifying PDF Properties',
        content: 'Inspecting PDF metadata lets you verify the software producer, creator, and modification dates to check document validity before archiving or printing.'
      }
    ]
  },
  {
    id: 'PDFToWord',
    slug: 'pdf-to-word',
    name: 'PDF to Word',
    category: 'pdf',
    shortDescription: 'Convert a PDF document into a Word (.doc) document.',
    metaDescription: 'Free online PDF to Word converter. Convert PDF files to editable Microsoft Word files locally. Secure, client-side conversion.',
    keywords: ['Convert PDF to Word', 'PDF to DOCX online', 'Editable PDF to Word', 'Local PDF converter Word', 'PDF to doc converter'],
    icon: 'FileText',
    howToUse: [
      'Upload a PDF document.',
      'Click "Convert to Word".',
      'The tool will extract document texts and format them into an editable Word document.',
      'Download your converted `.doc` file.'
    ],
    faqs: [
      {
        question: 'Will the Word file match my PDF layout exactly?',
        answer: 'It transfers text blocks, paragraphs, and headings. Very complex layouts with multi-column text overlays may require slight adjustments in Word.'
      },
      {
        question: 'Can I edit the output document in Google Docs?',
        answer: 'Yes, the exported file is compatible with Microsoft Word, Google Docs, LibreOffice, and WPS Writer.'
      }
    ],
    sections: [
      {
        title: 'Editable PDF Conversions',
        content: 'Converting a PDF to a editable Word file allows you to reuse old text contents, adjust contract clauses, or rewrite layout templates without typing from scratch.'
      }
    ]
  },
  {
    id: 'WordToPDF',
    slug: 'word-to-pdf',
    name: 'Word to PDF',
    category: 'pdf',
    shortDescription: 'Convert a Microsoft Word document (.docx) to PDF.',
    metaDescription: 'Free online Word to PDF converter. Convert DOCX files to PDF documents locally in your browser. Private and serverless conversion.',
    keywords: ['Convert Word to PDF', 'DOCX to PDF online', 'Word to PDF client side', 'Convert doc to pdf free', 'Local Word converter'],
    icon: 'FileText',
    howToUse: [
      'Upload a `.docx` file.',
      'Click "Convert to PDF".',
      'The text and formatting will be parsed and formatted into PDF pages.',
      'Your PDF document will download automatically.'
    ],
    faqs: [
      {
        question: 'Does this require MS Word to be installed?',
        answer: 'No, this converter operates completely independently inside the browser engine using Javascript parsing.'
      },
      {
        question: 'What Word formats are supported?',
        answer: 'It supports standard XML-based Word files (.docx). Older binary Word files (.doc) must be saved as .docx first.'
      }
    ],
    sections: [
      {
        title: 'Word processing in PDF',
        content: 'Converting Word documents into PDF formats is standard practice for professional sharing. It guarantees that the fonts, margins, and layouts appear identical on any recipient device.'
      }
    ]
  },
  {
    id: 'ExcelToPDF',
    slug: 'excel-to-pdf',
    name: 'Excel to PDF',
    category: 'pdf',
    shortDescription: 'Convert Microsoft Excel (.xlsx) sheets to PDF tables.',
    metaDescription: 'Free online Excel to PDF converter. Convert XLSX files into styled PDF tables locally in browser. Secure, fast, and serverless.',
    keywords: ['Convert Excel to PDF', 'XLSX to PDF online', 'Excel sheet to PDF table', 'Convert spreadsheet to pdf', 'Local Excel converter'],
    icon: 'Table',
    howToUse: [
      'Upload a `.xlsx` spreadsheet.',
      'Review the sheet selection list (all worksheets are converted).',
      'Click "Convert to PDF" to compile.',
      'Download the PDF displaying your data tables organized on pages.'
    ],
    faqs: [
      {
        question: 'Will formulas be computed in the PDF?',
        answer: 'The converter reads the last calculated values stored in the sheet cells, ensuring the outputs match your spreadsheet state.'
      },
      {
        question: 'How are large sheets handled?',
        answer: 'Worksheets are automatically scaled and fitted onto portrait or landscape pages with column borders to maintain layout alignment.'
      }
    ],
    sections: [
      {
        title: 'Sharing Spreadsheet Reports',
        content: 'Converting spreadsheets into static PDF sheets prevents accidental formula edits or column width adjustments by readers, ideal for sending financial statements, quotes, and bills.'
      }
    ]
  },
  {
    id: 'PowerPointToPDF',
    slug: 'powerpoint-to-pdf',
    name: 'PowerPoint to PDF',
    category: 'pdf',
    shortDescription: 'Convert Microsoft PowerPoint slides (.pptx) to PDF.',
    metaDescription: 'Free online PowerPoint to PDF converter. Convert PPTX slide decks into landscape PDF presentations locally. Private and serverless.',
    keywords: ['Convert PPTX to PDF', 'PowerPoint to PDF online', 'PPTX to PDF local', 'Convert presentation to pdf', 'PowerPoint slides converter'],
    icon: 'Presentation',
    howToUse: [
      'Upload a `.pptx` presentation deck.',
      'Click "Convert to PDF".',
      'The slides are parsed and drawn onto landscape PDF pages.',
      'Download your PDF presentation.'
    ],
    faqs: [
      {
        question: 'Are slides exported in landscape format?',
        answer: 'Yes, the slides are written onto landscape PDF pages (16:9 aspect ratio) to match standard presentation structures.'
      },
      {
        question: 'Are transitions preserved in PDF?',
        answer: 'PDF is a static document format, so animations and slide transition effects will be removed, exporting slide graphics and text statically.'
      }
    ],
    sections: [
      {
        title: 'Delivering Pitch Decks securely',
        content: 'Converting PPTX slideshows to PDF guarantees that your layouts, titles, text alignments, and fonts look consistent on client display devices or mobile readers during presentations.'
      }
    ]
  },
  {
    id: 'WordCounter',
    slug: 'word-counter',
    name: 'Word Counter',
    category: 'text',
    shortDescription: 'Count words, characters, sentences, paragraphs, and estimate reading/speaking times in real-time.',
    metaDescription: 'Free online Word Counter. Count characters, words, sentences, paragraphs, and check estimated reading and speaking times instantly in browser.',
    keywords: ['Word Counter', 'Character Counter', 'Count words online', 'Reading time estimator', 'Text length checker'],
    icon: 'Type',
    howToUse: [
      'Type or paste your text into the input text area.',
      'Check the real-time statistics panel on the side for words, characters, and sentences.',
      'Use the case conversion buttons to instantly change text case (UPPERCASE, Title Case, etc.).',
      'Click the Copy button to copy the updated text to your clipboard.'
    ],
    faqs: [
      {
        question: 'Does this Word Counter count spaces as characters?',
        answer: 'Yes, it displays both characters with spaces and characters without spaces in the statistics sidebar.'
      },
      {
        question: 'How is the reading time calculated?',
        answer: 'It assumes an average adult reading speed of 225 words per minute (WPM).'
      }
    ],
    sections: [
      {
        title: 'Importance of Text Statistics in Writing',
        content: 'Maintaining specific word counts is crucial for SEO meta descriptions, essays, social posts, and copy writing. Keeping track of reading time ensures your content fits standard attention spans.'
      }
    ]
  },
  {
    id: 'MetaTagGenerator',
    slug: 'meta-tag-generator',
    name: 'Meta Tag Generator',
    category: 'web',
    shortDescription: 'Generate SEO meta tags, Open Graph previews, and Twitter Card details for your website.',
    metaDescription: 'Free online Meta Tag Generator. Generate search engine friendly SEO titles, descriptions, keywords, Open Graph, and Twitter metadata HTML.',
    keywords: ['Meta Tag Generator', 'SEO tags creator', 'Open Graph tags generator', 'Twitter Cards generator', 'SEO code generator'],
    icon: 'Globe',
    howToUse: [
      'Fill in your website title, description, and keywords.',
      'Configure robots index/follow directives and authors details.',
      'Add social sharing settings (Open Graph image, Twitter card sizes).',
      'Copy the generated HTML meta codes from the output panel and paste them inside your HTML head section.'
    ],
    faqs: [
      {
        question: 'Why are meta tags important for SEO?',
        answer: 'Meta tags provide metadata about your webpage directly to search engine bots, helping them index your page content and show accurate previews in search results.'
      },
      {
        question: 'What is Open Graph?',
        answer: 'Open Graph is a protocol developed by Facebook that allows web pages to become rich objects in social networks when shared.'
      }
    ],
    sections: [
      {
        title: 'Best Practices for Meta Tags',
        content: 'Keep site titles under 60 characters and descriptions under 160 characters. Provide high-quality OG images (1200x630 pixels) to ensure your page looks professional when shared on social networks.'
      }
    ]
  },
  {
    id: 'DiscountCalculator',
    slug: 'discount-calculator',
    name: 'Discount Calculator',
    category: 'business',
    shortDescription: 'Calculate the final price, savings, and tax allocations for discounted products.',
    metaDescription: 'Free online Discount Calculator. Estimate discount amounts, tax splits, and final billing prices instantly with slider inputs.',
    keywords: ['Discount Calculator', 'Calculate sales discount', 'Percentage off calculator', 'Final price calculator', 'Discount savings calculator'],
    icon: 'Briefcase',
    howToUse: [
      'Enter the original price of the product.',
      'Use the slider to select the discount rate (e.g. 20% OFF).',
      'Add an optional sales tax percentage (e.g. 18% GST).',
      'View the final discounted price, total discount savings, and tax splits.'
    ],
    faqs: [
      {
        question: 'How is the discount calculated with tax?',
        answer: 'The discount is applied first to the original price, and the sales tax is calculated on top of the discounted price.'
      },
      {
        question: 'Can I use this for retail shopping calculations?',
        answer: 'Yes, it is designed for rapid retail math, helping shoppers find out their exact savings and final bills.'
      }
    ],
    sections: [
      {
        title: 'Formula for Discount Calculations',
        content: 'Discount Amount = Original Price * (Discount Rate / 100)\nDiscounted Price = Original Price - Discount Amount\nFinal Price = Discounted Price * (1 + Tax Rate / 100)'
      }
    ]
  },
  {
    id: 'BMICalculator',
    slug: 'bmi-calculator',
    name: 'BMI Calculator',
    category: 'health',
    shortDescription: 'Calculate your Body Mass Index (BMI) and check your corresponding healthy weight range.',
    metaDescription: 'Free online BMI Calculator. Calculate body mass index using metric or imperial measurements and view weight category zones.',
    keywords: ['BMI Calculator', 'Body Mass Index calculator', 'Healthy weight range', 'Body fat index', 'Metric BMI calculator'],
    icon: 'Heart',
    howToUse: [
      'Select between Metric (kg/cm) and Imperial (lbs/inches) unit modes.',
      'Enter your weight and height dimensions.',
      'Review your BMI score and the corresponding weight category (Underweight, Normal, Overweight, Obese).',
      'Consult the active progress bar mapping your score to health zones.'
    ],
    faqs: [
      {
        question: 'What is a normal BMI score?',
        answer: 'A normal BMI range is between 18.5 and 24.9, according to WHO guidelines.'
      },
      {
        question: 'Is BMI accurate for athletes?',
        answer: 'BMI does not differentiate between muscle mass and fat, so highly muscular individuals or athletes may receive an overweight classification despite being healthy.'
      }
    ],
    sections: [
      {
        title: 'Understanding BMI Categories',
        content: 'Underweight: BMI less than 18.5\nNormal weight: BMI 18.5 to 24.9\nOverweight: BMI 25 to 29.9\nObesity: BMI 30 or higher'
      }
    ]
  },
  {
    id: 'MileageCalculator',
    slug: 'mileage-calculator',
    name: 'Mileage Calculator',
    category: 'automobile',
    shortDescription: 'Calculate vehicle fuel efficiency and estimate fuel expenses per kilometer or mile.',
    metaDescription: 'Free online Mileage Calculator. Calculate fuel efficiency (km/l or mpg) and total trip cost based on distance and fuel filled.',
    keywords: ['Mileage Calculator', 'Fuel efficiency calculator', 'Calculate average fuel usage', 'Vehicle run cost', 'Trip cost estimator'],
    icon: 'Car',
    howToUse: [
      'Input the total distance traveled during the trip in kilometers or miles.',
      'Enter the quantity of fuel filled or consumed in liters or gallons.',
      'Input the unit price of fuel (₹ per Liter).',
      'Check the computed mileage and cost details per kilometer.'
    ],
    faqs: [
      {
        question: 'How is mileage calculated?',
        answer: 'Mileage (km/l) = Distance Traveled / Fuel Consumed. A higher mileage indicates a more fuel-efficient vehicle.'
      },
      {
        question: 'How can I improve my vehicle mileage?',
        answer: 'Maintain recommended tyre pressure, avoid aggressive acceleration, and perform timely servicing.'
      }
    ],
    sections: [
      {
        title: 'Importance of Fuel Tracking',
        content: 'Consistently monitoring your vehicle mileage helps identify mechanical issues early. A sudden drop in fuel efficiency could indicate spark plug wear, low tyre pressure, or fuel injector issues.'
      }
    ]
  },
  {
    id: 'PasswordGenerator',
    slug: 'password-generator',
    name: 'Password Generator',
    category: 'developer',
    shortDescription: 'Create secure, highly customizable random passwords with strength indicators.',
    metaDescription: 'Free online Password Generator. Create strong random passwords. Choose length, configure character sets, and copy secure passwords locally.',
    keywords: ['Password Generator', 'Create strong password', 'Random password maker', 'Secure key generator', 'Local password checker'],
    icon: 'Lock',
    howToUse: [
      'Select your desired password length using the slider (8 to 64 characters).',
      'Toggle character options (Uppercase, Lowercase, Numbers, Symbols).',
      'Optionally exclude similar looking characters for readability.',
      'Click the Copy button or click the Regenerate button to create new variations.'
    ],
    faqs: [
      {
        question: 'Are my generated passwords secure?',
        answer: 'Yes. All password generation processes run locally in your web browser memory. No passwords are sent or saved to any external servers.'
      },
      {
        question: 'What makes a password strong?',
        answer: 'A password is strong if it is long (at least 12-16 characters) and contains a mix of uppercase letters, lowercase letters, numbers, and special symbols.'
      }
    ],
    sections: [
      {
        title: 'Tips for Secure Password Management',
        content: 'Never reuse passwords across multiple sites. Always use a dedicated password manager to store and organize your generated login credentials securely.'
      }
    ]
  },
  {
    id: 'GPACalculator',
    slug: 'gpa-calculator',
    name: 'GPA Calculator',
    category: 'student',
    shortDescription: 'Calculate your semester GPA (SGPA) and cumulative CGPA based on course grades and credits.',
    metaDescription: 'Free online GPA and CGPA Calculator. Calculate semester grades, select O/A/B/C/D grade points, and compute weighted averages.',
    keywords: ['GPA Calculator', 'CGPA Calculator online', 'Semester grades estimator', 'Credits weightage calculator', 'College GPA tracker'],
    icon: 'GraduationCap',
    howToUse: [
      'Add your courses and input their names, letter grades, and credits.',
      'View your computed SGPA instantly on the results panel.',
      'To find cumulative CGPA, enter your previous cumulative GPA and total earned credits.',
      'Check the total credits and weighted grade average summaries.'
    ],
    faqs: [
      {
        question: 'What grading system is used here?',
        answer: 'It uses the standard Indian university scale (O = 10, A+ = 9, A = 8, B+ = 7, B = 6, C = 5, D = 4, F = 0).'
      },
      {
        question: 'How is GPA calculated?',
        answer: 'GPA is the sum of (Grade Points * Credits) divided by the total number of Credits in the semester.'
      }
    ],
    sections: [
      {
        title: 'Weighted Average Calculations',
        content: 'Calculators use weighted credits to reward higher-stakes courses (like main subjects vs labs). A high grade in a 4-credit course raises your GPA much more than a high grade in a 1-credit lab.'
      }
    ]
  },
  {
    id: 'OpenGraphPreview',
    slug: 'open-graph-preview',
    name: 'Open Graph Preview',
    category: 'web',
    shortDescription: 'Configure and preview website social sharing cards for Facebook, Twitter, and LinkedIn.',
    metaDescription: 'Free online Open Graph Preview tool. Generate and preview how your website link card will look on social media platforms.',
    keywords: ['Open Graph Preview', 'OG card generator', 'Facebook meta preview', 'Twitter card preview', 'Social sharing meta'],
    icon: 'Eye',
    howToUse: [
      'Enter the webpage title, description, and absolute image URL.',
      'Select between Facebook, Twitter, or LinkedIn tabs to inspect the visual mockup.',
      'Copy the completed Open Graph code from the output container.'
    ],
    faqs: [
      {
        question: 'What is the purpose of Open Graph previewing?',
        answer: 'It lets you visually verify that your page title, description, and thumbnail align perfectly before publishing updates to production.'
      }
    ],
    sections: [
      {
        title: 'Social Card Specifications',
        content: 'Facebook and LinkedIn prefer 1200x630 pixel sizes for optimal card resolution. Twitter summary large image cards utilize a similar 1.91:1 aspect ratio.'
      }
    ]
  },
  {
    id: 'RobotsTxtGenerator',
    slug: 'robots-txt-generator',
    name: 'Robots.txt Generator',
    category: 'web',
    shortDescription: 'Generate standard robots.txt instructions to manage search crawler pathways.',
    metaDescription: 'Free online Robots.txt Generator. Select default crawlers, specify disallow or allow rules, and generate robots.txt directives instantly.',
    keywords: ['Robots.txt Generator', 'robots.txt creator', 'crawlers instructions', 'search bot rules', 'SEO robots.txt'],
    icon: 'FileText',
    howToUse: [
      'Select the default crawler bot directive.',
      'Enter allowed or disallowed relative pathways (e.g. /admin/).',
      'Input your sitemap XML link and copy or download the compiled robots.txt file.'
    ],
    faqs: [
      {
        question: 'Where should the robots.txt file be uploaded?',
        answer: 'It must be uploaded to the root directory of your website domain (e.g. yourwebsite.com/robots.txt).'
      }
    ],
    sections: [
      {
        title: 'Robots.txt Directives standard',
        content: 'Robots.txt is a voluntary standard. Respectable search crawlers (like Googlebot) follow it, but malicious bots can ignore it. Never use it to secure highly sensitive pages.'
      }
    ]
  },
  {
    id: 'SitemapGenerator',
    slug: 'sitemap-generator',
    name: 'Sitemap Generator',
    category: 'web',
    shortDescription: 'Build standard XML sitemaps to optimize search engine crawl indexing.',
    metaDescription: 'Free online XML Sitemap Generator. Paste webpage URLs and build structured sitemaps with update frequencies and priority weights.',
    keywords: ['Sitemap Generator', 'XML sitemap builder', 'search indexing sitemap', 'website links indexer', 'SEO sitemaps'],
    icon: 'FileCode',
    howToUse: [
      'Paste your webpage links (one link per line) into the editor.',
      'Specify update frequency and priority weights.',
      'Toggle whether to include last modification tags and copy/download the generated XML.'
    ],
    faqs: [
      {
        question: 'Why are XML sitemaps required?',
        answer: 'They tell search crawlers about all the pages that exist on your domain, making it much easier for search engines to discover and index your pages.'
      }
    ],
    sections: [
      {
        title: 'XML Sitemap Protocol guidelines',
        content: 'An XML sitemap should contain absolute URLs and is limited to 50,000 URLs or 50MB uncompressed per sitemap file under protocol standards.'
      }
    ]
  },
  {
    id: 'CanonicalUrlGenerator',
    slug: 'canonical-url-generator',
    name: 'Canonical URL Generator',
    category: 'web',
    shortDescription: 'Construct canonical tags and link headers to prevent duplicate content SEO penalties.',
    metaDescription: 'Free online Canonical URL Generator. Build search engine compliant canonical tags to consolidate search ranking signals.',
    keywords: ['Canonical URL Generator', 'link rel canonical', 'canonical header builder', 'duplicate content SEO', 'web canonical tool'],
    icon: 'Link',
    howToUse: [
      'Enter your website domain and relative page slug.',
      'Select query param stripping preferences.',
      'Copy the link element tag or the equivalent HTTP link header.'
    ],
    faqs: [
      {
        question: 'What does a canonical tag do?',
        answer: 'It tells search engines which URL is the master copy of a page, preventing duplicate content issues when a page is accessible via multiple URLs.'
      }
    ],
    sections: [
      {
        title: 'Preventing Duplicate Indexing',
        content: 'Duplicate content can happen due to URL queries, tracking codes, or alternate HTTP/HTTPS routes. Canonicalization merges all ranking signals into your preferred primary link.'
      }
    ]
  },
  {
    id: 'FaviconGenerator',
    slug: 'favicon-generator',
    name: 'Favicon Generator',
    category: 'web',
    shortDescription: 'Convert images to standard favicon dimensions and generate HTML markup links.',
    metaDescription: 'Free online Favicon Generator. Resize source graphics to 16px, 32px, and 48px sizes, and copy browser link elements.',
    keywords: ['Favicon Generator', 'create favicon online', 'icon resizer', 'website shortcut icon', 'apple touch icon'],
    icon: 'Image',
    howToUse: [
      'Upload a square source graphic.',
      'Verify the live sizes preview panel.',
      'Download individual PNG sizes and copy the link tags into your HTML header.'
    ],
    faqs: [
      {
        question: 'What is a Apple Touch Icon?',
        answer: 'It is a high-resolution favicon used by iOS devices when users bookmark or pin your webpage to their home screen.'
      }
    ],
    sections: [
      {
        title: 'Favicon Standard Specifications',
        content: 'Standard browsers require 16x16 or 32x32 pixel shortcut icons. Apple iOS devices look for a 180x180 pixel image named apple-touch-icon.png in the root directory.'
      }
    ]
  },
  {
    id: 'HtmlEntityEncoder',
    slug: 'html-entity-encoder',
    name: 'HTML Entity Encoder',
    category: 'web',
    shortDescription: 'Convert special characters to HTML character entities or decode them back to plain text.',
    metaDescription: 'Free online HTML Entity Encoder and Decoder. Convert unsafe characters into secure code entity sequences instantly.',
    keywords: ['HTML Entity Encoder', 'HTML character encoder', 'html entities decode', 'escape html online', 'unescape entities'],
    icon: 'Globe',
    howToUse: [
      'Paste your string text or HTML snippet inside the input panel.',
      'Toggle the mode setting (Encode or Decode).',
      'Copy the processed string from the adjacent panel.'
    ],
    faqs: [
      {
        question: 'Why do we need to encode HTML entities?',
        answer: 'Characters like < and > are reserved in HTML syntax. Encoding them to entities allows browsers to render them as text without executing them as code.'
      }
    ],
    sections: [
      {
        title: 'Reserved Characters in HTML',
        content: 'Common entities include &lt; (<), &gt; (>), &amp; (&), &quot; ("), and &apos; (\').'
      }
    ]
  },
  {
    id: 'CssMinifier',
    slug: 'css-minifier',
    name: 'CSS Minifier',
    category: 'web',
    shortDescription: 'Compress stylesheets by stripping comments, spaces, and redundant characters.',
    metaDescription: 'Free online CSS Minifier. Remove whitespaces and comments from CSS stylesheets to optimize file load speeds.',
    keywords: ['CSS Minifier', 'minify stylesheet', 'compress CSS online', 'remove css comments', 'CSS optimization'],
    icon: 'FileCode',
    howToUse: [
      'Paste raw CSS inside the editor.',
      'Inspect the original vs minified size savings statistics.',
      'Copy the minified CSS from the result block.'
    ],
    faqs: [
      {
        question: 'Does CSS minification affect site functionality?',
        answer: 'No, it only removes decorative styling rules spaces and comments, keeping stylesheet calculations fully readable by browsers.'
      }
    ],
    sections: [
      {
        title: 'Stylesheets Optimization benefits',
        content: 'Minification reduces file transfer size, improving First Contentful Paint (FCP) times and overall page loading speeds.'
      }
    ]
  },
  {
    id: 'JsMinifier',
    slug: 'js-minifier',
    name: 'JS Minifier',
    category: 'web',
    shortDescription: 'Compress JavaScript script blocks by removing comment notations and spaces.',
    metaDescription: 'Free online JS Minifier. Compress JavaScript code blocks, strip debug lines, and optimize scripts performance.',
    keywords: ['JS Minifier', 'minify javascript', 'compress JS online', 'optimize scripts', 'JS comments remover'],
    icon: 'FileCode',
    howToUse: [
      'Paste raw JavaScript code inside the textarea.',
      'Review the compression savings indicator.',
      'Copy the optimized JavaScript string.'
    ],
    faqs: [
      {
        question: 'Will minification break my variable scopes?',
        answer: 'This minifier removes comments and whitespaces safely. For advanced renaming or obfuscation, full bundlers are recommended.'
      }
    ],
    sections: [
      {
        title: 'Script payload optimization',
        content: 'Smaller JS files accelerate code execution speeds and reduce processing delays on mobile devices.'
      }
    ]
  },
  {
    id: 'CssBeautifier',
    slug: 'css-formatter',
    name: 'CSS Formatter',
    category: 'developer',
    shortDescription: 'Format minified or messy CSS with clear indentations and line breaks.',
    metaDescription: 'Free online CSS Formatter. Format stylesheets, add proper spaces and line breaks for clean readability.',
    keywords: ['CSS Formatter', 'CSS beautifier', 'format stylesheet', 'beautify css online', 'clean CSS spacing'],
    icon: 'FileCode',
    howToUse: [
      'Paste messy or minified CSS code.',
      'Configure preferred indent spaces (2 or 4).',
      'Copy the beautified CSS structure.'
    ],
    faqs: [
      {
        question: 'Does formatting CSS change loading speeds?',
        answer: 'Formatting adds spaces, which increases file size slightly. It is recommended during development, while minification is used for production.'
      }
    ],
    sections: [
      {
        title: 'Readability in collaborative development',
        content: 'Standardizing stylesheet indentations makes it much easier for team members to read, edit, and audit CSS files.'
      }
    ]
  },
  {
    id: 'JsBeautifier',
    slug: 'js-formatter',
    name: 'JS Formatter',
    category: 'developer',
    shortDescription: 'Format minified or compressed JavaScript code into readable layouts.',
    metaDescription: 'Free online JS Formatter. Beautify JavaScript script blocks with clean indentations and structured line breaks.',
    keywords: ['JS Formatter', 'JS beautifier', 'format javascript', 'clean JS spacing', 'javascript format tool'],
    icon: 'FileCode',
    howToUse: [
      'Paste messy or minified JS scripts.',
      'Select indent spaces size (2 or 4).',
      'Copy the beautifully formatted JS output.'
    ],
    faqs: [
      {
        question: 'Can this formatter decode obfuscated code?',
        answer: 'It formats layout spacing and indentation, making minified code readable, but it cannot restore original variable names if they were obfuscated.'
      }
    ],
    sections: [
      {
        title: 'JavaScript formatting standards',
        content: 'Clean formatting is essential for debugging and code audits. It organizes block statements, variable declarations, and returns cleanly.'
      }
    ]
  },
  {
    id: 'JSONValidator',
    slug: 'json-validator',
    name: 'JSON Validator',
    category: 'developer',
    shortDescription: 'Validate, parse, check syntax, and format raw JSON schemas for errors.',
    metaDescription: 'Validate JSON structure online. Locate syntax errors, identify character position issues, and format JSON payloads.',
    keywords: ['JSON Validator', 'Validate JSON online', 'JSON parser error checker', 'check JSON syntax', 'clean JSON format'],
    icon: 'Code',
    howToUse: [
      'Type or paste your raw JSON string into the input text area.',
      'Click "Validate JSON" to verify its structure.',
      'Review structural validation output or error line highlights.',
      'Use the format or minify buttons to adjust spacing.'
    ],
    faqs: [
      {
        question: 'How does the JSON validator find errors?',
        answer: 'It runs the JSON parser and catches syntax exceptions, pinpointing the character index and line number where brackets, commas, or quotes mismatch.'
      }
    ],
    sections: [
      {
        title: 'Valid JSON Specifications',
        content: 'JSON keys and string values must be enclosed in double quotes. Single quotes, trailing commas, and unescaped line breaks are common syntax violations.'
      }
    ]
  },
  {
    id: 'JSONCompare',
    slug: 'json-compare',
    name: 'JSON Compare',
    category: 'developer',
    shortDescription: 'Compare and diff two JSON strings side-by-side with sorted-key structural matching.',
    metaDescription: 'Compare two JSON objects side-by-side. Highlights modified, added, and deleted lines with recursive sorted keys.',
    keywords: ['JSON Compare', 'JSON diff tool', 'Compare JSON online', 'Side-by-side JSON match', 'structural JSON diff'],
    icon: 'Columns',
    howToUse: [
      'Paste the original JSON on the left and the comparison JSON on the right.',
      'Click "Compare JSON".',
      'Review side-by-side highlights indicating differences.'
    ],
    faqs: [
      {
        question: 'Does key order affect the JSON comparison?',
        answer: 'No. The tool recursively sorts all keys alphabetically before diffing, ensuring true structural matching regardless of initial order.'
      }
    ],
    sections: [
      {
        title: 'Structural Diffing Benefits',
        content: 'API payloads often contain identical keys in different orders. By sorting key attributes, this comparison validator highlights actual value differences instead of order changes.'
      }
    ]
  },
  {
    id: 'SQLMinifier',
    slug: 'sql-minifier',
    name: 'SQL Minifier',
    category: 'developer',
    shortDescription: 'Minify and compress SQL queries by removing comments and unnecessary spaces.',
    metaDescription: 'Free online SQL Minifier. Remove queries comments, indentations, and extra newlines to compress SQL commands.',
    keywords: ['SQL Minifier', 'Compress SQL query', 'minify SQL online', 'strip SQL comments', 'DB query optimizer'],
    icon: 'Database',
    howToUse: [
      'Paste your raw SQL query into the text area.',
      'Review minification statistics: original vs compressed sizes.',
      'Copy the minified single-line SQL query.'
    ],
    faqs: [
      {
        question: 'Does SQL minification impact query execution?',
        answer: 'No, it only removes aesthetic spacing and comments. Database engines parse minified statements exactly the same as formatted ones.'
      }
    ],
    sections: [
      {
        title: 'Minification Use Cases',
        content: 'Minification is useful for embedding queries in application source code, config files, or reducing logs bandwidth when sending query lists.'
      }
    ]
  },
  {
    id: 'XMLFormatter',
    slug: 'xml-formatter',
    name: 'XML Formatter',
    category: 'developer',
    shortDescription: 'Validate, format, and minify XML nodes with customizable indent sizes.',
    metaDescription: 'Free online XML Formatter. Pretty-print messy XML documents, indent child tags, and check XML syntax.',
    keywords: ['XML Formatter', 'format XML online', 'XML beautifier', 'XML validator', 'minify XML'],
    icon: 'FileCode',
    howToUse: [
      'Paste your raw XML code block.',
      'Select your preferred indentation size (2, 4, or 8 spaces).',
      'Click Format XML to indent or Minify XML to compress tags.'
    ],
    faqs: [
      {
        question: 'Can I format malformed XML?',
        answer: 'No, the formatter validates tags. If there are mismatched tags or unclosed braces, it will display a parser error details block.'
      }
    ],
    sections: [
      {
        title: 'XML Node Hierarchies',
        content: 'XML relies on structured parent-child nests. Formatting enforces visible tag margins to easily trace hierarchy structures in config profiles.'
      }
    ]
  },
  {
    id: 'YAMLFormatter',
    slug: 'yaml-formatter',
    name: 'YAML Formatter',
    category: 'developer',
    shortDescription: 'Beautify, validate, and convert YAML configurations into JSON payloads.',
    metaDescription: 'Format and validate YAML files. Cleanup nested indentation spaces and convert YAML configurations to JSON schemas.',
    keywords: ['YAML Formatter', 'YAML beautifier', 'validate YAML', 'convert YAML to JSON', 'YAML editor'],
    icon: 'FileText',
    howToUse: [
      'Paste your YAML document.',
      'Select indent spaces and click Format YAML.',
      'Use Convert to JSON to translate the config into a JSON string.'
    ],
    faqs: [
      {
        question: 'Why is YAML formatting strict?',
        answer: 'Unlike JSON or XML, YAML uses whitespace indentation to define structures instead of brackets. Missing or extra spaces will break parsing.'
      }
    ],
    sections: [
      {
        title: 'YAML vs JSON Configurations',
        content: 'YAML is highly readable and clean, making it a standard choice for Docker, Kubernetes, and CI/CD pipelines. Converting to JSON helps validate payloads for API payloads.'
      }
    ]
  },
  {
    id: 'HTMLFormatter',
    slug: 'html-formatter',
    name: 'HTML Formatter',
    category: 'developer',
    shortDescription: 'Format, pretty-print, and minify HTML tags and code blocks.',
    metaDescription: 'Free online HTML Formatter. Pretty-print messy HTML structures, indent tags, and compress web page sources.',
    keywords: ['HTML Formatter', 'format HTML online', 'HTML beautifier', 'minify HTML', 'clean tags indent'],
    icon: 'Code',
    howToUse: [
      'Paste raw HTML source.',
      'Click Format HTML to clean nesting or Minify HTML to strip tags spacing.'
    ],
    faqs: [
      {
        question: 'Does this formatter strip comments?',
        answer: 'Minification strips standard HTML comments (`<!-- -->`), while formatting preserves them cleanly.'
      }
    ],
    sections: [
      {
        title: 'Aesthetic Markup Structure',
        content: 'Indentations aid developers in debugging complex div layouts and checking elements closure bounds.'
      }
    ]
  },
  {
    id: 'TimestampConverter',
    slug: 'timestamp-converter',
    name: 'Timestamp Converter',
    category: 'developer',
    shortDescription: 'Convert Unix Epoch timestamps to local time, UTC, and calendar dates.',
    metaDescription: 'Free online Unix Timestamp Converter. Convert seconds/milliseconds epoch timestamps to ISO dates and relative times.',
    keywords: ['Timestamp Converter', 'Unix epoch converter', 'epoch seconds to date', 'millis to ISO', 'convert timestamp'],
    icon: 'Clock',
    howToUse: [
      'Type epoch integers to get UTC, local, and relative date/times.',
      'Use the date-time calendar picker to output equivalent seconds/milliseconds epoch values.'
    ],
    faqs: [
      {
        question: 'What is Unix Epoch time?',
        answer: 'It is the number of seconds that have elapsed since January 1, 1970 (midnight UTC/GMT), not counting leap seconds.'
      }
    ],
    sections: [
      {
        title: 'Seconds vs Milliseconds Timestamps',
        content: 'Standard Unix timestamps use seconds (10 digits). JavaScript and Java applications default to millisecond integers (13 digits).'
      }
    ]
  },
  {
    id: 'CronGenerator',
    slug: 'cron-generator',
    name: 'Cron Generator',
    category: 'developer',
    shortDescription: 'Build standard cron scheduling expressions and predict execution intervals.',
    metaDescription: 'Free online Cron Expression Generator. Set minutes, hours, days, and months, translate cron into plain text, and list next run times.',
    keywords: ['Cron Generator', 'Cron expression builder', 'schedule cron online', 'next execution times', 'cron translator'],
    icon: 'Calendar',
    howToUse: [
      'Select one of the presets or input values in fields.',
      'Review human translation meaning and copy the expression.'
    ],
    faqs: [
      {
        question: 'What do the 5 cron parts represent?',
        answer: 'Standard crontab lines contain: Minute (0-59), Hour (0-23), Day of Month (1-31), Month (1-12), and Day of Week (0-6, where 0 is Sunday).'
      }
    ],
    sections: [
      {
        title: 'Predictive Execution Logs',
        content: 'Verifying next execution dates helps avoid misconfigurations that could fire cron jobs at unintended times.'
      }
    ]
  },
  {
    id: 'LoremIpsumGenerator',
    slug: 'lorem-ipsum-generator',
    name: 'Lorem Ipsum Generator',
    category: 'developer',
    shortDescription: 'Generate standard dummy Lorem Ipsum placeholder text paragraphs or lists.',
    metaDescription: 'Free online Lorem Ipsum Generator. Create custom paragraphs, sentences, words, or lists with optional HTML wrappers.',
    keywords: ['Lorem Ipsum Generator', 'placeholder text generator', 'dummy copy generator', 'lorem ipsum paragraphs', 'HTML lorem list'],
    icon: 'AlignLeft',
    howToUse: [
      'Pick generator type (paragraphs/sentences/words/lists) and drag the quantity slider.',
      'Toggle tags wrapper or starting word constraints.',
      'Copy the output text.'
    ],
    faqs: [
      {
        question: 'Where does Lorem Ipsum come from?',
        answer: 'It is derived from Cicero\'s classical Latin literature "de Finibus Bonorum et Malorum" from 45 BC.'
      }
    ],
    sections: [
      {
        title: 'Designing with Placeholders',
        content: 'Dummy copy helps designers inspect page typographies and layout balances without being distracted by readable context.'
      }
    ]
  },
  {
    id: 'ProfitMarginCalculator',
    slug: 'profit-margin-calculator',
    name: 'Profit Margin Calculator',
    category: 'business',
    shortDescription: 'Calculate Gross Profit, Gross Margin, and Markup based on product costs and selling prices.',
    metaDescription: 'Free online Profit Margin Calculator. Estimate gross profit, margin percentages, and markups easily.',
    keywords: ['Profit Margin Calculator', 'Gross profit margin', 'calculate markup percentage', 'margin calculator online', 'sales profit estimator'],
    icon: 'TrendingUp',
    howToUse: [
      'Enter the unit buying cost (buying price).',
      'Enter the selling price or your target margin percentage.',
      'Review computed gross profit, margin ratio, and markup percentages.'
    ],
    faqs: [
      {
        question: 'What is the difference between margin and markup?',
        answer: 'Margin is calculated as profit divided by selling price. Markup is calculated as profit divided by cost price.'
      }
    ],
    sections: [
      {
        title: 'Importance of Margin Planning',
        content: 'Planning margins ensures operational overheads like shipping, storage, and transaction fees are fully covered before final net returns.'
      }
    ]
  },
  {
    id: 'BreakEvenCalculator',
    slug: 'break-even-calculator',
    name: 'Break-even Calculator',
    category: 'business',
    shortDescription: 'Evaluate operational costs and unit sales price to find your break-even volume.',
    metaDescription: 'Free online Break-even Calculator. Determine critical sales volumes and revenue totals required to cover overheads.',
    keywords: ['Break-even Calculator', 'break-even analysis', 'calculate BEP sales', 'contribution margin', 'pricing calculator'],
    icon: 'BarChart3',
    howToUse: [
      'Input your total fixed operating overheads (rent, salaries).',
      'Input the variable cost of producing a single unit.',
      'Input the selling price per unit to see the break-even parameters.'
    ],
    faqs: [
      {
        question: 'Why is contribution margin ratio important?',
        answer: 'It shows the percentage of sales revenue that goes toward covering fixed costs, helping you understand how scaling volume affects profit margins.'
      }
    ],
    sections: [
      {
        title: 'Understanding Fixed vs Variable Costs',
        content: 'Fixed costs remain constant regardless of sales volumes (e.g. office rent). Variable costs scale proportionally with the number of units produced (e.g. packaging).'
      }
    ]
  },
  {
    id: 'ROICalculator',
    slug: 'roi-calculator',
    name: 'ROI Calculator',
    category: 'business',
    shortDescription: 'Evaluate Return on Investment ratios and annualized compounding gains.',
    metaDescription: 'Free online ROI Calculator. Compute absolute profit gains, percentage returns, and annualized growth rates.',
    keywords: ['ROI Calculator', 'return on investment', 'calculate annualized ROI', 'compounding capital gains', 'investment yield'],
    icon: 'TrendingUp',
    howToUse: [
      'Enter the initial investment amount.',
      'Enter the final returned amount (ending value).',
      'Specify the holding duration in months or years to calculate annualized yields.'
    ],
    faqs: [
      {
        question: 'How is annualized ROI different from absolute ROI?',
        answer: 'Absolute ROI shows total gains from start to end, whereas annualized ROI adjusts returns to show geometric average compounding rates per year.'
      }
    ],
    sections: [
      {
        title: 'Analyzing Investment Efficiency',
        content: 'ROI allows businesses to compare the relative efficiency of different capital allocations (e.g., marketing campaigns vs new hardware purchases).'
      }
    ]
  },
  {
    id: 'InvoiceNumberGenerator',
    slug: 'invoice-number-generator',
    name: 'Invoice Number Generator',
    category: 'business',
    shortDescription: 'Generate customized sequential serial numbers for invoices and billing quotes.',
    metaDescription: 'Free online Invoice Number Generator. Customize prefixes, date stamps, and padded counters to build serial runs in bulk.',
    keywords: ['Invoice Number Generator', 'invoice serial builder', 'generate invoice sequence', 'billing counter tool', 'document number maker'],
    icon: 'Hash',
    howToUse: [
      'Input prefix codes (e.g. INV) and choose separators.',
      'Select date stamp inclusion formats and pad digit width.',
      'Set starting numbers and use the slider to generate lists.'
    ],
    faqs: [
      {
        question: 'Can I copy the generated sequence list?',
        answer: 'Yes, click "Copy List" to copy all generated invoice numbers separated by newlines.'
      }
    ],
    sections: [
      {
        title: 'Standardizing Billing Sequences',
        content: 'Unique, sequential numbering is vital for audit tracking, tax filings, and avoiding double billing in account registers.'
      }
    ]
  },
  {
    id: 'BarcodeGenerator',
    slug: 'barcode-generator',
    name: 'Barcode Generator',
    category: 'business',
    shortDescription: 'Generate standard Code39 barcode labels online and export as PNG files.',
    metaDescription: 'Free online Barcode Generator. Convert alphanumeric strings into high-resolution Code39 barcodes and download them instantly.',
    keywords: ['Barcode Generator', 'create Code39 barcode', 'barcode maker online', 'download barcode PNG', 'sku bar code generator'],
    icon: 'Barcode',
    howToUse: [
      'Input alphanumeric characters representing SKU or product IDs.',
      'Verify barcode scan bars render correctly.',
      'Click Download PNG Barcode to save.'
    ],
    faqs: [
      {
        question: 'What characters does Code39 support?',
        answer: 'It supports uppercase letters (A-Z), numbers (0-9), spaces, and symbols: - . $ / + %'
      }
    ],
    sections: [
      {
        title: 'Barcode Integration in Inventory',
        content: 'Barcode labels streamline warehouses logging, product checkout speeds, and reduce manual entry errors.'
      }
    ]
  },
  {
    id: 'InventoryCalculator',
    slug: 'inventory-calculator',
    name: 'Inventory Calculator',
    category: 'business',
    shortDescription: 'Calculate Cost of Goods Sold (COGS), average inventory valuation, and turnover ratios.',
    metaDescription: 'Free online Inventory Calculator. Evaluate COGS, average inventory values, turnover ratios, and sell-through days.',
    keywords: ['Inventory Calculator', 'calculate COGS', 'inventory turnover ratio', 'average days to sell', 'inventory stock health'],
    icon: 'BarChart2',
    howToUse: [
      'Enter beginning inventory value at the start of your calculation window.',
      'Add the cost of new purchases made.',
      'Subtract ending inventory values to see turnover efficiency.'
    ],
    faqs: [
      {
        question: 'What does a high inventory turnover ratio indicate?',
        answer: 'A higher turnover ratio indicates strong sales velocity and efficient stock management, reducing carrying overheads.'
      }
    ],
    sections: [
      {
        title: 'Managing Inventory Carrying Costs',
        content: 'Holding stock too long ties up working capital and increases warehouse lease costs. Checking average days to sell aids replenishment schedules.'
      }
    ]
  },
  {
    id: 'GSTInvoiceGenerator',
    slug: 'gst-invoice-generator',
    name: 'GST Invoice Generator',
    category: 'business',
    shortDescription: 'Create and download PDF tax invoices with automated GST calculations and state supply choices.',
    metaDescription: 'Free online GST Invoice Generator. Auto-calculate CGST, SGST, and IGST components, and download A4 invoice PDFs.',
    keywords: ['GST Invoice Generator', 'create tax invoice PDF', 'calculate GST invoice', 'same state GST calculator', 'IGST invoice builder'],
    icon: 'FileSpreadsheet',
    howToUse: [
      'Fill in seller details and client details (GSTINs and addresses).',
      'Input invoice metadata, numbers, and specify state supply tax type.',
      'Add line items with quantity, unit rates, and GST percentage tiers, and click Download PDF.'
    ],
    faqs: [
      {
        question: 'Are invoices saved on any server?',
        answer: 'No. All details are processed client-side in browser memory. No data is stored, protecting client privacy.'
      }
    ],
    sections: [
      {
        title: 'Understanding Indian GST Invoice Rules',
        content: 'Same-state transactions must separate tax into CGST (Central) and SGST (State) equally. Inter-state transactions aggregate tax into IGST (Integrated).'
      }
    ]
  },
  {
    id: 'InstagramCaptionGenerator',
    slug: 'instagram-caption-generator',
    name: 'Instagram Caption Generator',
    category: 'social',
    shortDescription: 'Generate creative, platform-optimized captions matching custom vibes and emojis.',
    metaDescription: 'Free online Instagram Caption Generator. Create engaging captions based on vibes, emojis, and hashtags.',
    keywords: ['Instagram caption generator', 'generate captions online', 'creative instagram caption creator', 'funny captions maker', 'social media caption tool'],
    icon: 'Sparkles',
    howToUse: [
      'Enter a description of what your post is about.',
      'Select a tone/vibe (e.g. funny, aesthetic, motivational).',
      'Choose emoji density and toggle hashtag recommendation.',
      'Click Generate and copy your favorite caption.'
    ],
    faqs: [
      {
        question: 'How are captions generated?',
        answer: 'They are built in real-time in your browser from curated vibe templates combined dynamically with your input keywords.'
      }
    ],
    sections: [
      {
        title: 'Crafting Engaging Social Media Captions',
        content: 'A great caption tells a story, adds context, and drives engagement. Matching your caption vibe (aesthetic, funny, professional) to your visual content is key to keeping followers engaged.'
      }
    ]
  },
  {
    id: 'HashtagGenerator',
    slug: 'hashtag-generator',
    name: 'Hashtag Generator',
    category: 'social',
    shortDescription: 'Generate relevant hashtags from keywords and category/niche selectors.',
    metaDescription: 'Free online Hashtag Generator. Get top trending hashtags for Instagram, TikTok, and LinkedIn in-browser.',
    keywords: ['Hashtag Generator', 'trending hashtags', 'niche hashtags', 'instagram tags creator', 'find hashtags online'],
    icon: 'Hash',
    howToUse: [
      'Type or paste your seed keywords in the input box.',
      'Select your niche category (e.g. business, travel, tech).',
      'Click Generate Hashtags to create a list of up to 30 relevant tags.',
      'Deselect tags you do not want and click Copy Selection.'
    ],
    faqs: [
      {
        question: 'Why is there a limit of 30 hashtags?',
        answer: 'Instagram enforces a strict limit of 30 hashtags per post. Going over this limit will prevent your caption from posting.'
      }
    ],
    sections: [
      {
        title: 'How to Use Hashtags Safely and Effectively',
        content: 'Hashtags categorize your content and help platforms distribute it to interested users. Combining broad keywords with highly specific niche tags reaches diverse audiences while maintaining target relevancy.'
      }
    ]
  },
  {
    id: 'BioGenerator',
    slug: 'bio-generator',
    name: 'Bio Generator',
    category: 'social',
    shortDescription: 'Generate professional, creative, or minimal bios for social profiles.',
    metaDescription: 'Free online Bio Generator. Create engaging bios for Instagram, X/Twitter, LinkedIn, and TikTok instantly.',
    keywords: ['Bio Generator', 'create social bio', 'instagram bio maker', 'linkedin headline generator', 'twitter bio ideas'],
    icon: 'Sparkles',
    howToUse: [
      'Select your target platform (Instagram, X, LinkedIn, TikTok).',
      'Input your occupation/title and core skills/interests.',
      'Select a vibe (minimal, creative, funny, professional).',
      'Click Generate Bios and copy the one you like best.'
    ],
    faqs: [
      {
        question: 'What are character limits for bios?',
        answer: 'Instagram allows 150 characters, X (Twitter) allows 160 characters, and TikTok allows 80 characters. The tool displays a warning if you exceed these limits.'
      }
    ],
    sections: [
      {
        title: 'Optimizing Your Social Media Bio',
        content: 'Your bio is your digital elevator pitch. It should quickly convey who you are, what you do, and invite the visitor to take action (like clicking your website link).'
      }
    ]
  },
  {
    id: 'YouTubeThumbnailResizer',
    slug: 'youtube-thumbnail-resizer',
    name: 'YouTube Thumbnail Resizer',
    category: 'social',
    shortDescription: 'Crop and resize images to standard YouTube thumbnail dimensions (1280 x 720).',
    metaDescription: 'Free online YouTube Thumbnail Resizer. Resize and crop photos to exactly 1280 x 720 pixels in-browser.',
    keywords: ['YouTube Thumbnail Resizer', 'crop thumbnail online', 'resize image to 1280x720', 'make youtube thumbnail size', 'image cropper 16:9'],
    icon: 'Image',
    howToUse: [
      'Upload or drag-and-drop your image on the uploader.',
      'Use the scale, rotation, and offset sliders to crop the image.',
      'Choose output format (PNG or JPEG) and set JPEG quality.',
      'Click Download Thumbnail to save.'
    ],
    faqs: [
      {
        question: 'What is the correct size for a YouTube thumbnail?',
        answer: 'YouTube recommends a resolution of 1280 x 720 pixels with a 16:9 aspect ratio and a file size under 2MB.'
      }
    ],
    sections: [
      {
        title: 'Creating High-Converting YouTube Thumbnails',
        content: 'Thumbnails are critical for driving CTR (Click-Through Rate). Ensure your visual focus is centered, text is highly legible, and the resolution is exactly 1280x720 to avoid black margins or cropping issues.'
      }
    ]
  },
  {
    id: 'InstagramPostResizer',
    slug: 'instagram-post-resizer',
    name: 'Instagram Post Resizer',
    category: 'social',
    shortDescription: 'Crop and scale photos to standard Instagram post dimensions (1:1, 4:5, 1.91:1).',
    metaDescription: 'Free online Instagram Post Resizer. Crop and scale images to 1080x1080, 1080x1350, or 1080x566 pixels instantly.',
    keywords: ['Instagram Post Resizer', 'resize photo for instagram', 'crop image 4:5', 'make square photo online', 'crop instagram post'],
    icon: 'Image',
    howToUse: [
      'Upload your image.',
      'Select the target post format (Square 1:1, Portrait 4:5, Landscape 1.91:1).',
      'Select fit or fill crop modes and adjust zoom/offsets.',
      'Click Download Post to save.'
    ],
    faqs: [
      {
        question: 'What resolution does Instagram use for posts?',
        answer: 'Instagram standardizes feed post widths to 1080 pixels. Sizing options are 1080x1080 (square), 1080x1350 (portrait), and 1080x566 (landscape).'
      }
    ],
    sections: [
      {
        title: 'Understanding Feed Layout Ratios',
        content: 'Vertical portrait images (4:5) take up the most screen real estate on mobile devices, making them highly effective for capturing attention compared to square or landscape posts.'
      }
    ]
  },
  {
    id: 'StoryResizer',
    slug: 'story-resizer',
    name: 'Story Resizer',
    category: 'social',
    shortDescription: 'Crop and scale images to standard portrait story dimensions (1080 x 1920).',
    metaDescription: 'Free online Story Resizer. Crop photos to 1080x1920 pixels with letterbox blur backgrounds in-browser.',
    keywords: ['Story Resizer', 'instagram story size', 'resize image 9:16', 'make 1080x1920 online', 'story crop tool'],
    icon: 'Image',
    howToUse: [
      'Upload your image.',
      'Set crop mode to Fit or Fill. Fit mode enables canvas-blurred borders.',
      'Adjust zoom, rotation, and alignment offsets.',
      'Download the cropped 1080x1920 image.'
    ],
    faqs: [
      {
        question: 'What is the correct aspect ratio for Instagram Stories?',
        answer: 'Instagram Stories use a 9:16 aspect ratio, which translates to a resolution of 1080 x 1920 pixels.'
      }
    ],
    sections: [
      {
        title: 'Avoiding Letterboxed Margins in Stories',
        content: 'When uploading horizontal images to stories, they get padded with blank spaces. Our "blur letterbox" mode duplicates and blurs the background to create a clean, modern aesthetic.'
      }
    ]
  },
  {
    id: 'FacebookCoverCreator',
    slug: 'facebook-cover-creator',
    name: 'Facebook Cover Creator',
    category: 'social',
    shortDescription: 'Create custom Facebook cover graphics with text overlays and background sizing.',
    metaDescription: 'Free online Facebook Cover Creator. Overlay title and subtitle banners on photos resized to 820 x 312 pixels.',
    keywords: ['Facebook Cover Creator', 'make fb cover photo', 'design facebook banner', 'facebook header maker', 'fb cover size crop'],
    icon: 'Image',
    howToUse: [
      'Upload a background cover image.',
      'Type in your Header and Subheader text overlays.',
      'Set text color and background darken overlay opacity.',
      'Adjust image zoom and offset positioning, then download.'
    ],
    faqs: [
      {
        question: 'What is the standard Facebook Cover dimension?',
        answer: 'The desktop Facebook cover displays at 820 x 312 pixels, while mobile devices show it at 640 x 360 pixels. The tool exports at 820 x 312.'
      }
    ],
    sections: [
      {
        title: 'Optimizing Facebook Covers for Branding',
        content: 'Your cover photo is the largest branding element on your Facebook page. Adding a clean overlay with your main title or value proposition makes your page look instantly professional.'
      }
    ]
  },
  {
    id: 'LinkedInBannerResizer',
    slug: 'linkedin-banner-resizer',
    name: 'LinkedIn Banner Resizer',
    category: 'social',
    shortDescription: 'Crop and scale images to standard LinkedIn banner dimensions (1584 x 396).',
    metaDescription: 'Free online LinkedIn Banner Resizer. Crop and scale photos to exactly 1584 x 396 pixels with 4:1 aspect ratio.',
    keywords: ['LinkedIn Banner Resizer', 'crop linkedin banner', 'resize image to 1584x396', 'make linkedin header size', 'linkedin banner crop'],
    icon: 'Image',
    howToUse: [
      'Upload a banner photo.',
      'Use scale and offset sliders to crop to the 4:1 aspect ratio frame.',
      'Select output format (PNG/JPEG).',
      'Download your cropped LinkedIn header.'
    ],
    faqs: [
      {
        question: 'What are standard dimensions for a LinkedIn banner?',
        answer: 'The recommended dimensions for a LinkedIn personal profile banner are 1584 x 396 pixels, which is a 4:1 aspect ratio.'
      }
    ],
    sections: [
      {
        title: 'Designing Banners for Professional Profiles',
        content: 'Your LinkedIn header is prime real estate. Ensure key elements are centered and not on the left corner, where your profile avatar picture overlaps the banner.'
      }
    ]
  },
  {
    id: 'WhatsAppLinkGenerator',
    slug: 'whatsapp-link-generator',
    name: 'WhatsApp Link Generator',
    category: 'social',
    shortDescription: 'Generate instant click-to-chat WhatsApp links and scan-ready QR codes.',
    metaDescription: 'Free online WhatsApp Link Generator. Create custom wa.me links with messages and download QR codes.',
    keywords: ['WhatsApp Link Generator', 'create wa.me link', 'whatsapp link with message', 'whatsapp qr code generator', 'click to chat generator'],
    icon: 'MessageSquare',
    howToUse: [
      'Enter your country code (e.g. 91 for India) and phone number.',
      'Type an optional pre-filled message.',
      'Click Generate to create the click-to-chat URL and QR code.',
      'Copy the link, scan to test, or download the QR code as a PNG.'
    ],
    faqs: [
      {
        question: 'How does click-to-chat work?',
        answer: 'WhatsApp\'s wa.me links allow users to start a chat with you instantly without having your phone number saved in their contact list.'
      }
    ],
    sections: [
      {
        title: 'Benefits of Using WhatsApp QR Codes',
        content: 'Adding a WhatsApp QR code or link to your email signatures, business cards, or product flyers makes it incredibly easy for customers to scan and ask questions immediately.'
      }
    ]
  }
];
