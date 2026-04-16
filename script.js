/* =============================================
   GenAlpha Pro Tool — script.js
   FIXED: Preview correct size + Select working
   ============================================= */

/* ===== STATE ===== */
let canvases         = [];
let selectedFont     = 'Poppins';
let selectedScale    = 3;
let selectedW        = 1080;   // 0 = auto-detect
let selectedH        = 1080;
let selectedFmt      = 'image/png';
let selectedFit      = 'contain';
let selectedRatioLabel = '1:1';
let selectedRatioName  = 'Square';
let downloadCount    = 0;
let detectedSlideW   = 0;
let detectedSlideH   = 0;

/* ===== INIT ===== */
document.addEventListener('DOMContentLoaded', () => {
  initParticles();
  initTextareaCounter();
  updateRatioInfoBar();
});

/* ===== PARTICLES ===== */
function initParticles() {
  const wrap   = document.getElementById('particles');
  const colors = ['#7c3aed','#06b6d4','#10b981','#f59e0b','#a855f7','#ec4899'];
  for (let i = 0; i < 40; i++) {
    const p     = document.createElement('div');
    p.className = 'particle';
    const size  = Math.random() * 5 + 2;
    const color = colors[Math.floor(Math.random() * colors.length)];
    p.style.cssText = `
      width:${size}px;height:${size}px;
      left:${Math.random()*100}%;
      background:${color};
      box-shadow:0 0 ${size*3}px ${color};
      animation-duration:${Math.random()*15+10}s;
      animation-delay:${Math.random()*12}s;
    `;
    wrap.appendChild(p);
  }
}

/* ===== TEXTAREA COUNTER ===== */
function initTextareaCounter() {
  const ta      = document.getElementById('htmlInput');
  const counter = document.getElementById('charCount');
  ta.addEventListener('input', () => {
    const len = ta.value.length;
    counter.textContent = len > 0 ? `${(len/1000).toFixed(1)}k chars` : '0 chars';
  });
}

/* ===== THEME ===== */
function toggleTheme() {
  document.body.classList.toggle('light');
  document.getElementById('themeIcon').className =
    document.body.classList.contains('light') ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
  showToast(document.body.classList.contains('light') ? '☀️ Light mode' : '🌙 Dark mode','info',1500);
}

/* ===== RATIO FILTER ===== */
function filterRatio(cat, btn) {
  document.querySelectorAll('.ratio-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.ratio-card').forEach(card => {
    (cat === 'all' || card.dataset.cat === cat)
      ? card.classList.remove('hidden-card')
      : card.classList.add('hidden-card');
  });
}

/* ===== RATIO SELECT ===== */
function selectRatio(el) {
  if (el.classList.contains('custom-ratio-card')) return;
  document.querySelectorAll('.ratio-card').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  selectedW          = parseInt(el.dataset.w);
  selectedH          = parseInt(el.dataset.h);
  selectedRatioLabel = el.dataset.label;
  selectedRatioName  = el.dataset.name;
  updateRatioInfoBar();
  const sizeStr = (selectedW === 0) ? 'Auto Detect' : `${selectedW}×${selectedH}`;
  showToast(`${selectedRatioName} · ${sizeStr}`,'info',1800);
}

function updateRatioInfoBar() {
  document.getElementById('ribRatio').textContent = selectedRatioLabel;
  document.getElementById('ribSize').textContent  =
    selectedW === 0 ? 'Auto (from HTML)' : `${selectedW} × ${selectedH} px`;
  document.getElementById('ribName').textContent  = selectedRatioName;
  document.getElementById('ribMode').textContent  =
    selectedW === 0
      ? '✨ Will capture exact HTML slide size'
      : `Fit mode: ${selectedFit} · Scale ${selectedScale}x`;
}

/* ===== CUSTOM RATIO ===== */
function openCustomRatio()  { document.getElementById('customModal').classList.remove('hidden'); }
function closeCustomRatio() { document.getElementById('customModal').classList.add('hidden'); }
function setCustomQuick(w,h) {
  document.getElementById('customW').value = w;
  document.getElementById('customH').value = h;
}
function applyCustomRatio() {
  const w = parseInt(document.getElementById('customW').value);
  const h = parseInt(document.getElementById('customH').value);
  if (!w || !h || w < 100 || h < 100) { showToast('Enter valid size (min 100px)','error'); return; }
  if (w > 8000 || h > 8000)           { showToast('Max 8000px per side','warning'); return; }
  selectedW = w; selectedH = h;
  selectedRatioLabel = `${w}:${h}`;
  selectedRatioName  = 'Custom';
  document.querySelectorAll('.ratio-card').forEach(c => c.classList.remove('active'));
  document.querySelector('.custom-ratio-card').classList.add('active');
  updateRatioInfoBar();
  closeCustomRatio();
  showToast(`Custom: ${w}×${h}`,'success');
}

/* ===== FONT ===== */
function selectFont(el) {
  document.querySelectorAll('.font-chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  selectedFont = el.dataset.font;
  const prev  = document.getElementById('fontPreviewText');
  const label = document.getElementById('fontNameLabel');
  prev.style.opacity   = '0';
  prev.style.transform = 'translateY(8px)';
  setTimeout(() => {
    prev.style.fontFamily = selectedFont === 'none' ? 'inherit' : `'${selectedFont}'`;
    label.textContent     = selectedFont === 'none' ? 'Original' : selectedFont;
    prev.style.opacity    = '1';
    prev.style.transform  = 'translateY(0)';
    prev.style.transition = 'all 0.35s ease';
  }, 180);
  showToast(selectedFont === 'none' ? 'Original font kept' : `Font: ${selectedFont}`,'info',1500);
}

/* ===== SCALE ===== */
function selectScale(el) {
  document.querySelectorAll('.scale-chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  selectedScale = parseInt(el.dataset.scale);
  updateRatioInfoBar();
  showToast(`Quality: ${selectedScale}x`,'info',1500);
}

/* ===== FORMAT ===== */
function selectFmt(el) {
  document.querySelectorAll('.fmt-chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  selectedFmt = el.dataset.fmt;
  showToast(`Format: ${el.textContent}`,'info',1500);
}

/* ===== FIT MODE ===== */
function selectFit(el) {
  document.querySelectorAll('.fit-chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  selectedFit = el.dataset.fit;
  updateRatioInfoBar();
  showToast(`Fit: ${selectedFit}`,'info',1500);
}

/* ===== CLIPBOARD ===== */
async function pasteClipboard() {
  try {
    const text = await navigator.clipboard.readText();
    document.getElementById('htmlInput').value = text;
    document.getElementById('htmlInput').dispatchEvent(new Event('input'));
    showToast('Pasted!','success');
  } catch(e) { showToast('Clipboard denied','error'); }
}
function clearInput() {
  document.getElementById('htmlInput').value = '';
  document.getElementById('htmlInput').dispatchEvent(new Event('input'));
  showToast('Input cleared','info',1500);
}

/* ===== TOAST ===== */
function showToast(msg, type='info', duration=3000) {
  const icons = {success:'✅',error:'❌',info:'ℹ️',warning:'⚠️'};
  document.querySelectorAll(`.toast.${type}`).forEach(t => t.remove());
  const toast     = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${icons[type]}</span><span>${msg}</span>`;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'toastOut 0.4s ease forwards';
    setTimeout(() => toast.remove(), 400);
  }, duration);
}

/* ===== PROGRESS ===== */
function setProgress(cur, total) {
  const pct = total > 0 ? Math.round((cur/total)*100) : 0;
  document.getElementById('progressFill').style.width = pct + '%';
  document.getElementById('progressPct').textContent  = pct + '%';
}
function showProgress(msg) {
  document.getElementById('progressWrap').classList.remove('hidden');
  document.getElementById('statusText').textContent = msg;
}
function hideProgress() {
  document.getElementById('progressWrap').classList.add('hidden');
  setProgress(0,1);
}

/* =============================================
   🔑 CORE FIX: GET EXACT SLIDE SIZE
   ============================================= */
function getSlideRect(slide) {
  /* Use getBoundingClientRect for accurate size */
  const rect = slide.getBoundingClientRect();
  /* Also try computed style */
  const cs   = slide.ownerDocument.defaultView.getComputedStyle(slide);
  const w    = parseFloat(cs.width)  || rect.width;
  const h    = parseFloat(cs.height) || rect.height;
  return { w: Math.round(w), h: Math.round(h) };
}

/* =============================================
   🔑 CORE FIX: SMART CANVAS RESIZE
   Converts captured canvas → output size
   ============================================= */
function resizeCanvas(srcCanvas, outW, outH, fit) {
  /* If outW/H is 0 (Auto), return as-is */
  if (outW === 0 || outH === 0) return srcCanvas;

  const dst = document.createElement('canvas');
  dst.width  = outW;
  dst.height = outH;
  const ctx  = dst.getContext('2d');

  const sw = srcCanvas.width;
  const sh = srcCanvas.height;

  if (fit === 'stretch') {
    /* Stretch to exact output */
    ctx.drawImage(srcCanvas, 0, 0, outW, outH);

  } else if (fit === 'contain') {
    /* Scale to fit inside, keep ratio, fill rest with bg */
    const scale = Math.min(outW / sw, outH / sh);
    const dw    = sw * scale;
    const dh    = sh * scale;
    const dx    = (outW - dw) / 2;
    const dy    = (outH - dh) / 2;
    /* Background */
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, outW, outH);
    ctx.drawImage(srcCanvas, dx, dy, dw, dh);

  } else if (fit === 'cover') {
    /* Scale to cover full output, crop center */
    const scale = Math.max(outW / sw, outH / sh);
    const dw    = sw * scale;
    const dh    = sh * scale;
    const dx    = (outW - dw) / 2;
    const dy    = (outH - dh) / 2;
    ctx.drawImage(srcCanvas, dx, dy, dw, dh);
  }

  return dst;
}

/* =============================================
   🔑 INJECT STYLES INTO IFRAME
   ============================================= */
function injectIframeStyles(iframeDoc, slideW, slideH) {
  /* Font injection */
  if (selectedFont !== 'none') {
    const link   = iframeDoc.createElement('link');
    link.rel     = 'stylesheet';
    link.href    = `https://fonts.googleapis.com/css2?family=${selectedFont.replace(/ /g,'+')}:wght@400;600;700;800&display=swap`;
    iframeDoc.head.appendChild(link);

    const fontStyle      = iframeDoc.createElement('style');
    fontStyle.textContent = `* { font-family:'${selectedFont}',sans-serif !important; }`;
    iframeDoc.head.appendChild(fontStyle);
  }

  /* Fix body layout — don't force slide size, let HTML decide */
  const bodyStyle      = iframeDoc.createElement('style');
  bodyStyle.textContent = `
    html {
      margin:0!important; padding:0!important;
      width:${slideW}px!important;
    }
    body {
      margin:0!important; padding:0!important;
      width:${slideW}px!important;
      overflow:hidden!important;
      background: transparent!important;
    }
  `;
  iframeDoc.head.appendChild(bodyStyle);
}

/* =============================================
   🔑 MAIN: LOAD SLIDES
   ============================================= */
async function loadSlides() {
  const container   = document.getElementById('slidesContainer');
  const selectRow   = document.getElementById('selectAllRow');
  const emptyDef    = document.getElementById('emptyDefault');
  const detectedBnr = document.getElementById('detectedBanner');

  /* Reset */
  container.innerHTML = '';
  selectRow.classList.add('hidden');
  detectedBnr.classList.add('hidden');
  canvases        = [];
  detectedSlideW  = 0;
  detectedSlideH  = 0;

  const html = document.getElementById('htmlInput').value.trim();
  if (!html) { showToast('Please paste HTML first!','warning'); return; }

  emptyDef.style.display = 'none';
  showProgress('🔄 Setting up renderer...');

  /* --- Step 1: First pass — measure slide size --- */
  const measureIframe = document.createElement('iframe');
  measureIframe.style.cssText = `
    position:fixed; left:-19999px; top:0;
    width:1600px; height:2000px;
    border:none; visibility:hidden; z-index:-1;
  `;
  document.body.appendChild(measureIframe);
  measureIframe.contentDocument.open();
  measureIframe.contentDocument.write(html);
  measureIframe.contentDocument.close();

  showProgress('📐 Measuring slide dimensions...');
  await new Promise(r => setTimeout(r, 1500));

  const measureSlides = measureIframe.contentDocument.querySelectorAll('.slide');

  if (measureSlides.length === 0) {
    hideProgress();
    container.innerHTML = `
      <div class="error-card">
        ❌ No slides found!<br/>
        <small style="font-weight:400;font-size:13px;display:block;margin-top:8px;color:#94a3b8">
          Each slide must have <code style="background:rgba(239,68,68,0.2);padding:2px 8px;border-radius:5px">class="slide"</code>
        </small>
      </div>`;
    measureIframe.remove();
    showToast('No .slide found!','error');
    return;
  }

  /* Get first slide's actual CSS size */
  const firstSlide = measureSlides[0];
  const slRect     = getSlideRect(firstSlide);
  detectedSlideW   = slRect.w || 1080;
  detectedSlideH   = slRect.h || 1080;

  measureIframe.remove();

  /* Show detected banner */
  document.getElementById('navSize').textContent       = `${detectedSlideW}×${detectedSlideH}`;
  document.getElementById('detectedText').textContent  =
    `HTML slide size detected: ${detectedSlideW} × ${detectedSlideH} px`;
  document.getElementById('detectedBadge').textContent =
    selectedW === 0
      ? `Downloading as-is at ${selectedScale}x`
      : `→ Output: ${selectedW}×${selectedH} (${selectedFit})`;
  detectedBnr.classList.remove('hidden');

  /* --- Step 2: Render iframe at EXACT slide size --- */
  showProgress('⚙️ Setting up render iframe...');

  const iframe = document.createElement('iframe');
  iframe.style.cssText = `
    position:fixed; left:-19999px; top:0;
    width:${detectedSlideW}px; height:${detectedSlideH * measureSlides.length + 500}px;
    border:none; visibility:hidden; z-index:-1;
  `;
  document.body.appendChild(iframe);
  iframe.contentDocument.open();
  iframe.contentDocument.write(html);
  iframe.contentDocument.close();

  injectIframeStyles(iframe.contentDocument, detectedSlideW, detectedSlideH);

  showProgress('⏳ Loading fonts & assets...');
  await new Promise(r => setTimeout(r, 3000));

  const slides = iframe.contentDocument.querySelectorAll('.slide');
  document.getElementById('navSlideCount').textContent = slides.length;

  /* --- Step 3: Capture each slide --- */
  for (let i = 0; i < slides.length; i++) {
    showProgress(`🎨 Capturing slide ${i+1} of ${slides.length}...`);
    setProgress(i, slides.length);

    try {
      /* Scroll slide into view within iframe */
      slides[i].scrollIntoView();

      /* Capture at EXACT slide size */
      const rawCanvas = await html2canvas(slides[i], {
        scale:           selectedScale,
        useCORS:         true,
        allowTaint:      true,
        width:           detectedSlideW,
        height:          detectedSlideH,
        x:               0,
        y:               0,
        scrollX:         0,
        scrollY:         0,
        windowWidth:     detectedSlideW,
        windowHeight:    detectedSlideH,
        backgroundColor: null,
        logging:         false,
        onclone: (clonedDoc) => {
          /* Make sure cloned slide has correct size */
          const clonedSlides = clonedDoc.querySelectorAll('.slide');
          if (clonedSlides[i]) {
            clonedSlides[i].style.width    = detectedSlideW + 'px';
            clonedSlides[i].style.height   = detectedSlideH + 'px';
            clonedSlides[i].style.overflow = 'hidden';
            clonedSlides[i].style.position = 'relative';
          }
        }
      });

      /* Resize to output ratio if needed */
      const outW    = selectedW === 0 ? detectedSlideW * selectedScale : selectedW * selectedScale;
      const outH    = selectedH === 0 ? detectedSlideH * selectedScale : selectedH * selectedScale;
      const finalCanvas = selectedW === 0
        ? rawCanvas
        : resizeCanvas(rawCanvas, outW, outH, selectedFit);

      /* Build card - pass index clearly */
      buildSlideCard(finalCanvas, i, slides.length, container);

    } catch(e) {
      const err     = document.createElement('div');
      err.className = 'error-card';
      err.innerHTML = `❌ Slide ${i+1} error<br/><small style="font-weight:400">${e.message}</small>`;
      container.appendChild(err);
      /* Still push null to keep index aligned */
      canvases[i] = null;
      console.error('Slide error:', e);
    }
  }

  iframe.remove();
  setProgress(slides.length, slides.length);
  await new Promise(r => setTimeout(r, 400));
  hideProgress();

  selectRow.classList.remove('hidden');

  const outDesc = selectedW === 0
    ? `${detectedSlideW}×${detectedSlideH} (Original)`
    : `${selectedW}×${selectedH} (${selectedRatioLabel})`;

  document.getElementById('slideCount').textContent =
    `${slides.length} slide${slides.length>1?'s':''} · ${outDesc}`;

  showToast(`🎉 ${slides.length} slides ready!`,'success');
}

/* =============================================
   🔑 BUILD SLIDE CARD
   Fixed: checkbox stored correctly per index
   ============================================= */
function buildSlideCard(canvas, idx, total, container) {

  const box     = document.createElement('div');
  box.className = 'slideBox';
  box.style.animationDelay = `${idx * 0.06}s`;

  /* ── Header ── */
  const header     = document.createElement('div');
  header.className = 'slide-header';

  const numBadge     = document.createElement('span');
  numBadge.className = 'slide-num';
  numBadge.textContent = `Slide ${idx+1} / ${total}`;

  /* ── Checkbox — stored directly in canvases[idx] ── */
  const checkWrap     = document.createElement('label');
  checkWrap.className = 'slide-check-wrap';
  checkWrap.title     = 'Select this slide';

  const checkInput     = document.createElement('input');
  checkInput.type      = 'checkbox';

  const checkBox       = document.createElement('span');
  checkBox.className   = 'slide-check-box';

  const checkLbl       = document.createElement('span');
  checkLbl.className   = 'slide-check-label';
  checkLbl.textContent = 'Select';

  /* Toggle visual + box class */
  checkInput.addEventListener('change', () => {
    if (checkInput.checked) {
      box.classList.add('selected');
      checkBox.classList.add('checked');
      checkBox.textContent = '✓';
      checkLbl.textContent = 'Selected ✓';
      checkLbl.style.color = 'var(--primary-light)';
    } else {
      box.classList.remove('selected');
      checkBox.classList.remove('checked');
      checkBox.textContent = '';
      checkLbl.textContent = 'Select';
      checkLbl.style.color = '';
    }
  });

  checkWrap.appendChild(checkInput);
  checkWrap.appendChild(checkLbl);
  checkWrap.appendChild(checkBox);
  header.appendChild(numBadge);
  header.appendChild(checkWrap);

  /* ── Canvas + Overlay ── */
  const wrap     = document.createElement('div');
  wrap.className = 'slide-canvas-wrap';

  const overlay     = document.createElement('div');
  overlay.className = 'slide-overlay';

  const overlayBtn     = document.createElement('button');
  overlayBtn.className = 'overlay-dl';
  overlayBtn.innerHTML = `<i class="fa-solid fa-download"></i> Quick Download`;
  overlayBtn.onclick   = () => {
    doDownload(canvas, idx);
    showToast(`Slide ${idx+1} downloaded!`,'success');
  };

  overlay.appendChild(overlayBtn);
  wrap.appendChild(canvas);
  wrap.appendChild(overlay);

  /* ── Info strip ── */
  const strip     = document.createElement('div');
  strip.className = 'slide-info-strip';

  const ratioSpan     = document.createElement('span');
  ratioSpan.className = 'sis-ratio';
  ratioSpan.textContent = selectedW === 0
    ? `${detectedSlideW}×${detectedSlideH}`
    : `${selectedRatioLabel}`;

  const sizeSpan     = document.createElement('span');
  sizeSpan.className = 'sis-size';
  sizeSpan.textContent = `${canvas.width}×${canvas.height}px`;

  strip.appendChild(ratioSpan);
  strip.appendChild(sizeSpan);

  /* ── Footer buttons ── */
  const footer     = document.createElement('div');
  footer.className = 'slide-footer';

  const dlBtn     = document.createElement('button');
  dlBtn.className = 'slide-dl-btn';
  dlBtn.innerHTML = `<i class="fa-solid fa-download"></i> Download`;
  dlBtn.onclick   = () => {
    doDownload(canvas, idx);
    showToast(`Slide ${idx+1} downloaded!`,'success');
  };

  const copyBtn     = document.createElement('button');
  copyBtn.className = 'slide-copy-btn';
  copyBtn.innerHTML = `<i class="fa-solid fa-copy"></i> Copy`;
  copyBtn.onclick   = () => {
    canvas.toBlob(async blob => {
      try {
        await navigator.clipboard.write([new ClipboardItem({'image/png': blob})]);
        showToast(`Slide ${idx+1} copied!`,'success');
      } catch(e) { showToast('Copy not supported here','error'); }
    });
  };

  footer.appendChild(dlBtn);
  footer.appendChild(copyBtn);

  box.appendChild(header);
  box.appendChild(wrap);
  box.appendChild(strip);
  box.appendChild(footer);
  container.appendChild(box);

  /* =============================================
     🔑 KEY FIX: Store IMMEDIATELY at correct index
     ============================================= */
  canvases[idx] = { canvas, check: checkInput };
}

/* ===== SELECT ALL ===== */
function toggleSelectAll(master) {
  canvases.forEach(item => {
    if (!item || !item.check) return;
    if (item.check.checked !== master.checked) {
      item.check.checked = master.checked;
      item.check.dispatchEvent(new Event('change'));
    }
  });
}

/* ===== DOWNLOAD HELPERS ===== */
function doDownload(canvas, idx) {
  const ext   = selectedFmt === 'image/jpeg' ? 'jpg' : 'png';
  const qual  = selectedFmt === 'image/jpeg' ? 0.95  : 1.0;
  const ratio = selectedRatioLabel.replace(/[:/]/g,'x');
  const name  = `genalpha_slide${idx+1}_${ratio}`;
  const link  = document.createElement('a');
  link.download = `${name}.${ext}`;
  link.href     = canvas.toDataURL(selectedFmt, qual);
  link.click();
  updateDownloadCount();
}

function updateDownloadCount() {
  downloadCount++;
  document.getElementById('navDownCount').textContent = downloadCount;
}

function downloadSelected() {
  /* =============================================
     🔑 KEY FIX: Filter properly + verify checked
     ============================================= */
  const selected = canvases.filter(item => item && item.check && item.check.checked);
  if (!selected.length) {
    showToast('No slides selected! Tap checkbox on slide.','warning');
    return;
  }
  selected.forEach(item => {
    const idx = canvases.indexOf(item);
    doDownload(item.canvas, idx);
  });
  showToast(`${selected.length} slide(s) downloaded!`,'success');
}

function downloadAll() {
  const valid = canvases.filter(item => item && item.canvas);
  if (!valid.length) { showToast('No slides to download!','warning'); return; }
  valid.forEach(item => {
    const idx = canvases.indexOf(item);
    doDownload(item.canvas, idx);
  });
  showToast(`All ${valid.length} slides downloaded! 🎉`,'success');
}

function downloadZip() {
  const valid = canvases.filter(item => item && item.canvas);
  if (!valid.length) { showToast('No slides to ZIP!','warning'); return; }

  showProgress('📦 Creating ZIP...');
  const zip  = new JSZip();
  const ext  = selectedFmt === 'image/jpeg' ? 'jpg' : 'png';
  const qual = selectedFmt === 'image/jpeg' ? 0.95  : 1.0;
  const ratio = selectedRatioLabel.replace(/[:/]/g,'x');

  valid.forEach(item => {
    const idx  = canvases.indexOf(item);
    const data = item.canvas.toDataURL(selectedFmt, qual).split(',')[1];
    zip.file(`genalpha_slide${idx+1}_${ratio}.${ext}`, data, {base64:true});
  });

  zip.generateAsync({type:'blob'}).then(content => {
    const a      = document.createElement('a');
    a.href       = URL.createObjectURL(content);
    a.download   = `genalpha_${ratio}_${Date.now()}.zip`;
    a.click();
    hideProgress();
    showToast('ZIP downloaded! 🎉','success');
    updateDownloadCount();
  });
}

function clearAll() {
  document.getElementById('htmlInput').value = '';
  document.getElementById('htmlInput').dispatchEvent(new Event('input'));
  document.getElementById('slidesContainer').innerHTML = '';
  document.getElementById('selectAllRow').classList.add('hidden');
  document.getElementById('detectedBanner').classList.add('hidden');
  document.getElementById('selectAll').checked = false;
  document.getElementById('emptyDefault').style.display = 'block';
  document.getElementById('navSlideCount').textContent = '0';
  document.getElementById('navSize').textContent = '—';
  hideProgress();
  canvases       = [];
  detectedSlideW = 0;
  detectedSlideH = 0;
  showToast('Cleared!','info');
}