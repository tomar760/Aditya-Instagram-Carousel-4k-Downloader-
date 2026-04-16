let canvases = [];
let currentFont = "";

/* FONT CHANGE */
document.getElementById("fontSelector").addEventListener("change",()=>{
  currentFont = document.getElementById("fontSelector").value;
  loadSlides();
});

/* FILE UPLOAD */
document.getElementById("fileInput").addEventListener("change",(e)=>{
  const file = e.target.files[0];
  const reader = new FileReader();
  reader.onload = function(e){
    document.getElementById("htmlInput").value = e.target.result;
  };
  reader.readAsText(file);
});

/* MAIN FUNCTION */
async function loadSlides(){
  const container = document.getElementById("slidesContainer");
  container.innerHTML = "⏳ Rendering...";
  canvases = [];

  let html = document.getElementById("htmlInput").value;
  if(!html) return alert("Paste HTML first");

  const iframe = document.createElement("iframe");
  iframe.style.position="absolute";
  iframe.style.left="-9999px";
  document.body.appendChild(iframe);

  iframe.contentDocument.open();
  iframe.contentDocument.write(html);
  iframe.contentDocument.close();

  await new Promise(r=>setTimeout(r,2500));

  const slides = iframe.contentDocument.querySelectorAll(".slide");

  if(slides.length===0){
    container.innerHTML="❌ No slides found";
    return;
  }

  container.innerHTML="";

  for(let i=0;i<slides.length;i++){

    if(currentFont){
      slides[i].querySelectorAll("*").forEach(el=>{
        el.style.fontFamily=currentFont;
      });
    }

    try{
      const canvas = await html2canvas(slides[i],{
        scale:3,
        useCORS:true,
        width:1080,
        height:1350
      });

      const box = document.createElement("div");
      box.className="slideBox";

      const check = document.createElement("input");
      check.type="checkbox";

      check.onclick=()=>{
        box.classList.toggle("selected");
      };

      box.appendChild(check);
      box.appendChild(canvas);

      container.appendChild(box);

      canvases.push({canvas,check});
    }
    catch{
      const err=document.createElement("div");
      err.innerText="❌ Slide "+(i+1)+" failed";
      container.appendChild(err);
    }
  }

  iframe.remove();
}

/* DOWNLOADS */
function downloadCanvas(canvas,name){
  const a=document.createElement("a");
  a.download=name;
  a.href=canvas.toDataURL("image/png");
  a.click();
}

function downloadSelected(){
  canvases.forEach((item,i)=>{
    if(item.check.checked){
      downloadCanvas(item.canvas,"slide_"+(i+1)+".png");
    }
  });
}

function downloadAll(){
  canvases.forEach((item,i)=>{
    downloadCanvas(item.canvas,"slide_"+(i+1)+".png");
  });
}

function downloadZip(){
  const zip=new JSZip();

  canvases.forEach((item,i)=>{
    const img=item.canvas.toDataURL().split(",")[1];
    zip.file("slide_"+(i+1)+".png",img,{base64:true});
  });

  zip.generateAsync({type:"blob"}).then(content=>{
    const a=document.createElement("a");
    a.href=URL.createObjectURL(content);
    a.download="slides.zip";
    a.click();
  });
}

function clearAll(){
  document.getElementById("htmlInput").value="";
  document.getElementById("slidesContainer").innerHTML="";
}
