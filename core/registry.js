/* Tools registry — single source of truth (plain script, no build step).
   Set ready:true only after a tool page exists in /tools/<slug>.html */
window.TW_CATEGORIES={
  "pdf-image": {
    "label": "PDF & Image",
    "icon": "📄",
    "color": "#ef4444"
  },
  "finance": {
    "label": "Finance",
    "icon": "💰",
    "color": "#10b981"
  },
  "dev": {
    "label": "Developer Tools",
    "icon": "💻",
    "color": "#6366f1"
  },
  "seo-utility": {
    "label": "SEO & Utility",
    "icon": "🔍",
    "color": "#f59e0b"
  },
  "video-audio": {
    "label": "Video & Audio",
    "icon": "🎬",
    "color": "#ec4899"
  }
};
window.TW_TOOLS=[
  {
    "slug": "pdf-to-word",
    "name": "PDF to Word Converter",
    "category": "pdf-image",
    "icon": "📄",
    "description": "Convert PDF files to editable Word (.docx) documents instantly. 100% client-side.",
    "tags": [
      "pdf",
      "word",
      "docx",
      "convert"
    ],
    "ready": false
  },
  {
    "slug": "word-to-pdf",
    "name": "Word to PDF Converter",
    "category": "pdf-image",
    "icon": "📝",
    "description": "Convert Word (.docx) documents to PDF format online. No upload — fully private.",
    "tags": [
      "word",
      "docx",
      "pdf",
      "convert"
    ],
    "ready": false
  },
  {
    "slug": "excel-to-pdf",
    "name": "Excel to PDF Converter",
    "category": "pdf-image",
    "icon": "📊",
    "description": "Convert XLS/XLSX spreadsheets to a formatted PDF table. Preview & download instantly.",
    "tags": [
      "excel",
      "xlsx",
      "xls",
      "pdf",
      "convert",
      "spreadsheet"
    ],
    "ready": false
  },
  {
    "slug": "ppt-to-pdf",
    "name": "PPT to PDF Converter",
    "category": "pdf-image",
    "icon": "📑",
    "description": "Convert PowerPoint PPTX presentations to PDF. One page per slide, client-side.",
    "tags": [
      "ppt",
      "pptx",
      "powerpoint",
      "pdf",
      "convert",
      "slides"
    ],
    "ready": false
  },
  {
    "slug": "pdf-merger",
    "name": "PDF Merger",
    "category": "pdf-image",
    "icon": "🔗",
    "description": "Combine multiple PDF files into one document. Fast, free, no upload.",
    "tags": [
      "pdf",
      "merge",
      "combine",
      "join"
    ],
    "ready": false
  },
  {
    "slug": "pdf-splitter",
    "name": "PDF Splitter",
    "category": "pdf-image",
    "icon": "✂️",
    "description": "Split a PDF into smaller files by page range. Extract specific pages instantly.",
    "tags": [
      "pdf",
      "split",
      "extract",
      "pages"
    ],
    "ready": false
  },
  {
    "slug": "pdf-compressor",
    "name": "PDF Compressor",
    "category": "pdf-image",
    "icon": "🗜️",
    "description": "Reduce PDF file size without losing quality. Download compressed PDF instantly.",
    "tags": [
      "pdf",
      "compress",
      "reduce",
      "size"
    ],
    "ready": false
  },
  {
    "slug": "pdf-page-rotator",
    "name": "PDF Page Rotator",
    "category": "pdf-image",
    "icon": "🔄",
    "description": "Rotate pages in a PDF document. Choose page range and degree of rotation.",
    "tags": [
      "pdf",
      "rotate",
      "pages"
    ],
    "ready": false
  },
  {
    "slug": "pdf-watermark",
    "name": "PDF Watermark Adder",
    "category": "pdf-image",
    "icon": "💧",
    "description": "Add text or image watermark to PDF pages. Set position, opacity and font.",
    "tags": [
      "pdf",
      "watermark",
      "stamp",
      "branding"
    ],
    "ready": false
  },
  {
    "slug": "pdf-to-image",
    "name": "PDF to Image Converter",
    "category": "pdf-image",
    "icon": "🖼️",
    "description": "Convert PDF pages to JPG or PNG images. Download each page as an image.",
    "tags": [
      "pdf",
      "image",
      "jpg",
      "png",
      "convert"
    ],
    "ready": false
  },
  {
    "slug": "pdf-password",
    "name": "PDF Password Protect",
    "category": "pdf-image",
    "icon": "🔒",
    "description": "Add password protection to PDF files. Encrypt your PDF instantly.",
    "tags": [
      "pdf",
      "password",
      "protect",
      "encrypt",
      "secure"
    ],
    "ready": false
  },
  {
    "slug": "image-compressor",
    "name": "Image Compressor",
    "category": "pdf-image",
    "icon": "🗜️",
    "description": "Compress JPG, PNG, and WebP images without visible quality loss.",
    "tags": [
      "image",
      "compress",
      "jpg",
      "png",
      "webp",
      "optimize"
    ],
    "ready": false
  },
  {
    "slug": "image-resizer",
    "name": "Image Resizer",
    "category": "pdf-image",
    "icon": "📐",
    "description": "Resize images to any dimension in pixels or percentage. Free, no upload.",
    "tags": [
      "image",
      "resize",
      "dimensions",
      "scale"
    ],
    "ready": false
  },
  {
    "slug": "image-format-converter",
    "name": "Image Format Converter",
    "category": "pdf-image",
    "icon": "🔁",
    "description": "Convert between JPG, PNG, WebP, and BMP image formats instantly.",
    "tags": [
      "image",
      "convert",
      "jpg",
      "png",
      "webp",
      "format"
    ],
    "ready": false
  },
  {
    "slug": "image-rotator",
    "name": "Image Rotator",
    "category": "pdf-image",
    "icon": "🔃",
    "description": "Rotate images 90°, 180°, 270° or flip horizontally/vertically.",
    "tags": [
      "image",
      "rotate",
      "flip",
      "orientation"
    ],
    "ready": false
  },
  {
    "slug": "image-cropper",
    "name": "Image Cropper",
    "category": "pdf-image",
    "icon": "✂️",
    "description": "Crop images to any size or aspect ratio. Free, client-side image cropper.",
    "tags": [
      "image",
      "crop",
      "trim",
      "cut"
    ],
    "ready": false
  },
  {
    "slug": "image-to-pdf",
    "name": "Image to PDF Converter",
    "category": "pdf-image",
    "icon": "📄",
    "description": "Convert JPG, PNG images to PDF. Combine multiple images into one PDF.",
    "tags": [
      "image",
      "pdf",
      "jpg",
      "png",
      "convert"
    ],
    "ready": false
  },
  {
    "slug": "passport-photo-maker",
    "name": "Passport Photo Maker",
    "category": "pdf-image",
    "icon": "🪪",
    "description": "Create passport-size photos online. Resize to standard sizes (2×2, 35×45mm).",
    "tags": [
      "passport",
      "photo",
      "id",
      "visa",
      "resize"
    ],
    "ready": false
  },
  {
    "slug": "photo-to-sketch",
    "name": "Photo to Sketch",
    "category": "pdf-image",
    "icon": "✏️",
    "description": "Convert photos to pencil sketch or cartoon effect. Download instantly.",
    "tags": [
      "photo",
      "sketch",
      "cartoon",
      "effect",
      "art"
    ],
    "ready": false
  },
  {
    "slug": "heic-to-jpg",
    "name": "HEIC to JPG Converter",
    "category": "pdf-image",
    "icon": "📸",
    "description": "Convert iPhone HEIC photos to JPG format. Fast, free, no upload.",
    "tags": [
      "heic",
      "jpg",
      "iphone",
      "convert",
      "apple"
    ],
    "ready": false
  },
  {
    "slug": "image-to-text",
    "name": "Image to Text (OCR)",
    "category": "pdf-image",
    "icon": "🔤",
    "description": "Extract text from images using OCR. Supports JPG, PNG, PDF scans.",
    "tags": [
      "ocr",
      "image",
      "text",
      "extract",
      "scan"
    ],
    "ready": false
  },
  {
    "slug": "merge-images",
    "name": "Merge Images",
    "category": "pdf-image",
    "icon": "🖼️",
    "description": "Combine multiple images side by side, vertically, or in a grid layout.",
    "tags": [
      "merge",
      "combine",
      "image",
      "collage",
      "jpg"
    ],
    "ready": false
  },
  {
    "slug": "watermark-image",
    "name": "Image Watermark Tool",
    "category": "pdf-image",
    "icon": "🔏",
    "description": "Add text or logo watermark to photos. Batch process multiple images.",
    "tags": [
      "watermark",
      "image",
      "logo",
      "photo",
      "branding"
    ],
    "ready": false
  },
  {
    "slug": "gst-calculator",
    "name": "GST Calculator",
    "category": "finance",
    "icon": "💸",
    "description": "Calculate GST (5%, 12%, 18%, 28%) on any amount instantly. Inclusive & exclusive.",
    "tags": [
      "gst",
      "tax",
      "india",
      "calculator"
    ],
    "ready": true
  },
  {
    "slug": "emi-calculator",
    "name": "EMI Calculator",
    "category": "finance",
    "icon": "🏦",
    "description": "Calculate monthly EMI for home loan, car loan, or personal loan with amortisation.",
    "tags": [
      "emi",
      "loan",
      "interest",
      "home loan",
      "car loan"
    ],
    "ready": true
  },
  {
    "slug": "income-tax-calculator",
    "name": "Income Tax Calculator",
    "category": "finance",
    "icon": "📋",
    "description": "Compare income tax under the old and new regime for FY 2026-27 and see which saves more.",
    "tags": [
      "income tax",
      "tax",
      "india",
      "old regime",
      "new regime"
    ],
    "ready": true
  },
  {
    "slug": "sip-calculator",
    "name": "SIP Calculator",
    "category": "finance",
    "icon": "📈",
    "description": "Calculate returns on your Systematic Investment Plan (SIP). CAGR & wealth gain.",
    "tags": [
      "sip",
      "mutual fund",
      "invest",
      "returns"
    ],
    "ready": true
  },
  {
    "slug": "ppf-calculator",
    "name": "PPF Calculator",
    "category": "finance",
    "icon": "🏦",
    "description": "Calculate Public Provident Fund maturity amount with compounding interest.",
    "tags": [
      "ppf",
      "public provident fund",
      "invest",
      "india"
    ],
    "ready": true
  },
  {
    "slug": "fd-calculator",
    "name": "FD Calculator",
    "category": "finance",
    "icon": "🏧",
    "description": "Calculate maturity amount and interest earned on Fixed Deposits.",
    "tags": [
      "fd",
      "fixed deposit",
      "interest",
      "bank"
    ],
    "ready": true
  },
  {
    "slug": "compound-interest",
    "name": "Compound Interest Calculator",
    "category": "finance",
    "icon": "📈",
    "description": "Calculate compound interest with different compounding frequencies.",
    "tags": [
      "compound interest",
      "interest",
      "calculator",
      "investment"
    ],
    "ready": true
  },
  {
    "slug": "simple-interest",
    "name": "Simple Interest Calculator",
    "category": "finance",
    "icon": "🧮",
    "description": "Calculate simple interest for any principal, rate, and time period.",
    "tags": [
      "simple interest",
      "interest",
      "calculator"
    ],
    "ready": true
  },
  {
    "slug": "hra-calculator",
    "name": "HRA Calculator",
    "category": "finance",
    "icon": "🏠",
    "description": "Calculate House Rent Allowance exemption under Indian income tax rules.",
    "tags": [
      "hra",
      "house rent allowance",
      "tax",
      "india"
    ],
    "ready": false
  },
  {
    "slug": "gratuity-calculator",
    "name": "Gratuity Calculator",
    "category": "finance",
    "icon": "💼",
    "description": "Calculate gratuity amount as per Indian Payment of Gratuity Act.",
    "tags": [
      "gratuity",
      "salary",
      "india",
      "retirement"
    ],
    "ready": false
  },
  {
    "slug": "salary-calculator",
    "name": "CTC to In-hand Salary Calculator",
    "category": "finance",
    "icon": "💰",
    "description": "Break down CTC into in-hand salary with PF, professional tax, and HRA.",
    "tags": [
      "salary",
      "ctc",
      "in-hand",
      "pf",
      "india"
    ],
    "ready": false
  },
  {
    "slug": "age-calculator",
    "name": "Age Calculator",
    "category": "finance",
    "icon": "🎂",
    "description": "Calculate your exact age in years, months, and days from date of birth.",
    "tags": [
      "age",
      "date",
      "birthday",
      "calculator"
    ],
    "ready": true
  },
  {
    "slug": "percentage-calculator",
    "name": "Percentage Calculator",
    "category": "finance",
    "icon": "%",
    "description": "Calculate percentage, percentage increase/decrease and what % of a number.",
    "tags": [
      "percentage",
      "math",
      "calculator",
      "%"
    ],
    "ready": true
  },
  {
    "slug": "discount-calculator",
    "name": "Discount Calculator",
    "category": "finance",
    "icon": "🏷️",
    "description": "Calculate discounted price, savings amount, and discount percentage instantly.",
    "tags": [
      "discount",
      "sale",
      "price",
      "calculator"
    ],
    "ready": true
  },
  {
    "slug": "bmi-calculator",
    "name": "BMI Calculator",
    "category": "finance",
    "icon": "⚖️",
    "description": "Calculate your Body Mass Index and check ideal weight range for your height.",
    "tags": [
      "bmi",
      "health",
      "weight",
      "body mass index"
    ],
    "ready": false
  },
  {
    "slug": "sukanya-samriddhi",
    "name": "Sukanya Samriddhi Calculator",
    "category": "finance",
    "icon": "👧",
    "description": "Calculate Sukanya Samriddhi Yojana maturity amount with current interest rate.",
    "tags": [
      "sukanya samriddhi",
      "ssy",
      "invest",
      "india",
      "girl child"
    ],
    "ready": false
  },
  {
    "slug": "home-loan",
    "name": "Home Loan Eligibility Calculator",
    "category": "finance",
    "icon": "🏡",
    "description": "Check home loan eligibility based on income, existing EMIs and interest rate.",
    "tags": [
      "home loan",
      "eligibility",
      "mortgage",
      "bank"
    ],
    "ready": false
  },
  {
    "slug": "loan-prepayment",
    "name": "Loan Prepayment Calculator",
    "category": "finance",
    "icon": "💳",
    "description": "Calculate interest saved and new tenure after prepaying part of your loan.",
    "tags": [
      "loan",
      "prepayment",
      "interest saved",
      "emi"
    ],
    "ready": false
  },
  {
    "slug": "nps-calculator",
    "name": "NPS Calculator",
    "category": "finance",
    "icon": "🧓",
    "description": "Calculate National Pension System corpus and monthly pension at retirement.",
    "tags": [
      "nps",
      "pension",
      "retirement",
      "india"
    ],
    "ready": false
  },
  {
    "slug": "retirement-corpus",
    "name": "Retirement Corpus Calculator",
    "category": "finance",
    "icon": "🏖️",
    "description": "Calculate how much corpus you need to retire comfortably. India-focused.",
    "tags": [
      "retirement",
      "corpus",
      "financial planning",
      "invest"
    ],
    "ready": false
  },
  {
    "slug": "currency-converter",
    "name": "Currency Converter",
    "category": "finance",
    "icon": "💱",
    "description": "Convert between 150+ world currencies with live exchange rates.",
    "tags": [
      "currency",
      "convert",
      "exchange rate",
      "forex",
      "usd",
      "inr"
    ],
    "ready": false
  },
  {
    "slug": "json-formatter",
    "name": "JSON Formatter & Validator",
    "category": "dev",
    "icon": "🔧",
    "description": "Format, validate, and beautify JSON data. Highlight errors and pretty-print.",
    "tags": [
      "json",
      "format",
      "validate",
      "beautify",
      "developer"
    ],
    "ready": false
  },
  {
    "slug": "json-csv",
    "name": "JSON ↔ CSV Converter",
    "category": "dev",
    "icon": "🔄",
    "description": "Convert JSON to CSV and CSV to JSON. Download converted file instantly.",
    "tags": [
      "json",
      "csv",
      "convert",
      "data"
    ],
    "ready": false
  },
  {
    "slug": "base64",
    "name": "Base64 Encoder / Decoder",
    "category": "dev",
    "icon": "🔐",
    "description": "Encode or decode text and files using Base64. Supports text and binary files.",
    "tags": [
      "base64",
      "encode",
      "decode",
      "developer"
    ],
    "ready": false
  },
  {
    "slug": "url-encoder",
    "name": "URL Encoder / Decoder",
    "category": "dev",
    "icon": "🔗",
    "description": "Encode or decode URLs and query strings for safe web transmission.",
    "tags": [
      "url",
      "encode",
      "decode",
      "uri"
    ],
    "ready": false
  },
  {
    "slug": "css-html-minifier",
    "name": "HTML & CSS Minifier",
    "category": "dev",
    "icon": "⚡",
    "description": "Minify HTML and CSS files to reduce page size and improve load speed.",
    "tags": [
      "html",
      "css",
      "minify",
      "compress",
      "developer"
    ],
    "ready": false
  },
  {
    "slug": "js-minifier",
    "name": "JS Minifier / Beautifier",
    "category": "dev",
    "icon": "📜",
    "description": "Minify or beautify JavaScript code. Reduce bundle size instantly.",
    "tags": [
      "javascript",
      "js",
      "minify",
      "beautify",
      "developer"
    ],
    "ready": false
  },
  {
    "slug": "regex-tester",
    "name": "Regex Tester",
    "category": "dev",
    "icon": "🔍",
    "description": "Test regular expressions live with match highlighting and flags.",
    "tags": [
      "regex",
      "regular expression",
      "test",
      "developer"
    ],
    "ready": false
  },
  {
    "slug": "uuid-generator",
    "name": "UUID Generator",
    "category": "dev",
    "icon": "🆔",
    "description": "Generate random UUIDs (v1, v4) instantly. Bulk generation supported.",
    "tags": [
      "uuid",
      "guid",
      "generate",
      "v4",
      "developer"
    ],
    "ready": false
  },
  {
    "slug": "hash-generator",
    "name": "Hash Generator",
    "category": "dev",
    "icon": "#️⃣",
    "description": "Generate MD5, SHA-1, SHA-256, SHA-512 hashes of any text or file.",
    "tags": [
      "hash",
      "md5",
      "sha256",
      "sha1",
      "developer"
    ],
    "ready": false
  },
  {
    "slug": "markdown-to-html",
    "name": "Markdown to HTML",
    "category": "dev",
    "icon": "✍️",
    "description": "Convert Markdown to HTML with live preview. Copy or download output.",
    "tags": [
      "markdown",
      "html",
      "convert",
      "preview",
      "developer"
    ],
    "ready": false
  },
  {
    "slug": "diff-checker",
    "name": "Diff Checker",
    "category": "dev",
    "icon": "🔀",
    "description": "Compare two blocks of text and highlight additions and deletions.",
    "tags": [
      "diff",
      "compare",
      "text",
      "code"
    ],
    "ready": false
  },
  {
    "slug": "lorem-ipsum",
    "name": "Lorem Ipsum Generator",
    "category": "dev",
    "icon": "📄",
    "description": "Generate Lorem Ipsum placeholder text by paragraphs, sentences or words.",
    "tags": [
      "lorem ipsum",
      "placeholder",
      "text",
      "dummy"
    ],
    "ready": false
  },
  {
    "slug": "password-generator",
    "name": "Password Generator",
    "category": "dev",
    "icon": "🔑",
    "description": "Generate strong, secure random passwords with custom length and character sets.",
    "tags": [
      "password",
      "security",
      "generate",
      "random"
    ],
    "ready": false
  },
  {
    "slug": "qr-code-generator",
    "name": "QR Code Generator",
    "category": "dev",
    "icon": "📱",
    "description": "Generate QR codes for URLs, text, email, phone. Download as PNG.",
    "tags": [
      "qr",
      "qr code",
      "generate",
      "barcode"
    ],
    "ready": false
  },
  {
    "slug": "barcode-generator",
    "name": "Barcode Generator",
    "category": "dev",
    "icon": "📊",
    "description": "Generate 1D barcodes (Code128, EAN, UPC) and download as SVG/PNG.",
    "tags": [
      "barcode",
      "code128",
      "ean",
      "upc",
      "generate"
    ],
    "ready": false
  },
  {
    "slug": "timestamp-converter",
    "name": "Timestamp Converter",
    "category": "dev",
    "icon": "⏱️",
    "description": "Convert Unix timestamps to human-readable dates and vice versa.",
    "tags": [
      "timestamp",
      "unix",
      "date",
      "convert",
      "epoch"
    ],
    "ready": false
  },
  {
    "slug": "cron-generator",
    "name": "Cron Expression Generator",
    "category": "dev",
    "icon": "⏰",
    "description": "Generate and explain cron expressions visually. Test next run times.",
    "tags": [
      "cron",
      "schedule",
      "expression",
      "linux",
      "developer"
    ],
    "ready": false
  },
  {
    "slug": "xml-formatter",
    "name": "XML Formatter",
    "category": "dev",
    "icon": "📋",
    "description": "Format and beautify XML documents. Validate XML syntax online.",
    "tags": [
      "xml",
      "format",
      "validate",
      "beautify",
      "developer"
    ],
    "ready": false
  },
  {
    "slug": "yaml-to-json",
    "name": "YAML ↔ JSON Converter",
    "category": "dev",
    "icon": "🔄",
    "description": "Convert YAML to JSON and JSON to YAML. Validate both formats.",
    "tags": [
      "yaml",
      "json",
      "convert",
      "developer",
      "config"
    ],
    "ready": false
  },
  {
    "slug": "word-counter",
    "name": "Word Counter",
    "category": "dev",
    "icon": "🔢",
    "description": "Count words, characters, sentences, paragraphs and reading time.",
    "tags": [
      "word",
      "count",
      "text",
      "character",
      "reading time"
    ],
    "ready": false
  },
  {
    "slug": "character-counter",
    "name": "Character Counter",
    "category": "dev",
    "icon": "Aₙ",
    "description": "Count characters with and without spaces. Includes word and line count.",
    "tags": [
      "character",
      "count",
      "text",
      "limit"
    ],
    "ready": false
  },
  {
    "slug": "case-converter",
    "name": "Case Converter",
    "category": "dev",
    "icon": "Aa",
    "description": "Convert text between UPPER, lower, Title Case, camelCase & snake_case.",
    "tags": [
      "case",
      "text",
      "convert",
      "upper",
      "lower",
      "camel"
    ],
    "ready": false
  },
  {
    "slug": "color-converter",
    "name": "Color Picker / Converter",
    "category": "dev",
    "icon": "🎨",
    "description": "Pick colors and convert between HEX, RGB, HSL, HSV formats.",
    "tags": [
      "color",
      "hex",
      "rgb",
      "hsl",
      "picker",
      "convert"
    ],
    "ready": false
  },
  {
    "slug": "text-diff-checker",
    "name": "Text Diff Checker",
    "category": "dev",
    "icon": "🔀",
    "description": "Compare two texts side by side with inline diff highlighting.",
    "tags": [
      "diff",
      "compare",
      "text",
      "code",
      "changes"
    ],
    "ready": false
  },
  {
    "slug": "slug-generator",
    "name": "Slug Generator",
    "category": "seo-utility",
    "icon": "🔗",
    "description": "Convert any text to a clean, SEO-friendly URL slug instantly.",
    "tags": [
      "slug",
      "url",
      "seo",
      "permalink"
    ],
    "ready": false
  },
  {
    "slug": "meta-tag-generator",
    "name": "Meta Tag Generator",
    "category": "seo-utility",
    "icon": "🏷️",
    "description": "Generate HTML meta tags for SEO, Open Graph and Twitter Card instantly.",
    "tags": [
      "meta",
      "seo",
      "og",
      "twitter card",
      "html"
    ],
    "ready": false
  },
  {
    "slug": "readability-checker",
    "name": "Readability Checker",
    "category": "seo-utility",
    "icon": "📖",
    "description": "Check Flesch reading ease, grade level and reading time for any text.",
    "tags": [
      "readability",
      "flesch",
      "reading ease",
      "seo",
      "content"
    ],
    "ready": false
  },
  {
    "slug": "unit-converter",
    "name": "Unit Converter",
    "category": "seo-utility",
    "icon": "📏",
    "description": "Convert length, weight, temperature, speed, area and volume units.",
    "tags": [
      "unit",
      "convert",
      "length",
      "weight",
      "temperature"
    ],
    "ready": false
  },
  {
    "slug": "gradient-generator",
    "name": "CSS Gradient Generator",
    "category": "seo-utility",
    "icon": "🌈",
    "description": "Generate CSS gradients visually. Linear, radial and conic gradients.",
    "tags": [
      "gradient",
      "css",
      "design",
      "color",
      "background"
    ],
    "ready": false
  },
  {
    "slug": "title-case-generator",
    "name": "Title Case Generator",
    "category": "seo-utility",
    "icon": "🔠",
    "description": "Convert any text to proper Title Case following style guides (APA, AP, Chicago).",
    "tags": [
      "title case",
      "headline",
      "seo",
      "text",
      "converter"
    ],
    "ready": false
  },
  {
    "slug": "number-to-words",
    "name": "Number to Words Converter",
    "category": "seo-utility",
    "icon": "🔢",
    "description": "Convert numbers to words in Indian (lakh, crore) and international system.",
    "tags": [
      "number",
      "words",
      "convert",
      "lakh",
      "crore",
      "india"
    ],
    "ready": false
  },
  {
    "slug": "random-number",
    "name": "Random Number Generator",
    "category": "seo-utility",
    "icon": "🎲",
    "description": "Generate random numbers within any range. Single or bulk generation.",
    "tags": [
      "random",
      "number",
      "generate",
      "dice"
    ],
    "ready": false
  },
  {
    "slug": "random-name-picker",
    "name": "Random Name / Team Picker",
    "category": "seo-utility",
    "icon": "👥",
    "description": "Pick random names or split people into teams. Great for classrooms & standups.",
    "tags": [
      "random",
      "name",
      "picker",
      "team",
      "group"
    ],
    "ready": false
  },
  {
    "slug": "favicon-generator",
    "name": "Favicon Generator",
    "category": "seo-utility",
    "icon": "⭐",
    "description": "Generate favicon from text, emoji or image. Download as ICO/PNG.",
    "tags": [
      "favicon",
      "icon",
      "logo",
      "website",
      "generate"
    ],
    "ready": false
  },
  {
    "slug": "screen-resolution",
    "name": "Screen Resolution Checker",
    "category": "seo-utility",
    "icon": "🖥️",
    "description": "Check your current screen resolution, viewport size and pixel ratio.",
    "tags": [
      "screen",
      "resolution",
      "viewport",
      "display",
      "monitor"
    ],
    "ready": false
  },
  {
    "slug": "signature-generator",
    "name": "Email Signature Generator",
    "category": "seo-utility",
    "icon": "✍️",
    "description": "Create professional HTML email signatures. Preview and copy instantly.",
    "tags": [
      "signature",
      "email",
      "html",
      "professional"
    ],
    "ready": false
  },
  {
    "slug": "text-to-speech",
    "name": "Text to Speech",
    "category": "seo-utility",
    "icon": "🔊",
    "description": "Convert any text to speech using browser TTS. Choose voice and speed.",
    "tags": [
      "text to speech",
      "tts",
      "voice",
      "read aloud",
      "accessibility"
    ],
    "ready": false
  },
  {
    "slug": "invoice-generator",
    "name": "Invoice Generator",
    "category": "seo-utility",
    "icon": "🧾",
    "description": "Create professional invoices and download as PDF. Add logo, tax, items.",
    "tags": [
      "invoice",
      "pdf",
      "billing",
      "freelance",
      "business"
    ],
    "ready": false
  },
  {
    "slug": "video-to-mp3",
    "name": "Video to MP3 Converter",
    "category": "video-audio",
    "icon": "🎵",
    "description": "Extract audio from video files and convert to MP3. 100% client-side FFmpeg.",
    "tags": [
      "video",
      "mp3",
      "audio",
      "extract",
      "convert"
    ],
    "ready": false
  },
  {
    "slug": "video-compressor",
    "name": "Video Compressor",
    "category": "video-audio",
    "icon": "🎬",
    "description": "Compress video files to reduce size without significant quality loss.",
    "tags": [
      "video",
      "compress",
      "reduce",
      "size",
      "ffmpeg"
    ],
    "ready": false
  },
  {
    "slug": "gif-maker",
    "name": "GIF Maker",
    "category": "video-audio",
    "icon": "🎞️",
    "description": "Convert video clips to animated GIF. Set start time, duration and framerate.",
    "tags": [
      "gif",
      "video",
      "animate",
      "convert"
    ],
    "ready": false
  },
  {
    "slug": "video-trimmer",
    "name": "Video Trimmer",
    "category": "video-audio",
    "icon": "✂️",
    "description": "Trim and cut video files to any time range. Fast client-side processing.",
    "tags": [
      "video",
      "trim",
      "cut",
      "clip"
    ],
    "ready": false
  },
  {
    "slug": "audio-trimmer",
    "name": "Audio Trimmer",
    "category": "video-audio",
    "icon": "🎙️",
    "description": "Trim audio files (MP3, WAV) to any start/end time. No upload required.",
    "tags": [
      "audio",
      "trim",
      "cut",
      "mp3",
      "wav"
    ],
    "ready": false
  },
  {
    "slug": "screen-recorder",
    "name": "Screen Recorder",
    "category": "video-audio",
    "icon": "📹",
    "description": "Record your screen directly in the browser. Download as WebM. No install.",
    "tags": [
      "screen",
      "record",
      "capture",
      "screencast",
      "webm"
    ],
    "ready": false
  },
  {
    "slug": "ip-lookup",
    "name": "IP Address Lookup",
    "category": "video-audio",
    "icon": "🌐",
    "description": "Look up geolocation and ISP info for any IP address or your own public IP.",
    "tags": [
      "ip",
      "address",
      "lookup",
      "geolocation",
      "network"
    ],
    "ready": false
  },
  {
    "slug": "crypto-price-tracker",
    "name": "Crypto Price Tracker",
    "category": "video-audio",
    "icon": "₿",
    "description": "Track live cryptocurrency prices (Bitcoin, Ethereum, and more) via CoinGecko.",
    "tags": [
      "crypto",
      "bitcoin",
      "price",
      "tracker",
      "ethereum",
      "coingecko"
    ],
    "ready": false
  },
  {
    "slug": "rent-receipt",
    "name": "Rent Receipt Generator",
    "category": "video-audio",
    "icon": "🏠",
    "description": "Generate professional rent receipts and download as PDF. India-ready.",
    "tags": [
      "rent",
      "receipt",
      "pdf",
      "landlord",
      "tenant",
      "india"
    ],
    "ready": false
  },
  {
    "slug": "salary-slip",
    "name": "Salary Slip Generator",
    "category": "video-audio",
    "icon": "💼",
    "description": "Generate professional salary slips / pay stubs and download as PDF.",
    "tags": [
      "salary",
      "slip",
      "payslip",
      "pdf",
      "payroll"
    ],
    "ready": false
  },
  {
    "slug": "website-speed-test",
    "name": "Website Speed Test",
    "category": "video-audio",
    "icon": "⚡",
    "description": "Check Google PageSpeed Insights scores — Performance, Accessibility, SEO & Core Web Vitals.",
    "tags": [
      "speed",
      "pagespeed",
      "performance",
      "lighthouse",
      "cwv",
      "seo"
    ],
    "ready": false
  },
  {
    "slug": "whois-lookup",
    "name": "WHOIS Lookup",
    "category": "video-audio",
    "icon": "🔎",
    "description": "Find domain registration info: registrar, creation/expiry dates, nameservers.",
    "tags": [
      "whois",
      "domain",
      "registrar",
      "dns",
      "lookup",
      "rdap"
    ],
    "ready": false
  }
];
