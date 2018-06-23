
class MiniSprite {
	
	constructor(compiler, movements, number, parent){
		this.compiler	= compiler;
		this.movements	= movements;
		this.number		= number;
		this.parent		= parent;
		this.state		= 'look';

		this.applymov	= '';
	}
	
	commit(movements, alias){
		this.parent.raws.push({
			'alias'	  : alias,
			'movements' : this.applymov
		});
	}

	rollback(){
		this.applymov = '';
	}
	
	move(steps, type, state){
		let state = typeof(state) != 'undefined' ? state : this.state;
		for (let i = 0; i < steps; i++){
			this.applymov += this.movements[state][type];
		}
	}

	up(steps, state){
		this.move(steps, 'UP', state);
	}

	down(steps, state){
		this.move(steps, 'DOWN', state);
	}

	left(steps, state){
		this.move(steps, 'LEFT', state);
	}

	right(steps, state){
		this.move(steps, 'RIGHT', state);
	}
}