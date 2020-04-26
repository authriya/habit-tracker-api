require('dotenv').config()
const { expect } = require('chai')
const knex = require('knex')
const app = require('../src/app')
const {makeHabitHistoryArray, makeNewHabitHistory} = require('./habithistory.fixtures')
const {makeHabitsArray} = require('./habits.fixtures')

describe.only('Habit History Endpoints', function() {
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

    describe(`GET /api/habithistory`, () => {
        context(`Given no history`, () => {
            it(`responds 200 and an empty list`, () => {
                return supertest(app)
                    .get('/api/habithistory')
                    .expect(200, [])
            })
        })

        context('Given there is a history', () => {
            const testHistory = makeHabitHistoryArray()
            const testHabits = makeHabitsArray()

            beforeEach('insert history', () => {
                return db
                    .into('habits')
                    .insert(testHabits)
                    .then(() => {
                        return db
                            .into('habithistory')
                            .insert(testHistory)
                    })
            })

            it('responds 200 and all of the history', () => {
                return supertest(app)
                    .get('/api/habithistory')
                    .expect(200, testHistory)
            })
        })
    })
    describe(`GET /api/habithistory/:habitId`, () => {
        context('Given no history', () => {
            it(`responds with 404`, () => {
                const habitId = 12345
                return supertest(app)
                    .get(`/api/habithistory/${habitId}`)
                    .expect(404, {error: {message: `History not found`}})
            })
        })
        context('Given there is history in the table', () => {
            const testHistory = makeHabitHistoryArray()
            const testHabits = makeHabitsArray()

            beforeEach('insert history', () => {
                return db
                    .into('habits')
                    .insert(testHabits)
                    .then(() => {
                        return db
                            .into('habithistory')
                            .insert(testHistory)
                    })
            })

            it('responds with 200 and the specified history', () => {
                const habitId = 2
                const expectedHistory = testHabits[habitId - 1]

                return supertest(app)
                    .get(`/api/habits/${habitId}`)
                    .expect(200, expectedHistory)
            })
        })
    })
    describe(`POST /api/habits`, () => {
        const testHabits = makeHabitsArray()
        beforeEach('insert habits', () => {
            return db
                .into('habits')
                .insert(testHabits)
        })
        it(`creates a history, responding with 201 and the history`, () => {
            const newHistory = {
                habit: 1,
                day1: null,
                day2: null,
                day3: null,
                day4: null,
                day5: null,
                day6: null,
                day7: null
            }

            return supertest(app)
                .post('/api/habithistory')
                .send(newHistory)
                .expect(201)
                .expect(res => {
                    expect(res.body).to.have.property('id')
                    expect(res.body.habit).to.eql(newHistory.habit)
                    expect(res.body.day1).to.eql(newHistory.day1)
                    expect(res.body.day2).to.eql(newHistory.day2)
                    expect(res.body.day3).to.eql(newHistory.day3)
                    expect(res.body.day4).to.eql(newHistory.day4)
                    expect(res.body.day5).to.eql(newHistory.day5)
                    expect(res.body.day6).to.eql(newHistory.day6)
                    expect(res.body.day7).to.eql(newHistory.day7)
                    expect(res.headers.location).to.eql(`/api/habithistory/${res.body.habit}`)
                })
                .then(postRes => 
                    supertest(app)
                        .get(`/api/habithistory/${postRes.body.habit}`)
                        .expect(postRes.body)
                )
        })
    })
    describe('DELETE /api/habithistory', () => {
        context('Given history', () => {
            const testHabits = makeHabitsArray()
            const testHistory = makeHabitHistoryArray()

            beforeEach('insert history', () => {
                return db
                    .into('habits')
                    .insert(testHabits)
                    .then(() => {
                        return db
                            .into('habithistory')
                            .insert(testHistory)
                    })
            })

            it('responds with 204 and empties the table', () => {
                return supertest(app)
                    .delete(`/api/habithistory`)
                    .expect(204)
                    .then(res => 
                        supertest(app)
                            .get(`/api/habithistory`)
                            .expect(200, [])
                    )
            })
        })
    })
    describe('PATCH /api/habithistory', () => {
        context(`Given there is a history`, () => {
            const testHabits = makeHabitsArray()
            const testHistory = makeHabitHistoryArray()
            const newHistory = makeNewHabitHistory()

            beforeEach('insert history', () => {
                return db
                    .into('habits')
                    .insert(testHabits)
                    .then(() => {
                        return db
                            .into('habithistory')
                            .insert(testHistory)
                    })
            })

            it('responds with 204 and updates the history', () => {
                return supertest(app)
                    .patch(`/api/habithistory`)
                    .send(newHistory)
                    .expect(204)
                    .then(res =>{
                        supertest(app)
                            .get('/api/habithistory')
                            .expect(newHistory)
                    })
            })
        })
    })
})