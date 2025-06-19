const express = require('express');

//  load env variables from .env config file
require('dotenv').config();
const port = process.env.PORT || 3000;

const app = express();

// Middleware to parse JSON
app.use(express.json());

//  Import the route
const authRoutes = require('../backend/routes/auth');

// Use the route
app.use('/api/auth', authRoutes);

app.get('/', (request, response) => {
    response.send('server is running')
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});