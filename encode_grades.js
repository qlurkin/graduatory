#!/usr/bin/env node

const grades = require('./grades')
const students = require('./students')
const prompt = require('prompt')
const fs = require('fs')

const encode = (evaluation, session, gradeMax=20) => {
    const gradesList = []
    const askGrade = (matricule, msg) => {
        console.log(msg)
        prompt.get(['grade'], (err, result) => {
            if(err) {
                console.log(err)
                return
            }
            const grade = parseFloat(result.grade)
            gradesList.push({matricule, grade})
            console.log(`${msg} (${matricule}): ${grade}/${gradeMax}\n`)
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
                        grades.add(evaluation, session, gradesList, gradeMax)
                    }
                    catch(err) {
                        fs.writeFileSync(`~${evaluation}-${session}.json`, JSON.stringify(gradesList))
                    }
                }
                return
            }
            
            students.findOne({matricule: result.matricule}).then(student => {
                if(student)
                    askGrade(result.matricule, `Grade for ${student.firstname} ${student.lastname}`)
                else
                    askGrade(result.matricule, `Grade for Unknown (${result.matricule})`)
            })
        })
    }
    askMatricule()
}

if(process.argv.length > 3) {
    const evaluation = process.argv[2]
    const session = process.argv[3]
    let gradeMax = 20
    if(process.argv.length > 4) {
        gradeMax = parseInt(process.argv[4], 10)
    }

    encode(evaluation, session, gradeMax)
}
else {
    console.log('encode_grades <evaluation> <session> [<gradeMax>]')
}