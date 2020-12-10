class PuppeteerManager {
    constructor(args) {
        this.url = args.url
        this.addr = args.addr
        this.existingCommands = args.commands
        this.allAddresses = [];
    }

async runPuppeteer() {
        const puppeteer = require('puppeteer')
        let commands = []
        // if (this.nrOfAddresses > 1) {
        //     for (let i = 0; i < this.nrOfAddresses; i++) {
        //         if (i < this.nrOfAddresses - 1) {
        //             commands.push(...this.existingCommands)
        //         } else {
        //             commands.push(this.existingCommands[0])
        //         }
        //     }
        // } else {
            commands = this.existingCommands
        // }
        console.log('commands length', commands.length)

        const browser = await puppeteer.launch({
            headless: true,
            args: [
                "--no-sandbox",
                "--disable-gpu",
            ]
        });
        let page = await browser.newPage()

        await page.setRequestInterception(true);
        page.on('request', (request) => {
            if (['image'].indexOf(request.resourceType()) !== -1) {
                request.abort();
            } else {
                request.continue();
            }
        });

        await page.on('console', msg => {
            for (let i = 0; i < msg._args.length; ++i) {
                msg._args[i].jsonValue().then(result => {
                    console.log(result);
                })
            }
        });

        await page.goto(this.url);

        // continue without newsletter
        await page.click('#dss-modal-firstvisit-form > button.btn.btn-block.btn-light');
        // let everyhting load
        await new Promise(r => setTimeout(r, 5000));
        console.log('waiting for iframe with form to be ready.');

        let timeout = 6000
        let commandIndex = 0
        while (commandIndex < commands.length) {
            try {
                console.log(`command ${(commandIndex + 1)}/${commands.length}`)
                //wait until selector is available
                await page.waitForSelector('iframe');
                console.log('iframe is ready. Loading iframe content');
                //choose the relevant iframe
                const elementHandle = await page.$(
                  'iframe[src="/richtwertfrontend/lagezuschlag/"]',
                );
                //go into frame in order to input info
                const frame = await elementHandle.contentFrame();
                await this.executeCommand(frame, this.addr, commands[commandIndex])
                await this.sleep(5000)
            } catch (error) {
                console.log(error)
                break
            }
            commandIndex++
        }
        console.log('done')
        await browser.close()
    }

    async executeCommand (frame, address, command) {
        await console.log(command.type, address)
        switch (command.type) {
            case "scrape":
            try {
              //enter address
              console.log('filling form in iframe');
              await frame.type('#input_adresse', address, { delay: 200});

              //choose first option from dropdown
              console.log('Choosing from dropdown');
              await new Promise(r => setTimeout(r, 5000));
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

              this.allAddresses.push.apply(this.allAddresses, mapFields(head[0],res));
              console.log('allAddresses length ', this.allAddresses.length)

            } catch (error) {
                console.log("error", error)
                return false
            }


        }
    }
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms))
    }
    async getAllAddresses() {
       await this.runPuppeteer()
       return this.allAddresses
   }
 }
   module.exports = { PuppeteerManager }
