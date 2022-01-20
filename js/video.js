const videoElement = document.getElementById('video');
const imgElement = document.getElementById('image');
const canvas = document.getElementById('canvas');
const canvas2 = document.getElementById('canvas2');
const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const blurBtn = document.getElementById('blur-btn');
const unblurBtn = document.getElementById('unblur-btn');

const ctx = canvas.getContext('2d');
const ctx2 = canvas2.getContext('2d');

startBtn.addEventListener('click', e => {
  startBtn.disabled = true;
  stopBtn.disabled = false;

  unblurBtn.disabled = false;
  blurBtn.disabled = false;

  startVideoStream();
});

stopBtn.addEventListener('click', e => {
  startBtn.disabled = false;
  stopBtn.disabled = true;

  unblurBtn.disabled = true;
  blurBtn.disabled = true;

  unblurBtn.hidden = true;
  blurBtn.hidden = false;

  videoElement.hidden = false;
  canvas.hidden = true;
  canvas2.hidden = true;

  stopVideoStream();
});

blurBtn.addEventListener('click', e => {
  blurBtn.hidden = true;
  unblurBtn.hidden = false;

  videoElement.hidden = true;
  videoElement.hidden = true;
  canvas.hidden = false;
  canvas2.hidden = false;
  
  loadBodyPix();
});

unblurBtn.addEventListener('click', e => {
  blurBtn.hidden = false;
  unblurBtn.hidden = true;

  videoElement.hidden = false;
  canvas.hidden = true;
  canvas2.hidden = true;
});

videoElement.onplaying = () => {
  canvas.height = videoElement.videoHeight;
  canvas.width = videoElement.videoWidth;
  canvas2.height = videoElement.videoHeight;
  canvas2.width = videoElement.videoWidth;
  console.log(canvas.height);
  console.log(canvas.width);
};

function startVideoStream() {
  navigator.mediaDevices.getUserMedia({video: true, audio: false})
    .then(stream => {
      videoElement.srcObject = stream;
      videoElement.play();
    })
    .catch(err => {
      startBtn.disabled = false;
      blurBtn.disabled = true;
      stopBtn.disabled = true;
      alert(`Following error occured: ${err}`);
    });
}

function stopVideoStream() {
  const stream = videoElement.srcObject;

  stream.getTracks().forEach(track => track.stop());
  videoElement.srcObject = null;
}

function loadBodyPix() {
  options = {
    architecture: 'ResNet50',
    multiplier: 0.5,
    stride: 16,
    quantBytes: 1
  }
  bodyPix.load(options)
    .then(net => perform(net))
    .catch(err => console.log(err))
}

async function perform(net) {

  while (startBtn.disabled && blurBtn.hidden) {
    const segmentation = await net.segmentPerson(video);
    
    //canvas-1上绘制视频流
    ctx.drawImage(videoElement, 0, 0);
    const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const length = frame.data.length;
    const data = frame.data;
    const data_mask = segmentation.data;
    
    //根据person分割的mask图拿到视频流中person的前景画面
    for (let i = 0; i < length; i += 4) {
      index = i/4; 
      if (data_mask[index]==0) {
        data[i + 3] = 0;
      }
    }
    
    //把上面的person前景画面绘制到带有背景图片的canvas-2上
    ctx2.putImageData(frame, 0, 0);
  }
}
