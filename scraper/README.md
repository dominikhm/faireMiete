Here we have the code that solves the task of scraping the Lagezuschlag site and aggregating the information in the specified way. 

The web scraper is written in node.js and uses puppeteer to create a get the relevant info for a given address. The result is a json file with the address and data on the Zuschläge since the 90s. The json file is read into a python script, reformatted and aggregated. 

The scripts don't have to be run manually - there is a shell script that automatizes the task.
