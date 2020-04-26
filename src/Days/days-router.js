const path = require('path')
const express = require('express')
const xss = require('xss')
const DaysService = require('./days-service')

const daysRouter = express.Router()
const jsonParser = express.json()

daysRouter
    .route('/')
    .get((req, res, next) => {
        DaysService.getAllDays(
            req.app.get('db')
        )
            .then(days => {
                res.json(days)
            })
            .catch(next)
    })
    .delete((req, res, next) => {
        DaysService.deleteDays(
            req.app.get('db')
        )
            .then(() => {
                res.status(204).end()
            })
    })
    .post(jsonParser, (req, res, next) => {
        const fields = [1, 2, 3, 4, 5, 6, 7]
        const fieldsToInsert = []
        fields.forEach(field => {
            fieldsToInsert.push(req.body[field - 1])
        })
        if(req.body.length < 7) {
            return res.status(400).json({
                error: {message: `Missing new days table`}
            })
        }
        DaysService.insertDays(
            req.app.get('db'),
            fieldsToInsert
        )
            .then(days => {
                res
                    .status(201)
                    .json(days)
            })
            .catch(next)
    })

    module.exports = daysRouter