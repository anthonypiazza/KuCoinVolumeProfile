const express = require('express');

const Coins = require('../data-models/coinModels');
const router = express.Router();

router.get('/get', (req,res) => {
    const {period, base, paired} = req.body

    Coins.getCoinById(period, base, paired)
        .then(coins => {
            res.status(200).json(coins)
        })
        .catch(err => {
            res.status(400).json({ error: "Cannot retrieve coins" })
        })
})

module.exports = router ;