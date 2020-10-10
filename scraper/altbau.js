const puppeteer = require("puppeteer");
const chalk = require("chalk");
const fs = require('fs');
const error = chalk.bold.red;
const success = chalk.keyword("green");

const url = 'https://www.wien.gv.at/kulturportal/public/searching/search.aspx';

async function getSelectOptions(page, selector) {
  const options = await page.evaluate(optionSelector => {
    return Array.from(document.querySelectorAll(optionSelector))
    .filter(o => o.value > 0)
    .map(o => {
      return {
        name: o.text,
        value: o.value
      };
    });
  }, selector);

  return options;
}


async function getDistricts(page) {
  return await getSelectOptions(page, '#gocEingabe_bezirk > option');
}

async function gotoNextPage(page, pageno) {
  let noMorePages = true;
  let nextPageXp = '//*[@id="inventarisiertegebaeude_grpGrid_groupUNavigate_cmdUDataNext"]';
  let lastPageXp ='//*[@id="inventarisiertegebaeude_grpGrid_groupUNavigate_cmdUDataLast"]';
  let nextPage;
  let lastPage;

  nextPage = await page.$x(nextPageXp)
  lastPage = await page.$x(lastPageXp)

  if (nextPage.length > 0) {
    console.log(`Going to page ${pageno}`);

    await nextPage[0].click();

    noMorePages = false;
  } else if(lastPage.length > 0){
    console.log(`Going to last page ${pageno}`);

    await lastPage[0].click();

    noMorePages = false;
  }

  return noMorePages;
}

async function scrapeDistrictTable(page) {
  await page.waitForSelector('#inventarisiertegebaeude_grpGrid_gdResult > tbody');
  const data = await page.evaluate(() => {
    const ths = Array.from(document.querySelectorAll('th:nth-child(3), th:nth-child(4), th:nth-child(5)'));
    const trs = Array.from(document.querySelectorAll('tr'));

    const headers = ths.map(th => th.innerText);

    let results = [];

    console.log(`${trs.length} rows in table!`);

    trs.forEach(tr => {
      let r = {};
      let tds = Array.from(tr.querySelectorAll('td:nth-child(3), td:nth-child(4), td:nth-child(5)')).map(td => td.innerText);

      headers.forEach((k,i) => r[k] = tds[i]);
      results.push(r);
    });

    return results;
  });

  console.log(`Got ${data.length} records`);
  return data;
}

async function gotoFirstPage(page) {

  let firstPageLinkXp = `//*[@id="gob1_zurueck_input"]`;
  let firstPage;

  firstPage = await page.$x(firstPageLinkXp);

  if (firstPage.length > 0) {
    await firstPage[0].click();
  }

}

async function scrapeAllPages(page) {
  let results = [];
  let pageno = 2;

  while (true) {
    console.log(`Scraping page ${pageno - 1}`);

    results = results.concat(
      await scrapeDistrictTable(page)
    );

    const noMorePages = await gotoNextPage(page, pageno++)
    if (noMorePages) {
      break;
    }
  }

  await gotoFirstPage(page);

  return results;
}

async function main() {
  console.log(success('opening browser'))
  const browser = await puppeteer.launch();
  // open a new page
  console.log(success('opening page'))
  const page = await browser.newPage();

  console.log(success('going to page'))
  await page.goto(url, { 'waitUntil' : 'networkidle2' });

  console.log(success('choosing gebaeudedatenbank'));
  await page.select('#gocEingabe_layer', '7');

  let districts = await getDistricts(page);

  let dataObj = {};
  for (const [ i, district ] of districts.entries()) {
    console.log(success(`[${i+1}/${districts.length}] Scraping data for ${district.name}`));

    try {
      await page.waitForSelector('#gocEingabe_bezirk');
      await page.select('#gocEingabe_bezirk', district.value);

      await page.waitForSelector('#gocEingabe_suche');
      await page.click('#gocEingabe_suche');

      let data = await scrapeAllPages(page);

      console.log(success(`Got ${data.length} records for district ${district.name}`));
      // console.log(JSON.stringify(data, null, 2));

      dataObj[district.name] = data;
    } catch (e) {
      console.log(success(`Got up to ${district.name} before time out. Everything up until that district will be saved`));
      break

    }
  }
  await browser.close();


  fs.writeFile("data.json", JSON.stringify(dataObj), 'utf8', function(err) {
    if(err) {
      return console.log(error(err));
    }
    console.log(success("The data has been scraped and saved successfully! View it at './data.json'"));
  });
}

main();
