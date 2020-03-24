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
const commentFile = 'comment.json';
const commentPath = path.join(__dirname, '..', commentFile);

/* member */
router.get('/get_member_id/:id', getMemberId);
router.get('/get_member_list', getMemberList);
router.post('/update_member_grade', updateGrade);
router.post('/update_member_password', updatePassword);


/* board */
router.post('/write_board', mt.upload.single("upfile"), writeBoard);
router.post('/write_comment', mt.upload.single("up_cmt_file"), writeComment);
router.get('/recommend_comment/:post_id/:cmt_id', recommendComment);
router.get('/decommend_comment/:post_id/:cmt_id', decommendComment);

router.get('/get_board_list/:page', getBoardList);
router.get('/get_board_post/:idx', getBoardPost);
router.get('/get_board_comment/:idx', getBoardComment);

router.post('/update_board', updateBoardPost);
router.post('/remove_board_post/:idx', removeBoardPost);
router.get('/remove_board_comment/:post_id/:cmt_id', removeBoardComment);
router.post('/update_comment', updateComment);


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
      if (err) {
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
  const {title, content} = req.body;
  const mb = 1024 * 1024;
  let post = [];
  const info = {};
  info.idx = 1;
  info.id = req.session.user.id;
  info.title = title;
  info.content = content;
  info.orifile = req.file ? req.file.originalname : '';
  info.savefile = req.file ? req.file.filename : '';
  info.date = util.convertDate(new Date(), 4);

  if (req.file && req.file.size > mb * 10) {
    res.send(util.alertLocation({msg: "첨부파일 용량이 10MB를 초과했습니다.", loc: "/"}));
    return;
  }
  if (req.file && req.file.size > mb) {
    const data = await divideFile(req.file.size, req.file.path, req.file.filename, req.file.originalname);
    info.orifile = data.ori_name;
    info.savefile = data.file_name;
    fs.unlinkSync(req.file.path);
  }
  const no_file = await util.checkFile(boardPath);
  if (no_file) { // board.json 파일이 존재하지 않음
    post.push(info);
    let result = await util.writeFile(boardPath, post);
    if (!result) console.error(result);
    res.send(util.alertLocation({msg: "작성이 완료되었습니다.", loc: "/"}));
  } else { // board.json 파일 존재
    const data = await util.getFileContent(boardPath);
    post = data;
    let max = 0;
    post.forEach((v) => {
      if (parseInt(v.idx) > max) max = parseInt(v.idx);
    });
    info.idx = max + 1;
    post.push(info);
    let result = await util.writeFile(boardPath, post);
    if (!result) console.error(result);
    res.send(util.alertLocation({msg: "작성이 완료되었습니다.", loc: "/"}));
  }
}


async function writeComment(req, res, next) {
  const {post_id, parent_id, content} = req.body;
  console.log(req.file);
  console.log(req.body);
  let comment = [];
  const info = {};
  info.post_id = post_id;
  info.parent_id = parent_id == undefined ? 0 : parent_id;
  info.cmt_id = 1;
  info.writer = req.session.user.id;
  info.content = content;
  info.step = 1;
  info.indent = 0;
  info.removed = false;
  info.recommended = 0;
  info.not_recommended = 0;
  info.voted_id = [];
  info.date = util.convertDate(new Date(), 4);
  info.orifile = req.file ? req.file.originalname : '';
  info.savefile = req.file ? req.file.filename : '';

  if (!req.session.user) {
    res.send(util.alertLocation({msg: "잘못된 접근입니다.", loc: "/"}));
    return;
  }
  const no_file = await util.checkFile(commentPath);
  if (no_file) { // 파일이 없으면
    comment.push(info);
    const createdFile = await util.writeFile(commentPath, comment); // content를 넣어서 파일 생성
    if (!createdFile) console.log("파일쓰기 실패");
    res.send(util.alertLocation({msg: "댓글이 등록되었습니다.", loc: "/"}));
  }
  else { // 파일이 있으면
    const content = await util.getFileContent(commentPath);
    if (content == '') { // 파일 있음 & 내용 없음
      comment.push(info);
      const createdComment = await util.writeFile(commentPath, comment);
      if (!createdComment) console.log("파일쓰기 실패");
      res.send(util.alertLocation({msg: "댓글이 등록되었습니다.", loc: "/"}));
    }
    else { // 파일 있음 & 내용 있음
      comment = await util.getFileContent(commentPath);

      let non_post_comments = comment.filter(v => v.post_id !== post_id); // 같은 게시글이 아닌 경우
      let post_comments = comment.filter(v => v.post_id == post_id); // 같은 게시글의 댓글들

      if(post_comments.length !== 0) {
        info.cmt_id = post_comments.sort((a, b) => b.cmt_id - a.cmt_id)[0].cmt_id + 1;
      }

      post_comments.map(v => {
        if (info.parent_id == 0) { // 부모댓글 없는 경우
          info.step = v.step + 1;
        }
        else if (v.cmt_id == info.parent_id) { // 부모댓글 있는 경우
          info.indent = v.indent + 1;
          info.step = v.step + 1;
        }
        // else if (v.parent_id == info.parent_id) { // 만약 나중에 쓴 대댓글이 밑으로 오게 하고 싶다면
        //   info.indent = v.indent;
        //   info.step = v.step + 1;
        // }
        else if(v.step >= info.step) {
           v.step++;
        }
      });

      post_comments.push(info);
      comment = [...non_post_comments, ...post_comments];

      const createdComment = await util.writeFile(commentPath, comment);
      if (!createdComment) console.log("파일쓰기 실패");
      res.send(util.alertLocation({msg: "댓글이 등록되었습니다.", loc: "/"}));
    }
  }
}


async function recommendComment(req, res, next) {
  const {post_id, cmt_id} = req.params;
  const id = req.session.user.id;

  let data = await util.getFileContent(commentPath);
  if (!data) console.err(data);

  const target = data.find(v => v.post_id == post_id && v.cmt_id == cmt_id);
  if (target.voted_id.indexOf(id) !== -1) {
    res.json({code: 400});
    return;
  }

  data.map(v => {
    if (v.post_id == post_id && v.cmt_id == cmt_id) {
      v.recommended += 1;
      v.voted_id.push(id);
    }
  });

  const updatedFile = await util.writeFile(commentPath, data);
  if (!updatedFile) console.error(updatedFile);
  res.json({code: 200});
}

async function decommendComment(req, res, next) {
  const {post_id, cmt_id} = req.params;
  const id = req.session.user.id;

  let data = await util.getFileContent(commentPath);
  if (!data) console.err(data);

  const target = data.find(v => v.post_id == post_id && v.cmt_id == cmt_id);
  if (target.voted_id.indexOf(id) !== -1) {
    res.json({code: 400});
    return;
  }

  data.map(v => {
    if (v.post_id == post_id && v.cmt_id == cmt_id) {
      v.not_recommended += 1;
      v.voted_id.push(id);
    }
  });

  const updatedFile = await util.writeFile(commentPath, data);
  if (!updatedFile) console.error(updatedFile);
  res.json({code: 200});
}


async function getBoardPost(req, res, next) {
  const idx = req.params.idx;
  let data = await util.getFileContent(boardPath);
  if (!data) console.error(data);
  const post = data.filter(v => v.idx == idx);
  res.json(post[0]);
}

async function getBoardComment(req, res, next) {
  const idx = req.params.idx;
  let data = await util.getFileContent(commentPath);
  if (!data) console.err(data);
  const comments = data.filter(v => v.post_id == idx);
  comments.sort((a, b) => a.parent_id - b.parent_id).sort((a, b) => a.step - b.step);
  res.json(comments);
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

  let comments = await util.getFileContent(commentPath);
  if (!comments) console.error(comments);

  for (let i = 0; i < data.length; i++) {
    data[i].cmt_count = 0;
    for (let j = 0; j < comments.length; j++) {
      if (data[i].idx == comments[j].post_id) {
        data[i].cmt_count++;
      }
    }
  }

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
  if (savefile !== "") {
    savefile = savefile.split(" ");
    savefile.pop();
    for (let i = 0; i < savefile.length; i++) {
      fs.unlinkSync(path.join(__dirname, `../public/upload/${savefile[i]}`));
    }
  }
  data.splice(removeIndex, 1);
  let result = await util.writeFile(boardPath, data);
  if (!result) console.error(result);
  res.send({code: 200});
}

async function removeBoardComment(req, res, next) {
  const {post_id, cmt_id} = req.params;
  const {id, grade} = req.session.user;
  console.log(id, grade);

  let data = await util.getFileContent(commentPath);
  if (!data) console.error(data);
  const target = data.find(v => v.post_id == post_id && v.cmt_id == cmt_id);
  if (target.writer !== id || grade !== 9) {
    res.send({code: 401});
    return;
  }
  data.map(v => {
    if (v.post_id == post_id && v.cmt_id == cmt_id) {
      v.removed = true;
    }
  });
  const updatedFile = await util.writeFile(commentPath, data);
  if (!updatedFile) console.error(updatedFile);
  res.send({code: 200});
}


async function updateBoardPost(req, res, next) {
  const {idx, title, content} = req.body;
  const {id, grade} = req.session.user;
  const data = await util.getFileContent(boardPath);
  data.map(v => {
    if (v.idx == idx) {
      v.title = title;
      v.content = content;
    }
  });
  if (id !== data.id && grade !== 9) {
    res.send(util.alertLocation({msg: "권한이 없습니다.", loc: "/"}));
    return;
  }
  let result = util.writeFile(boardPath, data);
  if (!result) console.error(result);
  res.send(util.alertLocation({msg: "수정이 완료되었습니다.", loc: "/"}));
}

async function updateComment(req, res, next) {
  const {post_id, cmt_id, comment} = req.body;
  const {id, grade} = req.session.user;


  const data = await util.getFileContent(commentPath);
  if(!data) console.error(data);

  const target = data.filter(v => v.post_id == post_id && v.cmt_id == cmt_id);
  if(target.writer !== id && grade !== 9) {
    res.send({code: 401});
    return;
  }
  data.map(v => {
    if(v.post_id == post_id && v.cmt_id == cmt_id) {
      v.content = comment;
    }
  });

  const updatedFile = await util.writeFile(commentPath, data);
  if(!updatedFile) console.error(updatedFile);
  res.send({code: 200});

}



module.exports = router;