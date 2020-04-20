const NeDB = require('nedb-promises')
const path = require('path')
const dbPath = require('./db-path')
const { readFile, validateSession, validateGradesList, setGrade } = require('./utils')

const grades = NeDB.create({ filename: path.join(dbPath, 'grades.db'), autoload: true })

grades.create = (evaluation, session, gradesList=[], gradeMax=20) => {
    validateSession(session)
    validateGradesList(gradesList)
    return grades.find({evaluation, session}).then(docs => {
        if(docs.length > 0) {
            throw new Error(`${evaluation} ${session} already exists`)
        }
        return grades.insert({
            evaluation,
            session,
            grades: gradesList,
            gradeMax,
            insert: new Date().toJSON()
        })
    })
}

grades.updateGradesList = (evaluation, session, gradesList) => {
    return grades.find({evaluation, session}).then(docs => {
        if(docs.length === 0) {
            throw new Error(`${evaluation} ${session} don't exists`)
        }
        const grade = docs[0]
        gradesList.forEach(elem => {
            setGrade(grade.grades, elem.matricule, elem.grade)
        })

        return grades.update({_id: grade._id}, grade)
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
    .then(gradesList => grades.create(evaluation, session, gradesList, gradeMax))

grades.addFromJSON = (evaluation, session, path, gradeMax=20) =>
    readFile(path)
    .then(data => {
        data = JSON.parse(data)
        return data.students.map(student => ({matricule: student.matricule, grade: student.grade}))
    })
    .then(gradesList => grades.create(evaluation, session, gradesList, gradeMax))

module.exports = grades