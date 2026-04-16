/* =============================================
   GenAlpha Pro Tool — script.js
   NEW: Drag & Drop + File Select
   ============================================= */

let canvases         = [];
let selectedFont     = 'Poppins';
let selectedScale    = 3;
let selectedW        = 1080;
let selectedH        = 1080;
let selectedFmt      = 'image/png';
let selectedFit      = 'contain';
let selectedRatioLabel = '1:1';
let selectedRatioName  = 'Square';
let downloadCount    = 0;
let detectedSlideW   = 0;
let detectedSlideH   = 0;
let loadedFileContent = null; // ✅ File ka HTML store hoga

/* ===== INIT ===== */
document.addEventListener('DOMContentLoaded', () => {
  initParticles();
  initTextareaCounter();
  updateRatioInfoBar();
  initGlobalDragDrop(); // ✅ Poore page pe drag drop
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
    p.style.cssText = `width:${size}px;height:${size}px;left:${Math.random()*100}%;background:${color};box-shadow:0 0 ${size*3}px ${color};animation-duration:${Math.random()*15+10}s;animation-delay:${Math.random()*12}s;`;
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
    if (len > 0) loadedFileContent = null; // textarea use hogi toh file clear
  });
}

/* ===================================================
   ✅ DRAG & DROP SYSTEM
   =================================================== */

/* Global drag — poore page pe */
function initGlobalDragDrop() {
  document.addEventListener('dragover', (e) => {
    e.preventDefault();
    if (hasHTMLFile(e)) {
      document.getElementById('dropZone').classList.add('dragover');
    }
  });

  document.addEventListener('dragleave', (e) => {
    /* Only remove if leaving the window */
    if (e.clientX === 0 && e.clientY === 0) {
      document.getElementById('dropZone').classList.remove('dragover');
    }
  });

  document.addEventListener('drop', (e) => {
    e.preventDefault();
    document.getElementById('dropZone').classList.remove('dragover');
    if (hasHTMLFile(e)) {
      processDroppedFile(e.dataTransfer.files[0]);
    }
  });
}

function hasHTMLFile(e) {
  if (!e.dataTransfer || !e.dataTransfer.files) return false;
  const file = e.dataTransfer.files[0];
  return file && (file.name.endsWith('.html') || file.name.endsWith('.htm') || file.type === 'text/html');
}

/* Drop Zone specific handlers */
function handleDragOver(e) {
  e.preventDefault();
  e.stopPropagation();
  document.getElementById('dropZone').classList.add('dragover');
}

function handleDragLeave(e) {
  e.stopPropagation();
  /* Check if leaving drop zone */
  const zone = document.getElementById('dropZone');
  if (!zone.contains(e.relatedTarget)) {
    zone.classList.remove('dragover');
  }
}

function handleDrop(e) {
  e.preventDefault();
  e.stopPropagation();
  document.getElementById('dropZone').classList.remove('dragover');

  const file = e.dataTransfer.files[0];
  if (!file) return;

  if (!file.name.endsWith('.html') && !file.name.endsWith('.htm')) {
    showToast('Sirf .html ya .htm file drop karo!', 'error');
    return;
  }

  processDroppedFile(file);
}

/* File input select */
function triggerFileInput() {
  /* Agar loaded state shown hai toh click = nothing */
  if (!document.getElementById('dropLoaded').classList.contains('hidden')) return;
  document.getElementById('fileInput').click();
}

function handleFileSelect(e) {
  const file = e.target.files[0];
  if (!file) return;
  processDroppedFile(file);
}

/* ✅ CORE: File padhna */
function processDroppedFile(file) {
  if (!file.name.endsWith('.html') && !file.name.endsWith('.htm')) {
    showToast('Sirf HTML file support hai!', 'error');
    return;
  }

  const reader = new FileReader();

  reader.onload = (e) => {
    const content = e.target.result;

    /* Validate: .slide class hai? */
    if (!content.includes('class="slide"') && !content.includes("class='slide'")) {
      showToast('⚠️ Warning: .slide class nahi mili! Preview try karo.', 'warning', 4000);
    }

    /* Store content */
    loadedFileContent = content;

    /* Textarea mein bhi dalo (optional preview) */
    const ta = document.getElementById('htmlInput');
    ta.value = content;
    ta.dispatchEvent(new Event('input'));

    /* Show loaded state in drop zone */
    showDropLoaded(file);

    showToast(`✅ "${file.name}" loaded! Preview karo.`, 'success', 3000);
  };

  reader.onerror = () => {
    showToast('File read karne mein error!', 'error');
  };

  reader.readAsText(file, 'UTF-8');
}

/* Show loaded file info in drop zone */
function showDropLoaded(file) {
  const zone    = document.getElementById('dropZone');
  const loaded  = document.getElementById('dropLoaded');
  const icon    = document.getElementById('dropIcon');
  const text    = document.getElementById('dropText');
  const sub     = zone.querySelector('.drop-sub');

  /* Hide default UI */
  icon.classList.add('hidden');
  text.classList.add('hidden');
  if (sub) sub.classList.add('hidden');

  /* Show loaded */
  loaded.classList.remove('hidden');
  document.getElementById('dlFileName').textContent = file.name;
  document.getElementById('dlFileSize').textContent = formatFileSize(file.size);

  /* Style zone */
  zone.style.borderColor  = 'rgba(16,185,129,0.5)';
  zone.style.background   = 'rgba(16,185,129,0.06)';
  zone.style.cursor       = 'default';
}

/* Remove file */
function removeFile(e) {
  e.stopPropagation();

  loadedFileContent = null;

  /* Reset drop zone */
  const zone   = document.getElementById('dropZone');
  const loaded = document.getElementById('dropLoaded');
  const icon   = document.getElementById('dropIcon');
  const text   = document.getElementById('dropText');
  const sub    = zone.querySelector('.drop-sub');

  loaded.classList.add('hidden');
  icon.classList.remove('hidden');
  text.classList.remove('hidden');
  if (sub) sub.classList.remove('hidden');

  zone.style.borderColor = '';
  zone.style.background  = '';
  zone.style.cursor      = 'pointer';

  /* Clear textarea & file input */
  document.getElementById('htmlInput').value = '';
  document.getElementById('htmlInput').dispatchEvent(new Event('input'));
  document.getElementById('fileInput').value = '';

  showToast('File removed', 'info', 1500);
}

/* Format file size */
function formatFileSize(bytes) {
  if (bytes < 1024)       return bytes + ' B';
  if (bytes < 1024*1024)  return (bytes/1024).toFixed(1) + ' KB';
  return (bytes/1024/1024).toFixed(2) + ' MB';
}

/* ===== THEME ===== */
function toggleTheme() {
  document.body.classList.toggle('light');
  document.getElementById('themeIcon').className =
    document.body.classList.contains('light') ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
  showToast(document.body.classList.contains('light') ? '☀️ Light mode' : '🌙 Dark mode','info',1500);
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
  const sizeStr = selectedW === 0 ? 'Auto' : `${selectedW}×${selectedH}`;
  showToast(`${selectedRatioName} · ${sizeStr}`,'info',1500);
}

function updateRatioInfoBar() {
  document.getElementById('ribRatio').textContent = selectedRatioLabel;
  document.getElementById('ribSize').textContent  =
    selectedW === 0 ? 'Auto (HTML Size)' : `${selectedW} × ${selectedH} px`;
  document.getElementById('ribName').textContent  = selectedRatioName;
  document.getElementById('ribMode').textContent  =
    selectedW === 0
      ? '✨ Captures exact HTML slide size'
      : `Fit: ${selectedFit} · Scale ${selectedScale}x`;
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
  if (!w || !h || w<100 || h<100) { showToast('Min 100px chahiye','error'); return; }
  if (w>8000 || h>8000)           { showToast('Max 8000px','warning'); return; }
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
  prev.style.opacity='0'; prev.style.transform='translateY(8px)';
  setTimeout(() => {
    prev.style.fontFamily = selectedFont==='none' ? 'inherit' : `'${selectedFont}'`;
    label.textContent     = selectedFont==='none' ? 'Original' : selectedFont;
    prev.style.opacity='1'; prev.style.transform='translateY(0)';
    prev.style.transition='all 0.35s ease';
  }, 180);
  showToast(selectedFont==='none'?'Original font':'Font: '+selectedFont,'info',1500);
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

/* ===== FIT ===== */
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
    loadedFileContent = null;
    showToast('Pasted!','success');
  } catch(e) { showToast('Clipboard access denied','error'); }
}

function clearInput() {
  document.getElementById('htmlInput').value = '';
  document.getElementById('htmlInput').dispatchEvent(new Event('input'));
  showToast('Cleared','info',1500);
}

/* ===== TOAST ===== */
function showToast(msg, type='info', duration=3000) {
  const icons = {success:'✅',error:'❌',info:'ℹ️',warning:'⚠️'};
  document.querySelectorAll(`.toast.${type}`).forEach(t=>t.remove());
  const toast = document.createElement('div');
  toast.className=`toast ${type}`;
  toast.innerHTML=`<span>${icons[type]}</span><span>${msg}</span>`;
  document.body.appendChild(toast);
  setTimeout(()=>{
    toast.style.animation='toastOut 0.4s ease forwards';
    setTimeout(()=>toast.remove(),400);
  },duration);
}

/* ===== PROGRESS ===== */
function setProgress(cur,total) {
  const pct = total>0 ? Math.round((cur/total)*100) : 0;
  document.getElementById('progressFill').style.width = pct+'%';
  document.getElementById('progressPct').textContent  = pct+'%';
}
function showProgress(msg) {
  document.getElementById('progressWrap').classList.remove('hidden');
  document.getElementById('statusText').textContent = msg;
}
function hideProgress() {
  document.getElementById('progressWrap').classList.add('hidden');
  setProgress(0,1);
}

/* ===== GET HTML SOURCE ===== */
function getHTMLSource() {
  /* Priority: file > textarea */
  if (loadedFileContent && loadedFileContent.trim()) return loadedFileContent;
  return document.getElementById('htmlInput').value.trim();
}

/* ===== SLIDE SIZE DETECT ===== */
function getSlideRect(slide) {
  const cs = slide.ownerDocument.defaultView.getComputedStyle(slide);
  const w  = parseFloat(cs.width)  || slide.getBoundingClientRect().width;
  const h  = parseFloat(cs.height) || slide.getBoundingClientRect().height;
  return { w: Math.round(w), h: Math.round(h) };
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
    ctx.fillStyle='#000'; ctx.fillRect(0,0,outW,outH);
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
    const fs   = iframeDoc.createElement('style');
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

  container.innerHTML='';
  selectRow.classList.add('hidden');
  detectedBnr.classList.add('hidden');
  canvases=[]; detectedSlideW=0; detectedSlideH=0;

  /* ✅ Get HTML from file OR textarea */
  const html = getHTMLSource();
  if (!html) {
    showToast('Pehle HTML file drop karo ya paste karo!','warning');
    return;
  }

  emptyDef.style.display='none';
  showProgress('🔄 Setting up...');

  /* Step 1: Measure */
  const mIframe = document.createElement('iframe');
  mIframe.style.cssText='position:fixed;left:-19999px;top:0;width:1600px;height:2000px;border:none;visibility:hidden;z-index:-1;';
  document.body.appendChild(mIframe);
  mIframe.contentDocument.open();
  mIframe.contentDocument.write(html);
  mIframe.contentDocument.close();

  showProgress('📐 Measuring slide size...');
  await new Promise(r=>setTimeout(r,1500));

  const mSlides = mIframe.contentDocument.querySelectorAll('.slide');
  if (mSlides.length===0) {
    hideProgress();
    container.innerHTML=`<div class="error-card">❌ No slides found!<br/><small style="font-weight:400;font-size:13px;display:block;margin-top:8px;color:#94a3b8">Each slide must have <code style="background:rgba(239,68,68,0.2);padding:2px 8px;border-radius:5px">class="slide"</code></small></div>`;
    mIframe.remove();
    showToast('No .slide class mili!','error');
    return;
  }

  const slRect    = getSlideRect(mSlides[0]);
  detectedSlideW  = slRect.w || 1080;
  detectedSlideH  = slRect.h || 1080;
  mIframe.remove();

  /* Update UI */
  document.getElementById('navSize').textContent     = `${detectedSlideW}×${detectedSlideH}`;
  document.getElementById('detectedText').textContent = `Slide detected: ${detectedSlideW}×${detectedSlideH}px`;
  document.getElementById('detectedBadge').textContent = selectedW===0
    ? `As-Is · ${selectedScale}x`
    : `→ ${selectedW}×${selectedH} (${selectedFit})`;
  detectedBnr.classList.remove('hidden');

  /* Step 2: Render iframe */
  showProgress('⚙️ Preparing render...');
  const iframe = document.createElement('iframe');
  iframe.style.cssText=`position:fixed;left:-19999px;top:0;width:${detectedSlideW}px;height:${detectedSlideH*10+500}px;border:none;visibility:hidden;z-index:-1;`;
  document.body.appendChild(iframe);
  iframe.contentDocument.open();
  iframe.contentDocument.write(html);
  iframe.contentDocument.close();
  injectIframeStyles(iframe.contentDocument, detectedSlideW);

  showProgress('⏳ Loading fonts & assets...');
  await new Promise(r=>setTimeout(r,3000));

  const slides = iframe.contentDocument.querySelectorAll('.slide');
  document.getElementById('navSlideCount').textContent = slides.length;

  /* Step 3: Capture */
  for (let i=0; i<slides.length; i++) {
    showProgress(`🎨 Capturing slide ${i+1} of ${slides.length}...`);
    setProgress(i, slides.length);

    try {
      const rawCanvas = await html2canvas(slides[i], {
        scale: selectedScale,
        useCORS: true,
        allowTaint: true,
        width: detectedSlideW,
        height: detectedSlideH,
        x:0, y:0, scrollX:0, scrollY:0,
        windowWidth: detectedSlideW,
        windowHeight: detectedSlideH,
        backgroundColor: null,
        logging: false,
        onclone: (clonedDoc) => {
          const cs = clonedDoc.querySelectorAll('.slide');
          if (cs[i]) {
            cs[i].style.width    = detectedSlideW+'px';
            cs[i].style.height   = detectedSlideH+'px';
            cs[i].style.overflow = 'hidden';
            cs[i].style.position = 'relative';
          }
        }
      });

      const outW = selectedW===0 ? detectedSlideW*selectedScale : selectedW*selectedScale;
      const outH = selectedH===0 ? detectedSlideH*selectedScale : selectedH*selectedScale;
      const finalCanvas = selectedW===0 ? rawCanvas : resizeCanvas(rawCanvas,outW,outH,selectedFit);

      buildSlideCard(finalCanvas, i, slides.length, container);

    } catch(e) {
      const err = document.createElement('div');
      err.className='error-card';
      err.innerHTML=`❌ Slide ${i+1} error<br/><small>${e.message}</small>`;
      container.appendChild(err);
      canvases[i] = null;
      console.error(e);
    }
  }

  iframe.remove();
  setProgress(slides.length, slides.length);
  await new Promise(r=>setTimeout(r,400));
  hideProgress();

  selectRow.classList.remove('hidden');
  const outDesc = selectedW===0
    ? `${detectedSlideW}×${detectedSlideH} (Original)`
    : `${selectedW}×${selectedH} (${selectedRatioLabel})`;
  document.getElementById('slideCount').textContent =
    `${slides.length} slide${slides.length>1?'s':''} · ${outDesc}`;

  showToast(`🎉 ${slides.length} slides ready!`,'success');
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
      checkBox.classList.add('checked');
      checkBox.textContent='✓';
      checkLbl.textContent='Selected ✓';
      checkLbl.style.color='var(--primary-light)';
    } else {
      box.classList.remove('selected');
      checkBox.classList.remove('checked');
      checkBox.textContent='';
      checkLbl.textContent='Select';
      checkLbl.style.color='';
    }
  });

  checkWrap.appendChild(checkInput);
  checkWrap.appendChild(checkLbl);
  checkWrap.appendChild(checkBox);
  header.appendChild(numBadge);
  header.appendChild(checkWrap);

  const wrap    = document.createElement('div');
  wrap.className='slide-canvas-wrap';
  const overlay = document.createElement('div');
  overlay.className='slide-overlay';
  const overlayBtn = document.createElement('button');
  overlayBtn.className='overlay-dl';
  overlayBtn.innerHTML='<i class="fa-solid fa-download"></i> Quick Download';
  overlayBtn.onclick=()=>{ doDownload(canvas,idx); showToast(`Slide ${idx+1} downloaded!`,'success'); };
  overlay.appendChild(overlayBtn);
  wrap.appendChild(canvas);
  wrap.appendChild(overlay);

  const strip = document.createElement('div');
  strip.className='slide-info-strip';
  const ratioSpan = document.createElement('span');
  ratioSpan.className='sis-ratio';
  ratioSpan.textContent = selectedW===0 ? `${detectedSlideW}×${detectedSlideH}` : selectedRatioLabel;
  const sizeSpan = document.createElement('span');
  sizeSpan.className='sis-size';
  sizeSpan.textContent=`${canvas.width}×${canvas.height}px`;
  strip.appendChild(ratioSpan);
  strip.appendChild(sizeSpan);

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

  footer.appendChild(dlBtn);
  footer.appendChild(copyBtn);
  box.appendChild(header);
  box.appendChild(wrap);
  box.appendChild(strip);
  box.appendChild(footer);
  container.appendChild(box);

  /* ✅ Store immediately */
  canvases[idx] = { canvas, check: checkInput };
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
  if (!selected.length) { showToast('Koi slide select nahi hai!','warning'); return; }
  selected.forEach(item=>{ doDownload(item.canvas, canvases.indexOf(item)); });
  showToast(`${selected.length} slide(s) downloaded!`,'success');
}

function downloadAll() {
  const valid = canvases.filter(item=>item&&item.canvas);
  if (!valid.length) { showToast('No slides!','warning'); return; }
  valid.forEach(item=>{ doDownload(item.canvas, canvases.indexOf(item)); });
  showToast(`All ${valid.length} slides downloaded!`,'success');
}

function downloadZip() {
  const valid = canvases.filter(item=>item&&item.canvas);
  if (!valid.length) { showToast('No slides!','warning'); return; }
  showProgress('📦 Creating ZIP...');
  const zip  = new JSZip();
  const ext  = selectedFmt==='image/jpeg' ? 'jpg' : 'png';
  const qual = selectedFmt==='image/jpeg' ? 0.95  : 1.0;
  const ratio = selectedRatioLabel.replace(/[:/]/g,'x');
  valid.forEach(item=>{
    const idx  = canvases.indexOf(item);
    const data = item.canvas.toDataURL(selectedFmt,qual).split(',')[1];
    zip.file(`genalpha_slide${idx+1}_${ratio}.${ext}`,data,{base64:true});
  });
  zip.generateAsync({type:'blob'}).then(content=>{
    const a = document.createElement('a');
    a.href  = URL.createObjectURL(content);
    a.download = `genalpha_${ratio}_${Date.now()}.zip`;
    a.click();
    hideProgress();
    showToast('ZIP downloaded! 🎉','success');
    updateDownloadCount();
  });
}

function clearAll() {
  document.getElementById('htmlInput').value='';
  document.getElementById('htmlInput').dispatchEvent(new Event('input'));
  document.getElementById('slidesContainer').innerHTML='';
  document.getElementById('selectAllRow').classList.add('hidden');
  document.getElementById('detectedBanner').classList.add('hidden');
  document.getElementById('selectAll').checked=false;
  document.getElementById('emptyDefault').style.display='block';
  document.getElementById('navSlideCount').textContent='0';
  document.getElementById('navSize').textContent='—';

  /* Reset file drop zone */
  loadedFileContent = null;
  const zone   = document.getElementById('dropZone');
  const loaded = document.getElementById('dropLoaded');
  const icon   = document.getElementById('dropIcon');
  const text   = document.getElementById('dropText');
  const sub    = zone.querySelector('.drop-sub');
  loaded.classList.add('hidden');
  icon.classList.remove('hidden');
  text.classList.remove('hidden');
  if(sub) sub.classList.remove('hidden');
  zone.style.borderColor=''; zone.style.background=''; zone.style.cursor='pointer';
  document.getElementById('fileInput').value='';

  hideProgress();
  canvases=[]; detectedSlideW=0; detectedSlideH=0;
  showToast('Sab clear!','info');
}