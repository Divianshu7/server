import Hotel from "../models/hotel"
import fs from 'fs'
import Order from "../models/Order"
export const create = async (req, res) => {
    // console.log('fields ==>', req.fields)
    // console.log('files ==>', req.files)
    try {
        let fields = req.fields
        let files = req.files
        let hotel = new Hotel(fields);
        hotel.postedBy = req.auth._id
        if (files.image) {
            hotel.image.data = fs.readFileSync(files.image.path)
            hotel.image.contentType = files.image.type
        }
        hotel.save((err, result) => {
            if (err) {
                console.log('saving hotel error==>', err)
                res.status(400).send('error saving')
            } res.json(result);
        })
    } catch (err) {
        console.log(err)
        res.status(400).json({
            err: err.message
        })
    }
}
export const hotel = async (req, res) => {
    try {
        let all = await Hotel.find().limit(24).select('-image.data').populate('postedBy', '_id name').exec();
        res.json(all)
    } catch (err) {
        console.log(err)
        res.status(400).json({
            err: err.message
        })
    }

}
export const image = async (req, res) => {
    try {
        let hotel = await Hotel.findById(req.params.hotelId).exec()
        if (hotel && hotel.image && hotel.image.data != null) {
            res.set('Content-Type', hotel.image.contentType)
            return res.send(hotel.image.data)
        }
    } catch (err) {
        console.log(err)
        res.status(400).send(err)
    }
}
export const sellerHotels = async (req, res) => {
    let all = await Hotel.find({ postedBy: req.auth._id }).select('-image.data').populate('postedBy', '_id name').exec()
    return res.send(all);
}

export const remove = async (req, res) => {
    console.log(req.params)
    let removed = await Hotel.findByIdAndDelete(req.params.hotelId).select('-image.data').exec()
    res.json(removed)
}
export const read = async (req, res) => {
    let hotel = await Hotel.findById(req.params.hotelId).populate('postedBy', '_id name').select('-image.data').exec()
    console.log('single hotel== ', hotel)
    res.json(hotel)
}
export const updateH = async (req, res) => {
    try {
        console.log('yess updating')
        let fields = req.fields
        let files = req.files
        console.log(fields, files)
        let data = { ...fields }
        if (files.image) {
            let image = {}
            image.data = fs.readFileSync(files.image.path)
            image.contentType = files.image.type
            data.image = image
        }
        let updated = await Hotel.findByIdAndUpdate(req.params.hotelId, data, {
            new: true
        }).select('-image.data')
        res.json(updated)
    } catch (err) {
        console.log(err)
        res.status(400).send('Hotel update failed try again')
    }
}
export const userHotelBookings = async (req, res) => {
    const all = await Order.find({ orderedBy: req.auth._id }).select('session').populate('hotel', '-image.data').populate('orderedBy', '_id name').exec()
    res.json(all)
}
export const isAlreadyBooked = async (req, res) => {
    const { hotelId } = req.params
    const userOrders = await Order.find({ orderedBy: req.auth._id }).select('hotel').exec()
    let ids = []
    for (let i = 0; i < userOrders.length; i++) {
        ids.push(userOrders[i].hotel.toString())
    }
    res.json({
        ok: ids.includes(hotelId)
    })
}
export const searchListings = async (req, res) => {
    try {
        const { location, date, bed } = req.body
        // console.table({ location, date, bed })
        const fromDate = date.split(',')
        let result = await Hotel.find(
            {
                from: {
                    $gte: new Date(fromDate[0]),
                }, location: location,

            }
        ).select('-image.data').exec()
        console.log(result)
        res.json(result)
    } catch (err) {
        res.status(400).send(err)
    }
}