/**
 * Sistema centralizado de eventos para comunicación entre componentes.
 * Implementa el patrón Publish/Subscribe.
 */
class EventBus {
    constructor() {
        this.listeners = {};
    }
    
    /**
     * Suscribe un callback a un evento específico
     * @param {string} event - Nombre del evento
     * @param {function} callback - Función a ejecutar
     * @param {object} context - Contexto para el callback
     */
    on(event, callback, context = null) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        
        this.listeners[event].push({
            callback,
            context
        });
        
        // Devuelve una función para desuscribirse
        return () => this.off(event, callback, context);
    }
    
    /**
     * Suscribe a un evento para ejecutarse solo una vez
     */
    once(event, callback, context = null) {
        const onceCallback = (...args) => {
            this.off(event, onceCallback, context);
            callback.apply(context, args);
        };
        
        return this.on(event, onceCallback, context);
    }
    
    /**
     * Elimina una suscripción a un evento
     */
    off(event, callback, context = null) {
        if (!this.listeners[event]) return;
        
        // Filtrar los listeners que coincidan
        this.listeners[event] = this.listeners[event].filter(listener => {
            return listener.callback !== callback || listener.context !== context;
        });
        
        // Eliminar el array si está vacío
        if (this.listeners[event].length === 0) {
            delete this.listeners[event];
        }
    }
    
    /**
     * Elimina todas las suscripciones a un evento
     */
    removeAllListeners(event) {
        if (event) {
            delete this.listeners[event];
        } else {
            this.listeners = {};
        }
    }
    
    /**
     * Emite un evento con los datos proporcionados
     */
    emit(event, ...args) {
        if (!this.listeners[event]) return;
        
        // Hacer una copia para evitar problemas si se modifican durante la ejecución
        const listeners = [...this.listeners[event]];
        
        for (const listener of listeners) {
            listener.callback.apply(listener.context, args);
        }
    }
}

// Exportar una única instancia para todo el juego
export default new EventBus();