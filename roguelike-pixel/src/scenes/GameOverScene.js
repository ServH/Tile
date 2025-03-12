import Phaser from 'phaser';
import uiConfig from '../config/uiConfig';

class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    create(data) {
        const { width, height } = this.cameras.main;
        
        // Fondo oscuro
        this.add.rectangle(0, 0, width, height, 0x000000, 0.8)
            .setOrigin(0);
        
        // Texto de Game Over
        const gameOverText = this.add.text(
            width / 2,
            height / 3,
            'GAME OVER',
            uiConfig.text.styles.title
        ).setOrigin(0.5);
        
        // Estadísticas
        const stats = data || { depth: 1 };
        
        const statsText = this.add.text(
            width / 2,
            height / 2,
            `Alcanzaste el nivel ${stats.depth}`,
            uiConfig.text.styles.body
        ).setOrigin(0.5);
        
        // Botón para reiniciar
        const restartButton = this.add.text(
            width / 2,
            height * 2/3,
            'REINICIAR',
            uiConfig.text.styles.body
        ).setOrigin(0.5);
        
        restartButton.setInteractive({ useHandCursor: true })
            .on('pointerover', () => {
                restartButton.setTint(0x66ffff);
                restartButton.setScale(1.1);
            })
            .on('pointerout', () => {
                restartButton.clearTint();
                restartButton.setScale(1);
            })
            .on('pointerdown', () => {
                this.resetGame();
            });
        
        // Opción para volver al menú
        const menuButton = this.add.text(
            width / 2,
            height * 2/3 + 50,
            'MENÚ PRINCIPAL',
            uiConfig.text.styles.body
        ).setOrigin(0.5);
        
        menuButton.setInteractive({ useHandCursor: true })
            .on('pointerover', () => {
                menuButton.setTint(0x66ffff);
                menuButton.setScale(1.1);
            })
            .on('pointerout', () => {
                menuButton.clearTint();
                menuButton.setScale(1);
            })
            .on('pointerdown', () => {
                this.scene.start('MenuScene');
            });
        
        // También escuchar por teclas
        this.input.keyboard.once('keydown-SPACE', () => {
            this.resetGame();
        });
        
        this.input.keyboard.once('keydown-ESC', () => {
            this.scene.start('MenuScene');
        });
        
        // Añadir animación
        this.tweens.add({
            targets: [gameOverText, statsText],
            y: '-=20',
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }
    
    resetGame() {
        // Detener todas las escenas y reiniciar
        this.scene.stop('GameScene');
        this.scene.stop('UIScene');
        this.scene.start('BootScene');
    }
}

export default GameOverScene;