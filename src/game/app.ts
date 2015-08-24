module GameModule{
  export class Main extends Phaser.Game{
    game: Phaser.Game;

    static score: number = 0;
    static music: Phaser.Sound = null;
    static orientated: boolean = false;
    static heights = [ 2, 3, 3, 3, 4, 4, 5, 5, 5, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 9, 10, 10, 10, 12, 14, 14 ];

    constructor() {
        super(512, 384, Phaser.CANVAS, 'game');
        this.state.add('Boot', State.Boot, false);
        this.state.add('Preloader', State.Preloader, false);
        this.state.add('MainMenu', State.MainMenu, false);
        this.state.add('Game', State.Game, false);

        this.state.start('Boot');
    }
  }
}
//var game;
window.onload = () => {
  var game = new GameModule.Main();
}
