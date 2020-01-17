#!/usr/bin/env node

const graduatory = require('./graduatory')
const repl = require('repl')

const writer = repl.writer

let valueCounter = 0

const values = []

const coloredWithBracket = value => `\u001b[36m[${value}]\u001b[0m`

const myWriter = (output) => {
    values[valueCounter] = output
    if(output && output.then && typeof output.then === 'function') {
        ((count, promise) => {
            const print = (msg) => console.log(`${coloredWithBracket(count)}`, msg)
            promise.then((data) => {
                values[count] = data
                print(data)
            }, err => {
                values[count] = err
                if(err.message) print(err.message)
                else print(err)
            })
        })(valueCounter, output)
    }

    writer.options.colors = true
    output = writer(output)
    output = `${coloredWithBracket(valueCounter)} ${output}`
    valueCounter++
    return output
}

const r = repl.start({prompt: 'graduatory> ', writer: myWriter})
Object.defineProperty(r.context, 'grades', {
    configurable: false,
    enumerable: true,
    value: graduatory.grades
})
Object.defineProperty(r.context, 'students', {
    configurable: false,
    enumerable: true,
    value: graduatory.students
})
Object.defineProperty(r.context, '$', {
    configurable: false,
    enumerable: true,
    value: values
})