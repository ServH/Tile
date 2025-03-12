import Phaser from 'phaser';

/**
 * Gestor centralizado de entrada para el juego.
 * Permite configurar y acceder a controles desde cualquier escena.
 */
class InputManager {
    constructor(scene) {
        this.scene = scene;
        
        // Controles predeterminados
        this.keys = {
            up: null,
            down: null,
            left: null,
            right: null,
            dash: null,
            attack: null,
            interact: null,
            menu: null
        };
        
        // Configuración de teclas
        this.keyConfig = {
            up: ['UP', 'W'],
            down: ['DOWN', 'S'],
            left: ['LEFT', 'A'],
            right: ['RIGHT', 'D'],
            dash: ['SPACE'],
            attack: ['E'],
            interact: ['F'],
            menu: ['ESC']
        };
        
        // Inicializar controles
        this.setupKeyboardControls();
    }
    
    setupKeyboardControls() {
        const keyboard = this.scene.input.keyboard;
        
        // Configurar cada control con soporte para múltiples teclas
        for (const [action, keyCodes] of Object.entries(this.keyConfig)) {
            this.keys[action] = {
                keyCodes: [],
                isDown: false,
                justDown: false,
                justUp: false,
                timeDown: 0
            };
            
            // Registrar cada tecla para esta acción
            for (const keyCode of keyCodes) {
                const key = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes[keyCode]);
                this.keys[action].keyCodes.push(key);
            }
        }
    }
    
    update() {
        // Actualizar el estado de cada control
        for (const control of Object.values(this.keys)) {
            let wasDown = control.isDown;
            control.isDown = false;
            control.justDown = false;
            control.justUp = false;
            
            // Verificar si alguna de las teclas está presionada
            for (const key of control.keyCodes) {
                if (key.isDown) {
                    control.isDown = true;
                    if (!wasDown) {
                        control.justDown = true;
                        control.timeDown = this.scene.time.now;
                    }
                    break;
                }
            }
            
            // Verificar si se soltó el control
            if (wasDown && !control.isDown) {
                control.justUp = true;
            }
        }
    }
    
    /**
     * Verifica si un control está presionado
     */
    isDown(action) {
        return this.keys[action]?.isDown || false;
    }
    
    /**
     * Verifica si un control se acaba de presionar en este frame
     */
    justDown(action) {
        return this.keys[action]?.justDown || false;
    }
    
    /**
     * Verifica si un control se acaba de soltar en este frame
     */
    justUp(action) {
        return this.keys[action]?.justUp || false;
    }
    
    /**
     * Obtiene el tiempo que ha estado presionado un control
     */
    getTimeDown(action) {
        if (!this.keys[action]?.isDown) return 0;
        return this.scene.time.now - this.keys[action].timeDown;
    }
    
    /**
     * Devuelve un vector de dirección normalizado basado en los controles actuales
     */
    getDirectionVector() {
        const dirX = (this.isDown('right') ? 1 : 0) - (this.isDown('left') ? 1 : 0);
        const dirY = (this.isDown('down') ? 1 : 0) - (this.isDown('up') ? 1 : 0);
        
        // Normalizar para movimiento diagonal
        if (dirX !== 0 && dirY !== 0) {
            const length = Math.sqrt(dirX * dirX + dirY * dirY);
            return { x: dirX / length, y: dirY / length };
        }
        
        return { x: dirX, y: dirY };
    }
}

export default InputManager;