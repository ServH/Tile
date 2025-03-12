import Phaser from 'phaser';
import uiConfig from '../config/uiConfig';

class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    create() {
        const { width, height } = this.cameras.main;
        
        // Título del juego
        const title = this.add.text(
            width / 2,
            height / 4,
            'PIXEL ROGUELIKE',
            uiConfig.text.styles.title
        ).setOrigin(0.5);
        
        // Efecto de neón parpadeante en el título
        this.tweens.add({
            targets: title,
            alpha: 0.8,
            duration: 1500,
            yoyo: true,
            repeat: -1
        });
        
        // Opciones del menú
        const menuItems = [
            { text: 'NUEVA PARTIDA', scene: 'GameScene' },
            { text: 'CÓMO JUGAR', action: 'showInstructions' },
            { text: 'CRÉDITOS', action: 'showCredits' }
        ];
        
        // Crear botones del menú
        this.menuButtons = [];
        menuItems.forEach((item, index) => {
            const button = this.createButton(
                width / 2,
                height / 2 + (index * 60),
                item.text,
                () => this.handleMenuClick(item)
            );
            this.menuButtons.push(button);
        });
        
        // Detectar tecla Enter para comenzar el juego
        this.input.keyboard.once('keydown-ENTER', () => {
            this.startGame();
        });
        
        // Texto de instrucción
        this.add.text(
            width / 2,
            height - 40,
            'Presiona ENTER para comenzar',
            {
                ...uiConfig.text.styles.body,
                fontSize: '16px'
            }
        ).setOrigin(0.5);
    }
    
    createButton(x, y, text, callback) {
        const button = this.add.text(
            x, y, text, uiConfig.text.styles.body
        ).setOrigin(0.5);
        
        button.setInteractive({ useHandCursor: true })
            .on('pointerover', () => {
                button.setTint(0x66ffff);
                button.setScale(1.1);
            })
            .on('pointerout', () => {
                button.clearTint();
                button.setScale(1);
            })
            .on('pointerdown', callback);
            
        return button;
    }
    
    handleMenuClick(item) {
        if (item.scene) {
            if (item.scene === 'GameScene') {
                this.startGame();
            } else {
                this.scene.start(item.scene);
            }
        } else if (item.action) {
            // Ejecuta acciones específicas
            if (this[item.action]) {
                this[item.action]();
            }
        }
    }
    
    startGame() {
        // Transición con fade out
        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            // Iniciar escena de juego y UI
            this.scene.start('GameScene');
            this.scene.start('UIScene');
        });
    }
    
    showInstructions() {
        // Mostramos instrucciones del juego
        const { width, height } = this.cameras.main;
        
        // Contenedor para las instrucciones
        const container = this.add.container(width / 2, height / 2);
        
        // Fondo oscuro
        const bg = this.add.rectangle(0, 0, width * 0.8, height * 0.7, 0x000000, 0.9);
        bg.setStrokeStyle(2, parseInt(uiConfig.colors.primary.replace('#', '0x')));
        
        // Título
        const title = this.add.text(0, -bg.height / 2 + 30, 'CÓMO JUGAR', uiConfig.text.styles.title)
            .setOrigin(0.5);
        
        // Instrucciones
        const instructions = [
            "MOVIMIENTO: WASD o Flechas",
            "ATAQUE: E",
            "DASH: Espacio",
            "OBJETIVO: Explora el laberinto, elimina",
            "enemigos y desciende a niveles más profundos",
            "usando las escaleras."
        ];
        
        const instructionTexts = instructions.map((text, index) => {
            return this.add.text(
                0, -70 + (index * 40),
                text,
                uiConfig.text.styles.body
            ).setOrigin(0.5);
        });
        
        // Botón de cierre
        const closeButton = this.add.text(
            0, bg.height / 2 - 40,
            'VOLVER',
            uiConfig.text.styles.body
        ).setOrigin(0.5);
        
        closeButton.setInteractive({ useHandCursor: true })
            .on('pointerover', () => closeButton.setTint(0x66ffff))
            .on('pointerout', () => closeButton.clearTint())
            .on('pointerdown', () => container.destroy());
        
        // Añadir todos los elementos al contenedor
        container.add([bg, title, ...instructionTexts, closeButton]);
    }
    
    showCredits() {
        // Mostrar créditos
        const { width, height } = this.cameras.main;
        
        // Contenedor para los créditos
        const container = this.add.container(width / 2, height / 2);
        
        // Fondo oscuro
        const bg = this.add.rectangle(0, 0, width * 0.8, height * 0.7, 0x000000, 0.9);
        bg.setStrokeStyle(2, parseInt(uiConfig.colors.primary.replace('#', '0x')));
        
        // Título
        const title = this.add.text(0, -bg.height / 2 + 30, 'CRÉDITOS', uiConfig.text.styles.title)
            .setOrigin(0.5);
        
        // Texto de créditos
        const credits = [
            "DISEÑO Y PROGRAMACIÓN:",
            "Tu Nombre",
            "",
            "INSPIRADO EN:",
            "Hotline Miami & Juegos Roguelike",
            "",
            "DESARROLLADO CON:",
            "Phaser 3"
        ];
        
        const creditTexts = credits.map((text, index) => {
            return this.add.text(
                0, -70 + (index * 35),
                text,
                uiConfig.text.styles.body
            ).setOrigin(0.5);
        });
        
        // Botón de cierre
        const closeButton = this.add.text(
            0, bg.height / 2 - 40,
            'VOLVER',
            uiConfig.text.styles.body
        ).setOrigin(0.5);
        
        closeButton.setInteractive({ useHandCursor: true })
            .on('pointerover', () => closeButton.setTint(0x66ffff))
            .on('pointerout', () => closeButton.clearTint())
            .on('pointerdown', () => container.destroy());
        
        // Añadir todos los elementos al contenedor
        container.add([bg, title, ...creditTexts, closeButton]);
    }
}

export default MenuScene;