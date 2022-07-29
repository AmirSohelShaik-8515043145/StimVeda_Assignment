const userModel = require("../model/userModel")
const { isValid } = require("../validator/validator")
const bcrypt = require("bcrypt")


//******************************************** Register API ***************************************************

const createUser = async function (req, res) {
    try {
        let data = req.body

        if (Object.keys(data) == 0) return res.status(400).send({ status: false, msg: "BAD REQUEST NO DATA PROVIDED" })
        const { name, email, password } = data

        if (!isValid(name)) { return res.status(400).send({ status: false, msg: "First name is required" }) }

        // Email validation :
        if (!isValid(email)) { return res.status(400).send({ status: false, msg: "email is required" }) }
        if (!(/^\w+([\.-]?\w+)@\w+([\. -]?\w+)(\.\w{2,3})+$/.test(email.trim()))) { return res.status(400).send({ status: false, msg: "Please provide a valid email" }) };
        let duplicateEmail = await userModel.findOne({ email: email })
        if (duplicateEmail) return res.status(400).send({ status: false, msg: 'Email is already exist' })

        // Password Validation :
        if (!isValid(password)) { return res.status(400).send({ status: false, msg: "password is required" }) }
        if (!(password.length >= 8 && password.length <= 15)) { return res.status(400).send({ status: false, message: "Password length should be 8 to 15 characters" }) }
        if (!(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,15}$/.test(password.trim()))) { return res.status(400).send({ status: false, msg: "please provide atleast one uppercase letter ,one lowercase, one character and one number " }) }
        let securePassword = await bcrypt.hash(password, 4)
        data.password = securePassword

        // Create a user
        let savedData = await userModel.create(data)
        return res.status(201).send({ msg: savedData })
    }
    catch (error) {
        return res.status(500).send({ msg: error.message })
    }
}


//****************************************  Get User Details API *************************************************

const getUserProfile = async (req, res) => {
    try {
        // Getting Details from URL or params
        let userId = req.params.id;

        // Authorisation
        if (req.userId != userId) { return res.status(403).send({ status: false, msg: "You are not Authorised to fetch the data" }) }

        // User Validation with fetch the Data
        let user = await userModel.findOne({ _id: userId, isDeleted: false }).populate("habits")
        if (!user) return res.status(404).send({ status: false, message: "No user found according to your search" })

        // Remove Deleted Habit
        let userJson = JSON.parse(JSON.stringify(user))
        let habits = userJson.habits
        let arr = []
        for (let i = 0; i < habits.length; i++) {
            if (habits[i].isDeleted == false) {
                arr.push(habits[i])
            }
        }

        // Fetch Data
        let updatedUser = await userModel.findOneAndUpdate({ _id: userId }, { $set: { habits: arr } }, { new: true }).populate("habits")
        return res.status(200).send({ status: true, message: "User Profile Details", data: updatedUser });
    }
    catch (error) {
        return res.status(500).send({ status: false, msg: error.message })
    }
}



module.exports = {
    createUser,
    getUserProfile
}