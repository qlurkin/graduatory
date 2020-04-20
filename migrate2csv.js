const students = require('./students')
const grades = require('./grades')
const fs = require('fs')
const path = require('path')

function academicYear(session) {
	const [monthStr, yearStr] = session.split('-')

	const month = parseInt(monthStr, 10)
	const year = parseInt(yearStr, 10)

	if(month > 9) return `${year}-${year+1}`
	else return `${year-1}-${year}`
}

function sessionStr(session) {
	const months = ['jan', 'fev', 'mar', 'avr', 'mai', 'juin', 'juil', 'aout', 'sep', 'oct', 'nov', 'dec']
	const [monthStr, yearStr] = session.split('-')

	const month = parseInt(monthStr, 10)
	const year = parseInt(yearStr, 10)
	return `${months[month-1]}`
}

function filename(test) {
	return `${academicYear(test.session)}_${test.evaluation}_${sessionStr(test.session)}.csv`
}

function getFolder(folder) {
	return new Promise((resolve, reject) => {
		if(!fs.existsSync(folder)) {
			fs.mkdirSync(folder, {
				recursive: true
			})
		}
		resolve(folder)
	})
}

const studentNames = {}

students.find({}).then(studs => {
	for(let student of studs) {
		studentNames[student.matricule] = {
			firstname: student.firstname,
			lastname: student.lastname
		}
	}
	//console.log(studentNames)
})
.then(() => {
	grades.find({}).then(tests => {
		for(let test of tests) {
			//console.log(`${test.session} => ${academicYear(test.session)}`)
			getFolder(`./csv/${academicYear(test.session)}`).then(folder => {
				const file = filename(test)
				let content = 'matricule;name;grade\n'
				for(let student of test.grades) {
					const name = studentNames[student.matricule] ? studentNames[student.matricule] : {firstname: '', lastname: ''}
					content += `${student.matricule};${name.firstname} ${name.lastname};${student.grade}\n`
				}
				fs.writeFileSync(path.join(folder, file), content, 'utf8')
			})
		}
	})
})
