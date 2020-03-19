const fs = require('fs');
const path = require('path');

module.exports.alertLocation = (obj) => {
  const html = `<meta charset="utf-8">
                <script>
                  alert("${obj.msg}");
                  location.href = "${obj.loc}";
                </script>`;
  return html;
};


module.exports.checkFile = (path) => {
  return new Promise((resolve, reject) => {
    fs.stat(path, (err, stats) => {
      if (err && err.code == 'ENOENT') {  // 파일 존재하지 않음 -> 새로 만들어도 됨 true
        resolve(true);
      }
      if (err) reject(err);
      else {
        resolve(false); // 파일 있음 -> false
      }
    });
  })

};


module.exports.getFileContent = (path) => {
  return new Promise((resolve, reject) => {
    fs.readFile(path, 'utf8', (err, content) => {
      if (err) { // 파일읽기 실패
        reject(err);
      }
      if (content == '') {
        resolve([]);
      } else {
        resolve(JSON.parse(content));
      }
    });
  });
};

module.exports.writeFile = (path, content) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(path, JSON.stringify(content), 'utf8', (err, data) => {
      if (err) reject(false); // 파일 쓰기 실패
      else {
        resolve(true);
      }
    });
  })
};


module.exports.convertDate = (d, type) => {
  typeof type !== 'undefined' ? type : 0;
  const monthArr = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"];
  //for (var i=1; i = monthArr; i++) { i+"월"}
  const year = d.getFullYear() + "년 "; // 2019
  const month = monthArr[d.getMonth()] + " "; // 7 (0~11)배열
  const day = d.getDate() + "일"; // 1 ~ 31
  const hour = d.getHours() + "시"; // 0 ~ 23
  const min = d.getMinutes() + "분"; // 0 ~ 59
  const sec = d.getSeconds() + "초"; // 0 ~ 59
  let returnStr;
  /*
  type 0 : 2019-08-11 09:08:12 (ISO date 표기법)
  type 1 : 2019년 8월 11일 11시 11분 11초
  type 2 : 2019년 8월 11일 11시 11분
  type 3 : 2019년 8월 11일 11시
  type 4 : 2019년 8월 11일
  type 5 : 8월 11일
  type 6 : 11시 11분 12초
  */
  switch (type) {
    case 1:
      returnStr = year + month + day + hour + min + sec;
      break;
    case 2:
      returnStr = year + month + day + hour + min;
      break;
    case 3:
      returnStr = year + month + day + hour;
      break;
    case 4:
      returnStr = year + month + day;
      break;
    case 5:
      returnStr = month + day;
      break;
    case 6:
      returnStr = hour + min + sec;
      break;
    default:
      returnStr = d.getFullYear() + '-' + module.exports.zp(d.getMonth() + 1) + '-' + module.exports.zp(d.getDate()) + " " + module.exports.zp(d.getHours()) + ":" + module.exports.zp(d.getMinutes()) + ":" + module.exports.zp(d.getSeconds());
      break;
  }
  return returnStr;
};





