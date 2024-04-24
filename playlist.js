
var audioArray = [];
var currentAudio;
var percentage = 0;
var seekBar = document.getElementById("audioSeek");
var soundSeek = document.getElementById("soundSeek");
let hamburgerBtn = document.querySelector(".hamburgerBtn");
hamburgerBtn.addEventListener("click",e=>{
    let element = document.querySelector(".leftSide");
    element.style.setProperty("left","0%");
    hamburgerBtn.style.setProperty("display","none");
});

document.querySelector(".CloseHamBtn").addEventListener("click",e=>{
    let element = document.querySelector(".leftSide");
    element.style.setProperty("left","-60%");
    hamburgerBtn.style.setProperty("display","inline");

});

function updateBackground() {
    seekBar.style.setProperty("background-position",`${100-percentage}%,0`);
}
function playAudioSeekBar(){
    let seekBar = document.getElementById("audioSeek");
    seekBar.style.animationPlayState = "running";
}
function pauseAudioSeekBar(){
    let seekBar = document.getElementById("audioSeek");
    seekBar.style.animationPlayState = "paused";
}

function resetAudioSeekBar(sec){
    let playBtn = document.getElementById("playSVG");
    let pauseBtn = document.getElementById("pauseSVG");
    
    currentAudio.volume = 1.0;
    soundSeek.style.setProperty("background-position",`${100-(currentAudio.volume*100)},0`);
    pauseBtn.style.setProperty("display","none");
    playBtn.style.setProperty("display","inline");
}
function formatDuration(duration) {
    // Calculate minutes and seconds from duration
    let minutes = Math.floor(duration / 60);
    let seconds = Math.floor(duration % 60);

    // Pad seconds with a zero if less than 10
    if (seconds < 10) {
        seconds = '0' + seconds;
    }

    // Return as string in the format "minutes:seconds"
    return minutes + ':' + seconds;
}

async function getAudio(url, titleArray) {
    let promises = titleArray.map((e) => {
        return new Promise((resolve) => {
            let audio = new Audio(url + e);
            audio.addEventListener("loadedmetadata", () => {
                audioArray.push(audio);
                resolve();
            });
        });
    });
    await Promise.all(promises);
}
async function getTags(arr, albumObj) {
    let jsmediatags = window.jsmediatags;
    let promises = arr.map((e) => {
        return fetch(albumObj.path + e)
            .then(response => response.blob())
            .then((blob) => {
                let file = new File([blob], e);
                return new Promise((resolve, reject) => {
                    jsmediatags.read(file, {
                        onSuccess: function (tag) {
                            resolve(tag);
                        },
                        onError: function (error) {
                            console.log(error);
                            reject(error);
                        }
                    });
                });
            });
    });

    let tags = await Promise.all(promises);
    return tags;
}
async function main(){

let uriparams = new URLSearchParams(window.location.search);
let title = uriparams.get(`title`);
let albumObj = JSON.parse(localStorage.getItem(title));
console.log(albumObj);

let header = document.querySelector("header");


//taking background img color for theme
let bkgImgTemp = document.createElement("img");
bkgImgTemp.src = albumObj.img;
await new Promise((resolve)=>{
    bkgImgTemp.onload=resolve;
});
    let tempBkgCanvas = document.createElement("canvas");
    let bkgCanvasContext = tempBkgCanvas.getContext("2d");
    bkgCanvasContext.drawImage(bkgImgTemp,0,0);
    
    let imgHeight = bkgImgTemp.naturalHeight;
    let imgWidth = bkgImgTemp.naturalWidth;
    let imgRatio = imgWidth/imgHeight;
    
    let imgData = bkgCanvasContext.getImageData(0,0,imgWidth,imgHeight);
    
    let R=0,G=0,B=0;
    let pixelCount = 0;
    for(let i=0;i<imgData.data.length;i+=4){
        if(imgData.data[i] > 10 && imgData.data[i+1] > 10 && imgData.data[i+2] > 10) {
            pixelCount++;
            R += imgData.data[i];
            G += imgData.data[i+1];
            B += imgData.data[i+2];
        }
    }
    
    let avgR = (R/pixelCount);
    let avgG = (G/pixelCount);
    let avgB = (B/pixelCount);

//setting background theme color
let infoDiv = document.createElement("div");
infoDiv.setAttribute("id","information");
infoDiv.innerHTML=`<div id="playListbkg"></div>
<img src="${albumObj.img}" alt="">`;

header.insertAdjacentElement("afterend",infoDiv);
let themeBkg = infoDiv.firstElementChild;
themeBkg.style.setProperty("background-color",`rgb(${avgR},${avgG},${avgB})`);

//setting album information
let infoTextDiv = document.createElement("div");
infoTextDiv.setAttribute("id","infoText");
infoTextDiv.innerHTML=`<span id="infoType">Playlist</span>
<span id="infoTitle">${albumObj.name}</span>
<span id="infoDesc">${albumObj.desc}</span>
<div id="infoDetail"><img aria-hidden="false" draggable="false" loading="eager" src="https://i.scdn.co/image/ab67757000003b8255c25988a6ac314394d3fbf5" alt="Spotify" class="mMx2LUixlnN_Fu45JpFB Xz3tlahv16UpqKBW5HdK Yn2Ei5QZn19gria6LjZj">
<span id="spotify">Spotify</span>
<span>•</span>
<span>6,198,449 likes
    100 songs,</span>
<span id="infolengthText">about 5hr</span></div>`;
infoDiv.insertAdjacentElement("beforeend",infoTextDiv);

//setting Songs Playlist background
let songsListDiv = document.getElementById("songsList");
songsListDiv.style.setProperty("background-image",`linear-gradient(rgb(${avgR-30},${avgG-30},${avgB-30}),var(--defColor),transparent)`);
//style.setProperty("background-image",`linear-gradient(rgb(${avgR},${avgG},${avgB}),var(--defColor))`)


//read songs list in folder
let tableDataHtml=await fetch(albumObj.path);
let tableData = await tableDataHtml.text();
let tableDataDiv=document.createElement("div");
tableDataDiv.innerHTML=tableData;
let td = tableDataDiv.getElementsByTagName("td");
let tdArray = Array.from(td);
let filteredTd = tdArray.filter((e)=>{
    if(e.innerText.match(/^.*mp3$/)||e.innerText.match(/^.*wav$/)||e.innerText.match(/^.*m4a$/)){
        return e;
    }
});
let songsTitleArray = filteredTd.map((e)=>{
    return e.innerText;
});


//getting image from tags meta data;
var imageUri;
var tags = await getTags(songsTitleArray,albumObj);
//just adding song card using meta data
let songsCount = 0;
let musicListDiv = document.getElementById("musicList");
await getAudio(albumObj.path,songsTitleArray);
songsTitleArray.forEach((e)=>{   
        let songTag=tags[songsCount].tags;
        var picture = songTag.picture; // create reference to track art
        var base64String = "";
        if(picture != undefined){
                for (var i = 0; i < picture.data.length; i++) {
                    base64String += String.fromCharCode(picture.data[i]);
                }
                imageUri = "data:" + picture.format + ";base64," + window.btoa(base64String);
        }else{
            imageUri = "./Place-Holder.jpg";
        }
       let duration = audioArray[songsCount].duration;
       duration = formatDuration(duration);
       let songCardDiv = document.createElement("div");
       songCardDiv.setAttribute("class","listGrid");
       songCardDiv.innerHTML = `<div class="sr">${songsCount+1}</div>
       <div class="title"><img src="${imageUri}" alt=""><div class="songTitle"><span class="titlename">${songTag.title}</span><span class="singer">${songTag.artist}</span></div></div>
       <div class="albumName">${songTag.album}</div>
       <div class="date">5 days ago</div>
       <div class="duration">${duration}</div>`
       musicListDiv.insertAdjacentElement("beforeend",songCardDiv);
       songsCount++;
});

console.log(songsTitleArray);


//playing audio when clicked on card

let listGridCollection = document.getElementsByClassName("listGrid");
let audioDiv = document.getElementById("audioDiv");
let audioCover = document.querySelector(".audioCover");
let audioTitleName = document.querySelector(".audioTitleName");
for (let i=0;i<listGridCollection.length;i++) {
    listGridCollection[i].addEventListener("click",(e)=>{
        let clickedCard = e.currentTarget;
        
        if(currentAudio!=undefined){
            currentAudio.pause();
        }

        //set duration
        let cardDuration = clickedCard.querySelector(".duration");
        let audioDuration = audioDiv.querySelector("#duration");
        audioDuration.innerText = cardDuration.innerText;

        //setting cover img
        let cardimg = clickedCard.querySelector(".title>img");
        audioCover.src = cardimg.src;

        //setting title and singer
        let cardTitle = clickedCard.getElementsByClassName("titlename")[0];
        audioTitleName.innerText = cardTitle.innerText;
        let audioSinger = audioTitleName.nextElementSibling;
        let cardSinger = cardTitle.nextElementSibling;
        audioSinger.innerText=cardSinger.innerText;

        //resetting audio seek bar time and animation
        let cardSr = clickedCard.querySelector(".sr");
        let urlTitle = songsTitleArray[cardSr.innerText-1];
        console.log("audioTitleName.innerText",urlTitle.replaceAll(" ",`%20`));
        audioArray.forEach(element => {
            console.log("element.currentSrc",element.currentSrc);
            if((element.currentSrc).includes(urlTitle.replaceAll(" ",`%20`))){
                currentAudio = element;
            }
        });
        
        resetAudioSeekBar(currentAudio.duration);
        

        //displaying audioDiv
        audioDiv.style.setProperty("opacity","1");
        
    });
}

//play pause music
let playBtn = document.getElementById("playSVG");
let pauseBtn = document.getElementById("pauseSVG");
playBtn.addEventListener("click",(e)=>{
    playBtn.style.setProperty("display","none");
    pauseBtn.style.setProperty("display","inline");
    currentAudio.play();
    playAudioSeekBar();
});

pauseBtn.addEventListener("click",(e)=>{
    pauseBtn.style.setProperty("display","none");
    playBtn.style.setProperty("display","inline");
    currentAudio.pause();
    pauseAudioSeekBar();
});

document.getElementById('audioSeek').addEventListener('click', function(e) {
    var x = e.offsetX;
    var width = this.offsetWidth;
    percentage = x / width * 100;
    currentAudio.currentTime = (percentage/100)*currentAudio.duration;
    updateBackground();
});

let playTime = document.getElementById("playTime");
setInterval(()=>{
    percentage = (currentAudio.currentTime/currentAudio.duration)*100;
    playTime.innerText = formatDuration(currentAudio.currentTime);
    updateBackground();
},1000);


soundSeek.addEventListener("click",(e)=>{
    console.log("clicked");
    let volumePer = (e.offsetX/e.target.offsetWidth);
    currentAudio.volume = volumePer;
    soundSeek.style.setProperty("background-position",`${100-(currentAudio.volume*100)}%,0`);
});
}


main();


window.onload = function() {
   
};

