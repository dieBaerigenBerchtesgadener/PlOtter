var uploadButton = document.getElementById("upload-button");
var aiButton = document.getElementById("ai-button");
var convertButton = document.getElementById("convert-button");
var checkboxSchraffur = document.getElementById("checkboxSchraffur");
var checkboxKonturen = document.getElementById("checkboxKonturen");
var checkboxInverted = document.getElementById("checkboxInverted");
var konturenRange = document.getElementById("konturen-range");
var schraffurRange = document.getElementById("schraffur-range");
var noiseRange = document.getElementById("noise-range");
var imagePreview = document.getElementById("image-preview");
var printButton = document.getElementById("print-button");
var schraffurContainer = document.getElementById("schraffur-container");
var konturenContainer = document.getElementById("konturen-container");
var invertedContainer = document.getElementById("inverted-container");
var inputContainerAI = document.getElementById("input-container-ai");
var inputAI = document.getElementById("input-ai");
var devContainer = document.getElementById("dev-container");
var resetButton = document.getElementById("reset-button");
var zoomIn = document.getElementById("zoom-in");
var zoomOut = document.getElementById("zoom-out");
var roundButtonContainer = document.getElementById("round-button-container");
var rotateButton = document.getElementById("rotate");
var clickPoint = document.getElementById("click-point");
var removeBackground = document.getElementById("removeBackground");
var stopPrintingButton = document.getElementById("stop-button");
var shutdownServerButton = document.getElementById("shutdownServer-button");
var shutdownButton = document.getElementById("shutdown-button");
var rebootButton = document.getElementById("reboot-button");
var rebootServerButton = document.getElementById("rebootServer-button");
var downloadButton = document.getElementById("download-button");
var devModeButton = document.getElementById("devModeOff-button");
var svgAI = document.getElementById("svgAI");
var cropButton = document.getElementById("cropButton");
var editContainer = document.getElementById("edit-container");

var withDrawing = false;
var removeBackgroundValue = false;
var autoConvert = false;

let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');
let sketchCanvas = document.getElementById('sketchCanvas');
let sketchCtx = sketchCanvas.getContext('2d');

var svg = document.querySelector('svg');
var config = {}; 
window.config = config;

var scaleFactor = 1.2; // Der Faktor, um den das Bild vergrößert oder verkleinert wird

let lines = []; // Global variable to store lines
var currentSelection = 'middle';

// Start loadWorker when Website is loaded
document.addEventListener('DOMContentLoaded', (event) => {
  loadWorker();
  document.querySelectorAll('input[name="btn"]').forEach(function(radio) {
    radio.addEventListener('change', function() {
        currentSelection = this.value;
        let strokeWidth;
        switch(currentSelection) {
          case 'weak':
            strokeWidth = '1px';
            break;
          case 'middle':
            strokeWidth = '2px';
            break;
          case 'strong':
            strokeWidth = '3px';
            break;
          default:
            strokeWidth = '2px'; // Standardwert
        }
        svg.children[0].style.strokeWidth = strokeWidth;
    });
  });
});

// Load model for removing background
import { InteractiveSegmenter, FilesetResolver } from "/static/js/node_modules/@mediapipe/tasks-vision/vision_bundle.mjs";
let interactiveSegmenter;
// Before we can use InteractiveSegmenter class we must wait for it to finish
// loading. Machine Learning models can be large and take a moment to
// get everything needed to run.
const createSegmenter = async () => {
    const filesetResolver = await FilesetResolver.forVisionTasks("static/js/node_modules/@mediapipe/tasks-vision/wasm");
    interactiveSegmenter = await InteractiveSegmenter.createFromOptions(filesetResolver, {
        baseOptions: {
            modelAssetPath: `/static/models/magic_touch.tflite`,
            delegate: "GPU"
        },
        outputCategoryMask: true,
        outputConfidenceMasks: false
    });
};
createSegmenter();

/*Button*/
const button = document.getElementById("print-button");
const buttonSpan = button.querySelector("span");

// Event listeners
uploadButton.addEventListener("click", selectImage);
aiButton.addEventListener("click", selectAi);
convertButton.addEventListener("click", convertStart);
resetButton.addEventListener("click", resetCanvas);
printButton.addEventListener("click", printImage);
stopPrintingButton.addEventListener("click", stopPrinting);
shutdownServerButton.addEventListener("click", shutdownServer);
shutdownButton.addEventListener("click", shutdown);
rebootButton.addEventListener("click", reboot);
rebootServerButton.addEventListener("click", rebootServer);
downloadButton.addEventListener("click", download);
devModeButton.addEventListener("click", devMode);
imagePreview.addEventListener("click", selectImage);
svgAI.addEventListener("click", generateAi);
inputAI.addEventListener("keydown", handleKeyPress);

button.addEventListener("click", function(event) {
  event.preventDefault(); // Verhindert das Neuladen der Seite

  buttonSpan.classList.add("button-clicked");
});

button.addEventListener("mouseleave", function() {
  buttonSpan.classList.remove("button-clicked");
}); 

document.querySelector('form').addEventListener('submit', function(event) {
  event.preventDefault();
});

// Slider event listeners
konturenRange.addEventListener("input", updateConfigValues);
schraffurRange.addEventListener("input", updateConfigValues);
noiseRange.addEventListener("input", updateConfigValues);
checkboxKonturen.addEventListener("change", updateConfigValues);
checkboxSchraffur.addEventListener("change", updateConfigValues);
checkboxInverted.addEventListener("change", updateConfigValues);

checkboxSchraffur.addEventListener("change", function() {
  if (!this.checked) {
    schraffurContainer.style.opacity = 0.5;
    schraffurRange.disabled = true;
  } else {
    schraffurContainer.style.opacity = 1;
    schraffurRange.disabled = false;
  }
});

checkboxKonturen.addEventListener("change", function() {
  if (!this.checked) {
    konturenContainer.style.opacity = 0.5;
    konturenRange.disabled = true;
  } else {
    konturenContainer.style.opacity = 1;
    konturenRange.disabled = false;
  }
});

checkboxInverted.addEventListener("change", function() {
  if (!this.checked) {
    invertedContainer.style.opacity = 0.5;
  } else {
    invertedContainer.style.opacity = 1;
  }
});

removeBackground.addEventListener('click', function() {
  removeBackgroundValue = !removeBackgroundValue;
  if (removeBackgroundValue) {
    removeBackground.style.boxShadow = "0px 0px var(--main-color)";
    removeBackground.style.transform = "translate(3px, 3px)";
  } else {
    removeBackground.style.boxShadow = "";
    removeBackground.style.transform = "";
  }
});


if (!window.config['Contour detail']) {
  window.config['Contour detail'] = 2;
}
if (!window.config['Hatch scale']) {
  window.config['Hatch scale'] = 16;
}
if (!window.config['Noise scale']) {
  window.config['Noise scale'] = 1;
}
if (config.Contours === undefined) {
  config.Contours = true;
}
if (config.Hatching === undefined) {
  config.Hatching = true;
}
if (config.Inverted === undefined) {
  config.Inverted = false;
}

function updateConfigValues() {
  var konturenDisplay = document.getElementById("konturen-display");
  konturenDisplay.textContent = konturenRange.value;
  window.config['Contour detail'] = parseInt(konturenRange.value);

  var schraffurDisplay = document.getElementById("schraffur-display");
  schraffurDisplay.textContent = schraffurRange.value;
  window.config['Hatch scale'] = parseInt(schraffurRange.value);

  var noiseDisplay = document.getElementById("noise-display");
  noiseDisplay.textContent = noiseRange.value;
  window.config['Noise scale'] = parseInt(noiseRange.value);

  window.config.Contours = checkboxKonturen.checked;
  window.config.Hatching = checkboxSchraffur.checked;
  window.config.Inverted = checkboxInverted.checked;
  
  if (autoConvert) {
    convert();
  }
}

function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function selectImage() {
  inputContainerAI.style.display = 'none';
  svg.style.display = 'none';
  let d = document.createElement('input');
  d.type = 'file';
  d.accept = 'image/*';
  d.onchange = function(e) {
    let img = new Image();
    img.onload = function() {
      handleImage(img);
    };
    img.src = URL.createObjectURL(e.target.files[0]);
  }
  d.click();
}

function handleImage(img) {
  let offsetX, offsetY, mouseX, mouseY;
  let dragging = false;

  let w = img.width;
  let h = img.height;

  // Setze cw und ch auf die Breite und Höhe des Canvas
  let cw = canvas.width;
  let ch = canvas.height;

  // Berechne die Skalierung, um das Bild vollständig im Canvas anzuzeigen
  let scale = Math.min(cw / w, ch / h);
  let scaledW = scale * w;
  let scaledH = scale * h;

  // Berechne den Offset, um das Bild zu zentrieren
  offsetX = (cw - scaledW) / 2;
  offsetY = (ch - scaledH) / 2;

  // Zeichnen Sie das Bild auf dem Canvas
  ctx.clearRect(0, 0, cw, ch);
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, cw, ch);
  ctx.drawImage(img, offsetX, offsetY, scaledW, scaledH);

  // Computer
  canvas.onmousedown = function(e) {
    if (!removeBackgroundValue) {
      mouseX = e.clientX - canvas.offsetLeft;
      mouseY = e.clientY - canvas.offsetTop;
      dragging = true;
    }else{
      handleClick(e);
    }
  };

  canvas.onmouseup = function() {
    dragging = false;
  };

  canvas.onmousemove = function(e) {
    if (dragging && !removeBackgroundValue) {
      let x = e.clientX - canvas.offsetLeft;
      let y = e.clientY - canvas.offsetTop;
      let dx = x - mouseX;
      let dy = y - mouseY;
      offsetX += dx;
      offsetY += dy;
      mouseX = x;
      mouseY = y;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, cw, ch);
      ctx.drawImage(img, offsetX, offsetY, scaledW, scaledH);
    }
  };

  // Set up touch events for mobile, etc
  canvas.addEventListener("touchstart", function (e) {
    var mousePos = getTouchPos(canvas, e);
    var touch = e.touches[0];
    var mouseEvent = new MouseEvent("mousedown", {
      clientX: touch.clientX,
      clientY: touch.clientY
    });
    canvas.dispatchEvent(mouseEvent);
    e.preventDefault();
  }, false);

  canvas.addEventListener("touchend", function (e) {
    var mouseEvent = new MouseEvent("mouseup", {});
    canvas.dispatchEvent(mouseEvent);
    e.preventDefault();
  }, false);

  canvas.addEventListener("touchmove", function (e) {
    var touch = e.touches[0];
    var mouseEvent = new MouseEvent("mousemove", {
      clientX: touch.clientX,
      clientY: touch.clientY
    });
    canvas.dispatchEvent(mouseEvent);
    e.preventDefault();
  }, false);

  // Get the position of a touch relative to the canvas
  function getTouchPos(canvasDom, touchEvent) {
    var rect = canvasDom.getBoundingClientRect();
    return {
      x: touchEvent.touches[0].clientX - rect.left,
      y: touchEvent.touches[0].clientY - rect.top
    };
  }

  /*
  canvas.addEventListener('click', function(e) {
    if (removeBackgroundValue) {
      handleClick(e);
    }
  });
  */
  zoomIn.addEventListener('click', function() {
    // Vergrößere das Bild
    scaledW *= scaleFactor;
    scaledH *= scaleFactor;

    // Berechne den Offset neu, um das Bild zu zentrieren
    //offsetX = (cw - scaledW) / 2;
    //offsetY = (ch - scaledH) / 2;
  
    // Zeichne das Bild auf dem Canvas
    ctx.clearRect(0, 0, cw, ch);
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, cw, ch);
    ctx.drawImage(img, offsetX, offsetY, scaledW, scaledH);
  });
  
  zoomOut.addEventListener('click', function() {
    // Verkleinere das Bild
    scaledW /= scaleFactor;
    scaledH /= scaleFactor;
  
    // Berechne den Offset neu, um das Bild zu zentrieren
    //offsetX = (cw - scaledW) / 2;
    //offsetY = (ch - scaledH) / 2;
  
    // Zeichne das Bild auf dem Canvas
    ctx.clearRect(0, 0, cw, ch);
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, cw, ch);
    ctx.drawImage(img, offsetX, offsetY, scaledW, scaledH);
  });
  
  let rotation = 0; // Variable zur Speicherung des Drehwinkels

  rotate.addEventListener('click', function() {
    // Erhöhe den Drehwinkel um 90 Grad
    rotation = (rotation + 90) % 360;
  
    // Lösche den Canvas
    ctx.clearRect(0, 0, cw, ch);
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, cw, ch);
  
    // Speichere den aktuellen Zustand des Kontexts
    ctx.save();
  
    // Verschiebe den Ursprung zur Mitte des Bildes
    ctx.translate(offsetX + scaledW / 2, offsetY + scaledH / 2);
  
    // Drehe den Kontext um den aktuellen Drehwinkel
    ctx.rotate(rotation * Math.PI / 180);
  
    // Zeichne das Bild mit dem Offset, um es um den Mittelpunkt zu drehen
    ctx.drawImage(img, -scaledW / 2, -scaledH / 2, scaledW, scaledH);
  
    // Stelle den vorherigen Zustand des Kontexts wieder her
    ctx.restore();
  });

  /*
  // Mobile
  canvas.addEventListener('touchstart', function(e) {
    // Starte Verschieben
    mouseX = e.touches[0].clientX - canvas.offsetLeft;
    mouseY = e.touches[0].clientY - canvas.offsetTop;
    dragging = true;
    e.preventDefault();
  });
  
  canvas.addEventListener('touchmove', function(e) {
    if (dragging && e.touches.length === 1) {
      let x = e.touches[0].clientX - canvas.offsetLeft;
      let y = e.touches[0].clientY - canvas.offsetTop;
      let dx = x - mouseX;
      let dy = y - mouseY;
      offsetX += dx;
      offsetY += dy;
      mouseX = x;
      mouseY = y;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, cw, ch);
      ctx.drawImage(img, offsetX, offsetY, scaledW, scaledH);
      e.preventDefault();
    }
  });
  */


  // Blende das image-preview Element aus und zeige das canvas Element an
  roundButtonContainer.style.display = 'block';
  imagePreview.style.display = 'none';
  convertButton.style.display = 'block';
  canvas.style.display = 'block';

  // Image Segmentation
  async function handleClick(event) {
    console.log('click');
    if (!interactiveSegmenter) {
      alert("InteractiveSegmenter still loading. Try again shortly.");
      return;
    }
  
    let rect = event.target.getBoundingClientRect();
    let offsetX, offsetY;
  
    if (event.type === 'touchstart' || event.type === 'touchmove') {
      offsetX = event.touches[0].clientX - rect.left;
      offsetY = event.touches[0].clientY - rect.top;
    } else {
      offsetX = event.offsetX;
      offsetY = event.offsetY;
    }
  
    offsetX *= event.target.width / rect.width;
    offsetY *= event.target.height / rect.height;
  
    console.log("Clicked position 1:", offsetX, offsetY);
    interactiveSegmenter.segment(event.target, {
      keypoint: {
        x: offsetX / event.target.width,
        y: offsetY / event.target.height
      }
    }, (result) => {
      drawSegmentation(result.categoryMask);
      drawClickPoint(event);
      console.log("Clicked position:", offsetX, offsetY);
      cropButton.style.visibility = "visible";
      cropButton.addEventListener("click", () => {
        cutSegmentation(result.categoryMask);
        cropButton.style.visibility = "hidden";
        clickPoint.style.display = "none";
        removeBackgroundValue = false;
        removeBackground.style.boxShadow = "";
        removeBackground.style.transform = "";
      });
    });
  }

    /**
   * Draw segmentation result
   */
  function drawSegmentation(mask) {
    const width = mask.width;
    const height = mask.height;
    const maskData = mask.getAsFloat32Array();
    canvas.width = width;
    canvas.height = height;
    console.log("Draw segmentation");
    ctx.clearRect(0, 0, cw, ch);
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, cw, ch);
    ctx.drawImage(img, offsetX, offsetY, scaledW, scaledH);
    ctx.fillStyle = "rgba(18, 181, 203, 0.7)";
    maskData.map((category, index) => {
        if (Math.round(category * 255.0) !== 0) {
            const x = (index + 1) % width;
            const y = (index + 1 - x) / width;
            ctx.fillRect(x, y, 1, 1);
        }
    });
  }

  /**
  * Draw click point
  */
  function drawClickPoint(event) {
    clickPoint.style.top = `${event.offsetY - 8}px`;
    clickPoint.style.left = `${event.offsetX - 8}px`;
    clickPoint.style.display = "block";
  }


  /**
  * Cut out everything outside the mask
  */
  function cutSegmentation(mask) {
    const width = mask.width;
    const height = mask.height;
    const maskData = mask.getAsFloat32Array();
    canvas.width = width;
    canvas.height = height;
    console.log("Cutting out");
    ctx.clearRect(0, 0, cw, ch);
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, cw, ch);
    ctx.drawImage(img, offsetX, offsetY, scaledW, scaledH);
    ctx.fillStyle = '#fff';
    maskData.map((category, index) => {
        if (Math.round(category * 255.0) !== 0) { 
            const x = (index + 1) % width;
            const y = (index + 1 - x) / width;
            ctx.fillRect(x, y, 1, 1);
        }
    });
    //var dataURL = canvas.toDataURL();
    //img.src = dataURL;
  }
}

function loadWorker(){
  const src = 'static/js/linedraw.js';
  if (window.myWorker) myWorker.terminate();

  if (window.location.protocol == 'file:') {
    // Workers not working - fall back to embedding the script
    window.myWorker={terminate:()=>{}}
    window.importScripts=function(...args){
      for (let a of args) appendScript(a)
    }
    window.postMessage=function(msg){
      myWorker.onmessage({data:msg})
    }

  } else window.myWorker = new Worker(src);

  msgbox.innerHTML = "";

  myWorker.onmessage = function(msg) {
    let [type, data] = msg.data

    // setup, declare parameters
    if (type == 'sliders') {
      if (src==window.algo) return;
      window.algo=src
      process()

    // message, e.g. progress bar
    } else if (type == 'msg') {
      if (data === 'Started') {
        // Nothing
      }else if (data === 'Done') {
        canvas.style.display = 'none';
        roundButtonContainer.style.display = 'none';
      }
      msgbox.innerHTML = data;

    } else if (type == 'dbg'){
      window.data = data
      console.log(data) 

      // vector data result
    } else if (type == 'svg-path'){
      mainpath.setAttributeNS(null, "d", data) 
      svg.style.display = 'block';
    } else if (type == 'json-data') {
      printButton.style.display = 'block';
      resetButton.style.display = 'block';
      // Parse the JSON string and store the data
      window.data = JSON.parse(data)
    } else if (type == 'lines') {
      lines = []; // Empty the lines array
      lines.push(data); // Push lines into the global variable
    }
  }
}

const svgNS = "http://www.w3.org/2000/svg"
function resetSVG(){
  // erase existing contents
  let c; while (c = svg.firstChild) svg.removeChild(c)
  svg.setAttribute("width",config.width)
  svg.setAttribute("height",config.height)
  svg.setAttribute("viewBox", `0 0 ${config.width} ${config.height}`)
  window.mainpath=document.createElementNS(svgNS, "path");
  let strokeWidth;
  switch(currentSelection) {
    case 'weak':
      strokeWidth = '1px';
      break;
    case 'middle':
      strokeWidth = '2px';
      break;
    case 'strong':
      strokeWidth = '3px';
      break;
    default:
      strokeWidth = '2px'; // Standardwert
  }
  
  mainpath.setAttributeNS(null, "style", `stroke-width: ${strokeWidth}; fill: none; stroke: black;`);
  svg.appendChild(mainpath);
}

var imageset = false;
var img = null;

function snapshot(){
  imageset=true;
  [canvas.width, canvas.height] = [video.videoWidth, video.videoHeight];
  ctx.drawImage(video, 0, 0)
  checkScroll()
  process()
}

function convert(){
  imageset=true;
  process()
}

function convertStart(){
  imageset=true;
  autoConvert = true;
  updateConfigValues();
}

function sendToWorker(msg){
  if (!window.onmessage) myWorker.postMessage(msg)
  else setTimeout(()=>window.onmessage({data:msg}),10)
}

function process(){
  if (!imageset) return;
  [config.width, config.height] = [canvas.width, canvas.height]
  resetSVG()
  loadWorker()
  sendToWorker([ window.config, ctx.getImageData(0,0,config.width,config.height) ]);
}
function ctrlChange(control){
  if (!imageset) return;
  if (!control.noRestart) 
    process()
  else
    sendToWorker([ window.config ]);
}

function download() {
  if (window.data == null) {
    alert("Das Bild wurde noch nicht konvertiert. Bitte klicken Sie auf 'Convert' und warten Sie, bis die Konvertierung abgeschlossen ist.");
    return;
  }

  // Convert the data to JSON format
  let jsonString = JSON.stringify(window.data, null, 2);

  // Create a new Blob object using the JSON string
  const blob = new Blob([jsonString], {type: 'application/json'});

  // Create a download link
  const downloadLink = document.createElement("a");
  downloadLink.href = URL.createObjectURL(blob);
  downloadLink.download = window.algo.replace('.js','_') + Date.now() + ".json";

  // Append the link to the body, click the link, and then remove the link
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
}

function printImage() {
  //alert("Das Bild wird gedruckt. Bitte warten Sie.");
  // Sende die Linieninformationen an den Server
  fetch('/printImage', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({ lines: lines }),
  })
  .then(response => response.text())
  .then(result => {
      alert(result);
  })
  .catch(error => {
      console.error('Error:', error);
  });
}

function selectAi() {
  inputContainerAI.style.display = 'block';
  svg.style.display = "none";
  imagePreview.style.display = "none";
  editContainer.style.display = "none";

  sketchCtx.clearRect(0, 0, sketchCanvas.width, sketchCanvas.height);
  sketchCtx.fillStyle = 'white';
  sketchCtx.fillRect(0, 0, sketchCanvas.width, sketchCanvas.height);
  sketchCtx.strokeStyle = 'black';
  sketchCtx.lineWidth = 5;
  withDrawing = false;

  let isDrawing = false;
  sketchCanvas.addEventListener('mousedown', startDrawing);
  sketchCanvas.addEventListener('mousemove', draw);
  sketchCanvas.addEventListener('mouseup', stopDrawing);
  sketchCanvas.addEventListener('mouseout', stopDrawing);

  sketchCanvas.addEventListener('touchstart', startDrawing);
  sketchCanvas.addEventListener('touchmove', draw);
  sketchCanvas.addEventListener('touchend', stopDrawing);
  sketchCanvas.addEventListener('touchcancel', stopDrawing);  

  function startDrawing(e) {
    e.preventDefault();
    isDrawing = true;
    withDrawing = true;
    draw(e);
  }

  function draw(e) {
    if (!isDrawing) return;
    e.preventDefault();

    const rect = sketchCanvas.getBoundingClientRect();
    const scaleX = sketchCanvas.width / sketchCanvas.clientWidth;
    const scaleY = sketchCanvas.height / sketchCanvas.clientHeight;

    let x, y;
    if (e.type === 'mousemove') {
      x = (e.clientX - rect.left) * scaleX;
      y = (e.clientY - rect.top) * scaleY;
    } else if (e.type === 'touchmove') {
      x = (e.touches[0].clientX - rect.left) * scaleX;
      y = (e.touches[0].clientY - rect.top) * scaleY;
    }

    sketchCtx.lineTo(x, y);
    sketchCtx.stroke();
    sketchCtx.beginPath();
    sketchCtx.moveTo(x, y);
  }

  function stopDrawing() {
    isDrawing = false;
    sketchCtx.beginPath();
  }
}

let isGenerating = false;

async function generateAi() {
  try {
      if (isGenerating) {
        console.log('Die Funktion wird bereits ausgeführt. Bitte warten Sie.');
        alert("Das Bild wird bereits generiert. Bitte warten Sie.")
        return;
      }

      if (inputAI.value.trim() === "") {
        console.log('Bitte geben Sie einen Text ein.');
        alert("Bitte geben Sie einen Text ein.")
        return;
      }

      if (inputAI.value.trim().toLowerCase() === "dev" || inputAI.value.trim().toLowerCase() === "developer") {
        devMode(true);
        return;
      }

      isGenerating = true;
      svg.style.display = 'none';
      canvas.style.display = 'none';
      roundButtonContainer.style.display = 'none';

      // Ladeanimation
      imagePreview.src = 'static/images/buffering.gif'; 
      imagePreview.style.display = 'block';
      inputContainerAI.style.display = 'none';

      const prompt = inputAI.value;
      const sketchDataUrl = sketchCanvas.toDataURL();

      const response = await fetch(`/generate_ai`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sketch: sketchDataUrl,
          prompt: prompt,
          withDrawing: withDrawing
        })
      });
      const data = await response.json();
     
      if (response.ok) {
          const imageDatas = data.image_data_list;

          // Display the first generated image (you can loop through imageDatas if there are multiple)
          const imageData = imageDatas[0];

          // Create an Image object
          const img = new Image();

          // Set the source to the base64-encoded image data
          img.src = `data:image/png;base64,${imageData}`;

          // Wait for the image to load
          img.onload = function() {
            handleImage(img);
          };

          editContainer.style.display = 'block';
          canvas.style.display = 'block';
          inputContainerAI.style.display = 'none';
      } else {
          console.error('Error generating AI image:', data.error);
      }
  } catch (error) {
    console.error('Error when generating AI image:', error);
    imagePreview.style.display = 'none';
  } finally {
    // Freigebe die Sperre, wenn die Funktion beendet ist
    isGenerating = false;
  }
}

function handleKeyPress(event) {
  if (event.key === 'Enter') {
    event.preventDefault(); 
    generateAi();
  }
}

function devMode(mode) {
  if(mode==true) {
    console.log('Developer-Mode aktiviert.');
    alert("Developer-Mode aktiviert.");
    msgbox.innerHTML = "Developer-Mode started"
    devContainer.style.display = 'block';
    Notification.requestPermission().then(perm => {
      if(perm === 'granted') {
        new Notification("Example notification")
      }
    })
  } else {
    devContainer.style.display = 'none';
  }
}

function shutdownServer() {
  alert("Der Server wird heruntergefahren");
  fetch('/shutdownServer', {
      method: 'POST'
  })
  .then(response => response.text())
  .then(data => {
      console.log(data);
  })
  .catch(error => {
      console.error('Error:', error);
  });
}

function rebootServer() {
  alert("Der Server wird neugestartet. Bitte warten Sie.");
  fetch('/rebootServer', {
      method: 'POST'
  })
  .then(response => response.text())
  .then(data => {
      console.log(data);
  })
  .catch(error => {
      console.error('Error:', error);
  });
}

function shutdown() {
  alert("Der Plotter wird heruntergefahren");
  fetch('/shutdown', {
      method: 'POST'
  })
  .then(response => response.text())
  .then(data => {
      console.log(data);
  })
  .catch(error => {
      console.error('Error:', error);
  });
}

function reboot() {
  alert("Der Plotter wird neugestartet. Bitte warten Sie.");
  fetch('/reboot', {
      method: 'POST'
  })
  .then(response => response.text())
  .then(data => {
      console.log(data);
  })
  .catch(error => {
      console.error('Error:', error);
  });
}

function resetCanvas() {
  console.log('Resetting...');
  svg.style.display = "none";
  canvas.style.display = "block";
  //if (!isMobileDevice()) {
    roundButtonContainer.style.display = 'block';
  //}
}

function stopPrinting() {
  fetch('/stopPrinting', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({ lines: lines }),
  })
  .then(response => response.text())
  .then(result => {
      alert(result);
  })
  .catch(error => {
      console.error('Error:', error);
  });
}
function adjustTextareaHeight(textarea) {
  var borderSize = 5; // Größe der Border anpassen, falls notwendig
  textarea.style.height = 'auto';
  var newHeight = textarea.scrollHeight + borderSize; // Addiert die Border-Größe zur scrollHeight
  textarea.style.height = newHeight + 'px';
}

document.getElementById('input-ai').addEventListener('input', function() {
  adjustTextareaHeight(this);
});