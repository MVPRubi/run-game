import { Room } from "../Entity/room";

class RoomManager {
  private static instance: RoomManager | null = null;

  private rooms: Map<string, Room> = new Map();

  private constructor() {}

  public static getInstance(): RoomManager {
    if (RoomManager.instance === null) {
      RoomManager.instance = new RoomManager();
    }
    return RoomManager.instance;
  }

  public createRoom(ownerId: string): Room {
    const idx = this.rooms.size;
    const room = new Room(ownerId, `房间${idx + 1}`);
    this.rooms.set(room.id, room);
    return room;
  }

  public getRoomByOwner(id: string): Room {
    return Array.from(this.rooms.values()).find(
      ({ ownerId }) => ownerId === id
    ) as Room;
  }

  public getRoomList() {
    return Array.from(this.rooms.values());
  }

  public getRoomById(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }
}

const roomManager = RoomManager.getInstance();

export default roomManager;
