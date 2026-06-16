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
  category: 'finance' | 'developer' | 'image' | 'utility' | 'civil' | 'architecture' | 'interior';
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
,
  {
  "id": "ConstructionCostCalculator",
  "slug": "construction-cost-calculator",
  "name": "Construction Cost Calculator",
  "category": "civil",
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
}
];
