var async = require("./async")
, xhrChunk = require("./xhrChunk")
, eventManager = require("./eventManager")

function main(config, currChunk, chunkReader) /* INDEX : 193 */{
    function getUrl(server) {
        if (!window.Config.sessionId) return console.warn("Cannot make URL sticky (no session ID has been set):", server), server;
        var separator = server.indexOf("?") === -1 ? "?" : "&";
        return server + separator + urlScheme + "=" + encodeURIComponent(window.Config.sessionId)
    }

    function getServer() {
        var appInfo = window.appInfo || {};
        return appInfo.server ? 
            appInfo.server 
            : 
            "https://proxyconnection.touch.dofus.com"
    }

    function getGameServer(id) {
        for (var t = 0; t < serverList.length; t += 1) {
            var gameserver = serverList[t];
            if (gameserver.id === id) return gameserver
        }
    }

    function getConfig(langage, callback) {
        var object = {};
        langage && (object.lang = langage);
        var url = getServer() + "/config.json?" + E.stringify(object);
        xhrChunk.loadJson(url, function(response, data) {
            return response ? 
                callback(response) 
                : 
                (data.imgCrossOrigin = data.assetsUrl.match(/^https?:\/\/.+?:.+?@.+?/) ? 
                    void 0 
                    : 
                    "anonymous", void callback(null, data))
        })
    }

    function initClient(langage, callback) {
        async.auto({
            primus: function(callback) {
                return window.Primus ? 
                    callback() 
                    : 
                    void xhrChunk.loadScript(getServer() + "/primus/primus.js", callback)
            },
            config: function(callback) {
                return window.Config ? 
                    langage ? 
                        currChunk.setLanguage(langage, callback) 
                        : 
                        callback() 
                    : 
                    void getConfig(langage, function(response, data) {
                        return response ? 
                            callback(response) 
                            : 
                            (window.Config = data, void callback())
                    })
            },
            syncSetup: ["config", function(callback) {
                loggerChunk.setup(window.Config)
                v.initialize(window.Config)
                callback()
            }],
            getText: ["syncSetup", function(callback) {
                y.initialize(window.Config, callback)
            }]
        }, callback)
    }

    function enableSound() {
        SoundManager.setupChannels(storage.getValue("soundPreferences", {}, true))
        SoundManager.playLoopSound("music", "20000", .8)
    }

    function disableSound() {
        SoundManager.stopAllLoopSounds()
        SoundManager.release()
    }

    //reload après 30 secondes
    function reload() {
        window.gui.splashScreen.show()
        return window.setTimeout(function() {
            window.gui.splashScreen.hide()
            window.location.reload()
        }, 30000)
    }

    function createSrvPostData(serverData) {
        var srvPostData = {
            language: window.Config ? window.Config.language : "en",
            server: serverData,
            client: hostInfo.os,
            appVersion: versionCheck,
            buildVersion: buildVersion
        };
        return srvPostData
    }

    var async = async(), //chunkReader(31)
        xhrChunk = xhrChunk(), //chunkReader(194),
        EventManager = EventManager()//chunkReader(195)
        .EventEmitter,
        
        loggerChunk = chunkReader(196),
        connectionManager = chunkReader(210),
        storage = chunkReader(183),
        v = chunkReader(30),
        y = chunkReader(29),
        b = chunkReader(212);
    chunkReader(219);
    var M = chunkReader(314),
        w = chunkReader(315),
        SoundManager = chunkReader(254), //A revoir lol
        C = chunkReader(316),
        socketManager = chunkReader(317), //A renommer
        I = chunkReader(7),
        S = chunkReader(318),
        E = chunkReader(38),
        hostInfo = chunkReader(175); //A revoir lol
    window.developmentMode && chunkReader(319)
    var urlScheme = "STICKER",
        versionCheck = window.appInfo && window.appInfo.version,
        buildVersion = window.buildVersion;

    currChunk = config.exports = new EventManager 
    currChunk.logger = loggerChunk
    currChunk.connectionManager = connectionManager
    currChunk.sessionId = null
    var serverList = [], 
    disconnected = false;

    //Set le langage, le deuxieme param reste a determiner...
    currChunk.setLanguage = function(langage, callback) {
        if (!window.Config || langage && window.Config.language === langage) return callback();
        var address = getServer() + "/getLanguage.json?lang=" + langage;
        xhrChunk.loadJson(address, function(e, i) {
            return e ? 
                callback(e) 
                : 
                (window.Config.language = i.language, void callback())
        })
    }

    currChunk.start = function() {
        window.gui.initialize();
        var langage = storage.getValue("lang");
        initClient(langage, function(error) {
            I.init(null)
            S.initialize(window.Config.adjust)
            b.backToLogin()
            window.gui.initialize(window.Config)
            return error ? 
                currChunk.reloadAppOnFatalError(error) 
                : 
                void window.isoEngine.initialize()
        })
    }
    currChunk.reloadAppOnFatalError = function(error, reason) {
        reason = reason || "Server busy"
        console.error("Reloading on fatal error: " + error)
        navigator.notification ? 
            navigator.notification.alert(reason, reload, "Dofus Touch", "Reload") 
            : 
            (window.alert(reason), reload())
    }

    var AccessedServer, UNLOGGED = 0,
        LOGGING = 1,
        LOGGED = 2,
        ACCESSING_SERVER = 3,
        SWITCHING = 4,
        state = UNLOGGED,
        loginInfo = {
            username: null,
            token: null,
            salt: null,
            key: null
        }
    
    currChunk.setCredentials = function(username, token) {
        storage.setValue("token", token), loginInfo.username = username, loginInfo.token = token, loginInfo.salt = null, loginInfo.key = null
    }
    
    currChunk.login = function(callback) {
        if (state === LOGGED) {
            console.warn("Already logged in")
            return callback()
        } 
        if (state === LOGGING) {
            console.warn("Already logging in")
            return currChunk.once("loginEnd", callback)
        }  
        state === SWITCHING && connectionManager.disconnect("SWITCHING_TO_LOGIN")
        state = LOGGING
        loginInfo.salt = null
        loginInfo.key = null
        disconnected = false;
        var socket = socketManager(connectionManager, function(error) {
            error ? 
                (this.disconnect("LOGIN_ERROR"), state = UNLOGGED, currChunk.emit("loginEnd", error)) 
                : 
                (state = LOGGED, currChunk.emit("loginEnd"))
            callback(error)
        });
        socket("disconnect", function() {
            disconnected = true
            throw new Error("Disconnect during login")
        })
        socket("open", function() {
            this.send("connecting", createSrvPostData("login"))
        })
        socket("serverDisconnecting", function(response) {
            disconnected || (disconnected = true, socket.done(response))
        })
        socket("ProtocolRequired", function(response) {
            console.log("[Login server protocol] requiredVersion:", response.requiredVersion, "currentVersion:", response.currentVersion)
        })
        socket("HelloConnectMessage", function(response) {
            loginInfo.salt = response.salt
            loginInfo.key = response.key
            var thisSocket = this
            w.getVersions(function(error, version) {
                return error ? 
                    socket.done(error) 
                    : 
                    void thisSocket.send("checkAssetsVersion", version)
            })
        })
        socket("assetsVersionChecked", function(response) {
            var thisSocket = this;
            w.upgradeAssets(response, function(response) {
                return response ? 
                    socket.done(response) 
                    : 
                    void thisSocket.send("login", loginInfo)
            })
        })
        socket("IdentificationSuccessMessage", "IdentificationSuccessWithLoginTokenMessage", function(response) {
            var loginName = window.gui.playerData.loginName;
            if (loginName) {
                if (/^\[GUEST]/.test(loginName)) {
                    if (window.Config.disabledFeatures.guest) return socket.done(new Error("identification: no guests"));
                    var guest = storage.getValue("guestAccount", {}, true);
                    guest.nickname = response.nickname
                }
            } else console.error("dofus.login: loginName is empty");
            storage.setAccount(response.nickname)
            storage.setValue("token", response.loginToken)
            enableSound()
            C.start()
            response.wasAlreadyConnected && currChunk.emit("wasAlreadyConnected")
        })
        socket("ConnectionFailedMessage", "IdentificationFailedMessage", "IdentificationFailedForBadVersionMessage", "IdentificationFailedBannedMessage", function(response) {
            socket.done(response)
        })
        
        socket("ServersListMessage", function(response) {
            serverList = response.servers
            socket.done()
        })
        
        connectionManager.connect(getUrl(getServer()))
    }
    
    currChunk.accessGameServer = function(gameServer, callback) {
        if (state === LOGGING) return currChunk.once("loginEnd", function(alreadyInGameServer) {
            return alreadyInGameServer ? 
                callback(alreadyInGameServer) : 
                void currChunk.accessGameServer(gameServer, callback)
        });
        if (state === ACCESSING_SERVER) return gameServer === AccessedServer ? 
            (console.warn("Already accessing this game server (" + gameServer + ")"), currChunk.once("accessGameEnd", callback)) 
            : 
            callback(new Error("Already accessing game server " + AccessedServer + " (while trying to access " + gameServer + ")"))

        if (AccessedServer = gameServer, state !== LOGGED) return currChunk.login(function(error) {
            return error ? 
                callback(error) 
                : 
                void currChunk.accessGameServer(gameServer, callback)
        });
        var ticket, address, port, selectedServer = getGameServer(gameServer);
        if (!selectedServer) return callback(new Error("Unknown server: " + gameServer));
        state = ACCESSING_SERVER;
        var socket = socketManager(connectionManager, function(error) {
            error ? 
                (this.disconnect("GAME_HANDSHAKE_ERROR"), state = UNLOGGED, currChunk.emit("accessGameEnd", error)) 
                : 
                (state = SWITCHING, currChunk.emit("accessGameEnd"))
            AccessedServer = null
            callback(error)
        });

        socket("SelectedServerDataMessage", function(server) {
            ticket = server.ticket
            address = server.address 
            port = server.port
            connectionManager.switchToGame(getUrl(server._access))
        }) 
        socket("SelectedServerRefusedMessage", function(server) {
            throw new Error("Server " + gameServer + " not accessible: " + server.error)
        }) 
        socket("open", function() {
            this.send("connecting", createSrvPostData({
                address: address,
                port: port,
                id: gameServer
            }))
        }) 
        socket("serverDisconnecting", function(server) {
            socket.done(server)
        }) 
        socket("ProtocolRequired", function(server) {
            console.log("[Game server protocol] requiredVersion:", server.requiredVersion, "currentVersion:", server.currentVersion)
        }) 
        socket("HelloGameMessage", function() {
            this.sendMessage("AuthenticationTicketMessage", {
                ticket: ticket,
                lang: window.Config.language
            })
        })
        socket("AuthenticationTicketAcceptedMessage", function() {
            socket.done()
        }) 
        socket("AuthenticationTicketRefusedMessage", function() {
            throw new Error("Server " + gameServer + " Authentication failed")
        }) 
        connectionManager.sendMessage("ServerSelectionMessage", {
            serverId: gameServer
        })
    }
    connectionManager.on("HelloConnectMessage", function() {
        window.gui.connectionSplashScreen.onStateChange("CONNECTED")
    })
    connectionManager.on("offline", function() {
        window.gui.connectionSplashScreen.onStateChange("UNSTABLE")
    })
    connectionManager.on("reconnecting", function(retryNumber, server) {
        console.info("Reconnecting to " + server + " (attempt #" + retryNumber + ")"), window.gui.connectionSplashScreen.onStateChange("RECONNECTING", retryNumber)
    })
    connectionManager.on("open", function(server) {
        server && connectionManager.send("reconnecting")
    })
    connectionManager.on("sessionReconnected", function() {
        return window.isoEngine.onQuickReconnection(function() {
            window.gui.connectionSplashScreen.onStateChange("CONNECTED")
        })
    })
    connectionManager.on("sessionTimedOut", function() {
        console.info("Session timed out"), connectionManager.disconnect("SESSION_TIMED_OUT")
    })
    connectionManager.on("serverDisconnecting", function(error) {
        console.info("Server disconnecting, reason:", error.reason)
        connectionManager.disconnect("SOCKET_LOST")
    })
    connectionManager.on("disconnect", function(currentState) {
        currentState = UNLOGGED, currentState.match(/^SWITCHING_/) || (
            disableSound(), 
            C.stop(), 
            window.gui.disconnect(currentState), 
            window.isoEngine.disconnect(), 
            window.gui.connectionSplashScreen.onStateChange("RELOAD" === currentState ? 
                "RELOADING" 
                : 
                "DISCONNECTED"
            )
        )
    })
    currChunk.toggleTutorialListeners = function(e) {
        e ? M.setTutorialListeners(connectionManager) : M.removeTutorialListeners(connectionManager)
    }
    currChunk.send = function(e, t) {
        connectionManager.send(e, t)
    }
    currChunk.sendMessage = function(e, t) {
        connectionManager.sendMessage(e, t)
    }
    currChunk.disconnect = function(e) {
        connectionManager.disconnect(e)
    }
    window.addEventListener("beforeunload", function() {
        connectionManager.disconnect("RELOAD")
    })
}

module.exports = main;