import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

export async function loaderFBX(fbxFile) {
  const loader = new FBXLoader();
  return loader.loadAsync(fbxFile);
}

export async function loaderOBJ(objFile, mtlFile) {
  if (mtlFile) {
    const mtlLoader = new MTLLoader();
    mtlLoader.setResourcePath(mtlFile.replace(/[^/]*$/, ""));
    const materials = await mtlLoader.loadAsync(mtlFile);
    materials.preload();
    const objLoader = new OBJLoader();
    objLoader.setMaterials(materials);
    return objLoader.loadAsync(objFile);
  }
  return new OBJLoader().loadAsync(objFile);
}

export async function loaderGLTF(gltfFile) {
  const gltf = await new GLTFLoader().loadAsync(gltfFile);
  return gltf.scene;
}
