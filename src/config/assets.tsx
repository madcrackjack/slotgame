import { AssetInitOptions } from "pixi.js";

export const GameAssets: AssetInitOptions = {
  basePath: './assets/',
  manifest: {
    bundles: [
      {
        name: 'load',
        assets: {
          'loadBackground': 'load-background.svg',
          'loadProgress': 'load-progress.svg'
        }
      },
      {
        name: 'game',
        assets: {
          'deskBorders': 'desk-borders.png',
          'deskGrid': 'desk-grid.svg',
          'deskBalance': 'desk-balance.svg',
          'deskTitle': 'desk-title.svg',
          'buttonActive': 'button-active.svg',
          'buttonTurbo': 'button-turbo.svg',
          'soundOn': 'sound-on.svg',
          'soundOff': 'sound-off.svg',
          'snowA': 'snow-a.png',
          'snowB': 'snow-b.png',
          'item0': 'item-0.png',
          'item1': 'item-1.png',
          'item2': 'item-2.png',
          'item3': 'item-3.png',
          'item4': 'item-4.png',
          'item5': 'item-5.png',
          'item6': 'item-6.png',
          'item7': 'item-7.png',
          'item8': 'item-8.png',
          'item9': 'item-9.png',
          'melody': 'melody.mp3',
          'soundSpin': 'sound-spin.mp3',
          'soundBlow': 'sound-blow.mp3',
          'Share Tech Mono': 'Share-Tech-Mono.ttf',
        }
      }
    ]
  }
};