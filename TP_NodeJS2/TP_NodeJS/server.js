const express = require('express');
const session = require('express-session');
const path = require('path');
const app = express();
const port = 8888;

// Configuration des sessions
app.use(session({
    secret: 'yourSecretKey',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // en production, mettez secure: true pour HTTPS
}));

// Middleware pour analyser les corps de requête JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware pour servir des fichiers statiques
app.use(express.static(path.join(__dirname, 'public')));

// Import des routeurs
const routes = require('./routes');

// Utilisation des routes
app.use('/', routes);

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
