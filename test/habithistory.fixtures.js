function makeHabitHistoryArray() {
    return [
        {
            id: 1,
            habit: 1,
            day1: true,
            day2: true,
            day3: true,
            day4: true,
            day5: true,
            day6: false,
            day7: false
        },
        {
            id: 2,
            habit: 2,
            day1: true,
            day2: true,
            day3: false,
            day4: true,
            day5: false,
            day6: true,
            day7: false
        },
        {
            id: 3,
            habit: 3,
            day1: false,
            day2: false,
            day3: false,
            day4: true,
            day5: false,
            day6: false,
            day7: false
        },
        {
            id: 4,
            habit: 4,
            day1: false,
            day2: false,
            day3: false,
            day4: false,
            day5: false,
            day6: false,
            day7: false
        },
        {
            id: 5,
            habit: 5,
            day1: false,
            day2: false,
            day3: false,
            day4: true,
            day5: true,
            day6: true,
            day7: true
        }
    ]
}

function makeNewHabitHistory() {
    return [
        {
            id: 1,
            habit: 1,
            day1: true,
            day2: true,
            day3: true,
            day4: true,
            day5: true,
            day6: false,
            day7: true
        },
        {
            id: 2,
            habit: 2,
            day1: true,
            day2: true,
            day3: false,
            day4: true,
            day5: false,
            day6: true,
            day7: true
        },
        {
            id: 3,
            habit: 3,
            day1: false,
            day2: false,
            day3: true,
            day4: true,
            day5: false,
            day6: false,
            day7: false
        },
        {
            id: 4,
            habit: 4,
            day1: false,
            day2: true,
            day3: false,
            day4: false,
            day5: false,
            day6: false,
            day7: false
        },
        {
            id: 5,
            habit: 5,
            day1: true,
            day2: false,
            day3: false,
            day4: true,
            day5: true,
            day6: true,
            day7: false
        }
    ]
}

module.exports = {
    makeHabitHistoryArray,
    makeNewHabitHistory
}