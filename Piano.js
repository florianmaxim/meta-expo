import { Audio } from 'expo';

let soundObjectC = new Audio.Sound();
let soundObjectD = new Audio.Sound();
let soundObjectE = new Audio.Sound();
let soundObjectF = new Audio.Sound();
let soundObjectG = new Audio.Sound();
let soundObjectA = new Audio.Sound();
let soundObjectB = new Audio.Sound();
let soundObjectC2 = new Audio.Sound();

export default class Piano {

  constructor(props){
    this.init()
  }

  async init(){

    await Audio.setIsEnabledAsync(true);

    await Audio.setAudioModeAsync({
      playsInSilentModeIOS : true,
      allowsRecordingIOS: true,
      interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DUCK_OTHERS,
      interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: true
    })

    await soundObjectC.loadAsync(require('./assets/c1.mp3'));
    await soundObjectD.loadAsync(require('./assets/d1.mp3'));
    await soundObjectE.loadAsync(require('./assets/e1.mp3'));
    await soundObjectF.loadAsync(require('./assets/f1.mp3'));
    await soundObjectG.loadAsync(require('./assets/g1.mp3'));
    await soundObjectA.loadAsync(require('./assets/a1.mp3'));
    await soundObjectB.loadAsync(require('./assets/b1.mp3'));
    await soundObjectC2.loadAsync(require('./assets/c2.mp3'));
  }

  async play(note){
    switch(note){
      case 'C':
        await soundObjectC.replayAsync(); 
      break;
      case 'D':
        await soundObjectD.replayAsync(); 
      break;
      case 'E':
        await soundObjectE.replayAsync(); 
      break;
      case 'F':
        await soundObjectF.replayAsync(); 
      break;
      case 'G':
        await soundObjectG.replayAsync(); 
      break;
      case 'A':
        await soundObjectA.replayAsync(); 
      break;
      case 'B':
        await soundObjectB.replayAsync(); 
      break;
    }
  }

}