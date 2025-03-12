/**
 * Configuración del personaje jugable
 */

const playerConfig = {
    // Estadísticas base
    stats: {
        health: 100,
        maxHealth: 100,
        speed: 160,
        attackPower: 10,
        attackSpeed: 1.0,
        attackRange: 1,
        critChance: 0.05,
        critMultiplier: 1.5
    },
    
    // Movimiento
    movement: {
        acceleration: 500,
        deceleration: 600,
        diagonalSpeedFactor: 0.7,
        dashDistance: 3,
        dashCooldown: 2000
    },
    
    // Combate
    combat: {
        invincibilityTime: 500,
        knockbackForce: 150,
        damageIndicatorDuration: 500
    },
    
    // Visual
    visuals: {
        tint: 0xff0066,
        scale: 16,
        dashEffectColor: 0x00ffff
    }
};

export default playerConfig;