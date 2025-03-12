import Phaser from 'phaser';
import enemyConfig from '../config/enemyConfig';

class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, type = 'basic', depth = 1) {
        super(scene, x, y, 'pixel');
        
        // Añadir a la escena
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // Guardar tipo y aplicar configuración
        this.enemyType = type;
        this.config = { ...enemyConfig.types[type] };
        
        // Aplicar escala de dificultad según profundidad
        this.applyDepthScaling(depth);
        
        // Configuración física
        this.setCollideWorldBounds(true);
        
        // Configuración visual
        this.setScale(this.config.scale);
        this.setTint(this.config.color);
        
        // Estado
        this.health = this.config.health;
        this.maxHealth = this.config.health;
        this.speed = this.config.speed;
        this.detectionRange = this.config.detectionRange;
        this.attackRange = this.config.attackRange;
        this.damage = this.config.damage;
        
        // Comportamiento
        this.state = 'idle';
        this.target = null;
        this.lastAttackTime = 0;
        this.attackCooldown = 1000 / this.config.attackSpeed;
        
        // Temporizador para cambios de estado
        this.stateTimer = null;
    }
    
    applyDepthScaling(depth) {
        // Aplicar escalado de dificultad según profundidad
        const { scaling } = enemyConfig;
        
        // Incrementar estadísticas basado en la profundidad
        this.config.health *= Math.pow(scaling.healthMultiplier, depth - 1);
        this.config.damage *= Math.pow(scaling.damageMultiplier, depth - 1);
        this.config.speed *= Math.pow(scaling.speedMultiplier, depth - 1);
    }
    
    update() {
        // Manejar estado actual
        switch (this.state) {
            case 'idle':
                this.handleIdleState();
                break;
            case 'patrol':
                this.handlePatrolState();
                break;
            case 'chase':
                this.handleChaseState();
                break;
            case 'attack':
                this.handleAttackState();
                break;
            case 'retreat':
                this.handleRetreatState();
                break;
        }
    }
    
    handleIdleState() {
        // Detener movimiento
        this.setVelocity(0);
        
        // Verificar si hay jugador cerca
        if (this.detectPlayer()) {
            this.state = 'chase';
            return;
        }
        
        // Cambiar a patrullar ocasionalmente
        if (!this.stateTimer) {
            this.stateTimer = this.scene.time.delayedCall(
                enemyConfig.behavior.idleTime, 
                () => {
                    this.state = 'patrol';
                    this.stateTimer = null;
                    
                    // Elegir dirección aleatoria
                    this.patrolDirection = {
                        x: Phaser.Math.Between(-1, 1),
                        y: Phaser.Math.Between(-1, 1)
                    };
                    
                    // Normalizar si es diagonal
                    if (this.patrolDirection.x !== 0 && this.patrolDirection.y !== 0) {
                        const length = Math.sqrt(
                            this.patrolDirection.x * this.patrolDirection.x + 
                            this.patrolDirection.y * this.patrolDirection.y
                        );
                        this.patrolDirection.x /= length;
                        this.patrolDirection.y /= length;
                    }
                }
            );
        }
    }
    
    handlePatrolState() {
        // Moverse en la dirección de patrulla
        this.setVelocity(
            this.patrolDirection.x * this.speed * 0.5,
            this.patrolDirection.y * this.speed * 0.5
        );
        
        // Verificar si hay jugador cerca
        if (this.detectPlayer()) {
            this.state = 'chase';
            if (this.stateTimer) {
                this.stateTimer.remove();
                this.stateTimer = null;
            }
            return;
        }
        
        // Cambiar a idle después de un tiempo
        if (!this.stateTimer) {
            this.stateTimer = this.scene.time.delayedCall(
                Phaser.Math.Between(1000, 3000), 
                () => {
                    this.state = 'idle';
                    this.stateTimer = null;
                }
            );
        }
    }
    
    handleChaseState() {
        // Verificar si hay objetivo
        if (!this.target || !this.target.active) {
            this.state = 'idle';
            return;
        }
        
        // Calcular distancia al objetivo
        const distance = Phaser.Math.Distance.Between(
            this.x, this.y, this.target.x, this.target.y
        );
        
        // Si está dentro del rango de ataque, atacar
        if (distance <= this.attackRange * this.scene.tileSize) {
            this.state = 'attack';
            return;
        }
        
        // Calcular dirección hacia el objetivo
        const angle = Phaser.Math.Angle.Between(
            this.x, this.y, this.target.x, this.target.y
        );
        
        // Moverse hacia el objetivo
        this.setVelocity(
            Math.cos(angle) * this.speed,
            Math.sin(angle) * this.speed
        );
    }
    
    handleAttackState() {
        // Detener movimiento
        this.setVelocity(0);
        
        // Verificar cooldown
        const canAttack = this.scene.time.now - this.lastAttackTime > this.attackCooldown;
        
        // Verificar distancia
        const distance = Phaser.Math.Distance.Between(
            this.x, this.y, this.target.x, this.target.y
        );
        
        // Si está fuera de rango, volver a perseguir
        if (distance > this.attackRange * this.scene.tileSize) {
            this.state = 'chase';
            return;
        }
        
        // Atacar cuando se pueda
        if (canAttack) {
            this.attack();
            this.lastAttackTime = this.scene.time.now;
        }
    }
    
    handleRetreatState() {
        // Implementación de retirada cuando tiene poca vida
        if (this.health > this.maxHealth * enemyConfig.behavior.retreatHealthThreshold) {
            this.state = 'idle';
            return;
        }
        
        // Huir del objetivo
        if (this.target && this.target.active) {
            const angle = Phaser.Math.Angle.Between(
                this.x, this.y, this.target.x, this.target.y
            );
            
            // Moverse en dirección opuesta
            this.setVelocity(
                -Math.cos(angle) * this.speed,
                -Math.sin(angle) * this.speed
            );
        } else {
            this.state = 'idle';
        }
    }
    
    detectPlayer() {
        // Buscar al jugador
        const player = this.scene.player;
        
        if (!player || !player.active) return false;
        
        // Calcular distancia
        const distance = Phaser.Math.Distance.Between(
            this.x, this.y, player.x, player.y
        );
        
        // Verificar si está dentro del rango
        if (distance <= this.detectionRange * this.scene.tileSize) {
            this.target = player;
            return true;
        }
        
        return false;
    }
    
    attack() {
        if (!this.target || !this.target.active) return;
        
        // Efecto visual de ataque
        this.scene.tweens.add({
            targets: this,
            x: this.target.x,
            y: this.target.y,
            duration: 100,
            yoyo: true,
            ease: 'Cubic.easeIn'
        });
        
        // Aplicar daño
        this.target.takeDamage(this.damage, this);
    }
    
    takeDamage(amount) {
        // Aplicar daño
        this.health = Math.max(0, this.health - amount);
        
        // Efecto visual
        this.scene.tweens.add({
            targets: this,
            alpha: 0.5,
            duration: 100,
            yoyo: true
        });
        
        // Si tiene poca vida, considerar huir
        if (this.health <= this.maxHealth * enemyConfig.behavior.retreatHealthThreshold) {
            this.state = 'retreat';
        }
        
        // Verificar muerte
        if (this.health <= 0) {
            this.die();
        } else {
            // Si recibe daño y no estaba persiguiendo, comenzar a perseguir
            if (this.state !== 'chase' && this.state !== 'attack') {
                this.state = 'chase';
                this.target = this.scene.player;
            }
        }
    }
    
    die() {
        // Detener movimiento
        this.setVelocity(0);
        this.setActive(false);
        
        // Efecto de muerte
        this.scene.tweens.add({
            targets: this,
            alpha: 0,
            y: this.y - 10,
            angle: Phaser.Math.Between(-90, 90),
            duration: 300,
            ease: 'Power2',
            onComplete: () => {
                // Generar recompensa
                this.dropReward();
                
                // Eliminar de la escena
                this.destroy();
            }
        });
    }
    
    dropReward() {
        // Probabilidad de soltar item
        if (Math.random() < enemyConfig.rewards.itemDropChance) {
            // TODO: Implementar sistema de items
            console.log("Enemigo dejó caer un item");
        }
    }
}

export default Enemy;