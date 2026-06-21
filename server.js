const express = require('express');
const app = express();
const path = require('path');

// 1. Tell Express to treat the "public" folder as the root for static assets
app.use(express.static(path.join(__dirname, 'public')));

// 2. Setup your template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 3. Define the routes for your three distinct calculator views
app.get('/', (req, res) => {
    res.render('index'); // Renders views/index.ejs (SWP)
});

app.get('/sip', (req, res) => {
    res.render('sip');   // Renders views/sip.ejs (SIP)
});

app.get('/swp', (req, res) => {
    res.render('swp');   // Renders views/swp.ejs (SWP)
});

app.get('/inflation', (req, res) => {
    res.render('inflation'); // Renders views/inflation.ejs (Inflation)
});

app.get('/fd', (req, res) => {
    res.render('fd'); // Renders views/fd.ejs (Fixed Deposit)
});

// Start the application server
app.listen(3000, () => {
    console.log('Server is tracking on http://localhost:3000');
});