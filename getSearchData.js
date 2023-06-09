"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.parseCertificate = exports.replaceSaveRecord = exports.parseRawHtml = void 0;
var cheerio = require("cheerio");
var $ = null;
var searchResultSelector = '.search_result .true-bg';
// fs.readFile('./test.html', {encoding: 'utf-8'}, (err: Error, data: string) => {
//     $ = cheerio.load(data);
//     const text = $(searchResultSelector).prop('outerHTML')
//     parseCertificate(text)
//         .then(res => {
//             console.log(res)
//         })
// })
function parseRawHtml(html) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, cheerio.load(html)(searchResultSelector).prop('outerHTML')];
        });
    });
}
exports.parseRawHtml = parseRawHtml;
function replaceSaveRecord(html, saveRecord) {
    return __awaiter(this, void 0, void 0, function () {
        var record, tableList;
        return __generator(this, function (_a) {
            $ = cheerio.load(html);
            record = JSON.parse(saveRecord.raw);
            tableList = $(searchResultSelector + ' table');
            if (!tableList) {
                return [2 /*return*/, null];
            }
            // console.log('tableList',tableList)
            //找到所有table 并替换
            tableList.map(function () {
                var elem = $(this);
                var indicatorKey = elem.prev().text().trim() || 'BASIC';
                var key;
                elem.find('td')
                    .map(function (i, e) {
                    // indicateInfo.push($(e).text())
                    // 找到值了
                    if (i % 2 !== 0) {
                        $(e).replaceWith($("<td>".concat(record[indicatorKey][key], "</td>")));
                        // console.log('save', record,indicatorKey, key,record[indicatorKey][key], $(e).html())
                    }
                    else {
                        key = $(e).text();
                    }
                });
            });
            return [2 /*return*/, $.html()];
        });
    });
}
exports.replaceSaveRecord = replaceSaveRecord;
function parseCertificate(html) {
    return __awaiter(this, void 0, void 0, function () {
        var result, tableList;
        return __generator(this, function (_a) {
            $ = cheerio.load(html);
            result = {};
            tableList = $(searchResultSelector + ' table');
            if (!tableList) {
                return [2 /*return*/, ''];
            }
            tableList.map(function (index, el) {
                var elem = $(this);
                var indicatorKey = elem.prev().text().trim() || 'BASIC';
                var indicateInfo = [];
                elem.find('td')
                    .map(function (i, e) {
                    indicateInfo.push($(e).text());
                });
                // console.log(indicateInfo)
                if (indicatorKey) {
                    result[indicatorKey] = {};
                    for (var i = 0; i < indicateInfo.length; i += 2) {
                        result[indicatorKey][indicateInfo[i]] = indicateInfo[i + 1];
                    }
                }
            });
            return [2 /*return*/, result];
        });
    });
}
exports.parseCertificate = parseCertificate;
