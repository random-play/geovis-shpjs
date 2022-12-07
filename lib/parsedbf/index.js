 
var createDecoder = require('./decoder');
function dbfHeader(data) {
  var out = {};
  out.lastUpdated = new Date(data.readUInt8(1) + 1900, data.readUInt8(2), data.readUInt8(3));
  out.records = data.readUInt32LE(4);
  out.headerLen = data.readUInt16LE(8);
  out.recLen = data.readUInt16LE(10);
  return out;
}

function dbfRowHeader(data, headerLen, decoder) {
  var out = [];
  var offset = 32;
  while (offset < headerLen) {
    out.push({
      name: decoder(data.slice(offset, offset + 11)),
      dataType: String.fromCharCode(data.readUInt8(offset + 11)),
      len: data.readUInt8(offset + 16),
      decimal: data.readUInt8(offset + 17)
    });
    if (data.readUInt8(offset + 32) === 13) {
      break;
    } else {
      offset += 32;
    }
  }
  return out;
}

function rowFuncs(buffer, offset, len, type, decoder) {
  var data = buffer.slice(offset, offset + len);
  var textData = decoder(data);
  switch (type) {
    case 'N':
    case 'F':
    case 'O':
      return parseFloat(textData, 10);
    case 'D':
      return new Date(textData.slice(0, 4), parseInt(textData.slice(4, 6), 10) - 1, textData.slice(6, 8));
    case 'L':
      return textData.toLowerCase() === 'y' || textData.toLowerCase() === 't';
    default:
      return textData;
  }
}

function parseRow(buffer, offset, rowHeaders, decoder) {
  var out = {};
  var i = 0;
  var len = rowHeaders.length;
  var field;
  var header;
  while (i < len) {
    header = rowHeaders[i];
    field = rowFuncs(buffer, offset, header.len, header.dataType, decoder);
    offset += header.len;
    if (typeof field !== 'undefined') {
      out[header.name] = field;
    }
    i++;
  }
  return out;
}

function parseDbf(buffer, encoding) {
  var decoder = createDecoder(encoding);
  var header = dbfHeader(buffer);
  var rowHeaders = dbfRowHeader(buffer, header.headerLen - 1, decoder);

  var offset = ((rowHeaders.length + 1) << 5) + 2;
  var recLen = header.recLen;
  var records = header.records;
  var out = []; 
  while (records) {
    out.push(parseRow(buffer, offset, rowHeaders, decoder));
    offset += recLen;
    records--;
  } 
  return out;
};
 
/**
 * 获取指定记录的属性数据
 * @param {*} dbfInfo 
 * @param {*} recOffset 
 * @param {*} recCount 
 * @returns 
 */
parseDbf.getPartialRows = function (dbfInfo, recOffset, recCount) {
  var offset = ((dbfInfo.rowHeaders.length + 1) << 5) + 2;
  var recLen = dbfInfo.header.recLen;
  var records = dbfInfo.header.records;
  var out = [];
  if(recCount+ recOffset > records) {
    recCount = (records - recOffset) > 0 ? (records - recOffset) : 0;
  } 
  offset += recLen * recOffset;
  while (recCount) {
    out.push(parseRow(dbfInfo.buffer, offset, dbfInfo.rowHeaders, dbfInfo.decoder));
    offset += recLen;
    recCount--;
  } 
  return out;
}

/**
 *  .dbf 文件的文件头及记录表头结构 
 * @param {*} buffer  .dbf 二进制文件流
 * @param {*} encoding 编码格式
 * @returns 
 */
parseDbf.getDbfInfo = function(buffer, encoding) {
  var decoder = createDecoder(encoding);
  var header = dbfHeader(buffer);
  var rowHeaders =  dbfRowHeader(buffer, header.headerLen - 1, decoder);
  return { buffer, decoder, header, rowHeaders }
}



module.exports = parseDbf