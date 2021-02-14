const canvas = document.getElementById('canvas');
const ctx= canvas.getContext("2d");

//global saturation inputs
const saturationSlider = document.getElementById('saturationSlider');
const saturationField = document.getElementById('saturationField');

//active color inputs
const activeHueSlider = document.getElementById('activeHueSlider');
const activeHueField = document.getElementById('activeHueField');
const activeSaturationSlider = document.getElementById('activeSaturationSlider');
const activeSaturationField = document.getElementById('activeSaturationField');
const activeLightnessSlider = document.getElementById('activeLightnessSlider');
const activeLightnessField = document.getElementById('activeLightnessField');


let colors = [];
let saturation = 60;

let activeColor = 0;

function hsl2rgb (h,s,l) {
  
  let c = (1 - Math.abs(2 * l - 1)) * s,
      x = c * (1 - Math.abs((h / 60) % 2 - 1)),
      m = l - c/2,
      r = 0,
      g = 0,
      b = 0;

	if (0 <= h && h < 60) {
		r = c; g = x; b = 0;  
	} else if (60 <= h && h < 120) {
		r = x; g = c; b = 0;
	} else if (120 <= h && h < 180) {
		r = 0; g = c; b = x;
	} else if (180 <= h && h < 240) {
		r = 0; g = x; b = c;
	} else if (240 <= h && h < 300) {
		r = x; g = 0; b = c;
	} else if (300 <= h && h < 360) {
		r = c; g = 0; b = x;
	}
		r = Math.round((r + m) * 255);
		g = Math.round((g + m) * 255);
		b = Math.round((b + m) * 255);

  return [r,g,b];
}

function drawRamp()
{
	let image = ctx.createImageData(360,360);
	let data = image.data;
	

	for (let x = 0; x < 360; x++) {
		for( let y = 0; y < 360; y++) {
			let [red, green, blue] = hsl2rgb(x,saturation/100,1-y/360);
			
			let index = (x + (y*360)) * 4;
			data[index] = red;
			data[index+1] = green;
			data[index+2] = blue;
			data[index+3] = 255;
		}
	}
	
	
	for(i=0; i<colors.length; i+=3){
		let size = 3;
		if (activeColor == i) size = 5;

		let posX = colors[i]-size;
		let posY = colors[i+1]-size;
		let [red, green, blue] = hsl2rgb(colors[i],colors[i+2]/100,1-colors[i+1]/360);
		
		for (let x = 0; x < 1+size*2; x++) {
			for( let y = 0; y < 1+size*2; y++) {
				if (x+posX >= 0 && x + posX < 360 && y+posY >= 0 && y+posY < 360) {
					let index = (x+posX + ((y+posY)*360)) * 4;
		
					if (x==0||y==0||x==size*2||y==size*2){
						data[index] = 255;
						data[index+1] = 255;
						data[index+2] = 255;
						data[index+3] = 255;
					} else if (x==1||y==1||x==size*2-1||y==size*2-1){
						data[index] = 0;
						data[index+1] = 0;
						data[index+2] = 0;
						data[index+3] = 255;
					} else {
						data[index] = red;
						data[index+1] = green;
						data[index+2] = blue;
						data[index+3] = 255;
					}

					
				}
			}
		}
	}
	



	ctx.putImageData(image,0,0)
}

function drawVoronoi()
{
	let image = ctx.createImageData(360,360);
	let data = image.data;
	

	for (let x = 0; x < 360; x++) {
		for( let y = 0; y < 360; y++) {
			let dist = 1024;
			let newDist = 0;
			let target=0
			

			for(i=0; i<colors.length; i+=3){

				newDist = Math.sqrt(Math.pow(Math.min(Math.abs(x - colors[i]),Math.abs(x-colors[i]-360))*0.5,2) + Math.pow(y - colors[i+1],2));
				if (newDist<dist) {
					target=i;
					dist=newDist;
				}
			}

			let [red, green, blue] = hsl2rgb(colors[target],colors[target+2]/100,1-colors[target+1]/360);
			
			let index = (x + (y*360)) * 4;
			data[index] = red;
			data[index+1] = green;
			data[index+2] = blue;
			data[index+3] = 255;
		}
	}
	ctx.putImageData(image,360,0)
}





function getCursorPosition(canvas, event) {
	const rect = canvas.getBoundingClientRect();
	const x = event.clientX - rect.left;
	const y = event.clientY - rect.top;
	return [x,y];
}

//redraw ramp on Saturation adjustment
saturationSlider.oninput = function(){
	saturation = this.value;
	saturationField.value=this.value;
	drawRamp();
	//drawIcons();
}
saturationField.oninput = function(){
	this.value = Math.floor(Math.max(Math.min(this.value,100),0));
	saturation = this.value;
	saturationSlider.value=this.value;
	drawRamp();
	//drawIcons();
}

function updateActive()
{
	if(activeColor<colors.length){
		activeHueField.value = colors[activeColor];
		activeHueSlider.value = colors[activeColor];
		activeSaturationField.value = colors[activeColor];
		activeSaturationSlider.value = colors[activeColor];
		activeLightnessField.value = colors[activeColor];
		activeLightnessSlider.value = colors[activeColor];
	}
}

//redraw on color adjustments
activeHueSlider.oninput = function(){
	if(activeColor<colors.length){
		colors[activeColor] = this.value;
		activeHueField.value=this.value;
		drawRamp();
		drawVoronoi();
	}
}
activeHueField.oninput = function(){
	if(activeColor<colors.length){
		this.value = Math.floor(Math.max(Math.min(this.value,360),0));
		colors[activeColor] = this.value;
		activeHueSlider.value=this.value;
		drawRamp();
		drawVoronoi();
	}
}
activeLightnessSlider.oninput = function(){
	if(activeColor<colors.length){
		colors[activeColor+1] = Math.floor(this.value*3.6);
		activeLightnessField.value=this.value;
		drawRamp();
		drawVoronoi();
	}
}
activeLightnessField.oninput = function(){
	if(activeColor<colors.length){
		this.value = Math.floor(Math.max(Math.min(this.value,100),0));
		colors[activeColor+1] = Math.floor(this.value*3.6);
		activeLightnessSlider.value=this.value;
		drawRamp();
		drawVoronoi();
	}
}

//add/select color
canvas.addEventListener('click', function(event) {
	let rect = canvas.getBoundingClientRect();
	let x = Math.floor(event.clientX - rect.left);
	let y = Math.floor(event.clientY - rect.top);
	if (x<360) {
		activeColor=colors.length;
		colors.push(x);
		colors.push(y);
		colors.push(saturation);
	} else if (x<720 && colors.length > 0) {
		x-=360;
		let dist = 1024;
		let newDist = 0;
		let target=0
			
		for(i=0; i<colors.length; i+=3){
			newDist = Math.sqrt(Math.pow(Math.min(Math.abs(x - colors[i]),Math.abs(x-colors[i]-360))*0.5,2) + Math.pow(y - colors[i+1],2));
			if (newDist<dist) {
				target=i;
				dist=newDist;
			}
		}
		activeColor = target;

	}
	
	drawVoronoi();
	drawRamp();
	updateActive();
}, false);



//draw initial ramp
drawRamp();
drawVoronoi();
