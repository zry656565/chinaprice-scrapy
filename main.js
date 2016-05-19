'use strict'

let fs = require('fs')
  , exec = require('exec')
  , iconv = require('iconv-lite')
  , BufferHelper = require('bufferhelper')
  , baseCurl = fs.readFileSync('./base.sh', 'utf8')

let isGetting = false
  , remains = []
  , next = 107
  , total = 108
  , maxRequest = 5
  , currentRequest = 0
  , targetFile = './data/output.csv'

sendRequest()

function sendRequest() {
  for (; currentRequest < maxRequest; currentRequest++) {
    execCurl(getNext())
  }
}

function getNext() {
  if (remains.length) return remains.pop()
  return next++
}

// execute curl program
function execCurl(pNo) {
  if (pNo > total) return;
  let curl = baseCurl.replace(/\$\{pageNum\}/i, pNo)
  exec(curl, {encoding: 'buffer'}, (err, buffer, code) => {
      if (err instanceof Error) {
        console.log('Page Num ' + pNo + ' Error!')
        throw err
      }
      if (!buffer) return
      let bufHelp = new BufferHelper()
      bufHelp.concat(buffer)
      let str = iconv.decode(bufHelp.toBuffer(), 'gb2312')
      let res = str.match(/<table border='1' width= 778 cellspacing='0' bordercolorlight='#EFEFEF' bordercolordark='#CACACA'>(.+)<\/table>/i)
      if (res) {
        let arr = res[1].match(/<TD bgcolor='#F0F8FF'\s*>\S+\s*<\/TD>/ig)
        arr = arr.map((td)=>{return td.match(/<TD bgcolor='#F0F8FF'\s*>(\S+)\s*<\/TD>/i)[1]})
        str = ''
        for (let i = 0; i < arr.length; i++) {
          str += arr[i]
          str += i % 8 === 7 ? '\n' : '|'
        }
        fs.appendFile(targetFile, str, (err) => {
          if (err) {
            console.log('Page Num ' + pNo + ' Error!')
            throw err
          }
          console.log('Page Num ' + pNo + ' saved!')
          execCurl(next++)
        });
      } else {
        console.log('Page Num ' + pNo + ' Expired!')
      }
    })
}