const express = require('express');
const cors = require('cors');
const reportRoutes = require('./routes/report.routes');

const app = express();

app.use(cors({ origin: [process.env.CLIENT_URL, 'http://localhost:5173', 'http://localhost:5174'].filter(Boolean) }));
app.use(express.json());

app.use('/', reportRoutes);

module.exports = app;
