const puppeteer = require("puppeteer");
const chalk = require("chalk");
const fs = require('fs');
const error = chalk.bold.red;
const success = chalk.keyword("green");


async function searchZuschlag(address) {
  try {

      var dataObj = {};

    // open the headless browser
      var browser = await puppeteer.launch();

    // open a new page
      var page = await browser.newPage();

    // enter url in page
      await page.goto(`https://mein.wien.gv.at/Meine-Amtswege/richtwert?subpage=/lagezuschlag/`, {waitUntil: 'networkidle2'});

      // continue without newsletter
      await page.click('#dss-modal-firstvisit-form > button.btn.btn-block.btn-light');
      // let everyhting load
      await page.waitFor(1000)
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
      await frame.waitForSelector('#input_adresse');
      await frame.type('#input_adresse', address, { delay: 200});

      //choose first option from dropdown
      console.log('Choosing from dropdown');
      await frame.waitFor(1000);
      await frame.waitForSelector('#react-autowhatever-1--item-0');
      await frame.click('#react-autowhatever-1--item-0');

      console.log('pressing button');
      //press button to search
      await frame.click('#next-button');

      // scraping data
      console.log('scraping')

      const adr = await frame.$eval('#summary > div:nth-child(2) > div:nth-child(2) > div > div.px-2.py-3.d-none.d-md-block', result => result.innerText);

      await frame.waitForSelector('#summary > div:nth-child(3) > div:nth-child(2) > div:nth-child(2)');
      const head = await frame.evaluate(() => {
        const rows = [...document.querySelectorAll('#summary > div:nth-child(3) > div:nth-child(2) > div:nth-child(2)')];
        const cells = rows.map(
          row => [...row.querySelectorAll('div')]
          .map(cell => cell.innerText)
        );
        return cells;
      });

      await frame.waitForSelector('#summary > div:nth-child(3) > div:nth-child(2) > div:nth-child(3)');
      const present = await frame.evaluate(() => {
        const rows = [...document.querySelectorAll('#summary > div:nth-child(3) > div:nth-child(2) > div:nth-child(3)')];
        const cells = rows.map(
          row => [...row.querySelectorAll('div')]
          .map(cell => cell.innerText)
        );
        return cells;
      });

      await frame.waitForSelector('#summary > div:nth-child(3) > div:nth-child(2) > div:nth-child(4)');
      const past = await frame.evaluate(() => {
        const rows = [...document.querySelectorAll('#summary > div:nth-child(3) > div:nth-child(2) > div:nth-child(4)')];
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

      var res = [present[0], past[0]];
      dataObj[adr] = [];
      dataObj[adr] = mapFields(head[0],res);
      return dataObj;

    } catch (err) {
      // Catch and display errors
      console.log(error(err));
      await browser.close();
      console.log(error("Browser Closed"));
    }


  };

  module.exports.searchZuschlag = searchZuschlag;
