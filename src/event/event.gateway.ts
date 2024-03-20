import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
    cors: true,
})
export class EventGateway {
    @WebSocketServer()
    ioServer: Server;
    private chatStatus: Record<string, Record<string, boolean>> = {};

    handleConnection(client: Socket) {
        //console.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        //console.log(`Client disconnected: ${client.id}`);

        for (const contactId in this.chatStatus) {
            if (this.chatStatus[contactId][client.id]) {
                delete this.chatStatus[contactId][client.id];
                this.ioServer.emit('chatStatus', this.chatStatus);
                break;
            }
        }
    }

    @SubscribeMessage('join')
    handleJoin(client: Socket, data: { contact_id: string }) {
        this.chatStatus[data.contact_id] = this.chatStatus[data.contact_id] || {};
        this.chatStatus[data.contact_id][client.id] = true;

        this.ioServer.emit('chatStatus', this.chatStatus);

        const roomsInfo = this.ioServer.sockets.adapter.rooms;

        roomsInfo.forEach((participants, room) => {
            if (room !== data.contact_id) {
                client.leave(room);
            }
        });

        client.join(data.contact_id);
        console.log('Current rooms and participants:', roomsInfo);
    }

    @SubscribeMessage('sendMessage')
    handleMessage(client: Socket, data: { contact_id: string; message: string }) {
        client.to(data.contact_id).emit('newMessage', data.message);
        this.ioServer.emit('update');
    }

    @SubscribeMessage('newChat')
    handleChat(client: Socket, data: { message: string }) {
        this.ioServer.emit('update');
    }
}
