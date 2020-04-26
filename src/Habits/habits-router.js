const path = require('path')
const express = require('express')
const xss = require('xss')
const HabitsService = require('./habits-service')

const habitsRouter = express.Router()
const jsonParser = express.json()

const serializeHabit = habit => ({
    id: habit.id,
    name: xss(habit.name),
    description: xss(habit.description)
})

habitsRouter
    .route('/')
    .get((req, res, next) => {
        HabitsService.getAllHabits(
            req.app.get('db')
        )
            .then(habits => {
                res.json(habits.map(serializeHabit))
            })
            .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
        const {name, description} = req.body
        const newHabit = {name, description}

        for (const [key, value] of Object.entries(newHabit)) {
            if(!value) {
                return res.status(400).json({
                    error: {message: `Missing '${key}' in request body`}
                })
            }
        }
        HabitsService.insertHabit(
            req.app.get('db'), 
            newHabit
        )
            .then(habit => {
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl, `/${habit.id}`))
                    .json(serializeHabit(habit))
            })
            .catch(next)
    })
    .delete((req, res, next) => {
        HabitsService.deleteAllHabits(
            req.app.get('db')
        )
            .then(() => {
                res.status(204).end()
            })
    })

habitsRouter
    .route('/:habitId')
    .all((req, res, next) => {
        HabitsService.getById(
            req.app.get('db'),
            req.params.habitId
        )
        .then(habit => {
            if(!habit) {
                return res.status(404).json({
                    error: {message: `Habit not found`}
                })
            }
            res.habit = habit
            next()
        })
        .catch(next)
    })
    .get((req, res, next) => {
        res.json(serializeHabit(res.habit))
    })
    .delete((req, res, next) => {
        HabitsService.deleteHabit(
            req.app.get('db'), 
            req.params.habitId
        )
            .then(() => {
                res.status(204).end()
            })
    })
    .patch(jsonParser, (req, res, next) => {
        const {name, description} = req.body
        const habitToUpdate = {name, description}

        const numberOfValues = Object.values(habitToUpdate).filter(Boolean).length

        if(numberOfValues === 0) {
            return res.status(400).json({
                error: {message: `Request body must contain either name or description`}
            })
        }
        HabitsService.updateHabit(
            req.app.get('db'),
            req.params.habitId,
            habitToUpdate
        )
            .then(numRowsAffected => {
                res.status(204).end()
            })
            .catch(next)
    })

module.exports = habitsRouter