const puppeteer = require("puppeteer");
const chalk = require("chalk");

const error = chalk.bold.red;
const success = chalk.keyword("green");

(async () => {
  try {
    // open the headless browser
      var browser = await puppeteer.launch({slowMo: 250});

    // open a new page
      var page = await browser.newPage();

    // enter url in page
      await page.goto(`https://mein.wien.gv.at/Meine-Amtswege/richtwert?subpage=/lagezuschlag/`, {waitUntil: 'networkidle2'});
   // continue without newsletter
      await page.click('#dss-modal-firstvisit-form > button.btn.btn-block.btn-light');
   // let everyhting load
      await page.waitFor(5000)
      console.log('waiting for iframe with form to be ready.');
      //wait until selector is available
      await page.waitForSelector('iframe');
      console.log('iframe is ready. Loading iframe content');
      //choose the relevant iframe
      const elementHandle = await page.$(
          'iframe[src="/richtwertfrontend/lagezuschlag/"]',
      );
      //go into frame in order to input info
      const frame = await elementHandle.contentFrame();
      //enter address
      console.log('filling form in iframe');
      await frame.type('#input_adresse', 'Gumpendorfer Straße 87, 1060 Wien', { delay: 1000 });

      //choose first option from dropdown
      console.log('Choosing from dropdown');
      await frame.click('#react-autowhatever-1--item-0');

      console.log('pressing button');
      //press button to search
      await frame.click('#next-button');

      // scraping data
      console.log('scraping')
      const optionsResult = await frame.$$eval('#summary', (options) => {
          const result = options.map(option => option.textContent);
          return result;
            });

    console.log(optionsResult);

    // Say Cheese!!
    await page.screenshot({ path: "example.png" });

   await browser.close();

    console.log(success("Browser Closed"));
  } catch (err) {
      // Catch and display errors
      console.log(error(err));
      await browser.close();
      console.log(error("Browser Closed"));
    }


})();
