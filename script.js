/* =============================================
   GenAlpha Pro Tool — script.js
   Full Featured Version
   ============================================= */

/* ===== STATE ===== */
let canvases          = [];
let selectedFont      = 'Poppins';
let selectedScale     = 3;
let selectedW         = 1080;
let selectedH         = 1080;
let selectedFmt       = 'image/png';
let selectedFit       = 'contain';
let selectedRatioLabel = '1:1';
let selectedRatioName  = 'Square';
let downloadCount     = 0;
let detectedSlideW    = 0;
let detectedSlideH    = 0;
let loadedFileContent = null;
let autoSaveEnabled   = true;
let selectedCount     = 0;
let currentLbIndex    = 0;
let currentPhoneIndex = 0;
let bgColor           = '#000000';
let wmPosition        = 'bottom-left';
let wmBg              = 'none';

/* ===== INIT ===== */
document.addEventListener('DOMContentLoaded', () => {
  initParticles();
  initTextareaCounter();
  updateRatioInfoBar();
  initGlobalDragDrop();
  loadAutoSave();
  initWatermarkColorSync();
  initKeyboard();
});

/* ===== PARTICLES ===== */
function initParticles() {
  const wrap   = document.getElementById('particles');
  const colors = ['#7c3aed','#06b6d4','#10b981','#f59e0b','#a855f7','#ec4899'];
  for (let i = 0; i < 40; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size  = Math.random() * 5 + 2;
    const color = colors[Math.floor(Math.random() * colors.length)];
    p.style.cssText = `width:${size}px;height:${size}px;left:${Math.random()*100}%;background:${color};box-shadow:0 0 ${size*3}px ${color};animation-duration:${Math.random()*15+10}s;animation-delay:${Math.random()*12}s;`;
    wrap.appendChild(p);
  }
}

/* ===== KEYBOARD ===== */
function initKeyboard() {
  document.addEventListener('keydown', (e) => {
    const lb = document.getElementById('lightbox');
    if (!lb.classList.contains('hidden')) {
      if (e.key === 'Escape')       closeLightbox();
      if (e.key === 'ArrowRight')   lightboxNav(1);
      if (e.key === 'ArrowLeft')    lightboxNav(-1);
    }
  });
}

/* ===== AUTO SAVE ===== */
function loadAutoSave() {
  try {
    const saved = localStorage.getItem('genalpha_html');
    if (saved && saved.trim()) {
      document.getElementById('htmlInput').value = saved;
      document.getElementById('htmlInput').dispatchEvent(new Event('input'));
      showToast('📂 Last session restored!', 'info', 2500);
    }
    const savedTheme = localStorage.getItem('genalpha_theme');
    if (savedTheme === 'light') {
      document.body.classList.add('light');
      document.getElementById('themeIcon').className = 'fa-solid fa-sun';
    }
  } catch(e) { console.warn('Auto save load error:', e); }
}

function saveToLocal(html) {
  if (!autoSaveEnabled) return;
  try { localStorage.setItem('genalpha_html', html); } catch(e) {}
}

function toggleAutoSave() {
  autoSaveEnabled = !autoSaveEnabled;
  document.getElementById('autoSaveLabel').textContent =
    autoSaveEnabled ? 'Auto Save: ON' : 'Auto Save: OFF';
  document.getElementById('autoSaveBtn').style.color =
    autoSaveEnabled ? 'var(--accent2)' : 'var(--muted)';
  showToast(autoSaveEnabled ? '💾 Auto Save ON' : '💾 Auto Save OFF', 'info', 1500);
}

/* ===== TEXTAREA COUNTER ===== */
function initTextareaCounter() {
  const ta      = document.getElementById('htmlInput');
  const counter = document.getElementById('charCount');
  ta.addEventListener('input', () => {
    const len = ta.value.length;
    counter.textContent = len > 0 ? `${(len/1000).toFixed(1)}k chars` : '0 chars';
    if (len > 0) {
      loadedFileContent = null;
      saveToLocal(ta.value);
    }
  });
  document.getElementById('autoSaveBtn').onclick = toggleAutoSave;
}

/* ===== WATERMARK COLOR SYNC ===== */
function initWatermarkColorSync() {
  const colorInput = document.getElementById('wmColor');
  colorInput.addEventListener('input', () => {
    document.getElementById('wmColorVal').textContent = colorInput.value;
  });
}

/* ===== DRAG & DROP ===== */
function initGlobalDragDrop() {
  document.addEventListener('dragover', (e) => {
    e.preventDefault();
    if (hasHTMLFile(e)) document.getElementById('dropZone').classList.add('dragover');
  });
  document.addEventListener('dragleave', (e) => {
    if (e.clientX === 0 && e.clientY === 0)
      document.getElementById('dropZone').classList.remove('dragover');
  });
  document.addEventListener('drop', (e) => {
    e.preventDefault();
    document.getElementById('dropZone').classList.remove('dragover');
    if (hasHTMLFile(e)) processDroppedFile(e.dataTransfer.files[0]);
  });
}

function hasHTMLFile(e) {
  if (!e.dataTransfer || !e.dataTransfer.files) return false;
  const file = e.dataTransfer.files[0];
  return file && (file.name.endsWith('.html') || file.name.endsWith('.htm'));
}

function handleDragOver(e) { e.preventDefault(); e.stopPropagation(); document.getElementById('dropZone').classList.add('dragover'); }
function handleDragLeave(e) {
  e.stopPropagation();
  if (!document.getElementById('dropZone').contains(e.relatedTarget))
    document.getElementById('dropZone').classList.remove('dragover');
}
function handleDrop(e) {
  e.preventDefault(); e.stopPropagation();
  document.getElementById('dropZone').classList.remove('dragover');
  const file = e.dataTransfer.files[0];
  if (!file) return;
  if (!file.name.endsWith('.html') && !file.name.endsWith('.htm')) {
    showToast('Sirf .html ya .htm file!', 'error'); return;
  }
  processDroppedFile(file);
}

function triggerFileInput() {
  if (!document.getElementById('dropLoaded').classList.contains('hidden')) return;
  document.getElementById('fileInput').click();
}
function handleFileSelect(e) {
  const file = e.target.files[0];
  if (file) processDroppedFile(file);
}

function processDroppedFile(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const content = e.target.result;
    if (!content.includes('class="slide"') && !content.includes("class='slide'"))
      showToast('⚠️ .slide class nahi mili — preview try karo', 'warning', 4000);
    loadedFileContent = content;
    document.getElementById('htmlInput').value = content;
    document.getElementById('htmlInput').dispatchEvent(new Event('input'));
    showDropLoaded(file);
    showToast(`✅ "${file.name}" loaded!`, 'success');
  };
  reader.onerror = () => showToast('File read error!', 'error');
  reader.readAsText(file, 'UTF-8');
}

function showDropLoaded(file) {
  const zone   = document.getElementById('dropZone');
  const loaded = document.getElementById('dropLoaded');
  document.getElementById('dropIcon').classList.add('hidden');
  document.getElementById('dropText').classList.add('hidden');
  const sub = zone.querySelector('.drop-sub');
  if (sub) sub.classList.add('hidden');
  loaded.classList.remove('hidden');
  document.getElementById('dlFileName').textContent = file.name;
  document.getElementById('dlFileSize').textContent = formatFileSize(file.size);
  zone.style.borderColor = 'rgba(16,185,129,0.5)';
  zone.style.background  = 'rgba(16,185,129,0.06)';
  zone.style.cursor      = 'default';
}

function removeFile(e) {
  e.stopPropagation();
  loadedFileContent = null;
  const zone   = document.getElementById('dropZone');
  const loaded = document.getElementById('dropLoaded');
  loaded.classList.add('hidden');
  document.getElementById('dropIcon').classList.remove('hidden');
  document.getElementById('dropText').classList.remove('hidden');
  const sub = zone.querySelector('.drop-sub');
  if (sub) sub.classList.remove('hidden');
  zone.style.borderColor = ''; zone.style.background = ''; zone.style.cursor = 'pointer';
  document.getElementById('htmlInput').value = '';
  document.getElementById('htmlInput').dispatchEvent(new Event('input'));
  document.getElementById('fileInput').value = '';
  showToast('File removed', 'info', 1500);
}

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024*1024) return (bytes/1024).toFixed(1) + ' KB';
  return (bytes/1024/1024).toFixed(2) + ' MB';
}

/* ===== THEME ===== */
function toggleTheme() {
  document.body.classList.toggle('light');
  const isLight = document.body.classList.contains('light');
  document.getElementById('themeIcon').className = isLight ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
  try { localStorage.setItem('genalpha_theme', isLight ? 'light' : 'dark'); } catch(e) {}
  showToast(isLight ? '☀️ Light mode' : '🌙 Dark mode', 'info', 1500);
}

/* ===== WATERMARK ===== */
function toggleWatermark(cb) {
  const opts   = document.getElementById('wmOptions');
  const status = document.getElementById('wmStatus');
  if (cb.checked) {
    opts.classList.remove('hidden');
    status.classList.remove('hidden');
  } else {
    opts.classList.add('hidden');
    status.classList.add('hidden');
  }
  showToast(cb.checked ? '💧 Watermark ON' : 'Watermark OFF', 'info', 1500);
}

function selectWmPos(el) {
  document.querySelectorAll('.wm-pos-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  wmPosition = el.dataset.pos;
}

function selectWmBg(el) {
  document.querySelectorAll('.wm-bg-chip').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  wmBg = el.dataset.bg;
}

/* ===== APPLY WATERMARK TO CANVAS ===== */
function applyWatermark(canvas) {
  if (!document.getElementById('wmEnabled').checked) return canvas;

  const text    = document.getElementById('wmText').value.trim() || '@genalpha.in';
  const fontSize = parseInt(document.getElementById('wmSize').value) || 28;
  const color   = document.getElementById('wmColor').value;
  const opacity = parseInt(document.getElementById('wmOpacity').value) / 100;

  const ctx = canvas.getContext('2d');
  const cw  = canvas.width;
  const ch  = canvas.height;

  ctx.save();
  ctx.globalAlpha = opacity;

  const scaledFont = Math.round(fontSize * (canvas.width / 1080));
  ctx.font = `bold ${scaledFont}px Poppins, sans-serif`;

  const metrics = ctx.measureText(text);
  const tw = metrics.width;
  const th = scaledFont;
  const pad = scaledFont * 0.6;

  /* Position */
  let x = pad, y = pad + th;
  switch (wmPosition) {
    case 'top-left':      x = pad;              y = pad + th; break;
    case 'top-center':    x = (cw - tw) / 2;   y = pad + th; break;
    case 'top-right':     x = cw - tw - pad;    y = pad + th; break;
    case 'mid-left':      x = pad;              y = ch / 2 + th / 2; break;
    case 'center':        x = (cw - tw) / 2;   y = ch / 2 + th / 2; break;
    case 'mid-right':     x = cw - tw - pad;    y = ch / 2 + th / 2; break;
    case 'bottom-left':   x = pad;              y = ch - pad; break;
    case 'bottom-center': x = (cw - tw) / 2;   y = ch - pad; break;
    case 'bottom-right':  x = cw - tw - pad;    y = ch - pad; break;
  }

  /* Background pill */
  if (wmBg !== 'none') {
    const bPad = scaledFont * 0.4;
    ctx.globalAlpha = opacity * 0.7;
    ctx.fillStyle   = wmBg === 'dark' ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.6)';
    const rx = x - bPad;
    const ry = y - th - bPad * 0.5;
    const rw = tw + bPad * 2;
    const rh = th + bPad;
    const r  = rh / 2;
    ctx.beginPath();
    ctx.moveTo(rx + r, ry);
    ctx.lineTo(rx + rw - r, ry);
    ctx.quadraticCurveTo(rx + rw, ry, rx + rw, ry + r);
    ctx.lineTo(rx + rw, ry + rh - r);
    ctx.quadraticCurveTo(rx + rw, ry + rh, rx + rw - r, ry + rh);
    ctx.lineTo(rx + r, ry + rh);
    ctx.quadraticCurveTo(rx, ry + rh, rx, ry + rh - r);
    ctx.lineTo(rx, ry + r);
    ctx.quadraticCurveTo(rx, ry, rx + r, ry);
    ctx.closePath();
    ctx.fill();
  }

  /* Text */
  ctx.globalAlpha = opacity;
  ctx.fillStyle   = color;
  ctx.fillText(text, x, y);
  ctx.restore();

  return canvas;
}

/* ===== RATIO ===== */
function filterRatio(cat, btn) {
  document.querySelectorAll('.ratio-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.ratio-card').forEach(card => {
    (cat === 'all' || card.dataset.cat === cat)
      ? card.classList.remove('hidden-card')
      : card.classList.add('hidden-card');
  });
}

function selectRatio(el) {
  if (el.classList.contains('custom-ratio-card')) return;
  document.querySelectorAll('.ratio-card').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  selectedW = parseInt(el.dataset.w);
  selectedH = parseInt(el.dataset.h);
  selectedRatioLabel = el.dataset.label;
  selectedRatioName  = el.dataset.name;
  updateRatioInfoBar();
  showToast(`${selectedRatioName} · ${selectedW===0?'Auto':`${selectedW}×${selectedH}`}`, 'info', 1500);
}

function updateRatioInfoBar() {
  document.getElementById('ribRatio').textContent = selectedRatioLabel;
  document.getElementById('ribSize').textContent  = selectedW===0 ? 'Auto (HTML)' : `${selectedW}×${selectedH}`;
  document.getElementById('ribName').textContent  = selectedRatioName;
  document.getElementById('ribMode').textContent  = selectedW===0 ? '✨ Exact HTML size' : `Fit: ${selectedFit} · ${selectedScale}x`;
}

function openCustomRatio()  { document.getElementById('customModal').classList.remove('hidden'); }
function closeCustomRatio() { document.getElementById('customModal').classList.add('hidden'); }
function setCustomQuick(w,h) { document.getElementById('customW').value=w; document.getElementById('customH').value=h; }
function applyCustomRatio() {
  const w = parseInt(document.getElementById('customW').value);
  const h = parseInt(document.getElementById('customH').value);
  if (!w||!h||w<100||h<100) { showToast('Min 100px','error'); return; }
  if (w>8000||h>8000)       { showToast('Max 8000px','warning'); return; }
  selectedW=w; selectedH=h; selectedRatioLabel=`${w}:${h}`; selectedRatioName='Custom';
  document.querySelectorAll('.ratio-card').forEach(c=>c.classList.remove('active'));
  document.querySelector('.custom-ratio-card').classList.add('active');
  updateRatioInfoBar(); closeCustomRatio();
  showToast(`Custom: ${w}×${h}`,'success');
}

/* ===== FONT ===== */
function selectFont(el) {
  document.querySelectorAll('.font-chip').forEach(c=>c.classList.remove('active'));
  el.classList.add('active'); selectedFont=el.dataset.font;
  const prev=document.getElementById('fontPreviewText');
  const label=document.getElementById('fontNameLabel');
  prev.style.opacity='0'; prev.style.transform='translateY(8px)';
  setTimeout(()=>{
    prev.style.fontFamily = selectedFont==='none'?'inherit':`'${selectedFont}'`;
    label.textContent = selectedFont==='none'?'Original':selectedFont;
    prev.style.opacity='1'; prev.style.transform='translateY(0)';
    prev.style.transition='all 0.35s ease';
  },180);
  showToast(selectedFont==='none'?'Original font':'Font: '+selectedFont,'info',1500);
}

/* ===== SCALE / FORMAT / FIT ===== */
function selectScale(el) {
  document.querySelectorAll('.scale-chip').forEach(c=>c.classList.remove('active'));
  el.classList.add('active'); selectedScale=parseInt(el.dataset.scale);
  updateRatioInfoBar(); showToast(`Quality: ${selectedScale}x`,'info',1500);
}
function selectFmt(el) {
  document.querySelectorAll('.fmt-chip').forEach(c=>c.classList.remove('active'));
  el.classList.add('active'); selectedFmt=el.dataset.fmt;
  showToast(`Format: ${el.textContent}`,'info',1500);
}
function selectFit(el) {
  document.querySelectorAll('.fit-chip').forEach(c=>c.classList.remove('active'));
  el.classList.add('active'); selectedFit=el.dataset.fit;
  updateRatioInfoBar(); showToast(`Fit: ${selectedFit}`,'info',1500);
}

/* ===== BG COLOR ===== */
function updateBgColor(input) {
  bgColor = input.value;
  document.getElementById('bgColorVal').textContent = input.value;
}
function setBgPreset(color) {
  bgColor = color;
  if (color !== 'transparent') {
    document.getElementById('bgColor').value = color;
    document.getElementById('bgColorVal').textContent = color;
  } else {
    document.getElementById('bgColorVal').textContent = 'transparent';
  }
  showToast(`BG: ${color}`, 'info', 1200);
}

/* ===== CLIPBOARD ===== */
async function pasteClipboard() {
  try {
    const text = await navigator.clipboard.readText();
    document.getElementById('htmlInput').value = text;
    document.getElementById('htmlInput').dispatchEvent(new Event('input'));
    loadedFileContent = null;
    showToast('Pasted!', 'success');
  } catch(e) { showToast('Clipboard access denied', 'error'); }
}
function clearInput() {
  document.getElementById('htmlInput').value = '';
  document.getElementById('htmlInput').dispatchEvent(new Event('input'));
  showToast('Cleared', 'info', 1500);
}

/* ===== TOAST ===== */
function showToast(msg, type='info', duration=3000) {
  const icons = {success:'✅',error:'❌',info:'ℹ️',warning:'⚠️'};
  document.querySelectorAll(`.toast.${type}`).forEach(t=>t.remove());
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${icons[type]}</span><span>${msg}</span>`;
  document.body.appendChild(toast);
  setTimeout(()=>{ toast.style.animation='toastOut 0.4s ease forwards'; setTimeout(()=>toast.remove(),400); }, duration);
}

/* ===== PROGRESS ===== */
function setProgress(cur,total) {
  const pct = total>0 ? Math.round((cur/total)*100) : 0;
  document.getElementById('progressFill').style.width = pct+'%';
  document.getElementById('progressPct').textContent  = pct+'%';
}
function showProgress(msg) { document.getElementById('progressWrap').classList.remove('hidden'); document.getElementById('statusText').textContent=msg; }
function hideProgress()    { document.getElementById('progressWrap').classList.add('hidden'); setProgress(0,1); }

/* ===== GET HTML SOURCE ===== */
function getHTMLSource() {
  if (loadedFileContent && loadedFileContent.trim()) return loadedFileContent;
  return document.getElementById('htmlInput').value.trim();
}

/* ===== SLIDE SIZE DETECT ===== */
function getSlideRect(slide) {
  const cs = slide.ownerDocument.defaultView.getComputedStyle(slide);
  return {
    w: Math.round(parseFloat(cs.width)  || slide.getBoundingClientRect().width),
    h: Math.round(parseFloat(cs.height) || slide.getBoundingClientRect().height)
  };
}

/* ===== CANVAS RESIZE ===== */
function resizeCanvas(src, outW, outH, fit) {
  if (!outW || !outH) return src;
  const dst = document.createElement('canvas');
  dst.width=outW; dst.height=outH;
  const ctx = dst.getContext('2d');
  const sw=src.width, sh=src.height;

  if (fit==='stretch') {
    ctx.drawImage(src,0,0,outW,outH);
  } else if (fit==='contain') {
    const scale = Math.min(outW/sw, outH/sh);
    const dw=sw*scale, dh=sh*scale;
    const dx=(outW-dw)/2, dy=(outH-dh)/2;
    if (bgColor === 'transparent') {
      ctx.clearRect(0,0,outW,outH);
    } else {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0,0,outW,outH);
    }
    ctx.drawImage(src,dx,dy,dw,dh);
  } else if (fit==='cover') {
    const scale = Math.max(outW/sw, outH/sh);
    const dw=sw*scale, dh=sh*scale;
    const dx=(outW-dw)/2, dy=(outH-dh)/2;
    ctx.drawImage(src,dx,dy,dw,dh);
  }
  return dst;
}

/* ===== INJECT IFRAME STYLES ===== */
function injectIframeStyles(iframeDoc, slideW) {
  if (selectedFont !== 'none') {
    const link = iframeDoc.createElement('link');
    link.rel   = 'stylesheet';
    link.href  = `https://fonts.googleapis.com/css2?family=${selectedFont.replace(/ /g,'+')}:wght@400;600;700;800&display=swap`;
    iframeDoc.head.appendChild(link);
    const fs = iframeDoc.createElement('style');
    fs.textContent = `*{font-family:'${selectedFont}',sans-serif!important;}`;
    iframeDoc.head.appendChild(fs);
  }
  const bs = iframeDoc.createElement('style');
  bs.textContent = `html,body{margin:0!important;padding:0!important;width:${slideW}px!important;overflow:hidden!important;background:transparent!important;}`;
  iframeDoc.head.appendChild(bs);
}

/* ===== LOAD SLIDES ===== */
async function loadSlides() {
  const container   = document.getElementById('slidesContainer');
  const selectRow   = document.getElementById('selectAllRow');
  const emptyDef    = document.getElementById('emptyDefault');
  const detectedBnr = document.getElementById('detectedBanner');
  const modeRow     = document.getElementById('previewModeRow');
  const phoneCon    = document.getElementById('phoneContainer');

  container.innerHTML = '';
  selectRow.classList.add('hidden');
  detectedBnr.classList.add('hidden');
  modeRow.classList.add('hidden');
  phoneCon.classList.add('hidden');
  canvases=[]; detectedSlideW=0; detectedSlideH=0;
  selectedCount=0; updateSelectedUI();

  const html = getHTMLSource();
  if (!html) { showToast('HTML paste karo ya file drop karo!', 'warning'); return; }

  emptyDef.style.display='none';
  showProgress('🔄 Setting up...');

  /* Measure pass */
  const mIframe = document.createElement('iframe');
  mIframe.style.cssText = 'position:fixed;left:-19999px;top:0;width:1600px;height:2000px;border:none;visibility:hidden;z-index:-1;';
  document.body.appendChild(mIframe);
  mIframe.contentDocument.open();
  mIframe.contentDocument.write(html);
  mIframe.contentDocument.close();

  showProgress('📐 Measuring slide size...');
  await new Promise(r=>setTimeout(r,1500));

  const mSlides = mIframe.contentDocument.querySelectorAll('.slide');
  if (mSlides.length===0) {
    hideProgress();
    container.innerHTML = `<div class="error-card">❌ No slides found!<br/><small style="font-weight:400;font-size:13px;display:block;margin-top:8px;color:#94a3b8">Each slide must have <code style="background:rgba(239,68,68,0.2);padding:2px 8px;border-radius:5px">class="slide"</code></small></div>`;
    mIframe.remove();
    showToast('No .slide class mili!', 'error');
    return;
  }

  const slRect   = getSlideRect(mSlides[0]);
  detectedSlideW = slRect.w || 1080;
  detectedSlideH = slRect.h || 1080;
  mIframe.remove();

  document.getElementById('navSize').textContent      = `${detectedSlideW}×${detectedSlideH}`;
  document.getElementById('detectedText').textContent = `Detected: ${detectedSlideW}×${detectedSlideH}px`;
  document.getElementById('detectedBadge').textContent = selectedW===0 ? `As-Is · ${selectedScale}x` : `→ ${selectedW}×${selectedH}`;
  detectedBnr.classList.remove('hidden');

  /* Render iframe */
  showProgress('⚙️ Preparing render...');
  const iframe = document.createElement('iframe');
  iframe.style.cssText = `position:fixed;left:-19999px;top:0;width:${detectedSlideW}px;height:${detectedSlideH*15+500}px;border:none;visibility:hidden;z-index:-1;`;
  document.body.appendChild(iframe);
  iframe.contentDocument.open();
  iframe.contentDocument.write(html);
  iframe.contentDocument.close();
  injectIframeStyles(iframe.contentDocument, detectedSlideW);

  showProgress('⏳ Loading assets...');
  await new Promise(r=>setTimeout(r,2800));

  const slides = iframe.contentDocument.querySelectorAll('.slide');
  document.getElementById('navSlideCount').textContent = slides.length;

  for (let i=0; i<slides.length; i++) {
    showProgress(`🎨 Rendering ${i+1}/${slides.length}...`);
    setProgress(i, slides.length);
    try {
      const rawCanvas = await html2canvas(slides[i], {
        scale: selectedScale, useCORS:true, allowTaint:true,
        width:detectedSlideW, height:detectedSlideH,
        x:0, y:0, scrollX:0, scrollY:0,
        windowWidth:detectedSlideW, windowHeight:detectedSlideH,
        backgroundColor:null, logging:false,
        onclone: (clonedDoc) => {
          const cs = clonedDoc.querySelectorAll('.slide');
          if (cs[i]) { cs[i].style.width=detectedSlideW+'px'; cs[i].style.height=detectedSlideH+'px'; cs[i].style.overflow='hidden'; cs[i].style.position='relative'; }
        }
      });

      const outW = selectedW===0 ? detectedSlideW*selectedScale : selectedW*selectedScale;
      const outH = selectedH===0 ? detectedSlideH*selectedScale : selectedH*selectedScale;
      let finalCanvas = selectedW===0 ? rawCanvas : resizeCanvas(rawCanvas,outW,outH,selectedFit);

      /* Apply watermark */
      finalCanvas = applyWatermark(finalCanvas);

      buildSlideCard(finalCanvas, i, slides.length, container);

    } catch(e) {
      const err = document.createElement('div');
      err.className='error-card';
      err.innerHTML=`❌ Slide ${i+1} error<br/><small>${e.message}</small>`;
      container.appendChild(err);
      canvases[i]=null;
    }
  }

  iframe.remove();
  setProgress(slides.length, slides.length);
  await new Promise(r=>setTimeout(r,400));
  hideProgress();

  /* Show mode row & phone preview setup */
  selectRow.classList.remove('hidden');
  modeRow.classList.remove('hidden');
  document.getElementById('slideCount').textContent =
    `${slides.length} slide${slides.length>1?'s':''} · ${selectedW===0?`${detectedSlideW}×${detectedSlideH}`:selectedW+'×'+selectedH}`;

  /* Setup phone preview */
  setupPhonePreview();

  showToast(`🎉 ${slides.length} slides ready!`, 'success');
}

/* ===== BUILD SLIDE CARD ===== */
function buildSlideCard(canvas, idx, total, container) {
  const box = document.createElement('div');
  box.className='slideBox';
  box.style.animationDelay=`${idx*0.06}s`;

  const header = document.createElement('div');
  header.className='slide-header';

  const numBadge = document.createElement('span');
  numBadge.className='slide-num';
  numBadge.textContent=`Slide ${idx+1} / ${total}`;

  /* Checkbox */
  const checkWrap  = document.createElement('label');
  checkWrap.className='slide-check-wrap';
  const checkInput = document.createElement('input');
  checkInput.type  = 'checkbox';
  const checkBox   = document.createElement('span');
  checkBox.className='slide-check-box';
  const checkLbl   = document.createElement('span');
  checkLbl.className='slide-check-label';
  checkLbl.textContent='Select';

  checkInput.addEventListener('change', () => {
    if (checkInput.checked) {
      box.classList.add('selected');
      checkBox.classList.add('checked'); checkBox.textContent='✓';
      checkLbl.textContent='Selected ✓'; checkLbl.style.color='var(--primary-light)';
      selectedCount++;
    } else {
      box.classList.remove('selected');
      checkBox.classList.remove('checked'); checkBox.textContent='';
      checkLbl.textContent='Select'; checkLbl.style.color='';
      selectedCount=Math.max(0,selectedCount-1);
    }
    updateSelectedUI();
  });

  checkWrap.appendChild(checkInput);
  checkWrap.appendChild(checkLbl);
  checkWrap.appendChild(checkBox);
  header.appendChild(numBadge);
  header.appendChild(checkWrap);

  /* Canvas + Overlay */
  const wrap    = document.createElement('div');
  wrap.className='slide-canvas-wrap';

  const overlay = document.createElement('div');
  overlay.className='slide-overlay';

  const fullBtn = document.createElement('button');
  fullBtn.className='overlay-btn';
  fullBtn.innerHTML='<i class="fa-solid fa-expand"></i> Fullscreen';
  fullBtn.onclick=(e)=>{ e.stopPropagation(); openLightbox(idx); };

  const dlOverlayBtn = document.createElement('button');
  dlOverlayBtn.className='overlay-btn';
  dlOverlayBtn.innerHTML='<i class="fa-solid fa-download"></i> Download';
  dlOverlayBtn.onclick=(e)=>{ e.stopPropagation(); doDownload(canvas,idx); showToast(`Slide ${idx+1} downloaded!`,'success'); };

  overlay.appendChild(fullBtn);
  overlay.appendChild(dlOverlayBtn);

  /* Click canvas = fullscreen */
  wrap.addEventListener('click', () => openLightbox(idx));
  wrap.appendChild(canvas);
  wrap.appendChild(overlay);

  /* Info strip */
  const strip = document.createElement('div');
  strip.className='slide-info-strip';
  const ratioSpan = document.createElement('span');
  ratioSpan.className='sis-ratio';
  ratioSpan.textContent = selectedW===0 ? `${detectedSlideW}×${detectedSlideH}` : selectedRatioLabel;
  const sizeSpan = document.createElement('span');
  sizeSpan.className='sis-size';
  sizeSpan.textContent=`${canvas.width}×${canvas.height}px`;
  strip.appendChild(ratioSpan); strip.appendChild(sizeSpan);

  /* Footer */
  const footer = document.createElement('div');
  footer.className='slide-footer';

  const dlBtn = document.createElement('button');
  dlBtn.className='slide-dl-btn';
  dlBtn.innerHTML='<i class="fa-solid fa-download"></i> Download';
  dlBtn.onclick=()=>{ doDownload(canvas,idx); showToast(`Slide ${idx+1} downloaded!`,'success'); };

  const copyBtn = document.createElement('button');
  copyBtn.className='slide-copy-btn';
  copyBtn.innerHTML='<i class="fa-solid fa-copy"></i> Copy';
  copyBtn.onclick=()=>{
    canvas.toBlob(async blob=>{
      try {
        await navigator.clipboard.write([new ClipboardItem({'image/png':blob})]);
        showToast(`Slide ${idx+1} copied!`,'success');
      } catch(e){ showToast('Copy not supported','error'); }
    });
  };

  footer.appendChild(dlBtn); footer.appendChild(copyBtn);

  box.appendChild(header); box.appendChild(wrap);
  box.appendChild(strip); box.appendChild(footer);
  container.appendChild(box);

  canvases[idx] = { canvas, check: checkInput };
}

/* ===== SELECTED COUNT UI ===== */
function updateSelectedUI() {
  const badge   = document.getElementById('selectedBadge');
  const navBadge = document.getElementById('navSelectedCount');
  const rowBadge = document.getElementById('selectedCountBadge');

  navBadge.textContent = selectedCount;

  if (selectedCount > 0) {
    badge.classList.remove('hidden');
    badge.textContent = selectedCount;
    rowBadge.classList.remove('hidden');
    rowBadge.textContent = `${selectedCount} selected`;
  } else {
    badge.classList.add('hidden');
    rowBadge.classList.add('hidden');
  }
}

/* ===== SELECT ALL ===== */
function toggleSelectAll(master) {
  canvases.forEach(item=>{
    if (!item||!item.check) return;
    if (item.check.checked !== master.checked) {
      item.check.checked = master.checked;
      item.check.dispatchEvent(new Event('change'));
    }
  });
}

/* ===== FULLSCREEN LIGHTBOX ===== */
function openLightbox(idx) {
  const valid = canvases.filter(c=>c&&c.canvas);
  if (!valid.length) return;
  currentLbIndex = idx;
  renderLightbox(idx);
  document.getElementById('lightbox').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function renderLightbox(idx) {
  const item = canvases[idx];
  if (!item || !item.canvas) return;

  const lbCanvas = document.getElementById('lbCanvas');
  const src      = item.canvas;

  lbCanvas.width  = src.width;
  lbCanvas.height = src.height;

  const ctx = lbCanvas.getContext('2d');
  ctx.drawImage(src, 0, 0);

  document.getElementById('lbInfo').textContent =
    `Slide ${idx+1} of ${canvases.length} · ${src.width}×${src.height}px`;
}

function lightboxNav(dir, e) {
  if (e) e.stopPropagation();
  const valid = canvases.filter(c=>c&&c.canvas);
  if (!valid.length) return;
  currentLbIndex = (currentLbIndex + dir + canvases.length) % canvases.length;
  /* Skip nulls */
  let tries = 0;
  while (!canvases[currentLbIndex] && tries < canvases.length) {
    currentLbIndex = (currentLbIndex + dir + canvases.length) % canvases.length;
    tries++;
  }
  renderLightbox(currentLbIndex);
}

function closeLightbox(e) {
  if (e && e.target !== document.getElementById('lightbox')) return;
  document.getElementById('lightbox').classList.add('hidden');
  document.body.style.overflow = '';
}

/* ===== VIEW MODE ===== */
function setViewMode(el, mode) {
  document.querySelectorAll('.pm-chip').forEach(c=>c.classList.remove('active'));
  el.classList.add('active');
  const grid  = document.getElementById('slidesContainer');
  const phone = document.getElementById('phoneContainer');
  if (mode === 'grid') {
    grid.classList.remove('hidden');
    phone.classList.add('hidden');
  } else {
    grid.classList.add('hidden');
    phone.classList.remove('hidden');
    renderPhoneSlide(currentPhoneIndex);
  }
}

/* ===== PHONE PREVIEW ===== */
function setupPhonePreview() {
  currentPhoneIndex = 0;
  const dotsRow = document.getElementById('phoneDotsRow');
  dotsRow.innerHTML = '';
  const valid = canvases.filter(c=>c&&c.canvas);
  valid.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.className = 'phone-dot' + (i===0?' active':'');
    dot.onclick = () => { currentPhoneIndex=i; renderPhoneSlide(i); };
    dotsRow.appendChild(dot);
  });
}

function renderPhoneSlide(idx) {
  const valid = canvases.filter(c=>c&&c.canvas);
  if (!valid.length || idx >= valid.length) return;

  const src = valid[idx].canvas;
  const dst = document.getElementById('phoneCanvas');
  dst.width  = src.width;
  dst.height = src.height;
  dst.getContext('2d').drawImage(src, 0, 0);

  /* Update dots */
  document.querySelectorAll('.phone-dot').forEach((d,i) => {
    d.classList.toggle('active', i===idx);
  });

  currentPhoneIndex = idx;
}

function phoneNav(dir) {
  const valid = canvases.filter(c=>c&&c.canvas);
  if (!valid.length) return;
  currentPhoneIndex = (currentPhoneIndex + dir + valid.length) % valid.length;
  renderPhoneSlide(currentPhoneIndex);
}

/* ===== DOWNLOAD ===== */
function doDownload(canvas, idx) {
  const ext   = selectedFmt==='image/jpeg' ? 'jpg' : 'png';
  const qual  = selectedFmt==='image/jpeg' ? 0.95  : 1.0;
  const ratio = selectedRatioLabel.replace(/[:/]/g,'x');
  const link  = document.createElement('a');
  link.download = `genalpha_slide${idx+1}_${ratio}.${ext}`;
  link.href     = canvas.toDataURL(selectedFmt,qual);
  link.click();
  updateDownloadCount();
}

function updateDownloadCount() {
  downloadCount++;
  document.getElementById('navDownCount').textContent = downloadCount;
}

function downloadSelected() {
  const selected = canvases.filter(item=>item&&item.check&&item.check.checked);
  if (!selected.length) { showToast('Koi slide select nahi!', 'warning'); return; }
  selected.forEach(item=>doDownload(item.canvas, canvases.indexOf(item)));
  showToast(`${selected.length} slide(s) downloaded!`, 'success');
}

function downloadAll() {
  const valid = canvases.filter(item=>item&&item.canvas);
  if (!valid.length) { showToast('No slides!', 'warning'); return; }
  valid.forEach(item=>doDownload(item.canvas, canvases.indexOf(item)));
  showToast(`All ${valid.length} slides downloaded!`, 'success');
}

function downloadZip() {
  const valid = canvases.filter(item=>item&&item.canvas);
  if (!valid.length) { showToast('No slides!', 'warning'); return; }
  showProgress('📦 Creating ZIP...');
  const zip   = new JSZip();
  const ext   = selectedFmt==='image/jpeg' ? 'jpg' : 'png';
  const qual  = selectedFmt==='image/jpeg' ? 0.95  : 1.0;
  const ratio = selectedRatioLabel.replace(/[:/]/g,'x');
  valid.forEach(item=>{
    const idx  = canvases.indexOf(item);
    const data = item.canvas.toDataURL(selectedFmt,qual).split(',')[1];
    zip.file(`genalpha_slide${idx+1}_${ratio}.${ext}`, data, {base64:true});
  });
  zip.generateAsync({type:'blob'}).then(content=>{
    const a = document.createElement('a');
    a.href  = URL.createObjectURL(content);
    a.download = `genalpha_${ratio}_${Date.now()}.zip`;
    a.click();
    hideProgress();
    showToast('ZIP downloaded! 🎉', 'success');
    updateDownloadCount();
  });
}

/* ===== PDF EXPORT ===== */
async function downloadPDF() {
  const valid = canvases.filter(item=>item&&item.canvas);
  if (!valid.length) { showToast('No slides to export!', 'warning'); return; }

  showProgress('📄 Creating PDF...');

  try {
    const { jsPDF } = window.jspdf;

    const firstCanvas = valid[0].canvas;
    const cw = firstCanvas.width;
    const ch = firstCanvas.height;

    /* Page size in mm - keep aspect ratio */
    const mmW = 210;
    const mmH = Math.round((ch / cw) * 210);

    const pdf = new jsPDF({
      orientation: mmW >= mmH ? 'landscape' : 'portrait',
      unit: 'mm',
      format: [mmW, mmH]
    });

    for (let i=0; i<valid.length; i++) {
      setProgress(i, valid.length);
      if (i > 0) pdf.addPage([mmW, mmH], mmW >= mmH ? 'landscape' : 'portrait');

      const dataUrl = valid[i].canvas.toDataURL('image/jpeg', 0.92);
      pdf.addImage(dataUrl, 'JPEG', 0, 0, mmW, mmH);
    }

    const ratio = selectedRatioLabel.replace(/[:/]/g,'x');
    pdf.save(`genalpha_${ratio}_${Date.now()}.pdf`);

    hideProgress();
    showToast(`PDF with ${valid.length} slides downloaded! 📄`, 'success');
    updateDownloadCount();

  } catch(e) {
    hideProgress();
    showToast('PDF error: ' + e.message, 'error');
    console.error('PDF error:', e);
  }
}

/* ===== CLEAR ALL ===== */
function clearAll() {
  document.getElementById('htmlInput').value='';
  document.getElementById('htmlInput').dispatchEvent(new Event('input'));
  document.getElementById('slidesContainer').innerHTML='';
  document.getElementById('selectAllRow').classList.add('hidden');
  document.getElementById('detectedBanner').classList.add('hidden');
  document.getElementById('previewModeRow').classList.add('hidden');
  document.getElementById('phoneContainer').classList.add('hidden');
  document.getElementById('selectAll').checked=false;
  document.getElementById('emptyDefault').style.display='block';
  document.getElementById('navSlideCount').textContent='0';
  document.getElementById('navSelectedCount').textContent='0';
  document.getElementById('navSize').textContent='—';

  /* Reset drop zone */
  loadedFileContent=null;
  const zone   = document.getElementById('dropZone');
  const loaded = document.getElementById('dropLoaded');
  loaded.classList.add('hidden');
  document.getElementById('dropIcon').classList.remove('hidden');
  document.getElementById('dropText').classList.remove('hidden');
  const sub = zone.querySelector('.drop-sub');
  if(sub) sub.classList.remove('hidden');
  zone.style.borderColor=''; zone.style.background=''; zone.style.cursor='pointer';
  document.getElementById('fileInput').value='';

  hideProgress();
  canvases=[]; detectedSlideW=0; detectedSlideH=0;
  selectedCount=0; updateSelectedUI();

  /* Clear localStorage */
  try { localStorage.removeItem('genalpha_html'); } catch(e) {}

  showToast('Sab clear!', 'info');
}