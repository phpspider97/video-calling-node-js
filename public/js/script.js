const socket = io()
var videoChatForm = document.getElementById('video-chat-form')
var videoChatRooms = document.getElementById('video-chat-rooms')
var joinBtn = document.getElementById('join')
var roomInput = document.getElementById('roomName')
var userVideo = document.getElementById('user-video')
var peerVideo = document.getElementById('peer-video')
var videoOption = document.getElementById('video-option')
var muteButton = document.getElementById('muteBtn')
var hideCameraButton = document.getElementById('hideCamera')

navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia

var muteFlag = false
var hideCameraFlag = false
var roomName
var creator = false
var rtcPeerConnection
var userStream
  
var iceServers = {
    iceServers: [
        { urls: "stun:stun.services.mozilla.com" },
        { urls: "stun:stun1.l.google.com:19302" },
      ],
  };

joinBtn.addEventListener('click',()=>{
    if(roomInput.value == ''){
        alert('Please enter room name.')
    }else{
        roomName = roomInput.value
        socket.emit('join',roomName)
    }
})

muteButton.addEventListener('click',()=>{
    muteFlag = !muteFlag
    if(muteFlag){
        muteButton.textContent = 'Unmute'  
        userStream.getTracks()[0].enabled = false
    }else{
        muteButton.textContent = 'Mute' 
        userStream.getTracks()[0].enabled = true
    }
})

hideCameraButton.addEventListener('click',()=>{
    hideCameraFlag = !hideCameraFlag
    if(hideCameraFlag){
        hideCameraButton.textContent = 'Show Camera'  
        userStream.getTracks()[1].enabled = false
    }else{
        hideCameraButton.textContent = 'Hide Camera' 
        userStream.getTracks()[1].enabled = true
    }
})

socket.on('created',()=>{
    creator = true
    navigator.getUserMedia(
        {
            audio : true,
            video : {
                width : 200,
                height : 200
            }
        },
        function(stream){
            userStream = stream
            videoChatForm.style.display = 'none'
            videoOption.style.display = 'flex'
            userVideo.srcObject = stream
            userVideo.onloadedmetadata = function(e){
                userVideo.play()
            }
        },
        function(err){
            alert("Some error to play video")
        }
    )
})
socket.on('joined',()=>{
    creator = false
    navigator.getUserMedia(
        {
            audio : true,
            video : {
                width : 200,
                height : 200
            }
        },
        function(stream){
            userStream = stream
            videoChatForm.style.display = 'none'
            videoOption.style.display = 'flex'
            userVideo.srcObject = stream
            userVideo.onloadedmetadata = function(e){
                userVideo.play()
            }
            socket.emit('ready',roomName)
        },
        function(err){
            alert("Some error to play video")
        }
    )
})
socket.on('full',()=>{
    alert('Room is full')
})

socket.on('ready',()=>{ 
    if(creator){
        rtcPeerConnection = new RTCPeerConnection(iceServers)
        rtcPeerConnection.onicecandidate = onIceCandidateFunction
        rtcPeerConnection.ontrack = onTrackFunction
        rtcPeerConnection.addTrack(userStream.getTracks()[0],userStream) // ['audio','video']
        rtcPeerConnection.addTrack(userStream.getTracks()[1],userStream)
        rtcPeerConnection.createOffer(
            function(offer){
                rtcPeerConnection.setLocalDescription(offer)
                socket.emit('offer',offer,roomName)
            },
            function(err){
                console.log(err)
            }
        )
    }
})

socket.on('candidate',(candidate)=>{
    var iceCandidate = new RTCIceCandidate(candidate) 
    rtcPeerConnection.addIceCandidate(iceCandidate)
})

socket.on('offer',(offer)=>{
    if(!creator){ 
        rtcPeerConnection = new RTCPeerConnection(iceServers)
        rtcPeerConnection.onicecandidate = onIceCandidateFunction
        rtcPeerConnection.ontrack = onTrackFunction
        rtcPeerConnection.addTrack(userStream.getTracks()[0],userStream) // ['audio','video']
        rtcPeerConnection.addTrack(userStream.getTracks()[1],userStream) 
        rtcPeerConnection.setRemoteDescription(offer)
        rtcPeerConnection.createAnswer(
            function(answer){
                rtcPeerConnection.setLocalDescription(answer)
                socket.emit('answer',answer,roomName)
            },
            function(err){
                console.log(err)
            }
        )
    }
})
socket.on('answer',(answer)=>{
    rtcPeerConnection.setRemoteDescription(answer)
})

function onIceCandidateFunction(event){
    if(event.candidate){
        socket.emit('candidate',event.candidate,roomName)
    }
} 

function onTrackFunction(event){
    console.log('ontrack')
    peerVideo.srcObject = event.streams[0]
    peerVideo.onloadedmetadata = function(e){
        peerVideo.play()
    }
} 