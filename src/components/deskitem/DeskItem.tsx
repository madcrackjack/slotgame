import { Component, createRef } from 'react';
import { Sprite, PixiRef } from '@pixi/react';
import { gsap } from 'gsap';

/**
 * Create Ref Type for Sprite
 */
type SpriteRef = PixiRef<typeof Sprite>;

/**
 * Parameters accepted by {@link DeskItem} component
 * 
 * @param {number} row - initial position in the desk line
 * @param {number} line - line on the desk for placing element
 * @param {number} type - ...of the element (available items from 0 to 9)
 * @param {number} time - timestamp need to easily detect if item were updated
 * @param {boolean} swap - if element was swaped we will show appear animation (for continious rounds)
 * @param {boolean} blow - if pass true we will show blow animation after item appear
 * @param {number} move - contains position in the line where we will move our item after appear
 * @param {boolean} clear - reset whole element state and show appear animation (for new round)
 * @param {boolean} turbo - says what we need to show quick animations
 * @param {Function} onReady - callback methods wich calls when element complete his animation
 * @param {Function} onBlow - callback methods wich calls at the moment when element blows up
 */
type ItemProps = {
  row: number,
  line: number,
  type: number,
  time: number,
  swap: boolean,
  blow: boolean,
  move: number,
  clear: boolean,
  turbo: boolean,
  onReady: Function,
  onBlow: Function
};

/**
 * Type configures {@link DeskItem} component state
 * 
 * @param {number | null} type - current type of the item (from 0 to 9)
 * @param {number} position - current position of the element on the desk (from 0 to 4)
 * @param {number} time - timestamp need to understand if item was really updated
 */
type ItemState = {
  type: number | null,
  position: number,
  time: number
};

/**
 * Component creates and animate all states of the desk item.
 * Used in {@link PlayDesk} component.
 * 
 * How it works:
 * On the PlayDesk always placed 30 items (6 lines with 5 items in each line).
 * Desk just draw items and pass to it params which figures out what items should do with himself.
 * All animations with item such move and blow element do himself.
 * Element has consistent initial line and row wich reset every time when component was updated.
 * When component complete animation or blow up it emit events (onReady and onBlow).
 * 
 * There is several behaviors:
 * clear - when old element move out from desk and then move in as a new element
 * swap - when we should show new element on place where was blown some element in previous round
 * move - element will show up and then move on the other position
 * blow - element will show up and then immediately blow up
 */
export class DeskItem extends Component<ItemProps> {

  /**
   * Configure initial item state with empty values
   * See {@link ItemState} for state details.
   */
  state:ItemState = {
    type: null,
    position: 0,
    time: 0
  };

  /**
   * Contain Ref on the item image
   * This ref will be used for item animation.
   */
  ref = createRef<SpriteRef>();

  /**
   * This method will setup component state before render if current state is empty
   * 
   * @param {ItemProps} props - new props of the element
   * @param {ItemState} state - previous satte of the element
   * @returns {ItemState}
   */
  static getDerivedStateFromProps(props: Readonly<ItemProps>, state: Readonly<ItemState>): ItemState {
    if (state.type == null) {
      return { type: props.type, position: props.row, time: props.time };
    }
    return state;
  }

  /**
   * Show animation of item appear when component attached to page
   */
  componentDidMount() {
    this.animateAppear();
  }

  /**
   * Animate appear of the element if it was updated.
   * Also it will animate disapear if we replace all desk items for new round.
   */
  componentDidUpdate(): void {
    if (this.state.time != this.props.time) {
      if (this.props.clear) {
        this.animateDisappear(() => {
          this.animateAppear();
          this.setState({ type: null });
        });
      }
      else {
        this.animateAppear();
        this.setState({ type: null });
      }
    }
  }

  /**
   * Remove all current animations if component removed from page.
   */
  componentWillUnmount(): void {
    gsap.killTweensOf(this.ref.current);
  }

  /**
   * Item appear animation
   * Move item from out of screen to his position
   * then blowup or move item if needed.
   * Emit onReady and onBlow events. 
   */
  animateAppear(): void {
    const ref = this.ref.current;
    if (!ref) return;
    const { row, line, blow, move, swap, clear, turbo } = this.props;
    const y = clear || swap ? 50 * row - 300 : 50 * row + 25;
    const [sDelay, bDelay, mDelay, duration] = turbo
      ? [0, 0, 0.6, 0.6]
      : [line * 0.1, 0.6 - line * 0.1, 1.4, 1];
    gsap.killTweensOf(ref);
    const timeline = gsap.timeline({ onComplete: () => this.props.onReady() });
    timeline.fromTo(
      ref,
      { pixi: { y, alpha: 1, width: 50, height: 50 } },
      { duration, delay: sDelay, pixi: { y: 50 * row + 25 } }
    );
    if (blow) {
      if (!turbo) {
        timeline.to(ref, {
          duration: 0.2,
          delay: bDelay,
          pixi: { scale: 0.17 },
        });
        timeline.to(ref, { duration: 0.4, pixi: { scale: 0.12 } });
      }
      timeline.to(ref, {
        duration: 0.2,
        pixi: { scale: 0.17 },
        onComplete: () => this.props.onBlow(50 * line + 25, 50 * row + 25),
      });
      timeline.to(ref, { duration: 0.4, pixi: { scale: 0 } });
    } else if (move) {
      timeline.to(ref, {
        duration: 0.4,
        delay: mDelay,
        pixi: { y: 50 * move + 25 },
      });
    }
  }

  /**
   * Animate item moving out of the desk and then call callback method.
   * 
   * @param {Function} onComplete - called when element were moved out
   */
  animateDisappear(onComplete: Function): void {
    const ref = this.ref.current;
    if ( ! ref) return;
    const { row, line, turbo } = this.props;
    const [ delay, duration, cDelay ] = turbo
      ? [ .2, .6, 1 ]
      : [ line * .1, 1, 1.8 ];
    gsap.killTweensOf(ref);
    gsap.delayedCall(cDelay, onComplete);
    gsap.fromTo(ref,
      { pixi: { y: 50 * row + 25 } },
      { duration, delay, pixi: { y: 50 * row + 300 } });
  }

  /**
   * Generate item view based on the item type
   * and plasing it in the initial line and position.
   * If we show new element, it will appear outside of the desk.
   */
  render() {
    const { line, swap, clear } = this.props;
    const { type, position } = this.state;
    const spriteProps = {
      x: 50 * line + 25,
      y: clear || swap ? (50 * position - 300) : (50 * position + 25),
      width: 50,
      height: 50,
      anchor: .5,
      image: 'item' + type,
      ref: this.ref
    };
    return <Sprite {...spriteProps} />
  }

}