require('dotenv').config()
const { expect } = require('chai')
const knex = require('knex')
const app = require('../src/app')
const {makeHabitsArray} = require('./habits.fixtures.js')

describe('Habits Endpoints', function() {
    let db 

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DATABASE_URL
        })
        app.set('db', db)
    })

    after('disconnect from db', () => db.destroy())

    before('clean the table', () => db.raw('TRUNCATE habits, days, habithistory RESTART IDENTITY CASCADE'))
    
    afterEach('cleanup', () => db.raw('TRUNCATE habits, days, habithistory RESTART IDENTITY CASCADE'))

    describe(`GET /api/habits`, () => {

        context(`Given no habits`, () => {
            it(`responds 200 and an empty list`, () => {
                return supertest(app)
                    .get('/api/habits')
                    .expect(200, [])
            })
        })

        context('Given there are habits in the table', () => {
            const testHabits = makeHabitsArray()

            beforeEach('insert habits', () => {
                return db
                    .into('habits')
                    .insert(testHabits)
            })

            it('responds 200 and all of the habits', () => {
                return supertest(app)
                    .get('/api/habits')
                    .expect(200, testHabits)
            })
        })
    })
    describe(`GET /api/habits/:habitId`, () => {
        context('Given no habits', () => {
            it(`responds with 404`, () => {
                const habitId = 12345
                return supertest(app)
                    .get(`/api/habits/${habitId}`)
                    .expect(404, {error: {message: `Habit not found`}})
            })
        })
        context('Given there are habits in the table', () => {
            const testHabits = makeHabitsArray();

            beforeEach('insert habits', () => {
                return db
                    .into('habits')
                    .insert(testHabits)
            })

            it('responds with 200 and the specified habit', () => {
                const habitId = 2
                const expectedHabit = testHabits[habitId - 1]
                return supertest(app)
                    .get(`/api/habits/${habitId}`)
                    .expect(200, expectedHabit)
            })
        })
    })
    describe(`POST /api/habits`, () => {
        it(`creates a habit, responding with 201 and the habit`, () => {
            const newHabit = {
                name: 'Name 1',
                description: 'Desc 1'
            }
            
            return supertest(app)
                .post('/api/habits')
                .send(newHabit)
                .expect(201)
                .expect(res => {
                    expect(res.body.name).to.eql(newHabit.name)
                    expect(res.body.description).to.eql(newHabit.description)
                    expect(res.body).to.have.property('id')
                    expect(res.headers.location).to.eql(`/api/habits/${res.body.id}`)
                })
                .then(postRes => 
                    supertest(app)
                        .get(`/api/habits/${postRes.body.id}`)
                        .expect(postRes.body)
                )
        })
    })
    describe(`DELETE /api/habits`, () => {
        context(`Given habits`, () => {
            const testHabits = makeHabitsArray()

            beforeEach('insert habits', () => {
                return db
                    .into('habits')
                    .insert(testHabits)
            })
            it('responds with 204 and empties the table', () => {
                return supertest(app)
                    .delete(`/api/habits`)
                    .expect(204)
                    .then(res =>
                        supertest(app)
                            .get(`/api/habits`)
                            .expect(200, [])
                    )
            })
        })
    })
    describe(`DELETE /api/habits/:habitId`, () => {
        context(`Given no habits`, () => {
            it(`responds with 404`, () => {
                const habitId = 12345
                return supertest(app)
                .delete(`/api/habits/${habitId}`)
                .expect(404, {error: {message: `Habit not found`}})
            })
        })
        context('Given there are habits in the table', () => {
            const testHabits = makeHabitsArray()

            beforeEach('insert habits', () => {
                return db
                    .into('habits')
                    .insert(testHabits)
            })

            it('responds with 204 and removes the article', () => {
                const idToRemove = 2
                const expectedHabits = testHabits.filter(habit => habit.id !== idToRemove)
                return supertest(app)
                    .delete(`/api/habits/${idToRemove}`)
                    .expect(204)
                    .then(res => 
                        supertest(app)
                            .get(`/api/habits`)
                            .expect(expectedHabits)
                    )
            })
        })
    })
    describe(`PATCH /api/habits/:habitId`, () => {
        context(`Given no artciles`, () => {
            it(`responds with 404`, () => {
                const habitId = 12345
                return supertest(app)
                    .patch(`/api/habits/${habitId}`)
                    .expect(404, {error: {message: `Habit not found`}})
            })
        })
        context(`Given there are habits in the table`, () => {
            const testHabits = makeHabitsArray()

            beforeEach('insert habits', () => {
                return db
                    .into('habits')
                    .insert(testHabits)
            })

            afterEach('cleanup', () => db.raw('TRUNCATE habits, days, habithistory RESTART IDENTITY CASCADE'))
            
            it('responds with 204 and updates the habit', () => {
                const idToUpdate = 2
                const updatedHabit = {
                    name: 'updated',
                    description: 'updated'
                }
                const expectedHabit = {
                    ...testHabits[idToUpdate - 1],
                    ...updatedHabit
                }
                return supertest(app)
                    .patch(`/api/habits/${idToUpdate}`)
                    .send(updatedHabit)
                    .expect(204)
                    .then(res => {
                        supertest(app)
                        .get(`/api/habits/${idToUpdate}`)
                        .expect(expectedHabit)
                    })
            })
            it(`responds with 400 when no required fields supplied`, () => {
                const idToUpdate = 2

                return supertest(app)
                    .patch(`/api/habits/${idToUpdate}`)
                    .send({ irrelevantField: 'foo' })
                    .expect(400, {
                        error: {
                            message: `Request body must contain either name or description`
                        }
                    })
            })
            it(`responds with 204 when updating only a subsection of fields`, () => {
                const idToUpdate = 2
                const updatedHabit = {
                    name: 'update'
                }
                const expectedHabit = {
                    ...testHabits[idToUpdate-1],
                    ...updatedHabit
                }

                return supertest(app)
                    .patch(`/api/habits/${idToUpdate}`)
                    .send({
                        ...updatedHabit,
                        fieldToIgnore: 'ignore'
                    })
                    .expect(204)
                    .then(res => 
                        supertest(app)
                        .get(`/api/habits/${idToUpdate}`)
                        .expect(expectedHabit)
                    )
            })
        })
    })
})