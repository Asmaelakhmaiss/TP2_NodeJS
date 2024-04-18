const socket = io();

socket.on("connect", function() {
    console.log("Connecté au serveur.");
});

socket.on("disconnect", function() {
    console.log("Déconnecté du serveur.");
});

socket.on("message", function(message) {
    console.log("Message du serveur : " + message);
    document.getElementById('server-message').textContent = message;
});

socket.on("files", function(files) {
    console.log("Liste des fichiers sur le serveur :");
    files.forEach(function(file, index) {
        console.log(index + 1 + ". " + file);
    });
});

socket.on("image", function(imagePath) {
    console.log("Affichage de l'image : " + imagePath);
    const imgElement = document.createElement("img");
    imgElement.src = imagePath;
    const imageContainer = document.getElementById("image-container");
    imageContainer.innerHTML = ''; // Supprimer le contenu précédent
    imageContainer.appendChild(imgElement);
});

function start() {
    console.log("Demande de démarrage de session.");
    socket.emit("start");
}

function upload() {
    const fileInput = document.getElementById('file-input');
    const file = fileInput.files[0]; // Récupérez le fichier sélectionné
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const imageData = e.target.result;
            socket.emit("upload", imageData);
        };
        reader.readAsDataURL(file);
    } else {
        console.log('Aucun fichier sélectionné.');
    }
}

function find() {
    console.log("Demande de recherche des fichiers sur le serveur.");
    socket.emit("find");
}

function show() {
    console.log("Demande d'affichage de l'image.");
    socket.emit("show");
}

function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const userData = { username: username, password: password };
    console.log("Demande de connexion avec", userData);
    socket.emit("login", userData);
}

function logout() {
    console.log("Demande de déconnexion.");
    socket.emit("logout");
}
