/*
* spa.util_b.js
* Javascript browser UTILITY
*/

/*jslint         browser : true, continue : true,
  devel  : true, indent  : 2,    maxerr   : 50,
  newcap : true, nomen   : true, plusplus : true,
  regexp : true, sloppy  : true, vars     : false,
  white  : true
*/

/* global $,spa,getComputedStyle */

spa.util_b = (function() {
  'use strict';
  //--------------- BEGIN MODULE SCOPE VARIABLES ---------------

  var
    configMap = {
      regex_encode_html: /[&"'><]/g,
      regex_encode_noamp: /["'><]/g,
      html_encode_map: {
        '&': '&#38;',
        '"': '&#34;',
        "'": '&#39;',
        '>': '&#62;',
        '<': '&#60;'
      }
    },
    decodeHtml, encodeHtml, getEmSize;

  configMap.encode_noamp_map = $.extend(
    {}, configMap.html_encode_map
  );
  delete configMap.encode_noamp_map['&'];

//---------------- END MODULE SCOPE VARIABLES ----------------


//------------------ BEGIN UTILITY METHODS -------------------
// Begin Utility /name/
// End Utility /name/

// Begin Utility /decodeHtml/
// Encoding HTML entity so that it can be conpatible with browsers
  decodeHtml = function(str) {
    return $('<div/>').html(str || '').text();
  };
// End Utility /decodeHtml/

// Begin Utility /encodeHtml/
// This is the only path encoder that is for html entities
// This method translates the designated length of string
  encodeHtml = function(input_arg_str, exclude_map) {
    var
      input_str = String(input_arg_str),
      regex, lookup_map;

    if (exclude_map) {
      lookup_map = configMap.encode_noamp_map;
      regex = configMap.regex_encode_noamp;
    }
    else {
      lookup_map = configMap.html_encode_map;
      regex = configMap.regex_encode_html;
    }
    return input_str.replace(regex,
      function(match, name) {
        return lookup_map[match] || '';
      }
    );
  };
// End Utility /encodeHtml/

// Begin Utility /getEmSize/
// convert em size into pixel and return it
  getEmSize = function(elem) {
    return Number(
      getComputedStyle(elem, '').fontSize.match(/\d*\.?\d*/)[0]
    );
  };
// End Utility /getEmSize/
//------------------- END UTILITY METHODS --------------------


//------------------- BEGIN PUBLIC METHODS -------------------
// Begin Public method /name/
// End Public method /name/

// exporting methods
  return {
    decodeHtml: decodeHtml,
    encodeHtml: encodeHtml,
    getEmSize: getEmSize
  };

//-------------------- END PUBLIC METHODS --------------------

}());
