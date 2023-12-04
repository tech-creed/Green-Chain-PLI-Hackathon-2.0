const express = require("express")
const router = express.Router()

// route controller
const pageController = require("../controllers/pageController")


router.get("/",pageController.homePage)
router.get("/dashboard",pageController.dashboard)

router.get("/mark-co2",pageController.mark_co2)

module.exports = router