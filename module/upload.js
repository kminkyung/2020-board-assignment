const multer = require("multer");
const fs = require("fs");
const path = require("path");
const util = require("./util");
const test = require("./upload");


const getPath = () => {
  const directory = path.join(__dirname, "../public/upload");
  console.log('true|false 가 나와야 하는데..', util.checkFile(directory));
  if (util.checkFile(directory)) {
    fs.mkdir(directory, (err) => {
      if (err) {
        console.error("폴더 생성 실패");
        return;
      }
      console.log("폴더 생성 완료");
    });
  }
  return directory;
};

module.exports.getFileName = (file) => {
  const arr = file.split("."); // "a.txt" => ['a', 'txt];
  const obj = {};
  obj.timeInMs = Date.now(); // 1584192923505
  obj.ext = arr.pop(); // file extension
  obj.name = obj.timeInMs + "-" + Math.floor(Math.random() * 90 + 10);
  obj.saveName = obj.name + "." + obj.ext;
  return obj;
};


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, getPath());
  },
  filename: function (req, file, cb) {
    const filename = test.getFileName(file.originalname);
    console.log(filename);
    cb(null, filename.saveName);
  }
});

// const fileFilter = (req, file, cb) => {
//   console.log('filter_req: ', req);
//   console.log('filter_file: ', file);
//     cb(null, false);
// };

module.exports.upload = multer({storage: storage, limits: {fileSize : 10485760}}); // 10MB