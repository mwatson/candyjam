(function(root) {

        var entities = {

                //
                // All entity definitions go here
                //

                player: {
                        width: 64, 
                        height: 64, 
                        speed: 7, 
                        components: {
                                Renderable: {
                                        color: '#FF2828', 
                                        sprites: 'player', 
                                        shadow: 'shadow_64'
                                }, 
                                Movable: {
                                        acceleration: 2
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
                                },
                                HasProjectile: {
                                        name: 'bullet',
                                        origin: { x: 24, y: 24 }
                                }
                        }
                }, 

                camera: {
                        width: 96, 
                        height: 64, 
                        speed: 7, 
                        components: {
                                /*
                                Renderable: {
                                        color: 'rgba(255,0,255,0.25)'
                                },
                                */
                                Movable: {
                                        acceleration: 2
                                },
                                IsCamera: {
                                        behavior: function() {
                                                var player = App.World.getPlayer(0), 
                                                    pCenter = player.center(), 
                                                    cCenter = this.en.center(), 
                                                    xDir = 0,  
                                                    yDir = 0, 
                                                    newPos;

                                                if(cCenter.x > pCenter.x && cCenter.x - pCenter.x > this.en.attrs.width / 2) {
                                                        xDir = -1;
                                                } else if(cCenter.x < pCenter.x && pCenter.x - cCenter.x > this.en.attrs.width / 2) {
                                                        xDir = 1;
                                                }

                                                if(cCenter.y > pCenter.y && cCenter.y - pCenter.y > this.en.attrs.height / 2) {
                                                        yDir = -1;
                                                } else if(cCenter.y < pCenter.y && pCenter.y - cCenter.y > this.en.attrs.height / 2) {
                                                        yDir = 1;
                                                }

                                                this.en.c('Movable').move(xDir, yDir);
                                        }
                                }
                        }
                }, 

                bullet: {
                        width: 16, 
                        height: 16, 
                        speed: 14, 
                        components: {
                                Renderable: {
                                        color: '#666666 '
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

                                                this.en.c('Movable').move(xDir, yDir);
                                        }
                                }, 
                                Hurtable: {
                                }
                        }
                }
        };

        root.App.Defaults.Entity = entities;

})(this);
