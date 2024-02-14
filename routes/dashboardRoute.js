const express = require("express")
const router = express.Router()

// route controller
const pageController = require("../controllers/pageController")


router.get("/",pageController.homePage)
router.get("/dashboard",pageController.dashboard)

router.get("/mark-co2",pageController.mark_co2)
router.get("/report-co2",pageController.report_co2)

router.get("/all-emission",pageController.all_emission)
router.get("/transparent",pageController.transparent)

router.get("/allowance",pageController.allowance)
router.get("/buy-token",pageController.buy_token)

router.get("/sell-token",pageController.sell_token)
router.get("/marketplace",pageController.marketplace)

router.get("/quiz-reward",pageController.quiz_reward)
router.get("/kyc-verification", pageController.KYC)


module.exports = router