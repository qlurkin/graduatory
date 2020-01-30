#!/usr/bin/env node

const students = require('./students')
const prompt = require('prompt')

const encode = () => {
    const ask = () => {
        prompt.get(['matricule', 'firstname', 'lastname'], (err, result) => {
            if(err) {
                console.log(err)
                return
            }
            if(result.matricule.length === 0) {
                return
            }
            students.add(result.matricule, result.firstname, result.lastname).then(student => {
                console.log(student)
                ask()
            })
        })
    }
    ask()
}

encode()