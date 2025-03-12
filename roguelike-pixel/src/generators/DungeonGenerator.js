import levelConfig from '../config/levelConfig';

class DungeonGenerator {
    constructor(options = {}) {
        // Fusionar opciones con defaults
        this.config = {
            width: options.width || levelConfig.generation.baseWidth,
            height: options.height || levelConfig.generation.baseHeight,
            roomSizeRange: [
                options.minRoomSize || levelConfig.generation.minRoomSize,
                options.maxRoomSize || levelConfig.generation.maxRoomSize
            ],
            maxRooms: options.maxRooms || levelConfig.generation.defaultMaxRooms,
            minRoomDistance: options.minRoomDistance || levelConfig.generation.minRoomDistance
        };
        
        // Tipos de celdas
        this.TILE_TYPES = levelConfig.tileTypes;
        
        // Inicializar el mapa
        this.map = Array(this.config.height).fill().map(() => 
            Array(this.config.width).fill(this.TILE_TYPES.WALL)
        );
        
        // Array para almacenar habitaciones
        this.rooms = [];
    }
    
    /**
     * Genera un nuevo nivel
     */
    generateDungeon(depth = 1) {
        // Reiniciar el mapa
        this.resetMap();
        
        // Ajustar número de habitaciones según profundidad
        const maxRooms = levelConfig.depthScaling.roomCountFactor(depth);
        
        // Generar habitaciones
        this.generateRooms(maxRooms);
        
        // Conectar habitaciones
        this.connectRooms();
        
        // Agregar puertas
        this.addDoors();
        
        // Agregar escaleras
        this.addStairs();
        
        return {
            map: this.map,
            rooms: this.rooms
        };
    }
    
    /**
     * Reinicia el mapa
     */
    resetMap() {
        // Llenar con paredes
        for (let y = 0; y < this.config.height; y++) {
            for (let x = 0; x < this.config.width; x++) {
                this.map[y][x] = this.TILE_TYPES.WALL;
            }
        }
        
        // Vaciar habitaciones
        this.rooms = [];
    }
    
    /**
     * Genera las habitaciones
     */
    generateRooms(maxRooms = this.config.maxRooms) {
        const { roomSizeRange } = this.config;
        
        // Intentar crear habitaciones
        for (let i = 0; i < maxRooms; i++) {
            // Tamaño aleatorio
            const roomWidth = this.randomInt(roomSizeRange[0], roomSizeRange[1]);
            const roomHeight = this.randomInt(roomSizeRange[0], roomSizeRange[1]);
            
            // Ubicación aleatoria
            const x = this.randomInt(1, this.config.width - roomWidth - 1);
            const y = this.randomInt(1, this.config.height - roomHeight - 1);
            
            // Crear objeto habitación
            const newRoom = {
                x,
                y,
                width: roomWidth,
                height: roomHeight,
                center: {
                    x: Math.floor(x + roomWidth / 2),
                    y: Math.floor(y + roomHeight / 2)
                }
            };
            
            // Verificar solapamiento
            let overlap = false;
            for (const room of this.rooms) {
                if (this.checkRoomOverlap(newRoom, room, this.config.minRoomDistance)) {
                    overlap = true;
                    break;
                }
            }
            
            // Si no hay solapamiento, añadir la habitación
            if (!overlap) {
                this.carveRoom(newRoom);
                this.rooms.push(newRoom);
            }
        }
    }
    
    /**
     * Revisa si dos habitaciones se solapan
     */
    checkRoomOverlap(roomA, roomB, minDistance = 0) {
        return (
            roomA.x - minDistance < roomB.x + roomB.width + minDistance &&
            roomA.x + roomA.width + minDistance > roomB.x - minDistance &&
            roomA.y - minDistance < roomB.y + roomB.height + minDistance &&
            roomA.y + roomA.height + minDistance > roomB.y - minDistance
        );
    }
    
    /**
     * Talla una habitación en el mapa
     */
    carveRoom(room) {
        for (let y = room.y; y < room.y + room.height; y++) {
            for (let x = room.x; x < room.x + room.width; x++) {
                this.map[y][x] = this.TILE_TYPES.FLOOR;
            }
        }
    }
    
    /**
     * Conecta las habitaciones con pasillos
     */
    connectRooms() {
        if (this.rooms.length < 2) return;
        
        // Conectar habitaciones secuencialmente
        for (let i = 0; i < this.rooms.length - 1; i++) {
            const roomA = this.rooms[i];
            const roomB = this.rooms[i + 1];
            
            this.carveCorridor(roomA.center, roomB.center);
        }
        
        // Formar un circuito
        if (this.rooms.length > 2) {
            const firstRoom = this.rooms[0];
            const lastRoom = this.rooms[this.rooms.length - 1];
            this.carveCorridor(lastRoom.center, firstRoom.center);
        }
    }
    
    /**
     * Talla un pasillo entre dos puntos
     */
    carveCorridor(pointA, pointB) {
        let currentX = pointA.x;
        let currentY = pointA.y;
        
        // Movimiento en L
        
        // Horizontal primero
        while (currentX !== pointB.x) {
            this.map[currentY][currentX] = this.TILE_TYPES.FLOOR;
            currentX += (currentX < pointB.x) ? 1 : -1;
        }
        
        // Luego vertical
        while (currentY !== pointB.y) {
            this.map[currentY][currentX] = this.TILE_TYPES.FLOOR;
            currentY += (currentY < pointB.y) ? 1 : -1;
        }
    }
    
    /**
     * Añade puertas entre habitaciones y pasillos
     */
    addDoors() {
        for (const room of this.rooms) {
            // Revisar las cuatro paredes
            // Superior
            this.tryAddDoor(room.x + Math.floor(room.width / 2), room.y - 1);
            // Inferior
            this.tryAddDoor(room.x + Math.floor(room.width / 2), room.y + room.height);
            // Izquierda
            this.tryAddDoor(room.x - 1, room.y + Math.floor(room.height / 2));
            // Derecha
            this.tryAddDoor(room.x + room.width, room.y + Math.floor(room.height / 2));
        }
    }
    
    /**
     * Intenta añadir una puerta
     */
    tryAddDoor(x, y) {
        // Verificar límites
        if (x < 0 || y < 0 || x >= this.config.width || y >= this.config.height) return;
        
        if (this.map[y][x] === this.TILE_TYPES.WALL) {
            let floorCount = 0;
            
            // Direcciones cardinales
            const directions = [
                {x: 0, y: -1}, // Norte
                {x: 1, y: 0},  // Este
                {x: 0, y: 1},  // Sur
                {x: -1, y: 0}  // Oeste
            ];
            
            // Contar suelos adyacentes
            for (const dir of directions) {
                const nx = x + dir.x;
                const ny = y + dir.y;
                
                if (nx >= 0 && ny >= 0 && nx < this.config.width && ny < this.config.height &&
                    this.map[ny][nx] === this.TILE_TYPES.FLOOR) {
                    floorCount++;
                }
            }
            
            // Colocar puerta si hay al menos dos suelos adyacentes
            if (floorCount >= 2) {
                this.map[y][x] = this.TILE_TYPES.DOOR;
            }
        }
    }
    
    /**
     * Añade escaleras al siguiente nivel
     */
    addStairs() {
        if (this.rooms.length > 0) {
            // Colocar escaleras en la última habitación
            const lastRoom = this.rooms[this.rooms.length - 1];
            const stairsX = lastRoom.center.x;
            const stairsY = lastRoom.center.y;
            
            this.map[stairsY][stairsX] = this.TILE_TYPES.STAIRS;
        }
    }
    
    /**
     * Genera un número aleatorio entre min y max
     */
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}

export default DungeonGenerator;