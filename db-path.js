const fs = require('fs')
const path = require('path')
const os = require('os')

const dbPath = path.join(os.homedir(), 'db')
if(!fs.existsSync(dbPath)) {
    fs.mkdirSync(dbPath)
}

module.exports = dbPath