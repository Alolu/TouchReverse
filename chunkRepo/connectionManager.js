function connectionManager(config, currChunk, chunkReader) /* INDEX : 210 */{
    function emitFirstMessage(msgList) {
        if (0 !== msgList.length && !m) {
            var firstMsg = msgList.shift();
            setTimeout(function() {
                emitFirstMessage(msgList) 
                currChunk.emit(firstMsg._messageType, firstMsg)
            }, 0)
        }
    }
    
    var EventManager = chunkReader(195).EventEmitter,
        s = chunkReader(197),
        a = chunkReader(211).monitor;
    currChunk = config.exports = new EventManager, 
    currChunk.setMaxListeners(0);

    var PrimusConnection, 
    opened, 
    c, 
    packetList, 
    u, 
    connecting, 
    p, 
    m, 
    f, 
    numberG = 20000,
        options = {
            BasicLatencyStatsMessage: true,
            BasicPingMessage: true
        },
        v = [],
        y = 0,
        messageList = [],
        lockedMessage = false;

    currChunk.lockMessages = function() {
        lockedMessage = true
    }

    currChunk.lastReceivedMessage = null

    currChunk.unlockMessages = function() {
        if (lockedMessage !== false) {
            lockedMessage = false
            var messageListCopy = messageList.slice(); //Copie
            emitFirstMessage(messageListCopy)
            messageList.length = 0
        }
    }, 
    currChunk.connect = function(address) {
        if (PrimusConnection) return PrimusConnection.destroy(), PrimusConnection = null, setTimeout(function() {
            currChunk.connect(address)
        }, 0);
        var Primus = window.Primus,
            retries = window.Config.maxReconnectionAttempt || 10;
        p = false, 
        m = false, 
        f = null, 
        c = true, 
        opened = false, 
        connecting = true, 
        PrimusConnection = new Primus(address, {
            manual: true,
            strategy: "disconnect,timeout",
            reconnect: {
                max: 5000,
                min: 500,
                retries: retries
            }
        }), 
        a.startListening(), 
        PrimusConnection.on("open", function() {
            if (PrimusConnection !== this) return console.warn("onOpen - Ignoring event: possible missing call to Primus#destroy");
            if (p = false, currChunk.emit("open", opened), opened && packetList && Date.now() < u) {
                for (var e = {}, counter = 0, instructions = {}, index = 0; index < packetList.length; index++) {
                    var packet = packetList[index];
                    if ("message" === packet.type) {
                        try {
                            var data = JSON.parse(packet.data);
                            if ("sendMessage" !== data.call) {
                                instructions["call-" + data.call] = 1;
                                continue
                            }
                            var dataType = data.data.type;
                            if (options[dataType]) continue;
                            counter++
                            e[dataType] = 1
                        } catch (error) {
                            console.error("Message to be resent is not JSON: " + packet.data.toString()
                                .substring(0, 100))
                        }
                        PrimusConnection.socket.write(packet.data, packet.options)
                    } else instructions[packet.type] = 1
                }
                counter && 
                    console.error("Resent " + packetList.length + " previously unsent messages. Types: {" + Object.keys(e)
                        .join(",") + "} Skipped: {" + Object.keys(instructions)
                        .join(",") + "}")
            }
            packetList = null
            opened = true
        }), 
        PrimusConnection.on("offline", function() {
            connecting && 
                (connecting = false, c && 
                    currChunk.emit("offline")
                )
        }), 
        PrimusConnection.on("online", function() {
            return PrimusConnection !== this ? 
                console.warn("onOnline - Ignoring event: possible missing call to Primus#destroy") 
                : 
                void(connecting || (
                    connecting = true, 
                    c && (currChunk.emit("online"), 
                    PrimusConnection.readyState !== Primus.CLOSED || PrimusConnection.recovery.reconnecting() || window.setTimeout(function() {
                        PrimusConnection.readyState !== Primus.CLOSED || PrimusConnection.recovery.reconnecting() || PrimusConnection.open()
                    }, 0))
                ))
        }), 
        PrimusConnection.on("end", function() {
            connecting && (PrimusConnection = null, p ? f && currChunk.connect(f) : (c = !1, currChunk.disconnect("SOCKET_LOST")))
        }), 
        PrimusConnection.on("reconnect scheduled", function(i) {
            if (packetList = null, s.isFeatureOn("decoRecoResend")) {
                var n = c && PrimusConnection.socket && PrimusConnection.socket.writeBuffer;
                n && n.length && (packetList = n, u = Date.now() + numberG)
            }
            currChunk.emit("reconnecting", i.attempt, address)
        }), 
        PrimusConnection.on("data", function(e) {
            if (!m)
                if (a.receiving(), "SequenceStartMessage" === e._messageType && (y += 1), y > 0) {
                    if (v.push(e), "SequenceEndMessage" === e._messageType && (y -= 1, y <= 0)) {
                        var i = {
                            _messageType: "messageSequence",
                            sequence: v
                        };
                        lockedMessage ? messageList.push(i) : currChunk.emit("messageSequence", i), v = [], y = 0
                    }
                } else currChunk.emit("data", e), currChunk.lastReceivedMessage = e._messageType, lockedMessage ? messageList.push(e) : currChunk.emit(e._messageType, e)
        }), 
        PrimusConnection.on("error", function(errr) {
            currChunk.emit("error", errr)
        }), 
        PrimusConnection.open()
    }, currChunk.close = function() {
        p = !0, c = !1, packetList = null, PrimusConnection && (PrimusConnection.destroy(), PrimusConnection = null)
    }, currChunk.switchToGame = function(e) {
        currChunk.disconnect("SWITCHING_TO_GAME"), f = e
    }, currChunk.disconnect = function(e) {
        m || (e = e || "CLIENT_CLOSING", console.info("connectionManager.disconnect: reason=" + e), "SOCKET_LOST" !== e && PrimusConnection && (currChunk.send("disconnecting", e), p = !0), "SWITCHING_TO_GAME" !== e && (m = !0, currChunk.close(), currChunk.emit("disconnect", e)))
    }, currChunk.sendMessage = function(e, i) {
        currChunk.send("sendMessage", {
            type: e,
            data: i
        })
    }, currChunk.send = function(e, i) {
        if (!PrimusConnection) return console.warn("Client trying to send while primus is null for call: " + e);
        a.sending(e, i);
        var n = {
            call: e,
            data: i
        };
        PrimusConnection.write(n), currChunk.emit("send", {
            call: e,
            data: n
        }), currChunk.emit("send:" + e, n)
    }
}