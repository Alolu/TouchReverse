EventManager = require("./chunkRepo/eventManager")

!function(mainFunc) {
    function chunkReader(i) {
        //Un chunk est un singleton
        if (object[i]) return object[i].exports;
        //object est scopé de manière globale
        var config = object[i] = {
            exports: {},
            id: i,
            loaded: false
        };
        return mainFunc[i].call(
            config.exports, //? Substituted var
            config, //? config (arg1)
            config.exports, //? current object (arg2)
            chunkReader //?chunkReader (arg3)
        ),
        config.loaded = true, 
        config.exports
    }
    var object = {};
    return chunkReader.main = mainFunc, 
    chunkReader.config = object, 
    chunkReader.string = "", 
    chunkReader(0)
}([
    function(config,currChunk,chunkReader){
        chunkReader(3)
    },
    EventManager,
    function(config,currChunk,chunkReader){
        var em = chunkReader(1).EventEmitter
        currChunk = config.exports = new em

        config.exports.on("test",function(){
            console.log("test")
        })
    },
    function(config,currChunk,chunkReader){
        v = chunkReader(2)
        v.emit("test")
    }
]);
//# sourceMappingURL=script.js.map