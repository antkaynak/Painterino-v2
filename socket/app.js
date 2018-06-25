const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
const socketIO = require('socket.io');
const moment = require('moment');
const path = require('path');
const http = require('http');

const {User} = require('./model/users');
const {ActiveUserList} = require('./model/users');

const app = express();
const server = http.createServer(app); //using http server instead of express server
const io = socketIO(server);

const list = new ActiveUserList();

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
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
        if(typeof params.name !== 'string' || typeof params.room !== 'string'
            || params.name.trim().length === 0 || params.room.trim().length === 0){
            return callback('Required params! *name *room');
        }

        socket.join(params.room);
        list.removeUser(socket.id);
        list.addUser(new User(socket.id,params.name,params.room));

        //not using broadcast because we want to send the list to the newly connected user as well.
        io.to(params.room).emit('updateUserList', list.getUserList(params.room));

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
        const user = list.removeUser(socket.id);
        if(user){
            io.to(user.room).emit('updateUserList', list.getUserList(params.room));
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
        socket.broadcast.to(list.getUser(socket.id).room).emit('receiveXY', xy);
    });

    socket.on('createMessage', (message, callback)=>{
        socket.broadcast.to(list.getUser(socket.id).room).emit('receiveMessage', {
            message
        });
        callback();
    });
});


app.get('/lobby/rooms', (req,res)=>{
    let room_list = [];
    let rooms = io.sockets.adapter.rooms;

    for (let room in rooms){
        room_list.push(room);
    }
    console.log(room_list);
    res.status(200).send(room_list);
});

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));



module.exports.app = app;
module.exports.server = server;
