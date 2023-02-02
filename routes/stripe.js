import express from "express"
import { createConnectAccount, getAccountBalance, getAccountStatus, getPayoutSetting, stripeSessionId, stripeSuccess } from "../controllers/stripe"
import { requireSignin } from "../Middlewares"//middleware to check token
const router = express.Router()
router.post('/create-connect-account', requireSignin, createConnectAccount)
router.post('/get-account-status', requireSignin, getAccountStatus)
router.post('/get-account-balance', requireSignin, getAccountBalance)
router.post('/payout-setting', requireSignin, getPayoutSetting)
router.post('/stripe-session-id', requireSignin, stripeSessionId)
router.post('/stripe-success', requireSignin, stripeSuccess)
module.exports = router