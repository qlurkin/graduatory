const NeDB = require('nedb-promises')
const path = require('path')
const dbPath = require('./db-path')
const { readFile } = require('./utils')

const validateSession = (session) => {
    const currentYear = new Date().getFullYear()
    
    if(session.length !== 7) throw new Error("wrong session format (MM-YYYY)")
    const tokens = session.split('-')
    if(tokens.length !== 2) throw new Error("wrong session format (MM-YYYY)")
    try {
        const month = parseInt(tokens[0], 10)
        const year = parseInt(tokens[1], 10)
        if(month < 1 || month > 12) throw new Error("invalid month")
        if(year > currentYear || year < currentYear - 10) throw new Error("invalid year")
    }
    catch(err) {
        throw new Error(`wrong session format (MM-YYYY): ${err.message}`)
    }
}

const validateGradesList = gradesList => {
    if(!Array.isArray(gradesList)) throw new Error("GradesList must be an Array")
}

const grades = NeDB.create({ filename: path.join(dbPath, 'grades.db'), autoload: true })

grades.add = (evaluation, session, gradesList, gradeMax=20) => {
    validateSession(session)
    validateGradesList(gradesList)
    return grades.insert({
        evaluation,
        session,
        grades: gradesList,
        gradeMax,
        insert: new Date().toJSON()
    })
}

grades.addFromCSV = (evaluation, session, path, sep=';', gradeMax=20) =>
    readFile(path)
    .then(data => {
        const lines = data.split('\n')
        const gradesList = []
        for(let line of lines) {
            line = line.trim()
            const [ matricule, gradeStr ] = line.split(sep)
            const grade = parseFloat(gradeStr.replace(',', '.'))
            gradesList.push({matricule, grade})
        }

        return Promise.resolve(gradesList)
    })
    .then(gradesList => grades.add(evaluation, session, gradesList, gradeMax))

module.exports = grades