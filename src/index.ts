import { imageListener } from "./data-access";
import { imageFtp } from "./data-access";
import fs from 'fs';
import jimp from 'jimp';
import logger from './logger'
import { Settings } from './settings'

async function saveAndResizeImage(fileName: string) {
    const saved = await imageFtp.getInstantImg(fileName);
    if (saved) {
        const instantPath = `${Settings.path.local.download}/${fileName}`;
        const instantResizedPath = `${Settings.path.local.upload}/${fileName}`
        const image = await jimp.read(instantPath);
        log.info("Resizing image")
        await image.resize(140, jimp.AUTO);
        await image.writeAsync(instantResizedPath);
        await imageFtp.upload(fileName);
        log.info("Removing instant and resized-instant from local directories")
        fs.unlinkSync(instantPath);
        fs.unlinkSync(instantResizedPath);
    }
}

async function start() {
    try {
        log.createLogFileStream()
        const found = await imageFtp.existDirectoryToSaveFile(Settings.path.instantsResized);
        log.debug(`Does FTP server have ${Settings.path.instantsResized} directory? ${found}`)
        if (!found) await imageFtp.createDirectory(Settings.path.instantsResized);
        imageListener.receive(saveAndResizeImage)
    } catch (e) { log.error(e) }

}

const log = logger('index', Settings.logging.index)
start();

