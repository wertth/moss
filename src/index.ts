
const express = require('express')
const app = express();
const multiparty = require('multiparty');
const REQUEST_URL = "http://www.gra-moissanites.com/plus/advancedsearch.php";
import * as fs from "fs"
const axios = require('axios')
import {Request, Response, urlencoded} from "express";
import "reflect-metadata"
import { AppDataSource } from "./data-source"
import {Certificate} from './entity/Certificate'
import {parseCertificate, parseRawHtml, replaceSaveRecord} from "../getSearchData";
const {ParsedCertificate} = require('./entity/parsedCertificate')
import * as xlsx from "node-xlsx"
(async () => {
    await AppDataSource.initialize()
})()
const UPLOAD_DIR = __dirname.substring(0, __dirname.lastIndexOf('/'))+ '/upload/'
async function parseExcel(path) {
    console.log(path)
    const workSheetsFromFile = xlsx.parse(path);
    const certificateDataList : Array<any> = [],root = {};
    let keys: Array<string> = [], subKeys = []
    let columnSizeList : Array<number>= [3, 6, 6, 2 ,1 ,1];
    workSheetsFromFile.map((workSheet) => {
        workSheet.data.map((row, index) => {
            row = row
                .filter(e=>e)
            if(index === 0) {
                keys = row
            }else if(index === 1) {
                subKeys = row
            } else {
                row.splice(0, 1)
                if(row.length < 5) return
                let beforeSum = 0
                columnSizeList.map((size,index) => {
                    const subList = row.slice(0, size);
                    let key = keys[index]
                    root[key] = {}
                    beforeSum += index > 0 ? columnSizeList[index - 1] : 0
                    subList.map((value,subIndex) => {
                        let subKey = subKeys[ beforeSum + subIndex ]
                        root[key][subKey] = value
                    })
                    row.splice(0, size)
                })
                console.log(root)
                certificateDataList.push(Object.assign({},root))
            }
        })
    })
    return certificateDataList;
}


app.listen(8080,(err: any) => {
    console.log('http://localhost:8080')
})
app.all("*", function (req, res, next) {
    //设置允许跨域的域名，*代表允许任意域名跨域
    res.header("Access-Control-Allow-Origin", "*");
    //允许的header类型
    res.header("Access-Control-Allow-Headers", "content-type");
    //跨域允许的请求方式
    res.header("Access-Control-Allow-Methods", "DELETE,PUT,POST,GET,OPTIONS");
    if (req.method == 'OPTIONS')
        res.sendStatus(200); //让options尝试请求快速结束
    else
        next();
});
app.use(urlencoded())
app.use(express.json());
app.post('/search',async (req: Request, res: Response) => {
    let form = new multiparty.Form();
    form.parse(req, async function(err: any,fields: any){
        const { mid, dopost, zsbh } = fields;
        const savedRecordList = await AppDataSource.manager.findBy(Certificate, { id: zsbh[0].trim()})
        // console.log('saved',savedRecordList)
        if(savedRecordList.length > 0) {
            fs.readFile(__dirname+'/static/test.html','utf-8',async (err,data) =>{
                const savedHtml = data
                const html = await replaceSaveRecord(savedHtml,savedRecordList[0])
                await fs.writeFile(__dirname+'/static/test.html',html,(err)=>{})
                res.setHeader('Content-Type', 'text/html');
                res.send(html)
                return 'ok';
            })

        }
        else {
            axios({
                url: `${REQUEST_URL}?mid=${mid}&dopost=${dopost}&zsbh=${zsbh}`
            }).then(async (response: Response) => {
                if(response.data.includes('alert(')){
                    return res.json({
                        code: 2,
                        msg: 'id错误'
                    })
                }
                //save
                const parsedCertificate = await parseCertificate(response?.data || "")
                console.log(parsedCertificate)
                const certificate = new Certificate();
                certificate.id = zsbh[0].trim()
                certificate.raw = JSON.stringify(parsedCertificate)
                console.log(certificate)
                await AppDataSource.manager.save(certificate)
                    .then((saveRes: Certificate) => {
                        console.log('save Res', saveRes)
                    })
                    .catch((err: Error) => {
                        console.log(err.message)
                    })
                fs.readFile(__dirname+'/static/test.html','utf-8',async (err,data) =>{
                    const html = await replaceSaveRecord(response.data,certificate)
                    await fs.writeFile(__dirname+'/static/test.html',html,(err)=>{})
                    res.setHeader('Content-Type', 'text/html');
                    res.send(html)
                    return 'ok';
                })

            })

        }

    });
})

app.post('/upload/', async (req: Request, res:Response) => {
    try {
        let form = new multiparty.Form({
            uploadDir: UPLOAD_DIR,
        });
        form.parse(req, async function(err: any,fields: any,files) {
            if(files) {
                const certificateDataList = await parseExcel(files.file[0].path)
                const certificateList: Array<Certificate> = []
                certificateDataList.map(certificateData => {
                    const certificate = new Certificate()
                    certificate.id = certificateData['BASIC']['GRA REPORT NUMBER：']
                    certificate.raw = JSON.stringify(certificateData)
                    certificateList.push(Object.assign({},certificate))
                })
                await AppDataSource.manager.upsert(Certificate,certificateList,["id"])
                return res.json({
                    code: 0,
                    certificateDataList
                })
            } else {
                return res.json({
                    code:2,
                    files
                })
            }

        })
    } catch (e) {
        return res.json({
            code:2,
            msg: e.message
        })
    }
})

app.get('/certificate/list', async (req: Request, res: Response) => {
    const { page, pageSize } = req.query;
    const certificateRecordList: Array<Certificate> = await AppDataSource.manager.find(Certificate,{
        skip: (page - 1) * pageSize,
        take: pageSize
    })
    let certificateList = [],batchPromise = [];
    for(const record of certificateRecordList) {
        certificateList.push(JSON.parse(record.raw))
    }
    return res.json({
        code:0,
        certificateList
    })
})

app.post('/login', async (req: Request, res: Response) => {
    try {
        const { userName, password } = req.body

        return res.json({
            code:0,
            userName,
            password
        })


    } catch (e : any) {
        console.log(e.message)
    }
})

app.post('/save/config', async (req: Request, res: Response) => {
    const {config} = req.body;
    const certificate = new Certificate();
    certificate.id = config['BASIC']['GRA REPORT NUMBER：'];
    certificate.raw = JSON.stringify(config);
    await AppDataSource.manager.update(Certificate,{
        id: certificate.id
    },{ raw: certificate.raw})
    return res.json({
        code: 0
    })
})

app.get('/del/config', async (req: Request, res: Response) => {
    const {id} = req.query;
    await AppDataSource.manager.delete(Certificate,{id})
    return res.json({
        code:0
    })
})

app.use((express.static(__dirname + '/static')))




