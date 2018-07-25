const express = require('express');
const router = express.Router();


const {Room, activeRoomList} = require('../model/rooms');
const {User} = require('../model/users');
const {Word} = require('../model/words');


let sockets = {};
sockets.init = function (server) {

    const io = require('socket.io').listen(server);
    io.on('connection', (socket) => {

        socket.on('join', (params) => {
            if (typeof params.token !== 'string' || typeof params.room.roomName !== 'string'
                || params.token.trim().length === 0 || params.room.roomName.trim().length === 0) {
                socket.emit('gameState', {
                    status: 'fail',
                    game: null,
                    errorMessage: 'There are more required fields.'
                });
                return;
            }

            User.findByToken(params.token).then((user) => {
                if (!user) {
                    return Promise.reject();
                }

                const room = activeRoomList.getRoom(params.room.roomName);

                if (room) {
                    let paramPassword = params.room.roomPassword === null ? null : params.room.roomPassword.trim();
                    paramPassword = paramPassword === '' ? null : paramPassword;
                    if (room.roomPassword !== paramPassword) {
                        socket.emit('gameState', {
                            status: 'fail',
                            game: null,
                            errorMessage: 'Room password is invalid.'
                        });
                        return;
                    }
                } else {
                    socket.emit('gameState', {
                        status: 'fail',
                        game: null,
                        errorMessage: 'Room does not exist.'
                    });
                    return;
                }

                //If there are no slots for the player to join
                if (room.userSockets.length >= room.maxPlayerCount) {
                    socket.emit('gameState', {
                        status: 'fail',
                        game: null,
                        errorMessage: 'Room is full.'
                    });
                    return;
                }

                socket['userName'] = user.username;
                socket['roomName'] = params.room.roomName;
                socket['token'] = params.token;
                socket['score'] = 0;

                socket.join(params.room.roomName);

                room.addUser(socket);


                //game logic to check if the game should start or not
                if (room.gameState.status === 0) {
                    if (room.gameStart()) {
                        room.sendGameStateToActiveSocket();
                        room.sendGameStateToOtherSockets();
                    } else {
                        room.sendGameStateToAllSockets();
                    }

                } else {
                    room.sendGameStateToActiveSocket();
                    room.sendGameStateToOtherSockets();
                }

            }).catch((e) => {
                console.log(e);
                socket.emit('gameState', {
                    status: 'fail',
                    game: null,
                    errorMessage: 'Internal server error. Please contact our support team.'
                });
                return;
            });
        });

        socket.on('create', (params) => {
            if (typeof params.token !== 'string' || typeof params.room.roomName !== 'string'
                || params.token.trim().length === 0 || params.room.roomName.trim().length === 0) {
                console.log(params);
                socket.emit('gameState', {
                    status: 'fail',
                    game: null,
                    errorMessage: 'Invalid params.'
                });
                return;
            }
            const min = parseInt(params.room.min);
            const max = parseInt(params.room.max);
            if (min < 2 || min > 10 || max < 2 || max > 10 || min > max) {
                console.log(params);
                socket.emit('gameState', {
                    status: 'fail',
                    game: null,
                    errorMessage: 'Invalid room limits.'
                });
                return;
            }

            User.findByToken(params.token).then((user) => {
                if (!user) {
                    return Promise.reject();
                }
                const dsRoom = activeRoomList.getRoom(params.room.roomName);

                if (dsRoom) {
                    socket.emit('gameState', {
                        status: 'fail',
                        game: null,
                        errorMessage: 'Room already exists'
                    });
                    return;
                }

                let password = params.room.roomPassword === null ? null : params.room.roomPassword.trim();
                password = password === '' ? null : password;
                let room = new Room(io, params.room.roomName, password, min, max);
                room.addUser(socket);
                activeRoomList.addRoom(room);


                socket.join(params.room.roomName);

                socket['userName'] = user.username;
                socket['roomName'] = params.room.roomName;
                socket['token'] = params.token;
                socket['score'] = 0;


                Word.findRandom({}, {}, {limit: room.randomWordCount}, function (err, result) {
                    if (err || !result || result.length < room.randomWordCount) {
                        socket.emit('gameState', {
                            status: 'fail',
                            game: null,
                            errorMessage: 'Internal server error. Please contact our support team.'
                        });
                        return;
                    }

                    room.randomWords = result;

                    room.sendGameStateToSocket(socket);

                });

            }).catch((e) => {
                console.log(e);
                socket.emit('gameState', {
                    status: 'fail',
                    game: null,
                    errorMessage: 'Internal server error. Please contact our support team.'
                });
                return;
            });

        });

        socket.on('disconnect', () => {
            if (socket['roomName'] === undefined) {
                return;
            }
            const room = activeRoomList.getRoom(socket['roomName']);
            if (room === undefined || room === null) {
                return;
            }
            if (room.gameState.status === 0) {
                if (room.userSockets.length <= 1) {
                    room.gameFailedOver();
                    socket.leave(socket['roomName']);
                    return;
                } else {
                    room.removeUser(socket);
                    socket.leave(socket['roomName']);
                    room.sendGameStateToAllSockets();
                    return;
                }

            }
            const user = room.removeUser(socket);
            if (user) {
                if (room.userSockets.length <= 1) {
                    room.gameFailedOver();
                    socket.leave(socket['roomName']);
                } else {
                    if (room.gameState.activeTurnSocket === socket) {
                        // room.gameState._turn--;
                        room.nextTurn(true);
                    }
                    room.sendGameStateToActiveSocket();
                    room.sendGameStateToOtherSockets();

                }
            }
        });

        socket.on('createXY', (xy) => {
            if (socket['token'] === undefined ||
                socket['roomName'] === undefined ||
                activeRoomList.getRoom(socket['roomName']) === undefined ||
                socket !== activeRoomList.getRoom(socket["roomName"]).gameState.activeTurnSocket) {
                return;
            }
            activeRoomList.getRoom(socket['roomName']).pushCanvasData(xy);
            socket.broadcast.to(socket['roomName']).emit('receiveXY', xy);
        });

        socket.on('createMessage', (message, callback) => {
            if (socket['token'] === undefined || socket['token'] === null) {
                return;
            }
            const room = activeRoomList.getRoom(socket['roomName']);
            room.checkIfGuessed(socket, message);
            callback();
        });
    });

    router.get('/rooms', (req, res) => {
        const list = activeRoomList.getActiveRoomNames();
        res.status(200).send(list);
    });
};

sockets.lobbyRouter = router;
module.exports = sockets;

