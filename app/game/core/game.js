(function(root){
        var game = function() {
                
                var self = this;

                // for node-webkit
                this.win = null;

                this.platform = 'web';

                var gameRunning = false, 
                    loopDelay = 0;

                this.settings = {};

                this.seed = null;

                this.init = function(settings) {
        
                        this.settings = settings.game;

                        if(typeof require != 'undefined') {
                                var gui = require('nw.gui');
                                this.win = gui.Window.get();
                        }

                        // seedings
                        this.seed = Math.seedrandom();
                        
                        // initialize game objects
                        App.Tools       = new App.Objects.Tools();
                        App.Definitions = new App.Objects.Definitions();
                        App.Draw        = new App.Objects.Draw(settings.draw);
                        App.Controls    = new App.Objects.Controls();
                        App.Player      = new App.Objects.Player(settings.player);
                        App.World       = new App.Objects.World(settings.world);

                        // initalize transitions
                        App.Draw.initTransitions();

                        // init player
                        App.Player.init();

                        gameRunning = true;

                        this.skipTicks = ~~(1000 / this.settings.updatecap);

                        // start the game
                        this.gameLoop();
                };

                this.setFPSCap = function(cap) {
                        this.settings.fpscap = cap;
                        loopDelay = ~~(1000 / this.settings.fpscap);
                };

                this.prevState = '';
                this.gameState = 'gameplay';
                this.newState = null;
                
                // use this to change the gamestate. it will 
                // actually not do so, but the state will be updated on the next tick
                this.setGameState = function(newState, callback) {
                        if(newState != this.gameState && !this.newState) {
                                this.newState = { state: newState };
                                if(!_.isUndefined(callback)) {
                                        this.newState.callback = callback;
                                }
                        }
                };

                // updates the game state with data stored in this.newState
                var updateGameState = function() {
                        if(!App.Game.newState) {
                                return false;
                        }

                        App.Game.prevState = App.Game.gameState;
                        App.Game.gameState = App.Game.newState.state;

                        if(!_.isUndefined(App.Game.newState.callback)) {
                                App.Game.newState.callback();
                        }

                        App.Game.newState = null;
                        return true;
                }

                this.gameTicks = function() {
                        return (new Date()).getTime();
                };

                this.skipTicks = 0;
                this.maxFrameskip = 5;
                this.nextTick = this.gameTicks();

                this.waitTimers = {};

                var newTime, 
                    frameTime = 0, 
                    accumulator = 0, 
                    currentTime = this.gameTicks();

                this.gameLoop = function() {

                        newTime = this.gameTicks();
                        frameTime = newTime - currentTime;

                        if(frameTime > 30) {
                                frameTime = 30;
                        }

                        currentTime = newTime;
                        accumulator += frameTime;

                        while(accumulator >= this.skipTicks) {

                                this.updateOps();
                                accumulator -= this.skipTicks;
                        }

                        this.interpolation = accumulator / this.skipTicks;
                        if(!this.interpolation) {
                                this.interpolation = 0.0000000000000001;
                        }
                        this.interpolation = 0;

                        if(1) { //App.Defs.Assets.Loaded.Complete) {
                                this.drawOps();
                        }
 
                        // keep the loopInfo manageable 
                        _.each(this.loopInfo, function(val, key) {
                                if(self.loopInfo[key].length > 250) {
                                        self.loopInfo[key].splice(0, self.loopInfo[key].length - 250);
                                }
                        });

                        if(gameRunning) {
                                
                                requestAnimationFrame(function() {
                                        self.gameLoop();
                                });
                        }
                };
                
                this.loopInfo = {
                        draw: [], 
                        update: []
                };

                this.gameSpeed = 50;

                this.lastDraw = null;
                this.drawOps = function() {

                        var curTime = this.gameTicks(), 
                            interpolation = (curTime - this.lastUpdate) / this.gameSpeed, 
                            moveDelta = (curTime - this.lastUpdate) / 20;

                        App.Draw.get('hud').clear();
                        App.Draw.get('entity').clear();

                        if(this.gameState == 'gameplay') {
                                // attempt to keep the player centered
                                var player = App.World.getPlayer(0), 
                                    playerCenter = player.center(), 
                                    originX = -((playerCenter.x + player.attrs.dir.x * player.attrs.speed * interpolation * moveDelta) - (App.Draw.width() / 2)), 
                                    originY = -((playerCenter.y + player.attrs.dir.y * player.attrs.speed * interpolation * moveDelta) - (App.Draw.height() / 2));

                                App.Draw.setOrigin(originX, originY);
                        }

                        App.Draw.drawTransitions(interpolation);

                        App.World.map.draw(interpolation, moveDelta);

                        if(App.Game.settings.debug.fps) {
                                App.Tools.printFPS('hud', App.Game.loopInfo);
                                App.Tools.printPlayerPos('hud', App.World.getPlayer());
                        }

                        //
                        // this should be at the end of the loop
                        //
                        var drawTime = this.gameTicks();
                        if(this.lastDraw !== null) {
                                var d = drawTime - this.lastDraw;
                                this.loopInfo.draw.push(d);
                        }

                        this.lastDraw = drawTime;
                };
                
                this.moveDelta = 1;
                this.lastUpdate = this.gameTicks();
                this.updateOps = function() {

                        var curTime = this.gameTicks(), 
                            updateDelta = (curTime - this.lastUpdate), 
                            callTime;

                        this.moveDelta = updateDelta / 20;

                        // this prevents the game from becoming janky when the UPS is slowed
                        // (which is what Chrome does if a tab is not active)
                        // I settled on 5 here because the moveDelta should be around 2.5 
                        // (20ups = 50ms per tick), 50 / 20 = 2.5 and 5 is double that
                        if(this.moveDelta > 5) {
                                this.moveDelta = 5;
                        }

                        updateGameState();

                        var player = App.World.getPlayer(0);

                        if(this.settings.video.width != window.innerWidth || 
                           this.settings.video.height != window.innerHeight) {
                                //App.Draw.setResolution();
                        }

                        App.Draw.runTransitions();

                        this.gameplayOps();

                        //
                        // keep this stuff at the end of the loop
                        //
                        App.Controls.keysReset();

                        curTime = this.gameTicks();
                        callTime = Math.max(0, this.gameSpeed - (curTime - this.lastUpdate));

                        if(this.lastUpdate !== null) {
                                this.loopInfo.update.push(curTime - this.lastUpdate);
                        }

                        this.lastUpdate = curTime;
                };

                this.gameplayOps = function() {
                        this.entityOps(true);
                        this.playerOps();
                };

                this.entityOps = function(excludePlayer) {
                        // run all entity timers and behaviors
                        for(var i = 0; i < App.World.map.entities.length; i++) {

                                if(excludePlayer && App.World.map.entities[i].is('IsPlayer')) {
                                        continue;
                                }
                                
                                if(App.World.map.entities[i].is('IsEnemy')) {
                                        App.World.map.entities[i].c('IsEnemy').behavior();
                                }
                        }
                };

                this.playerOps = function() {
                        var player = App.World.getPlayer(0), 
                            xDir = 0, 
                            yDir = 0, 
                            newPos = {}, 
                            collisions = null;

                        if(App.Controls.keyDown('A') || App.Controls.keyDown('ARROW_LEFT')) {
                                xDir -= 1;
                        }
                        if(App.Controls.keyDown('D') || App.Controls.keyDown('ARROW_RIGHT')) {
                                xDir += 1;
                        }
                        if(App.Controls.keyDown('W') || App.Controls.keyDown('ARROW_UP')) {
                                yDir -= 1;
                        }
                        if(App.Controls.keyDown('S') || App.Controls.keyDown('ARROW_DOWN')) {
                                yDir += 1;
                        }
                        if(App.Controls.keyPress('SPACE') || App.Controls.keyPress('ENTER')) {
                        }

                        newPos = player.c('Movable').move(xDir, yDir);
                        if(player.is('Collidable')) {
                                collisions = player.c('Collidable')
                                                   .checkMapCollision(newPos.x, newPos.y);
                        }
                        
                        //if(!collisions.length) {
                        //}
                };
        };
        
        root.App.Objects.Game = game;
        
})(this);
