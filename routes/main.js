const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const splitFile = require('split-file');
const util = require('../module/util');
const boardFile = 'board.json';
const boardPath = path.join(__dirname, '..', boardFile);

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
  
  if(!util.checkFile(filePath)) {
    console.log(`###########`);
    
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



async function downFile(req, res, next) {
  const {idx, filename} = req.query;
  const data = await util.getFileContent(boardPath);
  const match = matcher => x => Object.entries(matcher).every(([k, v]) => x[k] === v);
  const pred = match({idx:Number(idx), orifile:filename});
  const target = data.filter(pred)[0];
  const tempDir = path.join(__dirname, '/../public/temp/');
  const baseDir = path.join(__dirname, '/../public/upload/');
  const tempFiles = fs.readdirSync(tempDir);
  tempFiles.forEach(item => fs.unlinkSync(tempDir+item));
  if (target.savefile.length === 1) {
    const ws = fs.createReadStream(baseDir + target.savefile[0]);
    res.setHeader("Content-Disposition", `attachment; filename=${target.orifile}`);
    ws.pipe(res);
  } else {
    splitFile.mergeFiles(target.savefile, tempDir + target.orifile)
      .then(() => {
        const ws = fs.createReadStream(tempDir + target.orifile);
        res.setHeader("Content-Disposition", `attachment; filename=${target.orifile}`);
        ws.pipe(res);
      })
      .catch((err) => {
        console.log('Error: ', err);
      });
  }
}

module.exports = router;
