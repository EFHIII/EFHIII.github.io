function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
    });
    return vars;
}

function getUrlParam(parameter, defaultvalue){
    var urlparameter = defaultvalue;
    if(window.location.href.indexOf(parameter) > -1){
        urlparameter = decodeURI(getUrlVars()[parameter]);
        }
    return urlparameter;
}

let canvas = document.getElementById('debugWin');

let W = canvas.width;
let H = canvas.height;
let ctx = canvas.getContext("2d");
ctx.lineCap = "round";
ctx.noStroke = true;

let canvas2 = document.getElementById('out');

canvas2.style.width = getUrlParam('width',600)+'px';
canvas2.style.height = getUrlParam('height',600)+'px';

/*let W2 = canvas2.width;
let H2 = canvas2.height;
let ctx2 = canvas2.getContext("2d");
ctx2.lineCap = "round";
ctx2.noStroke = true;
*/
//mouse stuff
let mouseIsPressed = false;
let mouse = {
  x: -1,
  y: 0,
  wheel:0,
  button:0
};
let pmouse = {
  x: -1,
  y: 0
};

let last=true;
//scene stuff
let camera={
	x:0,
	y:0,
	size:20
};

function getMousePos(canvas, evt) {
  let rect = canvas.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top
  };
}
canvas.addEventListener(
  "mousemove",
  function(evt) {
    let MS = getMousePos(canvas, evt);
	mouse.x=MS.x;
	mouse.y=MS.y;
  },
  false
);
canvas.addEventListener(
  "mousedown",
  function(e) {
    mouseIsPressed = true;
    last = false;
	mouse.button=e.button;
  },
  false
);
canvas.addEventListener(
  "mouseup",
  function() {
    mouseIsPressed = false;
	last=true;
  },
  false
);
canvas.addEventListener(
  "mouseout",
  function() {
    mouse = {
      x: -1,
      y: 0
    };
  },
  false
);
canvas.addEventListener("mousewheel", 
	function(e){
		mouse.wheel=Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
	},
	false
);

let code=document.getElementById('code');
let ref=document.getElementById('reference');
let ref1=document.getElementById('NULL');
let ref2=document.getElementById('HRTI');
let ref3=document.getElementById('MODU');
let ref4=document.getElementById('ROMA');
let ref5=document.getElementById('DRAW');
let editor=document.getElementById('editor');
let runner=document.getElementById('runner');
let delay=document.getElementById('delayN');
let runIt=document.getElementById('runIt');
let deConsole=document.getElementById('console');
let log=document.getElementById('log');
let inputLine=document.getElementById('inputLine');
let stackO=document.getElementById('stack');
let dragbar=document.getElementById('console-dragbar');
let alertT=document.getElementById('alert');

let delaying=false;
let running=false;
let befungeProgram=false;
let befungeLoop=false;
let showCanvas=false;
let showCode=true;
let showConsole=true;

const abc="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ\\][=-0987654321`/.,';?><\":|}{+_)(*&^%$#@!~| ";
/*
                  v
v,kc"Hello World!"<

>3j ED"WARD" 4(v

v   B F3000    <
>ff0 3F aa3** : : Cv
v                  <
>000 3F aa2** : a5* aa* Ev
v                        <
>a95** aa2** a5* aa* Ev
v                     <
>1M f00 3F aa3** aa4** 3T 3 2 1T 0 0 f3* 594** 0 A 0M )@
*/
code.value="                  v\nv,kc\"Hello World!\"<\n>3j ED\"WARD\" 4(v\nv   B F3000    <\n>ff0 3F aa3** : : Cv\nv                  <\n>000 3F aa2** : a5* aa* Ev\nv                        <\n>a95** aa2** a5* aa* Ev\nv                     <\n>1M f00 3F aa3** aa4** 3T 3 2 1T 0 0 f3* 594** 0 A 0M )@";


let setCode=getUrlParam('code',false);
if(setCode){
	code.value=setCode;
}

function step(){
	befungeProgram.step();
};
function fastStep(){
	befungeProgram.draw=false;
	for(let i=0;i<10000&&!befungeProgram.draw;i++){
		befungeProgram.step();
	}
};

function fun(){
	W = canvas.width = canvas.offsetWidth;
	H = canvas.height = canvas.offsetHeight;
	ctx.fillStyle = "black";
	ctx.fillRect(0, 0, W, H);
	if(!befungeProgram){return;}
	if(showCode){
	if(mouseIsPressed){
		camera.x-=(pmouse.x-mouse.x)/camera.size;
		camera.y-=(pmouse.y-mouse.y)/camera.size;
	}
	
	if(mouse.wheel){
		camera.size*=1+0.125*mouse.wheel;
		if(camera.size>128){camera.size=128;}
		if(camera.size<4){camera.size=4;}
	}
	
	//ctx.font = Math.round(camera.size/4)+"px Arial";
	ctx.font = "0.9px monospace";
	ctx.textAlign = "center";
	ctx.save();
	ctx.scale(camera.size,camera.size);
	ctx.translate((W/2/camera.size+camera.x),(H/2/camera.size+camera.y));
	ctx.fillStyle='#aaa';
	ctx.fillRect(-befungeProgram.field[0].length/4-0.02,-befungeProgram.field.length/2-0.02,befungeProgram.field[0].length/2+0.02,befungeProgram.field.length+0.02);
	for(let i=0;i<befungeProgram.field.length;i++){
		for(let j=0;j<befungeProgram.field[i].length;j++){
			Y=-befungeProgram.field.length/2+i;
			X=-befungeProgram.field[i].length/4+j/2;
			let temp=[(X+(W/2/camera.size+camera.x))*camera.size,((X+0.5)+(W/2/camera.size+camera.x))*camera.size,(Y+(H/2/camera.size+camera.y))*camera.size,((Y+1)+(H/2/camera.size+camera.y))*camera.size];
			if(temp[0]<=W&&temp[1]>=0&&temp[2]<=H&&temp[3]>=0){
			ctx.fillStyle='black';
			for(let pointerID in befungeProgram.pointers){
				if(j==befungeProgram.pointers[pointerID].pos.x&&i==befungeProgram.pointers[pointerID].pos.y){
					ctx.fillStyle='#555';
				}
			}
			ctx.fillRect(X,Y,0.48,0.98);
			ctx.fillStyle='white';
			if(befungeProgram.field[i][j]>0||befungeProgram.field[i][j]=='0'||befungeProgram.field[i][j]<0||abc.indexOf(befungeProgram.field[i][j])<0){
				ctx.fillStyle='#fa5';
				if(befungeProgram.field[i][j]>9||befungeProgram.field[i][j]<0){
					ctx.font = "0.1px monospace";
					ctx.fillText(befungeProgram.field[i][j],X+0.24,Y+0.55);
					ctx.font = "0.9px monospace";
				}
				else if(abc.indexOf(befungeProgram.field[i][j])<0){
					ctx.font = "0.1px monospace";
					ctx.fillText(befungeProgram.field[i][j].charCodeAt(0),X+0.24,Y+0.55);
					ctx.font = "0.9px monospace";
				}
				else{
					ctx.fillText(befungeProgram.field[i][j],X+0.24,Y+0.75);
				}
			}
			else{
				switch(befungeProgram.field[i][j]){
					case('a'):
					case('b'):
					case('c'):
					case('d'):
					case('e'):
					case('f'):
						ctx.fillStyle='#fa5';
					break;
					case('>'):
					case('v'):
					case('<'):
					case('^'):
					case('#'):
					case('r'):
					case('z'):
						ctx.fillStyle='#5af';
					break;
					case('k'):
					case('x'):
					case('|'):
					case('_'):
					case('w'):
					case('?'):
					case('['):
					case(']'):
					case('j'):
						ctx.fillStyle='#0ff';
					break;
					case('+'):
					case('-'):
					case('*'):
					case('/'):
					case('!'):
						ctx.fillStyle='#d8f';
					break;
					case('@'):
					case('q'):
						ctx.fillStyle='#f55';
					break;
					case('g'):
					case('p'):
					case('s'):
						ctx.fillStyle='#5f5';
					break;
					case(':'):
					case('$'):
					case('\\'):
					case('n'):
					case('{'):
					case('}'):
					case('u'):
						ctx.fillStyle='#ff0';
					break;
					case(';'):
					case('"'):
					case('\''):
						ctx.fillStyle='#282';
					break;
					case('&'):
					case('~'):
					case('.'):
					case(','):
						ctx.fillStyle='#faa';
					break;
					case('y'):
					case('t'):
						ctx.fillStyle='#963';
					break;
					case('m'):
					case('h'):
					case('m'):
					case('l'):
					case('i'):
					case('o'):
						ctx.fillStyle='#666';
					break;
					case('('):
					case(')'):
						ctx.fillStyle='#fcf';
					break;
				}
				ctx.fillText(befungeProgram.field[i][j],X+0.24,Y+0.75);
			}
			}
		}
	}
	ctx.restore();
	}
	//mouse reseting
	pmouse.x=mouse.x;
	pmouse.y=mouse.y;
	mouse.wheel=0;
	
	if(showConsole){
	if(befungeProgram.output){
		log.innerText+=befungeProgram.output.replace(/ /g,'\u00a0');
		befungeProgram.output='';
		deConsole.scrollTop=deConsole.scrollHeight;
	}
	
	let txt='<br>';
	for(let IP in befungeProgram.pointers){
		txt+='IP '+IP+': ';
		for(let i=0;i<befungeProgram.pointers[IP].stack.length;i++){
			txt+='<span class="stackV">'+befungeProgram.pointers[IP].stack[i]+'</span>';
		}
		txt+='<br>';
	}
	stackO.innerHTML=txt;
	if(befungeProgram.terminated){
		alertT.innerText='exited with exit code: '+befungeProgram.exitCode;
		switch(befungeProgram.exitCode){
			case(0):
				alertT.style.color='#2f2';
			break;
			default:
				alertT.style.color='#f00';
			break;
		}
	}
	else if(befungeProgram.awaiting){
		switch(befungeProgram.awaiting){
			case('int'):
				alertT.innerText='awaiting integer input';
				alertT.style.color='#ff0';
				if(inputLine.innerText.indexOf('\n')>=0){
					befungeProgram.input.push(inputLine.innerText.replace(/\n/g,''));
					alertT.innerText='';
					step();
				}
			break;
			case('char'):
				alertT.innerText='awaiting character input';
				alertT.style.color='#ff0';
				if(inputLine.innerText.indexOf('\n')>=0){
					befungeProgram.input.push(inputLine.innerText.replace(/\n/g,''));
					alertT.innerText='';
					step();
				}
			break;
		}
	}
	else{
		alertT.innerText='';
	}
	if(inputLine.innerText.indexOf('\n')>=0){
		inputLine.innerText='';
	}
	}
};

document.getElementById('ref').addEventListener('click',function(){
	if(ref.style.visibility=='visible'){
		ref.style.visibility='hidden';
		ref.style.position='fixed';
	}
	else{
		ref.style.visibility='visible';
		ref.style.position='relative';
	}
});
document.getElementById('ref1').addEventListener('click',function(){
	if(ref1.style.visibility=='visible'){
		ref1.style.visibility='hidden';
		ref1.style.position='fixed';
	}
	else{
		ref1.style.visibility='visible';
		ref1.style.position='relative';
	}
});
document.getElementById('ref2').addEventListener('click',function(){
	if(ref2.style.visibility=='visible'){
		ref2.style.visibility='hidden';
		ref2.style.position='fixed';
	}
	else{
		ref2.style.visibility='visible';
		ref2.style.position='relative';
	}
});
document.getElementById('ref3').addEventListener('click',function(){
	if(ref3.style.visibility=='visible'){
		ref3.style.visibility='hidden';
		ref3.style.position='fixed';
	}
	else{
		ref3.style.visibility='visible';
		ref3.style.position='relative';
	}
});
document.getElementById('ref4').addEventListener('click',function(){
	if(ref4.style.visibility=='visible'){
		ref4.style.visibility='hidden';
		ref4.style.position='fixed';
	}
	else{
		ref4.style.visibility='visible';
		ref4.style.position='relative';
	}
});
document.getElementById('ref5').addEventListener('click',function(){
	if(ref5.style.visibility=='visible'){
		ref5.style.visibility='hidden';
		ref5.style.position='fixed';
	}
	else{
		ref5.style.visibility='visible';
		ref5.style.position='relative';
	}
});
document.getElementById('run').addEventListener('click',function(){
	canvas2.style.position='fixed';
	canvas2.style.visibility='hidden';
	document.getElementById('showCanvas').innerText='Show Canvas';
	canvas.style.width='98vw';
	showCanvas=false;
	W = canvas.width = canvas.offsetWidth;
	H = canvas.height = canvas.offsetHeight;
	
	editor.style.visibility='hidden';
	editor.style.position='fixed';
	ref.style.visibility='hidden';
	ref1.style.visibility='hidden';
	ref2.style.visibility='hidden';
	ref3.style.visibility='hidden';
	ref4.style.visibility='hidden';
	ref5.style.visibility='hidden';
	ref.style.position='fixed';
	ref1.style.position='fixed';
	ref2.style.position='fixed';
	ref3.style.position='fixed';
	ref4.style.position='fixed';
	ref5.style.position='fixed';
	runner.style.visibility='visible';
	runner.style.position='relative';
	befungeProgram=new B98(code.value,canvas2);
	camera={x:0,y:0,size:Math.min(W/befungeProgram.field[0].length*2,H/befungeProgram.field.length)};
	log.innerText='';
	inputLine.innerText='';
	deConsole.style.visibility='visible';
	dragbar.style.visibility='visible';
	setPos();
});
document.getElementById('edit').addEventListener('click',function(){
	editor.style.visibility='visible';
	editor.style.position='relative';
	runner.style.visibility='hidden';
	runner.style.position='fixed';
	if(running){
		running=false;
		runIt.innerText='Run';
		clearInterval(befungeLoop);
	}
	
	canvas2.removeEventListener("mousemove",B98mousemove);
	canvas2.removeEventListener("mousedown",B98mousedown);
	canvas2.removeEventListener("mouseup",B98mouseup);
	canvas2.removeEventListener("mouseout",B98mouseout);
	canvas2.removeEventListener("mousewheel",B98mousewheel);
	
	befungeProgram=false;
	delay.style.visibility='hidden';
	delay.style.position='fixed';
	delaying=false;
	deConsole.style.visibility='hidden';
	canvas2.style.visibility='hidden';
});
document.getElementById('delay').addEventListener('click',function(){
	if(delay.style.visibility=='visible'){
		delay.style.visibility='hidden';
		delay.style.position='fixed';
		delaying=false;
	}
	else{
		delay.style.visibility='visible';
		delay.style.position='relative';
		delaying=true;
	}
	if(running){
		clearInterval(befungeLoop);
		befungeLoop=setInterval(step,delaying?delay.value:0);
	}
});
delay.addEventListener('change',function(){
	if(running){
		clearInterval(befungeLoop);
		befungeLoop=setInterval(step,delaying?delay.value:0);
	}
});
runIt.addEventListener('click',function(){
	if(running){
		running=false;
		runIt.innerText='Run';
		clearInterval(befungeLoop);
	}
	else{
		running=true;
		runIt.innerText='Pause';
		if(delaying){
			befungeLoop=setInterval(step,delay.value);
		}
		else{
			befungeLoop=setInterval(fastStep,0);
		}
	}
});
document.getElementById('step').addEventListener('click',function(){
	befungeProgram.step();
});
document.getElementById('reset').addEventListener('click',function(){
	befungeProgram.reset();
	log.innerText='';
	inputLine.innerText='';
});
document.getElementById('showConsole').addEventListener('click',function(){
	if(showConsole){
		document.getElementById('showConsole').innerText='Show Console';
		deConsole.style.visibility='hidden';
		dragbar.style.visibility='hidden';
		showConsole=false;
	}
	else{
		document.getElementById('showConsole').innerText='Hide Console';
		deConsole.style.visibility='visible';
		dragbar.style.visibility='visible';
		setPos();
		showConsole=true;
	}
});
document.getElementById('showCanvas').addEventListener('click',function(){
	if(showCanvas){
		document.getElementById('showCanvas').innerText='Show Canvas';
		canvas2.style.visibility='hidden';
		canvas2.style.position='fixed';
		canvas.style.width='98vw';
		showCanvas=false;
	}
	else{
		document.getElementById('showCanvas').innerText='Hide Canvas';
		canvas2.style.visibility='visible';
		canvas2.style.position='relative';
		canvas.style.width='calc(95vw - '+canvas2.width+'px)';
		showCanvas=true;
	}
});
document.getElementById('showCode').addEventListener('click',function(){
	if(showCode){
		document.getElementById('showCode').innerText='Show Code';
		canvas.style.visibility='hidden';
		canvas.style.position='fixed';
		showCode=false;
	}
	else{
		document.getElementById('showCode').innerText='Hide Code';
		canvas.style.visibility='visible';
		canvas.style.position='relative';
		showCode=true;
		let ID=1;
		for(let pID in befungeProgram.pointers){
			ID=pID;
			break;
		}
		camera.x=-(befungeProgram.pointers[ID].pos.x-befungeProgram.field[0].length/2)/2;
		camera.y=-(befungeProgram.pointers[ID].pos.y-befungeProgram.field.length/2);
	}
});


setInterval(fun,1000/60);


var pos1 = 0, pos2 = 0;
dragbar.onmousedown = dragMouseDown;

window.onresize=setPos;

function dragMouseDown(e) {
	e = e || window.event;
	e.preventDefault();
	// get the mouse cursor position at startup:
	pos2 = e.clientY;
	document.onmouseup = closeDragElement;
	// call a function whenever the cursor moves:
	document.onmousemove = elementDrag;
};

function elementDrag(e) {
	e = e || window.event;
	e.preventDefault();
	// calculate the new cursor position:
	pos1 = pos2 - e.clientY;
	pos2 = e.clientY;
	// set the element's new position:
	dragbar.style.top = (dragbar.offsetTop - pos1) + "px";
	deConsole.style.height = window.innerHeight-dragbar.offsetTop-17 + "px";
};

function closeDragElement() {
	// stop moving when mouse button is released:
	document.onmouseup = null;
	document.onmousemove = null;
};
function setPos(){
	pos1=deConsole.offsetTop-10;
	dragbar.style.top = pos1 + "px";
};
