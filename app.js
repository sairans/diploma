const express = require('express');
const app = express();

// Middlewares
app.use(express.json());

// Routes
app.use('/api/users', require('./routes/userRoutes'));

app.get('/', (req, res) => {
  res.send('API is working');
});

module.exports = app;
