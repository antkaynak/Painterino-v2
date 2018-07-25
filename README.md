# Painterino Version 2

A multiuser sketching game where one user draws a word and other players in the room try to guess what it is!

## Some Screenshots

<p align="center">
  <img src="https://github.com/antkaynak/Painterino-v2/blob/master/screenshots/pic1.png" width="350">
  <img src="https://github.com/antkaynak/Painterino-v2/blob/master/screenshots/pic2.png" width="350">
  <img src="https://github.com/antkaynak/Painterino-v2/blob/master/screenshots/pic3.png" width="350">
  <img src="https://github.com/antkaynak/Painterino-v2/blob/master/screenshots/pic4.png" width="350">
</p>


## How to Play
* You have to sign up to play.
* You can create rooms containing minimum 2 and maximum 10 people.
* One player draws a random word shown on the screen and the others try to guess what it is!
* Round does not complete until all player have guessed or the time is up.
* After 10 rounds a score board is shown and the game is over!


### Disclaimer
This project is made for learning purposes.


### Prerequisites

What things you need to install

The backend (api) and the frontend (frontend) are splitted and must be installed accordingly.

```
NodeJS v10.4.0
Angular CLI 6.0.8 is recommended
MongoDB 3.6.6 NoSQL database server.
Compatible IDE, Visual Studio Code is recommended for this project.

```

### Installing


```
You have to create a config.json file with this format
{
  "dev": {
    "PORT": 3000,
    "MONGODB_URI": "mongodb://yourdatabaseurl",
    "JWT_SECRET": "yourjwtsecret"
  },
  "production": {
    "PORT": 3000,
    "MONGODB_URI": "mongodb://yourdatabaseurl",
    "JWT_SECRET": "yourjwtsecret"
  },
  "test": {
    "PORT": 3000,
    "MONGODB_URI": "mongodb://yourdatabaseurl",
    "JWT_SECRET": "yourjwtsecret"
  }
}

Note: If your server provider wants to use its own port, you should remove the port field in your config.json file.

```


### Database 
This application uses NoSQL database MongoDB and a Schema library mongoose.
Mongoose script is below.

```
const Schema = mongoose.Schema;
const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        minlength: 1,
        trim: true,
        unique: true,
        validate: {
            validator: (value) => {
                const re = /^[a-zA-Z0-9_!#$%&’*+/=?`{|}~^.-]+@[a-zA-Z0-9.-]+$/;
                return (value == null || value.trim().length < 1) || re.test(value);
            },
            message: '{VALUE} is not a valid email'
        }
    },
    username: {
        type: String,
        required: true,
        minlength: 1,
        trim: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
    },
    tokens: [{
        access: {
            type: String,
            required: true
        },
        token: {
            type: String,
            required: true
        }
    }]
});

const Schema = mongoose.Schema;
const wordSchema = new Schema({
    key: {
        type: String,
        required: true,
        minlength: 1,
        trim: true,
        unique: true,
    }
});

```

For more details please visit the model folder in the api section.


## Built With

* [MongoDB](https://www.mongodb.com/) - MongoDB 6.3.3
* [ExpressJS](https://expressjs.com/) - ExpressJS 4.16.3
* [Angular 6](https://angular.io/) - Angular 6
* [NodeJS](https://nodejs.org/en/) - NodeJS 10.4.0
* [SocketIO](https://socket.io/) - SocketIO 2.1.1
* [Angular Material](https://material.angular.io/) - Angular Material 6.4.1
* [RxJS](https://rxjs-dev.firebaseapp.com/) - RxJS 6
* [Mongoose Random](https://github.com/larryprice/mongoose-simple-random) - Mongoose Simple Random 0.4.1
* [Moment](https://momentjs.com/) - MomentJS 2.22.2
* [Ngx Color Picker](https://www.npmjs.com/package/ngx-color-picker) - Ngx Color Picker 6.4.0
* [Lodash](https://lodash.com/) - Lodash 4.17.10

For more information please visit api/package.json and frontend/package.json files.


## Known Bugs
* When the last drawing player disconnects while drawing the turn do not switch. 
* The chat window does not scroll properly when a new message arrives.
* If you lose the connection with the server in the middle of the game it bugs out and you have to refresh.
* Some UI bugs in mobile.

## Contributing

If you want to contribute to this project you can e-mail me - antkaynak1@gmail.com
or you can pull request.

## Versioning

This project uses git as its version control system.


## Authors 

* **Ant Kaynak** - *Initial work* - [Github](https://github.com/antkaynak)


## License

This project is licensed under the  Apache License - see the [LICENSE.md](https://github.com/antkaynak/Painterino-v2/blob/master/LICENSE) file for details.

# Questions
If you have any questions mail me at  antkaynak1@gmail.com


