const chalk = require("chalk");
const error = chalk.bold.red;
const success = chalk.keyword("green");
const scraperObject = {
  url: 'https://mein.wien.gv.at/Meine-Amtswege/richtwert?subpage=/lagezuschlag/',
  async scraper(browser, address){
    try{
      let page = await browser.newPage();
      let dataObj = {};
      console.log(success(`Navigating to ${this.url}...`));
      await page.goto(this.url);
      // continue without newsletter
      await page.click('#dss-modal-firstvisit-form > button.btn.btn-block.btn-light');
      // let everything load
      await page.waitFor(5000)
      console.log(success('waiting for iframe with form to be ready.'));
      //wait until selector is available
      await page.waitForSelector('iframe');
      console.log(success('iframe is ready. Loading iframe content'));
      //choose the relevant iframe
      const elementHandle = await page.$(
        'iframe[src="/richtwertfrontend/lagezuschlag/"]',
      );
      //go into frame in order to input info
      const frame = await elementHandle.contentFrame();
      //enter address
      console.log(success('filling form in iframe'));
      await frame.type('#input_adresse', address, { delay: 1000 });

      //choose first option from dropdown
      console.log(success('Choosing from dropdown'));
      await frame.click('#react-autowhatever-1--item-0');

      console.log(success('pressing button'));
      //press button to search
      await frame.click('#next-button');

      // scraping data
      console.log(success('scraping...'));
      const res = await frame.$$eval('#summary', (options) => {
          const result = options.map(option => option.value);
          return result;
            });

      dataObj['Adresse'] = res;
      // dataObj['Zuschlag_ab_0419'] = await frame.evaluate(() => document.querySelector('#summary > div:nth-child(3) > div:nth-child(2) > div:nth-child(3) > div:nth-child(3)').innerText);
      // dataObj['Zuschlag_bis_0319'] = await frame.evaluate(() => document.querySelector('#summary > div:nth-child(3) > div:nth-child(2) > div:nth-child(4) > div:nth-child(3)').innerText);

      return dataObj;
    } catch (err) {
      console.log(error(err));
      await browser.close();
      console.log(error("Browser Closed"));
    }
  }
}

module.exports = scraperObject;
