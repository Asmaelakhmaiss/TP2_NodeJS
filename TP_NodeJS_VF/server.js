const express = require('express');
const http = require('http');
const session = require('express-session');
const path = require('path');
const { Server } = require('socket.io');
const socketHandlers = require('./socketHandlers');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    pingTimeout: 60000,
    pingInterval: 25000
});
const port = 8888;

// Configuration des sessions
const sessionMiddleware = session({
    secret: 'ourSecretKey',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
});
app.use(sessionMiddleware);

// Middleware pour analyser les corps de requête JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware pour servir des fichiers statiques
app.use(express.static(path.join(__dirname, 'public')));

// Partager les sessions avec Socket.io
io.use((socket, next) => {
    sessionMiddleware(socket.request, socket.request.res || {}, next);
});

// Gérer les connexions Socket.io
io.on('connection', (socket) => {
    //console.log(`A user connected: ${socket.id}`);

    socket.on('disconnect', (reason) => {
        //console.log(`A user disconnected: ${socket.id} - Reason: ${reason}`);
    });

    socketHandlers(io, socket);
});

// Route pour vérifier que le serveur fonctionne
app.get('/health', (req, res) => {
    res.status(200).send('Server is healthy');
});

// Démarrer le serveur
server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
