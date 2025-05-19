document.getElementById("start-btn").addEventListener("click", function () {
    fetch("/start_detection")
        .then(response => response.text())
        .then(data => {
            alert(data);  // Show confirmation
        })
        .catch(error => {
            document.getElementById("error-message").textContent = "Error starting detection.";
            document.getElementById("error-message").style.display = "block";
        });
});

document.getElementById("stop-btn").addEventListener("click", function () {
    fetch("/stop_detection")
        .then(response => response.text())
        .then(data => {
            alert(data);  // Show confirmation
        })
        .catch(error => {
            document.getElementById("error-message").textContent = "Error stopping detection.";
            document.getElementById("error-message").style.display = "block";
        });
});
