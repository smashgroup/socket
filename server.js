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

//           console.log('congratulation a driver is updated', locationData)
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


const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const geolib = require('geolib');

const app = express();

const PORT = process.env.PORT || 3000;


const server = http.createServer(app);


// store drivers locations



// create websocket server

const wss = new WebSocket.Server({ server });

// const wss = new WebSocket.Server({ port: 8080 });

let drivers = [];


wss.on("connection", (ws) => {

    console.log('A driver has connected');

    // Incomming messages handled here

    ws.on('message', (message) => {

        try {

          
            const data = JSON.parse(message);

            // const {driver, role, type, location} = data 
            
            console.log(`Received message: `, data);

            // update driver location

            if (data.type === "locationUpdate" && role === "driver") {

                // const { driverId, latitude, longitude } = data;

                // Find the existing driver and update their position
                // let driver = drivers.find(d => d.driverId === driverId);
                // if (driver) {
                //   driver.latitude = latitude;
                //   driver.longitude = longitude;

                //   console.log('congratulation a driver is updated', data)

                // } else {
                //   // Add new driver to the list
                //   drivers.push({ driverId, latitude, longitude });
                // }
        


                drivers[data.driver] = {
                    latitude: data.data.location.latitude,
                    longitude: data.data.location.longitude,
                }

                console.log(`updated driver location:`, drivers[data.driver])
            }

            // rider request for a nearby driver

            if (data.type === "requestRide" && data.role === "user") {
                const nearbyDrivers = findNearbyDrivers(data.latitude, data.longitude);

                ws.send(
                    JSON.stringify({type: "nearbyDrivers", drivers: nearbyDrivers})
                )
            }

            // Send nearby drivers to all connected clients
                
            broadcastNearbyDrivers(data.driverId);

        } catch (error) {
            console.log('Failed to parse Websocket message', error)
        }
    });

      // Handle connection close
    ws.on("close", () => {
        console.log("driver disconnected");
        clients = drivers.filter((driver) => driver !== ws);
    });

})
// Find nearby drivers function on request by rider

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

// BROADCAST NEARBY DRIVER TO RIDERS


const broadcastNearbyDrivers = (driverId) => {
    const nearbyDrivers = drivers.filter(driver => driver.driverId !== driverId);
  
    // Send the list of nearby drivers to all clients
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type: 'nearbyDrivers', data: nearbyDrivers }));
      }
    });
  };


server.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});





// const findNearbyDrivers = (userLat, userLon, drivers, maxDistance = 5000) => {
//     // Filter drivers based on the distance to the user's location
//     const nearbyDrivers = Object.entries(drivers).filter((driver) => {
//       const distance = geolib.getDistance(
//         { latitude: userLat, longitude: userLon },
//         { latitude: driver.latitude, longitude: driver.longitude }
//       );
      
//       // Return true if the driver is within the maxDistance (in meters)
//       return distance <= maxDistance;
//     });
  
//     return nearbyDrivers;
//   };

// Send nearby drivers to connected riders











