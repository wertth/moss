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
var axios_1 = require("axios");
var cheerio = require("cheerio");
var superagent = require("superagent");
var fs = require("fs");
var path = require("path");
var BASE_URL = 'http://www.gra-moissanites.com/';
var pageList = ['', 'lianxi', 'guanyu', 'anli'];
var BASE_HTML = BASE_URL + 'anli/index.html';
var $ = undefined;
function getRawHtml(url) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, superagent.get(url)];
        });
    });
}
getRawHtml(BASE_HTML)
    .then(function (res) { return __awaiter(void 0, void 0, void 0, function () {
    var scriptsPathList, imageUrlList, cssList;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                // console.log('res', res.text)
                // get all js scripts
                $ = cheerio.load(res.text);
                scriptsPathList = getSpecificFileByType({ fileType: 'script', extractAttr: 'src' });
                return [4 /*yield*/, startDownLoadFile(scriptsPathList)];
            case 1:
                _a.sent();
                imageUrlList = getSpecificFileByType({ fileType: 'img', extractAttr: 'src' });
                console.log('imageUrlList', imageUrlList);
                return [4 /*yield*/, startDownLoadFile(imageUrlList, 'base64')];
            case 2:
                _a.sent();
                cssList = getSpecificFileByType({ fileType: 'link', extractAttr: 'href' });
                console.log('cssList', cssList);
                return [4 /*yield*/, startDownLoadFile(cssList)];
            case 3:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
// 查找html中所有外联js path
function getSpecificFileByType(options) {
    var _this = this;
    if (options === void 0) { options = { fileType: 'script',
        extractAttr: 'src' }; }
    var list = [];
    $(options.fileType).each(function (index, elem) {
        // @ts-ignore
        var path = $(_this).attr(options.extractAttr);
        if (path) {
            list.push(path);
        }
    });
    return list;
}
// function getScriptPath() {
//     const list: Array<string> = [];
//     return getSpecificFileByType(list);
//     return list;
// }
function getLocalPathAndFileName(path) {
    var list = path.split('/');
    var fileName = list.pop() || "";
    return {
        fileName: fileName,
        localPath: __dirname + list.join('/')
    };
}
function startDownLoadFile(pathList, encoding) {
    if (encoding === void 0) { encoding = 'utf-8'; }
    return __awaiter(this, void 0, void 0, function () {
        var batchPromise, _i, pathList_1, path_1, jsOnlinePath, jsResult, localPath2ContentMap;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    batchPromise = [];
                    // get online content
                    for (_i = 0, pathList_1 = pathList; _i < pathList_1.length; _i++) {
                        path_1 = pathList_1[_i];
                        jsOnlinePath = BASE_URL + path_1;
                        console.log('js online path', jsOnlinePath);
                        batchPromise.push(axios_1["default"].request({
                            url: jsOnlinePath,
                            responseType: encoding === 'base64' ? 'arraybuffer' : 'text'
                        }));
                    }
                    return [4 /*yield*/, Promise.all(batchPromise)];
                case 1:
                    jsResult = _a.sent();
                    localPath2ContentMap = new Map();
                    jsResult.map(function (result, index) {
                        var _a = getLocalPathAndFileName(pathList[index]), fileName = _a.fileName, localPath = _a.localPath;
                        var content = result.data;
                        // if(encoding === 'base64' ) {
                        //     content = 'data:image/png;base64,'+ Buffer.from(result.data,'binary')
                        // }
                        localPath2ContentMap.set(path.join(localPath, fileName), content);
                    });
                    console.log(localPath2ContentMap.entries());
                    localPath2ContentMap.forEach(function (content, localPath) {
                        fs.writeFile(localPath, content, {
                            // @ts-ignore
                            encoding: encoding
                        }, function (err) {
                            if (err)
                                throw err;
                            // 如果没有错误
                            console.log("Data is written to file successfully.");
                        });
                    });
                    return [2 /*return*/];
            }
        });
    });
}
