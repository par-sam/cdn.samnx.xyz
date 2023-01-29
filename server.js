const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

app.use(fileUpload())

app.set('view engine', 'ejs');

let auth_ip = [
    "109.134.83.39",
    "109.88.115.97",
    "::1",
    "test"
]

app.get('/', (req, res) => {
    res.status(403).send('403 - Forbidden');
})

app.get("/upload", (req, res) => {
    let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    console.log(ip)

    if (!auth_ip.includes(ip)) {
        res.status(403).send('403 - Forbidden');
        return;
    }

    res.render("pages/upload")
})

app.post("/upload", (req, res) => {
    let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    if (!auth_ip.includes(ip)) {
        res.status(403).send('403 - Forbidden');
        return;
    }

    if (!req.files) {
        return res.status(400).send('No files were uploaded.');
    }

    let file = req.files.cdnupload
    let filename = file.name.split(".")
    let extension = filename[filename.length - 1]
    
    let id = generate_token(64)

    while (fs.existsSync(`${__dirname}/content/${id}.${extension}`)) {
        id = generate_token(64)
    }

    let newFilename = `${id}.${extension}`

    file.mv(`${__dirname}/content/${newFilename}`, (err) => {
        if (err) return res.status(500).send(err);

        res.redirect("/upload")
    })

})

app.get("/*", (req, res) => {
    fs.stat(`${__dirname}/content${req.path}`, (err, stats) => {
        if (err) {
            res.status(404).send('404 - Not Found');
            return;
        }

        res.sendFile(`${__dirname}/content${req.path}`);
    })
})

function generate_token(length){
    var a = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890".split("");
    var b = [];  
    for (var i=0; i<length; i++) {
        var j = (Math.random() * (a.length-1)).toFixed(0);
        b[i] = a[j];
    }
    return b.join("");
}

app.use((req, res, next) => {
    res.status(404).send('404 - Not Found');
})

app.listen(3000, () => {
    console.log('Server is running on port 3000');
})