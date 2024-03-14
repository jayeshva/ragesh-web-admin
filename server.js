var express = require('express');
const session = require('express-session');
var app = express();
var fileUpload = require('express-fileupload');
var path = require('path');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
const fs = require('fs'); // To read SSL certificate and key
const https = require('https'); // Include the 'https' module
const nodemailer = require('nodemailer');
const crypto = require('crypto');
var cookieParser = require('cookie-parser');
var cors = require('cors');  
var dashboard = require('./controllers/dashboard');
var contact = require('./controllers/contact');
var schemes = require('./controllers/schemes');
var feeds = require('./controllers/feeds');
var profile = require('./controllers/profile');
var enroll = require('./controllers/enroll');
var User = require('./models/user');
var approvalProfile = require('./controllers/approvalProfile');
const port = 8000;

app.use(fileUpload());
app.set('view engine', 'ejs');
app.use("/public", express.static(__dirname+"/public"))
mongoose.connect('mongodb+srv://jayeshcs20:jayeshcs20@farmeasydb.jpxxhts.mongodb.net/');

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
// const privateKey = fs.readFileSync('/etc/letsencrypt/live/platform.rampex.in/privkey.pem', 'utf8');
// const certificate = fs.readFileSync('/etc/letsencrypt/live/platform.rampex.in/fullchain.pem', 'utf8');
//const privateKey = fs.readFileSync('./rampex.key', 'utf8');
//const certificate = fs.readFileSync('./rampex.crt', 'utf8');
// const credentials = { key: privateKey, cert: certificate };


app.use('/dashboard', dashboard);
app.use('/contacts', contact);
app.use('/schemes', schemes);
app.use('/feeds', feeds);
app.use('/profile', profile);
app.use('/enroll', enroll);
app.use('/approvalProfile', approvalProfile);


app.get('/', function (req, res) {
    res.render('login');
});

app.post('/register/v2', async (req, res) => {
    try {
        const { user_name, user_email, user_password, user_mobile ,user_gender} = req.body;
        const token = crypto.randomBytes(20).toString('hex');

        console.log(req.body)
        console.log(req.files)

        if (!req.files) {
            return res.status(400).json({ message: 'Upload a Mandatory files uploaded' });
        }
        const transporter = nodemailer.createTransport({
            service: 'Gmail', // Replace with your email service provider
            auth: {
                user: 'jayesh007va@gmail.com', // Replace with your email address
                pass: 'zrxx fczv qote gtqp' // Replace with your email password or app password if using Gmail
            }
           
        });

        // Check if the email already exists
        const existingUser = await User.findOne({ user_email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered', status: 0 });
        }
        else {
            // Create a new user
            const newUser = new User({
                user_name,
                user_email,
                user_password,
                user_mobile,
                user_gender
            });

            newUser.confirmationToken = token;

            // Email content with confirmation link
            const confirmationLink = `http://localhost:8000/confirm/${token}`; // Replace with your confirmation route
            const mailOptions = {
                from: 'jayesh007va@gmail.com', // Sender address
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

app.get('/login', async function (req, res) {
    res.render('login');
});

app.get('/register', async function (req, res) {
    res.render('register');
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


app.listen(port, function () {
    console.log(`Express server listening on port ${port}`);
});
// const httpsServer = https.createServer(credentials, app);


// httpsServer.listen(port, function () {
//     console.log(`Express server listening on port ${port} (HTTPS)`);
// });