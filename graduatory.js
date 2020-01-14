const NeDB = require('nedb-promises')
const fs = require('fs')
const path = require('path')
const os = require('os')

const dbPath = path.join(os.homedir(), 'db')
if(!fs.existsSync(dbPath)) {
    fs.mkdirSync(dbPath)
}

const showError = err => { if(err) console.log(err) }

const students = NeDB.create({ filename: path.join(dbPath, 'students.db'), autoload: true })
students.ensureIndex({ fieldName: 'matricule', unique: true }, showError)

const courses = NeDB.create({ filename: path.join(dbPath, 'courses.db'), autoload: true })
courses.ensureIndex({ fieldName: 'code', unique: true }, showError)

const grades = NeDB.create({ filename: path.join(dbPath, 'grades.db'), autoload: true })

const gr = {
    addStudent: (matricule, firstname, lastname) => students.insert({
        matricule,
        firstname,
        lastname
    }),

    addStudentsFromJSON: (path) => {
        fs.readFile(path, 'utf8', (err, json) => {
            if(err) {
                console.log(err)
            }

            data = JSON.parse(json)
            if(!data.users && typeof(data.users) !== 'object') {
                console.log("Bad JSON Schema")
            }

            for(let matricule in data.users) {
                const student = data.users[matricule]
                if(student.type === 'student') {
                    gr.addStudent(matricule, student.firstname, student.lastname)
                }
            }
        })
    },

    addCourse: (code, name) => courses.insert({
        code,
        name
    }),

    addGrade: (session, courseCode, studentMatricule, grade, gradeMax=20) => Promise.all([
        courses.findOne({code: courseCode}),
        students.findOne({matricule: studentMatricule})
    ]).then(([ course, student ]) => grades.insert({
        student: student._id,
        course: course._id,
        grade,
        gradeMax,
        session
    })),

    listStudents: () => students.find({})
}

module.exports = gr