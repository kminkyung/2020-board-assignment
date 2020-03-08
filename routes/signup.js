const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
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
  const fileName = 'member.txt';
  const filePath = path.join(__dirname, '..', fileName);
  let member = [];
  const info = {};
  info.id = req.body.id;
  info.password = req.body.password;
  info.name = req.body.name;
  info.email = req.body.email;

  fs.access(filePath, (err) => {
    if (err && err.code == 'ENOENT') {
      member.push(info);
      fs.writeFile(filePath, JSON.stringify(member), (err) => {
        if(err) throw err;
        res.send(`<meta charset="utf-8"><script>alert("가입되었습니다."); location.href="/";</script>`);
      })
    }
    else { // 파일이 이미 존재
      fs.readFile(filePath, 'utf8', (err, data) => {
        if(err) throw err;
        member = JSON.parse(data);
        member.push(info);
        fs.writeFile(filePath, JSON.stringify(member), (err) => {
          if(err) throw err;
          res.send(`<meta charset="utf-8"><script>alert("가입되었습니다."); location.href="/";</script>`);
        })
      });
    }
  });
}





module.exports = router;