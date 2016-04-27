function base64_decode(data) {
                    //  discuss at: http://phpjs.org/functions/base64_decode/
                    // original by: Tyler Akins (http://rumkin.com)
                    // improved by: Thunder.m
                    // improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
                    // improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
                    //    input by: Aman Gupta
                    //    input by: Brett Zamir (http://brett-zamir.me)
                    // bugfixed by: Onno Marsman
                    // bugfixed by: Pellentesque Malesuada
                    // bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
                    //   example 1: base64_decode('S2V2aW4gdmFuIFpvbm5ldmVsZA==');
                    //   returns 1: 'Kevin van Zonneveld'
                    //   example 2: base64_decode('YQ===');
                    //   returns 2: 'a'

                    var b64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
                    var o1, o2, o3, h1, h2, h3, h4, bits, i = 0,
                            ac = 0,
                            dec = '',
                            tmp_arr = [];
                    if (!data) {
                        return data;
                    }

                    data += '';
                    do { // unpack four hexets into three octets using index points in b64
                        h1 = b64.indexOf(data.charAt(i++));
                        h2 = b64.indexOf(data.charAt(i++));
                        h3 = b64.indexOf(data.charAt(i++));
                        h4 = b64.indexOf(data.charAt(i++));
                        bits = h1 << 18 | h2 << 12 | h3 << 6 | h4;
                        o1 = bits >> 16 & 0xff;
                        o2 = bits >> 8 & 0xff;
                        o3 = bits & 0xff;
                        if (h3 == 64) {
                            tmp_arr[ac++] = String.fromCharCode(o1);
                        } else if (h4 == 64) {
                            tmp_arr[ac++] = String.fromCharCode(o1, o2);
                        } else {
                            tmp_arr[ac++] = String.fromCharCode(o1, o2, o3);
                        }
                    } while (i < data.length);
                    dec = tmp_arr.join('');
                    return dec.replace(/\0+$/, '');
                }
                function base64_encode(data) {
                    //  discuss at: http://phpjs.org/functions/base64_encode/
                    // original by: Tyler Akins (http://rumkin.com)
                    // improved by: Bayron Guevara
                    // improved by: Thunder.m
                    // improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
                    // improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
                    // improved by: Rafał Kukawski (http://kukawski.pl)
                    // bugfixed by: Pellentesque Malesuada
                    //   example 1: base64_encode('Kevin van Zonneveld');
                    //   returns 1: 'S2V2aW4gdmFuIFpvbm5ldmVsZA=='
                    //   example 2: base64_encode('a');
                    //   returns 2: 'YQ=='

                    var b64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
                    var o1, o2, o3, h1, h2, h3, h4, bits, i = 0,
                            ac = 0,
                            enc = '',
                            tmp_arr = [];
                    if (!data) {
                        return data;
                    }

                    do { // pack three octets into four hexets
                        o1 = data.charCodeAt(i++);
                        o2 = data.charCodeAt(i++);
                        o3 = data.charCodeAt(i++);
                        bits = o1 << 16 | o2 << 8 | o3;
                        h1 = bits >> 18 & 0x3f;
                        h2 = bits >> 12 & 0x3f;
                        h3 = bits >> 6 & 0x3f;
                        h4 = bits & 0x3f;
                        // use hexets to index into b64, and append result to encoded string
                        tmp_arr[ac++] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4);
                    } while (i < data.length);
                    enc = tmp_arr.join('');
                    var r = data.length % 3;
                    return (r ? enc.slice(0, r - 3) : enc) + '==='.slice(r || 3);
                }

                function serialize(mixed_value) {
                    //  discuss at: http://phpjs.org/functions/serialize/
                    // original by: Arpad Ray (mailto:arpad@php.net)
                    // improved by: Dino
                    // improved by: Le Torbi (http://www.letorbi.de/)
                    // improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net/)
                    // bugfixed by: Andrej Pavlovic
                    // bugfixed by: Garagoth
                    // bugfixed by: Russell Walker (http://www.nbill.co.uk/)
                    // bugfixed by: Jamie Beck (http://www.terabit.ca/)
                    // bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net/)
                    // bugfixed by: Ben (http://benblume.co.uk/)
                    //    input by: DtTvB (http://dt.in.th/2008-09-16.string-length-in-bytes.html)
                    //    input by: Martin (http://www.erlenwiese.de/)
                    //        note: We feel the main purpose of this function should be to ease the transport of data between php & js
                    //        note: Aiming for PHP-compatibility, we have to translate objects to arrays
                    //   example 1: serialize(['Kevin', 'van', 'Zonneveld']);
                    //   returns 1: 'a:3:{i:0;s:5:"Kevin";i:1;s:3:"van";i:2;s:9:"Zonneveld";}'
                    //   example 2: serialize({firstName: 'Kevin', midName: 'van', surName: 'Zonneveld'});
                    //   returns 2: 'a:3:{s:9:"firstName";s:5:"Kevin";s:7:"midName";s:3:"van";s:7:"surName";s:9:"Zonneveld";}'

                    var val, key, okey,
                            ktype = '',
                            vals = '',
                            count = 0,
                            _utf8Size = function(str) {
                                var size = 0,
                                        i = 0,
                                        l = str.length,
                                        code = '';
                                for (i = 0; i < l; i++) {
                                    code = str.charCodeAt(i);
                                    if (code < 0x0080) {
                                        size += 1;
                                    } else if (code < 0x0800) {
                                        size += 2;
                                    } else {
                                        size += 3;
                                    }
                                }
                                return size;
                            };
                    _getType = function(inp) {
                        var match, key, cons, types, type = typeof inp;
                        if (type === 'object' && !inp) {
                            return 'null';
                        }
                        if (type === 'object') {
                            if (!inp.constructor) {
                                return 'object';
                            }
                            cons = inp.constructor.toString();
                            match = cons.match(/(\w+)\(/);
                            if (match) {
                                cons = match[1].toLowerCase();
                            }
                            types = ['boolean', 'number', 'string', 'array'];
                            for (key in types) {
                                if (cons == types[key]) {
                                    type = types[key];
                                    break;
                                }
                            }
                        }
                        return type;
                    };
                    type = _getType(mixed_value);
                    switch (type) {
                        case 'function':
                            val = '';
                            break;
                        case 'boolean':
                            val = 'b:' + (mixed_value ? '1' : '0');
                            break;
                        case 'number':
                            val = (Math.round(mixed_value) == mixed_value ? 'i' : 'd') + ':' + mixed_value;
                            break;
                        case 'string':
                            val = 's:' + _utf8Size(mixed_value) + ':"' + mixed_value + '"';
                            break;
                        case 'array':
                        case 'object':
                            val = 'a';
                            /*
                             if (type === 'object') {
                             var objname = mixed_value.constructor.toString().match(/(\w+)\(\)/);
                             if (objname == undefined) {
                             return;
                             }
                             objname[1] = this.serialize(objname[1]);
                             val = 'O' + objname[1].substring(1, objname[1].length - 1);
                             }
                             */

                            for (key in mixed_value) {
                                if (mixed_value.hasOwnProperty(key)) {
                                    ktype = _getType(mixed_value[key]);
                                    if (ktype === 'function') {
                                        continue;
                                    }

                                    okey = (key.match(/^[0-9]+$/) ? parseInt(key, 10) : key);
                                    vals += this.serialize(okey) + this.serialize(mixed_value[key]);
                                    count++;
                                }
                            }
                            val += ':' + count + ':{' + vals + '}';
                            break;
                        case 'undefined':
                            // Fall-through
                        default:
                            // if the JS object has a property which contains a null value, the string cannot be unserialized by PHP
                            val = 'N';
                            break;
                    }
                    if (type !== 'object' && type !== 'array') {
                        val += ';';
                    }
                    return val;
                }
                function unserialize(data) {
                    //  discuss at: http://phpjs.org/functions/unserialize/
                    // original by: Arpad Ray (mailto:arpad@php.net)
                    // improved by: Pedro Tainha (http://www.pedrotainha.com)
                    // improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
                    // improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
                    // improved by: Chris
                    // improved by: James
                    // improved by: Le Torbi
                    // improved by: Eli Skeggs
                    // bugfixed by: dptr1988
                    // bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
                    // bugfixed by: Brett Zamir (http://brett-zamir.me)
                    //  revised by: d3x
                    //    input by: Brett Zamir (http://brett-zamir.me)
                    //    input by: Martin (http://www.erlenwiese.de/)
                    //    input by: kilops
                    //    input by: Jaroslaw Czarniak
                    //        note: We feel the main purpose of this function should be to ease the transport of data between php & js
                    //        note: Aiming for PHP-compatibility, we have to translate objects to arrays
                    //   example 1: unserialize('a:3:{i:0;s:5:"Kevin";i:1;s:3:"van";i:2;s:9:"Zonneveld";}');
                    //   returns 1: ['Kevin', 'van', 'Zonneveld']
                    //   example 2: unserialize('a:3:{s:9:"firstName";s:5:"Kevin";s:7:"midName";s:3:"van";s:7:"surName";s:9:"Zonneveld";}');
                    //   returns 2: {firstName: 'Kevin', midName: 'van', surName: 'Zonneveld'}

                    var that = this,
                            utf8Overhead = function(chr) {
                                // http://phpjs.org/functions/unserialize:571#comment_95906
                                var code = chr.charCodeAt(0);
                                if (code < 0x0080) {
                                    return 0;
                                }
                                if (code < 0x0800) {
                                    return 1;
                                }
                                return 2;
                            };
                    error = function(type, msg, filename, line) {
                        throw new that.window[type](msg, filename, line);
                    };
                    read_until = function(data, offset, stopchr) {
                        var i = 2,
                                buf = [],
                                chr = data.slice(offset, offset + 1);
                        while (chr != stopchr) {
                            if ((i + offset) > data.length) {
                                error('Error', 'Invalid');
                            }
                            buf.push(chr);
                            chr = data.slice(offset + (i - 1), offset + i);
                            i += 1;
                        }
                        return [buf.length, buf.join('')];
                    };
                    read_chrs = function(data, offset, length) {
                        var i, chr, buf;
                        buf = [];
                        for (i = 0; i < length; i++) {
                            chr = data.slice(offset + (i - 1), offset + i);
                            buf.push(chr);
                            length -= utf8Overhead(chr);
                        }
                        return [buf.length, buf.join('')];
                    };
                    _unserialize = function(data, offset) {
                        var dtype, dataoffset, keyandchrs, keys, contig,
                                length, array, readdata, readData, ccount,
                                stringlength, i, key, kprops, kchrs, vprops,
                                vchrs, value, chrs = 0,
                                typeconvert = function(x) {
                                    return x;
                                };
                        if (!offset) {
                            offset = 0;
                        }
                        dtype = (data.slice(offset, offset + 1))
                                .toLowerCase();
                        dataoffset = offset + 2;
                        switch (dtype) {
                            case 'i':
                                typeconvert = function(x) {
                                    return parseInt(x, 10);
                                };
                                readData = read_until(data, dataoffset, ';');
                                chrs = readData[0];
                                readdata = readData[1];
                                dataoffset += chrs + 1;
                                break;
                            case 'b':
                                typeconvert = function(x) {
                                    return parseInt(x, 10) !== 0;
                                };
                                readData = read_until(data, dataoffset, ';');
                                chrs = readData[0];
                                readdata = readData[1];
                                dataoffset += chrs + 1;
                                break;
                            case 'd':
                                typeconvert = function(x) {
                                    return parseFloat(x);
                                };
                                readData = read_until(data, dataoffset, ';');
                                chrs = readData[0];
                                readdata = readData[1];
                                dataoffset += chrs + 1;
                                break;
                            case 'n':
                                readdata = null;
                                break;
                            case 's':
                                ccount = read_until(data, dataoffset, ':');
                                chrs = ccount[0];
                                stringlength = ccount[1];
                                dataoffset += chrs + 2;
                                readData = read_chrs(data, dataoffset + 1, parseInt(stringlength, 10));
                                chrs = readData[0];
                                readdata = readData[1];
                                dataoffset += chrs + 2;
                                if (chrs != parseInt(stringlength, 10) && chrs != readdata.length) {
                                    error('SyntaxError', 'String length mismatch');
                                }
                                break;
                            case 'a':
                                readdata = {};
                                keyandchrs = read_until(data, dataoffset, ':');
                                chrs = keyandchrs[0];
                                keys = keyandchrs[1];
                                dataoffset += chrs + 2;
                                length = parseInt(keys, 10);
                                contig = true;
                                for (i = 0; i < length; i++) {
                                    kprops = _unserialize(data, dataoffset);
                                    kchrs = kprops[1];
                                    key = kprops[2];
                                    dataoffset += kchrs;
                                    vprops = _unserialize(data, dataoffset);
                                    vchrs = vprops[1];
                                    value = vprops[2];
                                    dataoffset += vchrs;
                                    if (key !== i)
                                        contig = false;
                                    readdata[key] = value;
                                }

                                if (contig) {
                                    array = new Array(length);
                                    for (i = 0; i < length; i++)
                                        array[i] = readdata[i];
                                    readdata = array;
                                }

                                dataoffset += 1;
                                break;
                            default:
                                error('SyntaxError', 'Unknown / Unhandled data type(s): ' + dtype);
                                break;
                        }
                        return [dtype, dataoffset - offset, typeconvert(readdata)];
                    };
                    return _unserialize((data + ''), 0)[2];
                }
                
                function utf8_encode(argString) {
  //  discuss at: http://phpjs.org/functions/utf8_encode/
  // original by: Webtoolkit.info (http://www.webtoolkit.info/)
  // improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // improved by: sowberry
  // improved by: Jack
  // improved by: Yves Sucaet
  // improved by: kirilloid
  // bugfixed by: Onno Marsman
  // bugfixed by: Onno Marsman
  // bugfixed by: Ulrich
  // bugfixed by: Rafal Kukawski
  // bugfixed by: kirilloid
  //   example 1: utf8_encode('Kevin van Zonneveld');
  //   returns 1: 'Kevin van Zonneveld'

  if (argString === null || typeof argString === 'undefined') {
    return '';
  }

  var string = (argString + ''); // .replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  var utftext = '',
    start, end, stringl = 0;

  start = end = 0;
  stringl = string.length;
  for (var n = 0; n < stringl; n++) {
    var c1 = string.charCodeAt(n);
    var enc = null;

    if (c1 < 128) {
      end++;
    } else if (c1 > 127 && c1 < 2048) {
      enc = String.fromCharCode(
        (c1 >> 6) | 192, (c1 & 63) | 128
      );
    } else if ((c1 & 0xF800) != 0xD800) {
      enc = String.fromCharCode(
        (c1 >> 12) | 224, ((c1 >> 6) & 63) | 128, (c1 & 63) | 128
      );
    } else { // surrogate pairs
      if ((c1 & 0xFC00) != 0xD800) {
        throw new RangeError('Unmatched trail surrogate at ' + n);
      }
      var c2 = string.charCodeAt(++n);
      if ((c2 & 0xFC00) != 0xDC00) {
        throw new RangeError('Unmatched lead surrogate at ' + (n - 1));
      }
      c1 = ((c1 & 0x3FF) << 10) + (c2 & 0x3FF) + 0x10000;
      enc = String.fromCharCode(
        (c1 >> 18) | 240, ((c1 >> 12) & 63) | 128, ((c1 >> 6) & 63) | 128, (c1 & 63) | 128
      );
    }
    if (enc !== null) {
      if (end > start) {
        utftext += string.slice(start, end);
      }
      utftext += enc;
      start = end = n + 1;
    }
  }

  if (end > start) {
    utftext += string.slice(start, stringl);
  }

  return utftext;
}

