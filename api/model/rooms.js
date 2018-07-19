


//a data structure to store active users and their information about
//which room they are in and their names

class Room{
    constructor(io, roomName, roomPassword){
        this.io = io;
        this.roomName = roomName;
        this.roomPassword = roomPassword;
        this.userSockets = [];
        this.randomWords= [];
        this.correctGuessSockets = [];
        this.timerMaxLimit = 60;
        this.activeTimerCount = -1;
        this.randomWordCount= 4;
        this.timerInterval = null;

        this.gameState = {
            status: 0,
            _turn: 0,
            currentTurn: 0,
            activeTurnSocket: null,
            activeWord: '',
            canvasData: [],
            chatData: [],
            correctGuessCount: 0
        };
    }

    gameStart(){
        if (this.userSockets.length > 1) {
            console.log("************************************");
            console.log("Game Start");
            console.log("************************************");
            this.gameState.activeWord = this.randomWords[0].key;
                console.log("startGame method rooms.js");
            this.gameState._turn = this.gameState.currentTurn++ % this.userSockets.length;
            this.gameState.activeTurnSocket = this.userSockets[this.gameState._turn];
            this.gameState.status = 1;
            this.activeTimerCount = this.timerMaxLimit;
            this.timerInterval = setInterval(this.timerTick.bind(this),1000);
            return true;
        } else {
           return false;
        }
    }

    timerTick(){
        console.log('tick ', this.activeTimerCount);
        this.activeTimerCount--;
        if (this.activeTimerCount === 0) {
            return this.timerOver();
        }

        this.gameState.activeTurnSocket.to(this.roomName).emit('timer', {
            tick: this.activeTimerCount
        });

        this.gameState.activeTurnSocket.emit('timer', {
            tick: this.activeTimerCount
        });
    }

    timerOver(){
        if(this.nextTurn()){
            console.log('TIME OVER');
            this.sendGameStateToActiveSocket();
            this.sendGameStateToOtherSockets(this.roomName);
        }else{
            this.gameOver(this.io, this.roomName);
            if(this.timerInterval !== null){
                clearInterval(this.timerInterval);
            }
        }
    }

    gameOver(io, roomName){

        let scoreBoard = [];
        for (let i = 0; i < this.userSockets.length; i++) {
            scoreBoard.push({
                userName: this.userSockets[i].userName,
                score: this.userSockets[i].score,
                position: i
            });
        }

        //send game over event
        io.to(roomName).emit('gameState',
            {
                status: 'over',
                game: null,
                scoreBoard: scoreBoard
            });

        // io.sockets.clients(roomName).forEach(function(s){
        //     s.leave(roomName);
        // });

        if(this.timerInterval !== null){
            clearInterval(this.timerInterval);
        }

        activeRoomList.removeRoom(this.roomName);
    }

    gameFailedOver(io, roomName){
        let scoreBoard = [{position: 0, score: 0, userName: 'Everyone left the game!'}];

        //send game over event
        io.to(roomName).emit('gameState',
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

    checkIfAlreadyGuessed(userSocket) {
        if(this.correctGuessSockets.length === 0){
            return false;
        }
        console.log("CHECKIFALREADYGUESSED METHOD!*********************************");
        return this.correctGuessSockets.some(e => e.id === userSocket.id);
    }


    addScore(userSocket){
        console.log("ADDSCORE METHOD!**********************************************");
        this.correctGuessSockets.push(userSocket);
        this.gameState.correctGuessCount++;
        userSocket.score += Math.round(900 / this.gameState.correctGuessCount);
    }

    addScoreToDrawer(userSocket){
        userSocket.score += Math.round(100 * this.gameState.correctGuessCount);
    }

    nextTurn(){
        console.log("NEXTTURN METHOD!**********************************************");
       console.log('this.gameState.currentTurn ',this.gameState.currentTurn);
       console.log('this.gameState._turn ',this.gameState._turn);
       console.log('this.gameState.activeTurnSocket.id ',this.gameState.activeTurnSocket.id);
       console.log('this.randomWords.length', this.randomWords.length);
       console.log('this.randomWordCount', this.randomWordCount);

        if(this.gameState.currentTurn >= this.randomWords.length){
            //game over
            console.log('game over line 44 rooms');
            this.addScoreToDrawer(this.gameState.activeTurnSocket);
            this.gameState.canvasData = [];
            clearInterval(this.timerInterval);
            return false;

        }else{
            this.addScoreToDrawer(this.gameState.activeTurnSocket);
            this.gameState._turn = this.gameState.currentTurn++ % this.userSockets.length;
            console.log("this.gameState._turn after calculation!", this.gameState._turn);
            this.gameState.activeTurnSocket = this.userSockets[this.gameState._turn];
            console.log("this.gameState.activeTurnSocket.id after calculation!", this.gameState.activeTurnSocket.id);
            this.gameState.activeWord = this.randomWords[this.gameState.currentTurn-1].key;
            console.log("this.gameState.activeWord after calculation!", this.gameState.activeWord);
            this.gameState.canvasData = [];
            this.gameState.correctGuessCount = 0;
            console.log("correctGuessSockets before but cleaning!");
            console.log(this.correctGuessSockets.length);
            this.correctGuessSockets = [];
            console.log(this.correctGuessSockets.length);
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
        return this.rooms.map((room) => room.roomName);
    }

}


let activeRoomList = new ActiveRoomList();


module.exports.Room= Room;
module.exports.activeRoomList = activeRoomList;
