
require('./config/config');

const express = require('express');
const socketIO = require('socket.io');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const http = require('http');

const {mongoose} = require('./db/mongoose');
const indexRouter = require('./routes/index');
const apiRouter = require('./routes/api');
const {authenticate} = require('./middleware/auth');
const {Room, ActiveRoomList, ActiveUser} = require('./model/rooms');
const {User} = require('./model/users');


const app = express();
const server = http.createServer(app); //using http server instead of express server
const io = socketIO(server);

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-auth");
    next();
});

let activeRoomList = new ActiveRoomList();

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
            if(dsRoom){
                console.log('flag1');
                if(dsRoom.password !== null && dsRoom.password !== undefined && dsRoom.password !== params.room.roomPassword) {
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
                    canvasData: activeRoomList.getRoom(params.room.roomName).canvasData
                }
            });

            socket['roomName'] = params.room.roomName;
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
            if(dsRoom){
                socket.emit('createResponse', {
                    status: 'fail'
                });
                return callback('Room already exists!');
            }

            let password = '';

            if(params.room.roomPassword !== null || params.room.roomPassword !== undefined){
                password = params.room.roomPassword;
            }
            let room = new Room(params.room.roomName, password);
            room.activeUserList.addUser(new ActiveUser(socket.id, user._id, params.room.roomName, user.username));
            activeRoomList.addRoom(room);


            socket.join(params.room.roomName);

            socket.emit('createResponse', {
                status: 'success',
                game: {
                    activeUserList: room.getActiveUserNames(),
                    // canvas: activeRoomList.getRoom(socket['roomName']).canvasData
                    canvasData: []
                }

            });

            socket['roomName'] = params.room.roomName;


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
        //send to all but this socket
        activeRoomList.getRoom(socket['roomName']).canvasData.push(xy);
        socket.broadcast.to(socket['roomName']).emit('receiveXY', xy);
    });

    socket.on('createMessage', (message, callback)=>{
        socket.broadcast.to(socket['roomName']).emit('receiveMessage', {
            message
        });
        callback();
    });
});


app.get('/lobby/rooms', (req,res)=>{
    const list = activeRoomList.getAllActiveRoomNames();
    res.status(200).send(list);
});

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/api', apiRouter);

module.exports.app = app;
module.exports.server = server;
