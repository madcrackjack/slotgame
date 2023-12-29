import { Component, createRef } from 'react';
import { Container, Graphics, Sprite, Text, PixiRef } from '@pixi/react';
import { Application, TextStyle } from 'pixi.js';

/**
 * Declare PixiRef's types for component elements...
 */
type ContainerRef = PixiRef<typeof Container>;
type GraphicsRef = PixiRef<typeof Graphics>;
type TextRef = PixiRef<typeof Text>;

/**
 * ...and create Ref's
 * bidAmountRef - dropdown menu of the "bid amount" button
 * autoSpinRef - dropdown menu of the "auto-spin" button
 * rewardRef - link on the "last win" text
 * profitRef - link on the "user balance"
 */
const bidAmountRef = createRef<ContainerRef>();
const autoSpinRef = createRef<ContainerRef>();
const rewardRef = createRef<TextRef>();
const profitRef = createRef<TextRef>();

/**
 * Generate list of available bids
 */
const bidAmount: Array<[number, string]> = [
  1, 2, 5, 10, 20, 50, 100, 200, 500, 1000,
].map((k) => [k, String(k)]);

/**
 * List of the available auto-spin modes
 */
const autoSpin: Array<[number, string]> = [
  [0, "Off"],
  [10, "10"],
  [20, "20"],
  [50, "50"],
  [100, "100"],
  [200, "200"],
  [500, "500"],
  [1000, "1000"],
  [-1, "Unlimited"],
];

/**
 * Configure {@link UserBalance} properties
 */
const balanceProps = {
  x: - 160,
  width: 320,
  height: 70,
  image: 'deskBalance'
};

/**
 * Configure "current win" label properties
 * See {@link Text}
 */
const rewardLabelProps = {
  x: -73,
  y: 8,
  text: 'Last Win',
  anchor: .5,
  scale: .5,
  isSprite: true,
  style: new TextStyle({
    fontFamily: 'Share Tech Mono',
    fontSize: 24,
    fill: '#852714'
  })
};

/**
 * Configure "user balance" label properties
 * See {@link Text}
 */
const profitLabelProps = {
  x: 63,
  y: 8,
  text: 'Balance',
  anchor: .5,
  scale: .5,
  isSprite: true,
  style: new TextStyle({
    fontFamily: 'Share Tech Mono',
    fontSize: 24,
    fill: '#CE2D0A'
  })
};

/**
 * Configure reward text properties
 * See {@link Text}
 */
const rewardAmountProps = {
  x: -73,
  y: 26,
  anchor: .5,
  scale: .5,
  ref: rewardRef,
  style: new TextStyle({
    fontFamily: 'Share Tech Mono',
    fontSize: 32,
    fill: '#852714',
    stroke: '#ffffff',
    strokeThickness: 3
  })
};

/**
 * Configure balance text  properties
 * See {@link Text}
 */
const profitAmountProps = {
  x: 63,
  y: 24,
  anchor: .5,
  scale: .5,
  ref: profitRef,
  style: new TextStyle({
    fontFamily: 'Share Tech Mono',
    fontSize: 40,
    fill: '#CE2D0A',
    stroke: '#ffffff',
    strokeThickness: 4
  })
};

/**
 * Interface describes {@link UserBalance} properties
 * 
 * @param {Application} app - link on the {@link PIXI.Application} component
 * @param {number} balance - current user balance value
 * @param {number} reward - last user win value
 */
interface BalanceProps {
  app: Application,
  balance: number,
  reward: number
};

/**
 * Interface describes {@link UserControl} properties
 * 
 * @param {?number} top - position of the contropl panel from top
 * @param {number} bid - current selected bid amount
 * @param {number} auto - current seelcted auto-spin mode
 * @param {boolean} sound - indicates if sound is turned on or off
 * @param {boolean} portrait - indicates if now is portrait orientation of screen or not
 * @param {Function} onSwitchSound - callback for switching audio on/of
 * @param {Function} onSwitchSpin - callback for switching auto-spin mode
 * @param {Function} onChangeBid - callback for changing bid amount
 * @param {Function} onShowInfo - callback for opening game information screen
 */
interface ControlProps extends BalanceProps {
  top?: number
  bid: number,
  auto: number,
  sound: boolean,
  portrait: boolean,
  onSwitchSound: Function,
  onSwitchSpin: Function,
  onChangeBid: Function,
  onShowInfo: Function
};

/**
 * Display user control panel with control elements and balance
 * This component uses callbacks from the {@link PlayDesk}
 */
export class UserControl extends Component<ControlProps> {

  /**
   * Called when user click on the info button
   */
  clickInfo = (): void => {
    this.props.onShowInfo();
  }

  /**
   * Called when user click on the bid button
   */
  clickBid = (): void => {
    if (bidAmountRef.current) {
      bidAmountRef.current.visible = !bidAmountRef.current.visible;
    }
  }

  /**
   * Called when user click on the auto-spin button
   */
  clickAuto = (): void => {
    if (autoSpinRef.current) {
      autoSpinRef.current.visible = !autoSpinRef.current.visible;
    }
  }

  /**
   * Called when user click on the sound button
   */
  clickSound = (): void => {
    this.props.onSwitchSound();
  }

  /**
   * Called when user select bid from bid drop-down menu
   */
  bidAmount(bid: number): void {
    if (bidAmountRef.current) {
      bidAmountRef.current.visible = false;
      this.props.onChangeBid(bid);
    }
  }

  /**
   * Called when user select spin-mode in auto-spin dropdown menu
   */
  autoSpin(auto: number): void {
    if (autoSpinRef.current) {
      autoSpinRef.current.visible = false;
      this.props.onSwitchSpin(auto);
    }
  }

  /**
   * And this is called when drawing component content
   */
  render() {

    /**
     * Variable contains label for Auto-Spin button based on the auto-spin mode
     */
    let spinText = 'Auto-Spin';
    if (this.props.auto > 0) spinText = 'Auto-Spin:' + this.props.auto;
    else if (this.props.auto < 0) spinText = 'Unlimited Spin';
    
    /**
     * Unpack properties for different orientations of the screen
     * @param {number} blockAX - left user menu with bid and info buttons
     * @param {number} blockBX - right user menu with auto-spin and sound buttons
     * @param {number} blocksY - y position of previous blocks
     */
    const [ blockAX, blockBY, blocksY ] = this.props.portrait
      ? [ -158, 2, 54 ]
      : [ -302, 146, 4 ];

    return (
      <Container y={this.props.top || 0}>
        <UserBalance balance={this.props.balance} reward={this.props.reward} app={this.props.app} />
        <Container x={blockAX} y={blocksY}>
          <SimpleButton
            width={32}
            height={32}
            text="i"
            onClick={this.clickInfo}
          />
          <SimpleButton
            x={36}
            width={120}
            height={32}
            text={"Bid: " + this.props.bid}
            onClick={this.clickBid}
          />
          <Container x={36} y={-302} visible={false} ref={bidAmountRef}>
            <DropdownMenu
              width={120}
              height={30}
              options={bidAmount}
              onClick={(key: number) => this.bidAmount(key)}
            />
          </Container>
        </Container>
        <Container x={blockBY} y={blocksY}>
          <SimpleButton
            width={120}
            height={32}
            active={this.props.auto != 0}
            text={spinText}
            onClick={this.clickAuto}
          />
          <SimpleButton
            x={124}
            width={32}
            height={32}
            sprite={this.props.sound ? "soundOn" : "soundOff"}
            onClick={this.clickSound}
          />
          <Container y={-272} visible={false} ref={autoSpinRef}>
            <DropdownMenu
              width={120}
              height={30}
              options={autoSpin}
              onClick={(key: number) => this.autoSpin(key)}
            />
          </Container>
        </Container>
      </Container>
    );

  }
  
};

/**
 * Display user balance block and makes animation of the balance
 */
class UserBalance extends Component<BalanceProps> {

  /**
   * Initial component state which contains "balance" aka "user virual money"
   * and "reward" aka "last user win"
   */
  state = {
    balance: 0,
    reward: 0
  };

  /**
   * This variable doesn't used, I just forgot to remove it
   */
  timeout = 0;

  /**
   * Setup current user balance/reward variables and add ticker for balance animation
   */
  componentDidMount(): void {
    this.state.balance = this.props.balance;
    this.state.reward = this.props.reward;
    this.props.app.ticker.add(this.tick);
  }

  /**
   * Remove ticker if component remove from page
   */
  componentWillUnmount(): void {
    this.props.app.ticker.remove(this.tick);
  }

  /**
   * Tick method called from the PIXI.Application on every frame render
   * and in this case we are animating our balance and reward.
   * 
   * @param {number} delta 
   */
  tick = (delta: number): void => {
    this.animateText('balance');
    this.animateText('reward');
  }

  /**
   * Method animate text of the balance or reward field
   * 
   * @param {'balance' | 'reward'} key - kind of element which will be animated now
   */
  animateText(key: 'balance' | 'reward'): void {
    const from = this.state[key];
    const to = this.props[key];
    if (from != to) {
      const difference = to - from;
      const speed = difference > 1 ? 10 : 4;
      const value = difference > 1 || difference < 1
        ? Math.round((from + difference / speed) * 1000) / 1000
        : to;
      this.setState({ [key]: value });
    }
  }

  /**
   * Price formatter method (duplicated from the other component)
   * 
   * @param {number} price - original price
   * @returns {string} formatted price
   */
  formatePrice(price: number | string) {
    return Number(price).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  /**
   * Component contains two text fields with two labels and background sprite
   */
  render() {
    return (
      <Container>
        <Sprite {...balanceProps} />
        <Text {...rewardLabelProps} />
        <Text {...profitLabelProps} />
        <Text {...rewardAmountProps} text={this.formatePrice(this.state.reward)} />
        <Text {...profitAmountProps} text={this.formatePrice(this.state.balance)} />
      </Container>
    );
  }
}

/**
 * Type describes properties of the {@link  DropdownMenu}
 * 
 * @param {number} width - width of the dropdown menu
 * @param {number} height - height of the dropdown menu
 * @param {Array<[number, string]>} options - list of the menu options
 * @param {Function} onClick - onclick handler
 */
type DropdownProps = {
  width: number,
  height: number,
  options: Array<[number, string]>,
  onClick: Function
};

/**
 * Draw dropdown menu, obviously
 */
class DropdownMenu extends Component<DropdownProps> {

  /**
   * Look like another render method here
   */
  render() {
    const { width, height, options} = this.props;

    /**
     * Configuration of the menu background
     * See {@link Graphics}
     */
    const menuProps = {
      width,
      height: options.length * height,
      preventRedraw: true,
      draw: (g: GraphicsRef) => {
        g.clear()
          .beginFill(0xffffff)
          .lineStyle(1, 0xeeeeee, 0)
          .drawRoundedRect(0, 0, 100, options.length * 30, 7)
          .endFill();
      }
    };

    /**
     * Configuration of the menu item text
     * See {@link Text}
     */
    const menuTextProps = {
      x: width / 2,
      y: height / 2,
      anchor: .5,
      scale: .5,
      isSprite: true,
      style: new TextStyle({
        fontFamily: 'Share Tech Mono',
        fontSize: 28,
        fill: 0x666666
      })
    };
    
    /**
     * Configuration of the clickable menu item area
     * See {@link Graphics}
     */
    const menuAreaProps = {
      preventRedraw: true,
      draw: (g: GraphicsRef) => {
        g.clear()
          .beginFill([1, 1, 1, 0.01])
          .drawRect(0, 0, width, height)
          .endFill();
      }
    };

    /**
     * Underline of the menu item
     * See {@link Graphics}
     */
    const menuLineProps = {
      preventRedraw: true,
      draw: (g: GraphicsRef) => {
        g.clear().beginFill(0xeeeeee).drawRect(0, 0, width, 1).endFill();
      }
    };

    return (
      <>
        <Graphics {...menuProps} />
        {this.props.options.map(([key, value], index) => {
          const menuContainerProps = {
            key: index,
            y: index * height,
            cursor: 'pointer',
            interactive: true,
            onpointerup: () => this.props.onClick(key)
          };
          return (
            <Container {...menuContainerProps}>
              <Graphics {...menuAreaProps} />
              { index == 0 ? <></> : <Graphics {...menuLineProps} /> }
              <Text {...menuTextProps} text={value} />
            </Container>
          );
        })}
      </>
    ); 
  }

}

/**
 * Type describes {@link SimpleButton} properties
 * If you still reading here, looks like you have a loot of free time.
 * And i am bored to describe all this things.
 */
type ButtonProps = {
  x?: number,
  y?: number,
  width: number,
  height: number,
  active?: boolean,
  text?: string,
  sprite?: string,
  onClick: Function
};

/**
 * Yes, this is button...
 */
class SimpleButton extends Component<ButtonProps> {

  /**
   * ...and last render method here.
   */
  render() {
    const { x, y, width, height, text, sprite, onClick } = this.props;

    /**
     * Configure button container and assign onclick listener to it
     */
    const containerProps = {
      x: x || 0,
      y: y || 0,
      width,
      height,
      interactive: true,
      cursor: 'pointer',
      pointerup: () => onClick()
    };

    /**
     * Configure button text
     */
    const buttonText = {
      text,
      x: width / 2,
      y: 16,
      anchor: .5,
      scale: .5,
      style: new TextStyle({
        letterSpacing: -5,
        fontFamily: 'Share Tech Mono',
        fontSize: 36,
        fill: '#ffffff'
      })
    };

    /**
     * ...if button doesn't have text, then show sprite
     */
    const spriteProps = {
      width,
      height,
      image: sprite
    }

    /**
     * Configure button background
     */
    const buttonProps = {
      preventRedraw: true,
      draw: (g: GraphicsRef) => {
        g.clear()
          .beginFill([1, 1, 1, 0.2])
          .lineStyle(1, 0xffffff, 1)
          .drawRoundedRect(1, 1, width - 2, height - 2, 7)
          .endFill();
      }
    };

    /**
     * Configure active button background
     */
    const buttonActive = {
      preventRedraw: true,
      draw: (g: GraphicsRef) => {
        g.clear()
          .beginFill(0xd92400)
          .lineStyle(1, 0xffffff, 1)
          .drawRoundedRect(1, 1, width - 2, height - 2, 7)
          .endFill();
      }
    };

    return (
      <Container {...containerProps}>
        <Graphics {...buttonProps} />
        { this.props.active ? <Graphics {...buttonActive} /> : <></> }
        { text ? <Text {...buttonText} /> : <Sprite {...spriteProps} /> }
      </Container>
    );
  }
}