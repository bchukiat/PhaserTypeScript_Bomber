var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var GameModule;
(function (GameModule) {
    var Main = (function (_super) {
        __extends(Main, _super);
        function Main() {
            _super.call(this, 512, 384, Phaser.CANVAS, 'game');
            this.state.add('Boot', GameModule.State.Boot, false);
            this.state.add('Preloader', GameModule.State.Preloader, false);
            this.state.add('MainMenu', GameModule.State.MainMenu, false);
            this.state.add('Game', GameModule.State.Game, false);
            this.state.start('Boot');
        }
        Main.score = 0;
        Main.music = null;
        Main.orientated = false;
        Main.heights = [2, 3, 3, 3, 4, 4, 5, 5, 5, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 9, 10, 10, 10, 12, 14, 14];
        return Main;
    })(Phaser.Game);
    GameModule.Main = Main;
})(GameModule || (GameModule = {}));
window.onload = function () {
    var game = new GameModule.Main();
};
var GameModule;
(function (GameModule) {
    var Group;
    (function (Group) {
        var City = (function (_super) {
            __extends(City, _super);
            function City(state, x, height) {
                this.state = state;
                this.game = state.game;
                _super.call(this, this.game);
                this.stack = height;
                this.color = this.game.rnd.pick([0, 7, 14, 21, 28]);
                this.style = this.game.rnd.integerInRange(0, 2);
                this.top;
                this.build(x);
                return this;
            }
            City.prototype.build = function (x) {
                this.enableBody = true;
                var y = 336 - (this.stack * 16);
                for (var i = 0; i < this.stack; i++) {
                    if (i === 0) {
                        this.top = this.create(x, y, 'city', this.color + 3);
                    }
                    else {
                        var block = this.create(x, y, 'city', this.color + this.style);
                    }
                    y += 16;
                }
                this.setAll('body.allowGravity', false);
                this.setAll('body.immovable', true);
                this.alive = true;
            };
            City.prototype.hit = function (bomb, block) {
                var emitter = this.state.emitter;
                var damage = this.game.rnd.integerInRange(2, 5);
                if (damage > this.stack) {
                    damage = this.stack;
                }
                bomb.reset(0, 0);
                bomb.body.gravity.y = 0;
                bomb.body.velocity.y = 0;
                bomb.visible = false;
                this.cursor = this.getFirstAlive();
                for (var i = 0; i < damage; i++) {
                    if (this.cursor) {
                        this.game.time.events.add(100 * i, this.crumble, this, this.cursor);
                        this.game.time.events.add(200 * i, this.explode, this, this.cursor, emitter);
                        this.stack--;
                        this.next();
                    }
                }
                if (this.stack > 0) {
                    this.top = this.cursor;
                    i++;
                    this.game.time.events.add(100 * i, this.crumble, this, this.top);
                }
                else {
                    this.alive = false;
                }
                this.state.deadCities();
                this.state.explosion.stop();
                this.state.explosion.play('bomexplode');
                this.state.skies.animations.play('flash', 10, false);
            };
            City.prototype.crumble = function (block) {
                block.frame = this.color + this.game.rnd.integerInRange(4, 6);
            };
            City.prototype.explode = function (block, emitter) {
                emitter.x = block.x + 8;
                emitter.y = block.y + 8;
                emitter.start(true, 2000, null, 16);
                this.state.score += 10;
                block.kill();
            };
            return City;
        })(Phaser.Group);
        Group.City = City;
    })(Group = GameModule.Group || (GameModule.Group = {}));
})(GameModule || (GameModule = {}));
var GameModule;
(function (GameModule) {
    var State;
    (function (State) {
        var Boot = (function (_super) {
            __extends(Boot, _super);
            function Boot() {
                _super.call(this);
                GameModule.Main.score = 0;
                GameModule.Main.music = null;
                GameModule.Main.orientated = false;
            }
            Boot.prototype.preload = function () {
                this.game.load.image('preloaderBar', '/assets/images/loader.png');
                var titleimg = this.game.load.image('phaser', '/assets/images/phaser.png');
            };
            Boot.prototype.create = function () {
                this.game.physics.startSystem(Phaser.Physics.ARCADE);
                this.game.input.maxPointers = 1;
                if (this.game.device.desktop) {
                    this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
                    this.scale.minWidth = 256;
                    this.scale.minHeight = 196;
                    this.scale.maxWidth = 512;
                    this.scale.maxHeight = 384;
                    this.scale.pageAlignHorizontally = true;
                    this.scale.pageAlignVertically = true;
                    this.scale.refresh();
                }
                else {
                    this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
                    this.scale.minWidth = 480;
                    this.scale.minHeight = 260;
                    this.scale.maxWidth = 1024;
                    this.scale.maxHeight = 768;
                    this.scale.pageAlignHorizontally = true;
                    this.scale.pageAlignVertically = true;
                    this.scale.forceOrientation(true, false);
                    this.scale.setResizeCallback(this.gameResized, this);
                    this.scale.enterIncorrectOrientation.add(this.enterIncorrectOrientation, this);
                    this.scale.leaveIncorrectOrientation.add(this.leaveIncorrectOrientation, this);
                    this.game.scale.refresh();
                }
                this.game.state.start('Preloader');
            };
            Boot.prototype.gameResized = function (width, height) {
            };
            Boot.prototype.enterIncorrectOrientation = function () {
                GameModule.Main.orientated = false;
                document.getElementById('orientation').style.display = 'block';
            };
            Boot.prototype.leaveIncorrectOrientation = function () {
                GameModule.Main.orientated = true;
                document.getElementById('orientation').style.display = 'none';
            };
            return Boot;
        })(Phaser.State);
        State.Boot = Boot;
    })(State = GameModule.State || (GameModule.State = {}));
})(GameModule || (GameModule = {}));
var GameModule;
(function (GameModule) {
    var State;
    (function (State) {
        var Game = (function (_super) {
            __extends(Game, _super);
            function Game() {
                _super.call(this);
                this.score = 0;
            }
            Game.prototype.create = function () {
                this.cities = [];
                this.gameLost = false;
                this.gameWon = false;
                this.speed = 100;
                this.droppedThisRun = false;
                this.game.stage.smoothed = false;
                this.game.physics.startSystem(Phaser.Physics.ARCADE);
                this.skies = this.game.add.sprite(0, 0, 'skies');
                this.skies.animations.add('flash');
                this.land = this.game.add.sprite(0, 336, 'land');
                this.bomb = this.game.add.sprite(0, 0, 'bomb');
                this.bomb.visible = false;
                this.plane = this.game.add.sprite(-21, 16, 'plane');
                this.plane.anchor.set(0.5, 0);
                this.plane.checkWorldBounds = true;
                this.plane.events.onOutOfBounds.add(this.planeLeft, this);
                this.game.physics.arcade.enable([this.plane, this.bomb, this.land]);
                this.plane.body.allowGravity = false;
                this.plane.body.velocity.x = 100;
                this.bomb.checkWorldBounds = true;
                GameModule.Main.heights = Phaser.Utils.shuffle(GameModule.Main.heights);
                for (var i = 0; i < GameModule.Main.heights.length; i++) {
                    this.cities.push(new GameModule.Group.City(this, 48 + i * 16, GameModule.Main.heights[i]));
                }
                this.emitter = this.game.add.emitter(0, 0, 500);
                this.game.physics.arcade.bounds.setTo(0, 0, this.game.world.width, 336);
                this.game.physics.arcade.checkCollision = { up: false, down: true, left: false, right: false };
                this.emitter.makeParticles('particles', [0, 1, 2, 3, 4], 500, true, true);
                this.emitter.gravity = 200;
                this.emitter.bounce.set(0.25);
                this.emitter.setXSpeed(-200, 200);
                this.emitter.setYSpeed(-50, 50);
                this.score = 0;
                this.scoreText = this.add.bitmapText(8, 360, 'rollingThunder', 'score: 0', 16);
                this.game.add.image(390, 360, 'photonstorm');
                this.game.input.onDown.add(this.dropBomb, this);
                this.explosion = this.game.add.audio('bombdrop');
                this.explosion.addMarker('bomwhistle', 0.0, 2.7, 1, false);
                this.explosion.addMarker('bomexplode', 2.7, 6, 1, false);
                this.gamewon = this.game.add.audio('gamewon');
                this.battlescene = this.game.add.audio('battlescene', 1, true);
                this.battlescene.play();
                this.mayday = this.game.add.audio('mayday');
            };
            Game.prototype.update = function () {
                this.scoreText.text = 'score:' + this.score;
                if (this.gameLost || this.gameWon) {
                    return;
                }
                for (var i = 0; i < this.cities.length; i++) {
                    if (this.cities[i].alive) {
                        this.game.physics.arcade.overlap(this.plane, this.cities[i].top, this.planeSmash, null, this);
                    }
                }
                if (this.bomb.visible) {
                    for (var i = 0; i < this.cities.length; i++) {
                        if (this.cities[i].alive) {
                            this.game.physics.arcade.overlap(this.bomb, this.cities[i].top, this.cities[i].hit, null, this.cities[i]);
                        }
                    }
                    this.game.physics.arcade.overlap(this.bomb, this.land, this.removeBomb, null, this);
                }
            };
            Game.prototype.planeSmash = function () {
                this.gameLost = true;
                this.plane.body.velocity.x = 0;
                this.emitter.x = this.plane.x;
                this.emitter.y = this.plane.y;
                this.emitter.start(true, 2000, null, 64);
                var tween = this.game.add.tween(this.plane).to({ y: 320 }, 2000, Phaser.Easing.Exponential.In, true);
                tween.onComplete.add(this.gameOver, this);
                this.game.input.onDown.remove(this.dropBomb, this);
            };
            Game.prototype.planeLeft = function () {
                if (this.gameWon) {
                    this.plane.body.velocity.x = 0;
                    if (this.plane.body.facing === Phaser.LEFT) {
                        this.plane.scale.x = 1;
                    }
                    else {
                        this.plane.scale.x = -1;
                    }
                    var tween = this.add.tween(this.plane).to({ x: 256, y: 320 }, 2000, Phaser.Easing.Cubic.Out, true);
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
            };
            Game.prototype.dropBomb = function () {
                if (this.droppedThisRun) {
                    return;
                }
                this.droppedThisRun = true;
                this.bomb.x = Phaser.Math.snapToFloor(this.plane.x, 16) + 2;
                this.bomb.y = this.plane.y + 8;
                this.bomb.body.gravity.y = 200;
                this.bomb.body.velocity.y = 100;
                this.bomb.visible = true;
                this.explosion.play('bomwhistle');
            };
            Game.prototype.removeBomb = function () {
                this.bomb.reset(0, 0);
                this.bomb.body.gravity.y = 0;
                this.bomb.body.velocity.y = 0;
                this.bomb.visible = false;
            };
            Game.prototype.deadCities = function () {
                for (var i = 0; i < this.cities.length; i++) {
                    if (this.cities[i].alive) {
                        return;
                    }
                }
                this.gameWon = true;
                this.input.onDown.remove(this.dropBomb, this);
            };
            Game.prototype.gameOver = function () {
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
            };
            Game.prototype.quitGame = function () {
                this.game.state.start('MainMenu');
            };
            return Game;
        })(Phaser.State);
        State.Game = Game;
    })(State = GameModule.State || (GameModule.State = {}));
})(GameModule || (GameModule = {}));
var GameModule;
(function (GameModule) {
    var State;
    (function (State) {
        var MainMenu = (function (_super) {
            __extends(MainMenu, _super);
            function MainMenu() {
                _super.call(this);
                this.music = null;
                this.playButton = null;
                this.cities = [];
                this.land = null;
            }
            MainMenu.prototype.create = function () {
                this.game.add.image(0, 0, 'sky');
                this.land = this.game.add.sprite(0, 336, 'land');
                this.game.add.image(390, 360, 'photonstorm');
                var t = this.game.add.bitmapText(0, 64, 'rollingThunder', 'BOMBER', 32);
                t.x = 256 - (t.textWidth / 2);
                GameModule.Main.heights = Phaser.Utils.shuffle(GameModule.Main.heights);
                for (var i = 0; i < GameModule.Main.heights.length; i++) {
                    this.cities.push(new GameModule.Group.City(this, 48 + i * 16, GameModule.Main.heights[i]));
                }
                this.input.onDown.addOnce(this.startGame, this);
            };
            MainMenu.prototype.startGame = function () {
                this.game.state.start('Game');
            };
            return MainMenu;
        })(Phaser.State);
        State.MainMenu = MainMenu;
    })(State = GameModule.State || (GameModule.State = {}));
})(GameModule || (GameModule = {}));
var GameModule;
(function (GameModule) {
    var State;
    (function (State) {
        var Preloader = (function (_super) {
            __extends(Preloader, _super);
            function Preloader() {
                _super.call(this);
                this.background = null;
                this.preloadBar = null;
                this.ready = false;
            }
            Preloader.prototype.preload = function () {
                var xpos = 0;
                var ypos = 0;
                var bg = this.game.add.tileSprite(80, 40, 635, 545, 'phaser');
                var preloadbar = this.game.cache.getImage('preloaderBar');
                xpos = this.game.width / 2 - (preloadbar ? preloadbar.width / 2 : 200);
                ypos = this.game.height / 2 - (preloadbar ? preloadbar.height / 2 : 25);
                this.preloadBar = this.game.add.sprite(xpos > 0 ? xpos : 0, ypos > 0 ? ypos : 0, 'preloaderBar');
                this.game.load.setPreloadSprite(this.preloadBar);
                this.game.load.image('plane', '/assets/images/plane.png');
                this.game.load.image('bomb', '/assets/images/bomb.png');
                this.game.load.image('land', '/assets/images/land.png');
                this.game.load.image('sky', '/assets/images/sky.png');
                this.game.load.spritesheet("skies", "/assets/images/skies.png", 512, 384, 3);
                this.game.load.image('photonstorm', '/assets/images/photonstorm.png');
                this.game.load.spritesheet('particles', '/assets/images/particles.png', 2, 2);
                this.game.load.spritesheet('city', '/assets/images/city.png', 16, 16);
                this.game.load.bitmapFont('rollingThunder', '/assets/images/rolling-thunder.png', '/assets/images/rolling-thunder.xml');
                this.game.load.audio("bombdrop", ["/assets/sounds/incoming-artillery.ogg",
                    "/assets/sounds/incoming-artillery.wav",
                    "/assets/sounds/incoming-artillery.mp3"]);
                this.game.load.audio("gamewon", ["/assets/sounds/jingle-win.ogg",
                    "/assets/sounds/jingle-win.wav",
                    "/assets/sounds/jingle-win.mp3"]);
                this.game.load.audio("battlescene", ["/assets/sounds/battlescene.ogg",
                    "/assets/sounds/battlescene.wav",
                    "/assets/sounds/battlescene.mp3"]);
                this.game.load.audio("mayday", ["/assets/sounds/mayday.ogg",
                    "/assets/sounds/mayday.wav",
                    "/assets/sounds/mayday.mp3"]);
            };
            Preloader.prototype.create = function () {
                this.game.state.start('MainMenu');
            };
            return Preloader;
        })(Phaser.State);
        State.Preloader = Preloader;
    })(State = GameModule.State || (GameModule.State = {}));
})(GameModule || (GameModule = {}));
