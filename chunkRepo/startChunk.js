mainChunk = require("./mainChunk")

function start(config, currChunk, chunkReader) /* INDEX : 0 */ {
    function wizAssetsCheck(checkGLWeb) {
        return window.wizAssets && window.wizAssets.initialize ?
            void window.wizAssets.initialize(checkGLWeb, function () {
                console.error("failed to init wizAssets"),
                    window.wizAssets = null,
                    checkGLWeb()
            })
            :
            checkGLWeb()
    }

    function checkWebGL() {
        if (d.isWebGlSupported()) {
            var e = chunkReader(1229);
            window.isoEngine = new e, window.actorManager = window.isoEngine.actorManager, window.background = window.isoEngine.background
        }
        window.dofus.start()
    }

    chunkReader(3) //Action a determiner
    chunkReader(4) //Action a determiner
    chunkReader(5) //Action a determiner
    chunkReader(6) //Action a determiner
    var platform = chunkReader(7) //En rapport avec "wKpi"
    appInfo = chunkReader(175) //AppInfo, pas encore sur mais de grande chance que ca soit pour la config.json
    window.developmentMode = false
    window.buildVersion = "1.30.9"
    window.location.search
        .slice(1)
        .split(";")
        .map(function (link) {
            var linkParts = link.split("=");
            switch (linkParts[0]) {
                case "appVersion":
                    window.appInfo = window.appInfo || {}
                    window.appInfo.version = linkParts[1]
            }
        }),

    appInfo.isAndroid && window.MobileAccessibility && window.MobileAccessibility.usePreferredTextZoom(!1)
    window.assetPreloader = chunkReader(189)
    window.dofus = mainChunk() //Fonction main A INVESTIGER, CONTIENT LE WEBSOCKET
    var mainDiv = document.createElement("div");
    mainDiv.id = "dofusBody"
    document.body.appendChild(mainDiv);

    var ForegroundManager = chunkReader(320), 
        GuiManager = chunkReader(436)

    window.gui = new GuiManager
    window.foreground = new ForegroundManager

    var d = chunkReader(405), browser = window.chrome;
    "object" == typeof browser && browser.system && browser.system.memory && appInfo.isPhoneGap ?
        browser.system.memory.getInfo(
            function (info) {
                appInfo.capacity = info.capacity
                wizAssetsCheck(checkWebGL)
            }
        )
        :
        wizAssetsCheck(checkWebGL)

    appInfo.isCordova ?
        appInfo.isAndroid ?
            window.cordova && window.cordova.plugins && window.cordova.plugins.isemulator ?
                window.cordova.plugins.isemulator.assess(
                    function (e) {
                        platform.wKpi.sendPlatform(e ? "emulator" : "device")
                    }, function (e) {
                        console.error("cordova.plugins.isemulator.assess failed: " + e)
                    }
                )
                :
                console.error("cordova.plugins.isemulator plugin missing")
            :
            platform.wKpi.sendPlatform("device")
        : platform.wKpi.sendPlatform("browser")
}