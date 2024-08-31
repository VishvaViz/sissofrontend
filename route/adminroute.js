const route = require('express').Router()
const admincontrol = require('../controllers/adminctrl')
const { jwtverify } = require('../middleware/jwtverify')


route.post('/adminLogin', admincontrol)

module.exports = route