const NeDB = require('nedb-promises')
const path = require('path')
const grades = require('./grades')
const dbPath = require('./db-path')
const { readFile, findOne } = require('./utils')

const students = NeDB.create({ filename: path.join(dbPath, 'students.db'), autoload: true })
students.ensureIndex({ fieldName: 'matricule', unique: true })

students.add = (matricule, firstname, lastname) => students.insert({
    matricule,
    firstname,
    lastname
})

students.addFromJSON = (path) =>
    readFile(path)
    .then(data => JSON.parse(data).users)
    .then(users => Promise.all(Object.keys(users).map(matricule => {
        student = users[matricule]
        return students.add(matricule, student.firstname, student.lastname)
    })))

students.show = matricule =>
    grades.find({'grades.matricule': matricule})
    .then(docs => docs.map(doc => ({
        evaluation: doc.evaluation,
        session: doc.session,
        gradeMax: doc.gradeMax,
        grade: findOne({matricule}, doc.grades).grade
    })))
    .then(evaluations =>
        students.findOne({matricule})
        .then(student => Object.assign(student, {grades: evaluations}))
    )

module.exports = students