import axios from "axios";
import * as cheerio from "cheerio";
import * as superagent from "superagent";
import * as fs from 'fs'
import * as path from "path";

const BASE_URL = 'http://www.gra-moissanites.com/'
const pageList = ['', 'lianxi', 'guanyu', 'anli']
const BASE_HTML = BASE_URL +  'anli/index.html'
let $:any = undefined;
async function getRawHtml(url: string) {
    return superagent.get(url)
}
getRawHtml(BASE_HTML)
    .then(async res=>{
        // console.log('res', res.text)
        // get all js scripts
        $ = cheerio.load(res.text);
        //js
        const scriptsPathList: Array<string> = getSpecificFileByType({ fileType: 'script', extractAttr: 'src'})
        await startDownLoadFile(scriptsPathList)

        const imageUrlList: Array<string> = getSpecificFileByType({ fileType: 'img', extractAttr: 'src'})
        console.log('imageUrlList', imageUrlList)
        await startDownLoadFile(imageUrlList,'base64')

        const cssList = getSpecificFileByType({ fileType: 'link', extractAttr: 'href'})
        console.log('cssList',cssList)
        await startDownLoadFile(cssList)

    })
// 查找html中所有外联js path

function getSpecificFileByType(options= { fileType:'script',
    extractAttr:'src'}) :Array<string> {
    const list: Array<string> = [];
    $(options.fileType).each((index: any, elem: any) => {
        // @ts-ignore
        const path: string = $(this).attr(options.extractAttr)
        if (path) {
            list.push(path);
        }

    });
    return list
}

// function getScriptPath() {
//     const list: Array<string> = [];
//     return getSpecificFileByType(list);
//     return list;
// }

function getLocalPathAndFileName (path: string) {
    const list = path.split('/')
    const fileName: string = list.pop() || ""
    return {
        fileName,
        localPath: __dirname + list.join('/')
    }
}
async function startDownLoadFile(pathList: Array<string>,encoding = 'utf-8') {
    const batchPromise = [];
    // get online content
    for (const path of pathList) {
        const jsOnlinePath = BASE_URL+path;
        console.log('js online path', jsOnlinePath);
        batchPromise.push(axios.request({
            url: jsOnlinePath,
            responseType: encoding === 'base64' ? 'arraybuffer' : 'text'
        }))
    }
    const jsResult = await Promise.all(batchPromise);
    const localPath2ContentMap = new Map();
    jsResult.map((result, index )=> {
        const {
            fileName,
            localPath
        } = getLocalPathAndFileName(pathList[index])
        let content = result.data
        // if(encoding === 'base64' ) {
        //     content = 'data:image/png;base64,'+ Buffer.from(result.data,'binary')
        // }
        localPath2ContentMap.set(path.join(localPath,fileName), content)
    })
    console.log(localPath2ContentMap.entries())
   localPath2ContentMap.forEach((content,localPath) => {

       fs.writeFile(localPath, content,{
           // @ts-ignore
           encoding,
       }, function (err) {
           if (err) throw err;
           // 如果没有错误
           console.log("Data is written to file successfully.")
       })

   })



}