import { wsClient } from "@/plugins/websocket";
import { defineStore } from "pinia";
import { watch, ref, toRaw } from "vue";
import axios from "axios";
import _ from "lodash";
import { v4 as uuidv4 } from "uuid";

import config from "../../app-config.json";

console.log(config);

export const useSocketStore = defineStore("socketStore", () => {
  const globLocal = ref({});
  let globLocal_synced = {};
  let activeNonces = [];

  console.log(
    "Initial Socket Store:",
    toRaw(globLocal.value),
    toRaw(globLocal_synced)
  );
  const apiKey = config.API_KEY;
  const wsId = config.WORKSPACE_ID;

  subToKey(wsId, "activeNonce", apiKey);

  // watch(
  //   globLocal,
  //   () => {
  //     console.log("globLocal updated");

  //     let basePath = "https://api.iotify.io";

  //     const apiClient = axios.create({
  //       baseURL: basePath + "/api/",
  //       timeout: 10000,
  //       withCredentials: false,
  //       headers: {
  //         domain: "nsim.iotify.io",
  //         Accept: "application/json",
  //         "Content-Type": "application/json",
  //         key: apiKey,
  //       },
  //     });

  //     let keys = Object.keys(globLocal.value);

  //     let newNonce = uuidv4();
  //     activeNonces.push(newNonce);

  //     let data = keys.map((k) => {
  //       return {
  //         key: k,
  //         value: JSON.stringify({
  //           ...globLocal.value[k],
  //           activeNonce: newNonce,
  //         }),
  //       };
  //     });

  //     console.log("Sending POST Req ", data);

  //     // let response = apiClient
  //     //   .post(`/datastore/${wsId}/glob/bulkUpload`, data)
  //     //   .then(() => {
  //     //     console.log("bulkUpload success");
  //     //   })
  //     //   .catch(function (error) {
  //     //     console.log(error);
  //     //   });
  //   },
  //   { deep: true }
  // );

  function subToKey(wsId: string, key: string, apiKey: string) {
    console.log("Inside socket action. Calling wsClient.subscribe");
    // this.apiKey = apiKey;

    wsClient.subscribe(wsId, key, apiKey);

    wsClient.on(key, (value: string) => {
      // console.log(`Key: ${key} - Value: ${value}`)
      let valueObj = JSON.parse(value);

      if (activeNonces.includes(valueObj?.activeNonce)) {
        // console.log("Found existing Nonce Value");
        return;
      }

      this.globLocal[key] = valueObj;

      // console.log(globLocal)
    });
  }

  return { globLocal, subToKey };
});
