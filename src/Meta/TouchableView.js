// @flow
import React from 'react';
import { PanResponder, View } from 'react-native';
import { PropTypes } from 'prop-types';

class TouchableView extends React.Component {
  static propTypes = {
    onTouchesBegan: PropTypes.func.isRequired,
    onTouchesMoved: PropTypes.func.isRequired,
    onTouchesEnded: PropTypes.func.isRequired,
    onTouchesCancelled: PropTypes.func.isRequired,
    onStartShouldSetPanResponderCapture: PropTypes.func.isRequired,
  };
  static defaultProps = {
    onTouchesBegan: () => {},
    onTouchesMoved: () => {},
    onTouchesEnded: () => {},
    onTouchesCancelled: () => {},
    onStartShouldSetPanResponderCapture: () => true,
  };

  buildGestures = () =>
    PanResponder.create({
      onResponderTerminationRequest: this.props.onResponderTerminationRequest,
      onStartShouldSetPanResponderCapture: this.props
        .onStartShouldSetPanResponderCapture,
      onPanResponderGrant: ({ nativeEvent }, gestureState) => {
        const event = this._transformEvent({ ...nativeEvent, gestureState });
        this._emit('touchstart', event);
        //console.log('touchstart')

        this.props.onTouchesStarted(event);
      },
      onPanResponderMove: ({ nativeEvent }, gestureState) => {
        const event = this._transformEvent({ ...nativeEvent, gestureState });
        this._emit('touchmove', event);
        //(console.log('touchmove')
        this.props.onTouchesMoved(event);
      },
      onPanResponderRelease: ({ nativeEvent }, gestureState) => {
        const event = this._transformEvent({ ...nativeEvent, gestureState });
        this._emit('touchend', event);
        this.props.onTouchesEnded(event);
      },
      onPanResponderTerminate: ({ nativeEvent }, gestureState) => {
        const event = this._transformEvent({ ...nativeEvent, gestureState });
        this._emit('touchcancel', event);

        this.props.onTouchesCancelled
          ? this.props.onTouchesCancelled(event)
          : this.props.onTouchesEnded(event);
      },
    });

  componentWillMount() {
    this._panResponder = this.buildGestures();
  }

  _emit = (type, props) => {
    if (window.document && window.document.emitter) {
      window.document.emitter.emit(type, props);
    }
  };

  _transformEvent = event => {
    event.preventDefault = event.preventDefault || (() => {});
    event.stopPropagation = event.stopPropagation || (() => {});
    return event;
  };

  render() {
    const { children, style, ...props } = this.props;
    return (
      <View {...props} style={[style]} {...this._panResponder.panHandlers}>
        {children}
      </View>
    );
  }
}
export default TouchableView;
