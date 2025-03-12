import Phaser from 'phaser';
import RoomGenerator from '../generators/RoomGenerator';
import RoomContentGenerator from '../generators/RoomContentGenerator';
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
        this.obstacles = null;
        this.doorSprites = [];
        this.exitSprites = [];
        
        // Generadores
        this.roomGenerator = null;
        this.contentGenerator = null;
        this.dungeon = null;
        
        // Contenido actual
        this.currentRoomContent = null;
    }

    create() {
        // Crear grupos físicos
        this.walls = this.physics.add.staticGroup();
        this.doors = this.physics.add.staticGroup();
        this.obstacles = this.physics.add.staticGroup();
        
        // Inicializar generadores
        this.roomGenerator = new RoomGenerator();
        this.contentGenerator = new RoomContentGenerator();
        
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
        
        // Elegir estilo de habitación
        const roomStyle = this.selectRoomStyle(roomIndex);
        
        // Generar contenido de la habitación
        this.currentRoomContent = this.contentGenerator.generateRoomContent(
            room, 
            this.tileSize,
            roomStyle
        );
        
        // Renderizar habitación y su contenido
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
        if (this.obstacles) this.obstacles.clear(true, true);
        
        // Limpiar sprites de puertas
        this.doorSprites.forEach(sprite => sprite.destroy());
        this.doorSprites = [];
        
        // Limpiar sprites de salida
        this.exitSprites.forEach(sprite => sprite.destroy());
        this.exitSprites = [];
        
        // Resetear el contenido actual
        this.currentRoomContent = null;
    }
    
    renderRoom(room) {
        // Renderizar tiles básicos (paredes, suelo)
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
                        
                        this.exitSprites.push(exitTile);
                        
                        // Asignar posición de puerta para la colisión
                        const exitDoor = room.doors.find(d => d.isExit);
                        if (exitDoor) {
                            exitTile.doorPosition = exitDoor.position;
                        }
                        
                        // Colisionador para la puerta
                        const exitCollider = this.physics.add.existing(exitTile, true);
                        this.doors.add(exitCollider);
                        break;
                }
            }
        }
        
        // Renderizar contenido generado
        if (this.currentRoomContent) {
            this.renderRoomContent();
        }
    }
    
    renderRoomContent() {
        for (let y = 0; y < this.currentRoomContent.length; y++) {
            for (let x = 0; x < this.currentRoomContent[y].length; x++) {
                const tile = this.currentRoomContent[y][x];
                
                // Si no hay tile o es suelo normal, continuar
                if (tile === null || (tile.id === 'floor' && !tile.isPath)) {
                    continue;
                }
                
                const pixelX = x * this.tileSize;
                const pixelY = y * this.tileSize;
                
                // Renderizar según tipo
                if (tile.id !== 'floor') {
                    // Crear sprite para el obstáculo
                    const obstacle = this.add.rectangle(
                        pixelX + this.tileSize / 2,
                        pixelY + this.tileSize / 2,
                        this.tileSize,
                        this.tileSize,
                        tile.color
                    );
                    
                    // Solo añadir física para obstáculos no caminables
                    if (!tile.walkable) {
                        this.obstacles.add(this.physics.add.existing(obstacle, true));
                    }
                }
                // Opcionalmente, visualizar el camino garantizado para debugging
                else if (tile.isPath && gameConfig.gameplay.debugPath) {
                    this.add.rectangle(
                        pixelX + this.tileSize / 2,
                        pixelY + this.tileSize / 2,
                        this.tileSize / 2,
                        this.tileSize / 2,
                        0x00ff00,
                        0.3
                    );
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
        this.physics.add.collider(this.player, this.obstacles);
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
    
    /**
     * Selecciona un estilo de habitación basado en el índice
     */
    selectRoomStyle(roomIndex) {
        // Estilos disponibles
        const styles = Object.keys(this.contentGenerator.config.roomStyles);
        
        // Distribuir estilos basados en un patrón
        if (roomIndex === 0) {
            // Primera habitación siempre standard
            return 'standard';
        } else if (roomIndex === this.dungeon.rooms.length - 1) {
            // Última habitación volcanic
            return 'volcanic';
        } else {
            // Para el resto, distribuir cíclicamente
            const styleIndex = (roomIndex - 1) % (styles.length - 1);
            const style = styles[styleIndex + 1]; // +1 para saltar 'standard'
            return style;
        }
    }
}

export default GameScene;