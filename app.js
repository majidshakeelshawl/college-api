const express = require('express');
const cors = require('cors');
const logger = require('morgan');
const app = express();

// Routes
const adminRouter = require('./routes/admin/admin.router');
const notificationRouter = require('./routes/notifications/notification.router');
const tenderRouter = require('./routes/tenders/tender.router');
// middlewares
// app.use(cors({
//     origin: 'http://localhost:9001'
// }
// ));

app.use(logger('dev'));
app.use(express.json());
app.use('/admin', adminRouter);
app.use('/admin/notifications', notificationRouter);
app.use('/admin/tenders', tenderRouter);

module.exports = app;
