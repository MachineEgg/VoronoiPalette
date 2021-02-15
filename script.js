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
const deleteButton = document.getElementById('deleteButton');


//color table reference
const colorTable = document.getElementById('colorTable');
const activeHex = document.getElementById('activeHex');

let colors = [];
let saturation = 60;

let activeColor = 0;

function rgb2hex(r, g, b){
	r = r.toString(16);
	g = g.toString(16);
	b = b.toString(16);

	if (r.length == 1)
		r = "0" + r;
	if (g.length == 1)
		g = "0" + g;
	if (b.length == 1)
		b = "0" + b;

	return "#" + r + g + b;
}

function hsl2rgb (h,s,l) {
  
  let c = (1 - Math.abs(2 * l - 1)) * s,
      x = c * (1 - Math.abs((h / 60.0) % 2 - 1)),
      m = l - c/2.0,
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
			let [red, green, blue] = hsl2rgb(x,saturation/100,y/360);
			
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
		let [red, green, blue] = hsl2rgb(colors[i],colors[i+2]/100,colors[i+1]/360);
		
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

				newDist = Math.sqrt(Math.pow(Math.min(x-colors[i]+360,Math.min(Math.abs(x - colors[i]),Math.abs(x-colors[i]-360))),2) + Math.pow(y - colors[i+1],2));
				if (newDist<dist) {
					target=i;
					dist=newDist;
				}
			}

			let [red, green, blue] = hsl2rgb(colors[target],colors[target+2]/100,colors[target+1]/360);
			
			let index = (x + (y*360)) * 4;
			data[index] = red;
			data[index+1] = green;
			data[index+2] = blue;
			data[index+3] = 255;
		}
	}
	ctx.putImageData(image,360,0)
}

function updateTable()
{
	let counter = 0;
	let newTable = "<table><colgroup><col span=\"10\" width=\"72\"></colgroup><tr>";
	
	for(i=0; i<colors.length; i+=3){
		let [red,green,blue] = hsl2rgb(colors[i],colors[i+2]/100,colors[i+1]/360);
		let colorHex = rgb2hex(red, green, blue);
		newTable+="<td style=\"background-color:" + colorHex + ";color:";
		
		if (colors[i+1]>100){ 
			newTable += "#000000\">" + colorHex + "</td>";
		} else {
			newTable += "#FFFFFF\">" + colorHex + "</td>";
		}

		
		counter++;
		if (counter>=10){
			newTable += "</tr><tr>";
			counter = 0;
		}
		
	}


	newTable += "</tr></table>";

	colorTable.innerHTML = newTable;
	
	newTable="";
	if (colors.length>0){
	let [red,green,blue] = hsl2rgb(colors[activeColor],colors[activeColor+2]/100,colors[activeColor+1]/360);
	let colorHex = rgb2hex(red, green, blue);
	
	newTable = "<div style=\"background-color:" + colorHex  + ";color:";

	if (colors[activeColor+1]>100){ 
		newTable += "#000000\">" + colorHex + "</div>";
	} else {
		newTable += "#FFFFFF\">" + colorHex + "</div>";
	}
	}
	activeHex.innerHTML = newTable;
	

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
		activeSaturationField.value = colors[activeColor+2];
		activeSaturationSlider.value = colors[activeColor+2];
		activeLightnessField.value = Math.floor(colors[activeColor+1]/3.6);
		activeLightnessSlider.value = Math.floor(colors[activeColor+1]/3.6);
	}
}

//redraw on color adjustments
activeHueSlider.oninput = function(){
	if(activeColor<colors.length){
		colors[activeColor] = this.value;
		activeHueField.value=this.value;
		drawRamp();
		drawVoronoi();
		updateTable();

	}
}
activeHueField.oninput = function(){
	if(activeColor<colors.length){
		this.value = Math.floor(Math.max(Math.min(this.value,359),0));
		colors[activeColor] = this.value;
		activeHueSlider.value=this.value;
		drawRamp();
		drawVoronoi();
		updateTable();

	}
}
activeSaturationSlider.oninput = function(){
	if(activeColor<colors.length){
		colors[activeColor+2] = this.value;
		activeSaturationField.value=this.value;
		drawRamp();
		drawVoronoi();
		updateTable();

	}
}
activeSaturationField.oninput = function(){
	if(activeColor<colors.length){
		colors[activeColor+2] = this.value;
		activeSaturationSlider.value=this.value;
		drawRamp();
		drawVoronoi();
		updateTable();

	}
}
activeLightnessSlider.oninput = function(){
	if(activeColor<colors.length){
		colors[activeColor+1] = Math.floor(this.value*3.6);
		activeLightnessField.value=this.value;
		drawRamp();
		drawVoronoi();
		updateTable();

	}
}
activeLightnessField.oninput = function(){
	if(activeColor<colors.length){
		this.value = Math.floor(Math.max(Math.min(this.value,100),0));
		colors[activeColor+1] = Math.floor(this.value*3.6);
		activeLightnessSlider.value=this.value;
		drawRamp();
		drawVoronoi();
		updateTable();
	}
}


//delete
deleteButton.onclick = function(){
	if(activeColor<colors.length){
		colors.splice(activeColor,3);

		if(activeColor=>colors.length){
			activeColor = colors.length-3;
			if(activeColor<0){
				activeColor = 0;
			}
		}

		drawVoronoi();
		drawRamp();
		updateActive();
		updateTable();

	}
}

//add/move/select color
function addColor(x,y){

}

function moveColor(x,y){

}


let isMoving = false;


// Add the event listeners for mousedown, mousemove, and mouseup
canvas.addEventListener('mousedown', e => {
  	let rect = canvas.getBoundingClientRect();
	let x = Math.floor(e.clientX - rect.left);
	let y = Math.floor(e.clientY - rect.top);
	isDrawing = true;

	if (x<360) {//move or add
		let selectedColor = -1;
		
		if (colors.length>0){
			for(i=0; i<colors.length; i+=3){
				let size = 3;
				if (activeColor == i) size = 5;
	
				let posX = colors[i];
				let posY = colors[i+1];
		
				if(x>=posX-size && y>=posY-size && x<=posX+size && y<=posY+size){
					selectedColor=i;
				}
			}		
		}
 		
		if(selectedColor>=0){
			activeColor = selectedColor;
		} else {
			activeColor=colors.length;
			colors.push(x);
			colors.push(y);
			colors.push(saturation);
		}
		isMoving = true;
	} else if (x<720 && colors.length > 0) {//select
		x-=360;
		let dist = 1024;
		let newDist = 0;
		let target=0
			
		for(i=0; i<colors.length; i+=3){
			newDist = Math.sqrt(Math.pow(Math.min(x-colors[i]+360,Math.min(Math.abs(x - colors[i]),Math.abs(x-colors[i]-360))),2) + Math.pow(y - colors[i+1],2));
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
	updateTable();
});

canvas.addEventListener('mousemove', e => {
	if (isMoving == true) {
		let rect = canvas.getBoundingClientRect();
		let x = Math.floor(e.clientX - rect.left);
		let y = Math.floor(e.clientY - rect.top);
		
		if (x>=0&&y>=0&&x<360&&y<360) {
			colors[activeColor]=x;
			colors[activeColor+1]=y;
			drawVoronoi();
 			drawRamp();
			updateActive();
			updateTable();
		}
	}
});

window.addEventListener('mouseup', e => {
	if (isMoving == true) {
		let rect = canvas.getBoundingClientRect();
		let x = Math.floor(e.clientX - rect.left);
		let y = Math.floor(e.clientY - rect.top);

		if (x>=0&&y>=0&&x<360&&y<360) {
			colors[activeColor]=x;
			colors[activeColor+1]=y;
			drawVoronoi();
 			drawRamp();
			updateActive();
			updateTable();
		}
	}
	isMoving = false;
});




//draw initial ramp
drawRamp();
drawVoronoi();
