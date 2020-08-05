var http = require('http');
var url = require('url');

const actions = ["stay", "move", "eat", "load", "unload"]
const directions = ["up", "down", "right", "left"]

http.createServer(function (req, res) {
	res.writeHead(200, {
		'Content-Type': 'application/json'
	});
	if (req.method === 'POST') {
		let body = '';
		req.on('data', chunk => {
			body += chunk.toString();
		});
		req.on('end', () => {

			let request = JSON.parse(body)
			let response = {
				"orders": []
			}

			const mapWidth = request.canvas.width
			const mapHeight = request.canvas.height
			const antsCounts = request.ants.length
			const cells = request.canvas.cells
			const ants = request.ants
			const maxAntPayload = 9

			// find food on map
			// TODO: implement it
			const foodCoords = []
			let hiveCoords
			for (let x = 0; x <= cells.length - 1; x++) {
				for (let y = 0; y <= cells[x].length - 1; y++) {
					if (cells[x][y].food > 0) foodCoords.push([x, y])
					if (cells[x][y].hive) hiveCoords = [x, y]
				}
			}

			for (let ant in ants) {
				let action, direction
				const antX = ant.point.x
				const antY = ant.point.y
				const isAntFull = ant.payload === maxAntPayload
				if (ant.health === 1 && ant.payload > 0) {
					action = 'eat'
					direction = 'right'
				} if (isAntFull && antX < hiveCoords[0]) {
					action = 'move'
					direction = 'right'
				} if (isAntFull && antX > hiveCoords[0]) {
					action = 'move'
					direction = 'left'
				} if (isAntFull && antY < hiveCoords[1]) {
					action = 'move'
					direction = 'down'
				} if (isAntFull && antY > hiveCoords[1]) {
					action = 'move'
					direction = 'up'
				} if (isAntFull && antX === hiveCoords[1]) {
					action = 'upload'
					direction = 'up'
				} if (!isAntFull && cells[antX + 1][antY].food > 0) {
					action = 'load'
					direction = 'right'
				} if (!isAntFull && cells[antX - 1][antY].food > 0) {
					action = 'load'
					direction = 'left'
				} if (!isAntFull && cells[antX][antY + 1].food > 0) {
					action = 'load'
					direction = 'up'
				} if (!isAntFull && cells[antX][antY - 1].food > 0) {
					action = 'load'
					direction = 'down'
				} if (antX + 1 >= mapWidth) {
					action = 'move'
					direction = 'up'
				} if (antX - 1 <= 0) {
					action = 'move'
					direction = 'down'
				} if (antY + 1 >= mapHeight) {
					action = 'move'
					direction = 'left'
				} if (antY - 1 <= 0) {
					action = 'move'
					direction = 'right'
				}
				const order = {
					"antId": ant.id,
					"act": action,
					"dir": direction
				}
				response.orders.push(order)
			}
			res.end(JSON.stringify(response));

			console.log(JSON.stringify(response))
			// {"orders": [
			//	 {"antId":1,"act":"move","dir":"down"},
			//	 {"antId":17,"act":"load","dir":"up"}
			//	]}
		});
	} else {
		res.end("only POST allowed");
	}
}).listen(7070);