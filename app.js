const express = require('express');
const cors = require('cors');
const logger = require('morgan');
const app = express();

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

module.exports = app;
