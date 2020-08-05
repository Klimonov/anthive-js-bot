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
			let foodCoords = []
			let hiveCoords
			for (let y = 0; y <= cells.length - 1; y++) {
				for (let x = 0; x <= cells[y].length - 1; x++) {
					if (cells[y][x].food > 0) foodCoords.push([x, y])
					if (cells[y][x].hive) hiveCoords = [x, y]
				}
			}

			foodCoords = foodCoords.sort()

			for (let ant in ants) {
				let action, direction
				const antX = ants[ant].point.x
				const antY = ants[ant].point.y
				const isAntFull = ants[ant].payload === maxAntPayload

				const actionAnt = () => {
					if (ants[ant].health === 1 && ants[ant].payload > 0) {
						action = 'eat'
						direction = 'right'
						return
					}
					if (!foodCoords.length) {
						action = 'stay'
						direction = 'right'
						return
					}

					if (antX + 1 === hiveCoords[0] && antY === hiveCoords[1] && ants[ant].payload > 0) {
						action = 'upload'
						direction = 'right'
						return
					}
					if (antX - 1 === hiveCoords[0] && antY === hiveCoords[1] && ants[ant].payload > 0) {
						action = 'upload'
						direction = 'left'
						return
					}
					if (antY + 1 === hiveCoords[1] && antX === hiveCoords[0] && ants[ant].payload > 0) {
						action = 'upload'
						direction = 'down'
						return
					}
					if (antY - 1 === hiveCoords[1] && antX === hiveCoords[0] && ants[ant].payload > 0) {
						action = 'upload'
						direction = 'up'
						return
					}

					if (!isAntFull) {
						for (let coords in foodCoords) {
							if (antX + 1 === foodCoords[coords][0] && antY === foodCoords[coords][1]) {
								action = 'load'
								direction = 'right'
								return
							}
							if (antX - 1 === foodCoords[coords][0] && antY === foodCoords[coords][1]) {
								action = 'load'
								direction = 'left'
								return
							}
							if (antY + 1 === foodCoords[coords][1] && antX === foodCoords[coords][0]) {
								action = 'load'
								direction = 'down'
								return
							}
							if (antY - 1 === foodCoords[coords][1] && antX === foodCoords[coords][0]) {
								action = 'load'
								direction = 'up'
								return
							}
							if (antX < foodCoords[coords][0]) {
								action = 'move'
								direction = 'right'
								return
							}
							if (antX > foodCoords[coords][0]) {
								action = 'move'
								direction = 'left'
								return
							}
							if (antY < foodCoords[coords][1]) {
								action = 'move'
								direction = 'down'
								return
							}
							if (antY > foodCoords[coords][1]) {
								action = 'move'
								direction = 'up'
								return
							}
						}
					}
					
					if(isAntFull) {
						if (antX + 1 < hiveCoords[0] || (antX + 1 === hiveCoords[0] && (antY + 1 === hiveCoords[1] || antY - 1 == hiveCoords[1]))) {
							action = 'move'
							direction = 'right'
							return
						}
						if (antX - 1 > hiveCoords[0] || (antX - 1 === hiveCoords[0] && (antY + 1 === hiveCoords[1] || antY - 1 == hiveCoords[1]))) {
							action = 'move'
							direction = 'left'
							return
						}
						if (antY + 1 < hiveCoords[1]) {
							action = 'move'
							direction = 'down'
							return
						}
						if (antY - 1 > hiveCoords[1]) {
							action = 'move'
							direction = 'up'
							return
						}
					}
				
				}
				actionAnt()

				const order = {
					"antId": ants[ant].id,
					"act": action,
					"dir": direction
				}
				console.log(order, 'order')
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