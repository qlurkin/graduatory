#!/usr/bin/env node

const graduatory = require('./graduatory')
const repl = require('repl')
const {table} = require('table')
const {isObject, isArray, validateSession} = require('./utils')
const prompt = require('prompt')

const writer = repl.writer
writer.options.colors = true

let valueCounter = 0

const values = []

const coloredWithBracket = value => `\u001b[36m[${value}]\u001b[0m`

const isArrayOfObject = (thing) => isArray(thing) && thing.length > 0 && thing.every(elem => isObject(elem))

const myWriter = (value) => {
    values[valueCounter] = value
    
    let output
    if(isArrayOfObject(value)) {
        output = tableWriter(value)
    }
    else if(isObject(value)) {
        output = objectWriter(value)
    }
    else {
        output = writer(value)
    }
    
    output = `${coloredWithBracket(valueCounter)}\n${output}`
    valueCounter++
    return output
}

const getArraysOfObjects = (obj) => {
    const arrayOfObjectsKeys = Object.keys(obj).filter(key => isArrayOfObject(obj[key]))
    const arraysOfObjects = Object.fromEntries(arrayOfObjectsKeys.map(key => [key, obj[key]]))
    return arraysOfObjects
}

const objectWriter = (value) => {
    const arraysOfObjects = getArraysOfObjects(value)

    let output = Object.keys(value).filter(key => !isArrayOfObject(value[key])).map(key => `${key}: ${value[key]}`).join('\n')

    Object.entries(arraysOfObjects).forEach(([key, value]) => {
        output += `\n${key}:\n${tableWriter(value)}`
    })

    return output
}

const addIndex = (table) => {
    table[0].unshift(['#'])
    for(let i=1; i<table.length; i++){
        table[i].unshift([i-1])
    }
}

const tableWriter = (output, keys) => {
    if(keys === undefined) {
        keys = Object.keys(output[0])
    }
    
    const data = output.map(obj => keys.map(key => isArray(obj[key]) ? 'Array' : obj[key]))
    data.unshift(keys)
    addIndex(data)

    const options = {
        drawHorizontalLine: (index, size) => {
            return index === 0 || index === 1 || index === size
        }
    }
    return table(data, options)
}

const r = repl.start({prompt: 'graduatory> ', writer: myWriter})

r.simpleEval = r.eval
r.eval = (cmd, context, filename, callback) => {
    r.simpleEval(cmd, context, filename, (truc, result) => {
        Promise.resolve(result)
        .then(value => {
            callback(truc, value)
        })
        .catch(err => {
            callback(truc, err)
        })
    })
}

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

const parseArguments = (cmdFn) => {
    return (argString) => {
        r.clearBufferedCommand()
        const args = argString.trim().split(' ').filter(s => s.length!==0)

        let redirect = undefined
        if(args[args.length-2] === '>') {
            redirect = args[args.length-1]
            args.splice(args.length-2, 2)
        }

        for(let i=0; i<args.length; i++) {
            if(args[i][0] === '$') {
                args[i] = String(r.context[args[i].slice(1)])
            }
        }

        cmdFn(args)
        .then(res => {
            if(redirect) r.context[redirect] = res
            console.log(myWriter(res))
            r.displayPrompt()
        })
        .catch(err => {
            if(err) {
                if(err.message) {
                    console.log(err.message)
                }
                else {
                    console.log(err)
                }
            }
            else {
                console.log('Unexpected Error')
            }
            r.displayPrompt()
        })
    }
}

const sCmd = (args) => {
    if(args.length > 0) {
        const matricule = args[0]
        return graduatory.students.show(matricule)
    }
    else {
        return graduatory.students.find()
    }
}

const gCmd = (args) => {
    if(args.length > 0) {
        try {
            validateSession(args[0])
            const session = args[0]
            return graduatory.grades.find({session})
        }
        catch(err) {
            const evaluation = args[0]
            return graduatory.grades.find({evaluation})
        }
    }
    else {
        return graduatory.grades.find()
    }
}

r.defineCommand('s', {
    help: "Show student",
    action: parseArguments(sCmd)
})

r.defineCommand('g', {
    help: "Show grade",
    action: parseArguments(gCmd)
})