const express = require('express')
const app = express()
const path = require('path')
var request = require('request');

app.set('views', path.join(__dirname, 'views')); // ejs file location
app.set('view engine', 'ejs'); //select view templet engine

app.use(express.static(path.join(__dirname, 'public')));//to use static asset

app.use(express.json());
app.use(express.urlencoded({extended:false}));

app.get('/', function (req, res) {
    var title = "javascript"
    res.send('<html><h1>'+title+'</h1><h2>contents</h2></html>')
})

app.get('/ejs', function(req, res){
    res.render('test')
})

app.get('/test', function(req, res){
    res.send('Test')
})

app.get('/design', function(req, res){
    res.render('designTest');
})

//datasend Router add
app.get('/dataSend', function(req, res){
    res.render('dataSend');
})

app.post('/getTime', function(req, res){
    var nowTime = new Date();
    res.json(nowTime);
})

app.post('/getData', function(req, res){
    console.log(req.body);
    var userData = req.body.userInputData;
    console.log('userData = ', userData);
    res.json(userData + "!!!!!")
})


//------------------service start //
app.get('/signup', function(req, res){
    res.render('signup');
})

app.get('/authResult', function(req, res){
    var authCode = req.query.code
    console.log(authCode);
    var option = {
        method : "POST",
        url : "https://testapi.openbanking.or.kr/oauth/2.0/token",
        header : {
            'Content-Type' : 'application/x-www-form-urlencoded'
        },
        form : {
            code : authCode,
            client_id : 'q7kH44ThJwjpvNRg0BbJvE1yxvx5X53DKz1rNgPF',
            client_secret : 'yVT6irMr2h4ZTHzZY7sDpbvhm1nlOzr4nP7DYRVy',
            redirect_uri : 'http://localhost:3000/authResult',
            grant_type : 'authorization_code'
        }
    }
    request(option, function(err, response, body){
        if(err){
            console.error(err);
            throw err;
        }
        else {
            var accessRequestResult = JSON.parse(body);
            console.log(accessRequestResult);
            res.render('resultChild', {data : accessRequestResult} )
        }
    })
})

app.listen(3000)
