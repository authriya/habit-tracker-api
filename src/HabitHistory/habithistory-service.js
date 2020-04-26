const HabitHistoryService = {
    getAllHistory(knex) {
        return knex.select('*').from('habithistory')
    },
    getByHabit(knex, habitId) {
        return knex.from('habithistory').select('*').where('habit', habitId).first()
    },
    deleteHistory(knex) {
        return knex('habithistory')
            .delete()
    },
    insertHabit(knex, newHabit) {
        return knex
            .insert(newHabit)
            .into('habithistory')
            .returning('*')
            .then(rows => {
                return rows [0]
            })
    },
    updateHistory(knex, id, newHabit) {
        return knex('habithistory')
            .where({id})
            .update(newHabit)
    }
}

module.exports = HabitHistoryService