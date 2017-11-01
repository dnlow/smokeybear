function init() {
	updateSmokey();
}

function low() {
	document.getElementById("smokey").setAttribute('src', './img/low.png');
}

function moderate() {
	document.getElementById("smokey").setAttribute('src', './img/moderate.png');
}

function high() {
	document.getElementById("smokey").setAttribute('src', './img/high.png');
}

function veryhigh() {
	document.getElementById("smokey").setAttribute('src', './img/veryhigh.png');
}

function extreme() {
	document.getElementById("smokey").setAttribute('src', './img/extreme.png');
}

// Changes XML to JSON
function xmlToJson(xml) {

	// Create the return object
	var obj = {};

	if (xml.nodeType == 1) { // element
		// do attributes
		if (xml.attributes.length > 0) {
			obj["@attributes"] = {};
			for (var j = 0; j < xml.attributes.length; j++) {
				var attribute = xml.attributes.item(j);
				obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
			}
		}
	} else if (xml.nodeType == 3) { // text
		obj = xml.nodeValue;
	}

	// do children
	// If just one text node inside
	if (xml.hasChildNodes() && xml.childNodes.length === 1 && xml.childNodes[0].nodeType === 3) {
		obj = xml.childNodes[0].nodeValue;
	}
	else if (xml.hasChildNodes()) {
		for (var i = 0; i < xml.childNodes.length; i++) {
			var item = xml.childNodes.item(i);
			var nodeName = item.nodeName;
			if (typeof (obj[nodeName]) == "undefined") {
				obj[nodeName] = xmlToJson(item);
			} else {
				if (typeof (obj[nodeName].push) == "undefined") {
					var old = obj[nodeName];
					obj[nodeName] = [];
					obj[nodeName].push(old);
				}
				obj[nodeName].push(xmlToJson(item));
			}
		}
	}
	return obj;
}

function getTimestamps() {
	$.get('xml/timestamps', function (data) {
		var stamps = data.split('\n');

		/* Current time, in seconds */
		var now = Math.floor((new Date).getTime() / 1000);
		console.log(now);

		/* Timestamps are in seconds, so get time in hours */
		var units = "";
		var hours = ((now - stamps[i]) / 3600);

		console.log(hours);
		if (hours < 1) {
			hours *= 60;
			units = " minute";
		}
		else {
			units = " hour";
		}
		hours = Math.floor(hours);
		if (hours > 1) { //plurality
			units += "s";
		}

		document.getElementById("status").innerHtml = "Last updated " + hours + units + " ago";
	});
}

function getICIndex(ic) {
	if (ic >= 0 && ic <= 20) {
		return 0;
	}
	else if (ic >= 21 && ic <= 45) {
		return 1;
	}
	else if (ic >= 46 && ic <= 65) {
		return 2;
	}
	else if (ic >= 66 && ic <= 80) {
		return 3;
	}
	else {
		return 4;
	}
}

function calc_rating(sl, ic, id) {
	var rating_matrix = [
		['L', 'L', 'L', 'M', 'M'],
		['L', 'M', 'M', 'M', 'H'],
		['M', 'M', 'H', 'H', 'V'],
		['M', 'H', 'V', 'V', 'E'],
		['H', 'V', 'V', 'E', 'E']];

	var ic_result = getICIndex(ic);
	var rating_result = rating_matrix[sl - 1][ic_result];

	console.log("RATING BELOW for " + id + " based on sl=" + sl + " and ic=" + ic + ": ");
	console.log(rating_result);

	switch (rating_result) {
		case 'L':
			low();
			break;
		case 'M':
			moderate();
			break;
		case 'H':
			high();
			break;
		case 'V':
			veryhigh();
			break;
		case 'E':
			extreme();
			break;
		default:
			console.log("Something went wrong\n");
			break;
	}
	console.log("Finished calcing rating.\n");
}

function updateSmokey() {
	var selection = document.getElementById("zone_selection");
	var selected_area = document.getElementById("selected_area");
	var selected_city = document.getElementById("selected_city");
	var value = selection.options[selection.selectedIndex].value;
	var data = '/xml/arroyogrande.xml';

	switch (value) {
		case "AG":
			data = '/xml/arroyogrande.xml';
			selected_area.innerHTML = 'Coastal Valley';
			selected_city.innerHTML = 'Arroyo Grande';
			break;
		case "LP":
			data = '/xml/lapanza.xml';
			selected_area.innerHTML = 'Inland Valley';
			selected_city.innerHTML = 'La Panza';
			break;
		case "LT":
			data = '/xml/lastablas.xml';
			selected_area.innerHTML = 'Coast Range';
			selected_city.innerHTML = 'Las Tablas';
			break;
		case "SLC":
			data = '/xml/sansimeon.xml';
			selected_area.innerHTML = 'San Luis Coast';
			selected_city.innerHTML = 'San Simeon';
			break;
		default:
			console.log("Something went wrong updating smokey.\n");
	}
	getStatus(data, value, selected_city.innerHTML);
	getTimestamps();
}

function getStatus(data, station, city) {
	var serializer = new XMLSerializer();
	var serializedXML = serializer.serializeToString(data);
	var xml = new DOMParser().parseFromString(serializedXML, 'text/xml');
	var jsonified = xmlToJson(xml);

	console.log("GOT JSON! FOR " + city);
	console.log(data);
	console.log(jsonified);
	console.log(jsonified.hasOwnProperty("nfdrs"));
	if (jsonified.hasOwnProperty("nfdrs") && jsonified.nfdrs.hasOwnProperty("row")) {
		console.log("row exists");
		for (var i = 0; i < jsonified.nfdrs.row.length; i++) {
			var curEntry = jsonified.nfdrs.row[i];
			if (curEntry.nfdr_type['#text'] == "O" && curEntry.msgc['#text'] == "7G2A2") {
				calc_rating(curEntry.sl['#text'], curEntry.ic['#text'], station);
				console.log("Smokey's Adjective Fire Danger Rating for " + city + " is up to date.");
				break;
			}
		}
		if (i == jsonified.nfdrs.row.length) {
			console.log("The Adjective Fire Danger Rating for " + city + " has not yet been updated today.");
			document.getElementById("status").innerHtml = "*This station's rating is not up to date";
		}
	}
	else {
		console.log("The Adjective Fire Danger Rating for " + city + " has not yet been updated today.");
		document.getElementById("status").innerHtml = "*This station's rating is not up to date";
	}
	console.log("Got " + city + " Fire Rating");
}
