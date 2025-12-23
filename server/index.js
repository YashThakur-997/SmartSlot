let express = require('express');
let app = express();
require('dotenv').config();
let PORT = process.env.PORT;

app.get('/',(req,res)=>{
    res.send('Hello World');
})

app.get('/health',(req,res)=>{
    res.send('Server is healthy');
})

app.get('/win',(req,res)=>{
    res.send('winners of  hackcrypt are Team TechNerds');
})

app.listen(PORT ,()=>{
    console.log(`Server is running on port ${PORT}`);
})