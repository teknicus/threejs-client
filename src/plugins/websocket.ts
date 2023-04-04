import { io, Socket } from "socket.io-client";
import EventEmitter from "events";
import axios from "axios";

class WSClient extends EventEmitter {
  private socket: Socket;
  private interest: string[] = [];

  private socketCreated: boolean = false;

  private base_url = "https://nsim.iotify.io";


  constructor() {
    super();
  }

  createSocket(key: string) {
    console.log("Socket unintialized. Establishing connection...");
    const myURL = new URL(this.base_url);

    this.socket = io(this.base_url, {
      reconnectionDelayMax: 10000,
      extraHeaders: {
        domain: myURL.hostname,
        key,
      },
    });
    this.socketCreated = true;

    this.socket.on("Datastore", (payload) => {
      // console.log(`got ${JSON.stringify(payload)}`);
      this.emit(payload.key, payload.value);
    });

    // this.socket.onAny((event, payload) => {
    //   console.info(`got ${event}`, payload);
    // });
  }

  subscribe(workspaceId: string, type: string, apiKey: string) {

    console.log("Subscribing to the workspace", workspaceId, type);
    const myURL = new URL(this.base_url);

    const apiClient = axios.create({
      baseURL: this.base_url + '/api/',
      timeout: 10000,
      withCredentials: false,
      headers: {
        domain: myURL.hostname,
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'key': apiKey
      },
    });

  // let response = apiClient.get(`/datastore/${workspaceId}/glob/item/${type}`).then(()=>{
  //   console.log(response)
  // })
  




    if(!this.socketCreated){
      this.createSocket(apiKey);
    }

    this.socket.emit("datastore", { workspaceId, key: type, domain: myURL.hostname });
    // this.socket.emit("datastore", { workspaceId, key: "test", domain: myURL.hostname });
  }

}
const wsClient = new WSClient();

export { wsClient };
