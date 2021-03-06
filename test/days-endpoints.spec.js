require('dotenv').config()
const { expect } = require('chai')
const knex = require('knex')
const app = require('../src/app')
const {makeDaysArray, makeNewDaysArray} = require('./days.fixtures')

describe('Days Endpoints', function() {
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

    describe('GET /api/days', () => {
        context('Given no days', () => {
            it(`responds with 200 and an empty list`, () => {
                return supertest(app)
                    .get('/api/habits')
                    .expect(200, [])
            })
        })

        context('Given days in the table', () => {
            const testDays = makeDaysArray()

            beforeEach('insert days', () => {
                return db
                    .into('days')
                    .insert(testDays)
            })

            it('responds 200 and all of the days', () => {
                return supertest(app)
                    .get('/api/days')
                    .expect(200, testDays)
            })
        })
    })
    describe('DELETE /api/days', () => {
        context(`Given days`, () => {
            const testDays = makeDaysArray()

            beforeEach('insert days', () => {
                return db
                    .into('days')
                    .insert(testDays)
            })
            it('responds with 204 and empties the table', () => {
                return supertest(app)
                    .delete(`/api/days`)
                    .expect(204)
                    .then(res => 
                        supertest(app)
                            .get(`/api/days`)
                            .expect(200, [])
                        )
            })
        })
    })
    describe('PATCH /api/days', () => {
        context('Given there are days', () => {
            const testDays = makeDaysArray();
            const newDays = makeNewDaysArray();

            beforeEach('insert days', () => {
                return db
                    .into('days')
                    .insert(testDays)
            })
            it('responds with 204 and updates the days', () => {
                return supertest(app)
                    .patch(`/api/days`)
                    .send(newDays)
                    .expect(204)
                    .then(res => {
                        supertest(app)
                            .get('/api/days')
                            .expect(newDays)
                    })
            })
        })
    })
})