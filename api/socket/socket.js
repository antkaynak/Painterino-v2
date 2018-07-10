
const express = require('express');
const router = express.Router();

const {Room, ActiveRoomList, ActiveUser} = require('../model/rooms');
const {User} = require('../model/users');


let sockets = {};

sockets.init = function(server){
    let activeRoomList = new ActiveRoomList();

    const io = require('socket.io').listen(server);
    io.on('connection', (socket) => {
        console.log('A new user is connected.');

        socket.on('join', (params, callback)=>{
            console.log(params);
            if(typeof params.token !== 'string' || typeof params.room.roomName !== 'string'
                || params.token.trim().length === 0 || params.room.roomName.trim().length === 0){
                return callback('Required params! *token *room { roomName }');
            }

            console.log('params.token');
            console.log(params.token);

            User.findByToken(params.token).then((user) => {
                if (!user) {
                    return Promise.reject();
                }

                const dsRoom = activeRoomList.getRoom(params.room.roomName);
                console.log('*********************************************');
                console.log(dsRoom);
                console.log('*********************************************');

                if(dsRoom){
                    let paramPassword = params.room.roomPassword === null ? null: params.room.roomPassword.trim();
                    paramPassword = paramPassword === '' ? null : paramPassword;
                    if(dsRoom.roomPassword !== paramPassword) {
                        console.log('flag2');
                        socket.emit('joinResponse', {
                            status: 'fail'
                        });
                        return callback('Room password is invalid.');
                    }
                }else{
                    socket.emit('joinResponse', {
                        status: 'fail'
                    });
                    return callback('Room does not exist!');
                }

                socket.join(params.room.roomName);
                dsRoom.activeUserList.addUser(new ActiveUser(socket.id, user._id, params.room.roomName, user.username));
                socket.emit('joinResponse', {
                    status: 'success',
                    game: {
                        activeUserList: activeRoomList.getRoom(params.room.roomName).getActiveUserNames(),
                        canvasData: activeRoomList.getRoom(params.room.roomName).canvasData,
                        chatData: activeRoomList.getRoom(params.room.roomName).chatData
                    }
                });

                socket['roomName'] = params.room.roomName;
                socket['token'] = params.token;
                // userList.removeUser(socket.id);
                // userList.addUser(new User(socket.id,params.userName,params.room));

                socket.broadcast.to(params.room.roomName).emit('updateUserList', activeRoomList.getRoom(socket['roomName']).getActiveUserNames());


            }).catch((e) => {
                console.log(e);
                socket.emit('joinResponse', {
                    status: 'fail'
                });
                return callback(e);
            });

        });

        socket.on('create', (params, callback)=> {
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

                if(dsRoom){
                    socket.emit('createResponse', {
                        status: 'fail'
                    });
                    return callback('Room already exists!');
                }

                // let password = '';
                // if(params.room.roomPassword !== null || params.room.roomPassword !== undefined){
                //     password = params.room.roomPassword;
                // }
                let password = params.room.roomPassword === null ? null : params.room.roomPassword.trim();
                password = password === '' ? null : password;
                console.log(password);
                console.log(params.room.roomPassword);
                let room = new Room(params.room.roomName, password);
                room.activeUserList.addUser(new ActiveUser(socket.id, user._id, params.room.roomName, user.username));
                activeRoomList.addRoom(room);


                socket.join(params.room.roomName);

                socket.emit('createResponse', {
                    status: 'success',
                    game: {
                        activeUserList: room.getActiveUserNames(),
                        // canvas: activeRoomList.getRoom(socket['roomName']).canvasData
                        canvasData: [],
                        chatData: []
                    }

                });

                socket['roomName'] = params.room.roomName;
                socket['token'] = params.token;


                // userList.removeUser(socket.id);
                // userList.addUser(new User(socket.id,params.userName,params.room));

                //not using broadcast because we want to send the list to the newly connected user as well.
                // io.to(params.room.roomName).emit('updateUserList', activeRoomList.getRoom(socket['roomName']).getActiveUserNames());

            }).catch((e) => {
                console.log(e);
                socket.emit('createResponse', {
                    status: 'fail'
                });
                return callback(e);
            });

        });

        socket.on('disconnect', () => {
            console.log('An user was disconnected');
            // const user = userList.removeUser(socket.id);
            if(socket['roomName'] === undefined){
                return;
            }

            const room = activeRoomList.getRoom(socket['roomName']);
            if(room === undefined || room === null){
                return;
            }
            const user = room.activeUserList.getUser(socket.id);
            console.log(user);
            if(user){
                // const counter = io.sockets.clients(socket['roomName']).length;
                if(room.activeUserList.users.length === 1){
                    activeRoomList.removeRoom(socket['roomName']);
                }else{
                    activeRoomList.getRoom(socket['roomName']).activeUserList.removeUser(socket.id);
                    io.to(socket['roomName']).emit('updateUserList', activeRoomList.getRoom(socket['roomName']).getActiveUserNames());
                }
            }
        });

        socket.on('createXY', (xy)=>{
            if(socket['token'] === undefined){
                return;
            }
            //send to all but this socket
            activeRoomList.getRoom(socket['roomName']).pushCanvasData(xy);
            socket.broadcast.to(socket['roomName']).emit('receiveXY', xy);
        });

        socket.on('createMessage', (message, callback)=>{
            if(socket['token'] === undefined){
                return;
            }

            activeRoomList.getRoom(socket['roomName']).pushChatData(message);
            socket.broadcast.to(socket['roomName']).emit('receiveMessage', {
                message
            });
            callback();
        });
    });

    router.get('/rooms', (req,res)=>{
        const list = activeRoomList.getAllActiveRoomNames();
        res.status(200).send(list);
    });
};

sockets.lobbyRouter = router;
module.exports = sockets;

