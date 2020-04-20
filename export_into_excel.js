const xlsx = require('xlsx')

const firstRow = 4
const matriculeColumn = 'B'
const gradeColumn = 'D'
const statusColumn = 'E'

if(process.argv.length > 4) {
    const evaluation = process.argv[2]
    const session = process.argv[3]
    const xlsFile = process.argv[4]

    const wb = xlsx.readFile(xlsFile)

    grades.find({evaluation, session}).then(docs => {
        if(docs.length === 0) {
            throw new Error(`${evaluation} ${session} don't exists`)
        }

        const doc = docs[0]
        const students = {}
        for(let grade of doc.grades) {
            students[grade.matricule] = grade.grade
        }
    })
}
else {
    console.log('export_into_excel <evaluation> <session> file.xls')
}