const express = require('express');
// const credentials = require('facebookCreds.js');


const app = express();
const PORT = 8000;


app.listen(PORT, () => {
    console.log("Server started on PORT", PORT);
})