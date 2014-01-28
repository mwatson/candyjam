(function(root) {

        var entities = {

                //
                // All entity definitions go here
                //

                player: {
                        width: 64, 
                        height: 64, 
                        speed: 8, 
                        components: {
                                Renderable: {
                                        color: '#FF2828', 
                                        sprites: 'player', 
                                        shadow: 'shadow_64'
                                }, 
                                Movable: {
                                }, 
                                Collidable: {
                                        method: 'cross', 
                                        setup: {
                                                x: { x: 0, y: 10, width: 64, height: 44 }, 
                                                y: { x: 10, y: 0, width: 44, height: 64 }
                                        }
                                }, 
                                IsPlayer: {
                                }, 
                                Hurtable: {
                                }
                        }
                }, 

                bullet: {
                        width: 16, 
                        height: 16, 
                        speed: 16, 
                        components: {
                                Renderable: {
                                        color: '#C0C0C0'
                                }, 
                                Movable: {
                                }, 
                                Collidable: {
                                }, 
                                Projectile: {
                                }
                        }
                }, 

                grunt: {
                        width: 64, 
                        height: 64, 
                        speed: 4, 
                        components: {
                                Renderable: {
                                        color: '#0C0', 
                                        sprites: 'grunt', 
                                        shadow: 'shadow_64'
                                }, 
                                Movable: {
                                }, 
                                Collidable: {
                                }, 
                                IsEnemy: {
                                        behavior: function() {
                                                var player = App.World.getPlayer(0), 
                                                    xDir = 0, 
                                                    yDir = 0, 
                                                    newPos;

                                                if(this.en.attrs.x > player.attrs.x && this.en.attrs.x - player.attrs.x > 16) {
                                                        xDir = -1;
                                                } else if(this.en.attrs.x < player.attrs.x && player.attrs.x - this.en.attrs.x > 16) {
                                                        xDir = 1;
                                                }

                                                if(this.en.attrs.y > player.attrs.y && this.en.attrs.y - player.attrs.y > 16) {
                                                        yDir = -1;
                                                } else if(this.en.attrs.y < player.attrs.y && player.attrs.y - this.en.attrs.y > 16) {
                                                        yDir = 1;
                                                }

                                                newPos = this.en.c('Movable').move(xDir, yDir);
                                                this.en.c('Collidable').checkMapCollision(newPos.x, newPos.y);
                                        }
                                }, 
                                Hurtable: {
                                }
                        }
                }
        };

        root.App.Defaults.Entity = entities;

})(this);
