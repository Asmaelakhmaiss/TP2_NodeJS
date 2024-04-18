const http = require('http');
const fs = require('fs');
const socketio = require('socket.io');

const server = http.createServer(function(req, res) {
    // Gestionnaire pour la page principale
    if (req.url === '/') {
        res.writeHead(200, { "Content-Type": "text/html" });
        fs.createReadStream("index.html").pipe(res);
    }
});

const io = socketio(server);

io.on("connection", function(socket) {
    console.log("Nouvelle connexion : " + socket.id);

    socket.on("start", function() {
        console.log("Requête de démarrage reçue.");
        socket.emit("message", "Bienvenue !");
    });

    socket.on("upload", function(imageData) {
        console.log("Requête de téléchargement reçue.");
        fs.writeFile("profile.jpg", imageData, function(err) {
            if (err) {
                socket.emit("message", "Erreur lors du téléchargement de l'image.");
            } else {
                socket.emit("message", "Image de profil téléchargée avec succès !");
            }
        });
    });

    socket.on("find", function() {
        console.log("Requête de recherche reçue.");
        fs.readdir("./uploads", function(err, files) {
            if (err) {
                socket.emit("message", "Erreur lors de la recherche des fichiers.");
            } else {
                socket.emit("files", files);
            }
        });
    });

    socket.on("show", function() {
        console.log("Requête d'affichage reçue.");
        fs.readFile("derniere_image.jpg", function(err, data) {
            if (err) {
                socket.emit("image", "chemin/vers/image_par_defaut.jpg");
            } else {
                socket.emit("image", "derniere_image.jpg");
            }
        });
    });

    socket.on("login", function(userData) {
        console.log("Requête de connexion reçue.");
        // Votre logique d'authentification
        if (userData.username === "admin" && userData.password === "password") { // Exemple simple
            socket.emit("message", "Connexion réussie !");
        } else {
            socket.emit("message", "Échec de la connexion. Nom d'utilisateur ou mot de passe incorrect.");
        }
    });

    socket.on("logout", function() {
        console.log("Requête de déconnexion reçue.");
        // Logique pour gérer la déconnexion
        socket.emit("message", "Déconnexion réussie !");
    });
});

server.listen(8888, function() {
    console.log("Serveur en écoute sur le port 8888...");
});
