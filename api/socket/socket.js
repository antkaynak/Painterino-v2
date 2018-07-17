const express = require('express');
const router = express.Router();

const {Room, ActiveRoomList} = require('../model/rooms');
const {User} = require('../model/users');
const {Word} = require('../model/words');


let sockets = {};

sockets.init = function (server) {
    let activeRoomList = new ActiveRoomList();
    const randomWordCount = 3;

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
                        console.log('flag2');
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
                socket['points'] = 0;

                socket.join(params.room.roomName);

                room.addUser(socket);

                // socket.broadcast.to(params.room.roomName).emit('updateUserList', dsRoom.getActiveUserNames());

                //game logic to check if the game should start or not


                //TODO move this codebase to separate game logic
                if(room.gameState.status === 0){
                    //TODO fix the hard coded 1
                    if (room.userSockets.length > 1) {
                        console.log("************************************");
                        console.log("Game Start");
                        console.log("************************************");

                        Word.findRandom({}, {}, {limit: randomWordCount},function (err, result) {
                            if (err || !result || result.length < randomWordCount) {
                                //TODO add a fail safe event so that the game cancels on an error.
                                return;
                            }

                            console.log(result);


                            room.startGame(result);

                            room.sendGameStateToActiveSocket();
                            room.sendGameStateToOtherSockets(socket['roomName']);


                        });

                    }else{
                        io.to(params.room.roomName).emit('gameState',
                            {
                                status: 'success',
                                game:{
                                    status: room.gameState.status,
                                    _turn: room.gameState._turn,
                                    currentTurn: room.gameState.currentTurn,
                                    activeTurnSocketId: null,
                                    //TODO only current drawer should receive activeWord
                                    activeWord: null,
                                    canvasData: [],
                                    chatData: [],
                                    userList: room.getActiveUserNames()
                                }
                            });
                    }
                }else{
                    room.sendGameStateToActiveSocket();
                    room.sendGameStateToOtherSockets(socket['roomName']);
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
                let room = new Room(params.room.roomName, password);
                room.addUser(socket);
                activeRoomList.addRoom(room);


                socket.join(params.room.roomName);

                socket['userName'] = user.username;
                socket['roomName'] = params.room.roomName;
                socket['token'] = params.token;
                socket['points'] = 0;

                socket.emit('gameState', {
                    status: 'success',
                    game:{
                        status: room.gameState.status,
                        _turn: room.gameState._turn,
                        currentTurn: room.gameState.currentTurn,
                        activeTurnSocketId: null,
                        activeWord: null,
                        canvasData: [],
                        chatData: [],
                        userList: room.getActiveUserNames()
                    }
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
                //TODO send game over
                if (room.userSockets.length <= 1) {
                    io.to(socket['roomName']).emit('gameState',
                        {
                            status: 'success',
                            game:{
                                status: room.gameState.status,
                                _turn: room.gameState._turn,
                                currentTurn: room.gameState.currentTurn,
                                activeTurnSocketId: null,
                                //TODO only current drawer should receive activeWord
                                activeWord: 'GAME OVER',
                                canvasData: [],
                                chatData: [],
                                userList: []
                            }
                        });
                    activeRoomList.removeRoom(socket['roomName']);
                } else {
                    if(room.gameState.activeTurnSocket === socket){
                        room.gameState._turn--;
                        room.nextTurn();
                    }
                    room.sendGameStateToActiveSocket();
                    room.sendGameStateToOtherSockets(socket['roomName']);
                }
            }
        });

        socket.on('createXY', (xy) => {
            if (socket['token'] === undefined ||
                socket['roomName'] === undefined ||

                //TODO check if this slows the process or should I use socket attributes
                activeRoomList.getRoom(socket["roomName"]).getUser(socket)
                !== activeRoomList.getRoom(socket["roomName"]).gameState.activeTurnSocket) {
                return;
            }
            //send to all but this socket
            activeRoomList.getRoom(socket['roomName']).pushCanvasData(xy);
            socket.broadcast.to(socket['roomName']).emit('receiveXY', xy);
        });

        socket.on('createMessage', (message, callback) => {
            if (socket['token'] === undefined) {
                return;
            }
            const room = activeRoomList.getRoom(socket['roomName']);
            // if(room.gameState.status === 1){
            //
            // }

            if(room.gameState.activeWord.trim().toLowerCase() === JSON.parse(message).message.text.trim().toLowerCase()
             && room.gameState.activeTurnSocket !== socket){
                console.log('*****************************************');
                console.log(activeRoomList.getRoom(socket['roomName']).getUser(socket).userName + ' has WON!');
                console.log('*****************************************');

                //TODO increase score for the winning socket
                if(room.nextTurn()){
                    room.sendGameStateToActiveSocket();
                    room.sendGameStateToOtherSockets(socket['roomName']);

                    room.pushChatData(message);
                    socket.broadcast.to(socket['roomName']).emit('receiveMessage', {
                        message
                    });

                }else{
                    //send game over event
                    io.to(socket['roomName']).emit('gameState',
                        {
                            status: 'success',
                            game:{
                                status: room.gameState.status,
                                _turn: room.gameState._turn,
                                currentTurn: room.gameState.currentTurn,
                                activeTurnSocketId: null,
                                activeWord: 'GAME OVER',
                                canvasData: [],
                                chatData: [],
                                userList: []
                            }
                        });
                }



            }else{
                room.pushChatData(message);
                socket.broadcast.to(socket['roomName']).emit('receiveMessage', {
                    message
                });
            }
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

//TODO make activeword only visible to drawer +
//TODO make somebody guessed event and game end event +
//TODO fix turn logic +
//TODO make scoreboard