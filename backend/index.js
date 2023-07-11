require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");

const app = express();

app.use(express.json());
app.use(bodyParser.json());

const uploadRouter = require('./router/FileUpload');
app.use('/api/v1', uploadRouter);

const port = process.env.PORT || 8000;

app.listen(port, () =>  console.log(`Server running on port ${port} 🔥`));