const Expo = require('expo-server-sdk');

const express = require('express');
const router = express.Router();

router.get('/all', (req, res) => {
    res.send('all tokens');
});

router.post('/:token', (req, res) => {
    let token = req.params.token;
    if(!Expo.isExpoPushToken(token)) {
        return res.status(500).json({status:'error', message: 'Invalid token.'});
    }

    // Token registration logic
    console.log('Registered token', token);
    res.json({status: 'ok', message: 'Token registered.', token});
});

router.delete('/:token', (req, res) => {
    if(!Expo.isExpoPushToken(token)) {
        return res.status(500).json({status:'error', message: 'Invalid token.'});
    }

    // Token deletion logic
    console.log('Removed token', token);
    res.json({status: 'ok', message: 'Token unregistered.', token});
});

module.exports = router;