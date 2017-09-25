'use strict'

let express = require('express');
var HolidayAPI = require('node-holidayapi');
//API TEST KEY - only dummy holidays data is received
var api = new HolidayAPI('064704d8-7c3e-49b4-93e1-a2443029fa3a').v1;
var app = express();

app.use(express.static(__dirname + "/public"));
// app.set('view engine', 'html');

// GET route to query holidays by country
app.get('/getHolidays/:countryCode/:year', function(req, res, next) {
	const countryCode = req.params.countryCode;
	const year = req.params.year;
	let apiParams = { country: countryCode, year: 2017, pretty: true};
	if(!countryCode || !year) res.status(500).send({error: "empty / null API parameters", data: "error"});

	api.holidays(apiParams, function (err, data) {
		if(err) {
			console.error(err);
			return next(err); 
		}
		switch (data.status) {
			case 200 : 
				res.json(data);
				break;
			case 400 :
				res.status(400).send({error: "invalid api call", data: data});
				break;
			case 429 :
				res.status(429).send({error: "API Rate Limit Exceeded", data: data});
				break;
		}
	});
});

//express error handling
app.use(function (err, req, res, next) {
	res.status(err.status || 500);
	console.error(err.stack)
	res.send({error : err});
});

app.listen(process.env.PORT || 3000, function(){
  console.log("CalendarApp listening on port %d in %s mode", this.address().port, app.settings.env);
});