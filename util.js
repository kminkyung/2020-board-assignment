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



// module.exports.checkFile = (path, callback) => {
// 	fs.stat(path, (err, stats) => {
// 		if(err && err.code == 'ENOENT') return callback(null, true); /
// 		if(err) return callback(err);
//
// 		return callback(null, !stats.isDirectory());
// 		// 암튼 위의 if문을 통과했다면 err 없고, 폴더가 없으면 띄우는 에러가 안떴다는, 즉 폴더가 있다는 말이니까
// 		// callback으로 err: null, isDirectory(): false를 돌려줌
// 	});
// };
//
// module.exports.updateFile = (path, content, callback) => {
//   fs.readFile(filePath, 'utf8', (err, content) => {
//     if(err) throw err;
//   });
// 	fs.writeFile(path, content, 'utf8', (err) => {
// 		if(err) return callback(err);
// 		callback(true); // 여기까지 왔다면 err 없이 파일이 생성됐으므로 callback으로 err: null을 보낸다.
// 	});
// };





