const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const util = require('../module/util');
let loginUser = {};

router.get('/', getSignUpPage);
router.post('/member', joinMember);


/* sign up page */
function getSignUpPage(req, res, next) {
  if(req.session.user) {
    loginUser = req.session.user;
    res.render('home', loginUser);
  } else {
    const title = {title: "회원가입 페이지"};
    res.render('signup', title);
  }
}

function joinMember(req, res, next) {
  const fileName = 'member.json';
  const filePath = path.join(__dirname, '..', fileName);
  let member = [];
  const info = {};
  info.id = req.body.id;
  info.password = req.body.password;
  info.name = req.body.name;
  info.email = req.body.email;
  info.grade = 1;

  if(util.checkFile(filePath)) {  // member.json 파일이 존재하지 않음
    member.push(info);
    util.writeFile(filePath, member, (result) => {
      if(!result) console.error(result);
      res.send(util.alertLocation({msg: "가입되었습니다.", loc: "/home"}));
      return;
    })
  }
  else { // member.json 파일 존재
    util.getFileContent(filePath, (data) => {
      if(!data) { // 파일이 존재하지만 member data 없음
        member.push(info);
        util.writeFile(filePath, member, (result) => {
          if(!result) console.error(result);
          res.send(util.alertLocation({msg: "가입되었습니다.", loc: "/"}));
          return;
        })
      }
      else { // 파일이 이미 존재하고 member data 있음
        member = data;
        member.push(info);
        util.writeFile(filePath, member, (result) => {
          if(!result) console.error(result);
          res.send(util.alertLocation({msg: "가입되었습니다.", loc: "/"}));
          return;
        });
      }
    })
  }
}


module.exports = router;