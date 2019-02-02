let canvas=document.getElementById('canvas');
let befungeProgram=false;
//mouse stuff
let mouseIsPressed = false;
let important={'strokeStyle':0,'fillStyle':0,'lineCap':0,'lineWidth':0};
//run
function run(){
	let temp=befungeProgram.ctx.getTransform();
	
	let tempC={};
	for(var i in important){
		tempC[i]=befungeProgram.ctx[i];
	}
	
	canvas.style.width=window.innerWidth+'px';
	canvas.style.height=window.innerHeight+'px';
	
	if(!befungeProgram.terminated){
		canvas.width = canvas.offsetWidth;
		canvas.height = canvas.offsetHeight;
	}
	
	for(var i in important){
		befungeProgram.ctx[i]=tempC[i];
	}
	befungeProgram.ctx.save();
	befungeProgram.ctx.setTransform(temp);
	
	/*
	if(befungeProgram.output){
		console.log(befungeProgram.output);
		befungeProgram.output='';
	}*/
	befungeProgram.draw=false;
	while(!befungeProgram.draw){
		befungeProgram.step();
		if(befungeProgram.awaiting||befungeProgram.terminated){
			befungeProgram.draw=true;
		}
	}
	if(befungeProgram.awaiting){
		switch(befungeProgram.awaiting){
			case('int'):
				befungeProgram.input.push(prompt(befungeProgram.output+"\ngive integer input"));
				befungeProgram.output='';
			break;
			case('char'):
				befungeProgram.input.push(prompt(befungeProgram.output+"\ngive character input"));
				befungeProgram.output='';
			break;
		}
	}
}
function openFile(event){
    let input = event.target;

    let reader = new FileReader();
    reader.onload = function(){
      let text = reader.result;
      befungeProgram=new B98(reader.result,canvas);
	  setInterval(run,1000/60);
	  document.getElementById('inp').style.visibility='hidden';
	  document.getElementById('inp').style.position='fixed';
	  canvas.style.position='absolute';
	  canvas.style.top=0;
    };
    reader.readAsText(input.files[0]);
  };
//befungeProgram=new B98(code.value,canvas);
//setInterval(run,1000);