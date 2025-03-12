import Phaser from 'phaser';
import uiConfig from '../config/uiConfig';

class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        // Obtener dimensiones
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Crear barra de carga
        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);
        
        // Texto de carga
        const loadingText = this.make.text({
            x: width / 2,
            y: height / 2 - 50,
            text: 'Cargando...',
            style: {
                font: '20px monospace',
                fill: uiConfig.colors.primary
            }
        });
        loadingText.setOrigin(0.5, 0.5);
        
        // Mostrar progreso
        this.load.on('progress', (value) => {
            progressBar.clear();
            progressBar.fillStyle(parseInt(uiConfig.colors.primary.replace('#', '0x')), 1);
            progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
        });
        
        // Limpiar listeners al completar
        this.load.on('complete', () => {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
        });
        
        // En lugar de cargar una imagen data URI, crearemos la textura pixel
        // directamente como un rectángulo en el create()
    }

    create() {
        // Crear la textura pixel como un rectángulo blanco de 1x1
        const graphics = this.add.graphics();
        graphics.fillStyle(0xFFFFFF);
        graphics.fillRect(0, 0, 1, 1);
        graphics.generateTexture('pixel', 1, 1);
        graphics.clear();
        
        // Animación de inicio
        const title = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY - 50,
            'PIXEL ROGUELIKE',
            uiConfig.text.styles.title
        ).setOrigin(0.5);
        
        // Efecto de aparición
        title.setAlpha(0);
        this.tweens.add({
            targets: title,
            alpha: 1,
            duration: 1000,
            ease: 'Power2',
            onComplete: () => {
                // Ir al menú principal tras un breve delay
                this.time.delayedCall(500, () => {
                    this.scene.start('MenuScene');
                });
            }
        });
    }
}

export default BootScene;