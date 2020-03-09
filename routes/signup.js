const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const util = require('../util');
let loginUser = {};

/* main login page */
router.get('/', getSignUpPage);
router.post('/member', joinMember);

function getSignUpPage (req, res, next) {
  if(req.session.user) {
    loginUser = req.session.user;
    res.render('home', loginUser);
  } else {
    const title = {title: "회원가입 페이지"};
    res.render('signup', title);
  }
}

function joinMember (req, res, next) {
  const fileName = 'member.json';
  const filePath = path.join(__dirname, '..', fileName);
  let member = [];
  const info = {};
  info.id = req.body.id;
  info.password = req.body.password;
  info.name = req.body.name;
  info.email = req.body.email;
  info.grade = 1;

  fs.access(filePath, (err) => {
    if (err && err.code == 'ENOENT') {   // member.json 파일이 존재하지 않음
      member.push(info);
      fs.writeFile(filePath, JSON.stringify(member), (err) => {
        if(err) throw err;
        res.send(util.alertLocation({msg: "가입되었습니다.", loc: "/"}));
      })
    }
    else { // member.json 파일 존재
      fs.readFile(filePath, 'utf8', (err, data) => {
        if(err) throw err;
        if(!data) { // 파일이 존재하지만 member data 없음
          member.push(info);
          fs.writeFile(filePath, JSON.stringify(member), (err) => {
            if(err) throw err;
            res.send(util.alertLocation({msg: "가입되었습니다.", loc: "/"}));
            return;
          })
        }
        else { // 파일이 이미 존재하고 member data 있음
          member = JSON.parse(data);
          member.push(info);
          fs.writeFile(filePath, JSON.stringify(member), (err) => {
            if(err) throw err;
            res.send(util.alertLocation({msg: "가입되었습니다.", loc: "/"}));
          })
        }
      });
    }
  });
}





module.exports = router;