import { defineStore, storeToRefs } from "pinia";
import { mediaServer } from "@/main";
import * as mediasoupClient from "mediasoup-client";
import { io } from "socket.io-client";
import { useUserStore } from "@/stores/user-store.ts";
import { WEBSOCKETS_EVENT_OPTIONS } from "@/constants/websockets";

const userStore = useUserStore();
const { user } = storeToRefs(userStore);

export const useStreamStore = defineStore("stream", {
  state: () => ({
    stream: {},
    mockStream: null,

    isViewerVolumeMuted: true,
    isHost: false,
    text: "",

    isBooting: false,

    socket: null,

    // configuration parameters for mediasoup producers
    // https://mediasoup.org/documentation/v3/mediasoup-client/api/#ProducerOptions
    // https://mediasoup.org/documentation/v3/mediasoup-client/api/#transport-produce
    // https://mediasoup.org/documentation/v3/mediasoup-client/api/#ProducerCodecOptions
    params: {
      video: {
        encodings: [
          { rid: "r0", maxBitrate: 100000, scalabilityMode: "S3T3" },
          { rid: "r1", maxBitrate: 300000, scalabilityMode: "S3T3" },
          { rid: "r2", maxBitrate: 900000, scalabilityMode: "S3T3" },
        ],
        codecOptions: {
          videoGoogleStartBitrate: 1000,
        },
        track: null,
      },
      audio: {
        codecOptions: {
          opusStereo: 1,
          opusDtx: 1,
        },
        track: null,
      },
    },

    // mediasoup device for managing WebRTC capabilities
    device: null,

    // rtp capabilities needed for mediasoup-client
    rtpCapabilities: null,

    // webrtc transports for sending media
    producerTransport: {
      video: null,
      audio: null,
    },

    // webrtc transports for receiving media
    consumerTransport: {
      video: null,
      audio: null,
    },
  }),

  actions: {
    async fetchStream(stream_id) {
      try {
        const response = await mediaServer.get(`/stream/${stream_id}`);
        this.stream = response.data;
        this.isHost = this.stream.host.id === user.value.id;
        return this.stream;
      } catch (error) {
        console.log(error.response?.data.message);
        throw error;
      }
    },

    /* * * * * * * */
    /* web sockets */
    /* * * * * * * */
    connectSocketIo() {
      this.socket = io(import.meta.env.VITE_MEDIA_SERVER_ENDPOINT);
      this.socket.emit(WEBSOCKETS_EVENT_OPTIONS.JOIN_STREAM, {
        stream_id: this.stream.id,
        user: user.value,
      });
    },

    disconnectSocketIo() {
      this.socket.emit(WEBSOCKETS_EVENT_OPTIONS.LEAVE_STREAM, {
        stream_id: this.stream.id,
        user: user.value,
      });
      this.socket.disconnect();
    },

    listenSocketIo() {
      // start watching on stream started
      this.socket.on(WEBSOCKETS_EVENT_OPTIONS.STREAM_START, () => {
        if (!this.isHost) {
          this.startWatching();
        }
      });

      //  stream ended
      this.socket.on(WEBSOCKETS_EVENT_OPTIONS.STREAM_END, () => {
        // console.log("Stream ended", data);
      });

      // data updated
      this.socket.on(WEBSOCKETS_EVENT_OPTIONS.STREAM_UPDATE, (data) => {
        this.stream = {
          ...this.stream,
          ...data,
        };
      });

      // new message
      this.socket.on(WEBSOCKETS_EVENT_OPTIONS.STREAM_NEW_MESSAGE, (message) => {
        this.stream.messages.push(message);
      });
    },

    /* * * * * * * * * * */
    /* hearts & messages */
    /* * * * * * * * * * */
    newReaction() {
      this.socket.emit(WEBSOCKETS_EVENT_OPTIONS.STREAM_NEW_REACTION, {
        stream_id: this.stream.id,
      });
    },

    sendMessage() {
      this.socket.emit(WEBSOCKETS_EVENT_OPTIONS.STREAM_NEW_MESSAGE, {
        stream_id: this.stream.id,
        user: user.value,
        text: this.text,
      });
    },

    /* * * * * * * * */
    /* boot & unboot */
    /* * * * * * * * */
    async startStreaming() {
      this.isBooting = true;

      try {
        // access local media devices
        await this.getLocalStream();

        // fetch RTP capabilities from the server
        await this.getRtpCapabilities();

        // create a mediasoup deviceies();
        await this.createDevice();

        // create WebRTC transports for sending media
        await this.createSendTransport();

        // connect and start sending media
        await this.connectSendTransport();
      } catch (error) {
        console.log(error);
        this.isBooting = false;
      }
    },

    async startWatching() {
      try {
        // fetch RTP capabilities from the server
        await this.getRtpCapabilities();

        // create a mediasoup deviceies();
        await this.createDevice();

        // create WebRTC transports for receiving media
        await this.createRecvTransport();

        // connect and start receiving media
        await this.connectRecvTransport();
      } catch (error) {
        console.log(error);
      }
    },

    async endStream() {
      await mediaServer.delete(`/stream/${this.stream.id}`);
    },

    /* * * * * * */
    /* streaming */
    /* * * * * * */

    // accesses local media devices and updates stream parameters with the obtained tracks
    async getLocalStream() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: {
            width: { min: 1920, max: 1920 },
            height: { min: 1080, max: 1080 },
          },
        });

        const videoElement = document.getElementById("stream");
        videoElement.srcObject = stream;

        // mute to avoid feedback loop
        videoElement.muted = true;

        const videoTrack = stream.getVideoTracks()[0];
        await videoTrack.applyConstraints({
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        });
        this.params.video = {
          ...this.params.video,
          track: videoTrack,
        };

        const audioTrack = stream.getAudioTracks()[0];
        await audioTrack.applyConstraints({ noiseSuppression: true });
        this.params.audio = {
          ...this.params.audio,
          track: audioTrack,
        };
      } catch (error) {
        console.log(error.message);
      }
    },

    // stops the local video stream by stopping all associated tracks
    stopVideo() {
      const videoElement = document.getElementById("stream");
      if (videoElement && videoElement.srcObject) {
        videoElement.srcObject.getTracks().forEach((track) => track.stop());
      }
    },

    // fetches the RTP capabilities required for WebRTC communication from the server
    async getRtpCapabilities() {
      const response = await mediaServer.get("/rtp-capabilities");
      this.rtpCapabilities = response.data.rtpCapabilities;
      return this.rtpCapabilities;
    },

    // initializes the mediasoup-client device with the server's RTP capabilities
    // https://mediasoup.org/documentation/v3/mediasoup-client/api/#device-load
    async createDevice() {
      this.device = new mediasoupClient.Device();
      return await this.device.load({
        routerRtpCapabilities: this.rtpCapabilities,
      });
    },

    // creates a WebRTC transport for sending media to the server
    // https://mediasoup.org/documentation/v3/mediasoup-client/api/#TransportOptions
    // https://mediasoup.org/documentation/v3/communication-between-client-and-server/#producing-media
    async createSendTransport() {
      /* * * * * * * * * * * * * * * */
      /* producer transport - video  */
      /* * * * * * * * * * * * * * * */

      // requests the server to create a WebRTC transport for the producer (sender)
      const producerTransportVideo = await mediaServer
        .post("/web-rtc-transport", {
          sender: true,
          id: this.stream.id,
          kind: "video",
        })
        .catch((error) => {
          console.log(error);
        });
      if (producerTransportVideo.data.params.error) {
        throw "Cannot send web rtc transport (video)";
      }

      // create a send transport for video using the parameters received from the server
      this.producerTransport.video = this.device.createSendTransport(
        producerTransportVideo.data.params,
      );

      // listen for 'connect' event to establish connection with the server using the transport parameters
      this.producerTransport.video.on("connect", async ({ dtlsParameters }, callback, errback) => {
        try {
          // notify the server to complete the connection setup.
          await mediaServer.post("/transport-connect", {
            dtlsParameters: dtlsParameters,
            id: this.stream.id,
            kind: "video",
          });

          // signal successful connection setup
          callback();
        } catch (error) {
          // signal an error during connection setup.
          errback(error);
        }
      });

      // listen for 'produce' event to start sending media to the server
      this.producerTransport.video.on("produce", async (parameters, callback, errback) => {
        try {
          // notify the server to start receiving media.
          const { data } = await mediaServer.post("/transport-produce", {
            kind: parameters.kind,
            rtpParameters: parameters.rtpParameters,
            appData: parameters.appData,
            id: this.stream.id,
          });

          // provide the server-assigned producer ID to mediasoup-client
          callback({ id: data.id });
        } catch (error) {
          // handle any errors that occur during media production setup
          errback(error);
        }
      });

      /* * * * * * * * * * * * * * * */
      /* producer transport - audio  */
      /* * * * * * * * * * * * * * * */

      // repeat the process for audio transport
      const producerTransportAudio = await mediaServer
        .post("/web-rtc-transport", {
          sender: true,
          id: this.stream.id,
          kind: "audio",
        })
        .catch((error) => {
          console.log(error);
        });
      if (producerTransportAudio.data.params.error) {
        throw "Cannot send web rtc transport (audio)";
      }

      // create a send transport for audio
      this.producerTransport.audio = this.device.createSendTransport(
        producerTransportAudio.data.params,
      );

      // event listeners for the audio transport are similar to video's
      this.producerTransport.audio.on("connect", async ({ dtlsParameters }, callback, errback) => {
        await mediaServer
          .post("/transport-connect", {
            dtlsParameters: dtlsParameters,
            id: this.stream.id,
            kind: "audio",
          })
          .then(() => {
            callback();
          })
          .catch((error) => {
            errback(error);
          });
      });

      this.producerTransport.audio.on("produce", async (parameters, callback, errback) => {
        await mediaServer
          .post("/transport-produce", {
            kind: parameters.kind,
            rtpParameters: parameters.rtpParameters,
            appData: parameters.appData,
            id: this.stream.id,
          })
          .then((response) => {
            callback({ id: response.data.id });
          })
          .catch((error) => {
            errback(error);
          });
      });
    },

    // function to initiate the process of sending media streams (both video and audio) to the server
    // https://mediasoup.org/documentation/v3/mediasoup-client/api/#transport-produce
    async connectSendTransport() {
      /* * * * * * * * * */
      /* video transport */
      /* * * * * * * * * */

      // produce and send video stream to the server using the previously created send transport
      const videoProducer = await this.producerTransport.video.produce(this.params.video);

      // event listener for when the video track ends, which might happen if the user closes the tab or navigates away
      videoProducer.on("trackended", () => {
        console.log(this.params.video.track.kind + " track ended");
      });

      // event listener for when the transport is closed by the server or due to network issues
      videoProducer.on("transportclose", () => {
        console.log(this.params.video.track.kind + " transport closed");
      });

      /* * * * * * * * * */
      /* audio transport */
      /* * * * * * * * * */

      // similar setup for audio stream
      const audioProducer = await this.producerTransport.audio.produce(this.params.audio);

      // handling the end of audio track
      audioProducer.on("trackended", () => {
        console.log(this.params.audio.track.kind + " track ended");
      });

      // handling the closing of audio transport
      audioProducer.on("transportclose", () => {
        console.log(this.params.audio.track.kind + " transport closed");
      });
    },

    // function to create WebRTC transports for receiving media from the server
    // https://mediasoup.org/documentation/v3/mediasoup-client/api/#device-createRecvTransport
    // https://mediasoup.org/documentation/v3/communication-between-client-and-server/#producing-media
    async createRecvTransport() {
      /* * * * */
      /* video */
      /* * * * */

      // the process is similar to sending media but for receiving
      // first, set up transport for video
      let response = await mediaServer
        .post("/web-rtc-transport", {
          sender: false,
          id: this.stream.id,
          kind: "video",
        })
        .catch((error) => {
          console.error(error);
        });

      if (response.data.params.error) {
        console.error("Cannot recv web rtc transport (video)");
        return;
      }

      // create a receive transport using the parameters received from the server
      this.consumerTransport.video = this.device.createRecvTransport(response.data.params);

      // handling connection setup for receiving video
      this.consumerTransport.video.on("connect", async ({ dtlsParameters }, callback, errback) => {
        try {
          await mediaServer.post("/transport-recv-connect", {
            dtlsParameters: dtlsParameters,
            id: this.stream.id,
            kind: "video",
          });
          callback();
        } catch (error) {
          errback(error);
        }
      });

      /* * * * */
      /* audio */
      /* * * * */

      // now, setting up audio receive transport with similar steps as video
      response = await mediaServer
        .post("/web-rtc-transport", {
          sender: false,
          id: this.stream.id,
          kind: "audio",
        })
        .catch((error) => {
          console.error(error);
        });

      if (response.data.params.error) {
        console.error("Cannot recv web rtc transport (audio)");
        return;
      }

      // create receive transport for audio using server provided parameters
      this.consumerTransport.audio = this.device.createRecvTransport(response.data.params);

      // handling the 'connect' event for audio receive transport
      this.consumerTransport.audio.on("connect", async ({ dtlsParameters }, callback, errback) => {
        try {
          // notify the server to complete connection setup for the audio transport
          await mediaServer.post("/transport-recv-connect", {
            dtlsParameters: dtlsParameters,
            id: this.stream.id,
            kind: "audio",
          });

          // signal successful connection setup
          callback();
        } catch (error) {
          // handle any errors that occur during setup
          errback(error);
        }
      });
    },

    // once the transports are set up, consuming the streams is the next step
    async connectRecvTransport() {
      /* * * * */
      /* video */
      /* * * * */
      let response = await mediaServer
        .post("/consume", {
          rtpCapabilities: this.device.rtpCapabilities,
          id: this.stream.id,
          kind: "video",
        })
        .catch((error) => {
          console.error(error);
        });
      if (response.data.params.error) {
        console.error("Cannot consume (video)");
        return;
      }
      const consumerVideo = await this.consumerTransport.video.consume({
        id: response.data.params.id,
        producerId: response.data.params.producerId,
        kind: response.data.params.kind,
        rtpParameters: response.data.params.rtpParameters,
      });
      const videoTrack = consumerVideo.track;

      /*
       * audio
       */
      response = await mediaServer
        .post("/consume", {
          rtpCapabilities: this.device.rtpCapabilities,
          id: this.stream.id,
          kind: "audio",
        })
        .catch((error) => {
          console.error(error);
        });
      if (response.data.params.error) {
        console.error("Cannot consume (audio)");
        return;
      }
      const consumerAudio = await this.consumerTransport.audio.consume({
        id: response.data.params.id,
        producerId: response.data.params.producerId,
        kind: response.data.params.kind,
        rtpParameters: response.data.params.rtpParameters,
      });
      const audioTrack = consumerAudio.track;

      /*
       * video element
       */
      const videoElement = document.getElementById("stream");
      videoElement.muted = true;
      videoElement.srcObject = new MediaStream([videoTrack, audioTrack]);

      await mediaServer
        .post("/consumer-resume", {
          id: this.stream.id,
          kind: "video",
        })
        .catch((error) => {
          console.error(error);
        });

      await mediaServer
        .post("/consumer-resume", {
          id: this.stream.id,
          kind: "audio",
        })
        .catch((error) => {
          console.error(error);
        });
    },

    toggleMute() {
      if (this.isHost) {
        if (this.params.audio && this.params.audio.track) {
          this.params.audio.track.enabled = !this.params.audio.track.enabled;

          this.socket.emit(WEBSOCKETS_EVENT_OPTIONS.STREAM_UPDATE, {
            stream_id: this.stream.id,
            data: { isMuted: !this.params.audio.track.enabled },
          });
        }
      } else {
        const video = document.getElementById("stream");
        video.muted = !video.muted;
        this.isViewerVolumeMuted = video.muted;
      }
    },
  },
});
