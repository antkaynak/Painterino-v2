const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
const socketIO = require('socket.io');
const moment = require('moment');
const path = require('path');
const http = require('http');

const {User, ActiveUserList} = require('./model/users');
const {Room, ActiveRoomList} = require('./model/rooms');


const app = express();
const server = http.createServer(app); //using http server instead of express server
const io = socketIO(server);

const userList = new ActiveUserList();
const roomList = new ActiveRoomList();

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-auth");
    next();
});

io.on('connection', (socket) => {
    console.log('A new user is connected.');

    //socket.emit('newMessage', {
    //    from: 'example@com',
    //    text: 'Kappa123',
    //    createdAt: new Date().toString()
    //});
    //
    //
    //
    socket.on('join', (params, callback)=>{
        console.log(params);
        if(typeof params.userName !== 'string' || typeof params.room.roomName !== 'string'
            || params.userName.trim().length === 0 || params.room.roomName.trim().length === 0){
            return callback('Required params! *userName *room { roomName }');
        }

        const dsRoom = roomList.getRoom(params.room.roomName);
        console.log('dsRoom', dsRoom);
        if(dsRoom){
            console.log('flag1');
            if(dsRoom.password !== null && dsRoom.password !== undefined && dsRoom.password !== params.room.roomPassword) {
                console.log('flag2');
                return callback('Room password is invalid.');
            }
        }else{
            let password = '';
            if(params.room.roomPassword !== null || params.room.roomPassword !== undefined){
                password = params.room.roomPassword;
            }
            roomList.addRoom(new Room(params.room.roomName, password));
        }

        socket.join(params.room.roomName);
        userList.removeUser(socket.id);
        userList.addUser(new User(socket.id,params.userName,params.room));

        //not using broadcast because we want to send the list to the newly connected user as well.
        io.to(params.room.roomName).emit('updateUserList', userList.getUserList(params.room.roomName));

        //old code schema
        // socket.emit('newMessage',{
        //     from: 'Chat App',
        //     text: 'Welcome',
        //     createdAt: moment().valueOf()
        // });
        //
        // socket.broadcast.to(params.room).emit('newMessage', {
        //     from: `${params.room}`,
        //     text: `A new user ${params.name} has joined!`,
        //     createdAt: moment().valueOf()
        // });


    });

    socket.on('disconnect', () => {
        console.log('An user was disconnected');
        const user = userList.removeUser(socket.id);
        console.log(user);
        if(user){
            console.log('flag');
            io.to(user.room).emit('updateUserList', userList.getUserList(user.room.roomName));
            // io.to(user.room).emit('newMessage',{
            //     from: `${params.room}`,
            //     text: `User ${params.name} left!`,
            //     createdAt: moment().valueOf()
            // });
        }
    });

    socket.on('createXY', (xy)=>{
        //send to all clients
        //io.emit('newMessage', {
        //    from: message.from,
        //    text: message.text,
        //    createdAt: new Date().toString()
        //});

        //send to all but this socket
        socket.broadcast.to(userList.getUser(socket.id).room.roomName).emit('receiveXY', xy);
    });

    socket.on('createMessage', (message, callback)=>{
        socket.broadcast.to(userList.getUser(socket.id).room.roomName).emit('receiveMessage', {
            message
        });
        callback();
    });
});


app.get('/lobby/rooms', (req,res)=>{
    const list = roomList.getAllActiveRoomNames();
    res.status(200).send(list);
});

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));



module.exports.app = app;
module.exports.server = server;
