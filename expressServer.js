const express = require('express')
const app = express()
const path = require('path')
var jwt = require('jsonwebtoken');
var request = require('request');
var mysql = require('mysql');
var auth = require('./lib/auth');

app.set('views', path.join(__dirname, 'views')); // ejs file location
app.set('view engine', 'ejs'); //select view templet engine

app.use(express.static(path.join(__dirname, 'public')));//to use static asset

app.use(express.json());
app.use(express.urlencoded({extended:false}));

var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'root',
    database : 'fintech'
  });

  connection.connect();
  
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

app.post('/authTest', auth, function(req, res){
    res.json(req.decoded);
})


//------------------service start //
app.get('/signup', function(req, res){
    res.render('signup');
})

app.get('/login', function(req, res){
    res.render('login');
})

app.get('/main', function(req, res){
    res.render('main');
})

app.get('/balance', function(req, res){
    res.render('balance');
})

app.get('/qrcode', function(req, res){
    res.render('qrcode');
})

app.get('/qr', function (req, res) {
    res.render('qrReader')
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

app.post('/signup', function(req, res){
    //data req get db store
    var userName = req.body.userName;
    var userEmail = req.body.userEmail;
    var userPassword = req.body.userPassword;
    var userAccessToken = req.body.userAccessToken;
    var userRefreshToken = req.body.userRefreshToken;
    var userSeqNo = req.body.userSeqNo;
    console.log(userName, userAccessToken, userSeqNo);
    var sql = "INSERT INTO fintech.user (name, email, password, accesstoken, refreshtoken, userseqno) VALUES (?,?,?,?,?,?)"
    connection.query(
        sql, // excute sql
        [userName, userEmail, userPassword, userAccessToken, userRefreshToken, userSeqNo], // ? <- value
         function(err, result){
            if(err){
                console.error(err);
                res.json(0);
                throw err;
            }
            else {
                res.json(1)
            }
    })
})

app.post('/login', function(req, res){
    var userEmail = req.body.userEmail;
    var userPassword = req.body.userPassword;
    console.log(userEmail, userPassword)
    var sql = "SELECT * FROM user WHERE email = ?";
    connection.query(sql, [userEmail], function(err, result){
        if(err){
            console.error(err);
            res.json(0);
            throw err;
        }
        else {
            console.log(result);
            if(result.length == 0){
                res.json(3)
            }
            else {
                var dbPassword = result[0].password;
                if(dbPassword == userPassword){
                    var tokenKey = "f@i#n%tne#ckfhlafkd0102test!@#%"
                    jwt.sign(
                      {
                          userId : result[0].id,
                          userEmail : result[0].email
                      },
                      tokenKey,
                      {
                          expiresIn : '10d',
                          issuer : 'fintech.admin',
                          subject : 'user.login.info'
                      },
                      function(err, token){
                          console.log('로그인 성공', token)
                          res.json(token)
                      }
                    )            
                }
                else {

                    res.json(2);
                }
            }
        }
    })
})

app.post('/list',auth, function(req, res){
    //
    // api response body 
    var userId = req.decoded.userId;
    var sql = "SELECT * FROM user WHERE id = ?"
    connection.query(sql,[userId], function(err , result){
        if(err){
            console.error(err);
            throw err
        }
        else {
            console.log(result);
            var option = {
                method : "GET",
                url : "https://testapi.openbanking.or.kr/v2.0/user/me",
                headers : {
                    Authorization : 'Bearer ' + result[0].accesstoken
                },
                qs : {
                    user_seq_no : result[0].userseqno
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
                    res.json(accessRequestResult)
                }
            })
        }
    })
})

app.post("/balance", auth, function(req, res){
    var userId = req.decoded.userId;
    var fin_use_num = req.body.fin_use_num;

    var countnum = Math.floor(Math.random() * 1000000000) + 1;
    var transId = "T991599190U" + countnum; //이용기과번호 본인것 입력

    var sql = "SELECT * FROM user WHERE id = ?"
    connection.query(sql,[userId], function(err , result){
        if(err){
            console.error(err);
            throw err
        }
        else {
            console.log(result);
            var option = {
                method : "GET",
                url : "https://testapi.openbanking.or.kr/v2.0/account/balance/fin_num",
                headers : {
                    Authorization : 'Bearer ' + result[0].accesstoken
                },
                qs : {
                    bank_tran_id : transId,
                    fintech_use_num : fin_use_num,
                    tran_dtime : '20200515114200'
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
                    res.json(accessRequestResult)
                }
            })
        }
    })
})

app.post('/transactionlist', auth, function (req, res) {
    var userId = req.decoded.userId;
    var fin_use_num = req.body.fin_use_num;

    var countnum = Math.floor(Math.random() * 1000000000) + 1;
    var transId = "T991599190U" + countnum; //이용기과번호 본인것 입력

    var sql = "SELECT * FROM user WHERE id = ?"
    connection.query(sql,[userId], function(err , result){
        if(err){
            console.error(err);
            throw err
        }
        else {
            console.log(result);
            var option = {
                method : "GET",
                url : "https://testapi.openbanking.or.kr/v2.0/account/transaction_list/fin_num",
                headers : {
                    Authorization : 'Bearer ' + result[0].accesstoken
                },
                qs : {
                    bank_tran_id : transId,
                    fintech_use_num : fin_use_num,
                    inquiry_type : 'A',
                    inquiry_base : 'D',
                    from_date : '20190101',
                    to_date : '20190101',
                    sort_order : 'D',
                    tran_dtime : '20200515134500'
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
                    res.json(accessRequestResult)
                }
            })
        }
    })
})

app.post('/withdraw', auth, function (req, res) {
    var userId = req.decoded.userId;
    var fin_use_num = req.body.fin_use_num;

    var countnum = Math.floor(Math.random() * 1000000000) + 1;
    var transId = "T991599190U" + countnum; //이용기과번호 본인것 입력

    var sql = "SELECT * FROM user WHERE id = ?"
    connection.query(sql,[userId], function(err , result){
        if(err){
            console.error(err);
            throw err
        }
        else {
            console.log(result);
            var option = {
                method : "POST",
                url : "https://testapi.openbanking.or.kr/v2.0/transfer/withdraw/fin_num",
                headers : {
                    Authorization : 'Bearer ' + result[0].accesstoken,
                    "Content-Type" : "application/json"
                },
                json : {
                    "bank_tran_id": transId,
                    "cntr_account_type": "N",
                    "cntr_account_num": "7832932596",
                    "dps_print_content": "쇼핑몰환불",
                    "fintech_use_num": fin_use_num,
                    "wd_print_content": "오픈뱅킹출금",
                    "tran_amt": "1000",
                    "tran_dtime": "20200424131111",
                    "req_client_name": "홍길동",
                    "req_client_fintech_use_num" : "199159919057870971744807",
                    "req_client_num": "HONGGILDONG1234",
                    "transfer_purpose": "TR",
                    "recv_client_name": "진상언",
                    "recv_client_bank_code": "097",
                    "recv_client_account_num": "7832932596"
                }
            }
            request(option, function(err, response, body){
                if(err){
                    console.error(err);
                    throw err;
                }
                else {
                    console.log(body);
                    if(body.rsp_code == 'A0000'){
                        res.json(1)
                    }
                }
            })
        }
    })
})

app.listen(3000)
