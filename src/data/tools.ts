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
  category: 'finance' | 'developer' | 'image' | 'utility';
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
    category: 'utility',
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
    category: 'utility',
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
    category: 'utility',
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
    category: 'finance',
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
    category: 'utility',
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
    category: 'utility',
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
    category: 'utility',
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
    category: 'utility',
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
    category: 'utility',
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
];
