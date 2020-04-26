const path = require('path')
const express = require('express')
const xss = require('xss')
const HabitHistoryService = require('./habithistory-service')

const habitHistoryRouter = express.Router()
const jsonParser = express.json()


habitHistoryRouter
    .route('/')
    .get((req, res, next) => {
        HabitHistoryService.getAllHistory(
            req.app.get('db')
        )
            .then(history => {
                res.json(history)
            })
            .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
        const {habit, day1, day2, day3, day4, day5, day6, day7} = req.body
        const newHistory = {habit, day1, day2, day3, day4, day5, day6, day7}

        if(!newHistory.habit) {
            return res.status(400).json({
                error: {messgae: `Missing habit ID`}
            })
        }
        HabitHistoryService.insertHabit(
            req.app.get('db'),
            newHistory
        )
            .then(history => {
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl, `/${history.habit}`))
                    .json(history)
            })
    })
    .delete((req, res, next) => {
        HabitHistoryService.deleteHistory(
            req.app.get('db')
        )
            .then(() => {
                res.status(204).end()
            })
    })
    .patch(jsonParser, (req, res, next) => {
        const length = req.body.length
        const fieldsToUpdate = []

        for(let i = 0; i < length; i++) {
            fieldsToUpdate.push(req.body[i])
        }

        if(fieldsToUpdate.length === 0) {
            return res.status(400).json({
                error: {message: `Missing new table`}
            })
        }
        fieldsToUpdate.forEach(field => {
            HabitHistoryService.updateHistory(
                req.app.get('db'),
                field.id,
                field
            )
            .then(history => {
                res
                    .status(204).end()
            })
            .catch(next)
        })
    })
    
habitHistoryRouter
    .route('/:habitId')
    .all((req, res, next) => {
        HabitHistoryService.getByHabit(
            req.app.get('db'),
            req.params.habitId
        )
        .then(history => {
            if(!history) {
                return res.status(404).json({
                    error: {message: `History not found`}
                })
            }
            res.history = history
            next()
        })
        .catch(next)
    })
    .get((req, res, next) => {
        res.json(res.history)
    })

module.exports = habitHistoryRouter