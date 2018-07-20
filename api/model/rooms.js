const moment = require('moment');

class Room{

    constructor(io, roomName, roomPassword, minPlayerCount, maxPlayerCount){
        //setting room configs
        this.io = io;
        this.roomName = roomName;
        this.roomPassword = roomPassword;
        this.userSockets = [];
        this.randomWords= [];
        this.correctGuessSockets = [];
        this.minPlayerCount = minPlayerCount;
        this.maxPlayerCount = maxPlayerCount;

        //Timer
        this.timerMaxLimit = 60;
        this.activeTimerCount = -1;
        this.randomWordCount= 4;
        this.timerInterval = null;

        //gameState the server stores
        this.gameState = {
            status: 0,
            _turn: 0,
            currentTurn: 0,
            activeTurnSocket: null,
            activeWord: '',
            canvasData: [],
            chatData: []
        };
    }

    gameStart(){
        if (this.userSockets.length >= this.minPlayerCount) {
            //the first random word in the room
            //randomWords array got words while creating the room
            this.gameState.activeWord = this.randomWords[0].key;

            //The _turn variable stores the array indexes of the current turns.
            this.gameState._turn = this.gameState.currentTurn++ % this.userSockets.length;

            this.gameState.activeTurnSocket = this.userSockets[this.gameState._turn];

            //status 1 means the game is active
            this.gameState.status = 1;

            //max time in the room per draw turn
            this.activeTimerCount = this.timerMaxLimit;

            //starting the timer
            this.timerInterval = setInterval(this.timerTick.bind(this),1000);

            //returning true so that would mean start the game
            return true;
        } else {
            //return false because there are not enough players
           return false;
        }
    }

    timerTick(){
        //decrease time on every interval
        this.activeTimerCount--;
        if (this.activeTimerCount === 0) {
            return this.timerOver();
        }

        //emit the time to clients
        this.io.to(this.roomName).emit('timer', {
            tick: this.activeTimerCount
        });
    }

    timerOver(){
        //if there are a next turn available
        if(this.nextTurn()){
            this.sendGameStateToActiveSocket();
            this.sendGameStateToOtherSockets(this.roomName);
        }else{
            //it was the last round so end the game
            this.gameOver();
            if(this.timerInterval !== null){
                clearInterval(this.timerInterval);
            }
        }
    }

    gameOver(){

        //create a scoreboard
        let scoreBoard = [];
        for (let i = 0; i < this.userSockets.length; i++) {
            scoreBoard.push({
                userName: this.userSockets[i].userName,
                score: this.userSockets[i].score,
                position: i
            });
        }

        //send game over event
        this.io.to(this.roomName).emit('gameState',
            {
                status: 'over',
                game: null,
                scoreBoard: scoreBoard
            });

        if(this.timerInterval !== null){
            clearInterval(this.timerInterval);
        }

        activeRoomList.removeRoom(this.roomName);
    }

    gameFailedOver(){
        let scoreBoard = [{position: 0, score: 0, userName: 'Everyone left the game!'}];

        //send game over event
        this.io.to(this.roomName).emit('gameState',
            {
                status: 'over',
                game: null,
                scoreBoard: scoreBoard
            });
        if(this.timerInterval !== null){
            clearInterval(this.timerInterval);
        }
        activeRoomList.removeRoom(this.roomName);
    }

    checkIfGuessed(userSocket, message){
        const text = JSON.parse(message).message.text.trim().toLowerCase();
        if (this.gameState.activeWord.trim().toLowerCase() === text
            && this.gameState.activeTurnSocket !== userSocket) {
            if (!this.checkIfAlreadyGuessed(userSocket)) {
                this.addScore(userSocket);
            } else {
                message = JSON.parse(message);
                message.message.userName = userSocket['userName'];
                this.pushChatData(message);
                userSocket.broadcast.to(this.roomName).emit('receiveMessage', {
                    message: JSON.stringify(message)
                });
                return;
            }
            //There is a -1 because a player is drawing and cannot guess
            if (this.correctGuessSockets.length === this.userSockets.length - 1) {
                if (this.nextTurn()) {
                    this.sendGameStateToActiveSocket();
                    this.sendGameStateToOtherSockets();

                } else {
                    this.gameOver();
                    return;
                }
            } else {
                this.sendGameStateToActiveSocket();
                this.sendGameStateToOtherSockets();
            }

            this.pushChatData(message);
            const sendMessage = {
                message: {
                    text: userSocket['userName'] + ' guessed correctly!',
                    createdAt: moment().valueOf(),
                    userName: ''
                }
            };
            this.io.to(this.roomName).emit('receiveMessage', {
                message: JSON.stringify(sendMessage)
            });


        } else {
            message = JSON.parse(message);
            message.message.userName = userSocket['userName'];
            this.pushChatData(message);
            userSocket.broadcast.to(this.roomName).emit('receiveMessage', {
                message: JSON.stringify(message)
            });
        }
    }

    checkIfAlreadyGuessed(userSocket) {
        //quick check to see if the array is empty
        if(this.correctGuessSockets.length === 0){
            return false;
        }
        //returns boolean considering if there is a socket with the id in the array
        return this.correctGuessSockets.some(e => e.id === userSocket.id);
    }


    addScore(userSocket){
        //adding score means player guessed
        this.correctGuessSockets.push(userSocket);
        userSocket.score += Math.round(900 / this.correctGuessSockets.length);
    }

    addScoreToDrawer(userSocket){
        //adds points to the current active drawing player based on how many players guessed
        userSocket.score += Math.round(100 * this.correctGuessSockets.length);
    }

    nextTurn(){
        //add score to the drawer
        this.addScoreToDrawer(this.gameState.activeTurnSocket);

        //check if the game is over
        if(this.gameState.currentTurn >= this.randomWords.length){
            this.gameState.canvasData = [];
            clearInterval(this.timerInterval);
            return false;

        }else{
            //game is not over so moving on to the next turn
            //and resetting some resources
            this.gameState._turn = this.gameState.currentTurn++ % this.userSockets.length;
            this.gameState.activeTurnSocket = this.userSockets[this.gameState._turn];
            this.gameState.activeWord = this.randomWords[this.gameState.currentTurn-1].key;
            this.gameState.canvasData = [];
            this.correctGuessSockets = [];
            this.activeTimerCount = this.timerMaxLimit;

        }
        return true;

    }

    sendGameStateToActiveSocket(){
        this.gameState.activeTurnSocket.emit('gameState',
            {
                status: 'success',
                game:{
                    status: this.gameState.status,
                    _turn: this.gameState._turn,
                    currentTurn: this.gameState.currentTurn,
                    activeTurnSocketId: this.gameState.activeTurnSocket.id,
                    activeWord: this.gameState.activeWord,
                    canvasData: this.gameState.canvasData,
                    chatData: this.gameState.chatData,
                    userList: this.getActiveUsers()
                }
            });
    }

    sendGameStateToOtherSockets(){
        this.gameState.activeTurnSocket.to(this.roomName).emit('gameState',
            {
                status: 'success',
                game:{
                    status: this.gameState.status,
                    _turn: this.gameState._turn,
                    currentTurn: this.gameState.currentTurn,
                    activeTurnSocketId: this.gameState.activeTurnSocket.id,
                    activeWord: '',
                    canvasData: this.gameState.canvasData,
                    chatData: this.gameState.chatData,
                    userList: this.getActiveUsers()
                }
            });
    }

    sendGameStateToSocket(socket){
        socket.emit('gameState',
            {
                status: 'success',
                game:{
                    status: this.gameState.status,
                    _turn: this.gameState._turn,
                    currentTurn: this.gameState.currentTurn,
                    activeTurnSocketId: this.gameState.activeTurnSocket === null ? null : this.gameState.activeTurnSocket.id,
                    activeWord: this.gameState.activeWord,
                    canvasData: this.gameState.canvasData,
                    chatData: this.gameState.chatData,
                    userList: this.getActiveUsers()
                }
            });
    }

    sendGameStateToAllSockets(){
        this.io.to(this.roomName).emit('gameState',
            {
                status: 'success',
                game:{
                    status: this.gameState.status,
                    _turn: this.gameState._turn,
                    currentTurn: this.gameState.currentTurn,
                    activeTurnSocketId: this.gameState.activeTurnSocket === null ? null : this.gameState.activeTurnSocket.id,
                    activeWord: this.gameState.activeWord,
                    canvasData: this.gameState.canvasData,
                    chatData: this.gameState.chatData,
                    userList: this.getActiveUsers()
                }
            });
    }


    pushCanvasData(xy){
        this.gameState.canvasData.push(xy);
    }

    pushChatData(message){
        this.gameState.chatData.push(message);
    }

    addUser(userSocket){
        this.userSockets.push(userSocket);
        return userSocket;
    }

    removeUser(userSocket){
        const user = this.getUser(userSocket);
        if(user){
            this.userSockets = this.userSockets.filter((user)=> user !== userSocket);
        }
        return user;
    }

    getUser(userSocket){
        return this.userSockets.filter((user)=> user === userSocket)[0];
    }

    getActiveUsers(){
        return this.userSockets.map((user) => {
            return {
                userName: user.userName,
                score: user.score
            }
        });
    }

}

class ActiveRoomList{

    constructor(){
        this.rooms = [];
    }

    addRoom(room){
        this.rooms.push(room);
        return room;
    }

    removeRoom(roomName){
        const user = this.getRoom(roomName);

        if(user){
            this.rooms = this.rooms.filter((room)=> room.roomName !== roomName);
        }
        return user;
    }

    getRoom(roomName){
        return this.rooms.filter((room)=> room.roomName === roomName)[0];
    }

    getActiveRoomNames(){
        return this.rooms.map((room) => {
            return {
                roomName: room.roomName,
                slot: room.userSockets.length + ' / '+ room.maxPlayerCount
            };
        });
    }
}


let activeRoomList = new ActiveRoomList();


module.exports.Room= Room;
module.exports.activeRoomList = activeRoomList;
