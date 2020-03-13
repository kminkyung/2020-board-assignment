const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const util = require('../util');

const memberFile = 'member.json';
const memberPath = path.join(__dirname, '..', memberFile);
const boardFile = 'board.json';
const boardPath = path.join(__dirname, '..', boardFile);

/* main login page */
router.get('/get_member_id/:id', getMemberId);
router.get('/get_member_list', getMemberList);
router.get('/get_board_post/:idx', getBoardPost);
router.get('/get_board_list/:page', getBoardList);
router.post('/update_member_grade', updateGrade);
router.post('/update_member_password', updatePassword);
router.post('/write_board', writeBoard);
router.post('/remove_board_post/:idx', removeBoardPost);
router.post('/update_board', updateBoardPost);


/* REST - Member */
function getMemberId(req, res, next) {
  const id = req.params.id;
  let member = [];

  util.getFileContent(memberPath, (data) => {
    if(data.length == 0) {
      res.send(true);
      return;
    }
    member = data;
    const registered = member.filter(v => v.id == id);
    if(registered[0]) {
      res.send(false);
    } else {
      res.send(true);
    }
  });
}

function getMemberList(req, res, next) {
  util.getFileContent(memberPath, (data) => {
    if(!data) console.error(data);
    res.json(data);
  });
}

function updatePassword(req, res, next) {
  const {id, password} = req.body;

  util.getFileContent(memberPath, (data) => {
    const memData = JSON.parse(data);
    memData.map(v => {
      if(v.id == id) v.password = password;
    });
    util.writeFile(memberFile, memData, (result) => {
      if(!result) console.error(result);
      res.send(util.alertLocation({msg: "수정이 완료되었습니다.", loc: "/"}));
    })
  });
}

function updateGrade(req, res, next) {
  const {id, grade} = req.body;
  fs.readFile(memberPath, 'utf8', (err, data) => {
    if (err) throw err;
    const memData = JSON.parse(data);
    memData.map(v => {
      if(v.id == id) {
        v.grade = parseInt(grade);
      }
    });
    fs.writeFile(memberFile, JSON.stringify(memData), (err) => {
      if (err) console.error(err);
      else {
        res.send({code : 200});
      }
    });
  });
}


/* REST - Board */
function writeBoard(req, res, next) {
  const {id, title, content} = req.body;
  let post = [];
  const info = {};
  info.idx = 1;
  info.id = id;
  info.title = title;
  info.content = content;
  info.date = util.convertDate(new Date(), 4);

  if(util.checkFile(boardPath)) { // 파일이 존재하지 않음
    post.push(info);
    util.writeFile(boardPath, post, (result) => {
      if(!result) console.error(result);
      res.send(util.alertLocation({msg: "작성이 완료되었습니다.", loc: "/"}));
      return;
    });
  }
  else { // 파일 존재
    util.getFileContent(boardPath, (data) => {
      if(!data) { // 파일이 존재하지만, 데이터 없음
        post.push(info);
        util.writeFile(boardPath, post, (result) => {
          if(!result) console.error(result);
          res.send(util.alertLocation({msg: "작성이 완료되었습니다.", loc: "/"}));
          return;
        })
      }
      else { // 파일 존재, 기존 데이터 있음
        post = data;
        let max = 0;
        post.forEach((v) => {
          max = parseInt(v.idx);
          if(parseInt(v.idx) > max) max = parseInt(v.idx);
        });
        info.idx = max + 1;
        post.push(info);
        util.writeFile(boardPath, post, (result) => {
          if(!result) console.error(result);
          res.send(util.alertLocation({msg: "작성이 완료되었습니다.", loc: "/"}));
        })
      }
    })
  }
}

function getBoardPost(req, res, next) {
  const idx = req.params.idx;
  const id = req.body.id; // 필요없을 수도
  util.getFileContent(boardPath, (data) => {
    if(!data) console.error(data);
    const post = data.filter(v => v.idx == idx);
    res.json(post[0]);
  })
}

function getBoardList(req, res, next) {
  const page = req.params.page;
  util.getFileContent(boardPath, (data) => {
    if(!data) console.error(data);
    res.json(data);
  })
}


function removeBoardPost(req, res, next) {
  const idx = req.params.idx;
  const id = req.body.id; // 필요없을 수도
  util.getFileContent(boardPath, (data) => {
    if(!data) console.error(data);
    const removeIndex = data.findIndex(v => v.idx == idx);
    data.splice(removeIndex, 1);
    util.writeFile(boardPath, data, function (result) {
      if(!result) console.error(result);
      res.send({code : 200});
    })
  })
}

function updateBoardPost(req, res, next) {
  const {id, idx, title, content} = req.body;
  util.getFileContent(boardPath, (data) => {
    data.map(v => {
      if(v.idx == idx) {
        v.title = title;
        v.content = content;
      }
    });
    util.writeFile(boardPath, data, (result) => {
      if(!result) console.error(result);
      res.send(util.alertLocation({msg: "수정이 완료되었습니다.", loc: "/"}));
    });
  })
}



module.exports = router;