const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const server = express();

server.use(helmet());
server.use(cors());

server.use(express.json());

server.get('/', (req,res) => {
    res.send("<h1>Welcome to my Volume Profile Server</h1>")
})

module.exports = server;
//need for push