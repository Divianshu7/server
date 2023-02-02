import mongoose from "mongoose";
import bcrypt from "bcrypt"
const { Schema } = mongoose
const userSchema = new Schema({
    name: {
        type: String,
        required: 'Name is required',
        trim: 'true'
    },
    email: {
        type: String,
        trim: true,
        required: 'Email required',
        unique: true,
    },
    password: {
        type: String,
        required: true,
        min: 6,
        max: 24
    },
    stripe_account_id: '',
    stripe_seller: {},
    stripeSession: {}
}, { timestamps: true })

userSchema.pre('save', function (next) {
    let user = this
    if (user.isModified('password')) {
        return bcrypt.hash(user.password, 12, function (err, hash) {
            if (err) {
                console.log('bcrypt hash error', err);
                return next(err);
            }
            user.password = hash;
            return next();
        })
    }
    else {
        return next();
    }
})
userSchema.methods.comparePasswords = function (password, next) {

    bcrypt.compare(password, this.password, function (err, match) {
        if (err) {
            console.log("Password comparing Error: ", err)
            return next(err, false)
        }
        else {
            console.log('Match password', match)
            return next(null, match)//next fuction always take 2 arguements
        }
    })
}

export default mongoose.model('User', userSchema);