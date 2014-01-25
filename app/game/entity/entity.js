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
                        color: settings.color
                };

                var en = entity;

                this.draw = function(interpolation, canvasId, moveDelta) {

                        if(!moveDelta) {
                                moveDelta = 1;
                        }

                        if(!canvasId) {
                                canvasId = 'entity';
                        }

                        App.Draw.get(canvasId).fillRect(
                                en.attrs.x + en.attrs.dir.x * en.attrs.speed * interpolation * moveDelta, 
                                en.attrs.y + en.attrs.dir.y * en.attrs.speed * interpolation * moveDelta, 
                                en.attrs.width, 
                                en.attrs.height, 
                                this.attrs.color
                        );
                };
        };

        root.App.Objects.Components.Renderable = renderable;

        // collides with the map and other entities
        var collidable = function(entity, settings) {

                var en = entity;

                this.quadIds = [];

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
                                xMin = xStep + en.attrs.width;
                        } else if(xDir < 0) {
                                xMin = xStep;
                        }

                        if(xDir != 0) {
                                s1 = Math.floor(en.attrs.y / App.World.map.tileSize);
                                s2 = Math.floor((en.attrs.y + en.attrs.height) / App.World.map.tileSize);
                                for(i = s1; i <= s2; i++) {
                                        yRows.push(i);
                                }

                                for(i = 0; i < yRows.length; i++) {
                                        s1 = Math.floor(xMin / App.World.map.tileSize);
                                        if(_.isUndefined(App.World.map.grid[yRows[i]])) {
                                        } else if(App.World.map.grid[yRows[i]][s1] !== false) {
                                                if(xDir == 1) {
                                                        xStep = s1 * App.World.map.tileSize - en.attrs.width - 1;
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
                                yMin = yStep + en.attrs.height;
                        } else if(yDir < 0) {
                                yMin = yStep;
                        }

                        if(yDir != 0) {
                                s1 = Math.floor(xStep / App.World.map.tileSize);
                                s2 = Math.floor((xStep + en.attrs.width) / App.World.map.tileSize);
                                for(i = s1; i <= s2; i++) {
                                        xCols.push(i);
                                }

                                for(i = 0; i < xCols.length; i++) {
                                        s1 = Math.floor(yMin / App.World.map.tileSize);
                                        if(_.isUndefined(App.World.map.grid[s1])) {
                                        } else if(App.World.map.grid[s1][xCols[i]] !== false) {
                                                if(yDir == 1) {
                                                        yStep = s1 * App.World.map.tileSize - en.attrs.height - 1;
                                                } else if(yDir == -1) {
                                                        yStep = s1 * App.World.map.tileSize + App.World.map.tileSize;
                                                }
                                                en.attrs.dir.y = 0;
                                                collisions.push({ type: 'map', x: xCols[i], y: s1 });
                                        }
                                }
                        }

                        en.setPosition(xStep, yStep);

                        return collisions;
                }
        };

        root.App.Objects.Components.Collidable = collidable;

        var movable = function(entity, settings) {

                var en = entity;

                this.move = function(xDir, yDir) {

                        var xStep = en.attrs.x, 
                            yStep = en.attrs.y;

                        // set the directions on the entity
                        en.attrs.dir.x = xDir;
                        en.attrs.dir.y = yDir;

                        xStep += ~~(xDir * (en.attrs.speed * App.Game.moveDelta));
                        yStep += ~~(yDir * (en.attrs.speed * App.Game.moveDelta));

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

})(this);
