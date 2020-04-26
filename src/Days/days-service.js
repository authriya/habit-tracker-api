const DaysService = {
    getAllDays(knex) {
        return knex.select('*').from('days')
    },
    deleteDays(knex) {
        return knex('days')
            .delete()
    },
    insertDays(knex, newDays) {
        return knex
            .insert(newDays)
            .into('days')
            .returning('*')
            .then(rows => {
                return rows[0]
            })
    }
}

module.exports = DaysService