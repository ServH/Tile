import gameConfig from '../config/gameConfig';

class RoomGenerator {
    constructor() {
        // Configuración básica
        this.tileSize = gameConfig.gameplay.tileSize;
        
        // Tipos de casillas
        this.TILE_TYPES = {
            WALL: 1,
            FLOOR: 0,
            DOOR: 2,
            EXIT: 3
        };
        
        // Posiciones de puertas (Norte, Este, Sur, Oeste)
        this.DOOR_POSITIONS = {
            NORTH: 0,
            EAST: 1,
            SOUTH: 2,
            WEST: 3
        };
        
        // Tamaño de las puertas
        this.DOOR_WIDTH = 3;
        
        // Inicializar valores
        this.roomsCreated = 0;
        this.totalRooms = 10; // Límite de habitaciones
        this.currentRoomLayout = null;
        
        // Tracking de puertas y conexiones
        this.connections = new Map();
    }
    
    /**
     * Genera una nueva habitación basada en la configuración
     */
    generateRoom(width, height, doorPosition = null) {
        // Calcular dimensiones en tiles
        const tilesWidth = Math.floor(width / this.tileSize);
        const tilesHeight = Math.floor(height / this.tileSize);
        
        // Inicializar matriz de tiles
        const layout = Array(tilesHeight).fill().map(() => 
            Array(tilesWidth).fill(this.TILE_TYPES.FLOOR)
        );
        
        // Añadir paredes en el perímetro
        for (let x = 0; x < tilesWidth; x++) {
            layout[0][x] = this.TILE_TYPES.WALL;
            layout[tilesHeight - 1][x] = this.TILE_TYPES.WALL;
        }
        
        for (let y = 0; y < tilesHeight; y++) {
            layout[y][0] = this.TILE_TYPES.WALL;
            layout[y][tilesWidth - 1] = this.TILE_TYPES.WALL;
        }
        
        // Añadir puertas
        const doors = this.addDoors(layout, tilesWidth, tilesHeight, doorPosition);
        
        // Crear la información de la habitación
        return {
            id: this.roomsCreated++,
            layout,
            width: tilesWidth,
            height: tilesHeight,
            doors,
            isStart: this.roomsCreated === 1,
            isFinal: this.roomsCreated === this.totalRooms
        };
    }
    
    /**
     * Añade puertas a la habitación
     */
    addDoors(layout, width, height, entryDoorPosition = null) {
        const doors = [];
        const isFirstRoom = this.roomsCreated === 0;
        const isFinalRoom = this.roomsCreated === this.totalRooms - 1;
        
        // Si es la habitación final, solo añadir la puerta de entrada
        if (isFinalRoom && entryDoorPosition !== null) {
            doors.push(this.createDoor(layout, width, height, entryDoorPosition));
            return doors;
        }
        
        // Para la primera habitación o habitaciones intermedias
        let availablePositions = [
            this.DOOR_POSITIONS.NORTH,
            this.DOOR_POSITIONS.EAST,
            this.DOOR_POSITIONS.SOUTH,
            this.DOOR_POSITIONS.WEST
        ];
        
        // Si hay una puerta de entrada, añadirla primero
        if (entryDoorPosition !== null) {
            doors.push(this.createDoor(layout, width, height, entryDoorPosition));
            // Remover esta posición de las disponibles
            availablePositions = availablePositions.filter(pos => pos !== entryDoorPosition);
        }
        
        // Añadir una puerta de salida en una dirección aleatoria
        if (!isFinalRoom) {
            const exitPosition = availablePositions[Math.floor(Math.random() * availablePositions.length)];
            const exitDoor = this.createDoor(layout, width, height, exitPosition, true);
            doors.push(exitDoor);
        }
        
        return doors;
    }
    
    /**
     * Crea una puerta en la posición especificada
     */
    createDoor(layout, width, height, position, isExit = false) {
        let x, y, doorTiles = [];
        const doorWidth = this.DOOR_WIDTH;
        const halfDoor = Math.floor(doorWidth / 2);
        
        switch (position) {
            case this.DOOR_POSITIONS.NORTH:
                // Centro en el eje X, arriba en el eje Y
                x = Math.floor(width / 2) - halfDoor;
                y = 0;
                
                // Crear puerta de 3 tiles de ancho
                for (let i = 0; i < doorWidth; i++) {
                    layout[y][x + i] = isExit ? this.TILE_TYPES.EXIT : this.TILE_TYPES.DOOR;
                    doorTiles.push({x: x + i, y: y});
                }
                break;
                
            case this.DOOR_POSITIONS.EAST:
                // Derecha en el eje X, centro en el eje Y
                x = width - 1;
                y = Math.floor(height / 2) - halfDoor;
                
                // Crear puerta de 3 tiles de alto
                for (let i = 0; i < doorWidth; i++) {
                    layout[y + i][x] = isExit ? this.TILE_TYPES.EXIT : this.TILE_TYPES.DOOR;
                    doorTiles.push({x: x, y: y + i});
                }
                break;
                
            case this.DOOR_POSITIONS.SOUTH:
                // Centro en el eje X, abajo en el eje Y
                x = Math.floor(width / 2) - halfDoor;
                y = height - 1;
                
                // Crear puerta de 3 tiles de ancho
                for (let i = 0; i < doorWidth; i++) {
                    layout[y][x + i] = isExit ? this.TILE_TYPES.EXIT : this.TILE_TYPES.DOOR;
                    doorTiles.push({x: x + i, y: y});
                }
                break;
                
            case this.DOOR_POSITIONS.WEST:
                // Izquierda en el eje X, centro en el eje Y
                x = 0;
                y = Math.floor(height / 2) - halfDoor;
                
                // Crear puerta de 3 tiles de alto
                for (let i = 0; i < doorWidth; i++) {
                    layout[y + i][x] = isExit ? this.TILE_TYPES.EXIT : this.TILE_TYPES.DOOR;
                    doorTiles.push({x: x, y: y + i});
                }
                break;
        }
        
        // Punto central de la puerta (para posicionamiento del jugador)
        const centralTile = doorTiles[Math.floor(doorTiles.length / 2)];
        
        // Devolver información de la puerta
        return {
            position,
            tiles: doorTiles,
            centralX: centralTile.x,
            centralY: centralTile.y,
            isExit,
            // Dirección opuesta para conectar habitaciones
            oppositePosition: (position + 2) % 4
        };
    }
    
    /**
     * Conecta dos habitaciones a través de sus puertas
     */
    connectRooms(roomA, exitDoor, roomB) {
        // Guardar la conexión para navegación bidireccional
        if (!this.connections.has(roomA.id)) {
            this.connections.set(roomA.id, new Map());
        }
        if (!this.connections.has(roomB.id)) {
            this.connections.set(roomB.id, new Map());
        }
        
        // Conexión A -> B
        this.connections.get(roomA.id).set(exitDoor.position, {
            roomId: roomB.id,
            doorPosition: exitDoor.oppositePosition
        });
        
        // Conexión B -> A
        this.connections.get(roomB.id).set(exitDoor.oppositePosition, {
            roomId: roomA.id,
            doorPosition: exitDoor.position
        });
    }
    
    /**
     * Genera un conjunto completo de habitaciones conectadas
     */
    generateDungeon(width, height) {
        // Reiniciar valores
        this.roomsCreated = 0;
        this.connections = new Map();
        
        const rooms = [];
        const startRoom = this.generateRoom(width, height);
        rooms.push(startRoom);
        
        let currentRoom = startRoom;
        
        // Generar habitaciones restantes
        while (rooms.length < this.totalRooms) {
            // Encontrar puerta de salida
            const exitDoor = currentRoom.doors.find(door => door.isExit);
            
            if (!exitDoor) break;
            
            // Crear nueva habitación con entrada opuesta a la salida
            const nextRoom = this.generateRoom(width, height, exitDoor.oppositePosition);
            rooms.push(nextRoom);
            
            // Conectar habitaciones
            this.connectRooms(currentRoom, exitDoor, nextRoom);
            
            // Continuar desde la nueva habitación
            currentRoom = nextRoom;
        }
        
        return {
            rooms,
            connections: this.connections
        };
    }
    
    /**
     * Obtiene la dirección para moverse entre habitaciones
     */
    getNextRoomDirection(currentRoomId, doorPosition) {
        if (!this.connections.has(currentRoomId)) return null;
        
        return this.connections.get(currentRoomId).get(doorPosition) || null;
    }
}

export default RoomGenerator;