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
                                        color: '#FF2828'
                                }, 
                                Movable: {
                                }, 
                                Collidable: {
                                }, 
                                IsPlayer: {
                                }, 
                                Hurtable: {
                                }
                        }
                }, 

                bullet: {
                        class: 'projectile', 
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
                }
        };

        root.App.Defaults.Entity = entities;

})(this);
