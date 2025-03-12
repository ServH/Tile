/**
 * Configuración global del juego
 */
import Phaser from 'phaser';

const gameConfig = {
    // Configuración de Phaser
    phaser: {
        type: Phaser.AUTO,
        pixelArt: true,
        backgroundColor: '#000000',
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: 0 },
                debug: false
            }
        },
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH
        }
    },
    
    // Tamaño base del juego
    gameSize: {
        width: 800,
        height: 600
    },
    
    // Gameplay
    gameplay: {
        difficultyScaling: 1.2,
        startingHealth: 100,
        tileSize: 16,
        fogOfWar: true,
        viewDistance: 8,
        debugPath: false  // Activa para ver los caminos garantizados
    },
    
    // Renderizado
    rendering: {
        pixelsPerTile: 16,
        animationFrameRate: 8,
        maxParticles: 100
    },
    
    // Sonido
    audio: {
        musicVolume: 0.5,
        sfxVolume: 0.7,
        enableMusic: true,
        enableSFX: true
    }
};

export default gameConfig;