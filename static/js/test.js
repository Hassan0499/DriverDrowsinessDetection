let stream;
let intervalId;
const alarmSound = new Audio('/static/alarm.wav'); // Ensure this file exists

document.getElementById('start-btn').addEventListener('click', async function () {
    await startCamera();
    intervalId = setInterval(captureAndSendFrame, 500);
});

document.getElementById('stop-btn').addEventListener('click', function () {
    stopCamera();
    clearInterval(intervalId);
    document.getElementById('camerawindow').innerHTML = ''; // Clear display
    alarmSound.pause();
    alarmSound.currentTime = 0;
});

async function startCamera() {
    const errorMessage = document.getElementById('error-message');
    const camerawindow = document.getElementById('camerawindow');
    camerawindow.innerHTML = '';

    const video = document.createElement('video');
    video.id = 'camera-video';
    video.autoplay = true;
    video.playsInline = true;
    video.width = 640;
    video.height = 480;
    video.style.display = 'none'; // Hide the raw video
    camerawindow.appendChild(video);

    const resultImage = document.createElement('img');
    resultImage.id = 'annotated-image';
    resultImage.width = 640;
    resultImage.height = 480;
    resultImage.style.marginTop = '10px';
    camerawindow.appendChild(resultImage);

    try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;

        errorMessage.textContent = '';
        errorMessage.style.display = 'none';
    } catch (error) {
        errorMessage.style.display = 'block';
        errorMessage.textContent = "Camera error: " + error.message;
    }
}

function stopCamera() {
    const video = document.getElementById('camera-video');
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }
    if (video) {
        video.remove();
    }
}

function captureAndSendFrame() {
    const video = document.getElementById('camera-video');
    if (!video) return;

    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = canvas.toDataURL('image/jpeg');

    fetch('/process_frame', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageData })
    })
        .then(response => response.json())
        .then(data => {
            if (data.image) {
                const annotatedImage = document.getElementById('annotated-image');
                annotatedImage.src = data.image;
            }

            if (data.alarm) {
                if (alarmSound.paused) alarmSound.play();
            } else {
                if (!alarmSound.paused) {
                    alarmSound.pause();
                    alarmSound.currentTime = 0;
                }
            }
        })
        .catch(error => console.error("Frame send error:", error));
}
