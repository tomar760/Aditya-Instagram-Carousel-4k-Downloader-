/* ===== STATE ===== */
let canvases      = [];
let selectedFont  = 'Poppins';
let selectedScale = 4;
let selectedW     = 1080;
let selectedH     = 1350;
let selectedFmt   = 'image/png';
let downloadCount = 0;

/* ===== INIT ===== */
document.addEventListener('DOMContentLoaded', () => {
  initParticles();
  initTextareaCounter();
});

/* ===== PARTICLES ===== */
function initParticles() {
  const wrap = document.getElementById('particles');
  const colors = ['#7c3aed','#06b6d4','#10b981','#f59e0b','#a855f7'];

  for (let i = 0; i < 35; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 5 + 2;
    const color = colors[Math.floor(Math.random() * colors.length)];
    p.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      left: ${Math.random() * 100}%;
      background: ${color};
      box-shadow: 0 0 ${size * 3}px ${color};
      animation-duration: ${Math.random() * 15 + 10}s;
      animation-delay: ${Math.random() * 10}s;
    `;
    wrap.appendChild(p);
  }
}

/* ===== TEXTAREA COUNTER ===== */
function initTextareaCounter() {
  const ta = document.getElementById('htmlInput');
  const counter = document.getElementById('charCount');
  ta.addEventListener('input', () => {
    const len = ta.value.length;
    counter.textContent = len > 0 ? `${(len/1000).toFixed(1)}k chars` : '0 chars';
  });
}

/* ===== THEME TOGGLE ===== */
function toggleTheme() {
  document.body.classList.toggle('light');
  const icon = document.getElementById('themeIcon');
  icon.className = document.body.classList.contains('light')
    ? 'fa-solid fa-sun'
    : 'fa-solid fa-moon';
  showToast(document.body.classList.contains('light') ? '☀️ Light mode' : '🌙 Dark mode', 'info', 1500);
}

/* ===== FONT SELECTOR ===== */
function selectFont(el) {
  document.querySelectorAll('.font-chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  selectedFont = el.dataset.font;

  const prev = document.getElementById('fontPreviewText');
  const label = document.getElementById('fontNameLabel');

  prev.style.opacity = '0';
  prev.style.transform = 'translateY(10px)';

  setTimeout(() => {
    prev.style.fontFamily = `'${selectedFont}'`;
    label.textContent = selectedFont;
    prev.style.opacity = '1';
    prev.style.transform = 'translateY(0)';
    prev.style.transition = 'all 0.4s ease';
  }, 200);

  showToast(`Font: ${selectedFont}`, 'info', 1500);
}

/* ===== SCALE SELECTOR ===== */
function selectScale(el) {
  document.querySelectorAll('.scale-chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  selectedScale = parseInt(el.dataset.scale);
  showToast(`Quality: ${selectedScale}x`, 'info', 1500);
}

/* ===== SIZE SELECTOR ===== */
function selectSize(el) {
  document.querySelectorAll('.size-chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  selectedW = parseInt(el.dataset.w);
  selectedH = parseInt(el.dataset.h);
  showToast(`Size: ${selectedW}×${selectedH}`, 'info', 1500);
}

/* ===== FORMAT SELECTOR ===== */
function selectFmt(el) {
  document.querySelectorAll('.fmt-chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  selectedFmt = el.dataset.fmt;
  showToast(`Format: ${el.textContent}`, 'info', 1500);
}

/* ===== TEXTAREA HELPERS ===== */
async function pasteClipboard() {
  try {
    const text = await navigator.clipboard.readText();
    document.getElementById('htmlInput').value = text;
    document.getElementById('htmlInput').dispatchEvent(new Event('input'));
    showToast('Pasted from clipboard!', 'success');
  } catch (e) {
    showToast('Clipboard access denied', 'error');
  }
}

function clearInput() {
  document.getElementById('htmlInput').value = '';
  document.getElementById('htmlInput').dispatchEvent(new Event('input'));
  showToast('Input cleared', 'info', 1500);
}

/* ===== TOAST ===== */
function showToast(msg, type = 'info', duration = 3000) {
  const icons = { success:'✅', error:'❌', info:'ℹ️', warning:'⚠️' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${icons[type]}</span><span>${msg}</span>`;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'toastOut 0.4s ease forwards';
    setTimeout(() => toast.remove(), 400);
  }, duration);
}

/* ===== PROGRESS ===== */
function setProgress(current, total) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;
  document.getElementById('progressFill').style.width = pct + '%';
  document.getElementById('progressPct').textContent = pct + '%';
}

function showProgress(msg) {
  document.getElementById('progressWrap').classList.remove('hidden');
  document.getElementById('statusText').textContent = msg;
}

function hideProgress() {
  document.getElementById('progressWrap').classList.add('hidden');
  setProgress(0, 1);
}

/* ===== INJECT FONT INTO IFRAME ===== */
function injectFont(iframeDoc, font) {
  const link = iframeDoc.createElement('link');
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${font.replace(/ /g,'+')}:wght@400;600;700;800&display=swap`;
  iframeDoc.head.appendChild(link);

  const style = iframeDoc.createElement('style');
  style.textContent = `
    * { font-family: '${font}', sans-serif !important; }
  `;
  iframeDoc.head.appendChild(style);
}

/* ===== LOAD SLIDES ===== */
async function loadSlides() {
  const container  = document.getElementById('slidesContainer');
  const selectRow  = document.getElementById('selectAllRow');
  const emptyDef   = document.getElementById('emptyDefault');

  container.innerHTML = '';
  selectRow.classList.add('hidden');
  canvases = [];

  const html = document.getElementById('htmlInput').value.trim();
  if (!html) {
    showToast('Please paste your HTML first!', 'warning');
    return;
  }

  emptyDef.style.display = 'none';
  showProgress('🔄 Setting up renderer...');

  /* --- iframe --- */
  const iframe = document.createElement('iframe');
  iframe.style.cssText = `
    position: fixed;
    left: -9999px; top: 0;
    width: ${selectedW}px;
    height: ${selectedH}px;
    border: none;
    visibility: hidden;
  `;
  document.body.appendChild(iframe);

  iframe.contentDocument.open();
  iframe.contentDocument.write(html);
  iframe.contentDocument.close();

  /* Inject chosen font */
  injectFont(iframe.contentDocument, selectedFont);

  showProgress('⏳ Loading fonts & assets...');
  await new Promise(r => setTimeout(r, 3000));

  const slides = iframe.contentDocument.querySelectorAll('.slide');

  if (slides.length === 0) {
    hideProgress();
    container.innerHTML = `
      <div class="error-card">
        ❌ No slides found!<br/>
        <small style="color:#94a3b8;font-weight:400;font-size:13px;display:block;margin-top:8px">
          Make sure each slide has <code style="background:rgba(239,68,68,0.2);padding:2px 6px;border-radius:4px">class="slide"</code>
        </small>
      </div>`;
    iframe.remove();
    showToast('No .slide elements found!', 'error');
    return;
  }

  /* Update nav count */
  document.getElementById('navSlideCount').textContent = slides.length;

  for (let i = 0; i < slides.length; i++) {
    showProgress(`⚙️ Rendering slide ${i + 1} of ${slides.length}...`);
    setProgress(i, slides.length);

    try {
      const canvas = await html2canvas(slides[i], {
        scale: selectedScale,
        useCORS: true,
        allowTaint: true,
        width: selectedW,
        height: selectedH,
        backgroundColor: null,
        logging: false
      });

      buildSlideCard(canvas, i, container);
      canvases.push({ canvas, check: null }); // check filled in buildSlideCard

    } catch (e) {
      const err = document.createElement('div');
      err.className = 'error-card';
      err.innerHTML = `❌ Slide ${i + 1} failed<br/><small>${e.message}</small>`;
      container.appendChild(err);
      console.error(e);
    }
  }

  iframe.remove();
  setProgress(slides.length, slides.length);

  await new Promise(r => setTimeout(r, 400));
  hideProgress();

  selectRow.classList.remove('hidden');
  document.getElementById('slideCount').textContent =
    `${slides.length} slide${slides.length > 1 ? 's' : ''} ready`;

  showToast(`🎉 ${slides.length} slides rendered!`, 'success');
}

/* ===== BUILD SLIDE CARD ===== */
function buildSlideCard(canvas, i, container) {
  const box = document.createElement('div');
  box.className = 'slideBox';
  box.style.animationDelay = `${i * 0.07}s`;

  /* Header */
  const header = document.createElement('div');
  header.className = 'slide-header';

  const numBadge = document.createElement('span');
  numBadge.className = 'slide-num';
  numBadge.textContent = `Slide ${i + 1}`;

  /* Checkbox */
  const checkWrap = document.createElement('label');
  checkWrap.className = 'slide-check-wrap';

  const checkInput = document.createElement('input');
  checkInput.type = 'checkbox';

  const checkBox = document.createElement('span');
  checkBox.className = 'slide-check-box';

  const checkLbl = document.createElement('span');
  checkLbl.className = 'slide-check-label';
  checkLbl.textContent = 'Select';

  checkInput.addEventListener('change', () => {
    if (checkInput.checked) {
      box.classList.add('selected');
      checkBox.classList.add('checked');
      checkBox.textContent = '✓';
      checkLbl.textContent = 'Selected';
    } else {
      box.classList.remove('selected');
      checkBox.classList.remove('checked');
      checkBox.textContent = '';
      checkLbl.textContent = 'Select';
    }
  });

  checkWrap.appendChild(checkInput);
  checkWrap.appendChild(checkLbl);
  checkWrap.appendChild(checkBox);

  header.appendChild(numBadge);
  header.appendChild(checkWrap);

  /* Canvas wrap with overlay */
  const wrap = document.createElement('div');
  wrap.className = 'slide-canvas-wrap';

  const overlay = document.createElement('div');
  overlay.className = 'slide-overlay';

  const overlayBtn = document.createElement('button');
  overlayBtn.className = 'overlay-dl';
  overlayBtn.innerHTML = `<i class="fa-solid fa-download"></i> Quick Download`;
  overlayBtn.onclick = () => {
    downloadCanvas(canvas, `slide_${i + 1}`, selectedFmt);
    showToast(`Slide ${i + 1} downloaded!`, 'success');
    updateDownloadCount();
  };

  overlay.appendChild(overlayBtn);
  wrap.appendChild(canvas);
  wrap.appendChild(overlay);

  /* Footer buttons */
  const footer = document.createElement('div');
  footer.className = 'slide-footer';

  const dlBtn = document.createElement('button');
  dlBtn.className = 'slide-dl-btn';
  dlBtn.innerHTML = `<i class="fa-solid fa-download"></i> Download`;
  dlBtn.onclick = () => {
    downloadCanvas(canvas, `slide_${i + 1}`, selectedFmt);
    showToast(`Slide ${i + 1} downloaded!`, 'success');
    updateDownloadCount();
  };

  const copyBtn = document.createElement('button');
  copyBtn.className = 'slide-copy-btn';
  copyBtn.innerHTML = `<i class="fa-solid fa-copy"></i> Copy`;
  copyBtn.onclick = async () => {
    try {
      canvas.toBlob(async blob => {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        showToast(`Slide ${i + 1} copied!`, 'success');
      });
    } catch (e) {
      showToast('Copy failed (browser limit)', 'error');
    }
  };

  footer.appendChild(dlBtn);
  footer.appendChild(copyBtn);

  box.appendChild(header);
  box.appendChild(wrap);
  box.appendChild(footer);
  container.appendChild(box);

  /* Store checkbox reference */
  canvases[i] = { canvas, check: checkInput };
}

/* ===== SELECT ALL ===== */
function toggleSelectAll(master) {
  canvases.forEach(item => {
    if (!item || !item.check) return;
    item.check.checked = master.checked;
    item.check.dispatchEvent(new Event('change'));
  });
}

/* ===== DOWNLOAD HELPERS ===== */
function downloadCanvas(canvas, name, fmt = 'image/png') {
  const ext  = fmt === 'image/jpeg' ? 'jpg' : 'png';
  const qual = fmt === 'image/jpeg' ? 0.95 : 1.0;
  const link = document.createElement('a');
  link.download = `${name}.${ext}`;
  link.href = canvas.toDataURL(fmt, qual);
  link.click();
}

function updateDownloadCount() {
  downloadCount++;
  document.getElementById('navDownCount').textContent = downloadCount;
}

function downloadSelected() {
  const selected = canvases.filter(item => item && item.check && item.check.checked);
  if (selected.length === 0) {
    showToast('Please select at least one slide!', 'warning');
    return;
  }
  selected.forEach(item => {
    const idx = canvases.indexOf(item);
    downloadCanvas(item.canvas, `slide_${idx + 1}`, selectedFmt);
    updateDownloadCount();
  });
  showToast(`${selected.length} slide(s) downloaded!`, 'success');
}

function downloadAll() {
  if (canvases.length === 0) {
    showToast('No slides to download!', 'warning');
    return;
  }
  canvases.forEach((item, i) => {
    if (!item) return;
    downloadCanvas(item.canvas, `slide_${i + 1}`, selectedFmt);
    updateDownloadCount();
  });
  showToast(`All ${canvases.length} slides downloaded! 🎉`, 'success');
}

function downloadZip() {
  if (canvases.length === 0) {
    showToast('No slides to ZIP!', 'warning');
    return;
  }

  showProgress('📦 Creating ZIP...');
  const zip = new JSZip();
  const ext  = selectedFmt === 'image/jpeg' ? 'jpg' : 'png';
  const qual = selectedFmt === 'image/jpeg' ? 0.95 : 1.0;

  canvases.forEach((item, i) => {
    if (!item) return;
    const data = item.canvas.toDataURL(selectedFmt, qual).split(',')[1];
    zip.file(`slide_${i + 1}.${ext}`, data, { base64: true });
  });

  zip.generateAsync({ type: 'blob' }).then(content => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(content);
    a.download = `genalpha_slides_${Date.now()}.zip`;
    a.click();
    hideProgress();
    showToast('ZIP downloaded! 🎉', 'success');
    updateDownloadCount();
  });
}

function clearAll() {
  document.getElementById('htmlInput').value = '';
  document.getElementById('htmlInput').dispatchEvent(new Event('input'));
  document.getElementById('slidesContainer').innerHTML = '';
  document.getElementById('selectAllRow').classList.add('hidden');
  document.getElementById('selectAll').checked = false;
  document.getElementById('emptyDefault').style.display = 'block';
  document.getElementById('navSlideCount').textContent = '0';
  hideProgress();
  canvases = [];
  showToast('Everything cleared!', 'info');
}