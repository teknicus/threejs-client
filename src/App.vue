<template>
  <el-main>
    <el-row style="height: 90vh" :gutter="20">
      <el-col :span="6">
        <div class="model-viewer">
          <div class="renderer">
            <Renderer :antialias="true">
              <PerspectiveCamera :position="[0, 2, 2]">
                <OrbitControls :target="[0, 0.5, 0]" :enable-pan="true" />
              </PerspectiveCamera>
              <Scene background="#f9f9f9">
                <AmbientLight :position="[0, 0, 10]" :intensity="1" />
                <GLTFLoader
                  ref="model"
                  :url="modelURL"
                  :scale="[2, 2, 2]"
                  @load="findMeshes"
                />
              </Scene>
            </Renderer>
          </div>
        </div>
      </el-col>

      <el-col :span="6" :offset="6">
        <el-row>
          <el-button style="width: 100%" @click="updateRemote">Push</el-button>
          <div v-for="mesh in meshes">
            <el-card class="box-card" style="margin: 10px; width: 40vw">
              <template #header>
                <div class="card-header">
                  <span>{{ mesh.name }}</span>
                </div>
              </template>
              <div>
                <!-- {{ meshProps[mesh.uuid] }} -->

                <el-form>
                  <b>UUID: </b>{{ mesh.uuid }}

                  <el-collapse>
                    <el-collapse-item title="Color">
                      <span>R: </span>
                      <el-slider
                        style="padding: 5px"
                        v-model="
                          socketStore.globLocal[`mesh-${mesh.name}`].color.r
                        "
                        :min="0"
                        :max="1"
                        :step="0.001"
                        @change="updateProps"
                      />

                      <span>G: </span>
                      <el-slider
                        style="padding: 5px"
                        v-model="
                          socketStore.globLocal[`mesh-${mesh.name}`].color.g
                        "
                        :min="0"
                        :max="1"
                        :step="0.001"
                        @change="updateProps"
                      />

                      <span>B: </span>
                      <el-slider
                        style="padding: 5px"
                        v-model="
                          socketStore.globLocal[`mesh-${mesh.name}`].color.b
                        "
                        :min="0"
                        :max="1"
                        :step="0.001"
                        @change="updateProps"
                      />
                    </el-collapse-item>

                    <el-collapse-item title="Position">
                      <span>X: </span>
                      <el-slider
                        style="padding: 5px"
                        v-model="
                          socketStore.globLocal[`mesh-${mesh.name}`].position.x
                        "
                        :min="0"
                        :max="10"
                        :step="0.001"
                        @change="updateProps"
                      />

                      <span>Y: </span>
                      <el-slider
                        style="padding: 5px"
                        v-model="
                          socketStore.globLocal[`mesh-${mesh.name}`].position.y
                        "
                        :min="0"
                        :max="10"
                        :step="0.001"
                        @change="updateProps"
                      />

                      <span>Z: </span>
                      <el-slider
                        style="padding: 5px"
                        v-model="
                          socketStore.globLocal[`mesh-${mesh.name}`].position.z
                        "
                        :min="0"
                        :max="10"
                        :step="0.001"
                        @change="updateProps"
                      />
                    </el-collapse-item>

                    <el-collapse-item title="Rotation">
                      <span>X: </span>
                      <el-slider
                        style="padding: 5px"
                        v-model="
                          socketStore.globLocal[`mesh-${mesh.name}`].rotation.x
                        "
                        :min="-3.14"
                        :max="3.14"
                        :step="0.001"
                        @change="updateProps"
                      />

                      <span>Y: </span>
                      <el-slider
                        style="padding: 5px"
                        v-model="
                          socketStore.globLocal[`mesh-${mesh.name}`].rotation.y
                        "
                        :min="-3.14"
                        :max="3.14"
                        :step="0.001"
                        @change="updateProps"
                      />

                      <span>Z: </span>
                      <el-slider
                        style="padding: 5px"
                        v-model="
                          socketStore.globLocal[`mesh-${mesh.name}`].rotation.z
                        "
                        :min="-3.14"
                        :max="3.14"
                        :step="0.001"
                        @change="updateProps"
                      />
                    </el-collapse-item>

                    <el-collapse-item title="Scale">
                      <span>X: </span>
                      <el-slider
                        style="padding: 5px"
                        v-model="
                          socketStore.globLocal[`mesh-${mesh.name}`].scale.x
                        "
                        :min="0"
                        :max="3"
                        :step="0.01"
                        @change="updateProps"
                      />

                      <span>Y: </span>
                      <el-slider
                        style="padding: 5px"
                        v-model="
                          socketStore.globLocal[`mesh-${mesh.name}`].scale.y
                        "
                        :min="0"
                        :max="3"
                        :step="0.01"
                        @change="updateProps"
                      />

                      <span>Z: </span>
                      <el-slider
                        style="padding: 5px"
                        v-model="
                          socketStore.globLocal[`mesh-${mesh.name}`].scale.z
                        "
                        :min="0"
                        :max="3"
                        :step="0.01"
                        @change="updateProps"
                      />
                    </el-collapse-item>
                  </el-collapse>

                  <!-- {{ meshProps[mesh.uuid] }} -->
                </el-form>
              </div>
            </el-card>
          </div>
        </el-row>
      </el-col>
    </el-row>
  </el-main>
</template>

<script setup lang="ts">
import { Renderer, Scene } from "@janvorisek/drie";
import { GLTFLoader, AmbientLight } from "@janvorisek/drie";
import axios from "axios";
import { ref, reactive, onMounted, computed, watch } from "vue";

import { useSocketStore } from "@/stores/socketStore";

import config from "../app-config.json";

const socketStore = useSocketStore();

let wsId = config.WORKSPACE_ID;
let apiKey = config.API_KEY;
let modelURL = config.MODEL_URL;

const model = ref(null);

const updateRemote = () => {
  console.log("Sending bulkUpload Req");

  let basePath = "https://api.iotify.io";

  const apiClient = axios.create({
    baseURL: basePath + "/api/",
    timeout: 10000,
    withCredentials: false,
    headers: {
      domain: "nsim.iotify.io",
      Accept: "application/json",
      "Content-Type": "application/json",
      key: apiKey,
    },
  });

  let keys = Object.keys(socketStore.globLocal);

  let data = keys.map((k) => {
    return {
      key: k,
      value: JSON.stringify(socketStore.globLocal[k]),
    };
  });

  console.log("Sending POST Req ", data);

  let response = apiClient
    .post(`/datastore/${wsId}/glob/bulkUpload`, data)
    .then(() => {
      console.log("bulkUpload success");
    })
    .catch(function (error) {
      console.log(error);
    });
};
const updateProps = () => {
  console.log("slider updated");

  meshes.value.forEach((m) => {
    let props = socketStore.globLocal[`mesh-${m.name}`];

    m.material.color.setRGB(props.color.r, props.color.g, props.color.b);
    m.position.set(props.position.x, props.position.y, props.position.z);
    m.rotation.set(props.rotation.x, props.rotation.y, props.rotation.z);
    m.scale.set(props.scale.x, props.scale.y, props.scale.z);

    console.log(`Updated Mesh ${m.name}`);
  });
};

const meshes = ref([]);
const meshProps = ref({});

watch(socketStore.globLocal, () => {
  console.log("Detected change in globLocal");

  // meshes.value.forEach((m) => {
  //   if(socketStore.globLocal[`mesh-${m.name}`]){
  //     console.log("copying globLocal to meshProps")
  //     meshProps.value[m.uuid] =  socketStore.globLocal[`mesh-${m.name}`]
  //   }
  // })

  updateProps();
});

const setFabricColor = () => {
  if (model.value === null) return;

  const fabricMesh = model.value.three.children[0].children.find(
    (m) => m.name === "SheenChair_fabric"
  );

  // fabricMesh.material.color.setRGB(0, 1, 0);
  // fabricMesh.position.set(0, 0.3, 0);
};

const findMeshes = () => {
  if (model.value === null) return;

  meshes.value = [];

  model.value.three.traverse(function (child) {
    if (child.type === "Mesh") {
      console.log("Found Mesh: ", child);
      meshes.value.push(child);

      socketStore.globLocal[`mesh-${child.name}`] = {
        name: child.name,
        uuid: child.uuid,
        color: {
          r: child?.material?.color?.r,
          g: child?.material?.color?.g,
          b: child?.material?.color?.b,
        },
        position: {
          x: child?.position?.x,
          y: child?.position?.y,
          z: child?.position?.z,
        },
        scale: {
          x: child?.scale?.x,
          y: child?.scale?.y,
          z: child?.scale?.z,
        },
        rotation: {
          x: child?.rotation?.x,
          y: child?.rotation?.y,
          z: child?.rotation?.z,
        },
      };

      console.log(
        JSON.stringify(socketStore.globLocal[`mesh-${child.name}`], null, 2)
      );

      socketStore.subToKey(wsId, `mesh-${child.name}`, apiKey);
    } else {
      console.log("Found child: ", child);
    }
  });

  console.log(meshes.value);
  console.log(meshProps.value);

  setFabricColor();
};

const PARAMS = reactive({
  radiusTop: 1,
});

const onPaneCreated = (pane: any) => {
  pane.addInput(PARAMS, "radiusTop", {
    min: 1,
    max: 5,
  });
};
</script>

<style>
.model-viewer {
  position: absolute;
  width: 40%;
  height: 90vh;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #ccc;
}

.model-viewer .renderer {
  width: 100%;
  height: 100%;
}

.model-viewer .options {
  position: absolute;
  top: 12px;
  right: 12px;
}

.model-viewer .option {
  border-radius: 6px;
  width: 32px;
  height: 32px;
  margin-bottom: 6px;
}

.model-viewer .option:hover {
  cursor: pointer;
}

.model-viewer .option.active {
  border: 2px solid black;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.25);
}
</style>
