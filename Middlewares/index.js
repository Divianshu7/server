import Hotel from "../models/hotel";

var { expressjwt } = require("express-jwt");
export const requireSignin = expressjwt({
    //checks secret,expiry date
    secret: process.env.JWT_SECRET,
    algorithms: ['HS256']
})
//gives user id in req.user in function where this middleware is accessed
export const hotelOwner = async (req, res, next) => {
    // console.log('assasadasd')
    // console.log('ass == ', req.params)
    let hotel = await Hotel.findById(req.params.hotelId).exec()
    let owner = hotel.postedBy._id.toString() === req.auth._id
    // console.log(owner)
    if (!owner) {
        return res.status(403).send('Unauthorized')
    }
    next();
}