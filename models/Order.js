import mongoose from "mongoose"

const { Schema } = mongoose
const { ObjectId } = mongoose.Schema
const orderSchema = new Schema({
    hotel: {
        type: ObjectId,
        ref: 'Hotel'
    },
    session: {

    },
    orderedBy: {
        type: ObjectId,
        ref: 'User'
    },

}, { timestamps: true })
export default mongoose.model('Order', orderSchema)