const express = require('express')
const app = express()
 
app.get('/', function (req, res) {
    res.send('Hello Express')
})

app.get('/test', function(req, res){
    res.send('Test')
})

app.listen(3000)
