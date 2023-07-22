const mongoose = require('mongoose');

const tenderSchema = mongoose.Schema({
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
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    tenderDate: {
        type: Date,
        required: true,
    },
}, { timestamps: true });

module.exports = mongoose.model('Tender', tenderSchema);