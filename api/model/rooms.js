

//a data structure to store active users and their information about
//which room they are in and their names

//TODO move all the game logic to this class and create a parent class called Game

class Room{

    constructor(roomName, roomPassword){
        this.roomName = roomName;
        this.roomPassword = roomPassword;
        this.userSockets = [];
        this.randomWords= [];
        this.randomWordCount = 3;

        this.correctGuessSockets = [];

        this.gameState = {
            status: 0,
            _turn: 0,
            currentTurn: 0,
            activeTurnSocket: null,
            activeWord: null,
            canvasData: [],
            chatData: [],
            correctGuessCount: 0
        };
    }

    startGame(randomWordArray){
        this.randomWords = randomWordArray;
        this.gameState.activeWord = randomWordArray[0].key;
        console.log("startGame method rooms.js");
        this.gameState._turn = this.gameState.currentTurn++ % this.userSockets.length;
        this.gameState.activeTurnSocket = this.userSockets[this.gameState._turn];
        this.gameState.status = 1;
    }

    checkIfAlreadyGuessed(userSocket) {
        return this.correctGuessSockets.some(e => e === userSocket);
    }


    addScore(userSocket){

        this.correctGuessSockets.push(userSocket);
        this.gameState.correctGuessCount++;
        userSocket.score += Math.round(900 / this.gameState.correctGuessCount);
    }

    nextTurn(){
       console.log(this.gameState.currentTurn);
       console.log(this.gameState._turn);
       console.log(this.gameState.activeTurnSocket);

        if(this.gameState.currentTurn >= this.randomWords.length){
            //game over
            console.log('game over line 44 rooms');
            this.gameState.canvasData = [];
            return false;

        }else{
            this.gameState._turn = this.gameState.currentTurn++ % this.userSockets.length;
            this.gameState.activeTurnSocket = this.userSockets[this.gameState._turn];
            this.gameState.activeWord = this.randomWords[this.gameState._turn].key;
            this.gameState.canvasData = [];
            this.gameState.correctGuessCount = 0;
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

    sendGameStateToOtherSockets(roomName){
        this.gameState.activeTurnSocket.to(roomName).emit('gameState',
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



module.exports.Room= Room;
module.exports.ActiveRoomList = ActiveRoomList;
