import amqp from 'amqplib';
import logger from '../logger';
import { Settings } from '../settings';
export default function makeImageListener() {
    let channel, connection, q;
    const exchange: string = Settings.rabbitMq.exchange;
    const log = logger('image-listener', Settings.logging.dataAccess.listener)

    return Object.freeze({
        receive
    })
    async function connect() {
        try {
            connection = await amqp.connect("amqp://localhost")
            log.info("Connection with RabbitMQ established")
            channel = await connection.createChannel();
            log.info("Channel created")
            channel.assertExchange(exchange, 'fanout', { durable: false });
            q = await channel.assertQueue(exchange, { exclusive: true });
            log.info(`Waiting for messages on exchange = ${exchange}.`);
            await channel.bindQueue(q.queue, exchange, '')
        }
        catch (e) { log.error(e) }
    }

    async function receive(saveAndResizeImage) {
        if (!channel) await connect();
        channel.consume(q.queue, async function (msg) {
            try {
                if (msg.content) {
                    const fileName = msg.content.toString();
                    log.info("Received = " + fileName)
                    await saveAndResizeImage(fileName);
                }
            } catch (e) { log.error(e); throw e }
        }, {
            noAck: true
        })
    }
}