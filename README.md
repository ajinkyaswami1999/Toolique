# Toolique

**Toolique** is a production-ready, client-side-only web application built with **React**, **Vite**, **TypeScript**, and **Tailwind CSS**. It provides 12 high-performance, Indian-focused calculators and utility tools useful for SEO optimization and AdSense monetization.

---

## 🔒 100% In-Browser Privacy
All logic (including financial calculations, SQL/JSON formatting, QR code rendering, and image compression) is computed **100% locally in the user's web browser**. No data is ever transmitted, monitored, or saved on any external servers.

---

## 🛠️ Supported Tools
1. **GST Calculator**: Add/remove GST splits (CGST & SGST) under standard rates.
2. **SIP Calculator**: Projects compounding growth of mutual fund systematic investment plans.
3. **EMI Calculator**: Home, car, and personal loan installments and repayment amortization.
4. **Age Calculator**: Detailed age breakdown down to minutes with countdowns to next birthdays.
5. **Experience Calculator**: Add multiple jobs to calculate cumulative professional durations.
6. **SQL Formatter**: Formats, indents, and minifies SQL database queries.
7. **JSON Formatter & Validator**: Formats, beautifies, and validates JSON with live error pointers.
8. **QR Code Generator**: Generates custom colored static QR codes downloadable as PNG.
9. **Image Compressor**: Downscales and compresses JPEG, PNG, and WebP images inside the canvas.
10. **UPI QR Generator**: Renders NPCI-standard payment QR codes scanning GPay, PhonePe, and Paytm.
11. **TDS Calculator**: Computes Indian TDS tax liability under sections 194C, 194J, 194I, 194H.
12. **In-Hand Salary Calculator**: Computes net monthly take-home salary comparing New (FY 2024-25) vs Old regimes.

---

## 📁 Folder Structure
```
src/
  components/      # Shared components (Layout, Header, Footer, SEO, Ad Slots, Icon Mapper)
  data/            # Static datasets (Tools list config, categories config)
  pages/           # Main route viewports (Home, ToolPage loader, About, Contact, Policies)
  routes/          # Routing config with React Router DOM
  tools/           # 12 core browser-based tools UI & math calculations
  utils/           # Calculations and string helpers
```

---

## ⚙️ Development Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Launch Local Dev Server
```bash
npm run dev
```

### 3. Build Production Bundle
To compile TypeScript and bundle assets for optimized hosting:
```bash
npm run build
```

---

## 🌐 Production Deployment
Since the app has no backend or database dependencies, it can be deployed on any static host:
- **Vercel** / **Netlify**: Ensure you configure a URL redirect rule in `vercel.json` or `_redirects` to route all page requests to `index.html` (since `BrowserRouter` handles SPA routing on the client side).
- **GitHub Pages**: If deploying to GitHub Pages without server-side redirects, you can swap `BrowserRouter` with `HashRouter` inside `src/App.tsx` to prevent browser refresh 404s.

