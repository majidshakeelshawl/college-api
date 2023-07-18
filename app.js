const express = require('express');
const cors = require('cors');
const logger = require('morgan');
const app = express();

// Routes
const adminRouter = require('./routes/admin/admin.router');

// middlewares
// app.use(cors({
//     origin: 'http://localhost:9001'
// }
// ));

app.use(logger('dev'));
app.use(express.json());
app.use('/admin', adminRouter);

module.exports = app;
