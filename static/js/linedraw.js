importScripts('helpers.js')

postMessage(['sliders', [
  {label: 'Contours', type:'checkbox', checked:true},
  {label: 'Contour detail', value: 8, min: 1, max: 16},
  {label: 'Hatching', type:'checkbox', checked:true},
  {label: 'Hatch scale', value: 8, min: 1, max: 24},
  {label: 'Noise scale', value: 1, min: 0, max: 2, step:0.1},
  {label: 'Optimize route', type:'checkbox', checked:true},
]]);



function SobelFilter(getPixel) {

  const pixData = Array(width)
  let i = 0;

  for (let x = 0; x < width; x++) {
    pixData[x] = Array(height)
    for (let y = 0; y < height; y++) {
      let px =
          -1 * getPixel(x - 1, y - 1) +
           1 * getPixel(x + 1, y - 1) +
          -2 * getPixel(x - 1, y    ) +
           2 * getPixel(x + 1, y    ) +
          -1 * getPixel(x - 1, y + 1) +
           1 * getPixel(x + 1, y + 1)

      let py = 
        -1 * getPixel(x - 1, y - 1) +
        -2 * getPixel(x    , y - 1) +
        -1 * getPixel(x + 1, y - 1) +
         1 * getPixel(x - 1, y + 1) +
         2 * getPixel(x    , y + 1) +
         1 * getPixel(x + 1, y + 1)
      
      pixData[x][y] =(px*px)+(py*py) >128*128 ? 255 : 0;

    }
  }

  return pixData;
}
function getdotsV( pixData ){

  const dots = []
  for (let y=0; y<height-1; y++) {
    row = []
    for (let x=1; x<width; x++) {
      if (pixData[x][y] == 255) {
        let x0=x
        while (x<width && pixData[x][y] ==255) x++
        row.push(Math.round((x+x0)/2))
      }
    }
    dots.push(row)
  }
  return dots
}
function getdotsH( pixData ){

  const dots = []
  for (let x=0; x<width-1; x++) {
    row = []
    for (let y=1; y<height; y++) {
      if (pixData[x][y] == 255) {
        let y0 = y
        while (y<height && pixData[x][y] ==255) y++
        row.push(Math.round((y+y0)/2))
      }
    }
    dots.push(row)
  }
  return dots
}

function connectdotsV(dots){

  let contours=[]
  for (let y in dots) {
    y=Number(y)
    for (let i in dots[y]) {
      let x = dots[y][i]
      if (y==0) contours.push([[x,y]])
      else{
        let closest = -1, cdist = 10000
        for ( let j in dots[y-1] ) {
          let x0 = dots[y-1][j]
          let d = Math.abs(x-x0)
          if (d < cdist) { closest=x0; cdist=d }
        }
        if (cdist > 3)
          contours.push([[x,y]])
        else {
          let found=0
          for (let k in contours) {
            let last = contours[k][contours[k].length-1]
            if (last[0] == closest && last[1] == y-1) {
              contours[k].push([x,y])
              found=1
              break
            }
          }
          if (found==0) contours.push([[x,y]])
        }
      }
    }
    for (let c in contours){
      if (contours[c][contours[c].length-1][1] < y-1 && contours[c].length<4) {
        contours.splice(c,1)
      }
    }
  }

  return contours
}

function connectdotsH(dots){

  let contours=[]
  for (let x in dots) {
    x=Number(x)
    for (let i in dots[x]) {
      let y = dots[x][i]
      if (x==0) contours.push([[x,y]])
      else{
        let closest = -1, cdist = 10000
        for ( let j in dots[x-1] ) {
          let y0 = dots[x-1][j]
          let d = Math.abs(y-y0)
          if (d < cdist) { closest=y0; cdist=d }
        }
        if (cdist > 3)
          contours.push([[x,y]])
        else {
          let found=0
          for (let k in contours) {
            let last = contours[k][contours[k].length-1]
            if (last[1] == closest && last[0] == x-1) {
              contours[k].push([x,y])
              found=1
              break
            }
          }
          if (found==0) contours.push([[x,y]])
        }
      }
    }
    for (let c in contours){
      if (contours[c][contours[c].length-1][x] < x-1 && contours[c].length<4) {
        contours.splice(c,1)
      }
    }
  }

  return contours
}

function getContours( getPixel, strokeScale ){
  postMessage(['msg', "Edge finding"]);
  let edges = SobelFilter( getPixel );
  postMessage(['msg', "Tracing contours (1/3)"]);
  let contoursH = connectdotsH(getdotsH(edges))
  postMessage(['msg', "Tracing contours (2/3)"]);
  let contoursV = connectdotsV(getdotsV(edges))

  postMessage(['msg', "Tracing contours (3/3)"]);
  let contours = contoursH.concat(contoursV)

  function distance(a,b){
    return Math.sqrt( (a[0]-b[0])*(a[0]-b[0]) +(a[1]-b[1])*(a[1]-b[1]) )
  }

  // link ends of strokes less than 8 px apart
  for (let i in contours) {
    for (let j in contours) {
      if (contours[i].length && contours[j].length)
        if (distance( contours[j][0], contours[i][contours[i].length-1] ) < strokeScale ) {
          contours[i] = contours[i].concat(contours[j])
          contours[j] = []
        }
    }
  }

  // skip points to simplify
  let nc=[]
  for (let i in contours) {
    let s = []
    for (let j=0; j<contours[i].length; j+= strokeScale) s.push(contours[i][j]) //todo: average instead of skipping
    if (s.length) nc.push(s)
  }

  addNoise(nc, 10)

  return nc

}


function hatch2( getPixel, sc) {
  postMessage(['msg', "Hatching"]);

  let lines = []

  //horizontal hatches
  for (let y=0;y<height;y+=sc) {
    let pendown = false
    for (let x=0;x<width;x+=sc) {
      let p = getPixel(x,y)
      if (p<=144) {
        if (!pendown) lines.push([[x,y]])
        else lines[lines.length-1].push([x,y])
        pendown = true
      } else pendown = false
    }
  }

  // denser horizontal
  for (let y=Math.round(sc/2);y<height;y+=sc) {
    let pendown = false
    for (let x=0;x<width;x+=sc) {
      let p = getPixel(x,y)
      if (p<=64) {
        if (!pendown) lines.push([[x,y]])
        else lines[lines.length-1].push([x,y])
        pendown = true
      } else pendown = false 
    }
  }

  // diagonal (top-left)
  for (let sy=0;sy<height;sy+=sc) {
    let pendown = false
    for (let x=0, y=sy; x<width && y>0;x+=sc, y-=sc) {
      let p = getPixel(x,y)
      if (p<=16) {
        if (!pendown) lines.push([[x,y]])
        else lines[lines.length-1].push([x,y])
        pendown = true
      } else pendown = false 
    }
  }
  // diagonal (bottom right)
  for (let sx=0;sx<width;sx+=sc) {
    let pendown = false
    for (let x=sx, y=height; x<width && y>0; x+=sc, y-=sc) {
      let p = getPixel(x,y)
      if (p<=16) {
        if (!pendown) lines.push([[x,y]])
        else lines[lines.length-1].push([x,y])
        pendown = true
      } else pendown = false
    }
  }

  addNoise( lines, sc )

  return lines
}

function addNoise( lines, sc ) {
  sc *= config['Noise scale']
  for (let i in lines) {
    for (let j in lines[i]) {
      lines[i][j][0] = ( lines[i][j][0] + sc*perlinNoise(i*0.5,j*0.1,1) )
      lines[i][j][1] = ( lines[i][j][1] + sc*perlinNoise(i*0.5,j*0.1,1) )
    }
  }
}


var width, height, config; 
onmessage = function(e) {
  [ config, pixData ] = e.data;
  this.postMessage(['msg', "Started"]);
  //if (!config.Contours && !config.Hatching) return
  width=config.width
  height=config.height
  config['Optimize route'] = true

  postMessage(['msg', "Calculating..."]);

  const getPixel = autocontrast(pixData, 0.1)

  let output = []

  if (config.Contours)
    output = output.concat(getContours(getPixel, config['Contour detail']))
  
  if (config.Hatching)
    output = output.concat(hatch2(getPixel, config['Hatch scale']))

  if (config['Optimize route']) {
    postMessage(['msg', "Optimizing stroke order"]);
    output = sortlines(output)
  }

  postMessage(['msg', "Done"]);
  postLinesJson(output);
  postLinesOriginal(output);
  postLines(output)
}

