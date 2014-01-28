/*

Better entity system!

Entity Components:
- Renderable
- Collectable
- Enemy
- Fish
- Blocker
- Collidable
- Hurtable
- Player

*/


(function(root) {

        var entity = function(settings) {

                this.attrs = {
                        x: 0, 
                        y: 0, 
                        width: 0, 
                        height: 0, 
                        speed: 0, 
                        dir: {
                                x: 0, 
                                y: 0
                        }
                };

                this.state = 'idle';

                this.center = function() {
                        return {
                                x: this.attrs.x + this.attrs.width / 2, 
                                y: this.attrs.y + this.attrs.height / 2
                        };
                };

                var components = {};

                this.c = function(component) {
                        if(!_.isUndefined(components[component])) {
                                return components[component];
                        }
                        return false;
                };

                this.is = function(component) {
                        if(!_.isUndefined(components[component])) {
                                return true;
                        }
                        return false;
                };

                this.addComponent = function(componentType, settings) {
                        if(_.isUndefined(App.Objects.Components[componentType])) {
                                return false;
                        }

                        if(!_.isUndefined(components[componentType])) {
                                this.removeComponent(componentType);
                        }
                        
                        components[componentType] = new App.Objects.Components[componentType](this, settings);
                };

                this.removeComponent = function(componentType) {
                        if(!_.isUndefined(components[componentType])) {
                                delete components[componentType];
                        }
                };

                this.setPosition = function(x, y) {
                        this.attrs.x = x;
                        this.attrs.y = y;
                };

                this.changeState = function(newState, callback) {
                        this.state = newState;
                        if(callback) {
                                callback();
                        }
                };

                this.init = (function(settings, self){

                        self.attrs.width = settings.width;
                        self.attrs.height = settings.height;
                        self.attrs.x = settings.x;
                        self.attrs.y = settings.y;
                        self.attrs.speed = settings.speed;

                        _.each(settings.components, function(cdata, cname){
                                self.addComponent(cname, cdata);
                        });

                })(settings, this);
        };

        root.App.Objects.Entity = entity;

        root.App.Objects.Components = {};

        var renderable = function(entity, settings) {

                this.attrs = {
                        color: settings.color,
                        sprites: _.isUndefined(settings.sprites) ? false : App.Defs.Sprites[settings.sprites], 
                        shadow: _.isUndefined(settings.shadow) ? false : settings.shadow
                };

                var en = entity;

                this.draw = function(interpolation, canvasId, moveDelta) {

                        if(!moveDelta) {
                                moveDelta = 1;
                        }

                        if(!canvasId) {
                                canvasId = 'entity';
                        }

                        var xPos = en.attrs.x + en.attrs.dir.x * en.attrs.speed * interpolation * moveDelta, 
                            yPos = en.attrs.y + en.attrs.dir.y * en.attrs.speed * interpolation * moveDelta;

                        // draw their shadow
                        if(this.attrs.shadow) {
                                App.Draw.get(canvasId).drawImg(
                                        this.attrs.shadow, 
                                        xPos, 
                                        yPos + en.attrs.height - 8
                                );
                        }

                        if(this.attrs.sprites) {

                                // figure out the frame based on the state
                                var curState = 'idle';
                                if(en.state == 'walk') {

                                        if(en.attrs.dir.x == 1) {
                                                curState = 'walkRight';
                                        } else if(en.attrs.dir.x == -1) {
                                                curState = 'walkLeft';
                                        }

                                        if(_.isUndefined(this.attrs.sprites[curState])) {
                                                curState = 'walk';
                                        }
                                }

                                if(_.isUndefined(this.attrs.sprites[curState])) {
                                        curState = 'idle';
                                }

                                App.Draw.get(canvasId).drawImg(
                                        this.attrs.sprites[curState][0].frame, 
                                        xPos, 
                                        yPos
                                );


                        } else {

                                App.Draw.get(canvasId).fillRect(
                                        xPos, 
                                        yPos, 
                                        en.attrs.width, 
                                        en.attrs.height, 
                                        this.attrs.color
                                );
                        }

                        /*
                        var bbox = en.c('Collidable').bBox, 
                            axes = [ 'x', 'y' ];

                        for(var i = 0; i < axes.length; i++) {
                                App.Draw.get(canvasId).fillRect(
                                        bbox.x(axes[i]), 
                                        bbox.y(axes[i]), 
                                        bbox.w(axes[i]), 
                                        bbox.h(axes[i]), 
                                        '#000'
                                );
                        }
                        */
                };
        };

        root.App.Objects.Components.Renderable = renderable;

        // collides with the map and other entities
        var collidable = function(entity, settings) {

                var en = entity;

                this.quadIds = [];

                // default bounding box
                this.bBox = {
                        x: function(axis) {
                                return en.attrs.x;
                        }, 
                        xStep: function(axis, position) {
                                return position;
                        }, 
                        y: function(axis) {
                                return en.attrs.y;
                        },
                        yStep: function(axis, position) {
                                return position;
                        },
                        w: function(axis) {
                                return en.attrs.width;
                        }, 
                        h: function(axis) {
                                return en.attrs.height;
                        }
                };

                if(!_.isUndefined(settings.method)) {
                        if(settings.method == 'cross') {
                                this.bBox = {
                                        x: function(axis) {
                                                return en.attrs.x + settings.setup[axis].x;
                                        }, 
                                        xStep: function(axis, position) {
                                                return position + settings.setup[axis].x;
                                        }, 
                                        y: function(axis) {
                                                return en.attrs.y + settings.setup[axis].y;
                                        },
                                        yStep: function(axis, position) {
                                                return position + settings.setup[axis].y;
                                        }, 
                                        w: function(axis) {
                                                return settings.setup[axis].width;
                                        }, 
                                        h: function(axis) {
                                                return settings.setup[axis].height;
                                        }
                                };
                        }
                }

                this.checkMapCollision = function(xStep, yStep) {

                        var xMin = 0, 
                            yMin = 0, 
                            xDir = en.attrs.dir.x, 
                            yDir = en.attrs.dir.y, 
                            xCols = [], 
                            yRows = [], 
                            collisions = [];

                        // minimum for the x-axis
                        if(xDir > 0) {
                                xMin = xStep + this.bBox.w('x');
                        } else if(xDir < 0) {
                                xMin = xStep;
                        }

                        if(xDir != 0) {
                                s1 = Math.floor(this.bBox.y('x') / App.World.map.tileSize);
                                s2 = Math.floor((this.bBox.y('x') + this.bBox.h('x')) / App.World.map.tileSize);
                                for(i = s1; i <= s2; i++) {
                                        yRows.push(i);
                                }

                                for(i = 0; i < yRows.length; i++) {
                                        s1 = Math.floor(xMin / App.World.map.tileSize);
                                        if(_.isUndefined(App.World.map.grid[yRows[i]])) {
                                        } else if(App.World.map.grid[yRows[i]][s1] !== false) {
                                                if(xDir == 1) {
                                                        xStep = s1 * App.World.map.tileSize - this.bBox.w('x') - 1;
                                                } else if(xDir == -1) {
                                                        xStep = s1 * App.World.map.tileSize + App.World.map.tileSize;
                                                };
                                                en.attrs.dir.x = 0;
                                                collisions.push({ type: 'map', x: s1, y: yRows[i] });
                                        }
                                }
                        }

                        // min for the y-axis
                        if(yDir > 0) {
                                yMin = yStep + this.bBox.h('y');
                        } else if(yDir < 0) {
                                yMin = yStep;
                        }

                        if(yDir != 0) {
                                s1 = Math.floor(this.bBox.xStep('y', xStep) / App.World.map.tileSize);
                                s2 = Math.floor((this.bBox.xStep('y', xStep) + this.bBox.w('y')) / App.World.map.tileSize);
                                for(i = s1; i <= s2; i++) {
                                        xCols.push(i);
                                }

                                for(i = 0; i < xCols.length; i++) {
                                        s1 = Math.floor(yMin / App.World.map.tileSize);
                                        if(_.isUndefined(App.World.map.grid[s1])) {
                                        } else if(App.World.map.grid[s1][xCols[i]] !== false) {
                                                if(yDir == 1) {
                                                        yStep = s1 * App.World.map.tileSize - this.bBox.h('y') - 1;
                                                } else if(yDir == -1) {
                                                        yStep = s1 * App.World.map.tileSize + App.World.map.tileSize;
                                                }
                                                en.attrs.dir.y = 0;
                                                collisions.push({ type: 'map', x: xCols[i], y: s1 });
                                        }
                                }
                        }

                        return { collisions: collisions, x: xStep, y: yStep };
                }
        };

        root.App.Objects.Components.Collidable = collidable;

        var movable = function(entity, settings) {

                var en = entity;

                this.move = function(xDir, yDir) {

                        var xStep = en.attrs.x, 
                            yStep = en.attrs.y, 
                            newPos;

                        // set the directions on the entity
                        en.attrs.dir.x = xDir;
                        en.attrs.dir.y = yDir;

                        xStep += ~~(xDir * (en.attrs.speed * App.Game.moveDelta));
                        yStep += ~~(yDir * (en.attrs.speed * App.Game.moveDelta));

                        if(en.is('Collidable')) {
                                newPos = en.c('Collidable').checkMapCollision(xStep, yStep);
                        } else {
                                newPos = { x: xPos, y: yPos };
                        }
                        
                        en.setPosition(newPos.x, newPos.y);

                        if(xDir !== 0) {
                                en.changeState('walk');
                        } else {
                                en.changeState('idle');
                        }

                        return { x: xStep, y: yStep };
                };
        };

        root.App.Objects.Components.Movable = movable;

        var isPlayer = function(entity, settings) {
        };

        root.App.Objects.Components.IsPlayer = isPlayer;

        var projectile = function(entity, settings) {
        };

        root.App.Objects.Components.Projectile = projectile;

        var isEnemy = function(entity, settings) {

                this.en = entity;

                this.behavior = function() {
                        return 1;
                };

                if(settings.behavior) {
                        this.behavior = settings.behavior;
                }
        };

        root.App.Objects.Components.IsEnemy = isEnemy;

})(this);
