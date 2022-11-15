// Node.js에서 파일목록 알아내기
const testFolder = './data/'
const fs = require('fs');

fs.readdir(testFolder, (error, files) => {
  files.forEach(file => {
    console.log(file)})
})