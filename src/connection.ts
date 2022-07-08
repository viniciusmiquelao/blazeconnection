import { Server, Socket } from "socket.io";
import logger from "./Utils/logger";

const EVENTS = {
    connection: 'double',
}

function socket({io}: {io: Server}) {
    logger.info('Sockets enabled')

    io.on(EVENTS.connection, (socket: Socket) => {
        logger.info(`User connected ${socket.id}`)
    })
}

export default socket