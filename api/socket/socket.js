const express = require('express');
const router = express.Router();

const {Room, ActiveRoomList} = require('../model/rooms');
const {User} = require('../model/users');
const {Word} = require('../model/words');


let sockets = {};

sockets.init = function (server) {
    let activeRoomList = new ActiveRoomList();

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

                const dsRoom = activeRoomList.getRoom(params.room.roomName);
                console.log('*********************************************');
                console.log(dsRoom);
                console.log('*********************************************');

                if (dsRoom) {
                    let paramPassword = params.room.roomPassword === null ? null : params.room.roomPassword.trim();
                    paramPassword = paramPassword === '' ? null : paramPassword;
                    if (dsRoom.roomPassword !== paramPassword) {
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

                socket.join(params.room.roomName);

                dsRoom.addUser(socket);

                // socket.broadcast.to(params.room.roomName).emit('updateUserList', dsRoom.getActiveUserNames());

                //game logic to check if the game should start or not


                //TODO move this codebase to separate game logic
                if(dsRoom.gameState.status === 0){
                    //TODO fix the hard coded 1
                    if (dsRoom.userSockets.length > 1) {
                        console.log("************************************");
                        console.log("Game Start");
                        console.log("************************************");
                        Word.findOneRandom(function (err, result) {
                            if (err || !result.key) {
                                //TODO add a fail safe event so that the game cancels on an error.
                                return;
                            }

                            console.log(result.key);

                            dsRoom.gameState.activeWord = result.key;
                            dsRoom.startGame();

                            io.to(params.room.roomName).emit('gameState',
                                {
                                    status: 'success',
                                    game:{
                                        status: dsRoom.gameState.status,
                                        _turn: dsRoom.gameState._turn,
                                        currentTurn: dsRoom.gameState.currentTurn,
                                        activeTurnSocketId: dsRoom.gameState.activeTurnSocket.id,
                                        //TODO only current drawer should receive activeWord
                                        activeWord: dsRoom.gameState.activeWord,
                                        canvasData: dsRoom.gameState.canvasData,
                                        chatData: dsRoom.gameState.chatData,
                                        userList: dsRoom.getActiveUserNames()
                                    }
                                });
                        });

                    }else{
                        io.to(params.room.roomName).emit('gameState',
                            {
                                status: 'success',
                                game:{
                                    status: dsRoom.gameState.status,
                                    _turn: dsRoom.gameState._turn,
                                    currentTurn: dsRoom.gameState.currentTurn,
                                    activeTurnSocketId: null,
                                    //TODO only current drawer should receive activeWord
                                    activeWord: null,
                                    canvasData: [],
                                    chatData: [],
                                    userList: dsRoom.getActiveUserNames()
                                }
                            });
                    }
                }else{

                    io.to(params.room.roomName).emit('gameState',
                        {
                            status: 'success',
                            game:{
                                status: dsRoom.gameState.status,
                                _turn: dsRoom.gameState._turn,
                                currentTurn: dsRoom.gameState.currentTurn,
                                activeTurnSocketId: dsRoom.gameState.activeTurnSocket.id,
                                //TODO only current drawer should receive activeWord
                                activeWord: dsRoom.gameState.activeWord,
                                canvasData: dsRoom.gameState.canvasData,
                                chatData: dsRoom.gameState.chatData,
                                userList: dsRoom.getActiveUserNames()
                            }
                        });

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

        // socket.on('gameStatusRequest', (params,callback) => {
        //     const dsRoom = activeRoomList.getRoom(socket['roomName']);
        //     console.log('************** FLAG ******************');
        //     const activeTurnSocketId = dsRoom.gameState.status === 0 ? null : dsRoom.gameState.activeTurnSocket.id;
        //
        //     console.log(dsRoom);
        //     console.log(activeTurnSocketId);
        //     const gameState = {
        //         gameState:{
        //             status: dsRoom.gameState.status,
        //             _turn: dsRoom.gameState._turn,
        //             currentTurn: dsRoom.gameState.currentTurn,
        //             activeTurnSocketId: activeTurnSocketId,
        //             //TODO only current drawer should receive activeWord
        //             activeWord: dsRoom.gameState.activeWord,
        //             canvasData: dsRoom.gameState.canvasData,
        //             chatData: dsRoom.gameState.chatData
        //         }
        //     };
        //     console.log(gameState);
        //     socket.to(socket['roomName']).emit('deneme', gameState);
        //     console.log('emitted');
        //     callback('emitted');
        // });

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

                socket.emit('gameState', {
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

                // userList.removeUser(socket.id);
                // userList.addUser(new User(socket.id,params.userName,params.room));

                //not using broadcast because we want to send the list to the newly connected user as well.
                // io.to(params.room.roomName).emit('updateUserList', activeRoomList.getRoom(socket['roomName']).getActiveUserNames());

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
            // const user = userList.removeUser(socket.id);
            if (socket['roomName'] === undefined) {
                return;
            }

            const dsRoom = activeRoomList.getRoom(socket['roomName']);
            if (dsRoom === undefined || dsRoom === null) {
                return;
            }
            const user = dsRoom.removeUser(socket);
            if (user) {
                if (dsRoom.userSockets.length === 0) {
                    activeRoomList.removeRoom(socket['roomName']);
                } else {
                    io.to(socket['roomName']).emit('gameState', {
                        status: 'success',
                        game:{
                            status: dsRoom.gameState.status,
                            _turn: dsRoom.gameState._turn,
                            currentTurn: dsRoom.gameState.currentTurn,
                            activeTurnSocketId: dsRoom.gameState.activeTurnSocket.id,
                            //TODO only current drawer should receive activeWord
                            activeWord: dsRoom.gameState.activeWord,
                            canvasData: dsRoom.gameState.canvasData,
                            chatData: dsRoom.gameState.chatData,
                            userList: dsRoom.getActiveUserNames()
                        }
                    });
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
            const room = activeRoomList.getRoom(socket['roomName'])
            // if(room.gameState.status === 1){
            //
            // }

            if(room.gameState.activeWord === JSON.parse(message).message.text){
                console.log('YOU WON');
            }
            room.pushChatData(message);
            socket.broadcast.to(socket['roomName']).emit('receiveMessage', {
                message
            });
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

