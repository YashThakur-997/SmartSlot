let express = require('express');
let app = express();
require('dotenv').config();
let PORT = process.env.PORT;

app.get('/',(req,res)=>{
    res.send('Hello World');
})

app.listen(PORT ,()=>{
    console.log(`Server is running on port ${PORT}`);
})