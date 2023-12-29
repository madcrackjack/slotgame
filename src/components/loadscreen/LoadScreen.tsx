import { Component, createRef } from 'react';
import { Container, Text, Sprite, Graphics, PixiRef, AppConsumer } from '@pixi/react';
import { Application, TextStyle, Assets } from 'pixi.js';
import { GameAssets } from '../../config/assets';
import { Gradient } from '../gradient/Gradient';
import { gsap } from 'gsap';

/**
 * Types describes used in this component PixiRef's
 */
type ISprite = PixiRef<typeof Sprite>;
type IGraphics = PixiRef<typeof Graphics>;
type IContainer = PixiRef<typeof Container>;

/**
 * Create refs for internal elements
 * containerRef - root screen container used for disapear screen after loading assets
 * backgroundRef - background pine shape disapear after loading
 * progressRef - growing white pine shape animated while loading
 * maskRef - used for circle collapse animation of the "progress bar" (white pine inour case)
 */
const containerRef = createRef<IContainer>();
const backgroundRef = createRef<ISprite>();
const progressRef = createRef<ISprite>();
const maskRef = createRef<IGraphics>();

/**
 * Configuration of the white background radial gradient under the pine
 * See mine {@link Gradient} component for details
 */
const radialGradientProps = {
  x: -240,
  y: -240,
  width: 480,
  height: 480,
  gradient: {
    x0: 240, y0: 240, r0: 0, x1: 240, y1: 240, r1: 240,
    colorStops: [
      { color: 'rgba(255, 255, 255, .4)', offset: 0 },
      { color: 'rgba(255, 255, 255, 0)', offset: 1 }
    ]
  }
};

/**
 * Configuration of the "LOADING" text under white pine
 * See {@link Text}
 */
const textProps = {
  y: 80,
  text: 'LOADING',
  anchor: .5,
  scale: .5,
  isSprite: true,
  style: new TextStyle({
    fontSize: 24,
    fill: '#ffffff'
  })
};

/**
 * Configuration of the progress bar mask (used for filling white pine)
 * See {@link Graphics}
 */
const maskProps = {
  x: 0,
  y: 120,
  ref: maskRef,
  alpha: .01,
  preventRedraw: true,
  draw: (g: IGraphics) => {
    g.clear().beginFill(0xffffff).drawCircle(0, 0, 60).endFill();
  }
};

/**
 * Configuration of the "pine shape" spire
 * See {@link Sprite}
 */
const backgroundProps = {
  image: 'loadBackground',
  anchor: 0.5,
  ref: backgroundRef
};

/**
 * Configuration of the "white pine progress bar" spire
 * See {@link Sprite}
 */
const progressProps = {
  image: 'loadProgress',
  anchor: 0.5,
  width: 80,
  height: 120,
  ref: progressRef
};

/**
 * Properties accepted by the {@link LoadScreen} component
 * 'registerReceiver' and 'sendMessage' methods implemented in the parent {@link App} component
 * 
 * @param {Application} app - link on the PIXI Application
 * @param {Function} registerReceiver - method used for subscribe callback on global messages
 * @param {Function} sendMessage - this method will send command to the all subscribed component
 */
type LoadProps = {
  app: Application,
  registerReceiver: Function,
  sendMessage: Function
};

/**
 * Type descripes {@link LoadScreen} component state
 * 
 * @param {boolean} progressive - indicates that we already preloaded assets for loading screen and can show now animated loading progress
 * @param {number} progress - current loading progress from 0 to 1
 * @param {boolean} ready - indicates that assets have been loaded
 */
type LoadState = {
  progressive: boolean,
  progress: number,
  ready: boolean
};

/**
 * Component will create loading screen, init loading assets and display loading progress
 * See {@link LoadProps} for information about accepted params
 */
export class LoadScreen extends Component<LoadProps> {

  /**
   * Initial component state
   * See {@link LoadState} for details
   */
  state: LoadState = {
    progressive: false,
    progress: 0,
    ready: false
  };

  /**
   * Constructor will setup global messages callback
   * See {@link App} for details
   * 
   * @param {LoadProps} props 
   */
  constructor(props: LoadProps) {
    super(props);
    props.registerReceiver((command: string, params: any) => this.onMessage(command, params));
  }

  /**
   * Method called when messages received from other screens through App component
   * 
   * @param {string} command - command name fired by other screen
   * @param {any} params - additional params for the command (optional)
   */
  onMessage(command: string, params: any) {
    switch (command) {
      case 'onResize':
        this.forceUpdate();
      break;
    }
  }

  /**
   * Start loading assets when component is attached to page
   * After loading run disapear animation and call onReady message for all screens
   */
  componentDidMount(): void {
    if ( ! this.state.ready) {
      this.loadAssets()
        .then(() => this.animateDisapear())
        .then(() => this.props.sendMessage('onReady'));
    }
  }

  /**
   * Stop all animation if component removed from page
   */
  componentWillUnmount(): void {
    gsap.killTweensOf(maskRef.current);
    gsap.killTweensOf(containerRef.current);
  }

  /**
   * Async init loading game assets in two steps
   * First of all we are going to load assets required for LoadScreen.
   * After that we are loading all other assets for GameScreen and show loading progress.
   */
  async loadAssets(): Promise<void> {
    await Assets.init(GameAssets);
    await Assets.loadBundle('load');
    this.setState({ progressive: true });
    await Assets.loadBundle('game', (progress: number) => {
      gsap.to(maskRef.current, { y: 120 * (1 - progress), duration: .2})
    });
    this.setState({ ready: true });
  }

  /**
   * Async animate disapear of the loading screen
   * 
   * @returns {Promise}
   */
  animateDisapear(): Promise<boolean> {
    return new Promise((resolve) => {
      gsap.timeline()
        .to(maskRef.current, { y: 0, duration: .4, onComplete: () => {
          backgroundRef.current!.mask = maskRef.current;
        }})
        .to(maskRef.current, {
          duration: 1,
          pixi: { scale: 0 },
          onComplete: () => {
            resolve(true);
          }
        })
        .to(containerRef.current, {
          duration: 1,
          pixi: { alpha: 0 },
          onComplete: () => {
            containerRef.current!.visible = false
          }
        });
    });
  }

  /**
   * Generate screen contant based on app container sizes
   */
  render() {
    const { width, height } = this.props.app.screen;
    const position: [number, number] = [width / 2, height / 2];

    return (
      <Container position={position} ref={containerRef}>
        <Gradient {...radialGradientProps} />
        <Text {...textProps} />
        <Graphics {...maskProps} />
        {
          this.state.progressive
            ?
              <>
                <Sprite {...backgroundProps} />
                <Sprite {...progressProps} mask={maskRef.current} />
              </>
            :
              <></>
        }
      </Container>
    );

  }
  
}