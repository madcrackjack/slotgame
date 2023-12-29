import { Component, createRef } from "react";
import { Container, withPixiApp, PixiRef } from "@pixi/react";
import { Application } from "pixi.js";
import { Emitter } from "@pixi/particle-emitter";

/**
 * Create Ref on the emitter container, where particles will be placed.
 */
const containerRef = createRef<PixiRef<typeof Container>>();

/**
 * PIXI Particle Emitter v3 Configuration.
 * Blowing snows effect, made by myself, not copy-paste.
 */
export const BlowConfig = {
	lifetime: { min: .6, max: .6 },
	frequency: 0.001,
	emitterLifetime: .5,
	maxParticles: 30,
	addAtBack: false,
	pos: { x: 20, y: 20 },
	behaviors: [
    {
		  type: "alpha",
      config: {
        alpha: {
          list: [
            { value: 1, time: 0 },
            { value: 0, time: 1 }
          ]
        }
      }
		},
		{
		  type: "moveSpeedStatic",
      config: { min: 10, max: 80 }
		},
		{
		  type: "scaleStatic",
      config: { min: .1, max: .3 }
		},
		{
		  type: "rotationStatic",
      config: { min: 0, max: 360 }
		},
		{
      type: "textureRandom",
      config: {
        textures: [ 'snowA', 'snowB' ]
      }
		},
		{
      type: "spawnShape",
      config: {
        type: "rect",
        data: { x: -5, y: -5, w: 10, h: 10 }
      }
		}
	]
};

/**
 * Properties accepted by the {@link EffectsOverlay} 
 * 
 * @param {Application} app - link on the PIXI Application
 * @param {PixiRef} ref - link of the component to access it from outside
 */
type containerProps = {
  app: Application,
  ref?: any
};

/**
 * This component create layer with visual effect.
 * It used by {@link PlayDesk} component.
 * To create effect we need to call 'addEffect' method
 */
export const EffectsOverlay = withPixiApp(class extends Component<containerProps> {

  // emitter: Emitter[] = [];

  /**
   * Create and play new effect in selected position
   * emitter will selfdestroy after playback.
   * 
   * @param {number} x - x position of the effect
   * @param {number} y - y position of the effect
   * @param {'snow' | 'star'} type - effect type (implemented only 'snow' at the moment)
   */
  addEffect(x: number, y: number, type:('snow' | 'star')): void {
    if (containerRef.current) {
      let config = type == 'snow' ? BlowConfig : BlowConfig;
      config.pos = { x, y };
      const emitter = new Emitter(containerRef.current, config);
      emitter.playOnceAndDestroy();
    }
  }

  // componentDidMount() {
  //   this.props.app.ticker.add(this.tick);
  // }

  // componentWillAnmount() {
  //   this.props.app.ticker.remove(this.tick);
  // }

  // tick = (delta: number) => {
  //   this.emitter.forEach(e => e.update(delta / 100));
  // }

  /**
   * Here we just create container for the particle emitter
   */
  render() {
    return <Container ref={containerRef}></Container>;
  }

});