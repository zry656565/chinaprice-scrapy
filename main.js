'use strict'

let fs = require('fs')
  , child_process = require('child_process')
  , exec = require('exec')
  , iconv = require('iconv-lite')
  , BufferHelper = require('bufferhelper');

let baseCurl = fs.readFileSync('./base.sh', 'utf8')

// if (iconv.encodingExists('gb2312')) console.log('gb2312, OK');

let pageNum = 106;

for (let i = 0; i < 5; i++) {
  execCurl(pageNum++);
}

// execute curl program
function execCurl(pNo) {
  var curl = baseCurl.replace(/\$\{pageNum\}/i, pNo)
  exec(curl, {encoding: 'buffer'}, (err, buffer, code) => {
      if (err instanceof Error) {
        console.log('Page Num ' + pNo + ' Error!');
        throw err;
      }
      if (!buffer) return;
      let bufHelp = new BufferHelper();
      bufHelp.concat(buffer);
      let str = iconv.decode(bufHelp.toBuffer(), 'gb2312');
      let res = str.match(/<table border='1' width= 778 cellspacing='0' bordercolorlight='#EFEFEF' bordercolordark='#CACACA'>(.+)<\/table>/i);
      if (res) {
        let arr = res[1].match(/<TD bgcolor='#F0F8FF'\s*>\S+\s*<\/TD>/ig);
        arr = arr.map((td)=>{return td.match(/<TD bgcolor='#F0F8FF'\s*>(\S+)\s*<\/TD>/i)[1];})
        str = '';
        for (let i = 0; i < arr.length; i++) {
          str += arr[i];
          str += i % 8 === 7 ? '\n' : '|';
        }
        fs.appendFile('output.csv', str, (err) => {
          if (err) {
            console.log('Page Num ' + pNo + ' Error!');
            throw err;
          }
          console.log('Page Num ' + pNo + ' saved!');
          execCurl(pageNum++);
        });
      } else {
        console.log('Page Num ' + pNo + ' Expired!');
      }
    });
}