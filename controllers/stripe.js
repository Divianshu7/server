import User from '../models/user'
import Stripe from 'stripe'
import { exec } from 'child_process'
import Hotel from '../models/hotel'
import Order from '../models/Order'
const queryString = require('querystring')
const stripe = Stripe(process.env.STRIPE_SECRET)
export const createConnectAccount = async (req, res) => {
    try {
        console.log('req user from requireSignin middleware ', req.auth)
        const user = await User.findById(req.auth._id).exec();
        console.log(user)
        if (!user.stripe_account_id) {
            const account = await stripe.accounts.create({
                type: 'custom',
                email: user.email,
                // capabilities: { card_payments: { requested: true }, transfers: { requested: true } },
            })
            user.stripe_account_id = account.id;
            user.save();
        }
        let accountLink = await stripe.accountLinks.create({
            account: user.stripe_account_id,
            refresh_url: process.env.STRIPE_REDIRECT_URL,
            return_url: process.env.STRIPE_REDIRECT_URL,
            type: 'account_onboarding'
        })
        accountLink = Object.assign(accountLink, {
            'stripe_user[email]': user.email || undefined
        })
        console.log('ACCOUNT LINK', accountLink)
        let link = `${accountLink.url}?${queryString.stringify(accountLink)}`;
        console.log('login link==> ', link)
        res.send(link)
    } catch (err) {
        console.log(err)
        res.status(400).send(err)
    }

}

export const getAccountStatus = async (req, res) => {
    console.log('Get account status')
    // console.log(req.auth)
    const user = await User.findById(req.auth._id).exec()
    const account = await stripe.accounts.retrieve(user.stripe_account_id)
    console.log('user account retrieve ', account)
    // console.log('user is ===> ', user)
    // const updateAccount = await updateDelayDays(account.id)
    const updateUser = await User.findByIdAndUpdate(user._id, {
        stripe_seller: account
    }, {
        new: true
    }).select('-password').exec();
    // console.log('updated user ==> ', updateUser)
    res.json(updateUser);
}
export const getAccountBalance = async (req, res) => {
    const user = await User.findById(req.auth._id).exec();
    try {
        const balance = await stripe.balance.retrieve({
            stripeAccount: user.stripe_account_id
        })
        // console.log('Balance ==> ', balance)
        res.json(balance)
    }
    catch (err) {
        console.log('Error in checking balance ', err)
    }
}

export const getPayoutSetting = async (req, res) => {
    try {
        // console.log(req.auth)
        const user = await User.findById(req.auth._id).exec()
        // console.log(user)
        const loginLink = await stripe.accounts.createLoginLink(user.stripe_seller.id, {
            redirect_url: process.env.STRIPE_REDIRECT_URL
        })
        console.log('Login Link for payout setting', loginLink)
        res.json(loginLink)
    } catch (err) {
        console.log('Payout Setting error', err)
    }
}
export const stripeSessionId = async (req, res) => {
    // console.log('you hit stripe session id', req.body.hotelId)
    const { hotelId } = req.body
    const item = await Hotel.findById(hotelId).populate('postedBy').exec()
    const fee = item.price * 20 / 100

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
            price_data: {
                unit_amount: item.price * 100,
                currency: 'INR',
                product_data: {
                    name: item.title
                }
            },
            quantity: 1
        }],
        mode: 'payment',
        payment_intent_data: {
            application_fee_amount: fee * 100,
            transfer_data: {
                destination: item.postedBy.stripe_account_id,
            },
        },
        success_url: `${process.env.STRIPE_SUCCESS_URL}/${hotelId}`,
        cancel_url: process.env.STRIPE_CANCEL_URL,

    })
    await User.findByIdAndUpdate(req.auth._id, { stripeSession: session }).exec()
    res.send({
        sessionId: session.id
    })
    // console.log('session====>', session)
}
export const stripeSuccess = async (req, res) => {
    // console.log(req.body.hotelId, req.auth._id)
    try {
        const { hotelId } = req.body
        const user = await User.findById(req.auth._id).exec()
        // console.log(user)
        if (!user.stripeSession) return;
        const session = await stripe.checkout.sessions.retrieve(user.stripeSession.id)
        if (session.payment_status === 'paid') {
            const orderExist = await Order.findOne({ 'session.id': session.id }).exec()
            if (orderExist) {
                res.json({ success: true })
            } else {
                let newOrder = await new Order({
                    hotel: hotelId,
                    session,
                    orderedBy: user._id
                }).save()
                await User.findByIdAndUpdate(user._id, {
                    $set: { stripeSession: {} }
                })
                res.json({ success: true })
            }
        }
    } catch (err) {
        console.log('stripe success err==> ', err)
    }
}