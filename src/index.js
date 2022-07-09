const express = require('express')
const app = express()
require('./db/mongoose.js')
const bodyParser = require('body-parser')
const userRouter = require('./routers/user.js')

app.use(bodyParser.json());
app.use(userRouter)
app.listen(process.env.PORT||'3000', () => {
    console.log('Server is up and running')
})