import Phaser from 'phaser';
import BootScene from './scenes/BootScene';
import MenuScene from './scenes/MenuScene';
import GameScene from './scenes/GameScene';
import UIScene from './scenes/UIScene';
import GameOverScene from './scenes/GameOverScene';
import gameConfig from './config/gameConfig';

// Inicialización del juego cuando el DOM esté listo
window.onload = function() {
    // Ocultar texto de carga
    const loadingText = document.getElementById('loading-text');
    if (loadingText) {
        loadingText.style.display = 'none';
    }
    
    // Obtener tamaño del contenedor
    const gameContainer = document.getElementById('game-container');
    const width = gameContainer.clientWidth || gameConfig.gameSize.width;
    const height = gameContainer.clientHeight || gameConfig.gameSize.height;
    
    // Configuración de Phaser
    const config = {
        ...gameConfig.phaser,
        width: width,
        height: height,
        parent: 'game-container',
        scene: [BootScene, MenuScene, GameScene, UIScene, GameOverScene]
    };

    // Crear instancia del juego
    const game = new Phaser.Game(config);
    
    // Manejar redimensionamiento
    window.addEventListener('resize', () => {
        if (!gameContainer) return;
        
        const width = gameContainer.clientWidth;
        const height = gameContainer.clientHeight;
        
        if (game.scale) {
            game.scale.resize(width, height);
        }
    });
    
    // Para debugging
    window.game = game;
};

// Manejo de errores
window.onerror = function(message, source, lineno, colno, error) {
    console.error(`Error: ${message}`);
    const loadingText = document.getElementById('loading-text');
    if (loadingText) {
        loadingText.textContent = 'Error al cargar el juego. Intenta recargar la página.';
        loadingText.style.display = 'block';
        loadingText.style.color = 'red';
    }
};