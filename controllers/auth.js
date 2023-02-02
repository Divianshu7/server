import jwt from 'jsonwebtoken'
import User from "../models/user";
export const register = async (req, res) => {

    try {
        console.log(req.body);
        const { name, email, password } = req.body
        if (!name) return res.status(400).send('name is required')
        if (!password || password.length < 6) {
            return res.status(400).send('password required and should be at least 6 characters')

        }
        let userExist = await User.findOne({ email }).exec()
        if (userExist) {
            return res.status(400).send('email is taken')

        }
        const user = new User(req.body)
        await user.save();
        console.log('user saved')
        return res.json({ ok: true })
    } catch (err) {
        console.log('couldnt save error', err)
        return res.status(400).send('Error Try again')
    }

}
export const login = async (req, res) => {
    const { email, password } = req.body
    console.log(email)

    try {
        let userExist = await User.findOne({ email }).exec();
        if (userExist) {
            console.log(userExist)
            userExist.comparePasswords(password, (err, match) => {
                if (!match || err) return res.status(400).send("wrong password :")
            })
            let token = jwt.sign({ _id: userExist._id }, process.env.JWT_SECRET, {
                expiresIn: '70d'
            })
            res.json({
                token, userExist: {
                    _id: userExist._id,
                    name: userExist.name,
                    email: userExist.email,
                    createdAt: userExist.createdAt,
                    updatedAt: userExist.updatedAt,
                    stripe_seller: userExist.stripe_seller,
                    stripe_account_id: userExist.stripe_account_id,
                    stripeSessinon: userExist.stripeSession
                }
            })

        }
        else {
            console.log('invalid email')
            res.status(400).send('Invalid email Please try again')
        }
    }
    catch (err) {
        console.log('login error', err)
        res.status(400).send('SignIn error')
    }

}