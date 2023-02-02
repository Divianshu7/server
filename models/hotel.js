import mongoose from 'mongoose'
// import User from './user'
const { Schema } = mongoose
const { ObjectId } = mongoose.Schema

const hotelSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true,
        maxlength: 10000
    },
    image: {
        data: Buffer,
        contentType: String
    },
    location: {
        type: String
    },
    price: {
        type: Number,
        required: true,
        trim: true
    },
    postedBy: {
        type: ObjectId,
        ref: 'User'
    },
    from: {
        type: Date
    },
    bed: {
        type: Number
    },
    to: {
        type: Date
    },

}, { timestamps: true })

export default mongoose.model('Hotel', hotelSchema)