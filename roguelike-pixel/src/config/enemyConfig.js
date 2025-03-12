/**
 * Configuración de la interfaz de usuario
 */

const uiConfig = {
    // Paleta de colores
    colors: {
        primary: '#FF0066',       // Rosa neón
        secondary: '#00FFFF',     // Cyan
        tertiary: '#00FF66',      // Verde neón
        warning: '#FFFF00',       // Amarillo
        danger: '#FF0000',        // Rojo
        darkBg: '#111111',        // Fondo oscuro
        darkerBg: '#000000',      // Fondo muy oscuro
        lightText: '#FFFFFF',     // Texto claro
        mutedText: '#AAAAAA',     // Texto atenuado
    },
    
    // Estilos de texto
    text: {
        fontFamily: 'monospace',
        
        // Estilos predefinidos para diferentes textos
        styles: {
            title: {
                fontFamily: 'monospace',
                fontSize: '24px',
                color: '#FF0066',
                stroke: '#000000',
                strokeThickness: 4
            },
            body: {
                fontFamily: 'monospace',
                fontSize: '14px',
                color: '#FFFFFF',
                stroke: '#000000',
                strokeThickness: 2
            },
            stats: {
                fontFamily: 'monospace',
                fontSize: '12px',
                color: '#00FFFF'
            }
        }
    },
    
    // Elementos UI
    elements: {
        // Barras de progreso
        progressBars: {
            bgColor: 0x222222,
            healthBarColor: 0xFF0066,
            healthLowColor: 0xFF0000,
            height: 10,
            borderWidth: 1,
            borderColor: 0x444444
        },
        
        // Botones
        buttons: {
            bgColor: 0x222222,
            hoverColor: 0x333333,
            textColor: '#FF0066',
            borderColor: 0xFF0066,
            borderWidth: 2
        }
    },
    
    // HUD
    hud: {
        healthBar: {
            width: 100,
            height: 10,
            position: { x: 16, y: 40 }
        },
        levelIndicator: {
            position: { x: 16, y: 16 }
        }
    },
    
    // Efectos visuales
    feedback: {
        damageFlashDuration: 100,
        hitShakeDuration: 100,
        hitShakeIntensity: 0.01
    }
};

export default uiConfig;