const clientIo = io.connect("https://dev.knowledgetalk.co.kr://7100/SignalServer",{});
// 해당태그에 접근하기 위해 각 버튼에 ID 값을 넣는다
const roomIdInput = document.getElementById("roomIdInput");
const videoBox = document.getElementById("videoBox");
const printBox = document.getElementById("printBox")

const CreateRoomBtn = document.getElementById("CreateRoomBtn");
const RoomJoinBtn = document.getElementById("RoomJoinBtn");
const SDPBtn = document.getElementById("SDPBtn");

const CPCODE = "KP-CCC-demouser-01"
const AUTHKEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoidGVzdHNlcnZpY2UiLCJtYXhVc2VyIjoiMTAwIiwic3RhcnREYXRlIjoiMjAyMC0wOC0yMCIsImVuZERhdGUiOiIyMDIwLTEyLTMwIiwiYXV0aENvZGUiOiJLUC1DQ0MtdGVzdHNlcnZpY2UtMDEiLCJjb21wYW55Q29kZSI6IkxJQy0wMyIsImlhdCI6MTU5Nzk3NjQ3Mn0.xh_JgK67rNPufN2WoBa_37LzenuX_P7IEvvx5IbFZI4"

let members;
let roomId;
let userId;
let host;

let peers = {};
let streams = {};

/* 메소드 처리 부분*/
// 페이지에서 로그 찍히는부분
const socketLog = (type,contents) => {
    let jsonContents = JSON.stringify(contents);
    const textLine = document.createElement("p");
    const textContents = document.createTextNode(`[${type}] ${jsonContents}`);
    textLine.appendChild(textContents);
    printBox.appendChild(textLine);

}


const sendData = data => {
    data.cpCode = CPCODE
    data.authKey = AUTHKEY
    socketLog('send',data);
    clientIo.emit("knowledgetalk",data);

}

const deletePeers = async () => {
    for(let key in streams){
        if(streams[key]&& streams[key].getTracks()){
            streams[key].getTracks().forEach(track=>{
                track.stop();
            })
            
            document.getElementById(key).srcObject = null;
            document.getElementById(key).remove();
            
        }
    }
    for(let key in peers){
        if(peers[key]){
            peers[key].close();
            peers[key] = null;
        }
    }
}
//영상 출력화면 box 생성

const createVideoBox = id => {
    let videoContainner = document.createElement("div");
    videoContainner.classList = "multi-video";
    videoContainner.id = id;

    let videoLabel = document.createElement("p");
    let videoLabelText = document.createTextNode("id");
    videoLabel.appendChild(videoLabelText);
    videoContainner.appendChild(videoLabel);

    let multiVideo = document.createElement("video");
    multiVideo.autoplay = true;
    multiVideo.id = "multiVideo-" + id;
    videoContainner.appendChild(multiVideo)
    videoBox.appendChild(videoContainner);
}

const createSDPOffer = async id => {
    return new Promise(async (resolve,reject)=>{
        peers[id] = new RTCPeerConnection();
        streams[id] = await navigator.mediaDevices.getUserMedia({video:true,audio:true});
        let str = 'multVideo-' +id;
        let multiVideo = document.getElementById(str);
        multiVideo.strObject = streams[id];
        streams[id].getTracks().forEach(track=>{
            peers[id].addTrack(track,streams[id]);
        });

        peers[id].createOffer().then(sdp=>{
            peers[id].setLocalDescription(sdp);
            return sdp;
        }).then(sdp =>{
            resolve(sdp);
        })
    })
}