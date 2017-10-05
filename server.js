const app = require('express')();
const xRay = require('x-ray');
const fetch = require('node-fetch');

const port = process.env.PORT || 8080

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

const x = xRay({
  filters: {
    trim: function (value) {
      return typeof value === 'string' ? value.trim() : value
    },
    reverse: function (value) {
      return typeof value === 'string' ? value.split('').reverse().join('') : value
    },
    slice: function (value, start , end) {
      return typeof value === 'string' ? value.slice(start, end) : value
    }
  }
});

app.get('/midi', (req, res)=> {
  res.header("Content-Type", "application/json; charset=utf-8");
  fetch('http://apis.is/concerts', {method: 'GET'})
    .then(res => {
        return res.json();
    }).then(json => {
        res.send(json);
    });
})

app.get('/tix', (req, res)=> {
  res.header("Content-Type", "application/json; charset=utf-8");
  const stream = x('https://www.tix.is/is/search/c/2/', '.events li', [{
    titill: '.info h1',
    location: '.info h2',
    date: '.info h3',
    linkInfo: '.more a@href', 
    linkBuy: '.more li:nth-child(2) a@href',
    image: '.image@data-image'
  }]).stream();
  stream.pipe(res);
})

console.log('server started on port ' + port)
app.listen(port);