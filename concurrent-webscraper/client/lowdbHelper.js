const lowdb = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('addresses.json')
const adapter1 = new FileSync('zuschlag.json')

class LowDbHelper {
    constructor() {
        this.db = lowdb(adapter);
        this.db1 = lowdb(adapter1);
    }

    getData() {
        try {
            let data = this.db.getState().addresses
            return data
        } catch (error) {
            console.log('error', error)
        }
    }

    saveData(arg) {
        try {
            this.db1.set('zuschlag', arg).write()
            //console.log('data saved successfully!!!')
        } catch (error) {
            console.log('error', error)
        }
    }

}

module.exports = { LowDbHelper }
