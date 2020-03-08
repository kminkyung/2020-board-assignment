const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const util = require('../util');

let loginUser = {};


router.get('/', getMainPage);
router.post('/login', loginMember);
router.get('/logout', logoutMember);



/* main login page */
function getMainPage(req, res, next) {
    if(req.session.user) {
        loginUser = req.session.user;
        res.render('home', loginUser);
    } else {
        res.render('main');
    }
}


/* try login */

function loginMember (req, res, next) {
    const {id, password} = req.body;
    const filePath = path.join(__dirname, '..', 'member.txt');

    fs.readFile(filePath, 'utf8', (err, data) => {
        if(err) throw err;
        const memData = JSON.parse(data);
        const registered = memData.filter(v => v.id == id);
        if (registered[0].id !== id || registered[0].password !== password) {
            res.send(`<meta charset="utf-8"><script>alert("등록되지 않은 아이디이거나 비밀번호가 일치하지 않습니다."); location.href="/";</script>`);
        }
        else {
            req.session.user = {
                id: registered[0].id,
                password: registered[0].password,
                name: registered[0].name,
                email: registered[0].email
            };
            loginUser = req.session.user;
            res.render('home', loginUser);
        }
    });
}

function logoutMember(req, res, next) {
    req.session.destroy();
    res.redirect('/');
}


module.exports = router;
