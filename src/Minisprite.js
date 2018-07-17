
class MiniSprite {
	
	constructor(mini){
		this.mini		= mini;
		this.state		= 'normal';

		this.applymov	= new Array();

		for (let key in XSE.movements){
			this[key] = () => {
				this.state = key;
			}
		}
	}
	
	move(steps, type, state){
		let state = typeof(state) != 'undefined' ? state : this.state;
		for (let i = 0; i < steps; i++){
			this.applymov.push(XSE.movements[state][type]);
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

	end(label){
		XSE.applymovement({
			minisprite : this.mini, label : label, movements : this.applymov
		});
		this.applymov = new Array();
	}
}