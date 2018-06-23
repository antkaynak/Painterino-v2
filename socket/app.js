const express = require('express');
const logger = require('morgan');
const socketIO = require('socket.io');
const moment = require('moment');
const path = require('path');
const http = require('http');

const app = express();
const server = http.createServer(app); //using http server instead of express server
const io = socketIO(server);

io.on('connection', (socket) => {
    console.log('A new user is connected.');

    socket.on('createMessage', (message)=> {
        socket.broadcast.emit('message', message);
    });

    //socket.emit('newMessage', {
    //    from: 'example@com',
    //    text: 'Kappa123',
    //    createdAt: new Date().toString()
    //});
    //
    //
    //
    // socket.on('join', (params, callback)=>{
    //     if(typeof params.name !== 'string' || typeof params.room !== 'string'
    //         || params.name.trim().length === 0 || params.room.trim().length === 0){
    //         return callback('Required params! *name *room');
    //     }
    //
    //     socket.join(params.room);
    //     list.removeUser(socket.id);
    //     list.addUser(new User(socket.id,params.name,params.room));
    //
    //     //not using broadcast because we want to send the list to the newly connected user as well.
    //     io.to(params.room).emit('updateUserList', list.getUserList(params.room));
    //
    //     socket.emit('newMessage',{
    //         from: 'Chat App',
    //         text: 'Welcome',
    //         createdAt: moment().valueOf()
    //     });
    //
    //     socket.broadcast.to(params.room).emit('newMessage', {
    //         from: `${params.room}`,
    //         text: `A new user ${params.name} has joined!`,
    //         createdAt: moment().valueOf()
    //     })
    //
    //
    // });
    //
    // socket.on('disconnect', () => {
    //     console.log('An user was disconnected');
    //     const user = list.removeUser(socket.id);
    //     if(user){
    //         io.to(user.room).emit('updateUserList', list.getUserList(params.room));
    //         io.to(user.room).emit('newMessage',{
    //             from: `${params.room}`,
    //             text: `User ${params.name} left!`,
    //             createdAt: moment().valueOf()
    //         });
    //     }
    // });
    //
    // socket.on('createMessage', (message, callback)=>{
    //     //send to all clients
    //     //io.emit('newMessage', {
    //     //    from: message.from,
    //     //    text: message.text,
    //     //    createdAt: new Date().toString()
    //     //});
    //
    //     //send to all but this socket
    //     socket.broadcast.to(list.getUser(socket.id).room).emit('newMessage', {
    //         from: message.from,
    //         text: message.text,
    //         createdAt: moment().valueOf()
    //     });
    //
    //     console.log('Create email', message);
    //
    //     callback();
    // });
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false}));


module.exports.app = app;
module.exports.server = server;
