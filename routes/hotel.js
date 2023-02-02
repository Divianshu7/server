import express from 'express'
import { create, hotel, image, sellerHotels, remove, read, updateH, userHotelBookings, isAlreadyBooked, searchListings } from '../controllers/hotle'
import formidable from 'express-formidable'
import { hotelOwner, requireSignin } from '../Middlewares'

const router = express.Router()
router.post('/create-hotel', requireSignin, formidable(), create)
router.get('/hotels', hotel)
router.get('/hotel/image/:hotelId', image)
router.get('/seller/hotels', requireSignin, sellerHotels)
router.delete('/delete-hotel/:hotelId', requireSignin, hotelOwner, remove)
router.get('/hotel/:hotelId', read)
router.put('/hotel/update-hotel/:hotelId', requireSignin, hotelOwner, formidable(), updateH)
router.get('/user-hotel-bookings', requireSignin, userHotelBookings)
router.get('/is-already-booked/:hotelId', requireSignin, isAlreadyBooked)
router.post('/search-listings', searchListings)
module.exports = router