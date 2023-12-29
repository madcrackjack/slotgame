import { Component, createRef } from 'react';
import { Container, Graphics, PixiRef } from '@pixi/react';
import { Application } from 'pixi.js';
import { UserControl } from '../usercontrol/UserControl';
import { PlayDesk } from '../playdesk/PlayDesk';
import { PlayButton } from '../playbutton/PlayButton';
import { GameService, RoundInfo } from '../gameservice/GameService';
import { sound, IMediaInstance } from '@pixi/sound';
import { gsap } from 'gsap';

/**
 * Create Ref type for drawed Graphics
 */
type GraphicsRef = PixiRef<typeof Graphics>;

/**
 * Create Ref for the screen mask
 * Used when screen appears after loading assets.
 */
const maskRef = createRef<GraphicsRef>();

/**
 * Mask configuration
 * Circle shape placed in the middle of the screen.
 */
const maskProps = {
  ref: maskRef,
  preventRedraw: true,
  scale: 0,
  draw: (g: GraphicsRef) => {
    g.clear().beginFill(0xffffff).drawCircle(0, 0, 1000).endFill();
  }
};

/**
 * Create {@link GameService} component wich contains all game logic
 * and generates information for game rounds.
 * Component receive amount of player balance.
 */
const service = new GameService(100000);

/**
 * Type defines available states for {@link PlayButton}
 * idle - means what button is not available
 * active - button is visible and player ca click it
 * turbi - visible turbo message instead of button, user can't click it
 */
type ButtonStatus = 'idle' | 'turbo' | 'active';

/**
 * Type desccribes properties received by {@link GameScreen} component
 * 'registerReceiver' and 'sendMessage' methods implemented in the parent {@link App} component
 * 
 * @param {Application} app - link on the PIXI Application
 * @param {Function} registerReceiver - method used for subscribe callback on global messages
 * @param {Function} sendMessage - this method will send command to the all subscribed component
 */
type GameProps = {
  app: Application,
  registerReceiver: Function,
  sendMessage: Function
};

/**
 * Type describes state for the {@link GameScreen} component
 * 
 * @param {RoundInfo[]} rounds - generated information for all current spin rounds
 * @param {number} balance - displayed on the screen balance (not actual), updated after round complete
 * @param {number} profit - total rewards amount received in current rounds (works same as balance)
 * @param {number} round - index of the current round (resets when new rounds was generated)
 * @param {boolean} ready - indicates what assets were loaded and screen is ready to show up
 * @param {boolean} turbo - indicates what user hold turbo button
 * @param {number} auto - amount of selected spinds in auto-spin mode (-1 infinite spin, 0 - turned off)
 * @param {number} bid - current bid amount
 * @param {boolean} sound - indicates if sounds is turned on or off
 * @param {boolean} locked - true - when rounds animation is active at the moment, and false - when all steps completed
 */
type GameState = {
  rounds: RoundInfo[],
  balance: number,
  profit: number,
  round: number,
  ready: boolean,
  turbo: boolean,
  auto: number,
  bid: number,
  sound: boolean,
  locked: boolean
};

/**
 * This component represent the Game interface and primary mechanics
 */
export class GameScreen extends Component<GameProps> {

  /**
   * Initial component state
   */
  state: GameState = {
    rounds: [],
    balance: service.balance,
    profit: 0,
    ready: false,
    turbo: false,
    locked: true,
    sound: true,
    round: 0,
    bid: 1,
    auto: 0
  };

  /**
   * Link on the background melody
   * Gives ability to use fade effects when sound is turned on/off.
   */
  melody: IMediaInstance | null = null;
  
  /**
   * Constructor will setup global messages callback
   * See {@link App} for details
   * 
   * @param {GameProps} props 
   */
  constructor(props: GameProps) {
    super(props);
    props.registerReceiver((command: string, params: any) => {
      this.onMessage(command, params)
    });
  }

  /**
   * Method called when messages received from other screens through App component
   * 
   * @param {string} command - command name fired by other screen
   * @param {any} params - additional params for the command (optional)
   */
  onMessage(command: string, params: any): void {
    switch (command) {
      case 'onResize':
        // FIX: this is doesn't update child components
        // this.forceUpdate();
      break;
      case 'onReady':
        this.onReady();
      break;
    }
  }

  /**
   * Animate game screen appear when assets loading completed
   * This will animate circle mask scaled from the center of the screen.
   * And also will start playing background melody.
   */
  onReady(): void {
    if ( ! this.state.ready) {
      setTimeout(() => this.doSpin(), 1000);
      this.setState({ ready: true });
      this.melody = sound.play("melody", {
        loop: true,
        volume: 0.5,
      }) as IMediaInstance;
      gsap.fromTo(this.melody, { volume: 0 }, { volume: 1, duration: 5 });
      gsap.fromTo(
        maskRef.current,
        {
          pixi: { scale: 0 },
        },
        {
          duration: 3,
          ease: "none",
          pixi: { scale: 1 },
        }
      );
      // FIX: wait for unlocking sound context
    }
  }

  /**
   * Run new game round
   * 
   * @param {number} bid - amound of virtual coins used for new round
   */
  doSpin(bid: number = 0): void {
    if (bid) sound.play('soundSpin');
    const balance = service.balance - bid;
    this.setState({ balance, rounds: service.spin(bid), round: 0, locked: true });
  }

  /**
   * Triggered when user clicks on sound button
   * Will turn on/off sounds and background melody with fade effect.
   */
  onSwitchSound = (): void => {
    const enabled = !this.state.sound;
    this.setState({ sound: enabled });
    gsap.killTweensOf(this.melody);
    if (enabled) {
      sound.unmuteAll();
      gsap.fromTo(this.melody, { volume: 0 }, { volume: 1, duration: 1 });
    } else {
      gsap.to(this.melody, {
        volume: 0,
        duration: 1,
        onComplete: () => {
          sound.muteAll();
        }
      });
    }
  }

  /**
   * Configure auto-spin mode
   * '0' if turned off, '-1' is infinite spin, and '>0' for decreased auto-spins
   * 
   * @param {number} auto - auto-spin mode
   */
  onSwitchSpin = (auto: number): void => {
    this.setState({ auto });
    if ( auto != 0 && ! this.state.locked) {
      this.doSpin(this.state.bid);
    }
  }

  /**
   * Called when user selects bid amount
   * 
   * @param {number} bid 
   */
  onChangeBid = (bid: number): void => {
    this.setState({ bid });
  }

  /**
   * Called when user tap on the info button
   */
  onShowInfo = (): void => {
    this.props.sendMessage('showInfo');
  }

  /**
   * Called by {@link PlayDesk} when all round step animations is complete
   */
  onSpinReady = (): void => {
    const round = this.state.rounds[this.state.round];
    const balance = round.info.balance;
    const profit = round.info.profit;
    if (this.state.rounds[this.state.round + 1]) {
      this.setState({ balance, profit, round: this.state.round + 1 });
    } else if (this.state.auto > 0) {
      --this.state.auto;
      this.doSpin(this.state.bid);
    } else if (this.state.auto < 0) {
      this.doSpin(this.state.bid);
    } else if (this.state.turbo) {
      this.doSpin(this.state.bid);
    } else if (this.state.locked) {
      // TODO: SHOW REWARD SPLASH SCREEN
      this.setState({ balance, profit, locked: false });
    }
  }

  /**
   * Called by {@link PlayDesk} when current rounds desk items were blowed
   */
  onBlowItems = (): void => {
    sound.play('soundBlow');
  }

  /**
   * Called when user hold down play button and we need to turn on turbo mode
   */
  onStartTurbo = (): void => {
    if ( ! this.state.locked) {
      this.state.turbo = true;
      this.doSpin(this.state.bid);
    }
  }

  /**
   * Called when user releases turbo button (play button)
   */
  onStopTurbo = (): void=> {
    this.setState({ turbo: false });
  }

  /**
   * Called when user click on play button to do one regular spin
   */
  onClickSpin = (): void => {
    if ( ! this.state.locked) {
      this.doSpin(this.state.bid);
    }
  }

  /**
   * Generate and display all game screen components (is game assets are loaded)
   * For all child components generates proportional sizes and position (adaptive design)
   */
  render() {
    const { rounds, round, turbo, locked, bid, auto, sound, ready } = this.state;
    const { width, height } = this.props.app.screen;
    const position: [number, number] = [width / 2, height / 2];
    const portrait = width < 620;
    const roundInfo = rounds[round];
    const availHeight = height - (portrait ? 170 : 140);
    const deskScale = Math.max(1, Math.min(3, Math.min(width / 340, availHeight / 250)));
    const status: ButtonStatus = turbo ? 'turbo' : ( locked ? 'idle' : 'active' );

    /**
     * Control Panlel params passes callbacks for user actions
     * See {@link UserControl} component for details
     */
    const controlParams = {
      balance: this.state.balance,
      reward: this.state.profit,
      portrait,
      bid,
      auto,
      sound,
      top: 250 * deskScale + 80,
      onSwitchSound: this.onSwitchSound,
      onSwitchSpin: this.onSwitchSpin,
      onChangeBid: this.onChangeBid,
      onShowInfo: this.onShowInfo,
    }

    /**
     * Play button params and callbacks for different kind of actions with it
     * See {@link PlayButton} component for details
     */
    const buttonProps = {
      status,
      top: 60 + deskScale * 80,
      onStartTurbo: this.onStartTurbo,
      onStopTurbo: this.onStopTurbo,
      onClickSpin: this.onClickSpin
    }

    /**
     * Play desk component params with callbacks for desk states
     * See {@link PlayDesk} component for details
     */
    const deskProps = {
      onReady: this.onSpinReady,
      onBlow: this.onBlowItems,
      scale: deskScale,
      round: roundInfo,
      clear: round == 0,
      turbo
    };

    console.log('GAME', this.state);

    return (
      <>
        <Graphics {...maskProps} position={position} scale={ready && rounds.length ? 1 : 0}/>
        <Container x={position[0]} mask={maskRef.current}>
          {
            ready
              ?
                <>
                  <PlayDesk {...deskProps} />
                  <PlayButton {...buttonProps} />
                  <UserControl {...controlParams} app={this.props.app} />
                </>
              :
                <></>
          }
        </Container>
      </>
    );

  }
  
}