const socket = io('52.58.161.7:3000')
const videoGrid = document.getElementById('video-grid')
const btn = document.getElementById('btn')
const myPeer = new Peer(undefined, {
  host: '52.58.161.7',
  port: '3001',
})

const constraints = window.constraints = {
  audio: true,
  video: true
};

const myVideo = document.createElement('video')
myVideo.muted = true
const peers = {}
navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
  addVideoStream(myVideo, stream)

  myPeer.on('call', call => {
    call.answer(stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream)
    })
  })

  socket.on('user-connected', userId => {
    connectToNewUser(userId, stream)
  })
})

socket.on('user-disconnected', userId => {
  if (peers[userId]) peers[userId].close()
})

myPeer.on('open', id => {
  socket.emit('join-room', 'f1f1', id)
})

btn.addEventListener('click', () => location.href = '/f1f1')

const path = './recordings/saved.mp4';

navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
  const recorder = new MediaRecorder(stream);
  recorder.start(1000);
  const blob_reader = new FileReader();
  const storage_stream = require("fs").createWriteStream(path);

  const blobs = [];

  blob_reader.addEventListener("load", function(ev) {
    storage_stream.write(Buffer.from(ev.currentTarget.result));
    if(blobs.length) {
      ev.currentTarget.readAsArrayBuffer(blobs.shift());
    }
  });

  recorder.addEventListener("dataavailable", function(ev) {
    if(blob_reader.readyState != 1) {
      blob_reader.readAsArrayBuffer(ev.data);
    } else {
      blobs.push(ev.data);
    }
  });
});

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream)
  const video = document.createElement('video')
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream)
  })
  call.on('close', () => {
    video.remove()
  })
  peers[userId] = call
}

function addVideoStream(video, stream) {
  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
  videoGrid.append(video)
}