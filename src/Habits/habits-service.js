const HabitsService = {
    getAllHabits(knex) {
        return knex.select('*').from('habits')
    },
    insertHabit(knex, newHabit) {
        return knex
            .insert(newHabit)
            .into('habits')
            .returning('*')
            .then(rows => {
                return rows [0]
            })
    },
    getById(knex, id) {
        return knex.from('habits').select('*').where('id', id).first()
    },
    deleteHabit(knex, id) {
        return knex('habits')
            .where({id})
            .delete()
    },
    updateHabit(knex, id, newHabit) {
        return knex('habits')
            .where({id})
            .update(newHabit)
    },
    deleteAllHabits(knex) {
        return knex('habits')
            .delete()
    }
}

module.exports = HabitsService