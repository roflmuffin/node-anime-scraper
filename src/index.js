const got = require('got');
const KissHTTP = require('../libs/http');

const BASE_URL = 'https://ww1.gogoanime.io/';

const k = new KissHTTP()

k.request(BASE_URL).then(resp => console.log(resp))
