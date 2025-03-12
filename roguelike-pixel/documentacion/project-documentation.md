# Documentación del Roguelike Pixel - Etapa 1

## Descripción del Proyecto

Roguelike Pixel es un juego de mazmorras estilo roguelike con estética pixel art inspirada en Hotline Miami. El juego se ejecuta en navegador utilizando Phaser 3 y JavaScript moderno.

## Arquitectura del Proyecto

El proyecto sigue una arquitectura modular con clara separación de responsabilidades:

```
roguelike-pixel/
├── src/
│   ├── config/       # Configuración centralizada
│   ├── scenes/       # Escenas de Phaser
│   ├── entities/     # Entidades del juego
│   ├── generators/   # Generación procedural
│   ├── ui/           # Componentes de interfaz
│   ├── utils/        # Utilidades
│   ├── assets/       # Recursos gráficos y sonido
│   ├── index.html    # HTML base
│   └── index.js      # Punto de entrada
```

## Componentes Principales

### 1. Sistema de Configuración

Todo parámetro ajustable está centralizado en archivos de configuración:

- **gameConfig.js**: Configuración global del juego
- **playerConfig.js**: Estadísticas y comportamiento del jugador
- **levelConfig.js**: Generación procedural de niveles
- **uiConfig.js**: Estilos y configuración de la interfaz
- **enemyConfig.js**: Configuración de enemigos

### 2. Generación Procedural de Habitaciones

El sistema de generación de habitaciones al estilo Binding of Isaac:

- Las habitaciones ocupan toda la pantalla
- Puertas de 3 tiles de ancho para facilitar la navegación
- Transiciones fluidas entre habitaciones
- Conexión lineal de habitaciones
- Puertas de entrada (cian) y salida (rosa) bien diferenciadas
- Soporte para un total de 10 habitaciones

```javascript
// Generación de toda la estructura
const roomGenerator = new RoomGenerator();
const dungeon = roomGenerator.generateDungeon(width, height);
```

### 3. Entidades del Juego

#### Jugador

- Movimiento con WASD o flechas
- Sistema de dash con espacio
- Invulnerabilidad temporal al recibir daño
- Sistema de colisión con puertas para transición entre habitaciones

### 4. Interfaz de Usuario

La UI está completamente separada de la lógica del juego:

- Escena UIScene superpuesta al juego
- Comunicación mediante eventos
- Contador de habitaciones (X/10)
- Componentes modulares (HealthBar)
- Estilos centralizados en uiConfig

### 5. Sistema de Escenas

- **BootScene**: Carga inicial y pantalla de bienvenida
- **MenuScene**: Menú principal
- **GameScene**: Lógica del juego y renderizado de habitaciones
- **UIScene**: Interfaz superpuesta
- **GameOverScene**: Pantalla de fin de juego

### 6. Transiciones Entre Habitaciones

- Detección de colisión con puertas de salida
- Efecto de fade para transiciones suaves
- Posicionamiento correcto del jugador al entrar en nueva habitación
- Separación entre mecánica de cambio de habitación y lógica de renderizado

## Flujo del Juego

1. El jugador comienza en la primera habitación
2. Explora y busca la puerta de salida (rosa brillante)
3. Al tocar la puerta, transición a la siguiente habitación
4. El contador de habitaciones se actualiza
5. El objetivo es llegar a la última habitación (10/10)

## Aspectos Técnicos

### Tecnologías Utilizadas

- **Phaser 3**: Framework de juegos HTML5
- **ES6+**: JavaScript moderno
- **Webpack**: Bundling y servidor de desarrollo
- **NPM**: Gestión de dependencias

### Cómo Ejecutar el Proyecto

1. Instalar dependencias:
   ```
   npm install
   ```

2. Iniciar servidor de desarrollo:
   ```
   npm start
   ```

3. Abrir navegador en `http://localhost:8080`

## Próximos Pasos

Para las siguientes etapas de desarrollo:

1. **Mejoras en la Generación de Habitaciones**
   - Variedad de layouts de habitaciones
   - Obstáculos y elementos interactivos
   - Mayor complejidad en las conexiones

2. **Sistema de Combate**
   - Implementar armas y ataques
   - Añadir enemigos básicos
   - Sistema de salud y daño

3. **Mejoras Visuales**
   - Diferenciación visual entre habitaciones
   - Efectos de partículas en las transiciones
   - Feedback visual mejorado para las puertas

4. **Progresión**
   - Sistema de puntuación
   - Aumento de dificultad progresivo
   - Condición de victoria al completar todas las habitaciones# Documentación del Roguelike Pixel - Etapa 1

## Descripción del Proyecto

Roguelike Pixel es un juego de mazmorras estilo roguelike con estética pixel art inspirada en Hotline Miami. El juego se ejecuta en navegador utilizando Phaser 3 y JavaScript moderno.

## Arquitectura del Proyecto

El proyecto sigue una arquitectura modular con clara separación de responsabilidades:

```
roguelike-pixel/
├── src/
│   ├── config/       # Configuración centralizada
│   ├── scenes/       # Escenas de Phaser
│   ├── entities/     # Entidades del juego
│   ├── generators/   # Generación procedural
│   ├── ui/           # Componentes de interfaz
│   ├── utils/        # Utilidades
│   ├── assets/       # Recursos gráficos y sonido
│   ├── index.html    # HTML base
│   └── index.js      # Punto de entrada
```

## Componentes Principales

### 1. Sistema de Configuración

Todo parámetro ajustable está centralizado en archivos de configuración:

- **gameConfig.js**: Configuración global del juego
- **playerConfig.js**: Estadísticas y comportamiento del jugador
- **levelConfig.js**: Generación procedural de niveles
- **uiConfig.js**: Estilos y configuración de la interfaz
- **enemyConfig.js**: Configuración de enemigos

### 2. Generación Procedural

El sistema de generación de mazmorras:

- Crea habitaciones de tamaño aleatorio
- Distribuye las habitaciones evitando superposiciones
- Conecta las habitaciones con pasillos
- Añade puertas y escaleras
- Escala la dificultad según la profundidad

```javascript
// Ejemplo de generación de mazmorras
this.dungeonGenerator = new DungeonGenerator();
this.dungeon = this.dungeonGenerator.generateDungeon(this.currentDepth);
```

### 3. Entidades del Juego

#### Jugador

- Movimiento con WASD o flechas
- Sistema de dash con espacio
- Invulnerabilidad temporal al recibir daño
- Feedback visual y físico (knockback)

#### Enemigos

- Máquina de estados (idle, patrol, chase, attack, retreat)
- Detección de jugador basada en rango
- Patrones de movimiento
- Escalado de dificultad según nivel

### 4. Interfaz de Usuario

La UI está completamente separada de la lógica del juego:

- Escena UIScene superpuesta al juego
- Comunicación mediante eventos
- Componentes modulares (HealthBar)
- Estilos centralizados en uiConfig

### 5. Sistema de Escenas

- **BootScene**: Carga inicial y pantalla de bienvenida
- **MenuScene**: Menú principal
- **GameScene**: Lógica del juego
- **UIScene**: Interfaz superpuesta
- **GameOverScene**: Pantalla de fin de juego

### 6. Utilidades

- **EventBus**: Sistema de comunicación entre componentes
- **InputManager**: Gestión centralizada de controles

## Flujo del Juego

1. El jugador comienza en el nivel 1
2. Explora la mazmorra generada proceduralmente
3. Encuentra las escaleras para descender al siguiente nivel
4. La dificultad aumenta con la profundidad
5. El objetivo es llegar lo más profundo posible

## Aspectos Técnicos

### Tecnologías Utilizadas

- **Phaser 3**: Framework de juegos HTML5
- **ES6+**: JavaScript moderno
- **Webpack**: Bundling y servidor de desarrollo
- **NPM**: Gestión de dependencias

### Cómo Ejecutar el Proyecto

1. Instalar dependencias:
   ```
   npm install
   ```

2. Iniciar servidor de desarrollo:
   ```
   npm start
   ```

3. Abrir navegador en `http://localhost:8080`

## Próximos Pasos

Para las siguientes etapas de desarrollo:

1. **Sistema de Combate**
   - Implementar armas y ataques
   - Mejorar IA de enemigos
   - Añadir efectos de partículas

2. **Sistema de Items**
   - Crear recogibles
   - Implementar inventario
   - Powerups y mejoras

3. **Mejoras Visuales**
   - Añadir sprites detallados
   - Efectos de iluminación
   - Animaciones para entidades

4. **Audio**
   - Música de fondo
   - Efectos de sonido
   - Diseño de sonido estilo retro

5. **Progresión**
   - Sistema de puntuación
   - Desbloqueo de personajes
   - Logros y estadísticas