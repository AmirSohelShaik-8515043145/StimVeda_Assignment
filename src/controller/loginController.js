const jwt = require("jsonwebtoken")
const bcrypt = require('bcrypt')
const userModel = require("../model/userModel")
const validator = require("../validator/validator")

const login = async function (req, res) {
    try {
        //Getting data from user
        const data = req.body

        //Input Validation
        if (Object.keys(data) == 0) return res.status(400).send({ status: false, msg: "Bad Request, No data provided" })

        //Email Validation
        if (!validator.isValid(data.email)) { return res.status(400).send({ status: false, msg: "Email is required" }) }
        if (!(/^\w+([\.-]?\w+)@\w+([\. -]?\w+)(\.\w{2,3})+$/.test(data.email.trim()))) { return res.status(400).send({ status: false, msg: "Please enter a valid Email." }) };

        //Password Validation
        if (!validator.isValid(data.password)) { return res.status(400).send({ status: false, msg: "Password is required" }) };
        if (!(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,15}$/.test(data.password))) { return res.status(400).send({ status: false, msg: "Email or Password is incorrect" }) }

        //Find user and user validation
        let user = await userModel.findOne({ email: data.email })
        if (!user) { return res.status(400).send({ status: false, msg: "Email or Password is incorrect" }) }

        //Check password using bcrypt
        let checkPass = user.password
        let checkUser = await bcrypt.compare(data.password, checkPass)
        if (checkUser == false) return res.status(400).send({ status: false, msg: "Email or Password is incorrect" })

        //Generate JWT token
        const token = jwt.sign({
            userId: user._id,
        }, "secret-key", { expiresIn: "120m" })
        return res.status(200).send({ status: true, msg: "You are successfully logged in", userId: user.id, token })
    }
    catch (error) {
        return res.status(500).send({ status: false, msg: error.message })
    }
}

module.exports.login = login