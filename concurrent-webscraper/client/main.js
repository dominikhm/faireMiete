let axios = require('axios')
let ldb = require('./lowdbHelper.js').LowDbHelper
let ldbHelper = new ldb()
let allAddresses = ldbHelper.getData()
const fs = require('fs');
const csv = require('csv-parser');


let fname = 'Altbau_new.csv';
let server = "http://104.155.44.223"
let podsWorkDone = []
let addressesDetails = []
let errors = []

function main() {

  // getAddresses()
  getDetails()

}

function getAddresses(){
  const csvPipe = fs.createReadStream(fname).pipe(csv());
  csvPipe.on('data', async (row) => {
    allAddresses.push(row.Adresse);
  })
  .on('end', async () => {
    ldbHelper.saveData(allAddresses)
  });
}

function chunkArray(myArray, chunk_size){
    var index = 0;
    var arrayLength = myArray.length;
    var tempArray = [];

    for (index = 0; index < arrayLength; index += chunk_size) {
        myChunk = myArray.slice(index, index+chunk_size);
        // Do something if you want with the group
        tempArray.push(myChunk);
    }

    return tempArray;
}

async function getDetails(){
  let begin = Date.now()

  allAddresses = allAddresses.slice(52390)
  var result = chunkArray(allAddresses, 400);

  for (let j = 0; j < result.length; j++) {
    for (var i = 0; i < result[j].length; i++) {
        try {
          let data = {
          url: 'https://mein.wien.gv.at/Meine-Amtswege/richtwert?subpage=/lagezuschlag/',
          addr: result[j][i],
          commands: [{description: 'scrape', type: 'scrape'}]
          }

          await sendRequest(data, function (result) {
            parseResult(result, begin)
          })
        } catch (e) {
          console.log(result[j][i], "failed in scraping");
          continue
        }
      }

    }
}

async function sendRequest(payload, cb) {
  let address = payload
  try {
    await axios.post(`${server}/api/addresses`, address).then(response => {
      if (Object.keys(response.data).includes('error')) {
        let res = {
          address: address.addr,
          error: response.data.error
        }
        cb(res)
      } else {
        cb(response.data)
      }
    })
  } catch (error) {
    console.log(error)
    let res = {
      address: address.addr,
      error: error
    }
    cb({ res })
  }
}

function parseResult(result, begin){
  try {
    let end = Date.now()
    let timeSpent = (end - begin) / 1000 + "secs ";
    if (!Object.keys(result).includes("error")) {
      let wasSuccessful = Object.keys(result.zuschlag).length > 0 ? true : false
      if (wasSuccessful) {
        let podID = result.hostname
        let podsIDs = podsWorkDone.length > 0 ? podsWorkDone.map(pod => { return Object.keys(pod)[0]}) : []
        if (!podsIDs.includes(podID)) {
          let podWork = {}
          podWork[podID] = 1
          podsWorkDone.push(podWork)
        } else {
          for (let pwd = 0; pwd < podsWorkDone.length; pwd++) {
            if (Object.keys(podsWorkDone[pwd]).includes(podID)) {
              podsWorkDone[pwd][podID] += 1
              break
            }
          }
        }
        addressesDetails.push(result)
      } else {
        errors.push(result)
      }
    } else {
      errors.push(result)
    }
    console.log('podsWorkDone', podsWorkDone, ', retrieved ' + addressesDetails.length + " addresses, ",
      "took " + timeSpent + ", ", "used " + podsWorkDone.length + " pods,", " errors: " + errors.length)
    ldbHelper.saveData(addressesDetails)
  } catch (error) {
    console.log(error)
  }
}

main()
