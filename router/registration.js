const Expo = require('expo-server-sdk');
const { Client } = require('pg');

const express = require('express');
const router = express.Router();

router.get('/all', (req, res) => {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });
    client.connect((conerr) => {
        if (conerr) {
            console.error('Error connecting', conerr.stack)
            res.status(500).send('Error connecting to database.');
        } else {
            client.query('SELECT token FROM tokens;', (err, dbres) => {
                if (err) {
                    console.error(err.stack);
                    res.status(500).send('An error ocurred while completing your request.');
                    client.end();
                    return;
                }
                
                res.json(dbres.rows);
        
                client.end();
            });
        }
    });
    
});

router.post('/:token', (req, res) => {
    let token = req.params.token;
    if(!Expo.isExpoPushToken(token)) {
        return res.status(500).json({status:'error', message: 'Invalid token.'});
    }

    // Token registration logic
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });
    client.connect((conerr) => {
        if (conerr) {
            console.error('Error connecting', conerr.stack)
            res.status(500).send('Error connecting to database.');
        } else {
            const insertQ = 'INSERT INTO tokens VALUES ($1)';
            const values = [token];

            client.query(insertQ, values, (err, dbres) => {
                
                if (err) {
                    if(err.code == '23505') {
                        res.json({status:'ok', token, message: 'This token is already registered.'});
                    } else {
                        res.status(500).json({status:'error', message: 'Error ocurred while adding token.'});
                    }

                    console.error(err.stack);
                    client.end();
                    return;
                }
                
                console.log('Registered token', token);
                res.json({status: 'ok', message: 'Token registered.', token});
        
                client.end();
            });
        }
    });
});

router.delete('/:token', (req, res) => {
    let token = req.params.token;
    if(!Expo.isExpoPushToken(token)) {
        return res.status(500).json({status:'error', message: 'Invalid token.'});
    }

    // Token deletion logic
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });
    client.connect((conerr) => {
        if (conerr) {
            console.error('Error connecting', conerr.stack)
            res.status(500).send('Error connecting to database.');
        } else {
            const delQ = 'DELETE FROM tokens WHERE token=$1';
            const values = [token];

            client.query(delQ, values, (err, dbres) => {
                
                if (err) {
                    res.status(500).json({status:'error', message: 'Error ocurred while removing token.'});
                    console.error(err.stack);

                    client.end();
                    return;
                }
                
                console.log('Removed token', token);
                res.json({status: 'ok', message: 'Token removed.', token});
        
                client.end();
            });
        }
    });
});

module.exports = router;