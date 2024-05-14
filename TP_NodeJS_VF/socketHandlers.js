const path = require('path');
const fs = require('fs');

const USERS = {
    user1: { password: "password1" },
    user2: { password: "password2" }
};

module.exports = (io, socket) => {
    //console.log('A user connected');

    socket.on('login', (data) => {
        const { username, password } = data;
        if (USERS[username] && USERS[username].password === password) {
            socket.request.session.userId = username;
            socket.request.session.save();
            socket.emit('loginSuccess');
        } else {
            socket.emit('loginError', 'Invalid username or password');
        }
    });

    socket.on('logout', () => {
        socket.request.session.destroy((err) => {
            if (err) {
                socket.emit('logoutError', 'Failed to logout');
            } else {
                socket.emit('logoutSuccess');
            }
        });
    });

    socket.on('upload', (data) => {
        if (!socket.request.session.userId) {
            socket.emit('uploadError', 'Unauthorized');
            return;
        }

        const fileName = data.fileName;
        const fileData = Buffer.from(data.fileData, 'base64');
        const filePath = path.join(__dirname, 'public', 'uploads', fileName);

        fs.writeFile(filePath, fileData, (err) => {
            if (err) {
                console.error('Error writing file:', err);
                socket.emit('uploadError', 'File upload failed');
                return;
            }

            socket.request.session.lastUploadedFile = fileName;
            socket.request.session.save();
            socket.emit('uploadSuccess');
        });
    });

    socket.on('find', () => {
        if (!socket.request.session.userId) {
            socket.emit('findError', 'Unauthorized');
            return;
        }

        const directoryPath = path.join(__dirname, 'public', 'uploads');
        fs.readdir(directoryPath, (err, files) => {
            if (err) {
                socket.emit('findError', 'Unable to scan directory');
                return;
            }

            socket.emit('filesList', files);
        });
    });

    socket.on('show', () => {
        if (!socket.request.session.userId) {
            socket.emit('showError', 'Unauthorized');
            return;
        }

        const fileName = socket.request.session.lastUploadedFile || 'default.png';
        const fileLink = `/uploads/${fileName}`;
        
        fs.access(path.join(__dirname, 'public', 'uploads', fileName), fs.constants.F_OK, (err) => {
            if (err) {
                socket.emit('showError', 'File not found');
                return;
            }
            socket.emit('showFileLink', fileLink);
        });
    });

    socket.on('disconnect', () => {
        //console.log('A user disconnected');
    });
};
