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
const uploadPath = path.join(__dirname, '../upload');

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
async function getMemberId(req, res, next) {
  const id = req.params.id;
  let member = [];

  let data = await util.getFileContent(memberPath);
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
}

async function getMemberList(req, res, next) {
  let data = await util.getFileContent(memberPath);
  if (!data) console.error(data);
  res.json(data);
}

async function updatePassword(req, res, next) {
  const {id, password} = req.body;
  const login_id = req.session.user.id;

  let data = await util.getFileContent(memberPath);
  data.map(v => {
    if (v.id == id) v.password = password;
  });
  if (data.id !== login_id) {
    res.send({code: 401});
    return;
  }
  let result = await util.writeFile(memberFile, memData)
  if (!result) console.error(result);
  res.send({code: 200});
}

async function updateGrade(req, res, next) {
  const {id, grade} = req.body;
  const user_grade = req.session.user.grade;
  if (user_grade !== 9) {
    res.send({code: 401});
    return;
  }
  let data = await util.getFileContent(memberPath);
  if (!data) throw err;
  data.map(v => {
    if (v.id == id) {
      v.grade = parseInt(grade);
    }
  });
  let result = util.writeFile(memberPath, data);
  if (!result) console.error(result);
  else {
    res.send({code: 200});
  }
}


/* REST - Board */

const divideFile = async (size, path, name, oriname) => {
  return new Promise((resolve, reject) => {
    const obj = {};
    obj.file_name = '';
    obj.ori_name = '';
    const mb = 1024 * 1024;
    const div_count = parseInt(Math.ceil(size / mb));
    const file_path = path;
    fs.readFile(file_path, function (err, data) {
      if(err) {
        reject(err);
        return;
      }
      let start = 0;
      let end = mb;
      for (let i = 1; i <= div_count; i++) {
        let target_path = `${file_path}.${i}`;
        let sub_file = data.slice(start, end);
        obj.file_name += `${name}.${i} `;
        obj.ori_name += `${oriname}.${i} `;
        start = end;
        end += mb;
        if (end > data.length) end = data.length;
        fs.writeFile(target_path, sub_file, (err) => {
          if (err) reject(err);
        });
      }
      resolve(obj);
    });
  });
};




async function writeBoard(req, res, next) {
  const {id, title, content} = req.body;
  const mb = 1024 * 1024;
  let post = [];
  const info = {};
  info.idx = 1;
  info.id = id;
  info.title = title;
  info.content = content;
  info.orifile = req.file ? req.file.originalname : '';
  info.savefile = req.file ? req.file.filename : '';
  info.date = util.convertDate(new Date(), 4);

  if(req.file && req.file.size > mb * 10) {
    res.send({code: 403});
    return;
  }
  if (req.file && req.file.size > mb) {
    const data = await divideFile(req.file.size, req.file.path, req.file.filename, req.file.originalname);
    info.orifile = data.ori_name;
    info.savefile = data.file_name;
    fs.unlinkSync(req.file.path);
  }
  if (util.checkFile(boardPath)) { // board.json 파일이 존재하지 않음
    post.push(info);
    let result = await util.writeFile(boardPath, post);
    if (!result) console.error(result);
    res.send(util.alertLocation({msg: "작성이 완료되었습니다.", loc: "/"}));
  } else { // board.json 파일 존재
    const data = await util.getFileContent(boardPath);
    post = data;
    let max = 0;
    post.forEach((v) => {
      max = parseInt(v.idx);
      if (parseInt(v.idx) > max) max = parseInt(v.idx);
    });
    info.idx = max + 1;
    post.push(info);
    let result = await util.writeFile(boardPath, post);
    if (!result) console.error(result);
    res.send(util.alertLocation({msg: "작성이 완료되었습니다.", loc: "/"}));
  }
}

async function getBoardPost(req, res, next) {
  const idx = req.params.idx;
  let data = await util.getFileContent(boardPath);
  if (!data) console.error(data);
  const post = data.filter(v => v.idx == idx);
  res.json(post[0]);
}

async function getBoardList(req, res, next) {
  const page = parseInt(req.params.page);
  const list_count = 10;
  const result = {};
  let is_next = false;
  let total = 0;
  let end_index = 0;
  let start_index = 0;
  let page_count = 0;

  let data = await util.getFileContent(boardPath);
  if (!data) console.error(data);

  total = data.length;
  end_index = data.length - page * list_count;
  start_index = end_index - list_count;
  page_count = Math.ceil(total / list_count);

  if (page + 1 < page_count) is_next = true;
  const list = data.slice(Math.sign(start_index) === -1 ? 0 : start_index, end_index).sort((a, b) => b.idx - a.idx);
  result.list = list;
  result.is_next = is_next;
  res.json(result);
}


async function removeBoardPost(req, res, next) {
  const idx = req.params.idx;
  const {id, grade} = req.session.user;
  let data = await util.getFileContent(boardPath);
  if (!data) console.error(data);
  const removeIndex = data.findIndex(v => v.idx == idx);
  if (removeIndex.id !== id && grade !== 9) {
    res.send({code: 401});
    return;
  }

  let savefile = data[removeIndex].savefile;
  if(savefile !== "") {
    savefile = savefile.split(" ");
    savefile.pop();
    for(let i=0; i<savefile.length; i++) {
      fs.unlinkSync(path.join(__dirname, `../public/upload/${savefile[i]}`));
    }
  }
  data.splice(removeIndex, 1);
  let result = await util.writeFile(boardPath, data);
  if (!result) console.error(result);
  res.send({code: 200});
}

async function updateBoardPost(req, res, next) {
  const {idx, title, content} = req.body;
  const {id, grade} = req.body.session.user;
  let data = await util.getFileContent(boardPath);
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
  let result = util.writeFile(boardPath, data);
  if (!result) console.error(result);
  res.send(util.alertLocation({msg: "수정이 완료되었습니다.", loc: "/"}));
}


module.exports = router;