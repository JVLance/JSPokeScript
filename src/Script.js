/* CLASS SCRIPT */

class Script {
	
	constructor(obj){
		
		this.version	= obj.version;
		this.compiler 	= obj.compiler;
		this.movements	= obj.movements[this.version];
		this.alias    	= obj.alias;
		this.subscripts = new Array();
		this.output		= "";
		this.raws		= new Array();
		
		if (typeof(obj.parent) != 'undefined'){
			this.isRoot = false;
			this.parent = obj.parent;
		}else{
			this.isRoot = true;
			this.parent = false;
		}
	}
	
	/* TO REGISTER ONE OR MANY MINISPRITES */
	registerMini(minis){
		for (mini in minis){
			this.minis[mini] = new MiniSprite(this.compiler, this.movements, minis[mini], getParent());
		}
	}
	
	
	
	
	/* A STANDAR MSGBOX */
	msgbox(text, type, alias){
		alias = typeof(alias) != 'undefined' ? alias : this.generateAlias();
		
		this.output += this.compiler.msgbox(alias, type);
		
		this.getParent().raws.push({
			'alias'	  : alias,
			'message' : text
		});
	}
	
	/* A NORMAL MSGBOX */
	message(text, alias){
		this.msgbox(text, 'normal', alias);
	}
	
	/* A MSGBOX WITH YES/NO QUESTION */
	question(text, callback, alias, callAlias){
		this.msgbox(text, 'boolean', alias);
		
		let callAlias = typeof(callAlias) == 'undefined' ? this.generateAlias() : callAlias;
		
		let jump = this.compiler.compare('lastresult', 1)
			+ this.backspace()
			+ this.compile.IF('=')
			+ this.backspace()
			+ this.compile.goTo('@' + callAlias)
			+ this.backspace();
			
		this.output += jump;
		
		addSubscript(callback, callAlias);
	}
	
	addSubscript(fnGenerate, alias){
		let childScript = new script({
			compiler : this.compiler, 
			movements : this.movements, 
			alias : alias, 
			parent : this.getParent(),
			version : this.version
		});
		
		childScript.execute = fnGenerate;
		
		childScript.execute();
		
		this.getParent().subscripts.push({
			alias : callAlias,
			output : childScript.output
		});
	}
	
	generateAlias(){
		let text = "";
		let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

		for (let i = 0; i < 10; i++)
			text += possible.charAt(Math.floor(Math.random() * possible.length));

		return text;
	}
	
	getParent(){
		if (this.isRoot){
			return this;
		}else{
			return this.parent;
		}
	}
	
	backspace(){
		return '\n"';
	}
}