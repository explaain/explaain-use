/**
 * Include a reference to this script to embed Explaain cards on your site.
 *
 * This script is cross browser and has no dependancies.
 *
 * @version 1.2
 */
if (!explaain) {

  var explaain = new (function() {

    // We are using a version variable for cache busting
    // (as there is no build/deploy step yet)
    var version = "1.3.0";

    var apiServer = "http://api.explaain.com";
    var appServer = "http://app.explaain.com";

    if (window.location.protocol == 'https:') {
      apiServer = "https://explaain-api.herokuapp.com";
      appServer = "https://explaain-app.herokuapp.com";
    }

    var controlGroup = getParameterByName('explaainControlGroup') == "true" || false;

    var overlayUrl = appServer+'/?embed=true&embedType=overlay&frameId=explaain-overlay&frameParent='+encodeURIComponent(window.location.href) + '&controlGroup=' + controlGroup;
    var overlayShowing = false;


    function getOverlayShowing() {
      return overlayShowing;
    }


    //Add Airtable endpoint
    var airtableEndpoint = "https://api.airtable.com/v0/app5efC6P6l4p28AA/Links?api_key=key8n4huPijkVYD7l";


    /**
    * Run on page load
    */
    onPageReady(function() {
      if (!controlGroup) {
        // linkExplaainKeywords();
        addExplaainStyles();
        styleExplaainLinks();

        getRemoteLinks();

        var elements = document.getElementsByClassName("explaain");
        for (var i=0; i < elements.length; i++) {
          var element = elements[i];
          var css = {
            height: element.getAttribute("data-height") || "100%",
            width: element.getAttribute("data-width") || "100%"
          }
          if (element.getAttribute("data-id")) {
            insertIframe(element, 'card', element.getAttribute("data-id"), css);
          } else if (element.getAttribute("data-keywords")) {
            // @TODO Search cards other than Headline cards?
            // (Still need to add new API endpoint that searches across all cards)
            insertIframe(element, 'search', apiServer+"/Headline/search/?q="+encodeURIComponent(element.getAttribute("data-keywords")), css);
          } else {
            // Assume <p> tags, insert links to cards
          }
        }
      }

      // Add overlay iframe
      var iframe = document.createElement('iframe');
      iframe.id = "explaain-overlay";
      iframe.src = overlayUrl;
      // iframe.scrolling = "no";
      iframe.frameBorder = "0";
      iframe.style.position = "fixed";
      iframe.style.overflow = "scroll";
      iframe.style.zIndex = "100000000000000";
      iframe.style.border = "none";
      iframe.style.top = "0";
      iframe.style.left = "0";
      iframe.style.width = "100%";
      iframe.style.height = "100%";
      iframe.style.margin = "0";
      iframe.style.opacity = "0";
      iframe.style.pointerEvents = "none";
      // iframe.style.visibility = "hidden";
      iframe.style.background = "rgba(0,0,0,0.5)";
      iframe.style.transition = "opacity 0.5s";
      document.body.appendChild(iframe);
    });

    if (!controlGroup) {
      /**
      * Intercept clicks and check if they are to explaain cards
      */
      if (document.addEventListener) {
        document.addEventListener('click', clickEvent, {passive: false, capture: true});
        document.addEventListener('touchstart', clickEvent, {passive: false, capture: true});
        // document.addEventListener('mouseup', clickEvent, {passive: false, capture: true});
      } else if (document.attachEvent) {
        document.attachEvent('onclick', clickEvent);
        // document.attachEvent('mouseup', stopProp);
      }
    }

    RegExp.escape = function(str) {
      return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
    };

    function stopProp(e) {
      e.preventDefault();
      e.stopImmediatePropagation();
    }
    function clickEvent(e) {
      var target = e.target || e.srcElement;
      var explaainHref = checkExplaainLink(target);
      if (explaainHref) {
        e.preventDefault();
        e.stopImmediatePropagation();
        explaainHref = explaainHref.replace('app.explaain.com','api.explaain.com');
        explaainHref = explaainHref.replace('app.dev.explaain.com','api.dev.explaain.com');
        explaainHref = explaainHref.replace('explaain-app.herokuapp.com','explaain-api.herokuapp.com');
        explaainHref = explaainHref.replace('localhost:5000','api.explaain.com');
        showOverlay(explaainHref);
        // Return false to prevent a touch event from also trigging a click
        return false;
      } else {
        if (overlayShowing) {
          hideOverlay();
        }
      }
    }

    function checkExplaainLink(target) {
      if (target.tagName === 'A' || target.parentNode.tagName === 'A') {
        var href = target.getAttribute('href') || target.parentNode.getAttribute('href');
        var acceptableDomains = ['api.explaain.com\/.+', 'app.explaain.com\/.+', 'api.dev.explaain.com\/.+', 'app.dev.explaain.com\/.+', 'explaain-api.herokuapp.com\/.+', 'explaain-app.herokuapp.com\/.+', apiServer + '\/.+', appServer + '\/.+']
        if (new RegExp(RegExp.escape(acceptableDomains.join("|")).replace(/\\\|/g,'|').replace(/\\\.\\\+/g,'.+')).test(href)) {
          return href;
        } else {
          return false
        }
      } else {
        return false
      }
    }

    /**
    * Insert iframe into target
    */
    function insertIframe(target, type, url, css) {
      var iframeId = getRandomInt(100000, 999999)

      var iframe = document.createElement('iframe');
      iframe.id = "iframe-"+iframeId;
      iframe.style.display = "block";
      iframe.style.overflow = "hidden";
      iframe.scrolling = "no";
      iframe.style.border = "none";
      iframe.frameBorder = "0";
      iframe.src = appServer + '/?' + type + 'Url=' + url + '&embed=true&embedLinkRoute=true&frameId=' + iframe.id + '&frameParent=' + encodeURIComponent(window.location.href) + '&controlGroup=' + controlGroup;
      var cssParams = Object.keys(css);
      for (var i=0; i < cssParams.length; i++) {
        iframe.style[cssParams[i]] = css[cssParams[i]]
      }
      var iFrameElement = target.appendChild(iframe);

      //Update URL parameters in case iFrame has been cached
      iFrameElement.contentWindow.location.href = iFrameElement.src;

      // ajax(url, function(err, response) {
      //   if (err || !response || response.length == 0)
      //     return;
      //
      //   var iframeContents = iframe.contentWindow.document;
      //   iframeContents.open();
      //   iframeContents.write('<html id="iframe-'+iframeId+'">');
      //   iframeContents.write('<link href="'+cssUrl+'" rel="stylesheet" type="text/css"/>');
      //   iframeContents.write('<link href="https://fonts.googleapis.com/css?family=Lato:400,700,900" rel="stylesheet" type="text/css"/>');
      //   iframeContents.write('<script src="'+jQueryUrl+'"></script>');
      //   iframeContents.write('<script src="'+markdownParserUrl+'"></script>');
      //   iframeContents.write('<div id="jsonData" style="display: none;">'+response+'</div>');
      //   iframeContents.write('<script src="'+iframeJsUrl+'"></script>');
      //   iframeContents.close();
      // });
    }

    function resizeIframe(iframeId, height, width) {
      // Assuming horizontal layout for now and only adjusting height
      document.getElementById(iframeId).style.height  = height+'px';
      document.getElementById(iframeId).style.width  = '100%';
    }

    function showOverlay(cardId) {

      if (window.frames['explaain-overlay'].postMessage) {
        // e.g. Safari
        window.frames['explaain-overlay'].postMessage({ action: 'open', key: cardId }, "*");
      } else if (window.frames['explaain-overlay'].contentWindow.postMessage) {
        // e.g. Chrome, Firefox
        window.frames['explaain-overlay'].contentWindow.postMessage({ action: 'open', key: cardId }, "*");
      }

      // @TODO if cardId passed, pass message to iframe to load card
      // if (overlayUrl)
      //   document.getElementById("explaain-overlay").src = overlayUrl+"?card="+encodeURIComponent(cardId);
      document.getElementById("explaain-overlay").style.opacity = "1";
      document.getElementById("explaain-overlay").style.pointerEvents = "all";
      // document.getElementById("explaain-overlay").style.visibility = "visible";

      document.getElementsByTagName("body")[0].style.overflow = "hidden";
      overlayShowing = true;
    };

    // Note: As we cannot detect clicks inside an iframe, this must be called
    // from INSIDE the iframe as 'window.parent.explaain.hideOverlay()'
    function hideOverlay() {
      document.getElementById("explaain-overlay").style.opacity = "0";
      document.getElementById("explaain-overlay").style.pointerEvents = "none";
      // document.getElementById("explaain-overlay").style.visibility = "hidden";

      document.getElementsByTagName("body")[0].style.overflow = "scroll";
      overlayShowing = false;
    }

    // We can't detect clicks inside an iframe, but as long as it doesn't have
    // focus we can still detect keyboard events and hide it if ESC is pressed.
    document.onkeydown = function(evt) {
      evt = evt || window.event;
      var isEscape = false;
      if ("key" in evt) {
        isEscape = evt.key == "Escape";
      } else {
        isEscape = evt.keyCode == 27;
      }
      if (isEscape)
      hideOverlay()
    };

    /**
    * Check the page has loaded
    */
    function onPageReady(callback) {
      // If page is already loaded
      if ( document.readyState === "complete" )
      return setTimeout(callback, 1);

      if (document.addEventListener) {
        // Chrome, Firefox, Safari, Opera
        window.addEventListener("load", callback, false);
      } else if (document.attachEvent) {
        // MSIE
        window.attachEvent("onload", callback);
      }
    }

    /**
    * Polyfill for getElementsByClassName
    */
    if (!document.getElementsByClassName) {
      document.getElementsByClassName = function(classname) {
        var elArray = [];
        var tmp = document.getElementsByTagName("*");
        var regex = new RegExp("(^|\\s)" + classname + "(\\s|$)");
        for (var i = 0; i < tmp.length; i++) {
          if (regex.test(tmp[i].className)) {
            elArray.push(tmp[i]);
          }
        }
        return elArray;
      }
    }

    /**
    * Polyfill for Object.keys
    */
    if (!Object.keys) {
      Object.keys = function(obj) {
        var keys = [];
        for (var i in obj) {
          if (obj.hasOwnProperty(i)) {
            keys.push(i);
          }
        }
        return keys;
      };
    }

    /**
    * Cross browser AJAX request
    */
    function ajax(url, callback, data) {
      try {
        var request = new(this.XMLHttpRequest || ActiveXObject)('MSXML2.XMLHTTP.3.0');
        request.open(data ? 'POST' : 'GET', url, 1);
        request.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        if (data)
        request.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        request.onreadystatechange = function () {
          request.readyState > 3 && callback && callback(null, request.responseText, request);
        };
        request.send(data)
      } catch (e) {
        callback(e);
      }
    }

    function getRandomInt(min, max) {
      return Math.floor(Math.random() * (max - min + 1) + min);
    }


    // Jeremy's additions
    function addExplaainStyles() {
      var myExplaainStyles = 'a.explaain-link { padding: 0 3px !important; background: #ebebeb !important; border: 1px solid #ebebeb !important; text-decoration: none !important; color: #333 !important; box-shadow: none !important; }';
      myExplaainStyles = myExplaainStyles + ' a.explaain-link:hover { color: white !important; background: #ff6e73 !important; border: 1px solid #ff6e73 !important; box-shadow: none !important; }';
      var myExplaainStyleTag = document.createElement('style');
      myExplaainStyleTag = document.getElementsByTagName('head')[0].appendChild(myExplaainStyleTag);
      myExplaainStyleTag.innerHTML = myExplaainStyles;
    }
    function styleExplaainLinks() {
      //Adds explaain-link class to all explaain links on the page
      var pageLinks = Array.prototype.slice.call(document.getElementsByTagName('a'));
      for (var i in pageLinks) {
        if (checkExplaainLink(pageLinks[i])) {
          pageLinks[i].className += " explaain-link";
        }
      }
    }

    function getRemoteLinks() {
      var airtableListEndpoint = airtableEndpoint + '&filterByFormula=' + encodeURIComponent('{Webpage}="' + window.location.href + '"');

      var xmlhttp = new XMLHttpRequest();

      xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == XMLHttpRequest.DONE ) {
          if (xmlhttp.status == 200) {
            insertRemoteLinks(JSON.parse(xmlhttp.responseText).records);
          }
          else if (xmlhttp.status == 400) {
            console.log('There was an error 400');
          }
          else {
            console.log('something else other than 200 was returned');
          }
        }
      };


      xmlhttp.open("GET", airtableListEndpoint, true);
      xmlhttp.send();
    }

    //Explaainify bit
    explaainifyElement = function(elementQuery) {
      var element = document.querySelector(elementQuery);
      var html = element.innerHTML;
      // var whenFinished = function()
      getRemoteEntites(html, element)
      // .then(function(newHtml) {
      //   element.innerHTML = newHtml;
      // })
    }

    getRemoteEntites = function(text, element) {
      var http = new XMLHttpRequest();
      var url = "//explaain-api.herokuapp.com/explaainify";
      // var url = "//explaain-api.herokuapp.com/extract";
      var params = "html=" + encodeURIComponent(text);
      http.open("POST", url, true);

      //Send the proper header information along with the request
      http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

      http.onreadystatechange = function() {//Call a function when the state changes.
        if(http.readyState == 4 && http.status == 201) {
          element.innerHTML = decodeURIComponent(http.responseText).slice(1, -1);
        }
      }
      http.send(params);
    }

    function insertRemoteLinks(links) {
      for (i in links) {
        var element = document.querySelector(links[i].fields.Element);
        var text = links[i].fields.Text;
        var cardURL = links[i].fields.Card;
        element.innerHTML = element.innerHTML.replace(text, '<a href="' + cardURL + '">' + text + '</a>');
      }
      styleExplaainLinks();
    }

    function linkExplaainKeywords() {
      var content = document.getElementById('content');
      if (!content)
      return;
      var textColumns = content.getElementsByClassName('left-column');
      if (textColumns.length)
      textColumns[0].innerHTML = textColumns[0].innerHTML.replace("Donald Trump", '<a href="#donald-trump" class="explaain-link">Donald Trump</a>');
    }

    String.prototype.replaceAll = function(search, replacement) {
      var target = this;
      return target.replace(new RegExp(search, 'g'), replacement);
    };



    function getParameterByName(name, url) {
      if (!url) url = window.location.href;
      name = name.replace(/[\[\]]/g, "\\$&");
      var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
      results = regex.exec(url);
      if (!results) return null;
      if (!results[2]) return '';
      return decodeURIComponent(results[2].replace(/\+/g, " "));
    }


    // START QUIZ

    var QuizAnswers = {};
    var QuizScore = 0;
    var QuizAnswered = 0;
    var QuizLength = 10;

    function answerQuizQuestion(frameId, correct) {
      QuizAnswers[frameId] = { answered: true, correct: correct };
      QuizAnswered ++;
      QuizScore += correct;
      console.log(QuizAnswers);
      console.log('Score so far: ' + QuizScore + ' / ' + QuizAnswered);
      if (QuizAnswered == QuizLength) {
        console.log('Your Result: ' + QuizScore + ' / ' + QuizAnswered);
      }
    }

    // END QUIZ


    function openFromInject(key) {
      showOverlay(key);
    }


    this.getOverlayShowing = getOverlayShowing;
    this.showOverlay = showOverlay;
    this.hideOverlay = hideOverlay;
    this.resizeIframe = resizeIframe;
    this.checkExplaainLink = checkExplaainLink;
    this.answerQuizQuestion = answerQuizQuestion;
    this.openFromInject = openFromInject;
    this.getRemoteEntites = getRemoteEntites;
    this.explaainifyElement = explaainifyElement;


    return this;
  });







  window.addEventListener('message', function(event) {
    if (event.data.action == "explaain-resize") {
      if (document.getElementById(event.data.frameId)){
        document.getElementById(event.data.frameId).style.height = event.data.height+'px';
        document.getElementById(event.data.frameId).style.width  = '100%';
      }
    }
    if (event.data.action == "explaain-open") {
      explaain.showOverlay(event.data.url);
    }
    if (event.data.action == "explaain-hide-overlay") {
      explaain.hideOverlay();
    }
    if (event.data.action == "explaain-answer") {
      explaain.answerQuizQuestion(event.data.frameId, event.data.correct);
    }
  }, false);
}
