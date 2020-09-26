const chalk = require("chalk");
const pageScraper = require('./pageScraper');
const fs = require('fs');
const error = chalk.bold.red;
const success = chalk.keyword("green");

async function scrapeAll(browserInstance){
    let browser;
    let address;
    try{
        address = 'Schaumburgergasse 16, 1040 Wien';
        browser = await browserInstance;
        let scrapedData = {};
        scrapedData['Objekt'] = await pageScraper.scraper(browser, address);

        await browser.close();
        fs.writeFile("data.json", JSON.stringify(scrapedData), 'utf8', function(err) {
            if(err) {
                return console.log(error(err));
            }
            console.log(success("The data has been scraped and saved successfully! View it at './data.json'"));
        });

    }
    catch(err){
        console.log(error("Could not resolve the browser instance => ", err));
    }
}

module.exports = (browserInstance) => scrapeAll(browserInstance)
