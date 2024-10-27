const express=require('express');
const router=express.Router();
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const bcrypt=require('bcrypt');
const User = require('../model/userSchema'); // Ensure this path is correct
const shortid=require('shortid');
const jwt=require('jsonwebtoken');
const geoip = require('geoip-lite');

const JWT_SECRET=process.env.SECRET_KEY;
router.get('/',(req,res)=>{
    res.send("Welcome to url shortner website");
})
//below code is used to register  user into database(when user comes to website and create account first time)
// router.post('/login', async (req, res) => {
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
//Original code
router.post('/register',async(req,res)=>{
try{
const {name,email,phone,password}=req.body;
if(!name || !email || !phone|| !password){
    return res.status(422).json({err:"Insuffiecent data to register"});
}
console.log("step1");
const userExist=await User.findOne({email:email});
if(userExist){
    return res.status(450).json({err:"email already exist"});
}
console.log("step2");
const newuser=new User({name,email,phone,password});
console.log("step3");
//before saving this document into database function of hashing password runs
const response=await newuser.save();
console.log("step4");
res.status(200).json({msg:"User registered successfully"});
console.log("step5");
}
catch(err){
    console.log(err);
    res.status(500).json({err:"Internal server error"});
}
})
//code from chatgpt
// router.post('/register', async (req, res) => {
//     try {
//       const { name, email, phone, password } = req.body;
  
//       if (!name || !email || !phone || !password) {
//         return res.status(422).json({ err: "Insufficient data to register" });
//       }
  
//       const userExist = await User.findOne({ email: email });
//       if (userExist) {
//         return res.status(450).json({ err: "Email already exists" }); // Consistent response
//       }
  
//       const newuser = new User({ name, email, phone, password });
//       await newuser.save();
  
//       res.status(200).json({ msg: "User registered successfully" });
//     } catch (err) {
//       console.log(err);
//       res.status(500).json({ err: "Internal server error" });
//     }
//   });
  
//below code is to access the account that is created by user


router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if both email and password are provided
        if (!email || !password) {
            console.log("Missing email or password");
            return res.status(422).json({ error: "Please provide both email and password" });
        }

        // Find the user with the provided email
        const user = await User.findOne({ email });
        if (!user) {
            console.log("User not found with email:", email);
            return res.status(400).json({ error: "Invalid credentials" });
        }

        console.log("User found:", user);

        // Compare the provided password with the hashed password in the database
        const isMatch = await bcrypt.compare(password, user.password);
        console.log("Password match:", isMatch); // Log result of comparison

        if (!isMatch) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        // Generate JWT token
        const token = await user.generateAuthToken();
        console.log("Generated Token:", token);

        // Set the JWT token in a cookie
        res.cookie("jwtoken", token, {
            expires: new Date(Date.now() + 2589200000), // Cookie expiration (300 days)
            httpOnly: true, // Makes the cookie inaccessible to JavaScript on the client-side
            secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
            sameSite: 'strict', // Prevent CSRF attacks
        });

        console.log("Login successful");

        // Respond with a success message
        res.status(200).json({ message: "User signed in successfully_" });

    } catch (err) {
        console.error("Login Error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

//module.exports = router;

// router.post('/login', async (req, res) => {
//     const { username, password } = req.body;

//     try {
//         // Find the user by username
//         const user = await User.findOne({ username });
//         if (!user) {
//             return res.status(401).json({ error: 'Invalid username or password' });
//         }

//         // Check password
//         const isMatch = await bcrypt.compare(password, user.password);
//         if (!isMatch) {
//             return res.status(401).json({ error: 'Invalid username or password' });
//         }

//         // Create a token
//         const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' }); // Token expires in 1 hour

//         // Send the token in response
//         res.status(200).json({ token });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });
//below code is used to short the long url and also to store the info into database
// router.post('/shorturl', async (req, res) => {
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
//above is orginal shorturl code and below is new generated
// const authenticate = require('./middleware/authenticate');
const authenticate = require('./authMiddleware');

// router.post('/shorturl', authenticate, async (req, res) => {
//     try {
//         const { longUrl } = req.body;

//         if (!longUrl) {
//             return res.status(400).json({ error: "URL is not passed" });
//         }

//         // Generate short ID and collect user IP & location as before
//         const shortId = shortid.generate();
//         const creatorIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
//         const geo = geoip.lookup(creatorIp);
//         const creatorLocation = geo ? `${geo.city}, ${geo.country}` : 'Unknown';

//         // Store new URL in user object
//         const newUrl = { longUrl, shortId, creatorIp, creatorLocation };
//         req.user.urls.push(newUrl);
//         await req.user.save();

//         res.status(200).json({ shortId });
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ error: "Internal server error" });
//     }
// });
router.post('/shorturl', authenticate, async (req, res) => {
    try {
        const { longUrl } = req.body;

        if (!longUrl) {
            return res.status(400).json({ error: "URL is not passed" });
        }

        console.log('Received long URL:', longUrl);

        // const creatorIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const forwarded = req.headers['x-forwarded-for'];
        const creatorIp = forwarded ? forwarded.split(',')[0] : req.socket.remoteAddress;

        const geo = geoip.lookup(creatorIp);
        const creatorLocation = geo ? `${geo.city}, ${geo.country}` : 'Unknown';

        let shortId;
        let existingUrl;

        // Generate a unique short ID and ensure it doesn't already exist
        do {
            shortId = shortid.generate();
            existingUrl = req.user.urls.find(url => url.shortId === shortId);
        } while (existingUrl); // Repeat until a unique shortId is generated

        const newUrl = { longUrl, shortId, creatorIp, creatorLocation };
        req.user.urls.push(newUrl);

        // Log user URLs before saving
        console.log('User URLs before save:', req.user.urls);

        await req.user.save();
        res.status(200).json({ shortId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});
// router.get('/analytics', authenticate, async (req, res) => {
//     try {
//         if (!req.user) {
//             console.error("User not found in request.");
//             return res.status(401).json({ error: "Unauthorized: User not found." });
//         }

//         if (!req.user.urls || req.user.urls.length === 0) {
//             console.error("No URLs found for this user.");
//             return res.status(404).json({ error: "User or URLs not found." }); // 404 for not found
//         }

//         const analyticsData = req.user.urls.map(url => ({
//             longUrl: url.longUrl,
//             shortId: url.shortId,
//             clicks: url.clicks,
//         }));

//         console.log("Analytics data retrieved:", analyticsData);

//         // Sending response as JSON
//         res.status(200).json({ analytics: analyticsData });
//     } catch (err) {
//         console.error("Error in analytics route:", err);
//         res.status(500).json({ error: "Server Error" });
//     }
// });
router.get('/analytics', authenticate, async (req, res) => {
    try {
        if (!req.user) {
            console.error("User not found in request.");
            return res.status(401).json({ error: "Unauthorized: User not found." });
        }

        if (!req.user.urls || req.user.urls.length === 0) {
            console.error("No URLs found for this user.");
            return res.status(404).json({ error: "User or URLs not found." }); // 404 for not found
        }

        // Map through the URLs to get analytics data with serial number
        const analyticsData = req.user.urls.map((url, index) => ({
            serialnumber: index + 1, // Serial number starting from 1
            longUrl: url.longUrl,
            shortId: url.shortId,
            clicks: url.clicks,
        }));

        console.log("Analytics data retrieved:", analyticsData);

        // Sending response as JSON
        res.status(200).json({ analytics: analyticsData });
    } catch (err) {
        console.error("Error in analytics route:", err);
        res.status(500).json({ error: "Server Error" });
    }
});

//below code is used to increase the count whenever link is clicked
router.get('/:shortId', async (req, res) => {
    try {
      const shortId = req.params.shortId;
  
      // Find the user who owns the URL with the given shortId
      const user = await User.findOne({ "urls.shortId": shortId });
      console.log(user);
      if (user) {
        // Find the URL within the user's urls array
        const url = user.urls.find(url => url.shortId === shortId);
        console.log(url);
        if (url) {
          // Increment the click count
          url.clicks += 1;
  
          // Save the updated user document
          await user.save();
  
          // Redirect to the original long URL
          res.redirect(url.longUrl);
        } else {
          res.status(404).send('URL not found');
        }
      } else {
        res.status(404).send('User or URL_ not found');
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  //analytics code
   
  module.exports=router;