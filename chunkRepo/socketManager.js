function socketManager(e, t) /* INDEX : 317 */{
    function main(event, callback) {
        function deleteEvent() {
            if (!callback) throw new Error("Final callback was already called");
            for (var i = 0; i < eventHandlers.length; i += 1) event.removeListener(eventHandlers[i].eventName, eventHandlers[i].callback);
            eventHandlers = null;
            try {
                callback.apply(event, arguments)
            } catch (error) {
                setTimeout(function() {
                    throw error
                }, 0)
            } finally {
                callback = null
            }
        }

        function init() {
            function handler() {
                try {
                    lastArg.apply(event, arguments)
                } catch (error) {
                    deleteEvent(error)
                }
            }
            var lastArg = arguments[arguments.length - 1];
            if ("function" != typeof lastArg) throw new TypeError("Final argument must be a callback function");
            for (var i = 0; i < arguments.length - 1; i++) {
                var arg = arguments[i];
                event.on(arg, handler), eventHandlers.push({
                    eventName: arg,
                    callback: handler
                })
            }
        }
        var eventHandlers = [];
        callback = callback || function() {}
        init.done = deleteEvent
        return init
    }
    e.exports = main
}