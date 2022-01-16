export const Settings = {
    logging: {
        index: "debug",
        dataAccess: {
            ftp: "debug",
            listener: "debug"
        }
    },
    path: {
        instants: "instants",
        instantsResized: "instants-resized",
        local: {
            download: "downloads",
            upload: "uploads"
        },
    },
    rabbitMq: {
        exchange: "resize"
    }
}