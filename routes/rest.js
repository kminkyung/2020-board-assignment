const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const util = require('../util');

/* main login page */
router.post('/update_password', updatePassword);
router.get('/get_member_id/:id', getMemberId);

function updatePassword (req, res, next) {
  const {id, password} = req.body;
  const fileName = 'member.txt';
  const filePath = path.join(__dirname, '..', fileName);

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

function getMemberId (req, res, next) {
  const id = req.params.id;
  const fileName = 'member.txt';
  const filePath = path.join(__dirname, '..', fileName);
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

module.exports = router;