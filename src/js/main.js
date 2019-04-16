var season = 0;
var max_lines = 5;
var max_local_calls = 8;
var data = null;
var local_calls = 0;

function quotesAPI(callback) {
  local_calls = 0;
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

  switch (season) {
    case 3:
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
      break;
  }
}

function showLoader() {
  var loader = document.getElementById('loader');
  loader.classList.remove('hide');
}

function removeLoader() {
  var loader = document.getElementById('loader');
  loader.classList.add('hide');
}

function parseQuote(response) {
  var obj = JSON.parse(response);
  var episode_number = Math.round(Math.random() * 17) % obj.data.length;
  var episode_name = obj.data[episode_number].name;
  var quote_number = Math.round(Math.random() * 17) % obj.data[episode_number].quotes.length;

  displayQuote(obj.data[episode_number].quotes[quote_number], episode_number + 1, episode_name);
  removeLoader();
}

function refreshQuote() {
  clearScreen();
  showLoader();
  
  if (data && local_calls < max_local_calls) { 
    parseQuote(data);
    local_calls++;
  } else { 
    quotesAPI(parseQuote); 
  }
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
  var audio_control = document.getElementsByClassName('audio-controls')[0];
  var audio = document.getElementById('background-audio');

  audio.play().then(() => { console.log("Autoplaying Music"); })
  .catch((err) => {
    console.log(err.message);
  });

  audio_control.addEventListener('click',  () => {
    if (!audio_control.firstElementChild.classList.contains('fa-undo')) {
      document.getElementById('background-audio').muted = !document.getElementById('background-audio').muted;
    }

    if (audio_control.firstElementChild.classList.contains('fa-volume-up')) {
      audio_control.firstElementChild.classList = 'fas fa-volume-off';
    } else if (audio_control.firstElementChild.classList.contains('fa-volume-off')) {
      audio_control.firstElementChild.classList = 'fas fa-volume-up';
    } else if (audio_control.firstElementChild.classList.contains('fa-undo')) {
      audio_control.firstElementChild.classList = 'fas fa-volume-up';
      audio.play();
    }
  });

  var x = setInterval(() => {
    var audio_control = document.getElementsByClassName('audio-controls')[0];
    var audio = document.getElementById('background-audio');
    console.log("Audio is paused: " + audio.paused);
    if (audio.paused) {
      audio_control.firstElementChild.classList = 'fas fa-undo';
      // clearInterval(x);
    }
  }, 1000);

  quotesAPI(parseQuote);
});