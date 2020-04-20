#!/usr/bin/env node

const grades = require('./grades')

if(process.argv.length > 3) {
    const evaluation = process.argv[2]
    const session = process.argv[3]

    grades.find({evaluation, session}).then(docs => {
        if(docs.length === 0) {
            throw new Error(`${evaluation} ${session} don't exists`)
        }

        const doc = docs[0]
        for(let grade of doc.grades) {
            console.log(`${grade.matricule}\t${String(grade.grade).replace('.', '.')}`)
        }
    })

    
}
else {
    console.log('export_to_tsv <evaluation> <session> > file.tsv')
}