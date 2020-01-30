const NeDB = require('nedb-promises')
const path = require('path')
const dbPath = require('./db-path')
const { readFile, validateSession, validateGradesList } = require('./utils')

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

grades.addFromJSON = (evaluation, session, path, gradeMax=20) =>
    readFile(path)
    .then(data => {
        data = JSON.parse(data)
        return data.students.map(student => ({matricule: student.matricule, grade: student.grade}))
    })
    .then(gradesList => grades.add(evaluation, session, gradesList, gradeMax))

module.exports = grades