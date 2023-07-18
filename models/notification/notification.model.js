const mongoose = require('mongoose');

const notificationSchema = mongoose.Schema({
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
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, { timestamps: true });

const Notification = mongoose.model('Notification', notificationSchema);