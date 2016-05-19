'use strict'

let fs = require('fs')

fs.readFile('./data/output.csv', 'utf8', (err, data) => {
  if (err) throw err
  let lines = data.split(/\s/)
    , lineSet = new Set(lines)
    , set = new Set()

  console.log(lines.length, lineSet.size)
  let str = ''
  for (let line of lineSet) {
    str += line + '\n'
  }

  fs.writeFile('./data/unique.csv', str, (err) => {
    if (err) {
      throw err
    }
    console.log('unique.csv saved.')
  });
})