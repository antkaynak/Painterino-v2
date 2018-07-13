
const mongoose = require('mongoose');
const random = require('mongoose-simple-random');

const Schema = mongoose.Schema;
const wordSchema =  new Schema({
    key: {
        type: String,
        required: true,
        minlength: 1,
        trim: true,
        unique: true,
    }
});

wordSchema.plugin(random);


const Word = mongoose.model('Word', wordSchema);

module.exports = {
    Word
};
