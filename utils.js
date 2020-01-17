const fs = require('fs')

exports.readFile = path => new Promise((resolve, reject) => {
    fs.readFile(path, 'utf8', (err, data) => {
        if(err) {
            reject(err)
            return
        }

        resolve(data)
    })
})

exports.match = (query, obj) => Object.keys(query).every(key => query[key] === obj[key])

exports.find = (query, list) => list.filter(elem => exports.match(query, elem))

exports.findOne = (query, list) => exports.find(query, list)[0]

