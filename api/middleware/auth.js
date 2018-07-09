const {User} = require('../model/users');

// auth middleware
const authenticate = (req, res, next) => {
    const token = req.header('x-auth');

    User.findByToken(token).then((user) => {
        if (!user) {
            return Promise.reject();
        }

        req.user = user;
        req.token = token;
        next();
    }).catch((e) => {
        console.log(e);
        res.status(401).send();
    });
};


module.exports.authenticate = authenticate;
