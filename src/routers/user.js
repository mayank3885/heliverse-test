const express = require('express')
const bcrypt = require('bcryptjs')
const User = require('../models/user.js')
const router = new express.Router()

router.post('/auth/register', async (req, res) => {
    const user = new User(req.body)

    try {
        if(user.confirmPassword!==user.password){
            return res.status(400).send({
                "responsePacket": {},
                "responseCode": 400,
                "responseMessage": "Passwords do not match."
            })
        }
        user.password = await bcrypt.hash(user.password, 8)
        await user.save()
        const token = await user.generateAuthToken()
        res.status(201).send({
            "responsePacket": { user, token },
            "responseCode": 201,
            "responseMessage": "User has been created successfully."
        })
    } catch (e) {
        res.status(400).send({
            "responsePacket": {},
            "responseCode": 400,
            "responseMessage": "Email already exists"
        })
    }
})

router.post('/auth/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.status(200).send({
            "responsePacket": { user, token },
            "responseCode": 200,
            "responseMessage": "User has been logged in successfully."
        })
    } catch (e) {
        res.status(404).send({
            "responsePacket": {},
            "responseCode": 404,
            "responseMessage": "User not found"
        }
        )
    }
})

router.get('/users/:id', async (req, res) => {
    const _id = req.params.id
    try {
        const user = await User.findById(_id)
        if (!user) {
            throw new Error
        }
        res.status(200).send({
            "responsePacket": { user },
            "responseCode": 200,
            "responseMessage": "User fetched successfully."
        })
    } catch (e) {
        res.status(400).send({
            "responsePacket": {},
            "responseCode": 400,
            "responseMessage": "No user found"
        })
    }
})

router.put('/users/:id', async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password']
    const isValidOperation = updates.every(update => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send('Invalid updates')
    }
    try {
        const user = await User.findById(req.params.id)
        updates.forEach(update => user[update] = req.body[update])
        await user.save()
        if (!user) {
            throw new Error
        }
        res.status(200).send({
            "responsePacket": { user },
            "responseCode": 200,
            "responseMessage": "User updated successfully."
        })
    } catch (e) {
        res.status(400).send({
            "responsePacket": {},
            "responseCode": 400,
            "responseMessage": "User update failed."
        })
    }
})

router.delete('/users/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id)
        if (!user) {
            throw new Error
        }
        res.status(200).send({
            "responsePacket": { user },
            "responseCode": 200,
            "responseMessage": "User deleted successfully."
        })
    } catch (e) {
        res.status(400).send({
            "responsePacket": {},
            "responseCode": 200,
            "responseMessage": "Failed in deleting user"
        })
    }
})

module.exports = router