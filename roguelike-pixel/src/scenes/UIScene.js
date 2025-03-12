import Phaser from 'phaser';
import uiConfig from '../config/uiConfig';
import HealthBar from '../ui/HealthBar';

class UIScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UIScene', active: false });
        
        // Referencias a elementos UI
        this.healthBar = null;
        this.roomText = null;
        
        // Datos del juego
        this.roomData = {
            current: 1,
            total: 10
        };
    }
    
    create() {
        // Obtener referencia a la escena de juego
        this.gameScene = this.scene.get('GameScene');
        
        // Crear elementos UI
        this.createHealthBar();
        this.createRoomCounter();
        
        // Configurar event listeners
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Escuchar daño al jugador
        this.gameScene.events.on('player-damage', (health, maxHealth) => {
            this.updateHealthBar(health, maxHealth);
            this.flashDamageEffect();
        });
        
        // Cambio de habitación
        this.gameScene.events.on('room-change', (data) => {
            this.updateRoomCounter(data);
        });
        
        // Total de habitaciones
        this.gameScene.events.on('total-rooms', (total) => {
            this.roomData.total = total;
            this.updateRoomCounter(this.roomData);
        });
        
        // Fin de juego
        this.gameScene.events.on('gameOver', () => {
            this.handleGameOver();
        });
        
        // Limpiar listeners
        this.events.on('shutdown', () => {
            this.gameScene.events.off('player-damage');
            this.gameScene.events.off('room-change');
            this.gameScene.events.off('total-rooms');
            this.gameScene.events.off('gameOver');
        });
    }
    
    createHealthBar() {
        // Usar HealthBar
        this.healthBar = new HealthBar(
            this, 
            uiConfig.hud.healthBar.position.x,
            uiConfig.hud.healthBar.position.y,
            uiConfig.hud.healthBar.width,
            uiConfig.hud.healthBar.height
        );
        
        // Etiqueta
        this.healthLabel = this.add.text(
            uiConfig.hud.healthBar.position.x, 
            uiConfig.hud.healthBar.position.y - 15, 
            'SALUD', 
            uiConfig.text.styles.stats
        );
    }
    
    updateHealthBar(health, maxHealth) {
        this.healthBar.update(health, maxHealth);
    }
    
    createRoomCounter() {
        // Posición en la esquina superior derecha
        const x = this.cameras.main.width - 20;
        const y = 20;
        
        this.roomText = this.add.text(
            x, y,
            `HABITACIÓN: ${this.roomData.current}/${this.roomData.total}`,
            uiConfig.text.styles.stats
        ).setOrigin(1, 0);
    }
    
    updateRoomCounter(data) {
        // Actualizar datos
        if (data.current) this.roomData.current = data.current;
        if (data.total) this.roomData.total = data.total;
        
        // Actualizar texto
        if (this.roomText) {
            this.roomText.setText(`HABITACIÓN: ${this.roomData.current}/${this.roomData.total}`);
            
            // Efecto visual
            this.tweens.add({
                targets: this.roomText,
                scale: { from: 1.2, to: 1 },
                duration: 200,
                ease: 'Back.easeOut'
            });
        }
    }
    
    flashDamageEffect() {
        const { damageFlashDuration } = uiConfig.feedback;
        
        // Overlay rojo
        const overlay = this.add.rectangle(
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            this.cameras.main.width,
            this.cameras.main.height,
            0xff0000,
            0.3
        );
        
        // Desvanecimiento
        this.tweens.add({
            targets: overlay,
            alpha: 0,
            duration: damageFlashDuration,
            ease: 'Linear',
            onComplete: () => {
                overlay.destroy();
            }
        });
        
        // Shake
        this.cameras.main.shake(
            uiConfig.feedback.hitShakeDuration, 
            uiConfig.feedback.hitShakeIntensity
        );
    }
    
    handleGameOver() {
        // Game Over UI
        const text = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            'GAME OVER',
            uiConfig.text.styles.title
        ).setOrigin(0.5);
        
        // Estadísticas
        const statsText = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY + 50,
            `Llegaste a la habitación ${this.roomData.current} de ${this.roomData.total}`,
            uiConfig.text.styles.body
        ).setOrigin(0.5);
        
        // Reinicio
        const restartText = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY + 100,
            'Presiona ESPACIO para reiniciar',
            uiConfig.text.styles.body
        ).setOrigin(0.5);
        
        // Reiniciar con espacio
        this.input.keyboard.once('keydown-SPACE', () => {
            this.scene.start('BootScene');
            this.scene.stop('GameScene');
            this.scene.stop('UIScene');
        });
    }
}

export default UIScene;