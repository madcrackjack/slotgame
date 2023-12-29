import { Component, createRef } from 'react';
import { PixiRef, withPixiApp, Container } from '@pixi/react';
import { Application } from 'pixi.js';
import { Gradient } from '../gradient/Gradient';
import { gsap } from 'gsap';

/**
 * Creare PIXI Container ref type
 */
type ContainerRef = PixiRef<typeof Container>;

/**
 * Create ref variables for child gradients
 * we need that for smooth animation of the gradients.
 */
const gradientA = createRef<ContainerRef>();
const gradientB = createRef<ContainerRef>();

/**
 * This components generate background gradients and then animate thair movement
 */
export const BackgroundOverlay = withPixiApp(class extends Component<{app: Application}> {

  /**
   * Setup looped animation when component attached to the document
   */
  componentDidMount(): void {
    const height = this.props.app.screen.height;
    if (gradientA.current) {
      gsap.timeline({ repeat: -1 })
        .to(gradientA.current, { duration: 10, y: height })
        .to(gradientA.current, { duration: 10, y: 0 });
    }
    if (gradientB.current) {
      gsap.timeline({ repeat: -1 })
        .to(gradientB.current, { duration: 15, y: height })
        .to(gradientB.current, { duration: 15, y: 0 });
    }
  }

  /**
   * Remove animation when component detached
   */
  componentWillUnmount(): void {
    gsap.killTweensOf(gradientA.current);
    gsap.killTweensOf(gradientB.current);
  }

  /**
   * Configure and output two large radial gradients
   * light-blue on the left side and ligh-yellow on the right side.
   * See {@link Gradient} component for details.
   */
  render() {
    const { width: size } = this.props.app.screen;

    /**
     * 
     */
    const double = size * 2;
    
    /**
     * Light-blue radial gradient placed in the top-left corner
     */
    const radialGradientPropsA = {
      x: -size,
      y: -size,
      width: double,
      height: double,
      gradient: {
        x0: size, y0: size, x1: size, y1: size, r0: 0, r1: size,
        colorStops: [
          { color: 'rgba(43, 205, 240, 1)', offset: 0 },
          { color: 'rgba(43, 205, 240, 0)', offset: 1 }
        ]
      }
    };

    /**
     * Light-yellow radial gradient placed in the top-right corner
     */
    const radialGradientPropsB = {
      x: 0,
      y: -size,
      width: double,
      height: double,
      gradient: {
        x0: size, y0: size, x1: size, y1: size, r0: 0, r1: size,
        colorStops: [
          { color: 'rgba(244, 244, 184, 1)', offset: 0 },
          { color: 'rgba(244, 244, 184, 0)', offset: 1 }
        ]
      }
    };

    return (
      <>
        <Container ref={gradientA}>
          <Gradient {...radialGradientPropsA} width={double} height={double} />
        </Container>
        <Container ref={gradientB}>
          <Gradient {...radialGradientPropsB} width={double} height={double} />
        </Container>
      </>
    );

  }
  
});