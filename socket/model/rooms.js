

//a data structure to store active users and their information about
//which room they are in and their names


class Room{

    constructor(roomName, roomPassword){
        this.roomName = roomName;
        this.roomPassword = roomPassword;
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