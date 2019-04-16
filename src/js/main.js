var season = 0;
var max_lines = 5;
var data = null;

function quotesAPI(callback) {
  season = (Math.round((Math.random() * 17)) % 10) + 1

  let xobj = new XMLHttpRequest();
  xobj.overrideMimeType('application/json');
  xobj.open('GET', 'https://the-office-api.herokuapp.com/season/' + season + '/format/quotes', true);
  xobj.onreadystatechange = () => {
    console.log(xobj.status);
    if (xobj.readyState == 4 && xobj.status == '200') {
      data = xobj.responseText;
      callback(xobj.responseText);
    } else if (xobj.status != '200') {
      backup(callback);
    }
  }
  xobj.send(null);
}

function backup(callback) {
  season = 3;

  let xobj = new XMLHttpRequest();
  xobj.overrideMimeType('application/json');
  xobj.open('GET', '/src/data/backup_s3.json', true);
  xobj.onreadystatechange = () => {
    if (xobj.readyState == 4 && xobj.status == '200') {
      data = xobj.responseText;
      callback(xobj.responseText);
    }
  }
  xobj.send(null);
}

function parseQuote(response) {
  var obj = JSON.parse(response);
  var episode_number = Math.round(Math.random() * 17) % obj.data.length;
  var episode_name = obj.data[episode_number].name;
  var quote_number = Math.round(Math.random() * 17) % obj.data[episode_number].quotes.length;

  displayQuote(obj.data[episode_number].quotes[quote_number], episode_number + 1, episode_name);
}

function refreshQuote() {
  clearScreen();
  data ? parseQuote(data) : quotesAPI(parseQuote);
}

function clearScreen() {
  var episode_details_div = document.getElementById('episode_details');
  var quotes_div = document.getElementById('quotes');

  episode_details_div.innerHTML = '';
  quotes_div.innerHTML = '';
}

function displayQuote(quotes, e_num, e_name) {
  var episode_details_div = document.getElementById('episode_details');
  var quotes_div = document.getElementById('quotes');

  var title = document.createElement('h1');
  title.innerHTML = 'Episode: ' + e_name;

  var number = document.createElement('h3');
  number.innerHTML = 'S:' + season + ' ' + 'E:' + e_num;

  episode_details_div.appendChild(title);
  episode_details_div.appendChild(number);

  console.log(quotes);

  for (var i = 0; i < quotes.length && i < 5; i++) {
    var quote = quotes[i];
    var quote_p = document.createElement('p');

    var k = quote.search(':');
    var character = quote.slice(0, k);
    quote_p.innerHTML = '<span class="font-weight-bold">' + character + ':</span>' + ' ' + quote.slice(k + 1);
    quotes_div.appendChild(quote_p);
  }
}

window.addEventListener('load', () => {
  quotesAPI(parseQuote);
});