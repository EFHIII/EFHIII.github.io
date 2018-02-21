var txt="How's the weather outside?";
{
var questions="who,what,where,when,why,how";
var operations="come,get,give,go,keep,let,make,put,seem,take,be,do,have,say,see,send,may,will,about,across,after,against,among,at,before,between,by,down,from,in,off,on,over,through,to,under,up,with,as,for,of,till,than,a,the,all,any,every,no,other,some,such,that,this,I,he,you,who,and,because,but,or,if,though,while,again,ever,far,forward,here,near,now,out,still,then,there,together,well,almost,enough,even,little,much,not,only,quite,so,very,tomorrow,yesterday,north,south,east,west,please,yes,did,are";
var qualities="able,acid,angry,automatic,beautiful,black,boiling,bright,broken,brown,cheap,chemical,chief,clean,clear,common,complex,conscious,cut,deep,dependent,early,elastic,electric,equal,fat,fertile,first,fixed,flat,free,frequent,full,general,good,great,grey,hanging,happy,hard,healthy,high,hollow,important,kind,like,living,long,married,material,medical,military,natural,necessary,new,normal,open,parallel,past,physical,political,poor,possible,present,private,probable,quick,quiet,ready,red,regular,responsible,right,round,same,second,separate,serious,sharp,smooth,sticky,stiff,straight,strong,sudden,sweet,tall,thick,tight,tired,true,violent,waiting,warm,wet,wide,wise,yellow,young";
var qualities2="awake,bad,bent,bitter,blue,certain,cold,complete,cruel,dark,dead,dear,delicate,different,dirty,dry,false,feeble,female,foolish,future,green,ill,last,late,left,loose,loud,low,male,mixed,narrow,old,opposite,public,rough,sad,safe,secret,short,shut,simple,slow,small,soft,solid,special,strange,thin,white,wrong";
}//basic English
var users={
    you:{
        col:'28f',
        nick:'You',
        img:'https://www.kasandbox.org/programming-images/avatars/leaf-green.png'
    },
    bot:{
        col:'afa',
        nick:'<i>BOT</i>',
        img:'https://www.kasandbox.org/programming-images/avatars/robot_male_1.png'
    }
};

var inp=document.getElementById('form text');
var outp=document.getElementById('out');
function escapeHTML(t) {
    return t.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
function message(snowflake,msg,username){
    var txt='<div class=msg id='+snowflake+'>';
    var user=users[username];
    txt+="<img src='"+user.img+"' class='userpic' alt='"+username+"'><div><b style='color:#"+user.col+"'>"+user.nick+"</b><br>"+escapeHTML(msg)+"</div>";
    txt+='</div>';
    return(txt);
};
function bot(txt){
    return("I'm sorry, I'm currently under construction. Check back later once I have learned how to talk.");
};
function run(){
	var snowflake=''+Date.now();
    var out=message(snowflake,inp.value,'you');
    inp.value='';
    outp.innerHTML+=out;
	document.getElementById(snowflake).scrollIntoViewIfNeeded();
    outp.innerHTML+=message(snowflake+'b',bot(inp.value),'bot');
	document.getElementById(snowflake+'b').scrollIntoViewIfNeeded();
	return false;
};