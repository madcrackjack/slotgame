/**
 * Variable contains desk items coefficients ranges
 * .01 means that chanse for item 0 is 1%
 * .03 means that cnahse for item 1 is 2% (.03 - .01)
 * ..etc
 */
const itemsRanges = [ .01, .03, .07, .16, .28, .40, .52, .68, .84, 1 ];

/**
 * Variable contains amount of the reward for different combinations
 * where [ itemType: { amountOfItems: amountOfReward } ]
 */
const itemsRewards = [
  { 4: 6, 5: 10, 6: 200 },
  { 8: 20, 9: 20, 10: 50, 11: 50, 12: 100 },
  { 8: 6, 9: 6, 10: 20, 11: 20, 12: 60 },
  { 8: 4, 9: 4, 10: 10, 11: 10, 12: 30 },
  { 8: 2, 9: 2, 10: 4, 11: 4, 12: 20 },
  { 8: 2, 9: 2, 10: 4, 11: 4, 12: 20 },
  { 8: 2, 9: 2, 10: 4, 11: 4, 12: 20 },
  { 8: 1, 9: 1, 10: 2, 11: 2, 12: 10 },
  { 8: 1, 9: 1, 10: 2, 11: 2, 12: 10 },
  { 8: 1, 9: 1, 10: 2, 11: 2, 12: 10 }
];

/**
 * This is showcase combinations wich appear when user fail 3 times in a row
 * where [ itemType, amountOfGeneratedItems ]
 */
const showcaseCombinations = [ [ 0, 4 ], [ 1, 8 ], [ 2, 8 ], [ 3, 8 ] ]; 

/**
 * Type describes RoundInfo for single spin step
 * 
 * @param {number} id - current round unique id
 * @param {number} bid - bid amount for the current round
 * @param {number} info - balance information for the current round { balance, reward, profit }
 * @param {number} show - array of items wich should show up (contains 30 items types)
 * @param {number} blow - array of items wich blow up after show up (contains indexes of items)
 * @param {number} last - final state of items after blowing and moving (can contains null)
 * @param {number} math - successful combinations in format { itemType: combinationReward }
 * @param {number} move - what items snould be moved in format { oldItemPosition: newItemPosition }
 */
export type RoundInfo = {
  id: number,
  bid: number,
  info: {
    reward: number,
    profit: number,
    balance: number
  }
  show: number[],
  blow: number[],
  last: (number | null)[],
  math: GroupedItems,
  move: GroupedItems
};

/**
 * Type describes object of grouped desk items
 * in format { key: value } where both are numbers
 */
type GroupedItems = {
  [index: number]: number
};

/**
 * Game logic component which generate all game information for spin rounds
 * Usually this part of the logic placed on the server side.
 * And this is not actual slot games mechanic, this is just for fun demo realisation.
 * RTP doesn't used here and actually current calculation balance cause more profit for user.
 */
export class GameService {

  /**
   * Variable contains current user balance
   */
  balance = 0;

  /**
   * Some kind of internal auto increment id for rounds
   */
  index = 0;

  /**
   * Amounts of fails in a row used for showcase combinations
   */
  fails = 0;

  /**
   * Constructor will receive and store initial player balance
   * 
   * @param {number} balance - initial player balance
   */
  constructor(balance: number) {
    this.balance = balance;
  }

  /**
   * Generate all steps of the game rounds
   * This method told us what item we should show, blow and move
   * How many combinations worked, what reward, profit and balance in the current period of time.
   * And after that, if spin should continue, it will generate other steps for next spin rounds.
   * So, we get all spin rounds at a time and that now how it actually works in the real games.
   * How i said, this is just for fun realisation and it looks well for me in this situation.
   * 
   * Some information about realisation:
   * 
   * let idle - meanse that we made fake spin without bid and changing user balance
   * when user out of balance or when we show up initial game state.
   * 
   * const id - gives game components understanding that round were changed
   * 
   * We generating rounds while user get profit in current round (when combinations works)
   * 
   * All internal logic can be combined in several more effective but less understandable method.
   * 
   * @param {number} bid - bid amount
   * @returns {RoundInfo[]}
   */
  spin(bid: number = 0): RoundInfo[] {
    let idle = bid <= 0 || bid > this.balance;
    let profit = 0;
    let reward = 0;
    let balance = this.balance - bid;
    let items = (new Array(30)).fill(null);
    let rounds: RoundInfo[] = [];

    do {
      const id = ++this.index;
      const show = idle ? this.fakeItems() : this.fillItems(items);
      const groups = this.groupItems(show);
      const math = this.findCombinations(groups);
      const blow = this.blowItems(show, math);
      const { move, last } = this.moveItems(show, blow);
      reward = this.calculateReward(bid, math);
      items = last;
      profit += reward;
      balance += reward;
      const info = { reward, profit, balance };
      const round: RoundInfo = { id, bid, info, show, math, blow, move, last };
      rounds.push(round);
      console.log("ROUND", rounds.length, round);
    } while (reward > 0);

    if ( ! idle ) this.balance = balance;
    if (rounds.length == 1) this.fails++;
    else this.fails = 0;

    return rounds;
  }

  /**
   * Generate initial game desk state (just shuffle same amount of all items)
   * 
   * @returns {number[]}
   */
  fakeItems(): number[] {
    return (new Array(30)).fill(0)
      .map((v, k) => [k % 10, Math.random()])
      .sort((a, b) => a[1] > b[1] ? 1 : 0)
      .map(i => i[0]);
  }

  /**
   * Fill all empty array cells with random items (which contains null)
   * If user already failed 3 times in a row we give him a chance
   * to get one of the random showcase combinations (not guaranteed).
   * 
   * @param {number[]} items 
   * @returns {number[]}
   */
  fillItems(items: number[]): number[] {
    if (this.fails > 3) {
      this.fails = 0;
      const random = Math.round(
        Math.random() * (showcaseCombinations.length - 1)
      );
      const [type, amount] = showcaseCombinations[random];
      new Array(amount).fill(type).forEach((v) => {
        items[Math.round(Math.random() * 29)] = v;
      });
    }
    return items.map((item) => {
      let random = Math.random();
      return item == null ? itemsRanges.findIndex((v) => random <= v) : item;
    });
  }

  /**
   * Group items in format { itemType: amountOfSameItems }
   * 
   * @param {number[]} items - receive array of items
   * @returns {GroupedItems} return grouped list of items (associative object)
   */
  groupItems(items: number[]): GroupedItems {
    let groups: GroupedItems = {};
    items.forEach(item => groups[item] = groups[item] + 1 || 1);
    return groups;
  }

  /**
   * Detect worked combinations in grouped items
   * 
   * @param {GroupedItems} groups - receive grouped items
   * @returns {GroupedItems} - return matched combinations
   */
  findCombinations(groups: GroupedItems): GroupedItems {
    let math: GroupedItems = {};
    for (let item in groups) {
      let amount = groups[item];
      let key = Math.min(amount, item ? 12 : 6);
      let add = itemsRewards[item] as any as GroupedItems;
      if (add[key]) math[item] = add[key];
    }
    return math;
  }

  /**
   * Find cells which should be cleared due to worked combinations
   * 
   * @param {number[]} show - original items list
   * @param {GroupedItems} math - matched combinations
   * @returns {number[]} - list of indexes which should be cleared
   */
  blowItems(show: number[], math: GroupedItems): number[] {
    let blow: number[] = [];
    show.forEach((item, i) => math[item] && blow.push(i));
    return blow;
  }

  /**
   * Clear blowed items on the desk and calculate movement of other items to new cells
   * We navigating through desk items from the left bottom corner to the right top corner.
   * In the way how items should move down.
   * 
   * @param {number[]} show - original items list
   * @param {number[]} blow - items which should be blowed (cleared)
   * @returns {GroupedItems} move - list of moved items { fromPosition: toPosition }
   * @returns {(number | null)[]} last - new state of items after moving
   */
  moveItems(show: number[], blow: number[]): { move: GroupedItems, last: (number | null) [] } {
    let move: GroupedItems = {};
    let last: Array<number | null> = show.map((v,i) => blow.includes(i) ? null : v);
    for (let x = 0; x < 6; x++) {
      for (let y = 0; y < 4; y++) {
        let i = x * 5 + (4 - y);
        if (last[i] == null) {
          for (let j = i - 1; j >= x * 5; j--) {
            if (last[j] != null) {
              [ move[j], last[i], last[j] ] = [ i, last[j], null ];
              break;
            }
          }
        }
      }
    }
    return { move, last };
  }

  /**
   * Calculate round reward based on the bid and worked combinations
   * 
   * @param {number} bid - bid amount
   * @param {GroupedItems} math - worked combinations
   * @returns {number} - total round reward
   */
  calculateReward(bid: number, math: GroupedItems): number {
    let reward = 0;
    for (let i in math) {
      reward += math[i];
    }
    return reward * bid;
  }
  
}