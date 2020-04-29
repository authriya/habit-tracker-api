const DaysService = {
    getAllDays(knex) {
        return knex.select('*').from('days')
    },
    deleteDays(knex) {
        return knex('days')
            .delete()
    },
    updateDays(knex, id, newDay) {
        return knex('days')
            .where({id})
            .update(newDay)
    }
}

module.exports = DaysService