import Phaser from 'phaser';
import playerConfig from '../config/playerConfig';

class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'pixel');
        
        // Añadir a la escena
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // Configuración física
        this.setCollideWorldBounds(false); // Cambiar a false para permitir transiciones
        
        // Configuración visual
        const { visuals } = playerConfig;
        this.setScale(visuals.scale);
        this.setTint(visuals.tint);
        
        // Estadísticas
        const { stats } = playerConfig;
        this.health = stats.health;
        this.maxHealth = stats.maxHealth;
        this.speed = stats.speed;
        this.attackPower = stats.attackPower;
        this.attackSpeed = stats.attackSpeed;
        
        // Control de transición
        this.isTransitioning = false;
        
        // Propiedades de movimiento
        const { movement } = playerConfig;
        this.dashDistance = movement.dashDistance;
        this.dashCooldown = movement.dashCooldown;
        this.canDash = true;
        this.isDashing = false;
        
        // Propiedades de combate
        const { combat } = playerConfig;
        this.invincibilityTime = combat.invincibilityTime;
        this.knockbackForce = combat.knockbackForce;
        this.isInvincible = false;
        
        // Controles
        this.setupControls(scene);
    }
    
    setupControls(scene) {
        this.cursors = scene.input.keyboard.createCursorKeys();
        this.wasd = {
            up: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            down: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            left: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            right: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
        };
        this.dashKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.attackKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    }
    
    update() {
        // No actualizar si está en transición
        if (this.isTransitioning) return;
        
        if (this.isDashing) return;
        
        // Movimiento
        this.handleMovement();
        
        // Dash
        this.handleDash();
        
        // Ataque
        this.handleAttack();
    }
    
    handleMovement() {
        // Reiniciar velocidad
        this.setVelocity(0);
        
        // Determinar dirección
        let moveX = 0;
        let moveY = 0;
        
        // Horizontal
        if (this.cursors.left.isDown || this.wasd.left.isDown) {
            moveX = -1;
        } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
            moveX = 1;
        }
        
        // Vertical
        if (this.cursors.up.isDown || this.wasd.up.isDown) {
            moveY = -1;
        } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
            moveY = 1;
        }
        
        // Aplicar velocidad
        if (moveX !== 0 || moveY !== 0) {
            // Velocidad base
            let speedX = this.speed * moveX;
            let speedY = this.speed * moveY;
            
            // Normalizar diagonal
            if (moveX !== 0 && moveY !== 0) {
                speedX *= playerConfig.movement.diagonalSpeedFactor;
                speedY *= playerConfig.movement.diagonalSpeedFactor;
            }
            
            this.setVelocity(speedX, speedY);
        }
    }
    
    handleDash() {
        if (!this.canDash || !Phaser.Input.Keyboard.JustDown(this.dashKey)) return;
        
        // Obtener dirección
        const velX = this.body.velocity.x;
        const velY = this.body.velocity.y;
        
        // Verificar que hay dirección
        if (velX === 0 && velY === 0) return;
        
        // Normalizar dirección
        const length = Math.sqrt(velX * velX + velY * velY);
        const dirX = velX / length;
        const dirY = velY / length;
        
        // Iniciar dash
        this.isDashing = true;
        this.canDash = false;
        this.isInvincible = true;
        
        // Impulso
        this.setVelocity(
            dirX * this.speed * 3,
            dirY * this.speed * 3
        );
        
        // Efecto de dash
        this.createDashEffect();
        
        // Finalizar dash
        this.scene.time.delayedCall(200, () => {
            this.isDashing = false;
            
            // Mantener invencibilidad brevemente
            this.scene.time.delayedCall(100, () => {
                this.isInvincible = false;
            });
        });
        
        // Cooldown
        this.scene.time.delayedCall(this.dashCooldown, () => {
            this.canDash = true;
            this.createDashReadyEffect();
        });
    }
    
    createDashEffect() {
        // Rastro de imágenes residuales
        for (let i = 0; i < 5; i++) {
            const afterImage = this.scene.add.sprite(this.x, this.y, 'pixel')
                .setScale(this.scale)
                .setAlpha(0.5 - (i * 0.1))
                .setTint(playerConfig.visuals.dashEffectColor);
                
            // Desvanecer
            this.scene.tweens.add({
                targets: afterImage,
                alpha: 0,
                duration: 200,
                ease: 'Power2',
                onComplete: () => {
                    afterImage.destroy();
                }
            });
        }
    }
    
    createDashReadyEffect() {
        // Brillo rápido
        this.scene.tweens.add({
            targets: this,
            alpha: 0.5,
            yoyo: true,
            duration: 100,
            repeat: 1
        });
    }
    
    handleAttack() {
        // Implementación básica para fase posterior
    }
    
    takeDamage(amount, source = null) {
        // Verificar invencibilidad
        if (this.isInvincible) return;
        
        // Aplicar daño
        this.health = Math.max(0, this.health - amount);
        
        // Evento para UI
        this.scene.events.emit('player-damage', this.health, this.maxHealth);
        
        // Efecto visual
        this.scene.tweens.add({
            targets: this,
            alpha: 0.5,
            duration: 100,
            ease: 'Linear',
            yoyo: true
        });
        
        // Knockback si hay fuente
        if (source) {
            const angle = Phaser.Math.Angle.Between(source.x, source.y, this.x, this.y);
            
            this.setVelocity(
                Math.cos(angle) * this.knockbackForce,
                Math.sin(angle) * this.knockbackForce
            );
        }
        
        // Invencibilidad temporal
        this.isInvincible = true;
        
        this.scene.time.delayedCall(this.invincibilityTime, () => {
            this.isInvincible = false;
        });
        
        // Verificar muerte
        if (this.health <= 0) {
            this.die();
        }
    }
    
    heal(amount) {
        // Aplicar curación
        this.health = Math.min(this.maxHealth, this.health + amount);
        
        // Evento para UI
        this.scene.events.emit('player-damage', this.health, this.maxHealth);
        
        // Efecto visual
        this.scene.tweens.add({
            targets: this,
            alpha: 0.8,
            duration: 100,
            ease: 'Linear',
            yoyo: true,
            repeat: 2
        });
    }
    
    die() {
        // Detener movimiento
        this.setVelocity(0);
        this.setActive(false);
        
        // Deshabilitar input
        this.scene.input.keyboard.enabled = false;
        
        // Efecto de muerte
        this.scene.tweens.add({
            targets: this,
            angle: 90,
            alpha: 0,
            duration: 500,
            ease: 'Power2',
            onComplete: () => {
                this.scene.events.emit('gameOver');
            }
        });
    }
}

export default Player;