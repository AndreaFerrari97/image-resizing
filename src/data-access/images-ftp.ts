import Client from 'ftp';
import dotenv from 'dotenv';
import fs from 'fs';
import logger from "../logger";
import { Settings } from '../settings';
const ftp = new Client();
dotenv.config();

ftp.connect({
    host: '127.0.0.1',
    port: '21',
    user: process.env.FTP_USER,
    password: process.env.FTP_PSW,
});

export default function makeInstantsFtp() {
    const pathInstantDowload: string = "./" + Settings.path.local.download;
    const pathInstantUpload: string = "./" + Settings.path.local.upload;
    const pathInstant: string = Settings.path.instants;
    const pathInstantResized: string = Settings.path.instantsResized;
    const log = logger('Instants-receive', Settings.logging.dataAccess.ftp);

    if (!fs.existsSync(pathInstantDowload)) fs.mkdirSync(pathInstantDowload)
    if (!fs.existsSync(pathInstantUpload)) fs.mkdirSync(pathInstantUpload)

    return Object.freeze({
        createDirectory,
        existDirectoryToSaveFile,
        getInstantImg,
        upload
    })

    //file.originalname
    async function upload(fileName: string): Promise<boolean> {
        const localFilePath = `${pathInstantUpload}/${fileName}`
        log.debug(`Local path to retrive image ${localFilePath}`)
        const ftpFilePath = `${pathInstantResized}/${fileName}`
        log.debug(`Ftp path to upload image ${ftpFilePath}`)
        return new Promise<any>((resolve, reject) => {
            ftp.put(localFilePath, ftpFilePath,
                function (err) {
                    if (err) { log.error(err); resolve(false) };
                    log.info(`Image ${fileName} uploaded on FTP server`)
                    resolve('uploaded')
                })
        })
    }

    async function createDirectory(dir: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            ftp.mkdir(dir, (err) => {
                if (err) { reject(err); }
                log.info(`creating directory ${dir}`);
                resolve(true);
            })
        })
    }

    async function existDirectoryToSaveFile(dir): Promise<boolean> {
        return new Promise<any>((resolve, reject) => {
            ftp.list('./', function (err, data) {
                if (err) reject(err);
                let found = false;
                for (const directory of data)
                    if (directory?.name == dir) found = true;
                resolve(found);
            })
        })
    }

    async function getInstantImg(fileName: string): Promise<boolean> {
        log.debug(`Download instant ${fileName} from FTP server`);
        const downloadPath = `./${pathInstantDowload}/${fileName}`;
        return new Promise<any>((resolve) => {
            ftp.get(`${pathInstant}/${fileName}`, function (err, stream) {
                if (err) { log.error(`${err} (Instant: ${fileName})`); resolve(false) }
                if (stream) {
                    stream.pipe(fs.createWriteStream(downloadPath));
                    log.info(`Instant ${fileName} downloaded in ${downloadPath}`);
                    resolve(true);
                }
            })
        });
    }
}