const express = require('express');
const router = express.Router();
const {ObjectID} = require('mongodb');
const {User} = require('../model/users');
const _ = require('lodash');
const {authenticate} = require('../middleware/auth');


// POST /users
router.post('/users', (req, res) => {
    const body = _.pick(req.body, ['email', 'username','password', 'passwordConfirm']);
    if(body.password !== body.passwordConfirm){
        return res.status(400).send('Passwords do not match.');
    }
    const user = new User(body);

    user.save().then(() => {
        return user.generateAuthToken();
    }).then((token) => {
        res.set({
            "x-auth": token,
            "Access-Control-Expose-Headers":"x-auth"
        }).send(user);
    }).catch((e) => {
        res.status(400).send(e);
    })
});

router.get('/users/me', authenticate, (req, res) => {
    res.send(req.user);
});

router.post('/users/login', (req, res) => {
    const body = _.pick(req.body, ['email', 'password']);

    User.findByCredentials(body.email, body.password).then((user) => {
        return user.generateAuthToken().then((token) => {
            //have to set expose headers so angular can pick it up
            res.set({
                "x-auth": token,
                "Access-Control-Expose-Headers":"x-auth"
            }).send(user);
            // res.header('x-auth', token).send(user);
        });
    }).catch((e) => {
        res.status(400).send();
    });
});

router.delete('/users/me/token', authenticate, (req, res) => {
    req.user.removeToken(req.token).then(() => {
        res.status(200).send();
    }, () => {
        res.status(400).send();
    });
});

module.exports = router;
