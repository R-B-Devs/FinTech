const express = require('express');

//  load env variables from .env config file
require('dotenv').config();
const port = process.env.PORT || 3000;

const app = express()

app.get('/', (request, response) => {
    response.send('server is running')
})

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
})