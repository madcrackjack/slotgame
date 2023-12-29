import { Component, createRef } from 'react';
import { Container, Sprite, Text, PixiRef } from '@pixi/react';
import { TextStyle } from 'pixi.js';
import { gsap } from 'gsap';

/**
 * Types describes PixiRef's used in this component
 */
type SpriteRef = PixiRef<typeof Sprite>;
type TextRef = PixiRef<typeof Text>;

/**
 * playButtonRef - link on the play button sprite
 * turboButtonRef - link on the turbo button sprite
 * playTextRef - link on the play button description text
 * turboTextRef - link on the turbo button description text
 */
const playButtonRef = createRef<SpriteRef>();
const turboButtonRef = createRef<SpriteRef>();
const playTextRef = createRef<TextRef>();
const turboTextRef = createRef<TextRef>();

/**
 * Configuration of the play button
 * See {@link Sprite}
 */
const buttonActive = {
  y: 60,
  width: 320,
  height: 320,
  anchor: .5,
  alpha: 0,
  image: 'buttonActive',
  ref: playButtonRef
};

/**
 * Configuration of the turbo "button"
 * See {@link Sprite}
 */
const buttonTurbo = {
  y: 60,
  width: 120,
  height: 120,
  anchor: .5,
  alpha: 0,
  image: 'buttonTurbo',
  ref: turboButtonRef
};

/**
 * Configuration of the play button description
 * See {@link Text}
 */
const playTextProps = {
  y: 150,
  text: "Tap to Spin\nor Hold for Turbo-Spin",
  anchor: .5,
  scale: .5,
  alpha: 0,
  isSprite: true,
  ref: playTextRef,
  style: new TextStyle({
    align: 'center',
    fontFamily: 'Share Tech Mono',
    fontSize: 24,
    fill: '#CE2D0A'
  })
};

/**
 * Configuration of the turbo button description
 * See {@link Text}
 */
const turboTextProps = {
  y: 150,
  text: "Turbo-Spin is Active\nRelease to Stop",
  anchor: .5,
  scale: .5,
  alpha: 0,
  isSprite: true,
  ref: turboTextRef,
  style: new TextStyle({
    align: 'center',
    fontFamily: 'Share Tech Mono',
    fontSize: 24,
    fill: '#CE2D0A'
  })
};

/**
 * Type describes {@link PlayButton} state
 */
type StateProps = {
  status: 'idle' | 'active' | 'turbo',
  top: number,
  onStartTurbo: Function,
  onStopTurbo: Function,
  onClickSpin: Function
};

/**
 * Component create large button over the {@link PlayDesk}
 * And add smooth transition between component states
 */
export class PlayButton extends Component<StateProps> {

  /**
   * Timeout used for clear "hold play button" event 
   */
  timeout: number = 0;

  /**
   * Smooth snow up play button with description
   */
  showPlayButton(): void {
    gsap.to(playButtonRef.current, {
      duration: .4,
      pixi: { alpha: 1 }
    });
    gsap.fromTo(playTextRef.current, {
      pixi: { alpha: 0, y: 180 }
    }, {
      duration: 1,
      pixi: { alpha: 1, y: 150 }
    });
  }

  /**
   * Smooth hide play button and description
   */
  hidePlayButton(): void {
    gsap.to(playButtonRef.current, {
      duration: .4,
      pixi: { alpha: 0 }
    });
    gsap.fromTo(playTextRef.current, {
      pixi: { alpha: 1, y: 150 }
    }, {
      duration: 1,
      pixi: { alpha: 0, y: 120 }
    });
  }

  /**
   * Smooth snow up turbo button with description
   */
  showTurboButton(): void {
    gsap.to(turboButtonRef.current, {
      duration: .4,
      pixi: { alpha: 1 }
    });
    gsap.fromTo(turboTextRef.current, {
      pixi: { alpha: 0, y: 180 }
    }, {
      duration: 1,
      pixi: { alpha: 1, y: 150 }
    });
  }

  /**
   * Smooth hide turbo button and description
   */
  hideTurboButton(): void {
    gsap.to(turboButtonRef.current, {
      duration: .4,
      pixi: { alpha: 0 }
    });
    gsap.fromTo(turboTextRef.current, {
      pixi: { alpha: 1, y: 150 }
    }, {
      duration: 1,
      pixi: { alpha: 0, y: 120 }
    });
  }

  /**
   * Select wich animation should be played
   * dependent on the new component state and previous component state
   */
  componentDidUpdate(prevProps: Readonly<StateProps>): void {
    const newStatus = this.props.status;
    const oldStatus = prevProps.status;
    if (oldStatus == 'idle' && newStatus == 'active') {
      this.showPlayButton();
    }
    else if (oldStatus == 'turbo' && newStatus == 'idle') {
      this.hideTurboButton();
    }
    else if (oldStatus == 'turbo' && newStatus == 'active') {
      this.hideTurboButton();
      this.showPlayButton();
    }
    else if (oldStatus == 'active' && newStatus == 'idle') {
      this.hidePlayButton();
    }
    else if (oldStatus == 'active' && newStatus == 'turbo') {
      this.hidePlayButton();
      this.showTurboButton();
    }
  }

  /**
   * Called when user press on the button
   */
  playButtonDown = (): void => {
    if (this.props.status != 'active') return;
    this.timeout = window.setTimeout(() => this.props.onStartTurbo(), 1000);
  }
  
  /**
   * Called when user release the button
   */
  playButtonUp = (): void => {
    clearTimeout(this.timeout);
    if (this.props.status == 'turbo') {
      this.props.onStopTurbo();
    }
    if (this.props.status == 'active') {
      this.props.onClickSpin();
    }
  }
  
  /**
   * Generate component content and pass callbacks to the container element
   */
  render() {
    const containerProps = {
      y: this.props.top,
      interactive: true,
      cursor: this.props.status == 'active' ? 'pointer' : '',
      pointerdown: this.playButtonDown,
      pointerup: this.playButtonUp
    };
    return (
        <Container {...containerProps} >
          <Sprite {...buttonTurbo} />
          <Sprite {...buttonActive} />
          <Text {...turboTextProps} />
          <Text {...playTextProps} />
        </Container>
    );

  }
  
}