var express = require('express');
const session = require('express-session');
var app = express();
var path = require('path');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var Question = require('./controllers/questions');
var Module = require('./controllers/module');
var Stack = require('./controllers/stacks');
var Problem = require('./controllers/codings');
var Report = require('./controllers/report');
var Assesment = require('./controllers/assesment');
var AssesmentSubmission = require('./models/assesmentsubmissions');
var AssesmentReport = require('./controllers/assesment_report');
var colleges = require('./controllers/colleges');
var faculty = require('./controllers/faculty');
var tutor = require('./controllers/tutor');
var admin = require('./controllers/admin');
var User = require('./models/users');
var PracticedMcq = require('./models/practicedMcq');
var PracticedCoding = require('./models/practicedCodingAttempted');
var PracticedCodingSubmission = require('./models/PracticedCodingSubmissions');
var config = require('./config/config');
var jwt = require('jsonwebtoken');
const fs = require('fs'); // To read SSL certificate and key
const https = require('https'); // Include the 'https' module
const csvtojson = require('csvtojson');

var bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
var verifySession = require('./config/verifySession');
var cookieParser = require('cookie-parser');
var cors = require('cors');
const e = require('express');
const port = 8000;

const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:80',
    'https://localhost:443',
    'http://54.215.176.218:3000',
    'https://platform.rampex.in',
    // Add more origins as needed
];
app.use(cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS']
}));


// // mongoose.connect('mongodb+srv://jayeshcs20:jayeshcs20@cluster0.rpg3dwc.mongodb.net/', { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connect('mongodb+srv://rampex20:rampex20@rampex.ws927hl.mongodb.net/', { useNewUrlParser: true, useUnifiedTopology: true });

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', function () {
    console.log("Connected to MongoDB");
});

app.use(cookieParser());

app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 8 * 60 * 60 * 1000,
        httpOnly: true,
        secure: true,
        sameSite: 'none'
    },
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const privateKey = fs.readFileSync('/etc/letsencrypt/live/platform.rampex.in/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/platform.rampex.in/fullchain.pem', 'utf8');
//const privateKey = fs.readFileSync('./rampex.key', 'utf8');
//const certificate = fs.readFileSync('./rampex.crt', 'utf8');
const credentials = { key: privateKey, cert: certificate };

app.get('/', function (req, res) {
    res.send("WELCOME TO FarmEasy API");
});

app.post('/register/v2', async (req, res) => {
    try {
        const { user_name, user_email, user_password, user_contact } = req.body;
        // const user_type = "student";
        const token = crypto.randomBytes(20).toString('hex');
        const user_type = "student";
        const hashedPassword = await bcrypt.hash(user_password, 10);
        const transporter = nodemailer.createTransport({
            service: 'Gmail', // Replace with your email service provider
            auth: {
                user: 'jayesh007va@gmail.com', // Replace with your email address
                pass: 'zrxx fczv qote gtqp' // Replace with your email password or app password if using Gmail
            }
           
        });

        // Check if the email already exists
        const existingUser = await User.findOne({ user_email });
        if (existingUser && existingUser.user_status == "active") {
            return res.status(400).json({ message: 'Email already registered', status: 0 });
        }
        else if (existingUser && existingUser.user_status == "deactive") {
            return res.status(400).json({ message: 'Email already registered', status: 0 });
        }
        else if (existingUser && existingUser.user_status == "disabled") {
            existingUser.user_name = user_name;
            existingUser.user_password = hashedPassword;
            existingUser.user_type = user_type;
            existingUser.user_contact = user_contact;

            // Save the user to the database
            existingUser.confirmationToken = token;

            // Email content with confirmation link
            const confirmationLink = `https://platform.rampex.in:8000/confirm/${token}`; // Replace with your confirmation route
            const mailOptions = {
                from: 'rampex.india@gmail.com', // Sender address
                to: user_email, // Receiver's email
                subject: 'Registration Confirmation', // Email subject
                text: `Hello ${user_name},\n\nPlease click on the following link to confirm your registration:\n${confirmationLink}`, // Email body
            };

            // Send the email
            transporter.sendMail(mailOptions, async (error, info) => {
                if (error) {
                    console.error('Error sending email:', error);
                    // Handle error in sending email
                    return res.status(500).json({ message: 'Error sending confirmation email', status: 0 });
                }
                console.log('Email sent:', info.response);
                await existingUser.save();
                // Email sent successfully
                res.status(201).json({ message: 'User registered successfully. ReConfirmation email sent.', status: 1, user: existingUser });
            });

        }
        else {
            // Create a new user
            const newUser = new User({
                user_name,
                user_email,
                user_password: hashedPassword,
                user_type,
                user_contact,
            });

            // Save the user to the database
            newUser.confirmationToken = token;




            // Email content with confirmation link
            const confirmationLink = `https://platform.rampex.in:8000/confirm/${token}`; // Replace with your confirmation route
            const mailOptions = {
                from: 'rampex.india@gmail.com', // Sender address
                to: user_email, // Receiver's email
                subject: 'Registration Confirmation', // Email subject
                text: `Hello ${user_name},\n\nPlease click on the following link to confirm your registration:\n${confirmationLink}`, // Email body
            };

            // Send the email
            transporter.sendMail(mailOptions, async (error, info) => {
                if (error) {
                    console.error('Error sending email:', error);
                    // Handle error in sending email
                    return res.status(500).json({ message: 'Error sending confirmation email', status: 0 });
                }
                console.log('Email sent:', info.response);
                await newUser.save();
                // Email sent successfully
                res.status(201).json({ message: 'User registered successfully. Confirmation email sent.', status: 1, user: newUser });
            });

            // Hash the password
        }

    } catch (error) {
        console.error("Error in user registration: ", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.get('/confirm/:token', async (req, res) => {
    try {
        const token = req.params.token;

        // Find the user by the confirmation token
        const user = await User.findOne({ confirmationToken: token });

        if (!user) {
            // Handle invalid or expired token
            return res.status(400).json({ message: 'Invalid or expired confirmation link', status: 0 });
        }

        // Update the user's status to confirmed (or perform any necessary actions)
        user.user_status = 'active';
        user.confirmationToken = null; // Optionally clear the token after confirmation
        await user.save();

        // Redirect the user to a success page or send a confirmation message
        res.status(200).json({ message: 'User registration confirmed successfully', status: 1 });

    } catch (error) {
        console.error("Error confirming user registration: ", error);
        res.status(500).json({ message: 'Internal Server Error', status: 0 });
    }
});

app.post('/login', async (req, res) => {
    try {
        const { user_email, user_password } = req.body;
        const user = await User.findOne({ user_email });

        if (!user) {
            return res.status(401).json({ message: 'Authentication failed', status: 0 });
        }
        
        const passwordMatch = await bcrypt.compare(user_password, user.user_password);

        if (!passwordMatch) {
            return res.status(401).json({ message: 'Authentication failed', status: 0 });
        }

        if (user.user_status === 'deactive') {
            return res.status(401).json({ message: 'Authentication failed contact Administrator', status: 2 });
        }
        if (user.user_status === 'disabled') {
            return res.status(401).json({ message: 'Verify your Email Through Confirmation Link', status: 3 });
        }

        req.session.user = user;
        req.session.loggedIn = true;
        res.status(200).json({ user });
    } catch (error) {
        console.error("Error in user login: ", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.get('/checkSession', async (req, res) => {
    try {
        if (req.session.loggedIn && req.session.user) {
            res.status(200).json({ loggedIn: true, user_type: req.session.user.user_type });
        }
        else {
            res.status(200).json({ loggedIn: false });
        }
    }
    catch (error) {
        console.error("Error in checking session: ", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.post('/logout', function (req, res) {
    try {
        req.session.destroy();
        res.session = null;
        res.send('logout');
    }
    catch (error) {
        console.error("Error in user logout: ", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}
);





// app.listen(port, function () {
//     console.log(`Express server listening on port ${port}`);
// });
const httpsServer = https.createServer(credentials, app);


httpsServer.listen(port, function () {
    console.log(`Express server listening on port ${port} (HTTPS)`);
});