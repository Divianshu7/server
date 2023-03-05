import express from "express"
import { connect, login, register } from "../controllers/auth";
const router = express.Router();
router.get("/connect", connect)
router.post('/register', register)
router.post('/login', login)
module.exports = router