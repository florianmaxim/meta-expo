import { View as GraphicsView } from 'expo-graphics';
import { AR } from 'expo';
import ExpoTHREE, { THREE, AR as ThreeAR } from 'expo-three';
import React, {Fragment} from 'react';
import {View, Dimensions, StatusBar} from 'react-native';

import { space } from '../Meta/index';

export default class Cone extends React.Component {

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

    const material = new THREE.MeshPhongMaterial({
      color: this.color,
      side: THREE.DoubleSide
    });

    const geometry = new THREE.CylinderGeometry( 0.14, 0.14, 0.05, 32, 32, false, 3, 4.5 );
    
    const mesh = new THREE.Mesh( geometry, material );

    mesh.rotation.x = props.rotation.x;
    
    space.add( mesh );

    mesh.position.copy(this.position);

    mesh.position.y += this.size.y / 2;

    if(this.onTouch){
      mesh.userData.onTouch = this.onTouch
    }
    if(this.onRelease){
      mesh.userData.onRelease = this.onRelease
    }

    mesh.name = 'HANNES'

    space.add(mesh)

    mesh.color = function(color){
      if(color === 'white') color = 0xffffff;
      if(color === 'black') color = 0x000000;

      if(color === 'red') color = 0xff0000;
      if(color === 'blue') color = 0x0000ff;
      if(color === 'yellow') color = 0xFFFF00;
      if(color === 'green') color = 0x00FF00;
      mesh.material.color.setHex( color );
    }

    return this;

  }

  render(){
    return null;
  }

}