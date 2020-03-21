const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const util = require('../module/util');

let loginUser = {};
const uploadPath = path.join(__dirname, '../public/upload');


router.get('/', getMainPage);

router.post('/login', loginMember);
router.get('/logout', logoutMember);

router.get('/download/', downFile);



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
async function loginMember (req, res, next) {
  const {id, password} = req.body;
  const filePath = path.join(__dirname, '..', 'member.json');
  const no_file = await util.checkFile(filePath);
  if(!no_file) {
    let data = await util.getFileContent(filePath);
    if(!data) {
      res.send(util.alertLocation({msg: "등록되지 않은 아이디이거나 비밀번호가 일치하지 않습니다.", loc: "/"}));
      return;
    }
    else {
      const memData = data;
      const registered = memData.filter(v => v.id == id);
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
  }
  else {
    res.send(util.alertLocation({msg: "서버 오류", loc: "/"}));
  }
}

function logoutMember(req, res, next) {
  req.session.destroy();
  res.redirect('/');
}


function downFile(req, res, next) {
  const filename = req.query.filename;
  const downname = req.query.downname;
  const path = uploadPath + '/'+ filename;
  res.download(path, downname);
}

module.exports = router;