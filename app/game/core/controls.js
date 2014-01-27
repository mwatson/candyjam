(function(root) {

        var controls = function() {
                
                this.keyStates = {
                        INACTIVE: -1, 
                        DOWN: 0,
                        UP: 1
                };
                
                this.keys = {
                        ESC: 27, 
                        W: 87,
                        A: 65, 
                        S: 83, 
                        D: 68, 
                        M: 77, 
                        P: 80, 
                        ARROW_UP: 38, 
                        ARROW_RIGHT: 39, 
                        ARROW_DOWN: 40, 
                        ARROW_LEFT: 37, 
                        SPACE: 32, 
                        ENTER: 13, 
                        TILDE: 192
                };

                this.mouse = {
                };
                
                this.controls = {};

                var keyCheck = function(key, state) {
                        var k = App.Controls.keys[key];
                        if(App.Controls.controls[k] == state) {
                                return true;
                        }
                        return false;
                }, 
                setKeyDown = function(index) {
                        App.Controls.controls[index] = App.Controls.keyStates.DOWN;
                }, 
                setKeyUp = function(index)             {
                        App.Controls.controls[index] = App.Controls.keyStates.UP;
                }, 
                setKeyInactive = function(index)             {
                        App.Controls.controls[index] = App.Controls.keyStates.UP;
                }, 
                setMouseDown = function(button) {
                }, 
                setMouseUp = function(button) {
                }, 
                setMouseInactive = function(button) {
                };

                // use these functions to check for key presses (you don't need to use .check())
                this.keyPress = function(key) {
                        return keyCheck(key, this.keyStates.UP);
                };

                this.keyDown = function(key) {
                        return keyCheck(key, this.keyStates.DOWN);
                };

                this.keyUp = function(key) {
                        return keyCheck(key, this.keyStates.INACTIVE);
                };
                
                this.key = function(index) {
                        return this.controls[index];
                };

                (function(self, setKeyUp, setKeyDown) {

                        document.onkeydown = function(e){
                                if(!_.isUndefined(self.controls[e.which])) {
                                        setKeyDown(e.which);
                                } else {
                                        // unknown key
                                        //App.Tools.log('Unknown key: ' + e.which);
                                }
                        };
                        document.onkeyup = function(e){
                                if(!_.isUndefined(self.controls[e.which])) {
                                        setKeyUp(e.which);
                                }
                        };

                        _.each(self.keys, function(val, i) {
                                self.controls[self.keys[i]] = self.keyStates.INACTIVE;
                        });

                })(this, setKeyUp, setKeyDown);

                this.keysReset = function() {
                        var self = this;
                        _.each(self.keys, function(val, i) {
                                if(self.controls[self.keys[i]] == self.keyStates.UP) {
                                        self.controls[self.keys[i]] = self.keyStates.INACTIVE;
                                }
                        });
                };
        };
        
        root.App.Objects.Controls = controls;

})(this);
