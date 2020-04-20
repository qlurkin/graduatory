const xlsx = require('xlsx')

const wb = xlsx.readFile('decrypted.xls')
console.log(Object.keys(wb))
console.log(wb.SheetNames)
console.log(Object.keys(wb.Sheets[wb.SheetNames[0]]))
console.log(wb.Sheets[wb.SheetNames[0]]['!ref'])
console.log(wb.Sheets[wb.SheetNames[0]]['D4'])
wb.Sheets[wb.SheetNames[0]]['D5'] = 18.5

xlsx.writeFile(wb, 'decrypted.xls')