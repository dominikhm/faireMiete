# faireMiete

This repo contains code for different projects in the context of consulting at faireMiete. There is one folder that contains code which creates an interactive map of a city including interesting real estate specific metrics. 

There is another folder that contains code for a web scraper which can be dockerized and deployed to kubernetes, for example. Written in node.js it uses Puppeteer to scrape the Lagezuschlag info of wien.gv.at based on a list of addresses. Included is the full implementation of server side, client side k8s side.

The API folder contains code that creates an API for querying addresses for their Lagezuschlag info of wien.gv.at. The result is saved in a JSON.
