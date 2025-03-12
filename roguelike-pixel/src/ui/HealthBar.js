import Phaser from 'phaser';
import uiConfig from '../config/uiConfig';

class HealthBar {
    constructor(scene, x, y, width, height) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        
        // Crear gráficos
        this.barContainer = scene.add.graphics();
        this.bar = scene.add.graphics();
        
        // Dibujar barra base
        this.drawContainer();
    }
    
    drawContainer() {
        const { progressBars } = uiConfig.elements;
        
        this.barContainer.clear();
        
        // Fondo
        this.barContainer.fillStyle(progressBars.bgColor, 1);
        this.barContainer.fillRect(this.x, this.y, this.width, this.height);
        
        // Borde
        this.barContainer.lineStyle(progressBars.borderWidth, progressBars.borderColor, 1);
        this.barContainer.strokeRect(this.x, this.y, this.width, this.height);
    }
    
    update(health, maxHealth) {
        const { progressBars } = uiConfig.elements;
        
        // Limpiar gráfico anterior
        this.bar.clear();
        
        // Calcular porcentaje
        const healthPercent = health / maxHealth;
        
        // Determinar color según nivel de salud
        let barColor;
        if (healthPercent > 0.6) {
            barColor = progressBars.healthBarColor; // Normal
        } else if (healthPercent > 0.3) {
            barColor = progressBars.healthLowColor; // Bajo
        } else {
            // Parpadeo cuando está muy bajo
            barColor = this.scene.time.now % 1000 < 500 ? 
                progressBars.healthLowColor : progressBars.healthBarColor;
        }
        
        // Dibujar barra de salud
        this.bar.fillStyle(barColor, 1);
        this.bar.fillRect(
            this.x, 
            this.y, 
            this.width * healthPercent, 
            this.height
        );
    }
    
    destroy() {
        if (this.barContainer) this.barContainer.destroy();
        if (this.bar) this.bar.destroy();
    }
}

export default HealthBar;