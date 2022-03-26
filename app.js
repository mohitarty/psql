const express = require("express");
const app = express();
const path = require("path");
const db = require("./models/index.js");
const port = process.env.PORT || 3000;
const bodyParser = require("body-parser");
const urlShortener = require("node-url-shortener");
const { engine } = require("express-handlebars");

app.engine(
	"hbs",
	engine({
		extname: ".hbs",
		defaultLayout: "main",
		runtimeOptions: {
			allowProtoPropertiesByDefault: true,
			allowProtoMethodsByDefault: true,
		},
	})
);
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));

app.get("/", function (req, res) {
	db.Url.findAll({ order: [["createdAt", "DESC"]], limit: 5 }).then(
		(urlObjs) => {
			res.render("index", {
				urlObjs: urlObjs,
			});
		}
	);
});

app.post("/url", function (req, res) {
	const url = req.body.url;

	urlShortener.short(url, function (err, shortUrl) {
		db.Url.findOrCreate({ where: { url: url, shortUrl: shortUrl } }).then(
			([urlObj, created]) => {
				res.send(shortUrl);
			}
		);
	});
});

app.listen(port, () => console.log(`url-shortener listening on port ${port}!`));
