const puppeteer = require('puppeteer');
const chalk = require("chalk");

const error = chalk.bold.red;
const success = chalk.keyword("green");

async function startBrowser(){
    let browser;
    try {
        console.log(success("Opening the browser......"));
        browser = await puppeteer.launch({
            headless: true,
            args: ["--disable-setuid-sandbox"],
            'ignoreHTTPSErrors': true
        });
    } catch (err) {
        console.log(error("Could not create a browser instance => : ", err));
    }
    return browser;
}

module.exports = {
    startBrowser
};
