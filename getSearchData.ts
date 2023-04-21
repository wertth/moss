import * as cheerio from "cheerio";
import * as fs from 'fs'
import * as path from "path";
import Root = cheerio.Root;
import Cheerio = cheerio.Cheerio;
import Element = cheerio.Element;

let $ = null;
const searchResultSelector = '.search_result .true-bg'
// fs.readFile('./test.html', {encoding: 'utf-8'}, (err: Error, data: string) => {
//     $ = cheerio.load(data);
//     const text = $(searchResultSelector).prop('outerHTML')
//     parseCertificate(text)
//         .then(res => {
//             console.log(res)
//         })
// })

export async function parseRawHtml(html:string) {
    return cheerio.load(html)(searchResultSelector).prop('outerHTML');
}

export async function replaceSaveRecord(html:string, saveRecord): Promise<string> {
    $ = cheerio.load(html);
    const record = JSON.parse(saveRecord.raw)
    const tableList = $(searchResultSelector + ' table')
    if(!tableList) {
        return null;
    }
    // console.log('tableList',tableList)
    //找到所有table 并替换
    tableList.map(function () {
        const elem: Cheerio = $(this)
        const indicatorKey = elem.prev().text().trim() || 'BASIC'
        let key;
        elem.find('td')
            .map(function (i: number, e: Element) {
                // indicateInfo.push($(e).text())
                // 找到值了
                if(i % 2 !== 0) {
                    $(e).replaceWith($(`<td>${record[indicatorKey][key]}</td>`))
                    // console.log('save', record,indicatorKey, key,record[indicatorKey][key], $(e).html())
                } else {
                    key = $(e).text()
                }
            })
    })

    return $.html()

}
export async function parseCertificate(html: string) {

    $ = cheerio.load(html);
    let result: {} = {};
    const tableList = $(searchResultSelector + ' table')
    if(!tableList) {
        return ''
    }
    tableList.map(function (index: number, el) {
        const elem: Cheerio = $(this)
        const indicatorKey = elem.prev().text().trim() || 'BASIC'
        const indicateInfo = []
        elem.find('td')
            .map(function (i: number, e: Element) {
                indicateInfo.push($(e).text())
            })
        // console.log(indicateInfo)
        if (indicatorKey) {
            result[indicatorKey] = {}
            for(let i = 0; i < indicateInfo.length; i+=2) {
                result[indicatorKey][indicateInfo[i]] = indicateInfo[i + 1]
            }
        }

    })

    return result;
}
