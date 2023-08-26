const express = require('express');
const cors = require('cors');
const logger = require('morgan');
const app = express();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});


// Routes
const adminRouter = require('./routes/admin/admin.router');
const notificationRouter = require('./routes/notifications/notification.router');
const tenderRouter = require('./routes/tenders/tender.router');
const eventRouter = require('./routes/events/event.router');
// middlewares
app.use(cors({
    origin: '*'
}));

// Serve static files from the "notification_images" directory
app.use('/notification_images', express.static('./www/static/notifications'));
app.use('/tender_images', express.static('./www/static/tenders'));
app.use('/event_images', express.static('./www/static/events'));

app.use(logger('dev'));
app.use(express.json());
app.use('/admin', adminRouter);
app.use('/admin/notifications', notificationRouter);
app.use('/admin/tenders', tenderRouter);
app.use('/admin/events', eventRouter);
app.get('/files/:filename', (req, res) => {
    const filename = req.params.filename;
    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
        bucketName: 'uploads', // Change this to your bucket name
    });
    const downloadStream = bucket.openDownloadStreamByName(filename);
    downloadStream.pipe(res);
});
app.get('/', (req, res) => {
    res.send('Server running');
});
module.exports = app;
