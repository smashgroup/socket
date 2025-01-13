// const express = require('express');
// const WebSocket = require('ws');
// const http = require('http');

// // Create an express app and an HTTP server
// const app = express();
// const server = http.createServer(app);

// // Create WebSocket server instance
// const wss = new WebSocket.Server({ server });

// // This will hold active drivers and their positions (latitude, longitude)
// let drivers = [];

// wss.on('connection', (ws) => {
//   console.log('A driver has connected');
  
//   // When a driver sends their location
//   ws.on('message', (message) => {
//     try {
//       const locationData = JSON.parse(message);
//       if (locationData.type === 'locationUpdate') {
//         // Update the driver's location in the list
//         const { driverId, latitude, longitude } = locationData;

//         // Find the existing driver and update their position
//         let driver = drivers.find(d => d.driverId === driverId);
//         if (driver) {
//           driver.latitude = latitude;
//           driver.longitude = longitude;
//         } else {
//           // Add new driver to the list
//           drivers.push({ driverId, latitude, longitude });
//         }

//         // Send nearby drivers to all connected clients
//         broadcastNearbyDrivers(driverId);
//       }
//     } catch (error) {
//       console.error('Error processing message:', error);
//     }
//   });

//   // When a driver disconnects
//   ws.on('close', () => {
//     console.log('A driver has disconnected');
//     // Remove driver from the list
//     drivers = drivers.filter(driver => driver.ws !== ws);
//   });

//   // Send initial message when connected
//   ws.send(JSON.stringify({ message: 'Connected to WebSocket server' }));
// });

// // Broadcast nearby drivers to all clients
// const broadcastNearbyDrivers = (driverId) => {
//   const nearbyDrivers = drivers.filter(driver => driver.driverId !== driverId);

//   // Send the list of nearby drivers to all clients
//   wss.clients.forEach(client => {
//     if (client.readyState === WebSocket.OPEN) {
//       client.send(JSON.stringify({ type: 'nearbyDrivers', data: nearbyDrivers }));
//     }
//   });
// };

// // Start the server
// const PORT = process.env.PORT || 3000;
// server.listen(PORT, () => {
//   console.log(`WebSocket server is running on port ${PORT}`);
// });





'use strict';

const express = require("express");
const http = require('http');
const WebSocket = require("ws");
const geolib = require("geolib");

const app = express();

const port = process.env.PORT || 3000;

// const PORT = 4000;


const server = http.createServer(app);

// const server = app.listen(port, () => {
//     console.log(`Server is running on port ${port}`);
//   });


// store drivers locations

let drivers = {};

// create websocket server

const wss = new WebSocket.Server({ server });

// const wss = new WebSocket.Server({ port: 8080 });


wss.on("connection", (ws) => {

    console.log('A driver has connected');

    ws.on("message", (message) => {

        try {
            
            const data = JSON.parse(message);
            console.log(`Received message: `, data);

            if (data.type === "locationUpdate" && data.role === "driver") {
                drivers[data.driver] = {
                    latitude: data.data.latitude,
                    longitude: data.data.longitude,
                }
                console.log(`updated driver location:`, drivers[data.driver])
            }

            if (data.type === "requestRide" && data.role === "user") {
                const nearbyDrivers = findNearbyDrivers(data.latitude, data.longitude);

                ws.send(
                    JSON.stringify({type: "nearbyDrivers", drivers: nearbyDrivers})
                )
            }

        } catch (error) {
            console.log('Failed to parse Websocket message', error)
        }
    })
})

const findNearbyDrivers = (userLat, userLon) => {
    return Object.entries(drivers).filter(([id,location]) => {
        const distance = geolib.getDistance({
            latitude: userLat, 
            longitude: userLon
        }, location);
        return distance <= 5000  // 5kilometers
    })
    .map(([id, location]) => ({id, ...location}));
};


// // server.listen(PORT, () => {
// //     console.log(`Server is listening on port ${PORT}`);
// // });

app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})



















// // 'use strict';

// // const express = require('express');
// // const { Server } = require('ws');

// // const PORT = process.env.PORT || 3000;
// // const INDEX = '/index.html';

// // const server = express()
// //   .use((req, res) => res.sendFile(INDEX, { root: __dirname }))
// //   .listen(PORT, () => console.log(`Listening on ${PORT}`));

// // const wss = new Server({ server });

// // wss.on('connection', (ws) => {
// //   console.log('Client connected');
// //   ws.on('close', () => console.log('Client disconnected'));
// // });

// // setInterval(() => {
// //   wss.clients.forEach((client) => {
// //     client.send(new Date().toTimeString());
// //   });
// // }, 1000);




// // const express = require("express");
// // // const {Server} = require("ws");
// // const {WebSocketServer} = require("ws");
// // const geolib = require("geolib");

// // const PORT = 4000;



// // const PORT = process.env.PORT || 3000;

// // const server = express();



// // store drivers locations

// // let drivers = {};


// // const wss = new WebSocketServer({server});


// // const wss = new Server({ server });

// // const wss = new Server({ port: 8080 });

// // create websocket server


// // wss.on("connection", (ws) => {
// //     ws.on("message", (message) => {
// //         try {
// //             const data = JSON.parse(message);
// //             console.log(`Received message: `, data);

// //             if (data.type === "locationUpdate" && data.role === "driver") {
// //                 drivers[data.driver] = {
// //                     latitude: data.data.latitude,
// //                     longitude: data.data.longitude,
// //                 }
// //                 console.log(`updated driver location:`, drivers[data.driver])
// //             }

// //             if (data.type === "requestRide" && data.role === "user") {
// //                 const nearbyDrivers = findNearbyDrivers(data.latitude, data.longitude);

// //                 ws.send(
// //                     JSON.stringify({type: "nearbyDrivers", drivers: nearbyDrivers})
// //                 )
// //             }

// //         } catch (error) {
// //             console.log('Failed to parse Websocket message', error)
// //         }
// //     })
// // })

// // const findNearbyDrivers = (userLat, userLon) => {
// //     return Object.entries(drivers).filter(([id,location]) => {
// //         const distance = geolib.getDistance({
// //             latitude: userLat, 
// //             longitude: userLon
// //         }, location);
// //         return distance <= 5000  // 5kilometers
// //     })
// //     .map(([id, location]) => ({id, ...location}));
// // };

// // server.listen(PORT, () => console.log(`Listening on ${PORT}`));







// // const express = require("express");
// // const {WebSocketServer} = require("ws");
// // const geolib = require("geolib");

// // const app = express();
// // const PORT = 4000;

// // // store drivers locations

// // let drivers = {};

// // // create websocket server

// // const wss = new WebSocketServer({ port: 8080 });

// // wss.on("connection", (ws) => {
// //     ws.on("message", (message) => {
// //         try {
// //             const data = JSON.parse(message);
// //             console.log(`Received message: `, data);

// //             if (data.type === "locationUpdate" && data.role === "driver") {
// //                 drivers[data.driver] = {
// //                     latitude: data.data.latitude,
// //                     longitude: data.data.longitude,
// //                 }
// //                 console.log(`updated driver location:`, drivers[data.driver])
// //             }

// //             if (data.type === "requestRide" && data.role === "user") {
// //                 const nearbyDrivers = findNearbyDrivers(data.latitude, data.longitude);

// //                 ws.send(
// //                     JSON.stringify({type: "nearbyDrivers", drivers: nearbyDrivers})
// //                 )
// //             }

// //         } catch (error) {
// //             console.log('Failed to parse Websocket message', error)
// //         }
// //     })
// // })

// // const findNearbyDrivers = (userLat, userLon) => {
// //     return Object.entries(drivers).filter(([id,location]) => {
// //         const distance = geolib.getDistance({
// //             latitude: userLat, 
// //             longitude: userLon
// //         }, location);
// //         return distance <= 5000  // 5kilometers
// //     })
// //     .map(([id, location]) => ({id, ...location}));
// // };

// // app.listen(PORT, () => {
// //     console.log(`Server is running on port ${PORT}`)
// // })