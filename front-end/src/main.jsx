import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { GlobalStyles } from './styles/GlobalStyles'
import { ThemeModeProvider } from './theme/ThemeModeProvider.jsx'
import { UserProvider } from './context/UserContext.jsx'

// Generate favicon that exactly matches the TopNav BrandGlyph
;(function setFavicon() {
  try {
    const size = 64;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Rounded rect — same border-radius ratio as BrandGlyph (10px on 32px = 31.25%)
    const r = 20;
    ctx.beginPath();
    ctx.moveTo(r, 0);
    ctx.arcTo(size, 0, size, size, r);
    ctx.arcTo(size, size, 0, size, r);
    ctx.arcTo(0, size, 0, 0, r);
    ctx.arcTo(0, 0, size, 0, r);
    ctx.closePath();

    // 135° gradient matching theme.colors.gradient.primary
    const grad = ctx.createLinearGradient(0, 0, size, size);
    grad.addColorStop(0,    '#427FD4');
    grad.addColorStop(0.35, '#3D81EF');
    grad.addColorStop(0.70, '#7EC1F6');
    grad.addColorStop(1,    '#C4B8FC');
    ctx.fillStyle = grad;
    ctx.fill();

    // White bold "S" centred — same as BrandGlyph text
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 36px Inter, -apple-system, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('S', size / 2, size / 2 + 1);

    const link = document.querySelector("link[rel~='icon']") || document.createElement('link');
    link.rel = 'icon';
    link.type = 'image/png';
    link.href = canvas.toDataURL('image/png');
    document.head.appendChild(link);
  } catch (_) { /* silently fall back to static SVG */ }
})()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeModeProvider>
        <UserProvider>
          <GlobalStyles />
          <App />
        </UserProvider>
      </ThemeModeProvider>
    </BrowserRouter>
  </React.StrictMode>,
)

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}));
}

