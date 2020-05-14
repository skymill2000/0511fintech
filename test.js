var jwt = require('jsonwebtoken')

var tokenKey = "f@i#n%tne#ckfhlafkd0102test!@#%"
jwt.sign(
  {
  },
  tokenKey,
  {
      expiresIn : '10d',
      issuer : 'fintech.admin',
      subject : 'user.login.info'
  },
  function(err, token){
      console.log('로그인 성공', token)
  }
)
