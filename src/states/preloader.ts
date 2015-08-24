module GameModule.State{
  export class Preloader extends Phaser.State{
    game: Phaser.Game;

    background: Phaser.Sprite = null;
	  preloadBar: Phaser.Sprite = null;
    ready:boolean = false;

    constructor() {
      super();
    }



    preload() {

          var xpos:number=0;
          var ypos:number=0;

          //tileSprite(x: number, y: number, width: number, height: number, key: any, frame: any): Phaser.TileSprite;
          var bg = this.game.add.tileSprite(80, 40, 635, 545, 'phaser');

          var preloadbar:Phaser.Image = this.game.cache.getImage('preloaderBar');
          xpos=this.game.width/2- (preloadbar ? preloadbar.width/2 : 200);
          ypos=this.game.height/2- (preloadbar ? preloadbar.height/2 : 25);
          this.preloadBar = this.game.add.sprite(xpos>0?xpos:0, ypos>0?ypos:0, 'preloaderBar');
      		this.game.load.setPreloadSprite(this.preloadBar);

          this.game.load.image('plane', '/assets/images/plane.png');
      		this.game.load.image('bomb', '/assets/images/bomb.png');
      		this.game.load.image('land', '/assets/images/land.png');
      		this.game.load.image('sky', '/assets/images/sky.png');
          this.game.load.spritesheet("skies","/assets/images/skies.png", 512, 384, 3);

      		this.game.load.image('photonstorm', '/assets/images/photonstorm.png');
      		this.game.load.spritesheet('particles', '/assets/images/particles.png', 2, 2);
      		this.game.load.spritesheet('city', '/assets/images/city.png', 16, 16);
      		this.game.load.bitmapFont('rollingThunder', '/assets/images/rolling-thunder.png', '/assets/images/rolling-thunder.xml');

          this.game.load.audio("bombdrop",
            [ "/assets/sounds/incoming-artillery.ogg",
              "/assets/sounds/incoming-artillery.wav",
              "/assets/sounds/incoming-artillery.mp3"]);
          this.game.load.audio("gamewon",
            [ "/assets/sounds/jingle-win.ogg",
              "/assets/sounds/jingle-win.wav",
              "/assets/sounds/jingle-win.mp3"]);
          this.game.load.audio("battlescene",
            [ "/assets/sounds/battlescene.ogg",
              "/assets/sounds/battlescene.wav",
              "/assets/sounds/battlescene.mp3"]);
          this.game.load.audio("mayday",
            [ "/assets/sounds/mayday.ogg",
              "/assets/sounds/mayday.wav",
              "/assets/sounds/mayday.mp3"]);

          //this.game.load.script("filter","js/LazerBeam.js");

    }
    create() {

      this.game.state.start('MainMenu');
    }


  }
}
