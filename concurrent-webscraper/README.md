Here we have the code that creates a web scraping application that can be dockerized and deployed onto a k8s cluster. It reads a list of addresses, scrapes the relevant info and appends it to a json.

The heart of the code is the web scraper which is written in node.js and uses puppeteer to get the relevant info for a given address. The result is a json file with the address and data on the Zuschläge.

The final json file(s) is/are read into a python script, reformatted and aggregated.
