import { Component, createRef } from 'react';
import { Container, Graphics, Text, Sprite, PixiRef } from '@pixi/react';
import { Application, TextStyle } from 'pixi.js';
import { gsap } from 'gsap';

/**
 * Types describes Graphics and Container PixiRef's
 */
type GraphicsRef = PixiRef<typeof Graphics>;
type ContainerRef = PixiRef<typeof Container>;

/**
 * Variable contains information container ref used by {@link InfoScreen}
 * used for animation of the container appear and disappear.
 */
const infoRef = createRef<ContainerRef>();

/**
 * Type describes displayed in the help screen items
 * 
 * @param {number} x - left position of the item block
 * @param {number} y - top position of the item block
 * @param {string} image - item sprite image
 * @param {string} text - item text description
 */
type ItemProps = {
  x: number,
  y: number,
  image: string,
  text: string
};

/**
 * Configuration of the help screen information (game item images and descriptions)
 * See {@link ItemProps}
 */
const infoItems:ItemProps[] = [
  { x: 10, y: 60, image: 'item0', text: "4 = x6\n5 = x10\n6 = x200" },
  { x: 75, y: 60, image: 'item1', text: "8-9 = x20\n10-11 = x50\n12+ = x100" },
  { x: 140, y: 60, image: 'item4', text: "8-9 = x2\n10-11 = x4\n12+ = x20" },
  { x: 205, y: 60, image: 'item5', text: "8-9 = x2\n10-11 = x4\n12+ = x20" },
  { x: 270, y: 60, image: 'item6', text: "8-9 = x2\n10-11 = x4\n12+ = x20" },
  { x: 10, y: 160, image: 'item2', text: "8-9 = x6\n10-11 = x20\n12+ = x60" },
  { x: 75, y: 160, image: 'item3', text: "8-9 = x4\n10-11 = x10\n12+ = x30" },
  { x: 140, y: 160, image: 'item7', text: "8-9 = x1\n10-11 = x2\n12+ = x10" },
  { x: 205, y: 160, image: 'item8', text: "8-9 = x1\n10-11 = x2\n12+ = x10" },
  { x: 270, y: 160, image: 'item9', text: "8-9 = x1\n10-11 = x2\n12+ = x10" }
];

/**
 * Configuration of the help screen title
 * See {@link Text} component for details
 */
const titleTextProps = {
  x: 170,
  y: 30,
  text: 'GAME INFORMATION',
  anchor: .5,
  scale: .5,
  style: new TextStyle({
    fontFamily: 'Share Tech Mono',
    fontSize: 44,
    fill: '#C17D2E'
  })
};

/**
 * Configuration of the model screen close message
 * See {@link Text} component for details
 */
const closeMessageProps = {
  x: 170,
  y: 290,
  text: 'Click anywhere to close',
  anchor: .5,
  scale: .5,
  style: new TextStyle({
    fontFamily: 'Share Tech Mono',
    fontSize: 32,
    fill: '#ffffff'
  })
};

/**
 * Configuration of the modal background
 * See {@link Graphics} component for details
 */
const bodyBackgroundProps = {
  width: 340,
  height: 270,
  preventRedraw: true,
  draw: (g: GraphicsRef) => {
    g.clear()
      .beginFill(0xffead2)
      .lineStyle(2, 0xc17d2e, 1)
      .drawRoundedRect(0, 0, 340, 270, 10)
      .endFill();
  }
};

/**
 * Type describes properties accepted by the {@link InfoScreen} component
 * 'registerReceiver' and 'sendMessage' methods implemented in the parent {@link App} component
 * 
 * @param {Application} app - link on the PIXI Application
 * @param {Function} registerReceiver - method used for subscribe callback on global messages
 * @param {Function} sendMessage - this method will send command to the all subscribed component
 */
type InfoProps = {
  app: Application,
  registerReceiver: Function,
  sendMessage: Function
};

/**
 * Component will create and show up game information modal window
 */
export class InfoScreen extends Component<InfoProps> {

  /**
   * Initial component state
   * 
   * @param {boolean} visible - indicates that component should be visible at the moment
   * @param {boolean} ready - indicates that game assets were loaded and we can generate component content
   */
  state = {
    visible: false,
    ready: false
  }

  /**
   * Constructor will setup global messages callback
   * See {@link App} for details
   * 
   * @param {InfoProps} props 
   */
  constructor(props: InfoProps) {
    super(props);
    props.registerReceiver((command: string, params: any) => this.onMessage(command, params));
  }

  /**
   * Method called when messages received from other screens through App component
   * 
   * @param {string} command - command name fired by other screen
   * @param {any} params - additional params for the command (optional)
   */
  onMessage(command: string, params: any): void {
    switch (command) {
      case 'onReady':
        this.setState({ ready: true });
      break;
      case 'onResize':
        this.forceUpdate();
      break;
      case 'showInfo':
        this.showInfo();
      break;
    }
  }

  /**
   * Smooth show information modal
   */
  showInfo(): void {
    this.setState({ visible: true });
    if (infoRef.current) {
      gsap.fromTo(infoRef.current,
        { pixi: { alpha: 0, visible: true } },
        { pixi: { alpha: 1 }, duration: 1 });
    }
  }

  /**
   * Smooth hide information modal
   */
  hideInfo(): void {
    if (infoRef.current) {
      gsap.to(infoRef.current, { pixi: { alpha: 0 }, duration: 1, onComplete: () => {
        this.setState({ visible: false })
      } });
    }
  }

  /**
   * Generate component content (if assets were loaded)
   * Content of the modal will be scaled with a factor between 1 and 2 for large screens
   */
  render() {
    const { width, height } = this.props.app.screen;
    const scale = Math.max(1, Math.min(2, Math.min(width, height) / 360));

    /**
     * Configuration of the black background overlay
     * See {@link Graphics} for details
     */
    const overlayProps = {
      x: 0,
      y: 0,
      width,
      height,
      // preventRedraw: false,
      draw: (g: GraphicsRef) => {
        g.clear().beginFill([0,0,0,.8]).drawRect(0, 0, 100, 100).endFill();
      }
    };

    /**
     * Configuration of the root container which used for smooth appear/disappear of screen
     * also catch onclick event for closing info modal
     * See {@link Container} for details
     */
    const rootContainerProps = {
      ref: infoRef,
      visible: this.state.visible,
      cursor: 'pointer',
      interactive: true,
      onpointerup: () => this.hideInfo()
    };

    /**
     * Configuration of the positioning container
     */
    const alignContainerProps = {
      scale,
      x: (width - 340 * scale) / 2,
      y: (height - 270 * scale) / 2
    };

    return (
      this.state.ready
        ?
          <Container {...rootContainerProps}>
            <Graphics {...overlayProps} />
            <Container {...alignContainerProps}>
              <Graphics {...bodyBackgroundProps} />
              {infoItems.map((itemInfo, index) => <HelpItem key={index} {...itemInfo} />)}
              <Text {...titleTextProps} />
              <Text {...closeMessageProps} />
            </Container>
          </Container>
        :
          <></>
    );
  }

}

/**
 * Component draws help screen single item
 */
class HelpItem extends Component<ItemProps> {

  /**
   * Generate component contents based on the passed {@link ItemProps}
   */
  render() {
    const { x, y, image, text} = this.props;

    /**
     * Configuration of the help item image
     * See {@link Sprite} for details
     */
    const spriteProps = {
      x: 10,
      width: 40,
      height: 40,
      image
    };

    /**
     * Configuration of the help item description
     * See {@link Text} for details
     */
    const textProps = {
      x: 30,
      y: 45,
      anchor: { x: .5, y: 0 },
      scale: .5,
      text,
      style: new TextStyle({
        align: 'center',
        fontFamily: 'Share Tech Mono',
        letterSpacing: -2,
        fontSize: 20,
        lineHeight: 30,
        fill: '#C17D2E',
      })
    };

    return (
      <Container x={x} y={y}>
        <Sprite {...spriteProps} />
        <Text {...textProps} />
      </Container>
    );
  }

}