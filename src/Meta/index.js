import { View as GraphicsView } from 'expo-graphics';
import { AR } from 'expo';
import ExpoTHREE, { THREE, AR as ThreeAR } from 'expo-three';
import React, {Fragment} from 'react';
import {View, Dimensions, StatusBar, PanResponder} from 'react-native';

import TouchableView from './TouchableView';

import Cylinder from './Cylinder';

import ARPlanes from '../ARPlanes';
import ARPoints from '../ARPoints';

let renderer, scene, camera;
let raycaster, mouse;

let planes;
let points;

const touches = [];
let touched;

let _touch;

const lifes = [];

const touch = {
  x:null,
  y:null
};

let space;
let dome;

const meshes = [];
const meshesAdded = [];

const onContextCreateVR = ({ gl, canvas, width, height, scale: pixelRatio }) => {

  renderer = new ExpoTHREE.Renderer({ gl, pixelRatio, width, height });
  renderer.setClearColor(0xffffff);

  scene = new THREE.Scene();
  
  camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
  camera.position.z = 5;
  scene.add(camera)

  space = new THREE.Object3D();
  scene.add(space)

  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();
  
  scene.add(new THREE.AmbientLight(0x404040));
  
  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(-3, 3, 3);
  scene.add(light);

  const light2 = new THREE.DirectionalLight(0xffffff, 1);
  light2.position.set(3, 3, -3);
  scene.add(light2);

  // TouchDome
  const geometry = new THREE.SphereBufferGeometry(5,32,32);

  let material = new THREE.MeshBasicMaterial({
    color: 0xff0000,
    wireframe: false,
    side: THREE.BackSide,
    depthTest: true,
    transparent: true,
    visible: false
  });

  dome = new THREE.Mesh(geometry, material);
  dome.position.copy(camera.position);
  scene.add(dome);

};

const onContextCreateAR = ({ gl, scale: pixelRatio, width, height, arSession }) => {

  AR.setPlaneDetection('horizontal')

  if(arSession){
    this.arSession = arSession
  }

  renderer = new ExpoTHREE.Renderer({ gl, pixelRatio, width, height });
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap; 

  scene = new THREE.Scene();
  scene.background = new ThreeAR.BackgroundTexture(renderer);

  camera = new ThreeAR.Camera(width, height, 0.01, 1000);
  scene.add(camera)

  scene.add(new THREE.AmbientLight(0xFFFFFF));

  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(-3, 3, 3);
  scene.add(light);

  const light2 = new THREE.DirectionalLight(0xffffff, 1);
  light2.position.set(3, 3, -3);
  scene.add(light2);

  space = new THREE.Object3D();
  scene.add(space)

  raycaster = new THREE.Raycaster();

  planes = new ARPlanes({
    material: new THREE.MeshPhongMaterial({
      side: THREE.DoubleSide,
      wireframe: true,
      opacity: 1,
      transparent: true
    }),
  });
  scene.add(planes);

  points = new ARPoints();
  scene.add(points);

  /* const shadowFloor = new ExpoTHREE.AR.ShadowFloor({ width: 1, height: 1, opacity: 0.6 }); // The opacity of the shadow

  scene.add(shadowFloor) */
};

function createBoxWithRoundedEdges( width, height, depth, radius0, smoothness ) {
  let shape = new THREE.Shape();
  let eps = 0.00001;
  let radius = radius0 - eps;
  shape.absarc( eps, eps, eps, -Math.PI / 2, -Math.PI, true );
  shape.absarc( eps, height -  radius * 2, eps, Math.PI, Math.PI / 2, true );
  shape.absarc( width - radius * 2, height -  radius * 2, eps, Math.PI / 2, 0, true );
  shape.absarc( width - radius * 2, eps, eps, 0, -Math.PI / 2, true );
  let geometry = new THREE.ExtrudeBufferGeometry( shape, {
    amount: depth - radius0 * 2,
    bevelEnabled: true,
    bevelSegments: smoothness * 2,
    steps: 1,
    bevelSize: radius,
    bevelThickness: radius0,
    curveSegments: smoothness
  });
  
  geometry.center();
  
  return geometry;
}

class Cube extends React.Component {

  constructor(props){

    super(props)

    this.size = props && props.size !== undefined ? props.size : {x:0.25,y:0.25,z:0.25};

    this.position = props && props.position !== undefined ? props.position : {x:0,y:0,z:1};

    this.color = props && props.color ? props.color : 0xffffff * Math.random();

    this.round = props && props.round ? props.round : false;

    this.life = props && props.life ? props.life : null;

   

    this.onTouch = props && props.onTouch ? props.onTouch : null;
    this.onRelease = props && props.onRelease ? props.onRelease : null;

    if(this.color === 'white') this.color = 0xffffff;
    if(this.color === 'black') this.color = 0x000000;

    if(this.color === 'red') this.color = 0xff0000;
    if(this.color === 'blue') this.color = 0x0000ff;
    if(this.color === 'yellow') this.color = 0xFFFF00;
    if(this.color === 'green') this.color = 0x00FF00;

    const geometry = new THREE.BoxGeometry(this.size.x, this.size.y, this.size.z);

    const material = new THREE.MeshPhongMaterial({
      color: this.color,
      side: THREE.DoubleSide
    });

    const roundMesh = new THREE.Mesh( createBoxWithRoundedEdges( this.size.x, this.size.y, this.size.z, this.size.z/8, 4 ), material );

    this.mesh;
    if(this.round){
      this.mesh = roundMesh.clone();
    }else{
      this.mesh = new THREE.Mesh(geometry, material);
    }

    this.mesh.position.copy(this.position);

    this.mesh.position.y += this.size.y / 2;


    if(this.onTouch){
      this.mesh.userData.onTouch = this.onTouch
    }
    if(this.onRelease){
      this.mesh.userData.onRelease = this.onRelease
    }

    space.add(this.mesh)

    this.mesh.color = function(color){
      if(color === 'white') color = 0xffffff;
      if(color === 'black') color = 0x000000;

      if(color === 'red') color = 0xff0000;
      if(color === 'blue') color = 0x0000ff;
      if(color === 'yellow') color = 0xFFFF00;
      if(color === 'green') color = 0x00FF00;
      this.mesh.material.color.setHex( color );
    }


    if(this.life){
      lifes.push(() => {
        this.life(this.mesh)
      })
    }
    

    //console.log(mesh)
    //meshes.push(mesh)
  
  }

  color(color){
    if(color === 'white') color = 0xffffff;
    if(color === 'black') color = 0x000000;

    if(color === 'red') color = 0xff0000;
    if(color === 'blue') color = 0x0000ff;
    if(color === 'yellow') color = 0xFFFF00;
    if(color === 'green') color = 0x00FF00;
    this.mesh.material.color.setHex( color );
  }


  render(){
    return null;
  }

}

class Ball extends React.Component {

  constructor(props){

    super(props)

    this.size = props && props.size !== undefined ? props.size : {x:0.25,y:0.25,z:0.25};

    this.position = props && props.position !== undefined ? props.position : {x:0,y:0,z:1};

    this.color = props && props.color ? props.color : 0xffffff * Math.random();

    this.round = props && props.round ? props.round : false;

    this.life = props && props.life ? props.life : null;

   

    this.onTouch = props && props.onTouch ? props.onTouch : null;
    this.onRelease = props && props.onRelease ? props.onRelease : null;


    const geometry = new THREE.SphereGeometry(
    radius=this.size.x/2,
    widthSegments=32,
    heightSegments=32,
    phiStart=0,
    phiLength=Math.PI/4,
    thetaStart=0,
    thetaLength=6.3);

    const geometry2 = new THREE.SphereGeometry(
      radius=this.size.x/2,
    widthSegments=32,
    heightSegments=32,
    phiLength=Math.PI/4,
    phiLength=Math.PI/4,
    thetaStart=0,
    thetaLength=6.3);

    const geometry3 = new THREE.SphereGeometry(
      radius=this.size.x/2,
    widthSegments=32,
    heightSegments=32,
    phiStart=(Math.PI/4)*2,
    phiLength=Math.PI/4,
    thetaStart=0,
    thetaLength=6.3);

    const geometry4 = new THREE.SphereGeometry(
      radius=this.size.x/2,
    widthSegments=32,
    heightSegments=32,
    phiStart=(Math.PI/4)*3,
    phiLength=Math.PI/4,
    thetaStart=0,
    thetaLength=6.3);

    //const COLORS = [0xe2b500, 0xc41313, 0x131377, 0x25680b]
    //const COLORS = [0x0e8e8e8, 0xce2323, 0x0e8e8e8, 0xce2323]
    const COLORS = [0x0e8e8e8, 0xedcf10, 0x0e8e8e8, 0xedcf10]


    //blue
    material = new THREE.MeshPhongMaterial( {wireframe: false,  color: COLORS[0], side: THREE.DoubleSide });
    //green
    material2 = new THREE.MeshPhongMaterial( {wireframe: false,  color: COLORS[1], side: THREE.DoubleSide });
    //blue
    material3 = new THREE.MeshPhongMaterial( {wireframe: false,  color: COLORS[2], side: THREE.DoubleSide });
    //
    material4 = new THREE.MeshPhongMaterial( {wireframe: false,  color: COLORS[3], side: THREE.DoubleSide });
    
    this.mesh = new THREE.Mesh( geometry, material );
    var mesh2 = new THREE.Mesh( geometry2, material2 );
    var mesh3 = new THREE.Mesh( geometry3, material3 );
    var mesh4 = new THREE.Mesh( geometry4, material4 );

    

    this.mesh.add( mesh2 );
    this.mesh.add( mesh3 );
    this.mesh.add( mesh4 );

    space.add( this.mesh );

    if(this.onTouch){
      this.mesh.userData.onTouch = this.onTouch
    }
    if(this.onRelease){
      this.mesh.userData.onRelease = this.onRelease
    }

    this.mesh.position.copy(this.position)

    this.mesh.position.x += this.size.x/2
    this.mesh.position.z -= this.size.x/2
    
    space.add(this.mesh)

    this.mesh.color = function(color){
      if(color === 'white') color = 0xffffff;
      if(color === 'black') color = 0x000000;

      if(color === 'red') color = 0xff0000;
      if(color === 'blue') color = 0x0000ff;
      if(color === 'yellow') color = 0xFFFF00;
      if(color === 'green') color = 0x00FF00;
      this.mesh.material.color.setHex( color );
    }


    if(this.life){
      lifes.push(() => {
        this.life(this.mesh)
      })
    }
  
  }

  color(color){
    if(color === 'white') color = 0xffffff;
    if(color === 'black') color = 0x000000;

    if(color === 'red') color = 0xff0000;
    if(color === 'blue') color = 0x0000ff;
    if(color === 'yellow') color = 0xFFFF00;
    if(color === 'green') color = 0x00FF00;
    this.mesh.material.color.setHex( color );
  }


  render(){
    return null;
  }

}

class Sphere extends React.Component {

  constructor(props){
    super(props)

    this.size = props && props.size !== undefined ? props.size : {x:0.25,y:0.25,z:0.25};

    this.position = props && props.position !== undefined ? props.position : {x:0,y:0,z:1};

    this.color = props && props.color ? props.color : 0xffffff * Math.random();

    if(this.color === 'red') this.color = 0xff0000;
    if(this.color === 'blue') this.color = 0x0000ff;
    if(this.color === 'yellow') this.color = 0xFFFF00;
    if(this.color === 'green') this.color = 0x00FF00;

    this.onTouch = props && props.onTouch ? props.onTouch : null;
    this.onRelease = props && props.onRelease ? props.onRelease : null;

    const geometry = new THREE.SphereGeometry(this.size.x/2,32,32);

    const material = new THREE.MeshPhongMaterial({
      color: this.color
    });

    this.mesh = new THREE.Mesh(geometry, material);

    this.mesh.position.copy(this.position);

    this.mesh.position.y += this.size.y / 2;

    

    if(this.onTouch){
      this.mesh.userData.onTouch = this.onTouch
    }
    if(this.onRelease){
      this.mesh.userData.onRelease = this.onRelease
    }

    space.add(this.mesh)
  
  }

  render(){
    return null
  }

}

class Cone extends React.Component {

  constructor(props){
    super(props)

    this.size = props && props.size !== undefined ? props.size : {x:0.25,y:0.25,z:0.25};

    this.position = props && props.position !== undefined ? props.position : {x:0,y:0,z:1};

    this.color = props && props.color ? props.color : 0xffffff * Math.random();

    if(this.color === 'red') this.color = 0xff0000;
    if(this.color === 'blue') this.color = 0x0000ff;
    if(this.color === 'yellow') this.color = 0xFFFF00;
    if(this.color === 'green') this.color = 0x00FF00;

    //alert(this.size.x)

    const geometry = new THREE.ConeGeometry(this.size.y/2,this.size.y,32);

    const material = new THREE.MeshPhongMaterial({
      color: this.color,
    });

    //this.mesh = new THREE.Mesh( createBoxWithRoundedEdges( this.size.x, this.size.y, this.size.z, this.size.z/8, 8 ), material );


    this.mesh = new THREE.Mesh(geometry, material);

    this.mesh.position.copy(this.position);

    this.mesh.position.y += this.size.y / 2;

    space.add(this.mesh)
  
  }

  render(){
    return null
  }

}

class Space extends React.Component {

  constructor(props){
    super(props)
    if(props && props.onTouch)
    touches.push(props.onTouch)
  }
  
  componentWillMount() {
    THREE.suppressExpoWarnings();
  }


  render() {
    // Create an `ExpoGraphics.View` covering the whole screen, tell it to call our
    // `onContextCreate` function once it's initialized.
    return (
      <Fragment>
         {this.props.children}
        <GraphicsView
          onContextCreate={onContextCreateVR}
          onRender={this.onRender}
        />
        <View 
          style={{
            position: 'absolute', 
            flex: 1,
            width: Dimensions.get('screen').width,
            height: Dimensions.get('screen').height
          }}
          onStartShouldSetResponder={(data) => {

            if(!_touch) return 
            console.log('start')
            mouse.x = (  data.nativeEvent.pageX / Dimensions.get('screen').width ) * 2 - 1;
            mouse.y = - (  data.nativeEvent.pageY /Dimensions.get('screen').height ) * 2 + 1;
            console.log(mouse.x)
            
          }}

          onTouchEnd={()=>{
            console.log('end')
            mouse.x = null
            _touch= true;

          }}
        >
          <StatusBar hidden/>
        </View>
      </Fragment>
    );
  }

  onResize = ({ x, y, scale, width, height }) => {
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(scale);
    renderer.setSize(width, height);
  };

  onRender = delta => {
    
    //Life
    life(delta)

    //Touches
    intersectDome();


    renderMeshes()
    animateMeshes(delta)
    
    renderer.render(scene, camera);
  };
}


class Meta extends React.Component {

  constructor(props){
    super(props)
    if(props && props.onTouch)
    touches.push(props.onTouch)

    this.onTouch = (doStuff) => {
      touches.push(doStuff)
    }

  }
  
  static getSpaceObject(){
    return space;
  }

  onTouch(doStuff){
    touches.push(doStuff)
  }
   
  componentWillMount() {
    THREE.suppressExpoWarnings();
  }

 
  render() {
    return (
      <Fragment>
        <GraphicsView
          style={{ flex: 1 }}
          onContextCreate={onContextCreateAR}
          onRender={this.onRender}
          onResize={this.onResize}
          isArEnabled
          isArRunningStateEnabled
          isArCameraStateEnabled
          arTrackingConfiguration={AR.TrackingConfiguration.World}
        />

        <TouchableView 
          style={{
            position: 'absolute', 
            flex: 1,
            width: Dimensions.get('screen').width,
            height: Dimensions.get('screen').height
          }}

          onTouchesStarted={(event) => {
            touch.x = (  event.touches[0].pageX / Dimensions.get('screen').width ) * 2 - 1;
            touch.y = - (  event.touches[0].pageY /Dimensions.get('screen').height ) * 2 + 1;
          }}

          onTouchesMoved={(event) => {
            touch.x = (  event.touches[0].pageX / Dimensions.get('screen').width ) * 2 - 1;
            touch.y = - (  event.touches[0].pageY /Dimensions.get('screen').height ) * 2 + 1;    
          }}

          onTouchesEnded={(event) => {
            touch.x, touch.y = null;
          }}

          onTouchesCancelled={(event) => {
            touch.x, touch.y = null;
          }}
        >
          <StatusBar hidden/>
        </TouchableView>
      </Fragment>
    );
  }

  onResize = ({ x, y, scale, width, height }) => {
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(scale);
    renderer.setSize(width, height);
  };

  onRender = delta => {

   /*  

    
    renderMeshes()
    animateMeshes(delta) */

    //planes.update();
    points.update();

    intersectSpace(delta);

    life(delta);

    renderer.render(scene, camera);

  };
}

function life(delta){
  for(const life of lifes){
    life()
  }
 }

function renderMeshes(){
  for(const mesh of meshes){
    space.add(mesh)
    meshes.splice(meshes.indexOf(mesh), 1);
    meshesAdded.push(mesh)
  }
}

function animateMeshes(delta){
}

function intersectDome(){

  if(mouse.x && _touch){

	raycaster.setFromCamera( mouse, camera );

  var intersects = raycaster.intersectObject( dome );

    const position = intersects[0].point

    const data = {
      position: position
    }

    for(const touch of touches){
      touch(data)
      _touch = false
    }
  
  }

}

function intersectPlanes(){

}

function intersectSpace(delta){

  // If we have a position we have a touch.
  if(touch.x && touch.y){

    raycaster.setFromCamera( touch, camera );

    const intersects = raycaster.intersectObjects( space.children, true );
    const intersectsPlanes = raycaster.intersectObjects( points.children, true );

    if(intersects.length > 0){

      const object = intersects[0].object;

      //object.userData.life()
      const position = intersects[0].point;

      const data = {
        position: position,
        pos: position,
        p: position
      }

    
      if(object.userData && object.userData.onTouch)
      {
        object.userData.onTouch(object, delta)
        touched = object
      }
     

    }else{

      if(intersectsPlanes.length > 0){

        const object = intersectsPlanes[0].object;
 
        const position = intersectsPlanes[0].point;
  
        const data = {
          position: position,
          pos: position,
          p: position
        }
  
        for(const action of touches){
          action(data)
          touch.x, touch.y = 0;
        }
  
      }
    }
  
  }else{
    if(touched){
      touched.userData.onRelease(touched, delta)
      tocuhed = null
    }
  }

}


export { Meta, Space, Cube, Sphere, Cone, Cylinder, Ball, space }