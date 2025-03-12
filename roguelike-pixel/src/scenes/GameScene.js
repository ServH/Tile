import Phaser from 'phaser';
import RoomGenerator from '../generators/RoomGenerator';
import Player from '../entities/Player';
import gameConfig from '../config/gameConfig';

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        
        // Estado del juego
        this.player = null;
        this.currentRoomIndex = 0;
        this.tileSize = gameConfig.gameplay.tileSize;
        
        // Elementos del mapa
        this.walls = null;
        this.doors = null;
        this.doorSprites = [];
        this.exitSprites = [];
        
        // Generador de habitaciones
        this.roomGenerator = null;
        this.dungeon = null;
    }

    create() {
        // Crear grupos
        this.walls = this.physics.add.staticGroup();
        this.doors = this.physics.add.staticGroup();
        
        // Inicializar generador
        this.roomGenerator = new RoomGenerator();
        
        // Obtener dimensiones de la pantalla
        const { width, height } = this.cameras.main;
        
        // Generar mazmorra
        this.dungeon = this.roomGenerator.generateDungeon(width, height);
        
        // Cargar primera habitación
        this.loadRoom(0);
        
        // Crear jugador
        this.createPlayer();
        
        // Activar UI
        if (!this.scene.isActive('UIScene')) {
            this.scene.launch('UIScene');
        }
        
        // Informar a la UI de cuántas habitaciones hay
        this.events.emit('total-rooms', this.dungeon.rooms.length);
    }
    
    update() {
        // Actualizar jugador
        if (this.player) {
            this.player.update();
            
            // Detectar colisión con puertas de salida
            this.checkDoorCollisions();
        }
    }
    
    loadRoom(roomIndex) {
        // Limpiar habitación anterior
        this.clearCurrentRoom();
        
        // Obtener habitación
        const room = this.dungeon.rooms[roomIndex];
        this.currentRoomIndex = roomIndex;
        
        // Renderizar habitación
        this.renderRoom(room);
        
        // Actualizar contador de habitación en la UI
        this.events.emit('room-change', {
            current: roomIndex + 1,
            total: this.dungeon.rooms.length
        });
    }
    
    clearCurrentRoom() {
        // Limpiar grupos
        if (this.walls) this.walls.clear(true, true);
        if (this.doors) this.doors.clear(true, true);
        
        // Limpiar sprites de puertas
        this.doorSprites.forEach(sprite => sprite.destroy());
        this.doorSprites = [];
        
        // Limpiar sprites de salida
        this.exitSprites.forEach(sprite => sprite.destroy());
        this.exitSprites = [];
    }
    
    renderRoom(room) {
        // Encontrar la puerta de salida
        const exitDoor = room.doors.find(door => door.isExit);
        
        // Renderizar tiles
        for (let y = 0; y < room.height; y++) {
            for (let x = 0; x < room.width; x++) {
                const tileType = room.layout[y][x];
                const pixelX = x * this.tileSize;
                const pixelY = y * this.tileSize;
                
                switch (tileType) {
                    case this.roomGenerator.TILE_TYPES.WALL:
                        // Paredes
                        const wall = this.add.rectangle(
                            pixelX + this.tileSize / 2,
                            pixelY + this.tileSize / 2,
                            this.tileSize,
                            this.tileSize,
                            0x333333
                        );
                        this.walls.add(wall);
                        break;
                        
                    case this.roomGenerator.TILE_TYPES.DOOR:
                        // Puertas de entrada
                        const door = this.add.rectangle(
                            pixelX + this.tileSize / 2,
                            pixelY + this.tileSize / 2,
                            this.tileSize,
                            this.tileSize,
                            0x00ffff
                        );
                        this.doorSprites.push(door);
                        break;
                        
                    case this.roomGenerator.TILE_TYPES.EXIT:
                        // Puerta de salida
                        const exitTile = this.add.rectangle(
                            pixelX + this.tileSize / 2,
                            pixelY + this.tileSize / 2,
                            this.tileSize,
                            this.tileSize,
                            0xff0066
                        );
                        
                        // Hacer brillar las salidas
                        this.tweens.add({
                            targets: exitTile,
                            alpha: 0.7,
                            duration: 500,
                            yoyo: true,
                            repeat: -1
                        });
                        
                        // Asignar la posición de la puerta (NORTH, EAST, SOUTH, WEST)
                        if (exitDoor) {
                            exitTile.doorPosition = exitDoor.position;
                        }
                        
                        this.exitSprites.push(exitTile);
                        
                        // Colisionador para la puerta
                        const exitCollider = this.physics.add.existing(exitTile, true);
                        this.doors.add(exitCollider);
                        break;
                }
            }
        }
    }
    
    createPlayer() {
        // Buscar posición inicial (centro de la habitación)
        const room = this.dungeon.rooms[this.currentRoomIndex];
        const startX = Math.floor(room.width / 2) * this.tileSize;
        const startY = Math.floor(room.height / 2) * this.tileSize;
        
        // Crear jugador
        this.player = new Player(this, startX, startY);
        
        // Configurar colisiones
        this.physics.add.collider(this.player, this.walls);
    }
    
    checkDoorCollisions() {
        if (!this.player || this.doors.getChildren().length === 0) return;
        
        // Comprobar superposición con cualquier puerta de salida
        const overlapping = this.physics.overlap(this.player, this.doors);
        
        if (overlapping && this.exitSprites.length > 0) {
            // Todas las puertas de salida tienen la misma posición, así que usamos la primera
            const doorPosition = this.exitSprites[0].doorPosition;
            
            if (doorPosition !== undefined) {
                this.goToNextRoom(doorPosition);
            }
        }
    }
    
    goToNextRoom(doorPosition) {
        // No continuar si el jugador está en transición
        if (this.player.isTransitioning) return;
        this.player.isTransitioning = true;
        
        // Obtener información de la siguiente habitación
        const currentRoomId = this.dungeon.rooms[this.currentRoomIndex].id;
        const nextRoom = this.roomGenerator.getNextRoomDirection(
            currentRoomId, 
            doorPosition
        );
        
        if (!nextRoom) {
            console.error("No hay conexión para esta puerta");
            this.player.isTransitioning = false;
            return;
        }
        
        // Encontrar índice de la siguiente habitación
        const nextRoomIndex = this.dungeon.rooms.findIndex(r => r.id === nextRoom.roomId);
        
        if (nextRoomIndex === -1) {
            console.error("Habitación no encontrada:", nextRoom.roomId);
            this.player.isTransitioning = false;
            return;
        }
        
        // Efecto de transición
        this.cameras.main.fade(250, 0, 0, 0, false, (camera, progress) => {
            if (progress === 1) {
                // Cargar nueva habitación
                this.loadRoom(nextRoomIndex);
                
                // Posicionar al jugador en la entrada opuesta
                this.positionPlayerAtEntrance(nextRoom.doorPosition);
                
                // Transición de entrada
                this.cameras.main.fadeIn(250, 0, 0, 0, (camera, progress) => {
                    if (progress === 1) {
                        this.player.isTransitioning = false;
                    }
                });
            }
        });
    }
    
    positionPlayerAtEntrance(doorPosition) {
        const room = this.dungeon.rooms[this.currentRoomIndex];
        let x, y;
        
        // Buscar la puerta correspondiente
        const door = room.doors.find(d => d.position === doorPosition);
        
        if (door) {
            // Usar la posición central de la puerta
            x = door.centralX * this.tileSize;
            y = door.centralY * this.tileSize;
            
            // Ajustar para colocar al jugador dentro de la habitación
            switch (doorPosition) {
                case this.roomGenerator.DOOR_POSITIONS.NORTH:
                    y += this.tileSize * 2; // 2 tiles hacia abajo desde la puerta
                    break;
                case this.roomGenerator.DOOR_POSITIONS.EAST:
                    x -= this.tileSize * 2; // 2 tiles hacia la izquierda desde la puerta
                    break;
                case this.roomGenerator.DOOR_POSITIONS.SOUTH:
                    y -= this.tileSize * 2; // 2 tiles hacia arriba desde la puerta
                    break;
                case this.roomGenerator.DOOR_POSITIONS.WEST:
                    x += this.tileSize * 2; // 2 tiles hacia la derecha desde la puerta
                    break;
            }
        } else {
            // Si no encuentra la puerta, posicionar en el centro (fallback)
            x = Math.floor(room.width / 2) * this.tileSize;
            y = Math.floor(room.height / 2) * this.tileSize;
        }
        
        // Posicionar jugador
        this.player.setPosition(x, y);
    }
}

export default GameScene;