
//const {mongoose} = require('../db/mongoose');
const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcryptjs = require('bcryptjs');

const Schema = mongoose.Schema;
const userSchema =  new Schema({
    email: {
        type: String,
        required: true,
        minlength: 1,
        trim: true,
        unique: true,
        validate: {
            validator:(value)=>{
                const re = /^[a-zA-Z0-9_!#$%&’*+/=?`{|}~^.-]+@[a-zA-Z0-9.-]+$/;
                return (value == null || value.trim().length < 1) || re.test(value);
            },
            //validator: validator.isEmail,
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
    password:{
        type: String,
        required:true,
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

//overriding json conversion to hide secret data
userSchema.methods.toJSON = function(){
    const user = this;
    const userObject = user.toObject();

    return _.pick(userObject, ['_id', 'email']);
};

//not using arrow function because we want to use 'this' keyword
userSchema.methods.generateAuthToken = function(){
    const user = this;
    if(user.tokens[0] != null){
        return user.save().then(()=> user.tokens[0].token);
    }

    const access = 'auth';
    const token = jwt.sign({
        _id: user._id.toHexString(),
        access
    }, process.env.JWT_SECRET).toString();

    //user.tokens.push({
    //    access,
    //    token
    //});

    user.tokens = user.tokens.concat([{access,token}]);

    return user.save().then(()=> token);
};

userSchema.methods.removeToken  = function(token){
    const user = this;

    return user.update({
        $pull:{
            tokens:{
                token: token
            }
        }
    });
};

//static because we dont access this via a User object but directly User schema
userSchema.statics.findByToken = function(token){
    const User = this;
    let decoded = undefined;
    try{
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    }catch(err){
        return Promise.reject();
    }
    return User.findOne({
        _id: decoded._id,
        'tokens.token': token,
        'tokens.access': 'auth'
    });
};

userSchema.statics.findByCredentials = function(email,password){
    const User = this;
    return User.findOne({email}).then((user)=>{
        if(!user){
            return Promise.reject(); //fires the catch block in the controller
        }

        return new Promise((resolve,reject)=>{
            bcryptjs.compare(password,user.password, (err, response)=>{
                if(response){
                    resolve(user);
                }else{
                    reject();
                }
            });
        });
    });
};

//run event before saving
userSchema.pre('save', function(next){
    const user = this;

    //if the password is modified ( e.g. not hashed )
    if(user.isModified('password')){
        bcryptjs.genSalt(10, (err,salt)=>{
            bcryptjs.hash(user.password,salt, (err, hash)=>{
                user.password = hash;
                next();
            });
        });
    }else{
        next();
    }
});


const User = mongoose.model('User', userSchema);



module.exports = {
    User
};
