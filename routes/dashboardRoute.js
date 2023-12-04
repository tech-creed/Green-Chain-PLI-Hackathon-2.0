const express = require("express")
const router = express.Router()

// route controller
const pageController = require("../controllers/pageController")


router.get("/",pageController.homePage)
router.get("/dashboard",pageController.dashboard)

module.exports = router