const Expo = require('expo-server-sdk');
const { Client } = require('pg');
const fetch = require('node-fetch');
const cheerio = require('cheerio');

let expo = new Expo();

// Get last date
const requestUrl = 'https://www.micm.gob.do/direcciones/hidrocarburos/avisos-semanales-de-precios/combustibles';

function updateLastValue(newValue) {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });
    client.connect((conerr) => {
        if (conerr) {
            throw conerr;
        } else {
            const query = 'UPDATE app_variables SET varvalue=$1 WHERE varkey=\'lastScan\';';
            const vals = [newValue];

            client.query(query, vals, (err, dbres) => {
                if (err) throw err;
                client.end();
            });
        }
    });
}

fetch(requestUrl)
    .then((response) => response.text())
    .then((html) => {
        let $ = cheerio.load(html);
        let dateScanned = $('.uk-grid.uk-grid-collapse.uk-visible-large .uk-text-small').first().text();
    
        const client = new Client({
            connectionString: process.env.DATABASE_URL,
        });
        client.connect((conerr) => {
            if (conerr) {
                throw conerr;
            } else {
                const variableQuery = 'SELECT varvalue FROM app_variables WHERE varkey=\'lastScan\';';
                const tokenQuery = 'SELECT token FROM tokens;';

                client.query(variableQuery+tokenQuery, (err, dbres) => {
                    if (err) throw err;
                    
                    let lastDate = dbres[0].rows[0].varvalue;
        
                    if(lastDate != dateScanned) {
                        // SEND NOTIFICATIONS
                        let messages = [];
                        
                        // Verify Tokens
                        let tokens = dbres[1].rows;
                        for(let pushToken of tokens) {
                            let token = pushToken.token;
                            if(!Expo.isExpoPushToken(token)) {
                                    console.error(`Push token ${token} is not a valid Expo push token`);
                                    continue;
                            }

                            messages.push({
                                to: token,
                                sound: 'default',
                                body: 'Los precios han sido actualizados.'
                            });
                        }

                        let chunks = expo.chunkPushNotifications(messages);

                        (async () => {
                            for(let chunk of chunks) {
                                try {
                                    let receipts = await expo.sendPushNotificationsAsync(chunk);
                                    console.log(receipts);
                                } catch(error) {
                                    console.error(error);
                                }
                            }
                        })();

                        // Update date
                        updateLastValue(dateScanned);
                    }

                    client.end();
                });
            }
        });
        
    });