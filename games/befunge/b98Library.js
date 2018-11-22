/*
TODO:
- implement lahey space
- implement multithreading via `t`
- implement fingerprints
*/
function B98Field(bfCode){
	let bfc=bfCode.split('\n');
	let longest=0;
	for(let i=0;i<bfc.length;i++){
		bfc[i]=bfc[i].replace(/\u000c/g,'\n').split('');
		len=bfc[i].length;
		if(len>longest){
			longest=len;
		}
	}
	for(let i=0;i<bfc.length;i++){
		for(let j=bfc[i].length;j<longest;j++){
			bfc[i].push(' ');
		}
	}
	return(bfc);
};
function B98(bfCode){
	this.code=bfCode;
	this.field=B98Field(bfCode);
	//this.pointer.pos={x:0,y:0};
	//this.delta={x:1,y:0};
	this.terminated=false;
	this.exitCode=0;
	//this.stack=[];
	//this.stackStack=[];
	//this.offsetVector={x:0,y:0};
	this.orgin={x:0,y:0};
	this.output='';
	this.input=[];
	this.pIDCount=1;
	this.pointers={
		1:{
			pos:{x:0,y:0},
			delta:{x:1,y:0},
			offset:{x:0,y:0},
			stack:[],
			stackStack:[],
		}
	},
	this.awaiting=false;
	this.commands={
		' ':function(that,pointer){
			while(pointer.pos.y>=0&&pointer.pos.y<that.field.length&&pointer.pos.x>=0&&pointer.pos.x<that.field[pointer.pos.y].length&&that.field[pointer.pos.y][pointer.pos.x]==' '){
				pointer.pos.x+=pointer.delta.x;
				pointer.pos.y+=pointer.delta.y;
				if(pointer.pos.y<0||pointer.pos.y>=that.field.length||pointer.pos.x<0||pointer.pos.x>=that.field[pointer.pos.y].length){
					pointer.pos.x-=pointer.delta.x;
					pointer.pos.y-=pointer.delta.y;
					while(pointer.pos.y>=0&&pointer.pos.y<that.field.length&&pointer.pos.x>=0&&pointer.pos.x<that.field[pointer.pos.y].length){
						pointer.pos.x-=pointer.delta.x;
						pointer.pos.y-=pointer.delta.y;
					}
					pointer.pos.x+=pointer.delta.x;
					pointer.pos.y+=pointer.delta.y;
				}
			}
			pointer.pos.x-=pointer.delta.x;
			pointer.pos.y-=pointer.delta.y;
		},
		'!':function(that,pointer){
			if(that.popStack(pointer)){
				pointer.stack.push(0);
			}
			else{
				pointer.stack.push(1);
			}
		},
		'"':function(that,pointer){
			pointer.stringMode=!pointer.stringMode;
			/*
			pointer.pos.x+=pointer.delta.x;
			pointer.pos.y+=pointer.delta.y;
			while(pointer.pos.y>=0&&pointer.pos.y<that.field.length&&pointer.pos.x>=0&&pointer.pos.x<that.field[pointer.pos.y].length&&that.field[pointer.pos.y][pointer.pos.x]!='"'){
				pointer.stack.push(that.field[pointer.pos.y][pointer.pos.x].charCodeAt());
				pointer.pos.x+=pointer.delta.x;
				pointer.pos.y+=pointer.delta.y;
				if(pointer.pos.y<0||pointer.pos.y>=that.field.length||pointer.pos.x<0||pointer.pos.x>=that.field[pointer.pos.y].length){
					pointer.pos.x-=pointer.delta.x;
					pointer.pos.y-=pointer.delta.y;
					while(pointer.pos.y>=0&&pointer.pos.y<that.field.length&&pointer.pos.x>=0&&pointer.pos.x<that.field[pointer.pos.y].length){
						pointer.pos.x-=pointer.delta.x;
						pointer.pos.y-=pointer.delta.y;
					}
					pointer.pos.x+=pointer.delta.x;
					pointer.pos.y+=pointer.delta.y;
				}
			}*/
		},
		'#':function(that,pointer){
			pointer.pos.x+=pointer.delta.x;
			pointer.pos.y+=pointer.delta.y;
			if(pointer.pos.y<0||pointer.pos.y>=that.field.length||pointer.pos.x<0||pointer.pos.x>=that.field[pointer.pos.y].length){
				pointer.pos.x-=pointer.delta.x;
				pointer.pos.y-=pointer.delta.y;
				while(pointer.pos.y>=0&&pointer.pos.y<that.field.length&&pointer.pos.x>=0&&pointer.pos.x<that.field[pointer.pos.y].length){
					pointer.pos.x-=pointer.delta.x;
					pointer.pos.y-=pointer.delta.y;
				}
				pointer.pos.x+=pointer.delta.x;
				pointer.pos.y+=pointer.delta.y;
			}
		},
		'$':function(that,pointer){
			that.popStack(pointer);
		},
		'%':function(that,pointer){
			let temp=that.popStack(pointer);
			pointer.stack.push(that.popStack(pointer)%temp);
		},
		'&':function(that,pointer){
			if(that.input.length>0){
				pointer.stack.push(parseInt(that.input.pop()));
				that.awaiting=false;
			}
			else{
				that.awaiting='int';
				pointer.pos.x-=pointer.delta.x;
				pointer.pos.y-=pointer.delta.y;
			}
		},
		'\'':function(that,pointer){
			pointer.pos.x+=pointer.delta.x;
			pointer.pos.y+=pointer.delta.y;
			if(that.field[pointer.pos.y][pointer.pos.x]>10||that.field[pointer.pos.y][pointer.pos.x]<0){
				pointer.stack.push(that.field[pointer.pos.y][pointer.pos.x]);
			}
			else{
				pointer.stack.push(that.field[pointer.pos.y][pointer.pos.x].charCodeAt());
			}
		},
		'(':function(that,pointer){
			that.popStack(pointer);
			pointer.delta.x*=-1;
			pointer.delta.y*=-1;
		},
		')':function(that,pointer){
			that.popStack(pointer);
			pointer.delta.x*=-1;
			pointer.delta.y*=-1;
		},
		'*':function(that,pointer){
			pointer.stack.push(that.popStack(pointer)*that.popStack(pointer));
		},
		'+':function(that,pointer){
			pointer.stack.push(that.popStack(pointer)+that.popStack(pointer));
		},
		',':function(that,pointer){
			that.output+=String.fromCharCode(that.popStack(pointer));
		},
		'-':function(that,pointer){
			let temp=that.popStack(pointer);
			pointer.stack.push(that.popStack(pointer)-temp);
		},
		'.':function(that,pointer){
			that.output+=that.popStack(pointer)+' ';
		},
		'/':function(that,pointer){
			let temp=[that.popStack(pointer),that.popStack(pointer)];
			if(!temp[0]){
				pointer.stack.push(0);
				return;
			}
			pointer.stack.push(Math.trunc(temp[1]/temp[0]));
		},
		'0':function(that,pointer){
			pointer.stack.push(0);
		},
		'1':function(that,pointer){
			pointer.stack.push(1);
		},
		'2':function(that,pointer){
			pointer.stack.push(2);
		},
		'3':function(that,pointer){
			pointer.stack.push(3);
		},
		'4':function(that,pointer){
			pointer.stack.push(4);
		},
		'5':function(that,pointer){
			pointer.stack.push(5);
		},
		'6':function(that,pointer){
			pointer.stack.push(6);
		},
		'7':function(that,pointer){
			pointer.stack.push(7);
		},
		'8':function(that,pointer){
			pointer.stack.push(8);
		},
		'9':function(that,pointer){
			pointer.stack.push(9);
		},
		':':function(that,pointer){
			let temp=that.popStack(pointer);
			pointer.stack.push(temp);
			pointer.stack.push(temp);
		},
		';':function(that,pointer){
			pointer.pos.x+=pointer.delta.x;
			pointer.pos.y+=pointer.delta.y;
			while(pointer.pos.y>=0&&pointer.pos.y<that.field.length&&pointer.pos.x>=0&&pointer.pos.x<that.field[pointer.pos.y].length&&that.field[pointer.pos.y][pointer.pos.x]!=';'){
				pointer.pos.x+=pointer.delta.x;
				pointer.pos.y+=pointer.delta.y;
				if(pointer.pos.y<0||pointer.pos.y>=that.field.length||pointer.pos.x<0||pointer.pos.x>=that.field[pointer.pos.y].length){
					pointer.pos.x-=pointer.delta.x;
					pointer.pos.y-=pointer.delta.y;
					while(pointer.pos.y>=0&&pointer.pos.y<that.field.length&&pointer.pos.x>=0&&pointer.pos.x<that.field[pointer.pos.y].length){
						pointer.pos.x-=pointer.delta.x;
						pointer.pos.y-=pointer.delta.y;
					}
					pointer.pos.x+=pointer.delta.x;
					pointer.pos.y+=pointer.delta.y;
				}
			}
		},
		'<':function(that,pointer){
			pointer.delta={x:-1,y:0};
		},
		'>':function(that,pointer){
			pointer.delta={x:1,y:0};
		},
		'?':function(that,pointer){
			d=Math.floor(Math.random()*4);
			switch(d){
				case(0):
					pointer.delta={x:1,y:0};
				break;
				case(1):
					pointer.delta={x:-1,y:0};
				break;
				case(2):
					pointer.delta={x:0,y:1};
				break;
				case(3):
					pointer.delta={x:0,y:-1};
				break;
			}
		},
		'@':function(that,pointer,ID){
			delete that.pointers[ID];
		},
		'[':function(that,pointer){
			switch([pointer.delta.x,pointer.delta.y]){
				case([1,0]):
					pointer.delta={x:0,y:-1};
				break;
				case([-1,0]):
					pointer.delta={x:0,y:1};
				break;
				case([0,1]):
					pointer.delta={x:1,y:0};
				break;
				case([0,-1]):
					pointer.delta={x:-1,y:0};
				break;
				default:
					let theta=Math.atan2(pointer.delta.x,pointer.delta.y)+0.5*Math.PI;
					let v=Math.sqrt(pointer.delta.x*pointer.delta.x+pointer.delta.y*pointer.delta.y);
					pointer.delta={x:Math.round(Math.sin(theta)*v),y:Math.round(Math.cos(theta)*v)};
				break;
			}
		},
		'\\':function(that,pointer){
			let temp=[that.popStack(pointer),that.popStack(pointer)];
			pointer.stack.push(temp[0]);
			pointer.stack.push(temp[1]);
		},
		']':function(that,pointer){
			switch([pointer.delta.x,pointer.delta.y]){
				case([1,0]):
					pointer.delta={x:0,y:1};
				break;
				case([-1,0]):
					pointer.delta={x:0,y:-1};
				break;
				case([0,1]):
					pointer.delta={x:-1,y:0};
				break;
				case([0,-1]):
					pointer.delta={x:1,y:0};
				break;
				default:
					let theta=Math.atan2(pointer.delta.x,pointer.delta.y)-0.5*Math.PI;
					let v=Math.sqrt(pointer.delta.x*pointer.delta.x+pointer.delta.y*pointer.delta.y);
					pointer.delta={x:Math.round(Math.sin(theta)*v),y:Math.round(Math.cos(theta)*v)};
				break;
			}
		},
		'^':function(that,pointer){
			pointer.delta={x:0,y:-1};
		},
		'`':function(that,pointer){
			if(that.popStack(pointer)<that.popStack(pointer)){
				pointer.stack.push(1);
			}
			else{
				pointer.stack.push(0);
			}
		},
		'a':function(that,pointer){
			pointer.stack.push(10);
		},
		'b':function(that,pointer){
			pointer.stack.push(11);
		},
		'c':function(that,pointer){
			pointer.stack.push(12);
		},
		'd':function(that,pointer){
			pointer.stack.push(13);
		},
		'e':function(that,pointer){
			pointer.stack.push(14);
		},
		'f':function(that,pointer){
			pointer.stack.push(15);
		},
		'g':function(that,pointer){
			let cords=[that.popStack(pointer),that.popStack(pointer)];
			if(cords[0]+pointer.offset.y+that.orgin.y>=0&&cords[0]+pointer.offset.y+that.orgin.y<that.field.length&&cords[1]+pointer.offset.x+that.orgin.x>=0&&cords[1]+pointer.offset.x+that.orgin.x<that.field[pointer.pos.y].length){
				let temp=that.field[cords[0]+pointer.offset.y+that.orgin.y][cords[1]+pointer.offset.x+that.orgin.x];
				if(temp<0||temp>=65536){
					pointer.stack.push(temp);
				}
				else{
					pointer.stack.push(temp.charCodeAt());
				}
			}
			else{
				pointer.stack.push(32);
			}
		},
		'j':function(that,pointer){
			let jump=that.popStack(pointer);
			pointer.pos.x+=pointer.delta.x*jump;
			pointer.pos.y+=pointer.delta.y*jump;
			if(pointer.pos.y<0||pointer.pos.y>=that.field.length||pointer.pos.x<0||pointer.pos.x>=that.field[pointer.pos.y].length){
				pointer.pos.x-=jump*pointer.delta.x;
				pointer.pos.y-=jump*pointer.delta.y;
				while(pointer.pos.y<0||pointer.pos.y>=that.field.length||pointer.pos.x<0||pointer.pos.x>=that.field[pointer.pos.y].length){
					pointer.pos.x-=jump*pointer.delta.x;
					pointer.pos.y-=jump*pointer.delta.y;
				}
				while(pointer.pos.y>=0&&pointer.pos.y<that.field.length&&pointer.pos.x>=0&&pointer.pos.x<that.field[pointer.pos.y].length){
					pointer.pos.x-=jump*pointer.delta.x;
					pointer.pos.y-=jump*pointer.delta.y;
				}
				pointer.pos.x+=jump*pointer.delta.x;
				pointer.pos.y+=jump*pointer.delta.y;
			}
		},
		'k':function(that,pointer,ID){
			let its=Math.abs(that.popStack(pointer));
			let temp=[pointer.pos.x,pointer.pos.y];
			pointer.pos.x+=pointer.delta.x;
			pointer.pos.y+=pointer.delta.y;
			let cmd=that.field[pointer.pos.y][pointer.pos.x];
			if(its==0){
				return;
			}
			while(cmd==' '||cmd==';'||pointer.pos.y<0||pointer.pos.y>=that.field.length||pointer.pos.x<0||pointer.pos.x>=that.field[pointer.pos.y].length){
				if(pointer.pos.y<0||pointer.pos.y>=that.field.length||pointer.pos.x<0||pointer.pos.x>=that.field[pointer.pos.y].length){
					pointer.pos.x-=pointer.delta.x;
					pointer.pos.y-=pointer.delta.y;
					while(pointer.pos.y>=0&&pointer.pos.y<that.field.length&&pointer.pos.x>=0&&pointer.pos.x<that.field[pointer.pos.y].length){
						pointer.pos.x-=pointer.delta.x;
						pointer.pos.y-=pointer.delta.y;
					}
					pointer.pos.x+=pointer.delta.x;
					pointer.pos.y+=pointer.delta.y;
				}
				else{
					that.commands[cmd](that,pointer,ID);
					pointer.pos.x+=pointer.delta.x;
					pointer.pos.y+=pointer.delta.y;
				}
				cmd=that.field[pointer.pos.y][pointer.pos.x];
				
			}
			pointer.pos={x:temp[0],y:temp[1]};
			if(cmd=='z'){
				pointer.z=true;
				//pointer.pos.x+=pointer.delta.x;
				//pointer.pos.y+=pointer.delta.y;
			}
			else if(that.commands.hasOwnProperty(cmd)){
				for(let i=0;i<its;i++){
					that.commands[cmd](that,pointer,ID);
				}
				if(pointer.pos.y<0||pointer.pos.y>=that.field.length||pointer.pos.x<0||pointer.pos.x>=that.field[pointer.pos.y].length){
					pointer.pos.x-=pointer.delta.x;
					pointer.pos.y-=pointer.delta.y;
					while(pointer.pos.y>=0&&pointer.pos.y<that.field.length&&pointer.pos.x>=0&&pointer.pos.x<that.field[pointer.pos.y].length){
						pointer.pos.x-=pointer.delta.x;
						pointer.pos.y-=pointer.delta.y;
					}
					pointer.pos.x+=pointer.delta.x;
					pointer.pos.y+=pointer.delta.y;
				}
			}
		},
		'n':function(that,pointer){
			pointer.stack=[];
		},
		'p':function(that,pointer){
			let cords=[that.popStack(pointer),that.popStack(pointer)];
			while(cords[0]+pointer.offset.y+that.orgin.y<0){
				let a=[[]];
				for(let i=0;i<that.field[0].length;i++){
					a[0].push(' ');
				}
				that.field=a.concat(that.field);
				that.orgin.y++;
				pointer.pos.y++;
			}
			while(cords[1]+pointer.offset.x+that.orgin.x<0){
				for(let i=0;i<that.field.length;i++){
					that.field[i]=[' '].concat(that.field[i]);
				}
				that.orgin.x++;
				pointer.pos.x++;
			}
			while(cords[0]+pointer.offset.y+that.orgin.y>=that.field.length){
				let a=[];
				for(let i=0;i<that.field[0].length;i++){
					a.push(' ');
				}
				that.field.push(a);
			}
			while(cords[1]+pointer.offset.x+that.orgin.x>=that.field[0].length){
				for(let i=0;i<that.field.length;i++){
					that.field[i].push(' ');
				}
			}
			let putting=that.popStack(pointer);
			if(putting>=0&&putting<65536){
				putting=String.fromCharCode(putting);
			}
			that.field[cords[0]+pointer.offset.y+that.orgin.y][cords[1]+pointer.offset.x+that.orgin.x]=putting;
		},
		'q':function(that,pointer){
			that.exitCode=that.popStack(pointer);
			that.terminated=true;
			pointer.delta={x:0,y:0};
		},
		's':function(that,pointer){
			pointer.pos.x+=pointer.delta.x;
			pointer.pos.y+=pointer.delta.y;
			let putting=that.popStack(pointer);
			if(putting>=0&&putting<65536){
				putting=String.fromCharCode(putting);
			}
			that.field[pointer.pos.y][pointer.pos.x]=putting;
		},
		't':function(that,pointer){
			that.pIDCount++;
			let stackStackCopy=[];
			for(let i=0;i<pointer.stackStack.length;i++){
				stackStackCopy.push(pointer.stackStack[i].slice());
			}
			that.pointers[that.pIDCount]={
				pos:{x:pointer.pos.x-pointer.delta.x,y:pointer.pos.y-pointer.delta.y},
				delta:{x:-pointer.delta.x,y:-pointer.delta.y},
				offset:{x:pointer.offset.x,y:pointer.offset.y},
				stack:pointer.stack.slice(),
				stackStack:stackStackCopy
			};
		},
		'u':function(that,pointer){
			if(pointer.stackStack.length==0){
				pointer.delta.x*=-1;
				pointer.delta.y*=-1;
				return;
			}
			let loopFor=that.popStack(pointer);
			let ind=pointer.stackStack.length-1;
			if(loopFor<0){
				for(let i=0;i>loopFor;i--){
					pointer.stackStack[ind].push(that.popStack(pointer));
				}
			}
			else{
				for(let i=0;i<loopFor;i++){
					if(pointer.stackStack[ind].length>0){
						pointer.stack.push(pointer.stackStack[ind].pop());
					}
					else{
						pointer.stack.push(0);
					}
				}
			}
		},
		'v':function(that,pointer){
			pointer.delta={x:0,y:1};
		},
		'w':function(that,pointer){
			let a=that.popStack(pointer);
			let b=that.popStack(pointer);
			if(a>b){
				that.commands['['](that,pointer);
			}
			else if(b>a){
				that.commands[']'](that,pointer);
			}
		},
		'x':function(that,pointer){
			pointer.delta.y=that.popStack(pointer);
			pointer.delta.x=that.popStack(pointer);
		},
		'y':function(that,pointer,ID){
			let temp=that.popStack(pointer);
			let stackl=pointer.stack.length;
			if(temp>0){
				pointer.stack.push(0);
				pointer.stack.push(0);
				pointer.stack.push(0);
				pointer.stack.push(0);
				for(let i=0;i<pointer.stackStack.length;i++){
					pointer.stack.push(pointer.stackStack[i].length);
				}
				pointer.stack.push(stackl);
				let now=new Date();
				pointer.stack.push(pointer.stackStack.length+1);//stack stack size
				pointer.stack.push(now.getHours()*256*256+now.getMinutes()*256+now.getSeconds());//time
				pointer.stack.push(now.getYear()*256*256+(now.getMonth()+1)*256+now.getDate());//date
				pointer.stack.push(that.field[0].length-1);//off the end x
				pointer.stack.push(that.field.length-1);//off the end y
				pointer.stack.push(-that.orgin.x);//off the end x
				pointer.stack.push(-that.orgin.y);//off the end y
				pointer.stack.push(pointer.offset.x);//current offset x
				pointer.stack.push(pointer.offset.y);//current offset y
				pointer.stack.push(pointer.delta.x);//current delta x
				pointer.stack.push(pointer.delta.y);//current delta y
				pointer.stack.push(pointer.pos.x-that.orgin.x);//current position x
				pointer.stack.push(pointer.pos.y-that.orgin.y);//current position y
				pointer.stack.push(0);//IP team
				pointer.stack.push(ID);//IP ID
				pointer.stack.push(2);//Dimensions
				pointer.stack.push('/'.charCodeAt());//Path seperator
				pointer.stack.push(0);//OS Paradigm
				pointer.stack.push(1);//version #
				pointer.stack.push(15425399);//handprint
				pointer.stack.push(4);//cell size
				pointer.stack.push(1);//flags
				
				pointer.stack.push(pointer.stack[pointer.stack.length-temp]);
				pointer.stack.splice(stackl,pointer.stack.length-stackl-1);
			}
			else{
				pointer.stack.push(0);
				pointer.stack.push(0);
				pointer.stack.push(0);
				pointer.stack.push(0);
				for(let i=0;i<pointer.stackStack.length;i++){
					pointer.stack.push(pointer.stackStack[i].length);
				}
				pointer.stack.push(stackl);
				let now=new Date();
				pointer.stack.push(pointer.stackStack.length+1);//stack stack size
				pointer.stack.push(now.getHours()*256*256+now.getMinutes()*256+now.getSeconds());//time
				pointer.stack.push(now.getYear()*256*256+(now.getMonth()+1)*256+now.getDate());//date
				pointer.stack.push(that.field[0].length-1);//off the end x
				pointer.stack.push(that.field.length-1);//off the end y
				pointer.stack.push(-that.orgin.x);//off the end x
				pointer.stack.push(-that.orgin.y);//off the end y
				pointer.stack.push(pointer.offset.x);//current offset x
				pointer.stack.push(pointer.offset.y);//current offset y
				pointer.stack.push(pointer.delta.x);//current delta x
				pointer.stack.push(pointer.delta.y);//current delta y
				pointer.stack.push(pointer.pos.x-that.orgin.x);//current position x
				pointer.stack.push(pointer.pos.y-that.orgin.y);//current position y
				pointer.stack.push(0);//IP team
				pointer.stack.push(ID);//IP ID
				pointer.stack.push(2);//Dimensions
				pointer.stack.push('/'.charCodeAt());//Path seperator
				pointer.stack.push(0);//OS Paradigm
				pointer.stack.push(1);//version #
				pointer.stack.push(15425399);//handprint
				pointer.stack.push(4);//cell size
				pointer.stack.push(1);//flags
			}
		},
		'z':function(that,pointer){
			if(pointer.z){
				pointer.z=false;
			}
			else{
				pointer.pos.x-=pointer.delta.x;
				pointer.pos.y-=pointer.delta.y;
				pointer.z=true;
			}
		},
		'{':function(that,pointer){
			let temp=that.popStack(pointer);
			let ind=pointer.stackStack.length;
			if(temp<0){
				pointer.stackStack.push(pointer.stack.slice());
				pointer.stack=[];
				for(let i=0;i>temp;i--){
					pointer.stackStack[ind].push(0);
				}
				pointer.stackStack[ind].push(pointer.offset.x);
				pointer.stackStack[ind].push(pointer.offset.y);
				pointer.offset={x:pointer.pos.x-that.orgin.x+pointer.delta.x,y:pointer.pos.y-that.orgin.y+pointer.delta.y};
				return;
			}
			if(temp>pointer.stack.length){
				pointer.stackStack.push([]);
				pointer.stackStack[ind].push(pointer.offset.x);
				pointer.stackStack[ind].push(pointer.offset.y);
				pointer.offset={x:pointer.pos.x-that.orgin.x+pointer.delta.x,y:pointer.pos.y-that.orgin.y+pointer.delta.y};
				return;
			}
			pointer.stackStack.push(pointer.stack.splice(0,pointer.stack.length-temp));
			pointer.stackStack[ind].push(pointer.offset.x);
			pointer.stackStack[ind].push(pointer.offset.y);
			pointer.offset={x:pointer.pos.x-that.orgin.x+pointer.delta.x,y:pointer.pos.y-that.orgin.y+pointer.delta.y};
		},
		'|':function(that,pointer){
			pointer.delta={x:0,y:1};
			if(that.popStack(pointer)){
				pointer.delta={x:0,y:-1};
			}
		},
		'_':function(that,pointer){
			pointer.delta={x:1,y:0};
			if(that.popStack(pointer)){
				pointer.delta={x:-1,y:0};
			}
		},
		'}':function(that,pointer){
			if(pointer.stackStack.length==0){
				pointer.delta.x*=-1;
				pointer.delta.y*=-1;
				return;
			}
			let ind=pointer.stackStack.length-1;
			if(pointer.stackStack[ind].length>0){
				pointer.offset.y=pointer.stackStack[ind].pop();
			}
			else{
				pointer.offset.y=0;
			}
			if(pointer.stackStack[ind].length>0){
				pointer.offset.x=pointer.stackStack[ind].pop();
			}
			else{
				pointer.offset.x=0;
			}
			let temp=that.popStack(pointer);
			if(temp<0){
				for(let i=0;i>temp;i--){
					pointer.stackStack[ind].pop();
				}
				pointer.stack=pointer.stackStack.pop();
				return;
			}
			pointer.stack=pointer.stackStack.pop().concat(pointer.stack.slice(pointer.stack.length-temp,pointer.stack.length));
		},
		'~':function(that,pointer){
			if(that.input.length>0){
				pointer.stack.push(that.input.pop().charCodeAt());
				that.awaiting=false;
			}
			else{
				that.awaiting='char';
				pointer.pos.x-=pointer.delta.x;
				pointer.pos.y-=pointer.delta.y;
			}
		},
		reflect:function(that,pointer){
			pointer.delta.x*=-1;
			pointer.delta.y*=-1;
		}
	};
	this.loadedFingerprints={
		A:[],
		B:[],
		C:[],
		D:[],
		E:[],
		F:[],
		G:[],
		H:[],
		I:[],
		J:[],
		K:[],
		L:[],
		M:[],
		N:[],
		O:[],
		P:[],
		Q:[],
		R:[],
		S:[],
		T:[],
		U:[],
		V:[],
		W:[],
		X:[],
		Y:[],
		Z:[],
	};
	this.fingerprints={};
};
B98.prototype.popStack=function(pointer){
	if(pointer.stack.length>0){
		return(pointer.stack.pop());
	}
	return(0);
};
B98.prototype.reset=function(){
	this.field=B98Field(this.code);
	this.pIDCount=1;
	this.pointers={
		1:{
			pos:{x:0,y:0},
			delta:{x:1,y:0},
			offset:{x:0,y:0},
			stack:[],
			stackStack:[],
		}
	};
	//this.pointer.pos={x:0,y:0};
	//this.delta={x:1,y:0};
	//this.offsetVector={x:0,y:0};
	this.orgin={x:0,y:0};
	this.output='';
	this.stack=[];
	this.stackStack=[];
	this.terminated=false;
	this.loadedFingerprints={
		A:[],
		B:[],
		C:[],
		D:[],
		E:[],
		F:[],
		G:[],
		H:[],
		I:[],
		J:[],
		K:[],
		L:[],
		M:[],
		N:[],
		O:[],
		P:[],
		Q:[],
		R:[],
		S:[],
		T:[],
		U:[],
		V:[],
		W:[],
		X:[],
		Y:[],
		Z:[],
	};
};
B98.prototype.step=function(){
	if(this.terminated){return;}
	let done=true;
	for(let pointerID in this.pointers){
		done=false;
		let pointer=this.pointers[pointerID];
		if(pointer.stringMode&&this.field[pointer.pos.y][pointer.pos.x]!='"'){
			if(this.field[pointer.pos.y][pointer.pos.x]>10||this.field[pointer.pos.y][pointer.pos.x]<0){
				pointer.stack.push(this.field[pointer.pos.y][pointer.pos.x]);
			}
			else{
				pointer.stack.push(this.field[pointer.pos.y][pointer.pos.x].charCodeAt());
			}
			pointer.pos.x+=pointer.delta.x;
			pointer.pos.y+=pointer.delta.y;
		}
		else{
		let com=this.field[pointer.pos.y][pointer.pos.x];
		if(this.commands.hasOwnProperty(com)){
			this.commands[com](this,pointer,pointerID);
			if(!pointer.stack[pointer.stack.length-1]){
				this.popStack(pointer);
				pointer.stack.push(0);
			}
			pointer.stack[pointer.stack.length-1]=pointer.stack[pointer.stack.length-1]%2147483647;
			pointer.pos.x+=pointer.delta.x;
			pointer.pos.y+=pointer.delta.y;
		}
		else{
			this.commands.reflect(this,pointer,pointerID);
			pointer.pos.x+=pointer.delta.x;
			pointer.pos.y+=pointer.delta.y;
		}
		}
		while(this.field[0].join('').replace(/ /g,'')==''){
			this.field.shift();
			this.orgin.y--;
			pointer.pos.y--;
		}
		let txt='';
		for(let i=0;i<this.field.length;i++){
			txt+=this.field[i][0];
		}
		while(txt.replace(/ /g,'')==''){
			txt='';
			for(let i=0;i<this.field.length;i++){
				this.field[i].shift();
				txt+=this.field[i][0];
			}
			this.orgin.x--;
			pointer.pos.x--;
		}
		while(this.field[this.field.length-1].join('').replace(/ /g,'')==''){
			this.field.pop();
		}
		txt='';
		for(let i=0;i<this.field.length;i++){
			txt+=this.field[i][this.field[i].length-1];
		}
		while(txt.replace(/ /g,'')==''){
			txt='';
			for(let i=0;i<this.field.length;i++){
				txt+=this.field[i].pop();;
				txt+=this.field[i][this.field[i].length-1];
			}
		}
		if(pointer.pos.y<0||pointer.pos.y>=this.field.length||pointer.pos.x<0||pointer.pos.x>=this.field[pointer.pos.y].length){
			pointer.pos.x-=pointer.delta.x;
			pointer.pos.y-=pointer.delta.y;
			while(pointer.pos.y<0||pointer.pos.y>=this.field.length||pointer.pos.x<0||pointer.pos.x>=this.field[pointer.pos.y].length){
				pointer.pos.x-=pointer.delta.x;
				pointer.pos.y-=pointer.delta.y;
			}
			while(pointer.pos.y>=0&&pointer.pos.y<this.field.length&&pointer.pos.x>=0&&pointer.pos.x<this.field[pointer.pos.y].length){
				pointer.pos.x-=pointer.delta.x;
				pointer.pos.y-=pointer.delta.y;
			}
			pointer.pos.x+=pointer.delta.x;
			pointer.pos.y+=pointer.delta.y;
		}
		if(!pointer.stringMode&&this.field[pointer.pos.y][pointer.pos.x]==' '){
			this.commands[' '](this,pointer);
			pointer.pos.x+=pointer.delta.x;
			pointer.pos.y+=pointer.delta.y;
		}
	}
	if(done){
		this.terminated=true;
	}
};