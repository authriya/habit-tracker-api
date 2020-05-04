const path = require('path');
const express = require('express');
const xss = require('xss');
const DaysService = require('./days-service');

const daysRouter = express.Router();
const jsonParser = express.json();

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
    .patch(jsonParser, (req, res, next) => {
        const length = req.body.length
        const fieldsToUpdate = []

        for(let i = 0; i < length; i++) {
            fieldsToUpdate.push(req.body[i])
        }

        if(fieldsToUpdate.length === 0) {
            return res.status(400).json({
                error: {message: `Missing new days`}
            })
        }

        fieldsToUpdate.forEach(field => {
            DaysService.updateDays(
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

    module.exports = daysRouter