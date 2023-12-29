import { Component } from 'react';
import type { Renderer } from '@pixi/core';
import { Sprite, withPixiApp } from '@pixi/react';
import { GradientFactory, ColorStop } from '@pixi-essentials/gradients';
import { Application, RenderTexture } from 'pixi.js';

/**
 * Interface describes linear gradient properties
 * 
 * @param {number} x0 - left position
 * @param {number} y0 - top position
 * @param {number} x1 - right position
 * @param {number} y1 - bottom position
 * @param {ColorStop[]} colorStops - is a {@link pixi-essentials/gradients} type
 */
export interface ILinearGradient {
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  colorStops: ColorStop[]
}

/**
 * Interface describes radial gradient properties
 * x0 and y0 coordinate points to the inner radius position
 * x1 and y1 coordinate points to the outer radius position
 * for uniform radial gradient use same coordinates for points 0 and 1
 * 
 * @param {number} r0 - inner gradient radius
 * @param {number} r0 - outer gradient radius
 */
export interface IRadialGradient extends ILinearGradient {
  r0: number,
  r1: number
}

/**
 * Type describes properties accepted by {@link Gradient} component
 * 
 * @param {Application} app - link on the PIXI application component
 * @param {number} x - x element position in the container
 * @param {number} y - y element position in the container
 * @param {number} width - container width
 * @param {number} height - container height
 * @param {ILinearGradient | IRadialGradient} gradient - gradient configuration
 */
type GradientProps = {
    app: Application,
    x: number,
    y: number,
    width: number,
    height: number,
    gradient: ILinearGradient | IRadialGradient
};

/**
 * Component will create a Sprite with a linear or redial gradient fill
 * Here we use withPixiApp to get access to the PIXI Application component,
 * this needed for generating texture using app renderer.
 */
export const Gradient = withPixiApp(class extends Component<GradientProps> {

  /**
   * Generate gradient texture for our sprite
   * 
   * @param {number} width - width of the texture
   * @param {number} height - height of the texture
   * @param {ILinearGradient | IRadialGradient} gradient - gradient properties
   * @returns {RenderTexture} generated gradient texture
   */
  generateGradient(width: number, height: number, gradient: ILinearGradient | IRadialGradient): RenderTexture {
    const renderer = this.props.app.renderer as Renderer;
    const renderTexture = RenderTexture.create({ width, height });
    if ('r0' in gradient) {
        return GradientFactory.createRadialGradient(renderer, renderTexture, gradient);
    }
    else {
        return GradientFactory.createLinearGradient(renderer, renderTexture, gradient);
    }
  }

  /**
   * Output sprite with generated gradient texture based on the component properties
   */
  render() {
    const {x, y, width, height, gradient} = this.props;
    const texture = this.generateGradient(width, height, gradient);
    return <Sprite position={[x, y]} width={width} height={height} texture={texture} />;
  }
  
});