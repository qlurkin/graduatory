#!/usr/bin/env node

const graduatory = require('./graduatory')
const repl = require('repl')

const writer = repl.writer

let promiseCounter = 0

const coloredWithBracket = value => `\u001b[36m[${value}]\u001b[0m`

const myWriter = (output) => {
    if(output && output.then && typeof output.then === 'function') {
        promiseCounter++
        ((count, promise) => {
            const print = (msg) => console.log(`${coloredWithBracket(count)}`, msg)
            promise.then((data) => {if(data) print(data)}, err => {
                if(err.message) print(err.message)
                else print(err)
            })
        })(promiseCounter, output)
        return `Promise ${coloredWithBracket(promiseCounter)}`
    }
    
    writer.options.colors = true
    return writer(output)
}

const r = repl.start({prompt: 'graduatory> ', writer: myWriter})
r.context.graduatory = graduatory
r.context.gr = graduatory