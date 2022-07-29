const userModel = require("../model/userModel")
const moment = require("moment");
const habitModel = require("../model/habitModel");
const { isValid } = require("../validator/validator")




//******************************************* Create A New Habit API  *****************************************

const addHabit = async (req, res) => {
    try {
        // Getting Details from User
        let data = req.body;
        if (Object.keys(data) == 0) { return res.status(400).send({ status: false, msg: "Bad request, No data provided." }) };

        // UserId validation with Regex
        let userId = req.params.userId
        if (!(/^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/.test(userId.trim()))) { return res.status(400).send({ status: false, message: "Please put a valid habit id in Params" }) }

        // Authorisation
        if (req.userId != userId) { return res.status(403).send({ status: false, msg: "You are not Authorised to add a habit" }) }

        // Input Distructuring
        let { habitName, totalTargetDays } = data;

        // Input Validation
        if (!isValid(habitName)) { return res.status(400).send({ status: false, msg: "Habit name is not Valid" }) }

        // Create an object to add a new habit
        let obj = {}
        obj.habitName = habitName;
        obj.startedAt = moment(new Date).format('Do MMMM YYYY,dddd')
        obj.totalTargetDays = totalTargetDays;
        obj.totalPracticeDays = []

        // DB call for find User and Validation
        let user = await userModel.findOne({ _id: userId, isDeleted: false })
        if (!user) { return res.status(400).send({ status: false, msg: `Provided UserId Does not exists.` }) }
        let userJson = JSON.parse(JSON.stringify(user))

        // Create Habit
        let newHabit = await habitModel.create(obj)
        let habits = userJson.habits
        habits.push(newHabit)

        // Updating the user with new habit
        let updateUser = await userModel.findOneAndUpdate({ _id: userId }, { $set: { habits: habits } }, { new: true })
        return res.status(201).send({ status: true, User_Details: updateUser, New_Habit: newHabit })
    }
    catch (error) {
        console.log(error)
        return res.status(500).send({ status: false, msg: error.message })
    }
}



//********************************************  Get Habit Status **********************************************

const getHabitStatus = async (req, res) => {
    try {
        // Getting id from URL/Params
        let habitId = req.params.habitId

        // Habit Validation
        let habit = await habitModel.findOne({ _id: habitId , isDeleted :false })
        if (!habit) { return res.status(400).send({ status: false, msg: "Habit doesn't exists or Deleted." }) }

        // feltch the habit
        let habitStatus = await habitModel.findOne({ _id: habitId })
        return res.status(200).send({ status: true, data : habitStatus })
    }
    catch (error) {
        return res.status(500).send({ status: false, msg: error.message })
    }
}


//********************************************  Update Habit API  *********************************************


const updateHabit = async (req, res) => {
    try {
        // Getting id from URL/Params
        let habitId = req.params.habitId

        // Habit Validation
        let habit = await habitModel.findOne({ _id: habitId, isDeleted: false, habitCompletion: "Not Completed" })
        if (!habit) { return res.status(400).send({ status: false, msg: "Habit doesn't exists or Habit target is complete" }) }

        // Convert a mutable object into immutable object 
        let habitJson = JSON.parse(JSON.stringify(habit))

        // Add date and day for habit
        let practiceDay = {}
        practiceDay.day = moment(new Date).format("dddd")
        practiceDay.date = moment(new Date).format("Do MMMM YYYY");
        let totalPracticeDays = habitJson.totalPracticeDays

        // Date Validation, Can't add same day twice
        for (let i = 0; i < totalPracticeDays.length; i++) {
            if (totalPracticeDays[i].date == practiceDay.date) {
                return res.status(400).send({ status: false, msg: `Habit completed for today, can't update on same day, Please try tomorrow.` })
            }
        }
        totalPracticeDays.push(practiceDay)

        // Habit status update
        let habitCompletion = habitJson.habitCompletion
        if (habitJson.totalTargetDays - 1 <= habitJson.totalDaysCount) {
            habitCompletion = "Completed"
        }

        // Update the habit with DB call
        let updateHabit = await habitModel.findOneAndUpdate({ _id: habitId }, {
            $set:
            {
                totalDaysCount: totalPracticeDays.length,
                totalPracticeDays: totalPracticeDays,
                habitCompletion: habitCompletion
            }
        }, { new: true })
        return res.status(200).send({ status: true, data: updateHabit })
    }
    catch (error) {
        return res.status(500).send({ status: false, msg: error.message })
    }
}



//*****************************************  Delete Habit API  ***********************************************

const deleteHabit = async (req, res) => {
    try {
        // Getting id from URL/Params
        let habitId = req.params.habitId

        // Habit Validation
        let habit = await habitModel.findOne({ _id: habitId })
        if (!habit) { return res.status(400).send({ status: false, msg: "Habit doesn't exists." }) }
        if (habit.isDeleted == true) { return res.status(400).send({ status: true, message: 'Habit has been already deleted' }) }

        // Deleted the habit
        let deleteHabit = await habitModel.findOneAndUpdate({ _id: habitId }, { $set: { isDeleted: true } }, { new: true })
        return res.status(200).send({ status: true, msg : "Habit Record Deleted Successfully" })
    }
    catch (error) {
        return res.status(500).send({ status: false, msg: error.message })
    }
}




module.exports = {
    addHabit,
    getHabitStatus,
    updateHabit,
    deleteHabit
}