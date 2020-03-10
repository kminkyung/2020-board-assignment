const fs = require('fs');
const path = require('path');

module.exports.alertLocation = (obj) => {
  const html = `<meta charset="utf-8">
                <script>
                  alert("${obj.msg}");
                  location.href = "${obj.loc}";
                </script>`;
  console.log(html);
  return html;
};



module.exports.checkFile = (path) => {
  console.log("체크 파일");
	fs.stat(path, (err, stats) => {
		if(err && err.code == 'ENOENT') return true; // 파일 존재하지 않음 -> 새로 만들어도 됨 true
		if(err) return err;
		return false; // 파일 있음 -> false
	});
};

module.exports.getFileContent = (path, callback) => {
  console.log("파일 읽기");
  fs.readFile(path, 'utf8', (err, content) => {
    if (err) callback(err); // 파일읽기 실패
    callback(JSON.parse(content));
  });
}
  module.exports.writeFile = (path, content, callback) => {
    console.log("파일 쓰기");
    fs.writeFile(path, JSON.stringify(content), 'utf8', (err, data) => {
      if (err) callback(err); // 파일 쓰기 실패
      callback(true);
    });
  }
  





