import { Component, ErrorInfo, createRef } from 'react';
import * as PIXI from 'pixi.js';
import { Stage, AppConsumer } from '@pixi/react';
import { GameScreen } from '../components/gamescreen/GameScreen';
import { LoadScreen } from '../components/loadscreen/LoadScreen';
import { InfoScreen } from '../components/infoscreen/InfoScreen';
import { BackgroundOverlay } from '../components/backgroundoverlay/BackgroundOverlay';
import { SnowfallOverlay } from '../components/snowfalloverlay/SnowfallOverlay';
import { PixiPlugin } from 'gsap/PixiPlugin';
import { gsap } from 'gsap';

/**
 * Register PixiPlugin in GSAP
 */
gsap.registerPlugin(PixiPlugin);
PixiPlugin.registerPIXI(PIXI);

/**
 * Get link to the document root node
 * wich used for auto-resizing canvas to the root node size
 * and getting initial width / height of the root node.
 */
const root = document.getElementById('root') as HTMLElement;

/**
 * Configuration for the Pixi Stage component
 */
const stageProps = {
  width: root.offsetWidth,
  height: root.offsetHeight,
  renderOnComponentChange: true,
  options: {
    antialias: true,
    backgroundColor: 0x1ECDAD,
    resolution: window.devicePixelRatio || 1,
    resizeTo: root
  }
};

/**
 * Main application class
 * Creates all layers and screens of the application
 * Working as mediator and gives ability to communicate
 * between screens using 'sendMessage' method.
 */
export default class App extends Component {

  /**
   * Store timeout index for smooth resizing of the window
   */
  timeout: number = 0;

  /**
   * List of subscribed callbacks of child screens
   */
  subscribers: Function[] = [];

  /**
   * Setup onResize listener when component mounted on the page
   */
  componentDidMount(): void {
    window.addEventListener('resize', this.resizeHandler);
  }

  /**
   * Remove onResize listener when component unmounted from the page
   */
  componentWillUnmount(): void {
    window.removeEventListener('resize', this.resizeHandler);
  }

  /**
   * Send Message used for communication between child components (screens)
   * Some of commands:
   * onResize - called when window was resized (child screens can resize themself if needed)
   * onReady - called when all assets was loaded (cause generating of the screen content)
   * showInfo - called when we want to show information screen
   * 
   * @param {string} command - unique name of the sending message
   * @param {any} info - additional information for the message
   */
  sendMessage = (command: string, info: any = null): void => {
    this.subscribers.map(f => f(command, info));
  }

  /**
   * Called from child components to register new callback for receiving messages
   * 
   * @param {Function} callback - callback method that will be called when messages appear
   */
  registerReceiver = (callback: Function): void => {
    this.subscribers.push(callback);
  }

  /**
   * Window resize handler with the timeout to skip intermediate events
   */
  resizeHandler = (): void => {
    clearTimeout(this.timeout);
    this.timeout = window.setTimeout(() => {
      this.sendMessage('onResize');
    }, 1000);
  }

  /**
   * Generate application content:
   * Stage - creates PIXI canvas
   * AppConsumer - gives us ability to pass app to the child screens
   * {@link BackgroundOverlay} - creates background gradient with smooth animation
   * {@link SnowfallOverlay} - creates falling snow effect
   * {@link GameScreen} - actually gameplay component
   * {@link LoadScreen} - displayed while preloading game assets and then will disapear
   * {@link InfoScreen} - screen contains the game information
   * 
   * Also here we pass 'sendMessage' and 'registerReceiver' methods
   * to child components, this gives ability to setup communication
   * betwwen child components (screens).
   * 
   * And also we pass 'app' link for acessing application from screens
   * (this is one of the solutions, there is another ways to achieve that).
   */
  render() {
    return (
      <Stage {...stageProps}>
        <AppConsumer>
          {(app) => (
            <>
              <BackgroundOverlay />
              <GameScreen
                sendMessage={this.sendMessage}
                registerReceiver={this.registerReceiver}
                app={app}
              />
              <LoadScreen
                sendMessage={this.sendMessage}
                registerReceiver={this.registerReceiver}
                app={app}
              />
              <InfoScreen
                sendMessage={this.sendMessage}
                registerReceiver={this.registerReceiver}
                app={app}
              />
              <SnowfallOverlay />
            </>
          )}
        </AppConsumer>
      </Stage>
    );
  }
  
}
