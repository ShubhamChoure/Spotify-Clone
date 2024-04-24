
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

class Album{
    name = "";
    desc = "";
    img = "";
    path = "";
}

function findAlbum(title,list){
    for (const element of list) {
        if(element.name == title){
            return element;
        }
    }
}

async function main(){
    let albumsList = [];
    let playlist = await fetch("./Playlists/");
    let playlistResponse = await playlist.text();
    let tableDiv = document.createElement(`div`);
    tableDiv.innerHTML = playlistResponse;
    let unfilteredList = tableDiv.getElementsByTagName(`td`);

    //setting name
    for (const element of unfilteredList) {
        let obj = new Album();
        if(element.innerText != null && element.innerText.match(/[a-z]/) || element.innerText.match(/[A-Z]/)){
            console.log("element ineerText = ",element.innerText);
           obj.name = element.innerText.slice(0,-1);
           albumsList.push(obj);
        }
    }
    
    //setting img and desc
    for(const element of albumsList){
        element.path = "./Playlists/"+element.name+"/";
        let data = await fetch(element.path);
        tableDiv.innerHTML = await data.text();
        unfilteredList = tableDiv.getElementsByTagName(`td`);
        for (const element2 of unfilteredList) {
            if(element2.innerText!=null && element2.innerText.match(".txt") || element2.innerText.match(".jpg") || element2.innerText.match(".jpeg") || element2.innerText.match(".png")){
                if(element2.innerText.match(".txt")){
                    element.desc = await fetch(element.path+element2.innerText).then((response)=>response.text()).then((data)=>{
                        return data;
                    });
                }else{
                    element.img=element.path+element2.innerText;
                }
            }
        }
    }
    


    let alumGrid = document.querySelector(".albumGrid");

    //displaying information of playlists
    for(const element of albumsList){
        let albumDiv = document.createElement(`div`);
        albumDiv.setAttribute("class","album");
        albumDiv.innerHTML = 
                `<img src="${element.img}" alt="">
                <svg data-encore-id="icon" role="img" aria-hidden="true" viewBox="0 0 24 24" class="PlayBtn">
                    <path
                        d="m7.05 3.606 13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z">
                    </path>
                </svg>
                <span class="title">${element.name}</span>
                <span class="desc">${element.desc}</span>`;
        alumGrid.insertAdjacentElement("beforeend",albumDiv);
    }

    let albumRefList = document.getElementsByClassName("album");

    for (const albumRef of albumRefList) {
        albumRef.addEventListener("click",(e)=>{
            e.stopPropagation();
            let title=albumRef.querySelector(".title").innerText;
            let albumObj = findAlbum(title,albumsList);
            localStorage.setItem(title,JSON.stringify(albumObj));
            window.location = `playlist.html?title=${encodeURIComponent(title)}`;
        });
        albumRef.querySelector(`svg`).addEventListener("click",(e)=>{
            e.stopPropagation();
            console.log("Clicked On Play Btn");
        });
    }
    
}

main();
