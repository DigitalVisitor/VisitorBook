// document.addEventListener("DOMContentLoaded", function() {
    // Handle splash screen
    // setTimeout(() => {
    //     document.getElementById("splash-screen").style.display = "none";
    //     document.getElementById("main-content").classList.remove("hidden");
    // }, 3000);  // 3-second delay for splash screen


// Wait for the DOM to load
document.addEventListener("DOMContentLoaded", () => {
    // Show logos when the page is loaded or based on a condition
window.onload = function() {
    // Initially, hide the content and show the splash screen logos
    document.getElementById('main-content').classList.remove('show-content');
    document.getElementById('main-content').classList.add('hidden');
};

    const logoScreen = document.getElementById('logo-screen');
    const mainContent = document.getElementById('main-content');

    // Set the duration of the splash screen in milliseconds (e.g., 5 seconds)
    const splashDuration = 5000; // 5 seconds

    // After the splash screen duration, hide it and show the main content
    setTimeout(() => {
        logoScreen.style.opacity = 0;  // Fade out the logo screen
        setTimeout(() => {
            logoScreen.style.display = 'none';  // Completely hide the logo screen
            mainContent.classList.add('fade-in'); // Show main content with fade-in effect
            document.getElementById('main-content').classList.remove('hidden');
            document.getElementById('main-content').classList.add('show-content'); // Ensure it's visible
        }, 2000); // Match the transition duration
    }, splashDuration);

    // Home Screen Navigation
    document.getElementById("about-us-btn").addEventListener("click", () => {
        showScreen("about-us-screen");
        document.getElementById('main-content').classList.remove('show-content');
        document.getElementById('main-content').classList.add('hidden');
    });

    document.getElementById("view-book-btn").addEventListener("click", () => {
        showScreen("view-book-screen");
        loadEntries();
        document.getElementById('main-content').classList.remove('show-content');
        document.getElementById('main-content').classList.add('hidden');
    });

    document.getElementById("start-form-btn").addEventListener("click", () => {
        showScreen("start-form-screen");
        populateDate();
        document.getElementById('main-content').classList.remove('show-content');
        document.getElementById('main-content').classList.add('hidden');
    });

    // Back to Home Buttons
    document.querySelectorAll("[id^='back-to-home']").forEach(button => {
        button.addEventListener("click", () => {
            showScreen("home-screen");
            document.getElementById('main-content').classList.remove('hidden');
            document.getElementById('main-content').classList.add('show-content');
        });
    });

    // Initialize the signature canvas
    const signatureCanvas = document.getElementById("signatureCanvas");
    const ctx = signatureCanvas.getContext("2d");
    let drawing = false;

    // Resize canvas to fit screen
    signatureCanvas.width = window.innerWidth * 0.8; // Adjust width based on screen size
    signatureCanvas.height = 150;

    // Start drawing when mouse or touch starts
    function startDrawing(e) {
        drawing = true;
        ctx.beginPath();
        const x = e.touches ? e.touches[0].clientX - signatureCanvas.offsetLeft : e.clientX - signatureCanvas.offsetLeft;
        const y = e.touches ? e.touches[0].clientY - signatureCanvas.offsetTop : e.clientY - signatureCanvas.offsetTop;
        ctx.moveTo(x, y);
    }

    // Draw on the canvas when mouse or touch moves
    function draw(e) {
        if (drawing) {
            const x = e.touches ? e.touches[0].clientX - signatureCanvas.offsetLeft : e.clientX - signatureCanvas.offsetLeft;
            const y = e.touches ? e.touches[0].clientY - signatureCanvas.offsetTop : e.clientY - signatureCanvas.offsetTop;
            ctx.lineTo(x, y);
            ctx.stroke();
        }
    }

    // Stop drawing when mouse or touch ends
    function stopDrawing() {
        drawing = false;
    }

    // Event listeners for mouse and touch actions
    signatureCanvas.addEventListener('mousedown', startDrawing);
    signatureCanvas.addEventListener('mousemove', draw);
    signatureCanvas.addEventListener('mouseup', stopDrawing);
    signatureCanvas.addEventListener('mouseout', stopDrawing);  // Ensure drawing stops when mouse leaves the canvas

    // Touch events (for mobile)
    signatureCanvas.addEventListener('touchstart', startDrawing);
    signatureCanvas.addEventListener('touchmove', draw);
    signatureCanvas.addEventListener('touchend', stopDrawing);
    signatureCanvas.addEventListener('touchcancel', stopDrawing);  // Stop drawing if touch is canceled

// Clear signature button functionality
document.getElementById("clear-signature").addEventListener("click", () => {
    ctx.clearRect(0, 0, signatureCanvas.width, signatureCanvas.height);  // Clear the canvas
    document.getElementById("signatureData").value = '';  // Clear the hidden input
});

// Capture the base64 signature when the form is submitted
document.getElementById('visitor-form').addEventListener('submit', function (e) {
    e.preventDefault();  // Prevent form submission for now

    // Get base64 data URL from the canvas
    const signatureBase64 = signatureCanvas.toDataURL('image/png');
    document.getElementById('signatureData').value = signatureBase64;  // Set the base64 signature to the hidden input

    // Now submit the form
    e.target.submit();
});
    // Populate current date in the form
    const populateDate = () => {
        const dateField = document.getElementById("date");
        dateField.value = new Date().toLocaleDateString("en-GB");
    };

    // Function to show a specific screen and hide others
    const showScreen = (screenId) => {
        document.querySelectorAll("div[id$='screen']").forEach(screen => {
            screen.classList.add("hidden");
        });
        document.getElementById(screenId).classList.remove("hidden");
    };

    // Toggle between photo upload and capture modes
    document.getElementById("photo_option").addEventListener("change", (event) => {
        const uploadMode = document.getElementById("upload-mode");
        const captureMode = document.getElementById("capture-mode");

        if (event.target.value === "upload") {
            uploadMode.style.display = "block";
            captureMode.style.display = "none";
        } else if (event.target.value === "capture") {
            uploadMode.style.display = "none";
            captureMode.style.display = "block";
        } else {
            uploadMode.style.display = "none";
            captureMode.style.display = "none";
        }
    });

    // Camera capture functionality
    const video = document.getElementById("video");
    const canvas = document.getElementById("photoCanvas");
    const capturePhoto = document.getElementById("captured_image");

    document.getElementById("capture-btn").addEventListener("click", async () => {
        const context = canvas.getContext("2d");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = canvas.toDataURL("image/png");
        capturePhoto.value = imageData;

        video.srcObject.getTracks().forEach(track => track.stop());
        alert("Photo captured successfully!");
    });

    // Load entries into the table
    const loadEntries = async () => {
        const tableBody = document.querySelector("#entries-table tbody");
        tableBody.innerHTML = ""; // Clear previous entries

        try {
            const response = await fetch("/get-entries");
            const entries = await response.json();

            entries.forEach(entry => {
                const row = document.createElement("tr");

                row.innerHTML = `
                    <td>${entry.date}</td>
                    <td>${entry.name_rank}</td>
                    <td>${entry.address}</td>
                    <td>${entry.decoration || "N/A"}</td>
                    <td>${entry.remarks || "N/A"}</td>
                    <td>${entry.photo_path ? `<img src="${entry.photo_path}" alt="Photo" width="100">` : "N/A"}</td>
                    <td>${entry.signature ? `<img src="${entry.signature}" alt="Photo" width="100">` : "N/A"}</td>
                `;

                tableBody.appendChild(row);
            });
        } catch (error) {
            console.error("Error loading entries:", error);
            alert("Failed to load entries.");
        }
    };

    document.getElementById("reset-form").addEventListener("click", () => {
        // Reset the form fields
        const form = document.getElementById("visitor-form");
        form.reset();
    
        // Clear the signature canvas
        const signatureCanvas = document.getElementById("signatureCanvas");
        const ctx = signatureCanvas.getContext("2d");
        ctx.clearRect(0, 0, signatureCanvas.width, signatureCanvas.height);
        document.getElementById("signatureData").value = ""; // Clear hidden input for signature
    
        // Clear the captured photo
        const capturedImageInput = document.getElementById("captured_image");
        const photoCanvas = document.getElementById("photoCanvas");
        const photoCtx = photoCanvas.getContext("2d");
        capturedImageInput.value = ""; // Clear hidden input for captured image
        photoCtx.clearRect(0, 0, photoCanvas.width, photoCanvas.height);
    
        // Optionally reset any custom UI states or additional elements
        console.log("Form has been reset");
    });

    // Form submission
    const form = document.getElementById("visitor-form");
    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const formData = new FormData(form);
        try {
            const response = await fetch("/submit-entry", {
                method: "POST",
                body: formData,
            });

            const result = await response.json();
            if (response.ok) {
                alert(result.message || "Data submitted successfully.");
                form.reset();
                showScreen("home-screen");
            } else {
                alert(result.error || "Error submitting the form.");
            }
        } catch (error) {
            console.error("Error submitting form:", error);
            alert("Failed to submit data. Please try again.");
        }
    });
});














    // // Set current date as default in date input
    // const currentDate = new Date().toISOString().split('T')[0];
    // document.getElementById("date").value = currentDate;

    // // View PDF Button
    // document.getElementById("view-pdf").addEventListener("click", function() {
    //     document.getElementById("buttons").classList.add("hidden");
    //     document.getElementById("pdf-viewer").classList.remove("hidden");
    // });

    // // Back to Home from PDF viewer
    // document.getElementById("back-home-from-pdf").addEventListener("click", function() {
    //     document.getElementById("pdf-viewer").classList.add("hidden");
    //     document.getElementById("buttons").classList.remove("hidden");
    // });

    // // View Entries Button
    // document.getElementById("view-entries").addEventListener("click", function() {
    //     document.getElementById("buttons").classList.add("hidden");
    //     document.getElementById("new-entry-form").classList.add("hidden");
    //     document.getElementById("entries-list").classList.remove("hidden");

    //     // Fetch entries from the backend
    //     fetch('/get-entries')
    //         .then(response => response.json())
    //         .then(entries => {
    //             const entriesTable = document.getElementById("entries-table").getElementsByTagName("tbody")[0];
    //             entriesTable.innerHTML = ''; // Clear previous entries
    //             entries.forEach(entry => {
    //                 const row = entriesTable.insertRow();
    //                 row.innerHTML = `
    //                     <td>${entry.date}</td>
    //                     <td>${entry.rank}</td>
    //                     <td>${entry.name}</td>
    //                     <td>${entry.decoration}</td>
    //                     <td>${entry.remarks}</td>
    //                     <td><img src="${entry.signature}" width="100" height="50"></td>
    //                 `;
    //             });
    //         });
    // });

    // // New Entry Button
    // document.getElementById("new-entry").addEventListener("click", function() {
    //     document.getElementById("buttons").classList.add("hidden");
    //     document.getElementById("new-entry-form").classList.remove("hidden");
    // });

    // // Back to Home from Entries List
    // document.getElementById("back-home").addEventListener("click", function() {
    //     document.getElementById("entries-list").classList.add("hidden");
    //     document.getElementById("buttons").classList.remove("hidden");
    // });

    // // Back to Home from New Entry Form
    // document.getElementById("back-home-from-form").addEventListener("click", function() {
    //     document.getElementById("new-entry-form").classList.add("hidden");
    //     document.getElementById("buttons").classList.remove("hidden");
    // });

    // // Handle form submission
    // const form = document.getElementById("visitor-form");
    // form.addEventListener("submit", function(event) {
    //     event.preventDefault();

    //     const signatureData = document.getElementById("signature-data").value;
    //     const date = document.getElementById("date").value || new Date().toISOString().split('T')[0]; // Current date

    //     const formData = {
    //         date,
    //         rank: document.getElementById("rank").value,
    //         name: document.getElementById("name").value,
    //         decoration: document.getElementById("decoration").value,
    //         remarks: document.getElementById("remarks").value,
    //         signature: signatureData
    //     };

    //     fetch('/submit-entry', {
    //         method: 'POST',
    //         headers: {
    //             'Content-Type': 'application/json',
    //         },
    //         body: JSON.stringify(formData)
    //     })
    //     .then(response => response.json())
    //     .then(data => {
    //         alert(data.message);
    //         form.reset();
    //         document.getElementById("signature-pad").getContext('2d').clearRect(0, 0, 400, 150);
    //     })
    //     .catch(err => alert("Error submitting entry"));
    // });

    // // Signature Pad
    // const canvas = document.getElementById('signature-pad');
    // const ctx = canvas.getContext('2d');
    // let drawing = false;

    // canvas.addEventListener('mousedown', (e) => {
    //     drawing = true;
    //     ctx.beginPath();
    //     ctx.moveTo(e.offsetX, e.offsetY);
    // });

    // canvas.addEventListener('mousemove', (e) => {
    //     if (drawing) {
    //         ctx.lineTo(e.offsetX, e.offsetY);
    //         ctx.stroke();
    //     }
    // });

    // canvas.addEventListener('mouseup', () => {
    //     drawing = false;
    //     document.getElementById("signature-data").value = canvas.toDataURL();
    // });

    // // Clear Signature
    // document.getElementById("clear-signature").addEventListener("click", () => {
    //     ctx.clearRect(0, 0, canvas.width, canvas.height);
    //     document.getElementById("signature-data").value = '';
    // });

    // // Reset form
    // document.getElementById("reset-form").addEventListener("click", () => {
    //     form.reset();
    //     document.getElementById("signature-pad").getContext('2d').clearRect(0, 0, 400, 150);
    // });
// });
