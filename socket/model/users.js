

//a data structure to store active users and their information about
//which room they are in and their names

// const {Room} = require('./rooms');


class User{

    constructor(id,name, room){
        this.id = id;
        this.name = name;
        this.room = room;
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
            this.users = this.users.filter((user)=> user.id !== id);
        }
        return user;
    }

    getUser(id){
        return this.users.filter((user)=> user.id === id)[0];
    }

    getUserList(roomName){
        const users = this.users.filter((user)=> user.room.roomName === roomName);
        //const namesArray = users.map((user)=> user.name);
        return users;
    }
}



module.exports.User= User;
module.exports.ActiveUserList = ActiveUserList;