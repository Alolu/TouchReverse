function xhrChunk(config, currChunk) /* INDEX : 194 */{
    function loadScript(url, callback) {
        var headElem = document.getElementsByTagName("head")[0],
            scriptWrapper = document.createElement("script");
        scriptWrapper.onload = function() {
            this.onload = null
            this.onerror = null
            return callback()
        }
        scriptWrapper.onerror = function() {
            this.onload = null
            this.onerror = null
            return callback(new Error("Error loading script: " + url))
        } 
        scriptWrapper.type = "text/javascript"
        scriptWrapper.src = url
        headElem.appendChild(scriptWrapper)
    }

    function loadJson(url, callback) {
        var xhr = new XMLHttpRequest;
        xhr.overrideMimeType("application/json")
        xhr.onreadystatechange = function() {
            if (4 === ~~xhr.readyState) {
                if (xhr.onreadystatechange = null, 200 !== ~~xhr.status) return callback(new Error("Error loading json: " + url));
                var response;
                try {
                    response = JSON.parse(xhr.responseText)
                } catch (error) {
                    return callback(error)
                }
                return callback(null, response)
            }
        }
        xhr.open("GET", url, true)
        xhr.send(null)
    }
    config.exports.loadScript = loadScript
    config.exports.loadJson = loadJson
}