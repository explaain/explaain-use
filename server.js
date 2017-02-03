var express = require('express');
    partials = require('express-partials'),
    app = express();

app.set('port', (process.env.PORT || 3000));

app.use(express.static(__dirname + '/public'));

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/demo/:URL', function(request, response) {
  response.render('pages/demo', { embedURL: request.params.URL });
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
