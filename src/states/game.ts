module GameModule.State{
  export class Game extends Phaser.State{
    game: Phaser.Game;

    land:Phaser.Sprite;
    cities:GameModule.Group.City[];
    plane:Phaser.Sprite;
    bomb:Phaser.Sprite;
    score:number=0;
    scoreText:Phaser.BitmapText;

    emitter:Phaser.Particles.Arcade.Emitter;
    gameLost:boolean;
    gameWon:boolean;
    speed:number;
    droppedThisRun:boolean;
    explosion:Phaser.Sound;
    gamewon:Phaser.Sound;
    battlescene:Phaser.Sound;
    mayday:Phaser.Sound;
    filter:Phaser.Filter;
    background:Phaser.Image;

    skies:Phaser.Sprite;

    constructor() {
      super();
    }

    create(){
      this.cities = [];
      this.gameLost = false;
      this.gameWon = false;
      this.speed = 100;
      this.droppedThisRun = false;

      this.game.stage.smoothed = false;

      this.game.physics.startSystem(Phaser.Physics.ARCADE);

      //this.game.add.image(0, 0, 'sky');
      //this.game.stage.backgroundColor = "#ffffff";

      this.skies = this.game.add.sprite(0,0,'skies');
      //play(name: string, frameRate?: number, loop?: boolean, killOnComplete?: boolean): Phaser.Animation;
      this.skies.animations.add('flash');
      //this.skies.animations.play('flash',10,true);

      this.land = this.game.add.sprite(0, 336, 'land');

      this.bomb = this.game.add.sprite(0, 0, 'bomb');
      this.bomb.visible = false;

      this.plane = this.game.add.sprite(-21, 16, 'plane');
      this.plane.anchor.set(0.5, 0);
      this.plane.checkWorldBounds = true;
      this.plane.events.onOutOfBounds.add(this.planeLeft, this);

      this.game.physics.arcade.enable( [ this.plane, this.bomb, this.land ] );

      this.plane.body.allowGravity = false;
      this.plane.body.velocity.x = 100;

      this.bomb.checkWorldBounds = true;

      Main.heights = Phaser.Utils.shuffle(Main.heights);

      for (var i = 0; i < Main.heights.length; i++) {
          this.cities.push(new GameModule.Group.City(this, 48 + i * 16, Main.heights[i]));
      }

      this.emitter = this.game.add.emitter(0, 0, 500);

      this.game.physics.arcade.bounds.setTo(0, 0, this.game.world.width, 336);
      this.game.physics.arcade.checkCollision = { up: false, down: true, left: false, right: false };

      this.emitter.makeParticles('particles', [0,1,2,3,4], 500, true, true);
      this.emitter.gravity = 200;
      this.emitter.bounce.set(0.25);
      this.emitter.setXSpeed(-200, 200);
      this.emitter.setYSpeed(-50, 50);

      this.score = 0;
      this.scoreText = this.add.bitmapText(8, 360, 'rollingThunder', 'score: 0', 16);

      this.game.add.image(390, 360, 'photonstorm');

      this.game.input.onDown.add(this.dropBomb, this);

      this.explosion = this.game.add.audio('bombdrop');
      //addMarker(name: string, start: number, duration: number, volume?: number, loop?: boolean): void;
      this.explosion.addMarker('bomwhistle',0.0,2.7,1,false);
      this.explosion.addMarker('bomexplode',2.7,6,1,false);

      this.gamewon = this.game.add.audio('gamewon');

      this.battlescene = this.game.add.audio('battlescene',1,true);
      this.battlescene.play();

      this.mayday = this.game.add.audio('mayday');

      //this.background = this.game.add.sprite(0, 0);
      //this.background.width = 512;
	    //this.background.height = 384;

      //this.filter = this.add.filter('LazerBeam', 512, 384);
      //this.filter.init();
      //	You have the following values to play with (defaults shown):
    	//this.filter.alpha = 0.0;
    	//this.filter.red = 1.0;
    	// filter.green = 1.0;
    	// filter.blue = 2.0;
    	//this.filter.thickness = 70.0;
    	//this.filter.speed = 1.0;
      //this.filter.

    	//this.background.filters = [this.filter];



    }

    update(){
      this.scoreText.text = 'score:' + this.score;
      if (this.gameLost || this.gameWon){
          return;
      }

      for (var i = 0; i < this.cities.length; i++) {
          if (this.cities[i].alive){
              this.game.physics.arcade.overlap(this.plane, this.cities[i].top, this.planeSmash, null, this);
          }
      }

      if (this.bomb.visible){
          for (var i = 0; i < this.cities.length; i++) {
              if (this.cities[i].alive) {
                  this.game.physics.arcade.overlap(this.bomb, this.cities[i].top, this.cities[i].hit, null, this.cities[i]);
              }
          }
          this.game.physics.arcade.overlap(this.bomb, this.land, this.removeBomb, null, this);
      }
    }

    planeSmash(){
      this.gameLost = true;
      this.plane.body.velocity.x = 0;
      this.emitter.x = this.plane.x;
      this.emitter.y = this.plane.y;
      this.emitter.start(true, 2000, null, 64);

      var tween = this.game.add.tween(this.plane).to( { y: 320 }, 2000, Phaser.Easing.Exponential.In, true);
      tween.onComplete.add(this.gameOver, this);

      this.game.input.onDown.remove(this.dropBomb, this);
    }

    planeLeft():void{
      if (this.gameWon) {
          this.plane.body.velocity.x = 0;

          if (this.plane.body.facing === Phaser.LEFT) {
              this.plane.scale.x = 1;
          }
          else {
              this.plane.scale.x = -1;
          }
          var tween = this.add.tween(this.plane).to( { x: 256, y: 320 }, 2000, Phaser.Easing.Cubic.Out, true);
          tween.onComplete.add(this.gameOver, this);
      }
      else {
          this.speed += 1;
          this.plane.y += 4;
          this.droppedThisRun = false;
          if (this.plane.body.facing === Phaser.LEFT) {
              this.plane.scale.x = 1;
              this.plane.body.velocity.x = this.speed;
          }
          else {
              this.plane.scale.x = -1;
              this.plane.body.velocity.x = -this.speed;
          }
      }
    }

    dropBomb():void {
        if (this.droppedThisRun){
            return;
        }
        this.droppedThisRun = true;
        this.bomb.x = Phaser.Math.snapToFloor(this.plane.x, 16) + 2;
        this.bomb.y = this.plane.y + 8;
        this.bomb.body.gravity.y = 200;
        this.bomb.body.velocity.y = 100;
        this.bomb.visible = true;
        this.explosion.play('bomwhistle');
    }

    removeBomb(){
        this.bomb.reset(0, 0);
        this.bomb.body.gravity.y = 0;
        this.bomb.body.velocity.y = 0;
        this.bomb.visible = false;
    }

    deadCities(){
      //console.log("deadCities");
      for (var i = 0; i < this.cities.length; i++){
          if (this.cities[i].alive){
              return;
          }
      }
      //  Got this far? Then they're all dead Jim ...
      this.gameWon = true;
      this.input.onDown.remove(this.dropBomb, this);
    }

    gameOver():void {

        this.battlescene.stop();
        if (this.gameWon) {
            var t = this.game.add.bitmapText(0, 128, 'rollingThunder', 'YOU WIN', 32);
            this.gamewon.play();
        }
        else {
            var t = this.game.add.bitmapText(0, 64, 'rollingThunder', 'GAME LOST', 32);
            this.mayday.play();
        }
        t.x = 256 - (t.textWidth / 2);
        this.game.input.onDown.add(this.quitGame, this);
    }

    quitGame():void {
  		this.game.state.start('MainMenu');
  	}


/*
    player:GameModule.Sprite.Player;
	  asteroids:GameModule.Group.Asteroids;
	  explosions;
	  waves:GameModule.Waves;
	  font:Phaser.RetroFont;

	  cursors:Phaser.CursorKeys;
	  fireButton:Phaser.Key;

    music:Phaser.Sound;
    intro:Phaser.Sound;
    explosion:Phaser.Sound;
    hitcount:number=0;
    */



    /*
    create(){

      //this.add.sprite('space')
      this.game.add.tileSprite(0, 0, 800, 600, 'space');
      this.player = new GameModule.Sprite.Player(this.game, this.game.world.centerX, this.game.world.centerY);
      this.asteroids = new GameModule.Group.Asteroids(this);
      this.add.existing(this.player.trail);
      this.add.existing(this.player.bullets);
      this.add.existing(this.asteroids);
      this.add.existing(this.player.muzzle);
      this.add.existing(this.player.explode);
      this.add.existing(this.player);

      this.waves = new GameModule.Waves(this);
      this.waves.level1();


      //	Still think maybe this ought to be inside the Player class
  		this.cursors = this.input.keyboard.createCursorKeys();
  		this.fireButton = this.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
		  // this.world.sendToBack(bg);

      //	add a colon
	    this.font = this.add.retroFont('font', 14, 14, '0123456789:,!.+?ABCDEFGHIJKLMNOPQRSTUVWXYZ', 42);
	    //this.font.text = 'score: 00000                                   lives: 3';
      this.writescore(0,3);
	    this.add.image(16, 16, this.font);

      //this.music = this.game.add.audio('GameMusic');
      //this.music.play();
      this.intro = this.game.add.audio('intro');
      this.intro.loop = true;
      //this.intro.volume = 0.5;
      this.intro.play();

      this.explosion = this.game.add.audio('spaceshipexplosion');
      //addMarker(name: string, start: number, duration: number, volume?: number, loop?: boolean): void;
      this.explosion.addMarker('roid-explosion',0.5,2,0.2,false);



      return this;
    }

    update(){

      this.player.zero();

	    if (this.cursors.up.isDown)
	    {
	    	this.player.thrust();
	    }

	    if (this.cursors.left.isDown)
	    {
	    	this.player.rotateLeft();
	    }
	    else if (this.cursors.right.isDown)
	    {
	    	this.player.rotateRight();
	    }

	    if (this.fireButton.isDown)
	    {
	    	this.player.fire();
	    }

	    this.game.physics.arcade.overlap(this.player.bullets, this.asteroids, this.hit, null, this);
      this.game.physics.arcade.overlap(this.player, this.asteroids, this.crash, null, this);
      //this.game.physics.arcade.collide(this.player,this.asteroids,this.collide)

    }

    hit(bullet, roid){
      bullet.kill();
		  this.asteroids.hit(roid);
      //console.log(this.player);
      //this.explosion.volume=0.5;
      //this.explosion.duration = 1;
      this.explosion.play('roid-explosion');

      var living:number = this.asteroids.countLiving();
      if(living===0){
        console.log("Clear");
        this.player.zero();

        this.input.onDown.addOnce(this.quitGame, this);
      }

      //this.hitcount++;
      //console.log(this.hitcount);
      //this.game.debug.text(this.hitcount.toString(),20,580);
      this.writescore(++this.hitcount,3);
    }

    writescore(score:number,lives:number){
      var scoretext:string = score.toString();
      var ln = scoretext.length;
      for(var i = 0; i < 5-ln; i++){
        scoretext = "0" + scoretext;
      }
      this.font.text = 'score: '+ scoretext +'                                   lives: ' + lives.toString();
    }

    render(){
      //this.game.debug.text(this.asteroids.total, 20, 580);
    }

    gameOver(){

    }

    quitGame(){
      this.intro.stop();
      this.game.state.start('MainMenu');
    }

    crash(){
      this.hitcount=0;
      if(this.intro) this.intro.stop();
      this.player.crash(()=>{
        this.quitGame();
      });

      //this.music.stop();

    }
    */

  }
}
