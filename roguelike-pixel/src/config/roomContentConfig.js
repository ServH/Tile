/**
 * Configuración para el generador de contenido de habitaciones
 */

const roomContentConfig = {
    // Tipos de tiles para obstáculos y terreno
    tileTypes: {
        // Terrenos básicos
        floor: { 
            id: 'floor', 
            walkable: true, 
            color: 0x111111, 
            name: 'Suelo'
        },
        // Obstáculos
        water: { 
            id: 'water', 
            walkable: false, 
            color: 0x0066ff, 
            name: 'Agua',
            probability: 0.3
        },
        lava: { 
            id: 'lava', 
            walkable: false, 
            color: 0xff3300, 
            name: 'Lava',
            probability: 0.15,
            deadly: true
        },
        crate: { 
            id: 'crate', 
            walkable: false, 
            color: 0x8B4513, 
            name: 'Caja',
            probability: 0.25
        },
        barrel: { 
            id: 'barrel', 
            walkable: false, 
            color: 0xA52A2A, 
            name: 'Barril',
            probability: 0.2
        },
        bush: { 
            id: 'bush', 
            walkable: false, 
            color: 0x006600, 
            name: 'Arbusto',
            probability: 0.2
        },
        rock: { 
            id: 'rock', 
            walkable: false, 
            color: 0x808080, 
            name: 'Roca',
            probability: 0.3
        }
    },
    
    // Parámetros de generación
    generation: {
        density: 0.15,           // Densidad de obstáculos
        minObstacles: 10,        // Mínimo número de obstáculos
        maxObstacles: 30,        // Máximo número de obstáculos
        borderPadding: 2,        // Espacio libre cerca de las paredes
        doorClearance: 3,        // Espacio libre alrededor de las puertas
        pathWidth: 2,            // Ancho mínimo del camino garantizado
        randomPathComplexity: 3, // Complejidad del camino aleatorio (mayor = más curvas)
        
        // Distribución de tamaños de obstáculos
        obstacleSizes: [
            { width: 1, height: 1, probability: 0.6 },  // Obstáculo 1x1
            { width: 2, height: 1, probability: 0.2 },  // Obstáculo 2x1
            { width: 1, height: 2, probability: 0.1 },  // Obstáculo 1x2
            { width: 2, height: 2, probability: 0.1 }   // Obstáculo 2x2
        ],
        
        // Parámetros para agrupaciones
        clusters: {
            enabled: true,
            maxClusters: 5,
            clusterSize: { min: 3, max: 7 },
            clusterTightness: 0.7  // 0-1: qué tan juntos aparecen los obstáculos en un grupo
        }
    },
    
    // Parámetros para diferentes estilos de habitaciones
    roomStyles: {
        standard: {
            obstacleTypes: ['crate', 'barrel', 'rock'],
            density: 0.15
        },
        flooded: {
            obstacleTypes: ['water', 'crate'],
            density: 0.25
        },
        volcanic: {
            obstacleTypes: ['lava', 'rock'],
            density: 0.2
        },
        forest: {
            obstacleTypes: ['bush', 'rock'],
            density: 0.3
        }
    }
};

export default roomContentConfig;