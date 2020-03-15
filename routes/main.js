const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const util = require('../module/util');

let loginUser = {};


router.get('/', getMainPage);
router.post('/login', loginMember);
router.get('/logout', logoutMember);



/* main login page */
function getMainPage(req, res, next) {
    if(req.session.user) {
        loginUser = req.session.user;
        res.render('home', loginUser);
        return;
    }
    else {
        res.render('main');
    }
}


/* try login */
function loginMember (req, res, next) {
   const {id, password} = req.body;
    const filePath = path.join(__dirname, '..', 'member.json');

    if(!util.checkFile(filePath)) {
      util.getFileContent(filePath, (data) => {
        if(!data) {
          res.send(util.alertLocation({msg: "등록되지 않은 아이디이거나 비밀번호가 일치하지 않습니다.", loc: "/"}));
          return;
        }
        else {
          const memData = data;
          // console.log('memData: ', memData);
          const registered = memData.filter(v => v.id == id);
          // console.log('registered: ', registered);
          if (registered.length == 0 || registered[0].id !== id || registered[0].password !== password) {
            res.send(util.alertLocation({msg: "등록되지 않은 아이디이거나 비밀번호가 일치하지 않습니다.", loc: "/"}));
          }
          else {
            req.session.user = {
              id: registered[0].id,
              password: registered[0].password,
              name: registered[0].name,
              email: registered[0].email,
              grade: registered[0].grade
            };
            loginUser = req.session.user;
            res.render('home', loginUser);
          }
        }
      })
    }
    else {
      res.send(util.alertLocation({msg: "서버 오류", loc: "/"}));
    }
}

function logoutMember(req, res, next) {
    req.session.destroy();
    res.redirect('/');
}


module.exports = router;
