module GameModule.State{
  export class MainMenu extends Phaser.State{
    game: Phaser.Game;
    //background: Phaser.Sprite;
    //logo: Phaser.Sprite;

    music:Phaser.Sound = null;
  	playButton = null;
    cities:GameModule.Group.City[] = [];
    //heights:number[] = [ 2, 3, 3, 3, 4, 4, 5, 5, 5, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 9, 10, 10, 10, 12, 14, 14 ];
    land:Phaser.Sprite=null;
    //emitter;

    constructor() {
      super();
    }

    create() {
      this.game.add.image(0, 0, 'sky');
      this.land = this.game.add.sprite(0, 336, 'land');
      this.game.add.image(390, 360, 'photonstorm');

      var t = this.game.add.bitmapText(0, 64, 'rollingThunder', 'BOMBER', 32);
      t.x = 256 - (t.textWidth / 2);

      Main.heights = Phaser.Utils.shuffle(Main.heights);

      for (var i = 0; i < Main.heights.length; i++)
      {
          this.cities.push(new GameModule.Group.City(this, 48 + i * 16, Main.heights[i]));
      }

      this.input.onDown.addOnce(this.startGame, this);
    }
    startGame(){
      this.game.state.start('Game');
    }

  }
}
