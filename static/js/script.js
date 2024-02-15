var uploadButton = document.getElementById("upload-button");
var convertButton = document.getElementById("convert-button");
var checkboxSchraffur = document.getElementById("checkboxSchraffur");
var checkboxKonturen = document.getElementById("checkboxKonturen");
var konturenRange = document.getElementById("konturen-range");
var schraffurRange = document.getElementById("schraffur-range");
var noiseRange = document.getElementById("noise-range");
var imagePreview = document.getElementById("image-preview");
var printButton = document.getElementById("print-button");
var schraffurContainer = document.getElementById("schraffur-container");
var konturenContainer = document.getElementById("konturen-container");
var inputContainerAI = document.getElementById("input-container-ai");
var inputAI = document.getElementById("input-ai");
var devContainer = document.getElementById("dev-container");
var resetButton = document.getElementById("reset-button");
var zoomIn = document.getElementById("zoom-in");
var zoomOut = document.getElementById("zoom-out");
var zoomContainer = document.getElementById("zoom-container");

let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');

svg=document.querySelector('svg');
config = {};

var scaleFactor = 1.2; // Der Faktor, um den das Bild vergrößert oder verkleinert wird

// Start loadWorker when Website is loaded
document.addEventListener('DOMContentLoaded', (event) => {
  loadWorker();
});



/*Button*/
const button = document.getElementById("print-button");
const buttonSpan = button.querySelector("span");

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



// Ensure 'Contour detail' and 'Hatch scale' properties exist
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
}

// Slider event listeners
konturenRange.addEventListener("input", updateConfigValues);
schraffurRange.addEventListener("input", updateConfigValues);
noiseRange.addEventListener("input", updateConfigValues);
checkboxKonturen.addEventListener("change", updateConfigValues);
checkboxSchraffur.addEventListener("change", updateConfigValues);



let dragging = false;
let offsetX, offsetY, mouseX, mouseY;

function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function selectImage() {
  inputContainerAI.style.display = 'none';
  svg.style.display = 'none';
  let d = document.createElement('input');
  d.type = 'file';
  d.onchange = function(e) {
    let img = new Image();
    img.onload = function() {
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
        mouseX = e.clientX - canvas.offsetLeft;
        mouseY = e.clientY - canvas.offsetTop;
        dragging = true;
      };

      canvas.onmousemove = function(e) {
        if (dragging) {
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

      canvas.onmouseup = function() {
        dragging = false;
      };

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

      // Mobile
      canvas.addEventListener('touchstart', function(e) {
        if (e.touches.length === 2) {
          // Starte Zoomen
          pinchStartDistance = getPinchDistance(e.touches);
          pinchZooming = true;
        } else {
          // Starte Verschieben
          mouseX = e.touches[0].clientX - canvas.offsetLeft;
          mouseY = e.touches[0].clientY - canvas.offsetTop;
          dragging = true;
        }
      });
    
      canvas.addEventListener('touchmove', function(e) {
        if (pinchZooming && e.touches.length === 2) {
          let pinchDistance = getPinchDistance(e.touches);
          let zoomFactor = pinchDistance / pinchStartDistance;
    
          // Begrenze den Zoomfaktor, wenn nötig
          zoomFactor = Math.min(2, Math.max(0.5, zoomFactor));
    
          // Skaliere das Bild entsprechend
          scaledW *= zoomFactor;
          scaledH *= zoomFactor;
    
          // Berechne den Offset neu, um das Bild zu zentrieren
          //offsetX = (cw - scaledW) / 2;
          //offsetY = (ch - scaledH) / 2;
    
          // Speichere die aktuelle Pinch-Distanz für den nächsten Schritt
          pinchStartDistance = pinchDistance;
    
          // Zeichne das Bild auf dem Canvas
          ctx.clearRect(0, 0, cw, ch);
          ctx.fillStyle = '#fff';
          ctx.fillRect(0, 0, cw, ch);
          ctx.drawImage(img, offsetX, offsetY, scaledW, scaledH);
        } else if (dragging && e.touches.length === 1) {
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
        }
      });
    
      canvas.addEventListener('touchend', function(e) {
        if (e.touches.length < 2) {
          pinchZooming = false;
        }
    
        dragging = false;
      });
    
      function getPinchDistance(touches) {
        let dx = touches[0].clientX - touches[1].clientX;
        let dy = touches[0].clientY - touches[1].clientY;
        return Math.sqrt(dx * dx + dy * dy);
      }


      // Blende das image-preview Element aus und zeige das canvas Element an
      if (!isMobileDevice()) {
        zoomContainer.style.display = 'block';
      }
      imagePreview.style.display = 'none';
      convertButton.style.display = 'block';
      canvas.style.display = 'block';
    }
    img.src = URL.createObjectURL(e.target.files[0]);
  }
  d.click();
}


let lines = []; // Global variable to store lines

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
        zoomContainer.style.display = 'none';
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
  //svg.style.background=config.Inverted?"black":"white";
  window.mainpath=document.createElementNS(svgNS, "path");
  mainpath.setAttributeNS(null, "style", "stroke-width: 2px; fill: none; stroke: " + (config.Inverted?"white":"black"))
  svg.appendChild(mainpath)
}

var imageset = false;
img = null;

function snapshot(){
  imageset=true;
  [canvas.width, canvas.height] = [video.videoWidth, video.videoHeight];
  ctx.drawImage(video, 0, 0)
  checkScroll()
  process()
}

function convert(){
  imageset=true;
  updateConfigValues();
  process()
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
  alert("Das Bild wird gedruckt. Bitte warten Sie.");
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
  svg.style.display = "none"
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
      zoomContainer.style.display = 'none';

      // Ladeanimation
      imagePreview.src = 'static/images/buffering.gif'; 
      imagePreview.style.display = 'block';

      const prompt = inputAI.value;
      const response = await fetch(`/generate_ai?prompt=${encodeURIComponent(prompt)}`, {
          method: 'GET',
          headers: {
              'Content-Type': 'application/json',
          },
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
      
            // Ladeanimation aus
            imagePreview.style.display = 'none';
      
            // Computer
            canvas.onmousedown = function(e) {
              mouseX = e.clientX - canvas.offsetLeft;
              mouseY = e.clientY - canvas.offsetTop;
              dragging = true;
            };

            canvas.onmousemove = function(e) {
              if (dragging) {
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

            canvas.onmouseup = function() {
              dragging = false;
            };

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

            // Mobile
            canvas.addEventListener('touchstart', function(e) {
              if (e.touches.length === 2) {
                // Starte Zoomen
                pinchStartDistance = getPinchDistance(e.touches);
                pinchZooming = true;
              } else {
                // Starte Verschieben
                mouseX = e.touches[0].clientX - canvas.offsetLeft;
                mouseY = e.touches[0].clientY - canvas.offsetTop;
                dragging = true;
              }
            });
          
            canvas.addEventListener('touchmove', function(e) {
              if (pinchZooming && e.touches.length === 2) {
                let pinchDistance = getPinchDistance(e.touches);
                let zoomFactor = pinchDistance / pinchStartDistance;
          
                // Begrenze den Zoomfaktor, wenn nötig
                zoomFactor = Math.min(2, Math.max(0.5, zoomFactor));
          
                // Skaliere das Bild entsprechend
                scaledW *= zoomFactor;
                scaledH *= zoomFactor;
          
                // Berechne den Offset neu, um das Bild zu zentrieren
                //offsetX = (cw - scaledW) / 2;
                //offsetY = (ch - scaledH) / 2;
          
                // Speichere die aktuelle Pinch-Distanz für den nächsten Schritt
                pinchStartDistance = pinchDistance;
          
                // Zeichne das Bild auf dem Canvas
                ctx.clearRect(0, 0, cw, ch);
                ctx.fillStyle = '#fff';
                ctx.fillRect(0, 0, cw, ch);
                ctx.drawImage(img, offsetX, offsetY, scaledW, scaledH);
              } else if (dragging && e.touches.length === 1) {
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
              }
            });
          
            canvas.addEventListener('touchend', function(e) {
              if (e.touches.length < 2) {
                pinchZooming = false;
              }
          
              dragging = false;
            });
          
            function getPinchDistance(touches) {
              let dx = touches[0].clientX - touches[1].clientX;
              let dy = touches[0].clientY - touches[1].clientY;
              return Math.sqrt(dx * dx + dy * dy);
            }


            // Blende das image-preview Element aus und zeige das canvas Element an
            if (!isMobileDevice()) {
              zoomContainer.style.display = 'block';
            }
            imagePreview.style.display = 'none';
            convertButton.style.display = 'block';
            canvas.style.display = 'block';
          };
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
  if (!isMobileDevice()) {
    zoomContainer.style.display = 'block';
  }
}