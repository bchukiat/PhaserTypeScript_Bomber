module GameModule.Group{
  export class City extends Phaser.Group{
    state:GameModule.State.Game;
    game:Phaser.Game;
    stack:number;
    color:number;
    style:number;
    top:Phaser.Sprite;
    constructor(state:any, x:number, height:number){
      this.state=state;
      this.game=state.game;
      super(this.game);
      //console.log(this.state);
      this.stack=height;
      this.color = this.game.rnd.pick([0, 7, 14, 21, 28]);
      this.style = this.game.rnd.integerInRange(0, 2);
      this.top;
      this.build(x);

      return this;
    }


    build(x){
      this.enableBody = true;
    	var y = 336 - (this.stack * 16);
    	for (var i = 0; i < this.stack; i++){
    		//	The first piece is always the roof
    		if (i === 0){
    			this.top = this.create(x, y, 'city', this.color + 3);
    		}
    		else{
    			var block = this.create(x, y, 'city', this.color + this.style);
    		}
    		y += 16;
    	}

    	this.setAll('body.allowGravity', false);
    	this.setAll('body.immovable', true);
    	this.alive = true;
    }

    hit(bomb, block){
      //var emitter = this.game.state.getCurrentState().emitter;
      var emitter = this.state.emitter;
      var damage = this.game.rnd.integerInRange(2, 5);
      if (damage > this.stack){
      	damage = this.stack;
      }

      bomb.reset(0, 0);
      bomb.body.gravity.y = 0;
      bomb.body.velocity.y = 0;
      bomb.visible = false;

      this.cursor = this.getFirstAlive();
      for (var i = 0; i < damage; i++){
      	if (this.cursor){
      		this.game.time.events.add(100 * i, this.crumble, this, this.cursor);
  	    	this.game.time.events.add(200 * i, this.explode, this, this.cursor, emitter);
      		this.stack--;
      		this.next();
      	}
      }

      if (this.stack > 0){
  	    //	reset the top
  	    this.top = this.cursor;
  	    i++;
      	this.game.time.events.add(100 * i, this.crumble, this, this.top);
      }
      else{
  		    this.alive = false;
      }
      this.state.deadCities();

      this.state.explosion.stop();
      this.state.explosion.play('bomexplode');
      this.state.skies.animations.play('flash',10,false);
    }

    crumble(block){
      block.frame = this.color + this.game.rnd.integerInRange(4, 6);
    }

    explode(block, emitter){
      emitter.x = block.x + 8;
    	emitter.y = block.y + 8;
    	emitter.start(true, 2000, null, 16);
      this.state.score += 10;

    	block.kill();
    }


  }
}
