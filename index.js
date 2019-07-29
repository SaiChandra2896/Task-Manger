const express = require('express')
require('./db/mongoose')

const User = require('./models/user')
const Task = require('./models/task')

const userrouter = require('./routers/user')
const taskrouter = require('./routers/task')

const app = express()
const port = process.env.PORT || 8000

app.use(express.json())//to automatically parse the json to an object

app.use(userrouter)
app.use(taskrouter)

app.listen(port,() =>{
    console.log('Server is up on port '+port)
})

