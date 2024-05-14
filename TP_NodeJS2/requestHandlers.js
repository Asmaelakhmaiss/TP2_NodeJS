const fs = require('fs');
const path = require('path');
const multer = require('multer');

// Configuration de multer pour le téléchargement de fichiers
const upload = multer({ dest: 'public/uploads/' });

// Pour la démonstration, nous utilisons un utilisateur en dur. Dans une vraie application, vous devriez utiliser une base de données.
const USERS = {
    user1: { password: "password1" },
    user2: { password: "password2" }
};

function start(req, res) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
}

function uploadPage(req, res) {
    if (!req.session.userId) {
        res.redirect('/login');
        return;
    }
    res.sendFile(path.join(__dirname, 'public', 'upload.html'));
}

function uploadFile(req, res) {
    if (!req.session.userId) {
        res.redirect('/login');
        return;
    }

    upload.single('file')(req, res, (err) => {
        if (err) {
            res.status(500).send("File upload failed");
            return;
        }

        req.session.lastUploadedFile = req.file.filename;
        res.redirect('/profile');
    });
}

function find(req, res) {
    if (!req.session.userId) {
        res.redirect('/login');
        return;
    }

    const directoryPath = path.join(__dirname, 'public', 'uploads');
    fs.readdir(directoryPath, (err, files) => {
        if (err) {
            res.status(500).send("Unable to scan directory");
            return;
        }

        let fileList = "<ul>";
        files.forEach(file => {
            fileList += `<li><a href="/uploads/${file}">${file}</a></li>`;
        });
        fileList += "</ul>";

        res.send(fileList);
    });
}

function find(req, res) {
    if (!req.session.userId) {
        res.redirect('/login');
        return;
    }

    const directoryPath = path.join(__dirname, 'public', 'uploads');
    fs.readdir(directoryPath, (err, files) => {
        if (err) {
            res.status(500).send("Unable to scan directory");
            return;
        }

        let fileList = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Find Files</title>
            <link rel="stylesheet" href="/styles.css">
        </head>
        <body>
            <div class="container">
                <h1>Files</h1>
                <ul>`;
        
        files.forEach(file => {
            fileList += `<li><a href="/uploads/${file}" target="_blank">${file}</a></li>`;
        });
        
        fileList += `
                </ul>
                <a href="/profile" class="button">Back to Profile</a>
            </div>
        </body>
        </html>`;
        
        res.send(fileList);
    });
}



function show(req, res) {
    if (!req.session.userId) {
        res.redirect('/login');
        return;
    }

    const fileName = req.session.lastUploadedFile || 'default.png';
    const filePath = path.join(__dirname, 'public', 'uploads', fileName);

    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.status(404).send("File not found");
            return;
        }

        res.setHeader('Content-Type', 'image/png');
        res.send(data);
    });
}

function loginPage(req, res) {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
}

function login(req, res) {
    const { username, password } = req.body;
    if (USERS[username] && USERS[username].password === password) {
        req.session.userId = username;
        res.redirect('/profile');
    } else {
        res.status(401).send("Invalid username or password");
    }
}

function logout(req, res) {
    req.session.destroy((err) => {
        if (err) {
            res.status(500).send("Failed to logout");
            return;
        }
        res.redirect('/start');
    });
}

function profilePage(req, res) {
    if (!req.session.userId) {
        res.redirect('/login');
        return;
    }
    res.sendFile(path.join(__dirname, 'public', 'profile.html'));
}

module.exports = {
    start,
    uploadPage,
    upload: uploadFile,
    find,
    show,
    loginPage,
    login,
    logout,
    profilePage
};
