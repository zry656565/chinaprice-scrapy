'use strict'

let fs = require('fs')
  , child_process = require('child_process')
  , exec = require('exec')
  , iconv = require('iconv-lite')
  , BufferHelper = require('bufferhelper')
  , request = require('request')
  , baseCurl = fs.readFileSync('./base.sh', 'utf8')

let JAGID = '3189160714'
  , isGetting = false
  , remains = []
  , next = 371
  , total = 2249
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

function HandleExpired(pNo) {
  remains.push(pNo)
  currentRequest--
  if (!isGetting) {
    getJAGID(()=> {
      sendRequest()
    })
  }
}

function getJAGID(callback) {
  isGetting = true
  console.log('Getting JAGID...')
  request.post({
    url: 'http://www.chinaprice.com.cn/fgw/ProxyServlet?server=e450&urls_count=1&url=n13_old_gang/new_result.html?table=B32',
    form: {
      prod_number: 9,
      year1: 2005,
      month1: 1,
      year2: 2011,
      month2: 11,
      s_xingshi: 999,
      all_area: 0,
      sort: 0,
      condi_clause: '%28%28%28B32_rudedata.upday+%3E%3D+%2720050101%27%29+and+%28B32_rudedata.upday+%3C%3D+%2720111131%27%29%29+and+%28varietyid+in+%28select+varietyid+from+B32_variety+where+%28substring%28varietyid%2C1%2C8%29%3D%2730010102%27+and+varietyname%3D%27%C2%DD%CE%C6%B8%D6%27%29%29%29%29+and+B32_rudedata.priceid%3D%27999%27+and+substring%28B32_rudedata.siteid%2C3%2C3%29%21%3D%270%27++order+by+B32_rudedata.varietyid%2CB32_rudedata.areaid%2CB32_rudedata.upday',
      condi_count: '%28%28%28%28B32_rudedata.upday+%3E%3D+%2720050101%27%29+and+%28B32_rudedata.upday+%3C%3D+%2720111131%27%29%29+and+%28varietyid+in+%28select+varietyid+from+B32_variety+where+%28substring%28varietyid%2C1%2C8%29%3D%2730010102%27+and+varietyname%3D%27%C2%DD%CE%C6%B8%D6%27%29%29%29%29%29+and+B32_rudedata.priceid%3D%27999%27+and+substring%28B32_rudedata.siteid%2C3%2C3%29%21%3D%270%27+',
      condi_text: '%D1%A1%B6%A8%B5%C4%C9%CC%C6%B7%A3%BA%C2%DD%CE%C6%B8%D6%A3%BB%A1%A1%C6%F0%D6%B9%C8%D5%C6%DA%A3%BA%B4%D32005%C4%EA1%D4%C2%B5%BD2011%C4%EA11%D4%C2%A3%BB%A1%A1%D1%A1%B6%A8%B5%C4%B5%D8%C7%F8%A3%BA%CB%F9%D3%D0%B1%A8%BC%DB%B5%D8%C7%F8%A3%BB%A1%A1%CF%D4%CA%BE%CB%B3%D0%F2%A3%BA%B0%B4%C9%CC%C6%B7%C5%C5%D0%F2',
      period: '03',
      table: 'B32',
      xingshi: 999,
      pkind: 3001010000
    },
    headers: {
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Encoding': 'gzip, deflate',
      'Accept-Language': 'zh-CN,zh;q=0.8,en;q=0.6,en-US;q=0.4,zh-TW;q=0.2,ja;q=0.2',
      'Authorization': 'Basic RDAzOTkwMDY6NTdKN0RYUjY=',
      'Content-Type': 'application/x-www-form-urlencoded',
      'Cache-Control': 'max-age=0',
      'Connection': 'keep-alive',
      'Cookie': 'JSESSIONID=ABXAk8vdyeXEAgLBfgwk1A; JAGID=' + JAGID,
      'DNT': '1',
      'Origin': 'http://www.chinaprice.com.cn',
      'Host': 'www.chinaprice.com.cn',
      'Referer': 'http://www.chinaprice.com.cn/fgw/ProxyServlet?server=e450&urls_count=1&url=n13_old_gang/new_input.html',
      'Upgrade-Insecure-Requests': 1,
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.102 Safari/537.36'
    }
  }, (err, response, body) => {
    if (err) {
      console.log('Fail to get JAGID.')
      throw err
    }
    let cookies = response.headers['set-cookie']
    for (let i = 0, n = cookies.length; i < n; i++) {
      let results = cookies[i].match(/JAGID=(\d+);/)
      if (results) {
        JAGID = results[1]
        console.log('New JAGID:' + JAGID)
        isGetting = false
        callback()
        return
      }
    }
    console.log('No JAGID, Headers:', response.headers)
  })
}

// execute curl program
function execCurl(pNo) {
  if (pNo > total) return;
  let curl = baseCurl.replace(/\$\{pageNum\}/i, pNo).replace(/\$\{JAGID\}/i, JAGID)
  exec(curl, {encoding: 'buffer'}, (err, buffer, code) => {
      if (err instanceof Error) {
        console.log('Page Num ' + pNo + ' Error!')
        remains.push(pNo)
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
            remains.push(pNo)
            throw err
          }
          console.log('Page Num ' + pNo + ' saved!')
          execCurl(next++)
        });
      } else {
        console.log('Page Num ' + pNo + ' Expired!')
        HandleExpired(pNo)
      }
    })
}