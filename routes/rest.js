const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const util = require('../util');

const fileName = 'member.json';
const filePath = path.join(__dirname, '..', fileName);


/* main login page */
router.post('/update_member_password', updatePassword);
router.post('/update_member_grade', updateGrade);
router.get('/get_member_id/:id', getMemberId);
router.get('/get_member_list', getMemberList);


function updatePassword(req, res, next) {
  const {id, password} = req.body;
  
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) throw err;
    const memData = JSON.parse(data);
    memData.map(v => {
      if(v.id == id) {
        v.password = password;
      }
    });
    fs.writeFile(fileName, JSON.stringify(memData), (err) => {
      if (err) console.error(err);
      else {
        res.send(util.alertLocation({msg: "수정이 완료되었습니다.", loc: "/"}));
      }
    });
  });
}

function updateGrade(req, res, next) {
  const {id, grade} = req.body;
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) throw err;
    const memData = JSON.parse(data);
    memData.map(v => {
      if(v.id == id) {
        v.grade = grade;
      }
    });
    fs.writeFile(fileName, JSON.stringify(memData), (err) => {
      if (err) console.error(err);
      else {
        res.send({code : 200});
      }
    });
  });
}


function getMemberId(req, res, next) {
  const id = req.params.id;
  let member = [];

  fs.readFile(filePath, 'utf8', (err, data) => {
    if(err) throw err;
    if(!data) {
      res.send(true);
      return;
    }
    member = JSON.parse(data);
    const registered = member.filter(v => v.id == id);
    if(registered[0]) {
      res.send(false);
    } else {
      res.send(true);
    }
  });
}

function getMemberList(req, res, next) {
  fs.readFile(filePath, 'utf8', (err, data) => {
    if(err) throw err;
    res.json(data);
  });
}





module.exports = router;