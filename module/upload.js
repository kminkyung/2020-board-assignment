const multer = require("multer");
const fs = require("fs");
const path = require("path");
const util = require("./util");
const test = require("./upload");
const {v1} = require("uuid");

const getPath = async () => {
  const directory = path.join(__dirname, "../public/upload");
  const no_file = await util.checkFile(directory);
  if (no_file) {
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

// module.exports.getFileName = (file) => {
//   const arr = file.split("."); // "a.txt" => ['a', 'txt];
//   const obj = {};
//   obj.timeInMs = Date.now(); // 1584192923505
//   obj.ext = arr.pop(); // file extension
//   obj.name = obj.timeInMs + "-" + Math.floor(Math.random() * 90 + 10);
//   obj.saveName = obj.name + "." + obj.ext;
//   return obj;
// };

const getuuid = (fileName) => {
  const arr = fileName.split(".");
  const ext = arr.pop();
  let name = v1();
  return name + '.' + ext;
};

const storage = multer.diskStorage({
  destination: async function (req, file, cb) {
    const path = await getPath();
    cb(null, path);
  },
  filename: function (req, file, cb) {
    const filename = getuuid(file.originalname);
    cb(null, filename);
  }
});

// const fileFilter = (req, file, cb) => {
//     cb(null, false);
// };

module.exports.upload = multer({storage: storage, limits: {fileSize : 10485760}}); // 10MB