const express = require('express');
const router = express.Router();
const moment = require('moment');

const {Room, activeRoomList} = require('../model/rooms');
const {User} = require('../model/users');
const {Word} = require('../model/words');


let sockets = {};
sockets.init = function (server) {


    const io = require('socket.io').listen(server);
    io.on('connection', (socket) => {
        console.log('A new user is connected.');

        socket.on('join', (params, callback) => {
            if (typeof params.token !== 'string' || typeof params.room.roomName !== 'string'
                || params.token.trim().length === 0 || params.room.roomName.trim().length === 0) {
                return callback('Required params! *token *room { roomName }');
            }

            User.findByToken(params.token).then((user) => {
                if (!user) {
                    return Promise.reject();
                }

                const room = activeRoomList.getRoom(params.room.roomName);
                console.log('*********************************************');
                console.log(room);
                console.log('*********************************************');

                if (room) {
                    let paramPassword = params.room.roomPassword === null ? null : params.room.roomPassword.trim();
                    paramPassword = paramPassword === '' ? null : paramPassword;
                    if (room.roomPassword !== paramPassword) {
                        socket.emit('gameState', {
                            status: 'fail',
                            game: null
                        });
                        return callback('Room password is invalid.');
                    }
                } else {
                    socket.emit('gameState', {
                        status: 'fail',
                        game: null
                    });
                    return callback('Room does not exist!');
                }

                socket['userName'] = user.username;
                socket['roomName'] = params.room.roomName;
                socket['token'] = params.token;
                socket['score'] = 0;

                socket.join(params.room.roomName);

                room.addUser(socket);


                //game logic to check if the game should start or not
                if (room.gameState.status === 0) {
                    if(room.gameStart()){
                        room.sendGameStateToActiveSocket();
                        room.sendGameStateToOtherSockets();
                    }else{
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
                    game: null
                });
                return callback(e);
            });

        });

        socket.on('create', (params, callback) => {
            console.log(params);
            if (typeof params.token !== 'string' || typeof params.room.roomName !== 'string'
                || params.token.trim().length === 0 || params.room.roomName.trim().length === 0) {
                return callback('Required params! *token *room { roomName }');
            }

            User.findByToken(params.token).then((user) => {
                if (!user) {
                    return Promise.reject();
                }
                const dsRoom = activeRoomList.getRoom(params.room.roomName);
                console.log('*********************************************');
                console.log(dsRoom);
                console.log('*********************************************');

                if (dsRoom) {
                    socket.emit('gameState', {
                        status: 'fail',
                        game: null
                    });
                    return callback('Room already exists!');
                }

                let password = params.room.roomPassword === null ? null : params.room.roomPassword.trim();
                password = password === '' ? null : password;
                console.log(password);
                console.log(params.room.roomPassword);
                let room = new Room(io, params.room.roomName, password);
                room.addUser(socket);
                activeRoomList.addRoom(room);


                socket.join(params.room.roomName);

                socket['userName'] = user.username;
                socket['roomName'] = params.room.roomName;
                socket['token'] = params.token;
                socket['score'] = 0;


                Word.findRandom({}, {}, {limit: room.randomWordCount}, function (err, result) {
                    if (err || !result || result.length < room.randomWordCount) {
                        //TODO add a fail safe event so that the game cancels on an error.
                        return;
                    }

                    console.log(result);
                    room.randomWords = result;

                    // socket.emit('gameState', {
                    //     status: 'success',
                    //     game: {
                    //         status: room.gameState.status,
                    //         _turn: room.gameState._turn,
                    //         currentTurn: room.gameState.currentTurn,
                    //         activeTurnSocketId: null,
                    //         activeWord: null,
                    //         canvasData: [],
                    //         chatData: [],
                    //         userList: room.getActiveUsers(),
                    //     }
                    // });

                    room.sendGameStateToSocket(socket);

                });

            }).catch((e) => {
                console.log(e);
                socket.emit('gameState', {
                    status: 'fail',
                    game: null
                });
                return callback(e);
            });

        });

        socket.on('disconnect', () => {
            console.log('A user was disconnected');
            console.log(io.sockets.adapter.rooms);
            //TODO check if only a single user is left if so end the game set the game status 0 or 2
            if (socket['roomName'] === undefined) {
                return;
            }
            const room = activeRoomList.getRoom(socket['roomName']);
            if (room === undefined || room === null) {
                return;
            }
            const user = room.removeUser(socket);
            if (user) {
                if (room.userSockets.length <= 1) {
                    room.gameFailedOver(io, socket['roomName']);
                    console.log('DELETED THE ROOM', socket['roomName']);
                    socket.leave(socket['roomName']);
                    console.log(io.sockets.adapter.rooms);

                } else {
                    if (room.gameState.activeTurnSocket === socket) {
                        room.gameState._turn--;
                        room.nextTurn();
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
            if (socket['token'] === undefined) {
                return;
            }
            const room = activeRoomList.getRoom(socket['roomName']);

            if (room.gameState.activeWord.trim().toLowerCase() === JSON.parse(message).message.text.trim().toLowerCase()
                && room.gameState.activeTurnSocket !== socket) {
                console.log('Correct guess!');
                console.log('socket', socket['userName']);

                if (!room.checkIfAlreadyGuessed(socket)) {
                    console.log('Not already guessed!');
                    room.addScore(socket);
                } else {
                    console.log('Already guessed!');
                    message = JSON.parse(message);
                    message.message.userName = socket['userName'];
                    room.pushChatData(message);
                    socket.broadcast.to(socket['roomName']).emit('receiveMessage', {
                        message: JSON.stringify(message)
                    });
                    return;
                }
                console.log('correctGuessCount ', room.gameState.correctGuessCount);
                console.log('userSockets.length ', room.userSockets.length);

                //There is a -1 because a player is drawing and cannot guess
                if (room.gameState.correctGuessCount === room.userSockets.length - 1) {
                    if (room.nextTurn()) {
                        console.log("NEXT TURN AVAILABLE");
                        room.sendGameStateToActiveSocket();
                        room.sendGameStateToOtherSockets();

                    } else {
                        console.log("NEXT TURN NO NO GAME OVER");
                        return room.gameOver(io,socket['roomName']);
                    }
                } else {
                    console.log('THERE ARE PLAYERS WHO DID NOT GUESS!');

                    room.sendGameStateToActiveSocket();
                    room.sendGameStateToOtherSockets();
                }

                room.pushChatData(message);
                const sendMessage = {
                    message: {
                        text: socket['userName'] + ' guessed correctly!',
                        createdAt: moment().valueOf(),
                        userName: ''
                    }
                };
                io.to(socket['roomName']).emit('receiveMessage', {
                    message: JSON.stringify(sendMessage)
                });


            } else {
                console.log('just a normal message');
                message = JSON.parse(message);
                message.message.userName = socket['userName'];
                room.pushChatData(message);
                socket.broadcast.to(socket['roomName']).emit('receiveMessage', {
                    message: JSON.stringify(message)
                });
            }
            console.log('callback();');
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

