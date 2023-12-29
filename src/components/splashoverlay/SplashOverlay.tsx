import { Component, createRef } from "react";
import { Container, Text, withPixiApp, PixiRef } from "@pixi/react";
import { Application, TextStyle } from "pixi.js";
import { gsap } from 'gsap';

/**
 * Create PixiRef for overlay container, used for animation purposes
 */
const containerRef = createRef<PixiRef<typeof Container>>();

/**
 * Configure text splashed over the screen
 * See {@link Text}
 */
const simpleTextProps = {
  anchor: .5,
  scale: .5,
  style: new TextStyle({
    fontFamily: 'Share Tech Mono',
    fontSize: 40,
    letterSpacing: -5,
    fill: '#5A441A',
    stroke: '#ffffff',
    strokeThickness: 6
  })
};

/**
 * Describes type for the messages accepted by the {@link SplashOverlay}
 */
export type SplashMessages = {
  id: number,
  type: 'simple',
  message: string
};

/**
 * Describes properties accepted by the {@link SplashOverlay}
 */
type SplashProps = {
  app: Application,
  ref?: any,
  messages: SplashMessages[]
};

/**
 * Component receives messages and display them over the screen
 */
export const SplashOverlay = withPixiApp(class extends Component<SplashProps> {

  /**
   * Animate layer after updating
   */
  componentDidUpdate() {
    if (containerRef.current) {
      gsap.fromTo(containerRef.current,
        { pixi: { y: 0, alpha: 1 } },
        { pixi: { y: -40, alpha: 0 }, duration: 2 });
    }
  }

  /**
   * Format price 1000000.00 in readable look 1,000,000.00
   * The only thing that was honestly copied from the stackoverflow in a few seconds,
   * which is faster than writing it yourself, it would have taken a couple of minutes to me.
   * 
   * @param {number | string} price - original price
   * @returns {string} formated price
   */
  formatePrice(price: number | string) {
    return Number(price).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  /**
   * Generate component content and all displayed messages
   */
  render() {
    return <Container ref={containerRef}>
      {this.props.messages.map((m, index) => {
        return (
          <Container x={Math.random()*150+100} y={Math.random()*100+100} key={m.id + '-' + index}>
            <Text {...simpleTextProps} text={'+'+this.formatePrice(m.message)} />
          </Container>
        );
      })}
    </Container>;
  }

});