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

exports.isObject = (thing) => !Array.isArray(thing) && typeof thing === 'object'

exports.isArray = (thing) => Array.isArray(thing)

exports.validateSession = (session) => {
    const currentYear = new Date().getFullYear()
    
    if(session.length !== 7) throw new Error(`wrong session format (MM-YYYY): ${session}`)
    const tokens = session.split('-')
    if(tokens.length !== 2) throw new Error(`wrong session format (MM-YYYY): ${session}`)
    try {
        const month = parseInt(tokens[0], 10)
        const year = parseInt(tokens[1], 10)
        if(month < 1 || month > 12) throw new Error("invalid month")
        if(year > currentYear || year < currentYear - 10) throw new Error("invalid year")
    }
    catch(err) {
        throw new Error(`wrong session format (MM-YYYY): ${session} (${err.message})`)
    }
}

exports.validateGradesList = gradesList => {
    if(!Array.isArray(gradesList)) throw new Error("GradesList must be an Array")
}

exports.setGrade = (gradeList, matricule, grade) => {
    const found = gradeList.filter(grade => grade.matricule === matricule)
    if(found.length > 0) {
        found[0].grade = grade
    }
    else {
        gradeList.push({matricule, grade})
    }
}

