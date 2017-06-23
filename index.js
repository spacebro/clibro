#!/usr/bin/env node
'use strict'

const config = require('standard-settings').getSettings().service.spacebro

const vorpal = require('./src/initVorpal')
const spacebro = require('./src/initSpacebro')

spacebro.init(config, vorpal)
  .then(() => {
    vorpal.show()
  })
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
