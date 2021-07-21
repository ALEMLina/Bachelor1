let popups = document.querySelectorAll('*[id^="popup"]')
let checks = document.querySelectorAll('*[id^="check"]')
let cards = document.querySelectorAll('.card')
let cardContainer = document.querySelector('#cards')
let dateLoc = document.querySelectorAll('.dateLocation')
let descs = document.querySelectorAll('.description')
let close = document.querySelectorAll('a.close')
let membres = document.querySelectorAll('.txt p')
let searchChild = document.querySelectorAll('#search *')
let searchDiv = document.querySelector('#search')
let triInput = document.querySelectorAll('#tri li input')
let order = document.querySelectorAll('#ordre input[type=radio]')
let tri = document.querySelector('#tri')
let retour = document.querySelector('#return')
let ref = document.querySelector('#ref')
let globdata = document.querySelector('#globdata')
let btnsearch = document.querySelector('#btnSearch')
let datalist = document.querySelector('#search-list')
let header = document.querySelector("header")
let maps = []
let data
let dataGlobal
let index

let x1 = .6
let y1 = -.5
let x2 = .4
let y2 = 1.2

let totop = document.getElementById("toTop")
window.onscroll = () => {
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
        totop.style.opacity = "1";
        setTimeout(function() {
            totop.style.cursor = "pointer"
        }, 500);
    } else {
        totop.style.opacity = "0";
        setTimeout(function() {
            totop.style.cursor = "default"
        }, 500);
    }
};

window.addEventListener('load',async () => { // Au chargement de la pasge récupération du JSON des villes (longitude + latitude)
    data = await fetch('./static/locations.json').then((response) => response.json())
    init()
})

window.addEventListener('load', () => { // Au chargement de la page, récupération des données envoyée depuis GO + insertion des données dans un tableau
    let regex = /{([0-9]+) [a-z0-9.-\/:]+ ((?:[a-z0-9.\\']+ ?)+) (\[ ?([a-zÀ-ÖØ-öø-ÿčć"'.\\-]+[ ?]*)+\]) ([0-9]{4}) ([0-9-]+) ([a-z0-9\[\]: _-]+)} ? ?/gi
    dataGlobal = [...(globdata.innerText).matchAll(regex)];
    
    for(i in dataGlobal) {
        let temp = (dataGlobal[i][7] + " ").slice(4,-2)
        let arr = temp.slice(0, -1).split("] ")
        dataGlobal[i][7] = []
        for (truc of arr) {
            dataGlobal[i][7][truc.split(":map[")[0]] = (truc.split(":map[")[1].split(new RegExp(' ?[0-9]+:')).slice(1))
        }
        temp = membres[i].innerText.split(": ")[1]
        if (temp) {
            dataGlobal[i][3] = temp.split(" | ")
        } else {
            dataGlobal[i][3] = [dataGlobal[i][3].slice(1, -1)]
        }
    }
    globdata.innerText = ""

})
window.addEventListener('load', () => { // Au chargement de la page
    let temp = document.querySelectorAll("#top > li > input[id^='checkbox']")
    for (elem of order){
        if(elem.checked){
            elem.checked = false
            break
        }
    }
    for (elem of triInput){
        if(elem.checked){
            elem.checked = false
            break
        }
    }
    for (elem of temp){
        if(elem.checked){
            elem.checked = false
        }
    }
}) 

retour.addEventListener('click', (ev) => { // Event de click en dehors du popup pour le faire disparaître
    let X = document.getElementById((document.location.href).split("#")[1]).children[0]
    retour.style.display = "none"
    X.style.right = ''
    document.location.href="#"
})

btnsearch.addEventListener('click', () => { // Changement d'animation + animation header (recherche)
    if(btnsearch.dataset.mode == "l"){
        let incre = 415
        let elem = document.querySelectorAll("#top [id^='checkbox']")
        for (i in elem) {
            if(0 == i && i >= 4) {
                continue
            } 
            if (elem[i].checked) {
                incre += 60
            }
        }
        btnsearch.dataset.mode = "c"

        header.style.height = incre+"px"
        header.style.transition = "height .75s cubic-bezier("+ (1-x2) +","+ (1-y2) +","+ (1-x1) +","+ (1-y1) +")";
        
        btnsearch.children[0].style.opacity = "0"
        btnsearch.children[1].style.opacity = "1"

        btnsearch.style.left = "calc(98% - 50px)"
        searchDiv.style.display = "flex"
        setTimeout(function() {
            searchDiv.style.opacity = "1"
        }, 50);
    }
    else if(btnsearch.dataset.mode == "c"){
        searchDiv.style.opacity = "0"
        setTimeout(function() {
            searchDiv.style.display = "none"
        }, 550);
        btnsearch.dataset.mode = "l"

        header.style.height = "170px"
        header.style.transition = "height .75s cubic-bezier("+ x1 +","+ y1 +","+ x2 +","+ y2 +")";
        
        btnsearch.children[0].style.opacity = "1"
        btnsearch.children[1].style.opacity = "0"

        btnsearch.style.left = "calc((100% - 50px) / 2)"
    }
})

for (val of dateLoc){ // Remplissage du tableau pour les Maps
    let temp = (val.dataset.txt.slice(4,-1)) + " "
    let arr = (temp.split("] ")).slice(0, -1)
    let tab = []
    for (truc of arr) {
        tab[truc.split(":map[")[0]] = (truc.split(":map[")[1].split(new RegExp(' ?[0-9]+:')).slice(1))
    }
    maps.push(tab)
}

for(croix of close){ // Ajout events de click sur la croix du popup pour le faire disparaître
    let id = croix.id
    croix.addEventListener('click',() => {
        close[id-1].style.right = ''
        retour.style.display = "none"
        document.location.href="#card"+id
    })
}

function diff(a,b){ // Calcul de la différence entre 2 nombres
    return a>b ? a-b : b-a
}

function init(){ // à l'initialisation : ajout des eventListener pour le click / mouseover / moouseout sur les cards
    for(let i=0; i<cards.length; i++){
        cards[i].addEventListener('click', () => {
            // ================================================================================ MAP
            let desc = descs[i]
            if(!desc.dataset.map) {
                let mapdiv = document.createElement("div")
                let map = document.createElement("div")
                let script = document.createElement("script")
                let maxY = 0
                let maxX = 0
                let minX = 0
                let minY = 0
                let count = 0
                let markers = ""
                let difX = 0
                let difY = 0
                mapdiv.classList.add("mapdiv")
                map.id = "map"+i
                let loc = document.createElement("ul")
                for (j in maps[i]){
                    if (count === 0) {
                        maxY = data[j][0]
                        maxX = data[j][1]
                        minX = data[j][1]
                        minY = data[j][0]
                    } else {
                        if (maxX < data[j][1]){maxX = data[j][1]}
                        if (minX > data[j][1]){minX = data[j][1]}
                        if (maxY < data[j][0]){maxY = data[j][0]}
                        if (minY > data[j][0]){minY = data[j][0]}
                    }
                    count++
                    markers += "var marker = new mapboxgl.Marker().setLngLat([" + data[j][0] + ", " + data[j][1] + "]).addTo(map);"
                    // ===================================================================
                    
                    let liste1 = document.createElement("li")
                    let tab = j.split("-")
                    let town = tab[0].split("_")
                    let pays = tab[1].split("_")
                    let txt = ""
    
                    for (ind in town){
                        let val = town[ind]
                        town[ind] = [val.slice(0, 1).toUpperCase(), val.slice(1)].join("")
                    }
                    txt += town.join(" ")
    
                    txt += " ("
                    for (ind in pays){
                        let val = pays[ind]
                        pays[ind] = [val.slice(0, 1).toUpperCase(), val.slice(1)].join("")
                    }
                    txt += pays.join(" ")
                    txt += ") :"
                    liste1.innerText = txt
                    let date = document.createElement("ul")
                    for(k of maps[i][j]) {
                        let liste2 = document.createElement("li")
                        liste2.innerText = k
                        date.append(liste2)
                    }
                    liste1.append(date)
                    loc.append(liste1)
                }
                dateLoc[i].append(loc)
    
                difX = diff(minX, maxX)
                difY = diff(minY, maxY)
                difX = difX * 3 / 100 
                difY = difY * 3 / 100 
                minY -= difY
                minX -= difX
                maxY += difY
                maxX += difX * 3
                script.innerHTML = "mapboxgl.accessToken = 'pk.eyJ1IjoiY3JlYW5pY3MiLCJhIjoiY2tuZm56czM3MnhlYjJ4bnh2eGc3aGtkaCJ9.SRvcvkHoMpxaLFPjBCMNFg';var map = new mapboxgl.Map({container: 'map" + i + "',style: 'mapbox://styles/mapbox/streets-v11', bounds: [["+minY+","+minX+"],["+maxY+","+maxX+"]]});"
                script.innerHTML += markers
                mapdiv.append(map)
                desc.append(mapdiv)
                desc.append(script)
                
                desc.dataset.map = "1"
            }
            // -----------------------------------------------------------------------------
            setTimeout(function() {
                document.getElementById("popup"+cards[i].dataset['id']).children[0].style.right = '5px'
                document.location.href="#popup"+cards[i].dataset['id']
                retour.style.display = "block"
              }, 400);
        })
        cards[i].addEventListener('mouseover', (ev) => {
            cards[i].classList.add("doubleHeight")
            let down = cards[i].getBoundingClientRect().top + 480
            let height = ref.getBoundingClientRect().height
            if(down > height - 10){
                let decal = down - height
                setTimeout(function() {
                    window.scrollBy(0,decal);
                }, 125);
            }
        })
        cards[i].addEventListener('mouseout', (ev) => {
            cards[i].classList.remove("doubleHeight")   
        })
    }
}

function search(){ // Recherche du terme demandé
    let input = document.querySelector('#research')
    let test = input.value

    if(document.getElementById("checkboxOne").checked){
        tamponSearch(test, fuzzyFind)
    }
    else{
        tamponSearch(test, StrictFind)
    }
}   

function tamponSearch(val, func){
    let count = 0
    let inSearch
    let id = []
    let cartes = document.getElementById('cards').children
    let count2 = 0
    let hide = true
    let exist = false
    let noResult = true
    let listElem = []
    let min = inputLeft[0].value
    let max = inputRight[0].value

    datalist.innerHTML = ""

    for (elem of document.getElementById("params").children) {
        if (count == 0) {
            count++
            continue
        }
        if (elem.children[0].checked) {
            inSearch = elem.children[0].value
            break
        }
    }
    
    for (donnee of dataGlobal) {
        if (inSearch == 72) {
            for (j in donnee[7]) {
                for(h in donnee[7][j]) {
                    if(func(val, donnee[7][j][h])){
                        id.push(donnee[1])
                        datalist.innerHTML += "<option value='" + donnee[7][j][h] + "'>" + donnee[7][j][h] + " - Date de Concert</option>"
                    }
                }
            }
        } else if (inSearch == 71) {
            for (j in donnee[7]) {
                if(func(val, j)) {
                    id.push(donnee[1])
                    if(listElem.length == 0){
                        listElem.push(j)
                        datalist.innerHTML += "<option value='" + j + "'>" + j + " - Localisation</option>"
                    }else{
                        for(li of listElem){
                            if(j == li){
                                exist = true
                                break
                            }
                        }
                        if(!exist){
                            datalist.innerHTML += "<option value='" + j + "'>" + j + " - Localisation</option>"
                            listElem.push(j)
                        }
                    }
                }
            }
        } else if (inSearch == 6) {
            if(func(val, donnee[6])) {
                id.push(donnee[1])
                datalist.innerHTML += "<option value='" + donnee[6] + ">" + donnee[6] + " - Premier Album'</option>"
            }
        } else if (inSearch == 2) {
            if(func(val, donnee[2])) {
                id.push(donnee[1])
                datalist.innerHTML += "<option value='" + donnee[2] + "'>" + donnee[2] + " - Groupe</option>"
            }else {
                for (n of donnee[3]) {
                    if (func(val, n)) {
                        id.push(donnee[1])
                        datalist.innerHTML += "<option value='" + n + "'>" + n + " - Membre</option>"
                    }
                }
            }
        }
    }

    for (i in cartes) {
        if(count2>=52) break
        hide = true
        for (j of id) {
            if (cartes[i].dataset.id == j) {
                if(!document.getElementById("checkboxFive").checked) {
                    if(!document.getElementById("checkbox12").checked) {
                        if(!document.getElementById("checkbox13").checked) {
                            hide = false
                            noResult = false
                            break
                        }else if(parseInt(inputLeft[1].value) <= parseInt(dataGlobal[i][3].length) && parseInt(dataGlobal[i][3].length) <= parseInt(inputRight[1].value)) {
                            hide = false
                            noResult = false
                            break
                        }
                    }else if(parseInt(inputLeft[2].value) <= parseInt(dataGlobal[i][6].split("-")[2]) && parseInt(dataGlobal[i][6].split("-")[2]) <= parseInt(inputRight[2].value)) {
                        if(!document.getElementById("checkbox13").checked) {
                            hide = false
                            noResult = false
                            break
                        }else if(parseInt(inputLeft[1].value) <= parseInt(dataGlobal[i][3].length) && parseInt(dataGlobal[i][3].length) <= parseInt(inputRight[1].value)) {
                            hide = false
                            noResult = false
                            break
                        }
                    }
                }else if(parseInt(inputLeft[0].value) <= parseInt(cartes[i].dataset.date) && parseInt(cartes[i].dataset.date) <= parseInt(inputRight[0].value)) {
                    if(!document.getElementById("checkbox12").checked) {
                        if(!document.getElementById("checkbox13").checked) {
                            hide = false
                            noResult = false
                            break
                        }else if(parseInt(inputLeft[1].value) <= parseInt(dataGlobal[i][3].length) && parseInt(dataGlobal[i][3].length) <= parseInt(inputRight[1].value)) {
                            hide = false
                            noResult = false
                            break
                        }
                    }else if(parseInt(inputLeft[2].value) <= parseInt(dataGlobal[i][6].split("-")[2]) && parseInt(dataGlobal[i][6].split("-")[2]) <= parseInt(inputRight[2].value)) {
                        if(!document.getElementById("checkbox13").checked) {
                            
                            hide = false
                            noResult = false
                            break
                        }else if(parseInt(inputLeft[1].value) <= parseInt(dataGlobal[i][3].length) && parseInt(dataGlobal[i][3].length) <= parseInt(inputRight[1].value)) {
                            hide = false
                            noResult = false
                            break
                        }
                    }
                }
            }
        }
        if(hide){
            cartes[i].style.display = "none"
        }else{
            cartes[i].style.display = "flex"
        }   
        count2++
    }

    if(noResult){
        document.getElementById("noResultDiv").style.display = "block" //affichage du petit bonhomme
    }else{
        document.getElementById("noResultDiv").style.display = "none"
    }
}

function StrictFind(val, txt){
    val = val.toLowerCase()
    txt = txt.toLowerCase()
    let count
    let len = val.length
    let j
    
    for(i=0; i < txt.length; i++) {
        count = 0
        if(txt[i] === val[0]) {
            for(j=0; j < len; j++) {
                if(txt[i+j] != val[j]) break
                count++
            }
            i += j
            if(count == len) break
        }
    }
    return count === len
}

function fuzzyFind(val, txt){
    val = val.toLowerCase()
    txt = txt.toLowerCase()
    let count = 0
    let len = val.length
    
    for(char of txt){
        if(char == val[count]){
            count++
            if(count == len){
                break
            }
        }
    }
    return count == len
}

function validateFilters(){
    let func
    let crit
    
    for (a of order) {
        if (a.checked) {
            func = a.value
        }
    }
    for (b of triInput) {
        if (b.checked) {
            crit = b.value
            break
        }
    }
    
    index = crit
    if (crit == 3) {
        if (func == "asc") {
            dataGlobal.sort(sortAscM)
        } else {
            dataGlobal.sort(sortDescM)
        }
    } else if (crit == 6){
        if (func == "asc") {
            dataGlobal.sort(sortAscDate)
        } else {
            dataGlobal.sort(sortDescDate)
        }
    }else{
        if (func == "asc") {
            dataGlobal.sort(sortAsc)
        } else {
            dataGlobal.sort(sortDesc)
        }
    }
    triCartes()
}
function sortAsc( a, b)
{
    var x = a[index].toLowerCase();
    var y = b[index].toLowerCase();
    return ((x < y) ? -1 : ((x > y) ? 1 : 0));
}
function sortDesc( a, b)
{
    var x = a[index].toLowerCase();
    var y = b[index].toLowerCase();
    return ((x > y) ? -1 : ((x < y) ? 1 : 0));
}

function sortAscDate( a, b)
{
    let tempx = (a[index].toLowerCase()).split("-")
    let tempy = (b[index].toLowerCase()).split("-")
    var x = new Date(tempx[2]+'-'+tempx[1]+'-'+tempx[0])
    var y = new Date(tempy[2]+'-'+tempy[1]+'-'+tempy[0])
    return ((x < y) ? -1 : ((x > y) ? 1 : 0))
}
function sortDescDate( a, b)
{
    let tempx = (a[index].toLowerCase()).split("-")
    let tempy = (b[index].toLowerCase()).split("-")
    var x = new Date(tempx[2]+'-'+tempx[1]+'-'+tempx[0])
    var y = new Date(tempy[2]+'-'+tempy[1]+'-'+tempy[0])
    return ((x > y) ? -1 : ((x < y) ? 1 : 0))
}

function sortAscM( a, b)
{
    var x = a[index].length;
    var y = b[index].length;
    return ((x < y) ? -1 : ((x > y) ? 1 : 0));
}
function sortDescM( a, b)
{
    var x = a[index].length;
    var y = b[index].length;
    return ((x > y) ? -1 : ((x < y) ? 1 : 0));
}

function triCartes(){
    let tempCard = cards
    cardContainer.innerHTML = ""
    for (elem of dataGlobal) {
        for (carte of tempCard) {
            if (carte.dataset.id == elem[1]) {
                cardContainer.append(carte)
            }
        }
    }
}

function toggleActive(name, idBox) {
    let elem = document.getElementById(name)
    let check = document.getElementById(idBox)
    let height = document.querySelector("header").getBoundingClientRect().height
    let plus = 60
    if(check.checked){
        elem.style.display = "block"
        setTimeout(function() {
            elem.classList.add("active")
            header.style.height = (height + plus) + "px"
        }, 50);
    }else{
        elem.classList.remove("active")
        header.style.height = (height - plus) + "px"
        setTimeout(function() {
            elem.style.display = "none"
        }, 550);
    }
}

function emptyFilters(){
    for (elem of triInput) {
        if(elem.checked) {
            elem.checked = false
        }
    }
    for(elem of order) {
        if(elem.checked) {
            elem.checked = false
        }
    }
    document.getElementById('buttons').classList.remove('active')
    document.getElementById('tri').classList.remove('active')
}