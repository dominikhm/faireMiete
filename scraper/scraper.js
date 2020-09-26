const puppeteer = require("puppeteer");
const chalk = require("chalk");
const fs = require('fs');
const error = chalk.bold.red;
const success = chalk.keyword("green");

address = 'Gumpendorfer Straße 12, 1060 Wien';

(async () => {
  try {
    // open the headless browser
      var browser = await puppeteer.launch();

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
      await frame.type('#input_adresse', address, { delay: 100});

      //choose first option from dropdown
      console.log('Choosing from dropdown');
      await frame.click('#react-autowhatever-1--item-0');

      console.log('pressing button');
      //press button to search
      await frame.click('#next-button');

      // scraping data
            console.log('scraping')
            await frame.waitForSelector('#summary > div > div > br ~ div');
            const res = await frame.evaluate(() => {
              const rows = [...document.querySelectorAll('#summary > div > div > br ~ div')];
              const cells = rows.map(
                row => [...row.querySelectorAll('div')]
                         .map(cell => cell.innerText)
              );
              return cells;
            });

            await browser.close();
                console.log(success("Browser Closed"));
                const mapFields = (arr1, arr2) => {
                    const mappedArray = arr2.map((el) => {
                        const mappedArrayEl = {};
                        el.forEach((value, i) => {
                            if (arr1.length < (i+1)) return;
                            mappedArrayEl[arr1[i]] = value;
                        });
                        return mappedArrayEl;
                    });
                    return mappedArray;
                }
            const Arr1 = res[0];
            const Arr2 = res.slice(1,res.length+1);

            let dataObj = {};
            dataObj['lagezuschlag'] = mapFields(Arr1, Arr2);
            dataObj['adresse'] = address;

            // console.log(dataObj);

fs.writeFile("data.json", JSON.stringify(dataObj), 'utf8', function(err) {
    if(err) {
        return console.log(error(err));
    }
    console.log(success("The data has been scraped and saved successfully! View it at './data.json'"));
});


  } catch (err) {
      // Catch and display errors
      console.log(error(err));
      await browser.close();
      console.log(error("Browser Closed"));
    }


})();
