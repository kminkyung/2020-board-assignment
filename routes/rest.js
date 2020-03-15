const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const mt = require('../module/upload');
const util = require('../module/util');

const memberFile = 'member.json';
const memberPath = path.join(__dirname, '..', memberFile);
const boardFile = 'board.json';
const boardPath = path.join(__dirname, '..', boardFile);

/* rest router */
router.get('/get_member_id/:id', getMemberId);
router.get('/get_member_list', getMemberList);
router.get('/get_board_post/:idx', getBoardPost);
router.get('/get_board_list/:page', getBoardList);
router.post('/update_member_grade', updateGrade);
router.post('/update_member_password', updatePassword);
router.post('/write_board', mt.upload.single("upfile"), writeBoard);
router.post('/remove_board_post/:idx', removeBoardPost);
router.post('/update_board', updateBoardPost);


/* REST - Member */
function getMemberId(req, res, next) {
  const id = req.params.id;
  let member = [];

  util.getFileContent(memberPath, (data) => {
    if (data.length == 0) {
      res.send(true);
      return;
    }
    member = data;
    const registered = member.filter(v => v.id == id);
    if (registered[0]) {
      res.send(false);
    } else {
      res.send(true);
    }
  });
}

function getMemberList(req, res, next) {
  util.getFileContent(memberPath, (data) => {
    if (!data) console.error(data);
    res.json(data);
  });
}

function updatePassword(req, res, next) {
  const {id, password} = req.body;
  const login_id = req.session.user.id;

  util.getFileContent(memberPath, (data) => {
    const memData = data;
    memData.map(v => {
      if (v.id == id) v.password = password;
    });
    if (memData.id !== login_id) {
      res.send({code: 401});
      return;
    }
    util.writeFile(memberFile, memData, (result) => {
      if (!result) console.error(result);
      res.send({code: 200});
    })
  });
}

function updateGrade(req, res, next) {
  const {id, grade} = req.body;
  const user_grade = req.session.user.grade;
  if (user_grade !== 9) {
    res.send({code: 401});
    return;
  }
  fs.readFile(memberPath, 'utf8', (err, data) => {
    if (err) throw err;
    const memData = JSON.parse(data);
    memData.map(v => {
      if (v.id == id) {
        v.grade = parseInt(grade);
      }
    });
    fs.writeFile(memberFile, JSON.stringify(memData), (err) => {
      if (err) console.error(err);
      else {
        res.send({code: 200});
      }
    });
  });
}


/* REST - Board */

function divideFile(size, path, name) {
  const mb = 1024 * 1024;
  const div_count = parseInt(Math.ceil(size / mb));
  const file_path = path;
  let file_name = '';

  fs.readFile(file_path, function (err, data) {
    let start = 0;
    let end = mb;
    for (let i = 1; i <= div_count; i++) {
      let target_path = `${file_path}.${i}`;
      let sub_file = data.slice(start, end);
      file_name += `${name}.${i} `;
      start = end;
      end += mb;
      if (end > data.length) end = data.length;
      fs.writeFile(target_path, sub_file, (err) => {
        if (err) console.log(err);
      })
    }
    return file_name;
  });
}


function writeBoard(req, res, next) {
  const {id, title, content} = req.body;
  const mb = 1024 * 1024;
  let post = [];
  const info = {};
  info.idx = 1;
  info.id = id;
  info.title = title;
  info.content = content;
  info.orifile = '';
  info.savefile = '';
  info.date = util.convertDate(new Date(), 4);

  // console.log('req.file: ', req.file);
  (async () => {
    if (req.file) { // 첨부파일이 있으면
      info.orifile = req.file.originalname;
      if (req.file.size > mb) { // 있는데 1MB 보다 크다면
        info.savefile = await divideFile(req.file.size, req.file.path, req.file.filename);
        console.log('아왜안되는데왜왜왜', info.savefile);
      } else {
        info.savefile = req.file.filename;
      }
    }
    if (util.checkFile(boardPath)) { // board.json 파일이 존재하지 않음
      post.push(info);
      util.writeFile(boardPath, post, (result) => {
        if (!result) console.error(result);
        res.send(util.alertLocation({msg: "작성이 완료되었습니다.", loc: "/"}));
        return;
      })
    } else { // board.json 파일 존재
      util.getFileContent(boardPath, (data) => {
        if (!data) { // board.json 파일이 존재하지만, 데이터 없음
          post.push(info);
          util.writeFile(boardPath, post, (result) => {
            if (!result) console.error(result);
            res.send(util.alertLocation({msg: "작성이 완료되었습니다.", loc: "/"}));
            return;
          })
        } else { // board.json 파일 존재, 기존 데이터 있음
          post = data;
          let max = 0;
          post.forEach((v) => {
            max = parseInt(v.idx);
            if (parseInt(v.idx) > max) max = parseInt(v.idx);
          });
          info.idx = max + 1;
          post.push(info);
          util.writeFile(boardPath, post, (result) => {
            if (!result) console.error(result);
            res.send(util.alertLocation({msg: "작성이 완료되었습니다.", loc: "/"}));
          })
        }
      })
    }
  })();


}

function getBoardPost(req, res, next) {
  const idx = req.params.idx;
  const id = req.body.id; // 필요없을 수도
  util.getFileContent(boardPath, (data) => {
    if (!data) console.error(data);
    const post = data.filter(v => v.idx == idx);
    res.json(post[0]);
  })
}

function getBoardList(req, res, next) {
  const page = parseInt(req.params.page); // 0
  const list_count = 10;
  const result = {};
  let is_next = false;
  let total = 0;
  let end_index = 0; // 51
  let start_index = 0; // 41
  let page_count = 0; // 6

  util.getFileContent(boardPath, (data) => {
    if (!data) console.error(data);

    total = data.length; // 51
    end_index = data.length - page * list_count;
    start_index = end_index - list_count;
    page_count = Math.ceil(total / list_count);


    if (page + 1 < page_count) is_next = true;
    const list = data.slice(Math.sign(start_index) === -1 ? 0 : start_index, end_index).sort((a, b) => b.idx - a.idx);
    result.list = list;
    result.is_next = is_next;
    res.json(result);
  })
}


function removeBoardPost(req, res, next) {
  const idx = req.params.idx;
  const {id, grade} = req.session.user;
  util.getFileContent(boardPath, (data) => {
    if (!data) console.error(data);
    const removeIndex = data.findIndex(v => v.idx == idx);
    if (removeIndex.id !== id && grade !== 9) {
      res.send({code: 401});
      return;
    }
    data.splice(removeIndex, 1);
    util.writeFile(boardPath, data, function (result) {
      if (!result) console.error(result);
      res.send({code: 200});
    })
  })
}

function updateBoardPost(req, res, next) {
  const {idx, title, content} = req.body;
  const {id, grade} = req.body.session.user;
  util.getFileContent(boardPath, (data) => {
    data.map(v => {
      if (v.idx == idx) {
        v.title = title;
        v.content = content;
      }
    });
    if (id !== data.id && grade !== 9) {
      res.send(util.alertLocation({msg: "권한이 없습니다..", loc: "/"}));
      return;
    }
    util.writeFile(boardPath, data, (result) => {
      if (!result) console.error(result);
      res.send(util.alertLocation({msg: "수정이 완료되었습니다.", loc: "/"}));
    });
  })
}


module.exports = router;