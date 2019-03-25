# meta-expo

# Usage

https://snack.expo.io/@florianmaxim/meta-expo

```javascript
import { AR, Cube } from 'meta-expo';

export default class App extends React.Component {

  render() {
    return (

      <AR onTouch={(data) => {
        new Cube({position:data.position})
      }}/>
    
    );
  }

}
```
https://snack.expo.io/@florianmaxim/meta-demo-air-piano

```javascript
import { AR, Cube } from 'meta-expo';

export default class App extends React.Component {

  render() {
    return (
      <AR onTouch={(data) => {
        new Cube({
          color = 'white',
          position: data.position,
          onTouch: self => self.color( 'red' ),
          onRelease: self => self.color( color ),
          })
      }}/>
    
    );
  }

}
```