import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
    getFirestore, collection, addDoc, query, where, onSnapshot, doc, updateDoc, getDocs, serverTimestamp
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import {
    getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-storage.js";

const firebaseConfig = {
     database configuration
};



// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

// Global variables for map
let map = null;
let marker = null;

document.addEventListener("DOMContentLoaded", () => {
    // --- User Authentication Logic (for auth.html) ---
    const userAuthForm = document.getElementById("userAuthForm");
    const toggleUserSignUpButton = document.getElementById("toggleSignUpButton");
    const userNameGroup = document.getElementById("userNameGroup");
    const userPhoneGroup = document.getElementById("userPhoneGroup");
    const userNameInput = document.getElementById("userName");
    const userPhoneInput = document.getElementById("userPhone");
    const authPageTitle = document.getElementById("authPageTitle"); // Get the title element
    const submitUserAuthButton = document.getElementById("submitUserAuthButton"); // Get the submit button

    let isUserSignUpMode = false; // Track the current mode

    // Function to toggle between Login and Sign Up UI for users
    function toggleUserAuthMode() {
        isUserSignUpMode = !isUserSignUpMode;
        if (isUserSignUpMode) {
            userNameGroup.style.display = 'block';
            userPhoneGroup.style.display = 'block';
            submitUserAuthButton.textContent = 'Sign Up'; // Change button text
            toggleUserSignUpButton.textContent = 'Back to Login'; // Change toggle button text
            authPageTitle.textContent = 'User Sign Up'; // Update page title
        } else {
            userNameGroup.style.display = 'none';
            userPhoneGroup.style.display = 'none';
            submitUserAuthButton.textContent = 'Login'; // Change button text
            toggleUserSignUpButton.textContent = 'Sign Up'; // Change toggle button text
            authPageTitle.textContent = 'User Login'; // Update page title
        }
    }

    async function handleUserAuth(e) {
        e.preventDefault(); // Prevent default form submission

        const emailInput = document.getElementById("userEmail");
        const passwordInput = document.getElementById("userPassword");

        if (!emailInput || !passwordInput) return;

        const email = emailInput.value;
        const password = passwordInput.value;
        const fullName = userNameInput ? userNameInput.value.trim() : '';
        const phoneNumber = userPhoneInput ? userPhoneInput.value.trim() : '';

        if (!email || !password) {
            alert("Please enter both email and password.");
            return;
        }

        if (isUserSignUpMode && (!fullName || !phoneNumber)) {
            alert("Please enter your full name and phone number to sign up.");
            return;
        }

        try {
            if (isUserSignUpMode) {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                // Store additional user data in Firestore
                await addDoc(collection(db, "users"), {
                    uid: userCredential.user.uid,
                    email: email,
                    fullName: fullName,
                    phoneNumber: phoneNumber,
                    role: "user", // Assign a role
                    createdAt: serverTimestamp()
                });
                alert("User account created! You can now log in.");
                userAuthForm.reset();
                toggleUserAuthMode(); // Switch back to login mode after signup
            } else {
                await signInWithEmailAndPassword(auth, email, password);
                alert("User Logged in successfully!");
                window.location.href = "request.html";
            }
        } catch (error) {
            alert((isUserSignUpMode ? "User Sign Up Failed: " : "User Login Failed: ") + error.message);
        }
    }

    if (userAuthForm) {
        userAuthForm.addEventListener("submit", handleUserAuth); // Use the unified handler
    }

    if (toggleUserSignUpButton) {
        toggleUserSignUpButton.addEventListener("click", toggleUserAuthMode);
    }

    // --- Technician Authentication Logic (for techauth.html) ---
    const techAuthForm = document.getElementById("techAuthForm");
    const toggleTechSignUpButton = document.getElementById("toggleTechSignUpButton");
    const techNameGroup = document.getElementById("techNameGroup");
    const techPhoneGroup = document.getElementById("techPhoneGroup");
    const techNameInput = document.getElementById("techName");
    const techPhoneInput = document.getElementById("techPhone");
    const techAuthPageTitle = document.getElementById("techAuthPageTitle"); // Get the title element
    const submitTechAuthButton = document.getElementById("submitTechAuthButton"); // Get the submit button

    let isTechSignUpMode = false; // Track the current mode for technician

    // Function to toggle between Login and Sign Up UI for technicians
    function toggleTechAuthMode() {
        isTechSignUpMode = !isTechSignUpMode;
        if (isTechSignUpMode) {
            techNameGroup.style.display = 'block';
            techPhoneGroup.style.display = 'block';
            submitTechAuthButton.textContent = 'Sign Up as Technician'; // Change button text
            toggleTechSignUpButton.textContent = 'Back to Technician Login'; // Change toggle button text
            techAuthPageTitle.textContent = 'Technician Sign Up'; // Update page title
        } else {
            techNameGroup.style.display = 'none';
            techPhoneGroup.style.display = 'none';
            submitTechAuthButton.textContent = 'Login as Technician'; // Change button text
            toggleTechSignUpButton.textContent = 'Sign Up as Technician'; // Change toggle button text
            techAuthPageTitle.textContent = 'Technician Login'; // Update page title
        }
    }

    async function handleTechAuth(e) {
        e.preventDefault(); // Prevent default form submission

        const emailInput = document.getElementById("techEmail");
        const passwordInput = document.getElementById("techPassword");

        if (!emailInput || !passwordInput) return;

        const email = emailInput.value;
        const password = passwordInput.value;
        const fullName = techNameInput ? techNameInput.value.trim() : '';
        const phoneNumber = techPhoneInput ? techPhoneInput.value.trim() : '';

        if (!email || !password) {
            alert("Please enter both email and password.");
            return;
        }

        if (isTechSignUpMode && (!fullName || !phoneNumber)) {
            alert("Please enter your full name and phone number to sign up as a technician.");
            return;
        }

        try {
            if (isTechSignUpMode) {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                // Store additional technician data in Firestore
                await addDoc(collection(db, "technicians"), { // Separate collection for technicians
                    uid: userCredential.user.uid,
                    email: email,
                    fullName: fullName,
                    phoneNumber: phoneNumber,
                    role: "technician", // Assign a role
                    available: true, // Technicians might have availability status
                    createdAt: serverTimestamp()
                });
                alert("Technician account created! You can now log in.");
                techAuthForm.reset();
                toggleTechAuthMode(); // Switch back to login mode after signup
            } else {
                await signInWithEmailAndPassword(auth, email, password);
                alert("Technician Logged in successfully!");
                // Redirect to technician dashboard
                window.location.href = "techdashboard.html";
            }
        } catch (error) {
            alert((isTechSignUpMode ? "Technician Sign Up Failed: " : "Technician Login Failed: ") + error.message);
        }
    }

    if (techAuthForm) {
        techAuthForm.addEventListener("submit", handleTechAuth); // Use the unified handler
    }

    if (toggleTechSignUpButton) {
        toggleTechSignUpButton.addEventListener("click", toggleTechAuthMode);
    }

    // --- User Request Submission and Status Logic (for request.html) ---
    const requestForm = document.getElementById("requestForm");
    const authMessageDiv = document.getElementById("authMessage");
    const userRequestsListDiv = document.getElementById("userRequestsList");
    const userRequestsMessage = document.getElementById("userRequestsMessage");
    const userLogoutButton = document.getElementById("userLogoutButton");
    const pageTitle = document.getElementById("pageTitle");

    // NEW: Elements to display user's name and phone
    const userProfileDisplay = document.getElementById("userProfileDisplay");
    const userDisplayName = document.getElementById("userDisplayName");
    const userDisplayPhone = document.getElementById("userDisplayPhone");


    // Initialize map function
    function initializeMap() {
        if (!map) { // Initialize only if not already initialized
            // Default to Bengaluru coordinates
            const defaultLat = 12.9716;
            const defaultLon = 77.5946;

            map = L.map('map').setView([defaultLat, defaultLon], 13);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);

            marker = L.marker([defaultLat, defaultLon], { draggable: true }).addTo(map)
                .bindPopup("Drag to pinpoint your location.")
                .openPopup();

            marker.on('dragend', function (event) {
                const latlng = marker.getLatLng();
                document.getElementById('latitude').value = latlng.lat;
                document.getElementById('longitude').value = latlng.lng;
                reverseGeocode(latlng.lat, latlng.lng);
            });

            // Try to get user's current location
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const { latitude, longitude } = position.coords;
                        map.setView([latitude, longitude], 15); // Zoom in closer on user
                        marker.setLatLng([latitude, longitude]);
                        document.getElementById('latitude').value = latitude;
                        document.getElementById('longitude').value = longitude;
                        reverseGeocode(latitude, longitude);
                    },
                    (error) => {
                        console.warn("Geolocation failed: " + error.message);
                        alert("Could not get your current location. Please drag the map marker to your address.");
                        // Still set default coords and address if geolocation fails
                        document.getElementById('latitude').value = defaultLat;
                        document.getElementById('longitude').value = defaultLon;
                        reverseGeocode(defaultLat, defaultLon);
                    },
                    { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
                );
            } else {
                alert("Geolocation is not supported by your browser. Please manually set your location on the map.");
                // Still set default coords and address if geolocation not supported
                document.getElementById('latitude').value = defaultLat;
                document.getElementById('longitude').value = defaultLon;
                reverseGeocode(defaultLat, defaultLon);
            }
        }
    }

    async function reverseGeocode(lat, lon) {
        try {
            // Using OpenStreetMap Nominatim for reverse geocoding
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`);
            const data = await response.json();
            const address = data.display_name || "Unknown address";
            document.getElementById('homeAddress').value = address;
        } catch (error) {
            console.error("Error during reverse geocoding:", error);
            document.getElementById('homeAddress').value = `Failed to get address. Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)}`;
        }
    }

    if (window.location.pathname.includes("request.html")) {
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                authMessageDiv.style.display = 'none';
                requestForm.style.display = 'block';
                userLogoutButton.style.display = 'block';
                pageTitle.textContent = "Submit New Request";
                userRequestsMessage.textContent = "Loading your requests...";
                userProfileDisplay.style.display = 'block'; // Show profile display

                // Fetch and display user's name and phone number
                const userDocQuery = query(collection(db, "users"), where("uid", "==", user.uid));
                const userDocSnap = await getDocs(userDocQuery);
                if (!userDocSnap.empty) {
                    const userData = userDocSnap.docs[0].data();
                    userDisplayName.textContent = userData.fullName || user.email;
                    userDisplayPhone.textContent = userData.phoneNumber || 'N/A';
                } else {
                    userDisplayName.textContent = user.email; // Fallback to email
                    userDisplayPhone.textContent = 'N/A';
                }

                // Initialize map only if the map div exists
                if (document.getElementById('map')) {
                    initializeMap(); // Initialize map when user is logged in
                }

                const userRequestsQuery = query(collection(db, "requests"), where("userId", "==", user.uid));
                onSnapshot(userRequestsQuery, (snapshot) => {
                    if (snapshot.empty) {
                        userRequestsListDiv.innerHTML = '<p class="text-muted">You have not submitted any requests yet.</p>';
                    } else {
                        userRequestsListDiv.innerHTML = '<h3 class="text-center">Your Active and Past Requests:</h3>';
                        snapshot.forEach((docSnap) => {
                            const request = docSnap.data();
                            const requestId = docSnap.id;

                            const descriptionHtml = request.description ? `<p><strong>Description:</strong> ${request.description}</p>` : '';
                            const imageHtml = request.imageUrl ? `<div class="request-image-container"><img src="${request.imageUrl}" alt="Issue Photo" class="request-image"></div>` : '';
                            const locationHtml = request.latitude && request.longitude ?
                                `<p><strong>Location:</strong> <a href="https://www.openstreetmap.org/?mlat=${request.latitude}&mlon=${request.longitude}#map=15/${request.latitude}/${request.longitude}" target="_blank">View on Map</a></p>` : '';

                            let technicianInfoHtml = '';
                            let userActionButton = '';
                            let statusText = request.status.charAt(0).toUpperCase() + request.status.slice(1);
                            let statusClassName = `status-${request.status}`;

                            if (request.status === 'accepted' && request.technicianName && request.technicianPhone) {
                                technicianInfoHtml = `<p><strong>Assigned Technician:</strong> ${request.technicianName} (<a href="tel:${request.technicianPhone}">${request.technicianPhone}</a>)</p>`; // Display name and phone
                                if (request.status !== 'completed') {
                                    userActionButton = `<button data-id="${requestId}" class="btn btn-success btn-sm complete-job-btn mt-2">Mark as Completed</button>`;
                                }
                            } else if (request.status === 'pending') {
                                technicianInfoHtml = '<p>Waiting for a technician to accept...</p>';
                            } else if (request.status === 'completed') {
                                technicianInfoHtml = '<p class="text-success">This job has been marked as completed.</p>';
                            } else if (request.status === 'rejected') {
                                technicianInfoHtml = '<p class="text-danger">Your request was rejected. Please submit a new one if needed.</p>';
                            }

                            const card = document.createElement("div");
                            card.className = "request-card user-request-card mb-3";
                            card.innerHTML = `
                                <div class="status-column">
                                    <span class="status-box ${statusClassName}">Status: <strong>${statusText}</strong></span>
                                </div>
                                <div class="details-column">
                                    <h4>Issue: ${request.issue}</h4>
                                    <p><strong>Address:</strong> ${request.homeAddress || 'N/A'}</p>
                                    ${locationHtml}
                                    ${descriptionHtml}
                                    ${imageHtml}
                                    ${technicianInfoHtml}
                                    <p class="text-muted">Submitted: ${request.timestamp && request.timestamp.toDate ? request.timestamp.toDate().toLocaleString() : "N/A"}</p>
                                    ${userActionButton}
                                </div>
                            `;
                            userRequestsListDiv.appendChild(card);
                        });

                        userRequestsListDiv.querySelectorAll('.complete-job-btn').forEach(button => {
                            button.addEventListener('click', async (e) => {
                                const requestId = e.target.dataset.id;
                                if (confirm("Are you sure you want to mark this job as completed? This action cannot be undone.")) {
                                    try {
                                        await updateDoc(doc(db, "requests", requestId), {
                                            status: "completed"
                                        });
                                        alert("Job marked as completed successfully!");
                                    } catch (error) {
                                        alert("Error marking job as complete: " + error.message);
                                    }
                                }
                            });
                        });
                    }
                });

            } else {
                authMessageDiv.style.display = 'block';
                requestForm.style.display = 'none';
                userLogoutButton.style.display = 'none';
                userRequestsListDiv.innerHTML = '';
                pageTitle.textContent = "Request Help (Login Required)";
                userProfileDisplay.style.display = 'none'; // Hide profile display
                if (map) { // Dispose map if user logs out
                    map.remove();
                    map = null;
                    marker = null;
                }
            }
        });
    }

    if (requestForm) {
        requestForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const user = auth.currentUser;
            if (!user) {
                alert("You must be logged in to submit a request.");
                return;
            }

            const issue = document.getElementById("issueType").value;
            const description = document.getElementById("issueDescription").value.trim();

            // --- THESE ARE THE VALUES COMING FROM THE MAP ---
            const homeAddress = document.getElementById("homeAddress").value;
            const latitude = document.getElementById("latitude").value;
            const longitude = document.getElementById("longitude").value;
            // --- END MAP VALUES ---

            const issueImageInput = document.getElementById("issueImage");
            const imageFile = issueImageInput.files[0];
            let imageUrl = null;

            if (!homeAddress || !latitude || !longitude) {
                alert("Please pinpoint your location on the map and ensure the address is filled.");
                return;
            }

            try {
                // 1. Upload image if provided
                if (imageFile) {
                    const storageRef = ref(storage, `issue_images/${user.uid}/${imageFile.name}_${Date.now()}`);
                    await uploadBytes(storageRef, imageFile);
                    imageUrl = await getDownloadURL(storageRef);
                }

                // 2. Add request to Firestore
                await addDoc(collection(db, "requests"), {
                    userId: user.uid,
                    userEmail: user.email,
                    issue: issue,
                    description: description,
                    homeAddress: homeAddress, // Save the address from the map
                    latitude: parseFloat(latitude), // Save latitude
                    longitude: parseFloat(longitude), // Save longitude
                    imageUrl: imageUrl,
                    status: "pending", // initial status
                    timestamp: serverTimestamp() // Adds a server-generated timestamp
                });

                alert("Request submitted successfully!");
                requestForm.reset();
                // Optionally re-initialize map to default or current user location after submission
                if (map) {
                    map.remove(); // Remove existing map
                    map = null;  // Reset map variable
                    marker = null; // Reset marker variable
                }
                initializeMap(); // Initialize new map view
            } catch (error) {
                alert("Error submitting request: " + error.message);
                console.error("Error submitting request:", error);
            }
        });
    }

    // --- Logout Functionality ---
    if (userLogoutButton) {
        userLogoutButton.addEventListener("click", async () => {
            try {
                await signOut(auth);
                alert("Logged out successfully!");
                window.location.href = "auth.html"; // Redirect to login page
            } catch (error) {
                alert("Error logging out: " + error.message);
            }
        });
    }

    // --- Technician Dashboard Logic (for techdashboard.html) ---
    const requestsListDiv = document.getElementById("requestsList");
    const techAuthMessageDiv = document.getElementById("techAuthMessage");
    const techLogoutButton = document.getElementById("techLogoutButton");

    // NEW: Elements to display technician's name and phone
    const techProfileDisplay = document.getElementById("techProfileDisplay");
    const techDisplayName = document.getElementById("techDisplayName");
    const techDisplayPhone = document.getElementById("techDisplayPhone");


    if (window.location.pathname.includes("techdashboard.html")) {
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                techAuthMessageDiv.style.display = 'none';
                requestsListDiv.style.display = 'block';
                techLogoutButton.style.display = 'block';
                techProfileDisplay.style.display = 'block'; // Show tech profile display
                requestsListDiv.innerHTML = '<p class="text-center text-muted">Loading available jobs...</p>';

                // Fetch and display technician's name and phone number
                const techDocQuery = query(collection(db, "technicians"), where("uid", "==", user.uid));
                const techDocSnap = await getDocs(techDocQuery);
                if (!techDocSnap.empty) {
                    const techData = techDocSnap.docs[0].data();
                    techDisplayName.textContent = techData.fullName || user.email;
                    techDisplayPhone.textContent = techData.phoneNumber || 'N/A';
                } else {
                    techDisplayName.textContent = user.email; // Fallback to email
                    techDisplayPhone.textContent = 'N/A';
                }

                // Listen for all pending or accepted requests
                const requestsQuery = query(collection(db, "requests"), where("status", "in", ["pending", "accepted"]));
                onSnapshot(requestsQuery, async (snapshot) => {
                    if (snapshot.empty) {
                        requestsListDiv.innerHTML = '<p class="text-center">No new requests at the moment.</p>';
                    } else {
                        requestsListDiv.innerHTML = '<h3>Available Jobs:</h3>';
                        snapshot.forEach((docSnap) => {
                            const request = docSnap.data();
                            const requestId = docSnap.id;

                            // Ensure request has all necessary fields
                            if (!request.issue || !request.homeAddress || !request.latitude || !request.longitude || !request.userId || !request.userEmail) {
                                console.warn("Skipping malformed request:", request);
                                return;
                            }

                            const descriptionHtml = request.description ? `<p><strong>Description:</strong> ${request.description}</p>` : '';
                            const imageHtml = request.imageUrl ? `<div class="request-image-container"><img src="${request.imageUrl}" alt="Issue Photo" class="request-image"></div>` : '';
                            const locationHtml = request.latitude && request.longitude ?
                                `<p><strong>Location:</strong> <a href="https://www.openstreetmap.org/?mlat=${request.latitude}&mlon=${request.longitude}#map=15/${request.latitude}/${request.longitude}" target="_blank">View on Map</a></p>` : '';

                            let actionButton = '';
                            let statusText = request.status.charAt(0).toUpperCase() + request.status.slice(1);
                            let statusClassName = `status-${request.status}`;

                            if (request.status === 'pending') {
                                actionButton = `<button data-id="${requestId}" class="btn btn-primary btn-sm accept-btn">Accept Job</button>`;
                            } else if (request.status === 'accepted' && request.technicianId === user.uid) {
                                actionButton = `<button data-id="${requestId}" class="btn btn-warning btn-sm complete-btn">Mark as Completed</button>`;
                                statusText = `Accepted by You`; // Show "Accepted by You"
                                statusClassName = `status-accepted-by-you`; // Custom class if needed for styling
                            } else if (request.status === 'accepted' && request.technicianId !== user.uid) {
                                actionButton = `<button class="btn btn-info btn-sm" disabled>Accepted by Other</button>`;
                                statusText = `Accepted`;
                            }


                            const card = document.createElement("div");
                            card.className = "request-card tech-request-card mb-3";
                            card.innerHTML = `
                                <div class="status-column">
                                    <span class="status-box ${statusClassName}">Status: <strong>${statusText}</strong></span>
                                </div>
                                <div class="details-column">
                                    <h4>Issue: ${request.issue}</h4>
                                    <p><strong>Address:</strong> ${request.homeAddress}</p>
                                    ${locationHtml}
                                    ${descriptionHtml}
                                    ${imageHtml}
                                    <p class="text-muted">Requested by: ${request.userEmail}</p>
                                    <p class="text-muted">Submitted: ${request.timestamp && request.timestamp.toDate ? request.timestamp.toDate().toLocaleString() : "N/A"}</p>
                                    ${actionButton}
                                </div>
                            `;
                            requestsListDiv.appendChild(card);
                        });

                        // Add event listeners for new buttons
                        requestsListDiv.querySelectorAll('.accept-btn').forEach(button => {
                            button.addEventListener('click', async (e) => {
                                const requestId = e.target.dataset.id;
                                if (confirm("Are you sure you want to accept this job?")) {
                                    try {
                                        // Retrieve technician's name and phone from their 'technicians' document
                                        const techDoc = await getDocs(query(collection(db, "technicians"), where("uid", "==", user.uid)));
                                        let technicianName = "FlashFix Technician";
                                        let technicianPhone = "N/A";
                                        if (!techDoc.empty) {
                                            const techData = techDoc.docs[0].data();
                                            technicianName = techData.fullName || "FlashFix Technician";
                                            technicianPhone = techData.phoneNumber || "N/A";
                                        }

                                        await updateDoc(doc(db, "requests", requestId), {
                                            status: "accepted",
                                            technicianId: user.uid,
                                            technicianEmail: user.email,
                                            technicianName: technicianName, // Use actual tech name
                                            technicianPhone: technicianPhone // Use actual tech phone
                                        });
                                        alert("Job accepted successfully!");
                                    } catch (error) {
                                        alert("Error accepting job: " + error.message);
                                    }
                                }
                            });
                        });

                        requestsListDiv.querySelectorAll('.complete-btn').forEach(button => {
                            button.addEventListener('click', async (e) => {
                                const requestId = e.target.dataset.id;
                                if (confirm("Are you sure you want to mark this job as completed?")) {
                                    try {
                                        await updateDoc(doc(db, "requests", requestId), {
                                            status: "completed"
                                        });
                                        alert("Job marked as completed successfully!");
                                    } catch (error) {
                                        alert("Error marking job as complete: " + error.message);
                                    }
                                }
                            });
                        });
                    }
                }, (error) => {
                    console.error("Error listening to technician requests:", error);
                    requestsListDiv.innerHTML = `<p class="alert alert-danger">Error loading requests. Please try again later.</p>`;
                });

            } else {
                techAuthMessageDiv.style.display = 'block';
                requestsListDiv.style.display = 'none';
                techLogoutButton.style.display = 'none';
                techProfileDisplay.style.display = 'none'; // Hide tech profile display
                if (map) { // Dispose map if technician logs out
                    map.remove();
                    map = null;
                    marker = null;
                }
            }
        });
    }

    if (techLogoutButton) {
        techLogoutButton.addEventListener("click", async () => {
            try {
                await signOut(auth);
                alert("Logged out as technician successfully!");
                window.location.href = "techauth.html"; // Redirect to technician login page
            } catch (error) {
                alert("Error logging out: " + error.message);
            }
        });
    }

}); // End DOMContentLoaded
