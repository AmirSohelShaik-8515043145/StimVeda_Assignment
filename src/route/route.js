const express = require("express")
const router = express.Router()

//Import all module
const { createUser, getUserProfile } = require("../controller/userController")
const { login } = require("../controller/loginController")
const { authentication } = require("../middleware/middleware")
const { addHabit, updateHabit, deleteHabit, getHabitStatus } = require("../controller/habitController")

// User API
router.post('/register', createUser)                                // Create user API for Register 
router.post('/login', login)                                        // Login API
router.get('/getUser/:id', authentication, getUserProfile)          // Fetch API for authorised User


// Habit API
router.post('/addHabit/:userId', authentication, addHabit)          // API for add a habit
router.get('/getHabitDetails/:habitId', authentication, getHabitStatus)      // Habit Status fetch API
router.put('/updateHabit/:habitId', authentication, updateHabit)    // Update the API for Daily Basis 
router.delete('/deleteHabit/:habitId', authentication, deleteHabit) // Delete a habit API

module.exports = router