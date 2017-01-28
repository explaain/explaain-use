/**
 * Include a reference to this script to embed Explaain cards on your site.
 *
 * This script is cross browser and has no dependancies.
 *
 * @version 1.2
 */
var explaain = new (function() {

  // We are using a version variable for cache busting
  // (as there is no build/deploy step yet)
  var version = "1.3.0";

  var apiServer = "http://api.explaain.com";
  var appServer = "http://app.explaain.com";
  // var appServer = "http://localhost:5000";

  var baseUrl = "";
  if (window.location.hostname && window.location.hostname != "localhost")
    baseUrl = "http://use.explaain.com/"

  var cssUrl = baseUrl+"iframe/stylesheet.css?v="+version;
  var jQueryUrl = baseUrl+"iframe/jquery-3.1.0.min.js?v="+version;
  var markdownParserUrl = baseUrl+"iframe/marked.min.js?v="+version;
  var iframeJsUrl = baseUrl+"iframe/javascript.js?v="+version;

  var overlayUrl = appServer+'/?embed=true&embedType=overlay&frameId=explaain-overlay'

  var overlayShowing = false;


  function getOverlayShowing() {
    return overlayShowing;
  }

  /**
   * Run on page load
   */
  onPageReady(function() {
    // linkExplaainKeywords();
    addExplaainStyles();

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
    iframe.style.opacity = "0";
    iframe.style.pointerEvents = "none";
    // iframe.style.visibility = "hidden";
    iframe.style.background = "rgba(0,0,0,0.5)";
    iframe.style.transition = "opacity 0.5s";
    document.body.appendChild(iframe);
  });

  /**
   * Intercept clicks and check if they are to explaain cards
   */
  if (document.addEventListener) {
      document.addEventListener('click', clickEvent);
      document.addEventListener('touchstart', clickEvent);
  } else if (document.attachEvent) {
      document.attachEvent('onclick', clickEvent);
  }

  RegExp.escape = function(str) {
      return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
  };

  function clickEvent(e) {
    var target = e.target || e.srcElement;
    if (target.tagName === 'A' || target.parentNode.tagName === 'A') {
      var href = target.getAttribute('href') || target.parentNode.getAttribute('href');
      var regEx = new RegExp('^'+RegExp.escape(apiServer));
      var regExApp = new RegExp('^'+RegExp.escape(appServer)); //This is to allow people to link to app.explaain.com/cardID as well as api.expl.....
      if (regEx.test(href) === true || regExApp.test(href) === true || href.search('localhost:5000') > -1) {
        e.preventDefault();
        href = href.replace('app.explaain.com','api.explaain.com');
        href = href.replace('app.dev.explaain.com','api.dev.explaain.com');
        href = href.replace('localhost:5000','api.explaain.com');
        showOverlay(href);
        // Return false to prevent a touch event from also trigging a click
        return false;
      } else {
          if (overlayShowing) {
            hideOverlay();
          }
      }
    } else {
        if (overlayShowing) {
          hideOverlay();
        }
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
    iframe.src = appServer + '/?' + type + 'Url=' + url + '&embed=true&embedLinkRoute=true&frameId=' + iframe.id;
    var cssParams = Object.keys(css);
    for (var i=0; i < cssParams.length; i++) {
      iframe.style[cssParams[i]] = css[cssParams[i]]
    }
    target.appendChild(iframe);

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
    console.log('overlayShowing:' + overlayShowing);
  };

  // Note: As we cannot detect clicks inside an iframe, this must be called
  // from INSIDE the iframe as 'window.parent.explaain.hideOverlay()'
  function hideOverlay() {
    document.getElementById("explaain-overlay").style.opacity = "0";
    document.getElementById("explaain-overlay").style.pointerEvents = "none";
    // document.getElementById("explaain-overlay").style.visibility = "hidden";

    document.getElementsByTagName("body")[0].style.overflow = "scroll";
    overlayShowing = false;
    console.log('overlayShowing:' + overlayShowing);
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
    var myExplaainStyles = 'a.explaain-link { padding: 0 3px; background: #ebebeb; border: 1px solid #ebebeb; text-decoration: none; color: #333; }';
    myExplaainStyles = myExplaainStyles + ' a.explaain-link:hover { color: white; background: #ff6e73; border: 1px solid #ff6e73; }';
    var myExplaainStyleTag = document.createElement('style');
    myExplaainStyleTag = document.getElementsByTagName('head')[0].appendChild(myExplaainStyleTag);
    myExplaainStyleTag.innerHTML = myExplaainStyles;
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

  this.getOverlayShowing = getOverlayShowing;
  this.showOverlay = showOverlay;
  this.hideOverlay = hideOverlay;
  this.resizeIframe = resizeIframe;


  return this;
});







window.addEventListener('message', function(event) {
  if (event.data.action == "explaain-resize") {
    document.getElementById(event.data.frameId).style.height = event.data.height+'px';
    document.getElementById(event.data.frameId).style.width  = '100%';
  }
  if (event.data.action == "explaain-open") {
    explaain.showOverlay(event.data.url);
  }
  if (event.data.action == "explaain-hide-overlay") {
    explaain.hideOverlay();
  }
}, false);
