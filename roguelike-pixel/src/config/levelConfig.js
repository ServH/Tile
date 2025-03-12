/**
 * Configuración de la generación de niveles
 */

const levelConfig = {
    // Configuración base de generación
    generation: {
        baseWidth: 50,
        baseHeight: 50,
        minRoomSize: 7,
        maxRoomSize: 12,
        minRoomDistance: 2,
        corridorWidth: 1,
        defaultMaxRooms: 10
    },
    
    // Evolución según la profundidad
    depthScaling: {
        roomCountFactor: (depth) => Math.min(10 + Math.floor(depth/3), 20),
        complexityFactor: (depth) => Math.min(1 + (depth * 0.1), 2),
        specialRoomProbability: (depth) => Math.min(0.1 + (depth * 0.02), 0.3)
    },
    
    // Tipos de habitaciones
    roomTypes: {
        standard: { weight: 80 },
        treasure: { weight: 10 },
        trap: { weight: 5 },
        challenge: { weight: 3 },
        boss: { weight: 2, minDepth: 3 }
    },
    
    // Características de las casillas
    tileTypes: {
        WALL: 1,
        FLOOR: 0,
        DOOR: 2,
        STAIRS: 3
    },
    
    // Temas visuales por profundidad
    themes: [
        { name: 'neon_hotel', depths: [1, 2] },
        { name: 'abandoned_mall', depths: [3, 4] },
        { name: 'underground_club', depths: [5, 6] },
        { name: 'industrial_zone', depths: [7, 8] },
        { name: 'secret_lab', depths: [9, 10] }
    ]
};

export default levelConfig;