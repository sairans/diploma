const express = require('express');
const app = express();


app.use(express.json());


app.use('/api/users', require('./routes/userRoutes'));

app.get('/', (req, res) => {
  res.send('API is working');
});

module.exports = app;
