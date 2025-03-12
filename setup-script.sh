#!/bin/bash
# Script para crear la estructura de directorios del roguelike

# Crear directorio base
mkdir -p roguelike-pixel

# Entrar al directorio
cd roguelike-pixel

# Inicializar proyecto npm
npm init -y

# Crear estructura de directorios
mkdir -p src/{config,scenes,entities,generators,ui,utils,assets/{images,audio,fonts}}
mkdir -p dist

# Instalar dependencias
npm install phaser@3.55.2
npm install --save-dev webpack webpack-cli webpack-dev-server copy-webpack-plugin html-webpack-plugin babel-loader @babel/core @babel/preset-env

# Crear archivos de configuración
touch webpack.config.js
touch src/index.html
touch src/index.js

# Crear archivos de config
touch src/config/gameConfig.js
touch src/config/playerConfig.js
touch src/config/levelConfig.js
touch src/config/uiConfig.js
touch src/config/enemyConfig.js

# Crear escenas
touch src/scenes/BootScene.js
touch src/scenes/GameScene.js
touch src/scenes/UIScene.js
touch src/scenes/MenuScene.js
touch src/scenes/GameOverScene.js

# Crear entidades
touch src/entities/Player.js
touch src/entities/Enemy.js
touch src/entities/Item.js

# Crear generadores
touch src/generators/DungeonGenerator.js
touch src/generators/RoomGenerator.js
touch src/generators/EnemyGenerator.js

# Crear componentes de UI
touch src/ui/HealthBar.js
touch src/ui/Inventory.js
touch src/ui/Dialog.js
touch src/ui/StatusEffects.js

# Crear utilidades
touch src/utils/AssetLoader.js
touch src/utils/InputManager.js
touch src/utils/SoundManager.js
touch src/utils/EventBus.js

# Añadir placeholder en directorios de assets
touch src/assets/images/.gitkeep
touch src/assets/audio/.gitkeep
touch src/assets/fonts/.gitkeep

# Actualizar package.json con scripts
cat > package.json << EOF
{
  "name": "roguelike-pixel",
  "version": "0.1.0",
  "description": "Un roguelike con estética pixel art estilo Hotline Miami",
  "main": "src/index.js",
  "scripts": {
    "start": "webpack serve",
    "build": "webpack --mode production",
    "test": "echo \\"Error: no test specified\\" && exit 1"
  },
  "keywords": [
    "roguelike",
    "pixel-art",
    "phaser",
    "game",
    "procedural-generation"
  ],
  "author": "",
  "license": "MIT",
  "dependencies": {
    "phaser": "^3.55.2"
  },
  "devDependencies": {
    "@babel/core": "^7.17.0",
    "@babel/preset-env": "^7.16.11",
    "babel-loader": "^8.2.3",
    "copy-webpack-plugin": "^10.2.4",
    "html-webpack-plugin": "^5.5.0",
    "webpack": "^5.68.0",
    "webpack-cli": "^4.9.2",
    "webpack-dev-server": "^4.7.4"
  }
}
EOF

# Configuración de webpack
cat > webpack.config.js << EOF
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true
  },
  devServer: {
    static: './dist',
    hot: true,
    port: 8080,
    open: true
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      filename: 'index.html'
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'src/assets', to: 'assets' }
      ]
    })
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
      },
    ],
  },
  resolve: {
    extensions: ['.js']
  }
};
EOF

# Crear HTML base
cat > src/index.html << EOF
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pixel Roguelike</title>
    <style>
        html, body {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            background-color: #000;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        
        #game-container {
            width: 800px;
            height: 600px;
            position: relative;
            box-shadow: 0 0 10px #FF0066;
            border: 2px solid #FF0066;
        }
        
        canvas {
            display: block;
        }
        
        .loading-text {
            color: #FF0066;
            font-family: monospace;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 24px;
            text-transform: uppercase;
            letter-spacing: 2px;
        }
        
        @media (max-width: 820px) {
            #game-container {
                width: 100%;
                height: 0;
                padding-bottom: 75%;
                border-width: 1px;
            }
        }
    </style>
</head>
<body>
    <div id="game-container">
        <div class="loading-text" id="loading-text">Cargando...</div>
    </div>
</body>
</html>
EOF

# Crear gitignore
cat > .gitignore << EOF
# Dependencies
/node_modules

# Production build
/dist

# Misc
.DS_Store
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Editor directories and files
.idea
.vscode
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?
EOF

echo "Estructura del proyecto creada correctamente!"
echo "Para iniciar el desarrollo, ejecuta: cd roguelike-pixel && npm start"
