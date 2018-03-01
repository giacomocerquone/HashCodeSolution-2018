const fs = require('fs');

let in_file = fs.readFileSync(process.argv[2], 'utf8');
let single_rows = in_file.split('\n'),
    first_line = single_rows[0],
    first_line_el = single_rows[0].split(' '),
    R = first_line_el[0],
    C = first_line_el[1],
    F = first_line_el[2],
    N = first_line_el[3],
    B = first_line_el[4],
    T = first_line_el[5]

let ridesObj = []
let carsObj = []

single_rows.shift()
console.log(single_rows);
single_rows.splice(-1, 1)
console.log(single_rows);

single_rows.forEach((ride, index) => {
  ride = ride.split(' ')
  ridesObj.push({
    id: index,
    start: [ride[0], ride[1]],
    finish: [ride[2], ride[3]],
    minStart: ride[4],
    maxFinish: ride[5],
    car: false
  })
})

for(let i = 0; i < F; i++) {
  carsObj.push({
    id: i,
    currCell: [0, 0],
    ride: false,
    hasPassenger: false,
    ridesDone: []
  })
}


function moveCar(car, destination) {
  deltaR = destination[0] - car.currCell[0]
  deltaC = destination[1] - car.currCell[1]
  // Move one step on Rows axis if possible, otherwise on Colums axis
  if(deltaR > 0)
    car.currCell[0] = car.currCell[0] + 1
  else if(deltaR < 0)
    car.currCell[0] = car.currCell[0] - 1
  else if(deltaC > 0)
    car.currCell[1] = car.currCell[1] + 1
  else if(deltaC < 0)
    car.currCell[1] = car.currCell[1] - 1
}

function distance_Car_Ride(car, ride) {
  deltaR = Math.abs(car.currCell[0] - ride.start[0])
  deltaC = Math.abs(car.currCell[1] - ride.start[1])

  return deltaR + deltaC
}


for(let step = 1; step <= T; step++) {

  ridesObj.forEach( ride => {
    // If current ride has to start and no car is assigned
    // (ride.car is true if ride is finished!)
    if(ride.minStart <= step && ride.car == false) {
      let bestDistance = 100000001
      let bestCar = null

      carsObj.forEach( car => {
        // If current car is not in any ride
        if(car.ride == false) {
          let currDistance = Math.abs(distance_Car_Ride(car, ride) - (ride.minStart - step))
          if(currDistance < bestDistance) {
            bestDistance = currDistance
            bestCar = car
          }
        }
      })

      if(bestCar != null) {
        bestCar.ride = ride.id
        ride.car = bestCar.id
        if(bestCar.currCell[0] == ridesObj[bestCar.ride].start[0] && bestCar.currCell[1] == ridesObj[bestCar.ride].start[1])
          bestCar.hasPassenger = true
      }

    }
  })

  carsObj.forEach(car => {
    if(car.ride != false) {
      if (!car.hasPassenger) {
        moveCar(car, ridesObj[car.ride].start)
        if(car.currCell[0] == ridesObj[car.ride].start[0] && car.currCell[1] == ridesObj[car.ride].start[1]) {
          car.hasPassenger = true
        }
      } else if (car.hasPassenger) {
        moveCar(car, ridesObj[car.ride].finish)
        // Se è arrivato
        if(car.currCell[0] == ridesObj[car.ride].finish[0] && car.currCell[1] == ridesObj[car.ride].finish[1]) {
          ridesObj[car.ride].car = true
          car.ridesDone.push(ridesObj[car.ride].id)
          car.ride = false
          car.hasPassenger = false
        }

      }
    }
  })



}


let toWrite = '';
carsObj.forEach(car => {
  toWrite += car.ridesDone.length
  car.ridesDone.forEach(rideID => {
    toWrite += ' ' + rideID
  })
  toWrite += '\n'
})

console.log(ridesObj)
console.log(carsObj)

fs.writeFileSync(process.argv[3], toWrite);
