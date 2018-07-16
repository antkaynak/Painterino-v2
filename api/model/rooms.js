

//a data structure to store active users and their information about
//which room they are in and their names


// //TODO should I remove this class and directly use socket object and
// //TODO add properties to it ( e.g token roomName userName on the socket['key'] )
// class ActiveUser{
//     constructor(socketId, mongoId, roomName, userName){
//         this.socketId = socketId;
//         this.mongoId = mongoId;
//         this.roomName = roomName;
//         this.userName = userName;
//     }
// }
//
// class ActiveUserList{
//     constructor(){
//         this.users = [];
//     }
//
//     addUser(user){
//         //starts from 0
//         this.users.push(user);
//         return user;
//     }
//     // users -> 0 '1' 2 3
//     // turnId -> 0 '1' 2 3
//
//     // users -> 0 1 2
//     // turnId -> 0 2 3
//
//     // users -> 0 1 2 3
//     // turnId ->0 2 3
//
//     //------------------
//
//     // users -> 0 '1' 2 3
//     // users -> 0 1 2
//
//
//     removeUser(id){
//         const user = this.getUser(id);
//
//         if(user){
//             this.users = this.users.filter((user)=> user.socketId !== id);
//         }
//         return user;
//     }
//
//     getUser(id){
//         return this.users.filter((user)=> user.socketId === id)[0];
//     }
//
//     getUserFromTurnId(turnId){
//         return this.users.filter((user)=> user.turnId === turnId)[0];
//     }
//
//     // getUserList(roomName){
//     //     const users = this.users.filter((user)=> user.roomName === roomName);
//     //     //const namesArray = users.map((user)=> user.name);
//     //     return users;
//     // }
//
//     getActiveUserNames(){
//         return this.users.map((user) => user.userName);
//     }
//
// }


//TODO store users directly here -> do not use ActiveUserList class
//TODO and inherit its functions
class Room{

    constructor(roomName, roomPassword){
        this.roomName = roomName;
        this.roomPassword = roomPassword;
        this.userSockets = [];
        this.randomWords= [];

        this.gameState = {
            status: 0,
            _turn: 0,
            currentTurn: 0,
            activeTurnSocket: null,
            activeWord: null,
            canvasData: [],
            chatData: []
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

    nextTurn(){
        this.gameState._turn = this.gameState.currentTurn++ % this.userSockets.length;
        this.gameState.activeTurnSocket = this.userSockets[this.gameState._turn];
        this.gameState.canvasData = [];
        this.gameState.activeWord = this.randomWords[this.gameState._turn].key;
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

    getActiveUserNames(){
        return this.userSockets.map((user) => user.userName);
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
