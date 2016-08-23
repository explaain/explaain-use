/**
 * This Javascript is automatically included in iframes created by explaain.js
 * @version 1.1
 */

// Parse response into JSON object object
var cards = $.parseJSON( document.getElementById("jsonData").innerText );

// If it's not an array, just make it an array of one object
if (!$.isArray(cards))
  cards = [cards];

var html = '<div class="cards">';
for (var i=0; i < cards.length; i++) {
  html += getCardHtml(cards[i]);
}
html += '</div>';

$('body').append(html);

// Tell the page to resize the iframe after content has loaded into it
window.parent.explaain.resizeIframe($('html').attr('id'), $('body').outerHeight(), $('body').outerWidth());

// Tell the page to resize the iframe if the page has been reized
$(window.parent).resize(function() {
  window.parent.explaain.resizeIframe($('html').attr('id'), $('body').outerHeight(), $('body').outerWidth());
});

$("body").on("click touch", "a", function(e) {
  e.preventDefault();
  /*
  // Load card in iframe
  $.ajax({
    url: e.target.href
  })
  .done(function(entity) {
    $('.cards').html('');
    $('.cards').append( getCardHtml(entity) );
    window.parent.explaain.resizeIframe($('html').attr('id'), $('body').outerHeight(), $('body').outerWidth());
  });
  */
  // Tell parent page to load card in overlay
  window.parent.explaain.showOverlay(e.target.href);
  return false;
});


function getCardHtml(card) {
  return '<div class="card slick-slide slick-current slick-center"'
        +' data-uri="'+card['@id']+'"'
        +' role="option" aria-describedby="slick-slide00">'
        +'   <div class="card-visible">'
        +'     <i class="fa fa-times close" aria-hidden="true"></i><h2>'+card['name']+'</h2>'
        +'     <div class="body-content">'
        +'       '+marked(card['description'])
        +'       </p>'
        +'   </div>'
        +'  </div>'
        +'</div>';
}




//TEMPORARY!

window.addEventListener('message', function(event) {
   switch (event.data.action) {
      case "open": //Does exactly the same as 'preview' but the card id variable is called 'key' not 'id'
        console.log('open!!!');
        // closeAllLayers();
        // openLayer(0, [event.data.key], 0, 0);
        break;
      }
 }, false);
