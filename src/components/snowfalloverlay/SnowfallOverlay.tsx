import { Component, createRef } from "react";
import { Container, withPixiApp, PixiRef } from "@pixi/react";
import { Application } from "pixi.js";
import { Emitter } from "@pixi/particle-emitter";
import snow from "./snow.svg";

/**
 * PIXI Particle Emitter v3 Configuration.
 * Snowfall particle effect made by myself, not generated or copied.
 */
export const SnowConfig = {
	lifetime: { min: 5, max: 20},
	frequency: 0.05,
	emitterLifetime: 0,
	maxParticles: 200,
	addAtBack: false,
	pos: { x: 0, y: 0},
	behaviors: [
    {
		  type: "alpha",
      config: {
        alpha: {
          list: [
            { value: .1, time: 0 },
            { value: 1, time: .5 },
            { value: 0, time: 1 }
          ]
        }
      }
		},
		{
		  type: "moveSpeedStatic",
      config: { min: 20, max: 50 }
		},
		{
		  type: "scaleStatic",
      config: { min: .2, max: 1 }
		},
		{
		  type: "rotationStatic",
      config: { min: 60, max: 120 }
		},
		{
      type: "textureRandom",
      config: {
        textures: [ snow ]
      }
		},
		{
      type: "spawnShape",
      config: {
        type: "rect",
        data: { x: 0, y: 0, w: window.innerWidth, h: window.innerHeight / 2 }
      }
		}
	]
};

/**
 * Link to the snowfall container, used by {@link pixi/particle-emitter}
 */
const containerRef = createRef<PixiRef<typeof Container>>();

/**
 * Component create container for snowfall and run cnfigured Emitter
 */
export const SnowfallOverlay = withPixiApp(class extends Component<{app: Application}> {

  /**
   * Contains configuret particles emitter
   */
  emitter: Emitter | null = null;

  /**
   * Add ticker when component attached to scene
   * Create and configure Emitter if id doesn't exist yet
   */
  componentDidMount() {
    this.props.app.ticker.add(this.tick);
    if (containerRef.current && ! this.emitter) {
      this.emitter = new Emitter(containerRef.current, SnowConfig);
    }
  }

  /**
   * Remove ticker if component removed from scene
   */
  componentWillAnmount() {
    this.props.app.ticker.remove(this.tick);
  }

  /**
   * Update event emitter on each frame render (See {@link PIXI.Application})
   * 
   * @param {number} delta
   */
  tick = (delta: number) => {
    if (this.emitter) {
      this.emitter.update(delta / 100);
    }
  };

  /**
   * Here we just create container for particles emitter.
   * "We" not because I have a split personality or there are many of us here,
   * thats because I imagine it like a dialogue with the reader
   * and tell what and how it works here.
   */
  render() {
    return <Container ref={containerRef}></Container>;
  }

});

// ANOTHER PARTICLES SOLUTION USING ParticleContainer, Batch and manual ticker
// Also works very well and doesn't require any other extensions.

// <ParticleContainer>
//   <Batch count={200} />
// </ParticleContainer>

// type ComponentProps = {
//   app: Application,
//   count: number
// };

// type SnowfallState = {
//   items: any[],
//   count: number
// };

// const Snow = ({...props}) => (
//   <Sprite {...props} image={snow} anchor={0.5} />
// )

// const Batch = withPixiApp(class extends Component<ComponentProps> {
//   time = 0
//   bounds: any = null
//   state = { items: [], count: 0, component: null }

//   componentDidMount() {
//     const padding = 100

//     this.bounds = new PIXI.Rectangle(
//       -padding,
//       -padding,
//       this.props.app.screen.width + padding * 2,
//       this.props.app.screen.height + padding * 2
//     )

//     this.props.app.ticker.add(this.tick)
//   }

//   componentWillUnmount() {
//     this.props.app.ticker.remove(this.tick)
//   }

//   componentDidUpdate(): void {
//     if (this.props.count === this.state.count) {
//       return;
//     }

//     const array:any = [...new Array(this.props.count)].map(() => ({
//       speed: (2 + Math.random() * 2) * 0.2,
//       offset: Math.random() * 100,
//       turningSpeed: Math.random() - 0.8,
//       direction: Math.random() * Math.PI / 2,
//       alpha: Math.random(),
//       // tint: Math.random() * 0x111111,
//       x: Math.random() * this.props.app.screen.width,
//       y: Math.random() * this.props.app.screen.height,
//       _s: 0.8 + Math.random() * 0.3,
//       scale: 0.8 + Math.random() * 0.3,
//       rotation: 0,
//     }));

//     this.state.count = this.props.count;
//     this.state.items = array;
//   }

//   tick = () => {
//     this.setState(
//       (state:SnowfallState) => ({
//         items: state.items.map(item => {
//            let newItem = {
//              scale: item._s + Math.sin(this.time / 2) * 0.2,
//              x: item.x + Math.sin(item.direction) * (item.speed * item._s),
//              y: item.y + (item.speed * item._s),
//              rotation: -item.direction + Math.PI,
//              direction: item.direction + item.turningSpeed * 0.01,
//           }

//           if (newItem.x < this.bounds.x) {
//             newItem.x += this.bounds.width
//           } else if (newItem.x > this.bounds.x + this.bounds.width) {
//             newItem.x -= this.bounds.width
//           }

//           if (newItem.y < this.bounds.y) {
//             newItem.y += this.bounds.height
//           } else if (newItem.y > this.bounds.y + this.bounds.height) {
//             newItem.y -= this.bounds.height
//           }

//           return { ...item, ...newItem }
//         })
//       })
//     )

//     this.time += 0.1
//   }

//   render() {
//     return this.state.items.map((props: any, i) => <Snow key={i} {...props} />)
//   }
// })