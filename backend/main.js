// Load express, mysql and mongo
const morgan = require('morgan');
const { MongoClient } = require('mongodb');
const AWS = require('aws-sdk');
const multer = require('multer');
const fs = require('fs');
const mysql = require('mysql2/promise');
const { mkQuery, gameReviews } = require('./db_utils');
const express = require('express');
const bodyParser = require("body-parser");
const cors = require('cors');
const bcrypt = require('bcrypt');
require("dotenv").config();
const path = require('path')
const fileUpload = require('express-fileupload');

// configure the databases
const pool = mysql.createPool({
	host: process.env.DB_HOST || 'localhost',
	user: process.env.DB_USER || 'root',
	password: process.env.DB_PASSWORD || '',
	database: process.env.DB_NAME || 'paf2020',
	connectionLimit: 4,
	timezone: '+08:00'
});

// const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017';
const MONGO_URL = process.env.MONGO_URL || 'mongodb+srv://root:root@cluster0.qg0gs.mongodb.net/paf2020?retryWrites=true&w=majority';
const MONGO_DB = 'paf2020';
const MONGO_COLLECTION = 'posts';
const client = new MongoClient(MONGO_URL, {
	useNewUrlParser: true, useUnifiedTopology: true
});

const PORT = parseInt(process.argv[2]) || parseInt(process.env.PORT) || 3000;

const mkTemperature = (params, image) => {
	const salt = bcrypt.genSaltSync(10);
	const hash = bcrypt.hashSync(params.password, salt);
	return {
		createdTime: new Date(),
		username: params.userName,
		title: params.title,
		comments: params.comments,
		password: hash,
		image: image
	};
};

const readFile = (path) => new Promise(
	(resolve, reject) => 
		fs.readFile(path, (err, buff) => {
			if (null != err)
				reject(err);
			else 
				resolve(buff);
		})
);

const putObject = (file, buff, s3) => new Promise(
	(resolve, reject) => {
		const params = {
			Bucket: 'acme',
			Key: file.filename, 
			Body: buff,
			ACL: 'public-read',
			ContentType: file.mimetype,
			ContentLength: file.size
		}
		s3.putObject(params, (err, result) => {
			if (null != err)
				reject(err);
			else
				resolve(result);
		});
	}
);

const s3 = new AWS.S3({
	endpoint: new AWS.Endpoint('sfo2.digitaloceanspaces.com'),
	accessKeyId: process.env.ACCESS_KEY,
	secretAccessKey: process.env.SECRET_ACCESS_KEY
})


const upload = multer({
	dest: process.env.TMP_DIR || '/opt/tmp/uploads'
})

// create app
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(cors({ origin: '*' }));
app.use(morgan('combined'));
app.use(fileUpload());

app.post('/api/login', async (request, response) => {
	console.log(request.body.username);
	let pwd = '';
	const [rows, fields] = await pool.execute('select password from user where `user_id` = ?', [`${request.body.username}`]);
	console.log(rows);
	if (rows.length <= 0) {
		response.status(401);
		response.json({ message: `Cannot find user id ${request.body.username}`, status: 401 });
		return;
	} else {
		pwd = rows[0].password;
		console.log(rows[0].password);
		console.log('pwd check', bcrypt.compareSync(request.body.password, pwd));
		response.status(200);
		response.json({ message: `login success`, status: 200 });
		return;
	}
});

app.post('/api/share', upload.single('imageFile'), (req, resp) => {
	console.info('>>> req.body: ', req.body);
	console.info('>>> req.file: ', req.file);

	resp.on('finish', () => {
		// delete the temp file
		fs.unlink(req.file.path, () => { });
	})

	const doc = mkTemperature(req.body, req.file.filename)

	readFile(req.file.path)
		.then(buff => 
			putObject(req.file, buff, s3)
		)
		.then(() => 
			mongoClient.db(MONGO_DB).collection(MONGO_COLLECTION)
				.insertOne(doc)
		)
		.then(results => {
			console.info('insert results: ', results)
			resp.status(200)
			resp.json({ id: results.ops[0]._id })
		})
		.catch(error => {
			console.error('insert error: ', error)
			resp.status(500)
			resp.json({ error })
		})

	resp.type('application/json')
	mongoClient.db(MONGO_DB).collection(MONGO_COLLECTION)
		.insertOne(doc)
		.then(result => {
			console.info('insert result: ', result)
			resp.status(200)
			resp.json({})
		})
		.catch(error => {
			console.error('insert error: ', error)
			resp.status(500)
			resp.json({ error })
		})
})

const p0 = (async () => {
	const conn = await pool.getConnection()
	await conn.ping();
	conn.release();
	return true;
})();

const p1 = (async () => {
	await client.connect();
	return true;
})();

const p2 = new Promise(
	(resolve, reject) => {
		if ((!!process.env.ACCESS_KEY) && (!!process.env.SECRET_ACCESS_KEY))
			resolve()
		else
			reject('S3 keys not found')
	}
)

Promise.all([p0, p1, p2])
	.then((r) => {
		app.listen(PORT, () => {
			console.info(`Application started on port ${PORT} at ${new Date()}`);
		});
	});