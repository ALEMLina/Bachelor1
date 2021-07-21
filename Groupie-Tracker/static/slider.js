var inputLeft = document.querySelectorAll("[id^='input-left'")
var inputRight = document.querySelectorAll("[id^='input-right'")

var thumbLeft = document.querySelectorAll(".slider > .thumb.left")
var thumbRight = document.querySelectorAll(".slider > .thumb.right")
var ranges = document.querySelectorAll(".slider > .range")

//-----------------------------------------------------------------------------------------

function setLeftValue(left, right, thumb, range, id){
    var _this = left,
        min = parseInt(_this.min),
        max = parseInt(_this.max)

    _this.value = Math.min(parseInt(_this.value), parseInt(right.value) - 1)
    document.getElementById(id).innerText = _this.value
    
    var percent = ((_this.value - min) / (max - min)) * 100

    thumb.style.left = percent + "%"
    range.style.left = percent + "%"
}

//-----------------------------------------------------------------------------------------

function setRightValue(left, right, thumb, range, id){
    var _this = right,
        min = parseInt(_this.min),
        max = parseInt(_this.max)
    
    if(id == "maxNbm"){
        _this.value = Math.max(parseInt(_this.value), parseInt(left.value))
    }else{
        _this.value = Math.max(parseInt(_this.value), parseInt(left.value) + 1)
    }
    document.getElementById(id).innerText = _this.value
    
    var percent = ((_this.value - min) / (max - min)) * 100

    thumb.style.right = (100 - percent) + "%"
    range.style.right = (100 - percent) + "%"
}
let tab = [["min", "max"], ["minNbm", "maxNbm"], ["minFa","maxFa"]]

for(let i = 0; i < 3; i++) {

    setLeftValue(inputLeft[i], inputRight[i], thumbLeft[i], ranges[i], tab[i][0])
    inputLeft[i].addEventListener("input", () => {
        setLeftValue(inputLeft[i], inputRight[i], thumbLeft[i], ranges[i], tab[i][0])
    });

    setRightValue(inputLeft[i], inputRight[i], thumbRight[i], ranges[i], tab[i][1])
    inputRight[i].addEventListener("input", () => {
        setRightValue(inputLeft[i], inputRight[i], thumbRight[i], ranges[i], tab[i][1])
    });
}
