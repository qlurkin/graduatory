#!/usr/bin/env node

const grades = require('./grades')
const students = require('./students')
const prompt = require('prompt')
const fs = require('fs')
const {table} = require('table')
const {setGrade} = require('./utils')

const options = {
    drawHorizontalLine: (index, size) => {
        return index === 0 || index === 1 || index === size
    }
}

const show = (gradesList, names) => {
    const data = [['Matricule', 'Name', 'Grade']]

    for(let grade of gradesList) {
        data.push([grade.matricule, names[grade.matricule], grade.grade])
    }

    console.log(table(data, options))
}

const encode = (evaluation, session, gradeMax=20) => {
    const gradesList = []
    const names = {}
    const askGrade = (matricule, msg) => {
        console.log(msg)
        prompt.get(['grade'], (err, result) => {
            if(err) {
                console.log(err)
                return
            }
            const grade = parseFloat(result.grade)
            setGrade(gradesList, matricule, grade)
            show(gradesList, names)
            askMatricule()
        })
    }
    const askMatricule = () => {
        prompt.get(['matricule'], (err, result) => {
            if(err) {
                console.log(err)
                return
            } 
            if(result.matricule.length === 0) {
                if(gradesList.length > 0) {
                    try {
                        grades.updateGradesList(evaluation, session, gradesList)
                    }
                    catch(err) {
                        fs.writeFileSync(`~${evaluation}-${session}.json`, JSON.stringify(gradesList))
                    }
                }
                return
            }
            
            students.findOne({matricule: result.matricule}).then(student => {
                if(student) {
                    names[result.matricule] = `${student.firstname} ${student.lastname}`
                }
                else {
                    names[result.matricule] = 'Unknown'
                }
                askGrade(result.matricule, `Grade for ${names[result.matricule]}`)
            })
        })
    }
    askMatricule()
}

if(process.argv.length > 4) {
    const command = process.argv[2]
    const evaluation = process.argv[3]
    const session = process.argv[4]
    let gradeMax = 20
    if(process.argv.length > 5) {
        gradeMax = parseInt(process.argv[5], 10)
    }

    if(command === 'create') {
        grades.create(evaluation, session, [], gradeMax)
    }

    if(command !== 'create' && command !== 'update') {
        console.log('Unknown command')
        process.exit()
    }

    encode(evaluation, session, gradeMax)
}
else {
    console.log('encode_grades <command> <evaluation> <session> [<gradeMax>]')
    console.log('   <command> = create | update')
}