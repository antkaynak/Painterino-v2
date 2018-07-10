

//a data structure to store active users and their information about
//which room they are in and their names


class ActiveUser{
    constructor(socketId, mongoId, roomName, userName){
        this.socketId = socketId;
        this.mongoId = mongoId;
        this.roomName = roomName;
        this.userName = userName;
    }
}

class ActiveUserList{
    constructor(){
        this.users = [];
    }

    addUser(user){
        this.users.push(user);
        return user;
    }

    removeUser(id){
        const user = this.getUser(id);

        if(user){
            this.users = this.users.filter((user)=> user.socketId !== id);
        }
        return user;
    }

    getUser(id){
        return this.users.filter((user)=> user.socketId === id)[0];
    }

    // getUserList(roomName){
    //     const users = this.users.filter((user)=> user.roomName === roomName);
    //     //const namesArray = users.map((user)=> user.name);
    //     return users;
    // }

    getActiveUserNames(){
        return this.users.map((user) => user.userName);
    }

}

class Room{

    constructor(roomName, roomPassword){
        this.roomName = roomName;
        this.roomPassword = roomPassword;
        this.activeUserList = new ActiveUserList();
        this.canvasData = [];
        this.chatData = [];
    }

    pushCanvasData(xy){
        this.canvasData.push(xy);
    }

    pushChatData(message){
        this.chatData.push(message);
    }

    addUser(user){
        this.activeUserList.addUser(user);
        return user;
    }

    removeUser(socketId){
        this.activeUserList.removeUser(socketId);
    }

    getActiveUserNames(){
        // return this.users.map((user) => user.userName);
        return this.activeUserList.getActiveUserNames();
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

    getAllActiveRoomNames(){
        return this.rooms.map((room) => room.roomName);
    }

}



module.exports.Room= Room;
module.exports.ActiveRoomList = ActiveRoomList;
module.exports.ActiveUser = ActiveUser;