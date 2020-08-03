var fs = require('fs')
var fileToModify = "chunkscopy.js"
var contentToBeModified,buffer = []

fs.readFile(fileToModify,'utf8',(err,data)=>{
    if(err) throw err
    contentToBeModified = data;
    transformFile(data)
})

function transformFile(file){
    console.log("Transforming file :")
    console.log("->Total length : ",file.length)
    let pile = []
    let insideString = false
    let insideRegex = false
    let insideQuote = false

    let regexPile = []
    let regexCache = ""

    for(i = file.length; i >= 0; i--){
        let char = file[i]
        regexBuffering = false

        if(char == "/" && file[i-1] != "\\" && insideRegex && !insideString && !insideQuote) {
            regexPile.push(regexCache)
            regexCache = ""
            insideRegex = false
            regexBuffering = true
        }

        if(char == "'" && !insideString && !insideRegex) insideQuote = !insideQuote
        if(char == '"' && !insideQuote && !insideRegex) insideString = !insideString
        if( 
            ["/i","/g","/)","/,","/."].includes(char + file[i+1]) && 
            !insideQuote && 
            !insideString && 
            !insideRegex &&
            !regexBuffering
        ) {
            console.log(char + file[i+1] + file[i+2])
            console.log(insideRegex)
            insideRegex = true
        }

        if(insideRegex) regexCache += char

        

        if(!insideString && !insideQuote && !insideRegex){
            switch(char){
                case "}":
                    pile.push(i)
                    break
                case "{":
                    pile.pop()
                    if(pile.length == 0) addCountToBuffer(i)
                    break
            }
        }
        
    }
    console.log(regexPile)
    modifyContent()

    //Afficher la pile avec les characteres autour
    fs.writeFile("test.js",contentToBeModified,(err)=>{
        if(err) throw err
        console.log("done :)")
        if(pile.length > 0){
            console.log("pile restante : " + pile)
            console.log("Chars autour du premier element :")
            
            startLookup = pile[0] - 25
            endLookup = pile[0] + 25
            container = ""

            for(y = startLookup; y <= endLookup; y++){
                container += file[y]
            }

            console.log(container)
        }
    })
}

function addCountToBuffer(i){
    buffer.unshift(i)
    console.log(`Index ${i} saved to buffer`)
}

function modifyContent(){
    for(t = buffer.length - 1; t >= 0; t--){
        console.log(`Writing function ${t} at index ${buffer[t]}`)
        contentToBeModified = contentToBeModified.slice(0,buffer[t]) + `/* INDEX : ${t} */` + contentToBeModified.slice(buffer[t])
    }
}