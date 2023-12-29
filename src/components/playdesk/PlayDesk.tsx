import { Component, createRef } from 'react';
import { Container, Graphics, Sprite, NineSlicePlane, PixiRef } from '@pixi/react';
import { RoundInfo } from '../gameservice/GameService';
import { DeskItem } from '../deskitem/DeskItem';
import { EffectsOverlay } from '../effectsoverlay/EffectsOverlay';
import { SplashOverlay } from '../splashoverlay/SplashOverlay';

/**
 * Types describes PixiRef's used in this component
 */
type GraphicsRef = PixiRef<typeof Graphics>;
type EffectsRef = PixiRef<typeof EffectsOverlay>;
type SplashRef = PixiRef<typeof SplashOverlay>;

/**
 * Variables contains Ref's to the child elements
 * maskRef - used for hide desk items outside of the desk
 * effectsRef - {@link EffectsOverlay} used for adding blow effects
 * splashRef - {@link SplashOverlay} used for splash messages over play desk
 */
const maskRef = createRef<GraphicsRef>();
const effectsRef: any = createRef<EffectsRef>();
const splashRef: any = createRef<SplashRef>();

/**
 * Configuration of the play desk header sprite
 * See {@link Sprite}
 */
const deskTitle = {
  y: 20,
  width: 320,
  height: 60,
  anchor: { x: .5, y: 0 },
  image: 'deskTitle'
};

/**
 * Describes {@link PlayDesk} accepted properties
 * 
 * @param {Function} onReady - called when desk complete all items animations
 * @param {Function} onBlow - called when all items of current round was blowed
 * @param {RoundInfo} round - current round information which used for generating desk scene
 * @param {number} scale - scale coefficient of the desk for adaptive design
 * @param {boolean} turbo - indicates what all animation should be quicker
 * @param {boolean} clear - indicates what scene should be cleared before displaying new items
 */
type DeskProps = {
  onReady: Function,
  onBlow: Function,
  round: RoundInfo,
  scale: number,
  turbo: boolean,
  clear: boolean
};

/**
 * Generate play desk based on the current {@link RoundInfo} info
 */
export class PlayDesk extends Component<DeskProps> {

  /**
   * Increased when items complete their animations and clears when new items displayed
   */
  itemsReady: number = 0;

  /**
   * Increased when items are blowing and cleares when new items displayed
   */
  itemsBlowed: number = 0;

  /**
   * Remember last desk items, used for figure out if item was replaced in new round
   */
  itemsState: (number | null)[] = [];

  /**
   * empty round information used for initial state when we don't have any real round info yet
   */
  emptyInfo: RoundInfo = {
    id: 0,
    bid: 0,
    info: {
      reward: 0,
      profit: 0,
      balance: 0
    },
    show: [],
    blow: [],
    math: {},
    move: {},
    last: []
  };

  state = {
    messages: []
  };

  /**
   * Check if we need to update component
   * We updating this component only if we get new round information
   * 
   * @param {DeskProps} nextProps - new properties passed to this component
   * @returns {boolean} true if we need to update component
   */
  shouldComponentUpdate(nextProps: Readonly<DeskProps>): boolean {
    return this.props.round?.id != nextProps.round?.id;
  }

  /**
   * Called whin child items complete their animation
   * When all (30) animations complete, we calling onReady callback of {@link GameScreen}
   */
  onItemReady = () => {
    if ( ++this.itemsReady >= 30 ) {
      this.itemsBlowed = 0;
      this.props.onReady();
    }
  }

  /**
   * Called when child item was blowed and we need to show some visual effect
   * Visual effect displayed in the other layer in {@link EffectsOverlay} component
   * When all items of current round was blowed we call onBlow callback of the {@link GameScreen}
   * 
   * @param {number} x - x position of the blown item 
   * @param {number} y - y position of the blown item
   */
  onItemBlow = (x: number, y: number) => {
    const round: RoundInfo = this.props.round;
    effectsRef.current.addEffect(x, y, 'snow');
    if (++this.itemsBlowed == round.blow.length) {
      this.props.onBlow();
      const messages = Object.values(round.math).map(
        reward => ({ type: 'simple', message: reward * round.bid, id: round.id }));
      this.setState({ messages });
    }
  }

  /**
   * Generate component elements based on the received properties and scale factor
   */
  render() {
    const round: RoundInfo = this.props.round || this.emptyInfo;
    const { show, blow, move, last } = round;
    const { clear, turbo } = this.props;
    const deskScale = this.props.scale;
    const lastItemsState = this.itemsState;
    const time = +new Date();
    const messages = this.state.messages;

    this.itemsState = last;
    this.itemsReady = 0;
    this.state.messages = [];

    /**
     * Configuration of the sprite with bold red borders
     * See {@link NineSlicePlane} component for details
     */
    const borderProps = {
      x: -150 * deskScale - 40,
      y: 40,
      leftWidth: 100,
      topHeight: 60,
      rightWidth: 100,
      bottomHeight: 100,
      width: 600 * deskScale + 160,// (300 + 40 + 40) x 2
      height: 500 * deskScale + 120,// (250 + 40 + 20) x 2
      scale: .5,
      image: 'deskBorders',
    };

    /**
     * Configuration of the desk grid sprite
     * See {@link Sprite}
     */
    const gridProps = {
      x: -150 * deskScale,
      y: 60,
      width: 300 * deskScale,
      height: 250 * deskScale,
      image: 'deskGrid'
    };

    /**
     * Configuration of the mask which hide items outsed of the desk
     * See {@link Graphics}
     */
    const deskMask = {
      x: -150 * deskScale,
      y: 60,
      alpha: .01,
      ref: maskRef,
      scale: deskScale,
      preventRedraw: true,
      draw: (g: GraphicsRef) => {
        g.clear().beginFill(0xffffff).drawRect(0, 0, 300, 250).endFill();
      }
    };

    /**
     * Aligned and scaled root container
     */
    const containerProps = {
      x: -150 * deskScale,
      y: 60,
      scale: deskScale
    };

    return (
      <Container>
        <NineSlicePlane {...borderProps}/>
        <Sprite {...gridProps} />
        <Graphics {...deskMask} />
        <Container {...containerProps} mask={maskRef.current}>
          {show.map((item, i) => {
            const itemProps = {
              onReady: this.onItemReady,
              onBlow: this.onItemBlow,
              key: i,
              row: i % 5,
              line: Math.floor(i / 5),
              type: item,
              blow: blow.includes(i),
              move: move[i] % 5,
              swap: lastItemsState[i] != item,
              clear,
              turbo,
              time
            };
            return <DeskItem {...itemProps} />
          })}
        </Container>
        <Container {...containerProps}>
          <EffectsOverlay ref={effectsRef} />
          <SplashOverlay messages={messages} ref={splashRef} />
        </Container>
        <Sprite {...deskTitle} />
      </Container>
    );

  }
  
}