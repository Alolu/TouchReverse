module.exports = function EventManager(config, currChunk) /* INDEX : 195 */{
    var EventManager = function() {
        this.eventHandlers = {}
    };
    EventManager.EventEmitter = EventManager 
    config.exports = EventManager
    EventManager.listenerCount = function(socket, event) {
        var handlers = socket.eventHandlers[event];
        return handlers ? 
            handlers.length 
            : 
            0
    }, 

    EventManager.prototype.on = function(id, callback) {
        if ("function" != typeof callback) return console.warn("Tried to register non-function", callback, "as event handler for event:", id), this;
        this.emit("newListener", id, callback);
        var handlers = this.eventHandlers,
            handler = handlers[id];
        return void 0 === handler ? 
            (handlers[id] = [callback], this) 
            : 
            (handler.push(callback), this)
    }, 

    EventManager.prototype.addListener = EventManager.prototype.on

    EventManager.prototype.once = function(id, callback) {
        return callback.once ? 
            callback.once += 1 
            : 
            callback.once = 1, this.on(id, callback)
    }, 
    EventManager.prototype.setMaxListeners = function() {
        console.warn("Method setMaxListeners not supported, there is no limit to the number of listeners")
    }, 

    EventManager.prototype.removeListener = function(id, callback) {
        var handlers = this.eventHandlers[id];
        if (void 0 !== handlers) {
            var handler = handlers.indexOf(callback);
            handler !== -1 && (
                handlers.splice(handler, 1),
                this.emit("removeListener", id, callback),
                0 === handlers.length &&   
                    delete this.eventHandlers[id]
            )
        }
        return this
    },
    
    EventManager.prototype.removeAllListeners = function(id) {
        return id ? 
            delete this.eventHandlers[id] 
            : 
            this.eventHandlers = {}, this
    }, 
    EventManager.prototype.hasListeners = function(id) {
        return void 0 !== this.eventHandlers[id]
    }, 
    EventManager.prototype.listeners = function(id) {
        var handlers = this.eventHandlers[id];
        return void 0 !== handlers ? 
            handlers.slice() 
            : 
            []
    };
    
    var slicer = Array.prototype.slice;

    EventManager.prototype.emit = function(id) {
        var handlers = this.eventHandlers[id];
        if (void 0 === handlers) return false;
        handlers = handlers.slice();
        for (var emited = false, args = slicer.call(arguments, 1), s = 0, a = handlers.length; s < a; s++) {
            var handler = handlers[s];
            void 0 !== handler && (
                handler.apply(this, args), 
                emited = true, 
                handler.once && 
                    (handler.once > 1 ? 
                        handler.once-- 
                        : 
                        delete handler.once, this.removeListener(id, handler)
                    )
            )
        }
        return emited
    }
}