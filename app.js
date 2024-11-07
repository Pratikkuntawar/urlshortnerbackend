const express = require('express');
const app = express();
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const User = require('./model/userSchema'); // Ensure this path is correct
const db = require('./db');
const cookieParser = require('cookie-parser'); // Import cookie-parser
dotenv.config({ path: './config.env' });
const shortid=require('shortid');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
const cors = require('cors');
// Other middleware and routes
app.use(express.json());
//app.use(cors()); 
app.use(cors({
    origin: 'https://urlshortner-1j84.onrender.com/',  // Replace with your actual frontend domain
    credentials: true, // Allow sending cookies with requests
  }));

app.get('/', (req, res) => {
    res.send("Welcome to Url shortener Project");
});
app.use(require('./router/auth'));
// Save user data when logging in
// app.post('/login', async (req, res) => {
//     try {
//         const data = req.body;
//         const newUser = new User(data); // This line should work if User is a constructor
//         const response = await newUser.save();
//         console.log("Data saved");
//         res.status(200).json(response);
//     } catch (err) {
//         console.log(err);
//         res.status(500).json({ err: "Internal server error" });
//     }
// });

// app.post('/shorturl', async (req, res) => {
//     try {
//         const { longUrl, userId } = req.body;

//         if (!longUrl) {
//             return res.status(400).json({ error: "URL is not passed" });
//         }

//         if (!userId) {
//             return res.status(400).json({ error: "User ID is not passed" });
//         }

//         // Find the user by ID
//         const user = await User.findById(userId);

//         if (!user) {
//             return res.status(404).json({ error: "User not found" });
//         }

//         // Generate a short ID for the URL
//         const shortId = shortid.generate();

//         // Get the user's IP address from the request
//         const creatorIp = req.headers['cf-connecting-ip']||req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
//         console.log('IP Address:', creatorIp); // Debugging log

//         // Get the location data based on the IP address
//         let creatorLocation = 'Location not found';
//         if (creatorIp && creatorIp !== '::1' && creatorIp !== '127.0.0.1') {
//             const geo = geoip.lookup(creatorIp);
//             creatorLocation = geo ? `${geo.city}, ${geo.country}` : 'Location not found';
//         } else {
//             creatorLocation = 'Localhost IP address'; // For testing purposes
//         }
//         console.log('Location Data:', creatorLocation); // Debugging log

//         const newUrl = {
//             longUrl,
//             shortId,
//             creatorIp,
//             creatorLocation
//         };

//         // Push the new URL data into the user's urls array
//         user.urls.push(newUrl);
//         const response = await user.save();

//         res.status(200).json({ shortId, response });
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ err: "Internal server error" });
//     }
// });

// app.get('/:shortId', async (req, res) => {
//     try {
//       const shortId = req.params.shortId;
  
//       // Find the user who owns the URL with the given shortId
//       const user = await User.findOne({ "urls.shortId": shortId });
//       console.log(user);
//       if (user) {
//         // Find the URL within the user's urls array
//         const url = user.urls.find(url => url.shortId === shortId);
//         console.log(url);
//         if (url) {
//           // Increment the click count
//           url.clicks += 1;
  
//           // Save the updated user document
//           await user.save();
  
//           // Redirect to the original long URL
//           res.redirect(url.longUrl);
//         } else {
//           res.status(404).send('URL not found');
//         }
//       } else {
//         res.status(404).send('User or URL not found');
//       }
//     } catch (err) {
//       console.error(err);
//       res.status(500).json({ error: "Internal server error" });
//     }
//   });
const PORT=process.env.PORT||8000;
app.listen(PORT, () => {
    console.log("Server started at port 5000");
});
