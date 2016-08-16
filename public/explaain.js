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
  var version = "1.2.9";
  
  var apiServer= "http://api.dev.explaain.com";
  if (window.location.hostname && window.location.hostname != "localhost")
    apiServer = "http://api.explaain.com";

  var baseUrl = "";
  if (window.location.hostname && window.location.hostname != "localhost")
    baseUrl = "http://use.explaain.com/"

  var cssUrl = baseUrl+"iframe/stylesheet.css?v="+version;
  var jQueryUrl = baseUrl+"iframe/jquery-3.1.0.min.js?v="+version;
  var markdownParserUrl = baseUrl+"iframe/marked.min.js?v="+version;
  var iframeJsUrl = baseUrl+"iframe/javascript.js?v="+version;

  /**
   * Run on page load
   */
  onPageReady(function() {
    linkExplaainKeywords();
    addExplaainStyles();

    var elements = document.getElementsByClassName("explaain");
    for (var i=0; i < elements.length; i++) {
      var element = elements[i];
      var css = {
        height: element.getAttribute("data-height") || "100%",
        width: element.getAttribute("data-width") || "100%"
      }
      if (element.getAttribute("data-id")) {
        insertIframe(element, element.getAttribute("data-id"), css);
      } else if (element.getAttribute("data-keywords")) {
        // @TODO Search cards other than Headline cards?
        // (Still need to add new API endpoint that searches across all cards)
        insertIframe(element, apiServer+"/Headline/search/?q="+encodeURIComponent(element.getAttribute("data-keywords")), css);
      } else {
        // Assume <p> tags, insert links to cards
      }
    }
  });

  /**
   * Insert iframe into target
   */
  function insertIframe(target, url, css) {
    var iframeId = getRandomInt(100000, 999999)

    var iframe = document.createElement('iframe');
    iframe.id = "iframe-"+iframeId;
    iframe.style.display = "block";
    iframe.style.overflow = "hidden";
    iframe.scrolling = "no";
    iframe.style.border = "none";
    iframe.frameBorder = "0";
    var cssParams = Object.keys(css);
    for (var i=0; i < cssParams.length; i++) {
      iframe.style[cssParams[i]] = css[cssParams[i]]
    }
    target.appendChild(iframe);

    ajax(url, function(err, response) {
      if (err || !response || response.length == 0)
        return;

      var iframeContents = iframe.contentWindow.document;
      iframeContents.open();
      iframeContents.write('<html id="iframe-'+iframeId+'">');
      iframeContents.write('<link href="'+cssUrl+'" rel="stylesheet" type="text/css"/>');
      iframeContents.write('<link href="https://fonts.googleapis.com/css?family=Lato:400,700,900" rel="stylesheet" type="text/css"/>');
      iframeContents.write('<script src="'+jQueryUrl+'"></script>');
      iframeContents.write('<script src="'+markdownParserUrl+'"></script>');
      iframeContents.write('<div id="jsonData" style="display: none;">'+response+'</div>');
      iframeContents.write('<script src="'+iframeJsUrl+'"></script>');
      iframeContents.close();
    });
  }

  this.resizeIframe = function(iframeId, height, width) {
    // Assuming horizontal layout for now and only adjusting height
    document.getElementById(iframeId).style.height  = height+'px';
    document.getElementById(iframeId).style.width  = '100%';
  }

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
    if (!textColumns)
      return;
    textColumns[0].innerHTML = textColumns[0].innerHTML.replace("Donald Trump", '<a href="#donald-trump" class="explaain-link">Donald Trump</a>');
  }

  String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
  };

  return this;
});