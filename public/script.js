document.addEventListener("DOMContentLoaded", function() {
    // Handle splash screen
    setTimeout(() => {
        document.getElementById("splash-screen").style.display = "none";
        document.getElementById("main-content").classList.remove("hidden");
    }, 3000);  // 3-second delay for splash screen

    // Set current date as default in date input
    const currentDate = new Date().toISOString().split('T')[0];
    document.getElementById("date").value = currentDate;

    // View PDF Button
    document.getElementById("view-pdf").addEventListener("click", function() {
        document.getElementById("buttons").classList.add("hidden");
        document.getElementById("pdf-viewer").classList.remove("hidden");
    });

    // Back to Home from PDF viewer
    document.getElementById("back-home-from-pdf").addEventListener("click", function() {
        document.getElementById("pdf-viewer").classList.add("hidden");
        document.getElementById("buttons").classList.remove("hidden");
    });

    // View Entries Button
    document.getElementById("view-entries").addEventListener("click", function() {
        document.getElementById("buttons").classList.add("hidden");
        document.getElementById("new-entry-form").classList.add("hidden");
        document.getElementById("entries-list").classList.remove("hidden");

        // Fetch entries from the backend
        fetch('/get-entries')
            .then(response => response.json())
            .then(entries => {
                const entriesTable = document.getElementById("entries-table").getElementsByTagName("tbody")[0];
                entriesTable.innerHTML = ''; // Clear previous entries
                entries.forEach(entry => {
                    const row = entriesTable.insertRow();
                    row.innerHTML = `
                        <td>${entry.date}</td>
                        <td>${entry.rank}</td>
                        <td>${entry.name}</td>
                        <td>${entry.decoration}</td>
                        <td>${entry.remarks}</td>
                        <td><img src="${entry.signature}" width="100" height="50"></td>
                    `;
                });
            });
    });

    // New Entry Button
    document.getElementById("new-entry").addEventListener("click", function() {
        document.getElementById("buttons").classList.add("hidden");
        document.getElementById("new-entry-form").classList.remove("hidden");
    });

    // Back to Home from Entries List
    document.getElementById("back-home").addEventListener("click", function() {
        document.getElementById("entries-list").classList.add("hidden");
        document.getElementById("buttons").classList.remove("hidden");
    });

    // Back to Home from New Entry Form
    document.getElementById("back-home-from-form").addEventListener("click", function() {
        document.getElementById("new-entry-form").classList.add("hidden");
        document.getElementById("buttons").classList.remove("hidden");
    });

    // Handle form submission
    const form = document.getElementById("visitor-form");
    form.addEventListener("submit", function(event) {
        event.preventDefault();

        const signatureData = document.getElementById("signature-data").value;
        const date = document.getElementById("date").value || new Date().toISOString().split('T')[0]; // Current date

        const formData = {
            date,
            rank: document.getElementById("rank").value,
            name: document.getElementById("name").value,
            decoration: document.getElementById("decoration").value,
            remarks: document.getElementById("remarks").value,
            signature: signatureData
        };

        fetch('/submit-entry', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            form.reset();
            document.getElementById("signature-pad").getContext('2d').clearRect(0, 0, 400, 150);
        })
        .catch(err => alert("Error submitting entry"));
    });

    // Signature Pad
    const canvas = document.getElementById('signature-pad');
    const ctx = canvas.getContext('2d');
    let drawing = false;

    canvas.addEventListener('mousedown', (e) => {
        drawing = true;
        ctx.beginPath();
        ctx.moveTo(e.offsetX, e.offsetY);
    });

    canvas.addEventListener('mousemove', (e) => {
        if (drawing) {
            ctx.lineTo(e.offsetX, e.offsetY);
            ctx.stroke();
        }
    });

    canvas.addEventListener('mouseup', () => {
        drawing = false;
        document.getElementById("signature-data").value = canvas.toDataURL();
    });

    // Clear Signature
    document.getElementById("clear-signature").addEventListener("click", () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        document.getElementById("signature-data").value = '';
    });

    // Reset form
    document.getElementById("reset-form").addEventListener("click", () => {
        form.reset();
        document.getElementById("signature-pad").getContext('2d').clearRect(0, 0, 400, 150);
    });
});
