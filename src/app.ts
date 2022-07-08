import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import logger from './Utils/logger';
import socket from './connection'
import { makeConnectionBlaze } from './Socket/index'
import * as dotenv from "dotenv";
dotenv.config();

console.log(process.env.PORT)

const port = Number(process.env.PORT)
const host = process.env.HOST as string
const corsOrigin = process.env.CORS_ORIGIN as string

const app = express()
app.use(cors())

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: corsOrigin,
    credentials: true,
  }
})

app.get('/', (_, res) => res.send('server is up'))

httpServer.listen(port, host, () => { 
  logger.info('🚀 Server is listening 🚀')
  logger.info(`http://${host}:${port}`)

  socket({io})
})

const socketBlaze = makeConnectionBlaze({needCloseWithCompletedSession: false,requireNotRepeated: true, type: 'doubles',})


socketBlaze.ev.on('game_graphing', async (msg)  => {
    delete msg.bets

    io.sockets.emit('double', msg)
    
})

