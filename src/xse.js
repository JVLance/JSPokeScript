
//FUNCTIONS OF XSE TRANSPILATION.

//NAMESPACE
const XSE = {};

/* FUNCTION TO MAKE A RANDOM RAW LABEL WHEN THIS IS NOT DEFINED */
XSE.makeraw = function () {
	var text = "";
	var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

	for (var i = 0; i < 10; i++)
		text += possible.charAt(Math.floor(Math.random() * possible.length));

	return text;
}

/* A SIMPLE CLEAN BASE SCRIPT OBJECT */
var basescript = {
	pointer: null,
	callback: null,
	returned: true,
	gotoEd: null,
	printed: false,
	texto: '',
	subscripts : {

	}
}


/* ACTUAL SCRIPT IN TRANSPILER */
XSE.actual_script = null;
XSE.actual_sub_script = null;


/* SCRIPTS STACK OBJECT IN TRANSPILER */
XSE.scripts = {

}

XSE.output_script = '';
XSE.output_raw = '';
XSE.output = '';

/* RAWS DIRECTIONS IN TRANSPILER */
XSE.RAWS = {};

XSE.compile = function(pointer, script){
	this.org(pointer);
	if (typeof script == 'Object'){
		let run = new script();
	}else{
		script();
	}
	
	if (this.scripts[pointer].returned){
		this.RETURN();
	}

	
	if (this.scripts[pointer].gotoEd != null){
		this.goTo(this.scripts[pointer].gotoEd);
	}

	if (!this.scripts[pointer].returned && this.scripts[pointer].gotoEd == null){
		this.end();
	}

	this.output_script += this.scripts[pointer].texto + '\n\n';

	let keys = Object.keys(this.scripts[pointer].subscripts);

	if (keys.length == 0){
		return;
	}

	for (let i = 0; i < keys.length; i++){
		let sub = this.scripts[pointer].subscripts[keys[i]];
		this.scripts[sub.pointer] = sub;
		this.run(this.scripts[sub.pointer]);
	}

	this.scripts[pointer].subscripts = {};

};



XSE.prepare_raws = function(){
	this.output_raw = '';
	let keys = Object.keys(this.RAWS);
	for (let i = 0; i < keys.length; i++){
		let raw = this.RAWS[keys[i]];
		if (typeof raw == 'string'){
			this.output_raw += '#org ' + keys[i] + '\n= ' + raw + '\n\n'; 
		}else{
			let cache = '#org ' + key[i] + '\n';
			for (let i = 0; i < raw.length; i++){
				cache += '#raw 0x' + raw[i] + '\n';
			}
			cache += '\n\n';
			this.output_raw += cache;
		}

	}
}

XSE.run = function(script){

	this.compile(script.pointer, script.callback);

	this.prepare_raws();

	this.output = this.output_script + this.output_raw;

	return this.output;
}


XSE.init = function(pointer, version, script){
	this.scripts = {}
	this.raws = {};
	this.scripts[pointer] = basescript;

	this.scripts[pointer].pointer = pointer;
	this.scripts[pointer].callback = script;
	this.scripts[pointer].returned = false;

	this.version = version;
	this.movements = movements[this.version];
	this.run(this.scripts[pointer]);
}

/* LIBRARY FUNCTIONS */

XSE.set = function (command, arg){
	let params = new Array();
	params.push(command);
	for (let i = 0; i < arg.length; i++){
		if (arg[i].indexOf('@') != -1 || arg[i].indexOf('0x') != -1) {
			params.push(arg[i]);
			continue;
		}
		params.push('0x' + arg[i]);
	}
	
	this.scripts[this.actual_script].texto += params.join(' ') + (command != 'if' ? '\n' : ' ');
	return this;
}

/* RAW FUNCTION TU USE IN MSGBOX AND APPLYMOVEMENT */
XSE.setRaws = function (label, commands){
	this.RAWS[label] = commands;
}

/* GENERAL FUNCTIONS */

//DYNAMIC
XSE.dynamic = function(offset) {
	return this.set('#dynamic', [offset]);
}

//ORG
XSE.org = function(offset){
	this.actual_script = offset;
	return this.set('#org', [offset]);
}

//FACEPLAYER
XSE.faceplayer = function(){
	return this.set('faceplayer', []);
}

//LOCK AND LOCKALL
XSE.lock = function(all){
	all = (typeof all == 'undefined') ? false : all;
	return this.set(all ? 'lockall' : 'lock', []);
}

//MSGBOX
XSE.msgbox = function ({label, text, type}){
	if (typeof(label) != 'undefined'){
		label = ((label.indexOf('0x') == -1 && label.indexOf('@') == -1) ? '@' + label : label )
	}else{
		label = '@' + this.makeraw(); 
	}

	this.setRaws(label, text);
	return this.set('msgbox', [label, this.getTypeMsgBox(type)]);
}

//TYPES OF MSGBOX
XSE.typesMsgBox = {
	'mini'		: '2',
	'posters'	: '3',
	'notClosed' : '4',
	'boolean'	: '5',
	'normal'	: '6'
};

//GET THE TYPE OF MSGBOX
XSE.getTypeMsgBox = function(type){
	return (type.indexOf('0x') != -1) ? type : this.typesMsgBox[type];
}

//WAITMSG
XSE.waitmsg = function(){
	return this.set('waitmsg', []);
}

//CLOSEONKEYPRESS
XSE.closeonkeypress = function(){
	return this.set('closeonkeypress', []);
}

//RELEASE AND RELEASEALL

XSE.release = function(all){
	all = (typeof all == 'undefined') ? false : all;
	return this.set(all ? 'releaseall' : 'release');
}

//END
XSE.end = function(){
	return this.set('end', []);
}

//APPLYMOVEMENT
XSE.applymovement = function ({minisprite, label, movements}) {
	if (typeof(label) != 'undefined'){
		label = ((label.indexOf('0x') == -1 && label.indexOf('@') == -1) ? '@' + label : label )
	}else{
		label = '@' + this.makeraw(); 
	}

	this.setRaws(label, movements);

	return this.set('applymovement', [minisprite, label]);
}

//WAITMOVEMENT
XSE.waitmovement = function (minisprite){
	return this.set('waitmovement', [minisprite]);
}

//WARPED TO A SPECIFIC OR TO A SPECIFIC X/Y POSITION OF A MAP
XSE.warp = function(warp){
	/*
	WARP OBJECT STRUCT:
	
	{
		back : NUMBER OF BANK OF MAP,
		map  : NUMBER OF MAP,
		warp : NUMBER OF WARP TO WARPED,
		x	 : HORIZONTAL POSITION TO WARPED,
		y	 : VERTICAL POSITION TO WARPED
	}
	*/
	//TO SPECIFIC WARP
	if (typeof warp.x == 'undefined' || typeof warp.y == 'undefined'){
		return this.set('warp', [warp.bank, warp.map, warp.warp, 0, 0]);
	}
		
	//TO SPECIFIC X/Y POSITION
	return this.set('warp', [warp.bank, warp.map, 'FF', warp.x, warp.y]);
}

//MOVESPRITE
XSE.movesprite = function (minisprite, x, y){
	return this.set('movesprite', [minisprite, x, y]);
}

//SETDOOROPENED
XSE.setdooropened = function (x, y){
	return this.set('setdooropened', [x, y]);
}

//SETDOORCLOSED
XSE.setdoorclosed = function (x, y){
	return this.set('setdoorclosed', [x, y]);
}

//DOORCHANGE
XSE.doorchange = function(){
	return this.set('doorchange', []);
}

//GIVEPOKEMON
XSE.givepokemon = function(pokemon, level, item){
	return this.set('givepokemon', [pokemon, level, item, 0, 0, 0]);
}

//GIVEEGG
XSE.giveegg = function (pokemon) {
	return this.set('giveegg', [pokemon]);
}

//TYPES OF TRINERBATTLE
XSE.typesTrainerBattle = {
	'normal' : '1',
	'event'  : '3'
}


//
XSE.getTypeTrainerBattle = function(type){
	return (type.indexOf('0x') != -1) ? type : this.typesTrainerBattle[type];
}

//TRAINERBATTLE
XSE.trainerbattle = function (trainer) {
	
	/*
	TRAINER OBJECT STRUCT:
	
	{
		fightType		: TYPE OF TRAINERBATTLE,
		trainer			: NUMBER OF TRAINERBATTLE,
		nextIfLoosed	: ONLY ON FR/LG, SET IF THE SCRIPT CONTINUE IF THE PLAYER LOSED THE TRAINERBATTLE (SET THIS VALUE TO 3),
		firstText		: TEXT WITH SHOW WHEN THE TRAINER SEE THE PLAYER (IF A NORMAL TRAINER), OR THE TEXT SHOW IF PLAYER DEFEAT THIS IF NOT EXIST lastText,
		lastText		: TEXT WITH SHOW WHEN THE PLAYER DEFEAT THE TRAINER IF EXIST firsText,
		leaderOrg		: OFFSET TO REDIRECT IF THE TRAINERBATTLE IF A GYM LEADER AND THE PLAYER DEFEAT THIS
	}
	*/
	
	trainer.nextIfLoosed = typeof (trainer.nextIfLoosed) == 'undefined' ? '0' : trainer.nextIfLoosed;
	
	let params = [this.getTypeTrainerBattle(trainer.fightType), trainer.trainer, trainer.nextIfLoosed, trainer.firstText];
	
	if (typeof (trainer.lastText) != 'undefined') {
		params.push(trainer.lastText);
		
		if (typeof(trainer.leaderOrg) != 'undefined')  {
			params.push(trainer.leaderOrg);
		}
	}
	
	return this.set('trainerbattle', params);
}

//SETTRAINERFLAG
XSE.settrainerflag = function(trainer){
	return this.set('settrainerflag', [trainer]);
}

//CLEARTRAINERFLAG
XSE.cleartrainerflag = function(trainer){
	return this.set('cleartrainerflag', [trainer]);
}

//WILDBATTLE
XSE.wildbattle = function(pokemon, level, object){
	return this.set('wildbattle', [pokemon, level, object]);
}

//SETMAPTILE
XSE.setmaptile = function (x, y, tile, permission){
	return this.set('setmaptile', [x, y, tile, permission]);
}


//VARIABLES AND FLAGS FUNCTIONS

//SETVAR

XSE.setvar = function(variable, value){
	return this.set('setvar', [variable, value]);
}

//CONDITIONS

XSE.typesConditions = {
	'<'  : '0',
	'='  : '1',
	'>'  : '2',
	'<=' : '3',
	'>=' : '4',
	'!=' : '5'
}

XSE.getTypeConditions = function(type){
	return (type.indexOf('0x') != -1) ? type : this.typesConditions[type];
}

//IF
XSE.IF = function(condition){
	return this.set('if', [this.getTypeConditions(condition)]);
}

//COMPARE

XSE.compare = function (variable, value){
	let command = (variable == 'lastresult') ? 'compare lastresult' : 'compare';
	let params	= (variable == 'lastresult') ? [value] : [variable, value];
	return this.set(command, params);
}

//GOTO
XSE.goTo = function (direction){
	return this.set('goto', [direction]);
}

//CHECKGENDER
XSE.checkgender = function(){
	return this.set('checkgender', []);
}

//SETFLAG
XSE.setflag = function(flag){
	return this.set('setflag', [flag]);
}

//CLEARFLAG
XSE.clearflag = function(flag){
	return this.set('clearflag', [flag]);
}

//CHECKFLAG
XSE.checkflag = function(flag){
	return this.set('checkflag', [flag]);
}

/* WEATHER AND ANOTHERS COMMANDS */
XSE.setweather = function (weather){
	return this.set('setweather', [weather]);
}

//DOWEATHER
XSE.doweather = function(){
	return this.set('doweather', []);
}

//GIVEITEM
XSE.giveitem = function(object, quantity, typeMsg){
	return this.set('giveitem', [object, quantity, typeMsg]);
}

//SOUND

XSE.sound = function(sound){
	return this.set('sound', [sound]);
}

//FANFARE
XSE.fanfare = function(fanfare){
	return this.set('fanfare', [fanfare]);
}

//WAITFANFARE
XSE.waitfanfare = function(){
	return this.set('waitfanfare', []);
}

//PLAYSONG
XSE.playsong = function(song){
	return this.set('playsong', [song, 0]);
}

//SPECIAL
XSE.special = function(special){
	return this.set('special', [special]);
}

//WAITSTATE
XSE.waitstate = function(){
	return this.set('waitstate', []);
}

//FADESCREEN
XSE.fadescreen = function(type){
	return this.set('fadescreen', [type]);
}

//HIDESPRITE
XSE.hidesprite = function(sprite){
	return this.set('hidesprite', [sprite]);
}

//SHOWSPRITE
XSE.showsprite = function(sprite){
	return this.set('showsprite', [sprite]);
}

//CALL

XSE.call = function (direction){
	return this.set('call', [direction]);
}

//RETURN
XSE.RETURN = function (){
	return this.set('return', []);
}

//PAUSE
XSE.pause = function (time){
	return this.set('pause', [time]);
}

//FADEDEFAULT
XSE.fadedefault = function(){
	return this.set('fadedefault', []);
}

//SHOWPOKEPIC
XSE.showpokepic = function(pokemon, x, y){
	return this.set('showpokepic', [pokemon, x, y]);
}

//CHECKATTACK
XSE.checkattack = function(attack){
	return this.set('checkattack', [attack]);
}

//CRY
XSE.cry = function(pokemon){
	return this.set('cry', [pokemon, 0]);
}