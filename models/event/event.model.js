const mongoose = require('mongoose');

const eventSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
        minlength: 3,
    },
    body: {
        type: String,
        required: true,
        minlength: 3,
    },
    image: {
        data: Buffer,
        contentType: String,
    },
    videoURL: {
        type: String,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    eventDate: {
        type: Date,
        required: true,
    },
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);