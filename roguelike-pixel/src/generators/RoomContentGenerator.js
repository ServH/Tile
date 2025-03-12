import roomContentConfig from '../config/roomContentConfig';

class RoomContentGenerator {
    constructor() {
        this.config = roomContentConfig;
        this.tileTypes = this.config.tileTypes;
        this.roomWidth = 0;
        this.roomHeight = 0;
        this.tileSize = 0;
        this.contentGrid = [];
    }
    
    /**
     * Genera contenido para una habitación
     * @param {Object} room - Información de la habitación
     * @param {number} tileSize - Tamaño de cada tile en píxeles
     * @param {string} style - Estilo de habitación (standard, flooded, etc.)
     */
    generateRoomContent(room, tileSize, style = 'standard') {
        // Guardar dimensiones
        this.roomWidth = room.width;
        this.roomHeight = room.height;
        this.tileSize = tileSize;
        
        // Inicializar grid con suelo
        this.initializeGrid();
        
        // Identificar entradas y salidas
        const entrances = room.doors.filter(door => !door.isExit);
        const exits = room.doors.filter(door => door.isExit);
        
        if (exits.length === 0) {
            console.warn('La habitación no tiene salidas');
            return this.contentGrid;
        }
        
        // Punto central (para iniciar pathfinding)
        const startPoint = {
            x: Math.floor(this.roomWidth / 2),
            y: Math.floor(this.roomHeight / 2)
        };
        
        // Para cada salida, generar un camino garantizado
        for (const exit of exits) {
            // Punto final (punto central de la puerta de salida)
            const endPoint = {
                x: exit.centralX,
                y: exit.centralY
            };
            
            // Generar camino usando un algoritmo que asegure el acceso
            this.generateGuaranteedPath(startPoint, endPoint);
        }
        
        // Aplicar estilo específico de habitación
        this.applyRoomStyle(style);
        
        // Rellenar resto de la habitación con obstáculos respetando los caminos
        this.populateWithObstacles(style);
        
        // Generar grupos de obstáculos para dar más naturalidad
        if (this.config.generation.clusters.enabled) {
            this.generateObstacleClusters(style);
        }
        
        return this.contentGrid;
    }
    
    /**
     * Inicializa el grid con suelo básico
     */
    initializeGrid() {
        this.contentGrid = Array(this.roomHeight).fill().map(() => 
            Array(this.roomWidth).fill(this.tileTypes.floor)
        );
        
        // Marcar bordes como no disponibles (ya contienen paredes)
        for (let y = 0; y < this.roomHeight; y++) {
            for (let x = 0; x < this.roomWidth; x++) {
                if (y === 0 || y === this.roomHeight - 1 || x === 0 || x === this.roomWidth - 1) {
                    this.contentGrid[y][x] = null; // No usar estas posiciones
                }
            }
        }
    }
    
    /**
     * Genera un camino garantizado entre dos puntos
     */
    generateGuaranteedPath(start, end) {
        // Usamos un algoritmo A* simplificado para encontrar un camino
        const path = this.findPath(start, end);
        
        // Marcar el camino y un buffer alrededor como transitable (no-obstáculo)
        if (path) {
            const pathWidth = this.config.generation.pathWidth;
            
            for (const point of path) {
                // Marcar el punto y los puntos cercanos como camino garantizado
                for (let dy = -pathWidth; dy <= pathWidth; dy++) {
                    for (let dx = -pathWidth; dx <= pathWidth; dx++) {
                        const nx = point.x + dx;
                        const ny = point.y + dy;
                        
                        // Verificar límites
                        if (nx >= 0 && nx < this.roomWidth && ny >= 0 && ny < this.roomHeight) {
                            // Marcar como camino garantizado (no se colocarán obstáculos aquí)
                            if (this.contentGrid[ny][nx] === this.tileTypes.floor) {
                                this.contentGrid[ny][nx] = { 
                                    ...this.tileTypes.floor, 
                                    isPath: true  // Marca especial para camino garantizado
                                };
                            }
                        }
                    }
                }
            }
        }
    }
    
    /**
     * Implementación simple de A* para encontrar camino
     */
    findPath(start, end) {
        // Cola de prioridad para A*
        const openSet = [{ 
            x: start.x, 
            y: start.y, 
            g: 0, 
            h: this.heuristic(start, end),
            f: this.heuristic(start, end), 
            parent: null 
        }];
        
        // Conjunto de nodos visitados
        const closedSet = new Set();
        
        // Mientras haya nodos por explorar
        while (openSet.length > 0) {
            // Ordenar por f y obtener el mejor
            openSet.sort((a, b) => a.f - b.f);
            const current = openSet.shift();
            
            // Convertir a string para identificación única
            const currentKey = `${current.x},${current.y}`;
            
            // Si llegamos al destino, reconstruir camino
            if (current.x === end.x && current.y === end.y) {
                return this.reconstructPath(current);
            }
            
            // Marcar como visitado
            closedSet.add(currentKey);
            
            // Explorar vecinos (4 direcciones)
            const directions = [
                { x: 0, y: -1 }, // Norte
                { x: 1, y: 0 },  // Este
                { x: 0, y: 1 },  // Sur
                { x: -1, y: 0 }  // Oeste
            ];
            
            for (const dir of directions) {
                const nx = current.x + dir.x;
                const ny = current.y + dir.y;
                const neighborKey = `${nx},${ny}`;
                
                // Verificar límites y si es transitable
                if (nx >= 0 && nx < this.roomWidth && ny >= 0 && ny < this.roomHeight && 
                    !closedSet.has(neighborKey) && this.contentGrid[ny][nx] !== null) {
                    
                    const g = current.g + 1;
                    const h = this.heuristic({ x: nx, y: ny }, end);
                    const f = g + h;
                    
                    // Verificar si ya está en openSet
                    const existingIndex = openSet.findIndex(n => n.x === nx && n.y === ny);
                    
                    if (existingIndex === -1 || g < openSet[existingIndex].g) {
                        if (existingIndex !== -1) {
                            // Actualizar existente
                            openSet[existingIndex].g = g;
                            openSet[existingIndex].f = f;
                            openSet[existingIndex].parent = current;
                        } else {
                            // Añadir nuevo
                            openSet.push({ x: nx, y: ny, g, h, f, parent: current });
                        }
                    }
                }
            }
        }
        
        // No se encontró camino
        return null;
    }
    
    /**
     * Heurística para A* (distancia Manhattan)
     */
    heuristic(a, b) {
        return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
    }
    
    /**
     * Reconstruye el camino desde el nodo final hasta el inicio
     */
    reconstructPath(node) {
        const path = [];
        let current = node;
        
        while (current) {
            path.unshift({ x: current.x, y: current.y });
            current = current.parent;
        }
        
        return path;
    }
    
    /**
     * Aplica estilo específico a la habitación
     */
    applyRoomStyle(styleName) {
        // Obtener configuración del estilo
        const style = this.config.roomStyles[styleName];
        if (!style) {
            console.warn(`Estilo "${styleName}" no encontrado, usando standard`);
            return;
        }
    }
    
    /**
     * Genera obstáculos en la habitación respetando el camino garantizado
     */
    populateWithObstacles(styleName) {
        // Obtener configuración del estilo
        const style = this.config.roomStyles[styleName] || this.config.roomStyles.standard;
        const { density, minObstacles, maxObstacles } = this.config.generation;
        
        // Determinar tipos de obstáculos disponibles
        const availableObstacles = style.obstacleTypes.map(typeId => this.tileTypes[typeId]);
        
        // Calcular número de obstáculos a colocar
        const totalCells = this.roomWidth * this.roomHeight;
        const targetObstacles = Math.floor(totalCells * (style.density || density));
        const numObstacles = Math.min(
            Math.max(minObstacles, targetObstacles),
            maxObstacles
        );
        
        // Colocar obstáculos aleatoriamente
        let placedObstacles = 0;
        let attempts = 0;
        const maxAttempts = numObstacles * 4; // Evitar bucles infinitos
        
        while (placedObstacles < numObstacles && attempts < maxAttempts) {
            // Seleccionar tamaño de obstáculo
            const size = this.selectRandomSize();
            
            // Posición aleatoria
            const x = Math.floor(Math.random() * (this.roomWidth - size.width - 1)) + 1;
            const y = Math.floor(Math.random() * (this.roomHeight - size.height - 1)) + 1;
            
            // Verificar si el espacio está disponible (sin interferir con caminos)
            if (this.isSpaceAvailable(x, y, size.width, size.height)) {
                // Seleccionar tipo de obstáculo aleatorio
                const obstacleType = this.selectRandomObstacle(availableObstacles);
                
                // Colocar obstáculo
                this.placeObstacle(x, y, size.width, size.height, obstacleType);
                placedObstacles++;
            }
            
            attempts++;
        }
    }
    
    /**
     * Verifica si un espacio está disponible para colocar un obstáculo
     */
    isSpaceAvailable(x, y, width, height) {
        const { borderPadding, doorClearance } = this.config.generation;
        
        // Verificar límites
        if (x < borderPadding || x + width >= this.roomWidth - borderPadding || 
            y < borderPadding || y + height >= this.roomHeight - borderPadding) {
            return false;
        }
        
        // Verificar que no interfiera con caminos o puertas
        for (let dy = 0; dy < height; dy++) {
            for (let dx = 0; dx < width; dx++) {
                const cell = this.contentGrid[y + dy][x + dx];
                
                // No disponible si es null, tiene isPath o ya es un obstáculo
                if (cell === null || 
                    cell.isPath || 
                    !cell.walkable || 
                    this.isNearDoor(x + dx, y + dy, doorClearance)) {
                    return false;
                }
            }
        }
        
        return true;
    }
    
    /**
     * Verifica si una posición está cerca de una puerta
     */
    isNearDoor(x, y, clearance) {
        // Consideramos puertas en el borde
        if ((x < clearance || x >= this.roomWidth - clearance) && 
            (y < clearance || y >= this.roomHeight - clearance)) {
            return true;
        }
        
        // Si tuviéramos información de ubicación exacta de puertas:
        // return puertas.some(p => Math.abs(p.x - x) < clearance && Math.abs(p.y - y) < clearance);
        
        return false;
    }
    
    /**
     * Coloca un obstáculo en la posición especificada
     */
    placeObstacle(x, y, width, height, obstacleType) {
        for (let dy = 0; dy < height; dy++) {
            for (let dx = 0; dx < width; dx++) {
                this.contentGrid[y + dy][x + dx] = obstacleType;
            }
        }
    }
    
    /**
     * Genera clusters de obstáculos para más naturalidad
     */
    generateObstacleClusters(styleName) {
        // Obtener configuración del estilo
        const style = this.config.roomStyles[styleName] || this.config.roomStyles.standard;
        const { maxClusters, clusterSize, clusterTightness } = this.config.generation.clusters;
        
        // Determinar tipos de obstáculos disponibles
        const availableObstacles = style.obstacleTypes.map(typeId => this.tileTypes[typeId]);
        
        // Generar varios clusters
        const numClusters = Math.floor(Math.random() * maxClusters) + 1;
        
        for (let i = 0; i < numClusters; i++) {
            // Posición central del cluster
            const centerX = Math.floor(Math.random() * (this.roomWidth - 4)) + 2;
            const centerY = Math.floor(Math.random() * (this.roomHeight - 4)) + 2;
            
            // Verificar que la posición central no sea un camino
            if (this.contentGrid[centerY][centerX].isPath) {
                continue;
            }
            
            // Determinar tamaño del cluster
            const clusterElements = Math.floor(Math.random() * 
                (clusterSize.max - clusterSize.min + 1)) + clusterSize.min;
            
            // Tipo de obstáculo para este cluster
            const obstacleType = this.selectRandomObstacle(availableObstacles);
            
            // Colocar obstáculos alrededor del centro
            for (let j = 0; j < clusterElements; j++) {
                // Distancia desde el centro (cuanto mayor sea clusterTightness, más cercanos estarán)
                const distance = Math.floor(Math.random() * (3 / clusterTightness));
                
                // Dirección aleatoria
                const angle = Math.random() * Math.PI * 2;
                const dx = Math.round(Math.cos(angle) * distance);
                const dy = Math.round(Math.sin(angle) * distance);
                
                const x = centerX + dx;
                const y = centerY + dy;
                
                // Verificar límites y disponibilidad
                if (x > 0 && x < this.roomWidth - 1 && y > 0 && y < this.roomHeight - 1 && 
                    this.isSpaceAvailable(x, y, 1, 1)) {
                    this.placeObstacle(x, y, 1, 1, obstacleType);
                }
            }
        }
    }
    
    /**
     * Selecciona un tamaño aleatorio para un obstáculo según probabilidades
     */
    selectRandomSize() {
        const sizes = this.config.generation.obstacleSizes;
        const totalProbability = sizes.reduce((sum, size) => sum + size.probability, 0);
        let random = Math.random() * totalProbability;
        
        for (const size of sizes) {
            if (random < size.probability) {
                return size;
            }
            random -= size.probability;
        }
        
        // Por defecto, devolver tamaño 1x1
        return { width: 1, height: 1 };
    }
    
    /**
     * Selecciona un tipo de obstáculo aleatorio según probabilidades
     */
    selectRandomObstacle(obstacles) {
        const totalProbability = obstacles.reduce((sum, obs) => sum + (obs.probability || 1), 0);
        let random = Math.random() * totalProbability;
        
        for (const obstacle of obstacles) {
            const prob = obstacle.probability || 1;
            if (random < prob) {
                return obstacle;
            }
            random -= prob;
        }
        
        // Por defecto, devolver el primer obstáculo
        return obstacles[0];
    }
}

export default RoomContentGenerator;