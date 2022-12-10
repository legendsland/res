/**
 * Show color code when mouse is over image
 */

import * as $ from 'jquery';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {useEffect, useState} from 'react';
import {StatusBar} from './statusbar';
import {color2Str} from './types';

type RGB = {
    r: number;
    g: number;
    b: number;
}


export class ColorPicker {

    private ctrlKey: boolean = false;

    private palettes: Map<string, number[][]> = new Map<string, number[][]>();

    constructor(
        readonly areaId: string,
        private sb_: StatusBar
    ) {

        // listen to control keypress
        $(document).on('keydown', (e) => {
            this.ctrlKey = e.ctrlKey;
        }).on('keyup', (e) => {
            this.ctrlKey = e.ctrlKey;
        });

        // create canvas on the fly

        // svg
        $(`#${areaId} svg`).on('mouseenter', (e) => {
            const $elem = $(e.target);

            //get svg
            const $svg = $elem.closest('svg');

            let id = $svg.attr('id');
            if (id === undefined) {
                // create a new id
                id =`svg-${Math.floor(Math.random() * 100000000)}`;
                $svg.attr('id', id);
            }

            //TODO: wrong...
            const ew = $svg.width();
            const eh = $svg.height()
            const blobURL = URL.createObjectURL(
                new Blob([$svg[0].outerHTML], {type:'image/svg+xml;charset=utf-8'}));

            this.data2Canvas({
                id: id,
                width: ew,
                height: eh,
                data: blobURL
            }, (canvas: HTMLCanvasElement) => {
                $(canvas).width(ew);
                $(canvas).height(eh);
                $svg.after($(canvas));
                $svg.hide();
            });
        });

        $(`#${areaId} :not(svg)`).find('img, image').on('mouseenter', (e) => {
            const $elem = $(e.target);

            let id = $elem.attr('id');
            if (id === undefined) {
                // create a new id
                id =`img-${Math.floor(Math.random() * 100000000)}`;
                $elem.attr('id', id);
            }

            const ew = $elem.width();
            const eh = $elem.height()

            this.data2Canvas({
                id: id,
                width: ew,
                height: eh,
                data: $elem.attr('src'),
                actualSize: true
            }, (canvas: HTMLCanvasElement) => {
                $(canvas).width(ew);
                $(canvas).height(eh);
                $elem.after($(canvas));
                $elem.hide();
            });

        });
    }

    private data2Canvas(elem: {id: string, width: number, height: number, data: string, actualSize?: boolean}, callback: (c: HTMLCanvasElement) => void) {
        const ew = elem.width;
        const eh = elem.height;

        let image = new Image();
        image.onload = () => {

            let canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.id = 'canvas-' + elem.id;
            let nw = image.naturalWidth;
            let nh = image.naturalHeight;

            if (elem.actualSize) {
                canvas.width = nw;
                canvas.height = nh;
            } else {
                canvas.width = nw = ew;
                canvas.height = nh = eh;
            }

            // draw image in canvas starting left-0 , top - 0
            ctx.drawImage(image, 0, 0);

            // console.log(`e[${ew}, ${eh}], n[${nw}, ${nh}]`);

            $(canvas)
                .on('mouseenter', (e) => {
                    const id = $(e.target).attr('id');
                    let palette = this.palettes.get(id);
                    if (palette === undefined) {
                        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                        palette = this.extractPalette2(imageData)
                            .map((c: RGB) => [c.r, c.g, c.b, 255]);
                        this.palettes.set(id, palette);
                    }
                    this.sb_?.update({
                        palette: palette
                    });
                })
                .on('mousemove', (e) => {
                    // const x = e.offsetX;
                    // const y = e.offsetY;
                    // console.log(e.offsetX, e.offsetY);
                    const bb = canvas.getBoundingClientRect();
                    const x = Math.floor( (e.clientX - bb.left) / bb.width * canvas.width );
                    const y = Math.floor( (e.clientY - bb.top) / bb.height * canvas.height );

                    const px = ctx.getImageData(x, y, 1, 1).data;

                    this.sb_?.update({
                        color: [px[0], px[1], px[2], px[3]]
                    });
                })

                // copy color to clipboard
                .on('click', (e) => {
                    const $elem = $(e.target);

                    const bb = canvas.getBoundingClientRect();
                    const x = Math.floor( (e.clientX - bb.left) / bb.width * canvas.width );
                    const y = Math.floor( (e.clientY - bb.top) / bb.height * canvas.height );

                    // console.log(`$[${$elem.width()}, ${$elem.height()}], bb[${bb.width}, ${bb.height}], off[${e.target.offsetWidth}, ${e.target.offsetHeight}]`);

                    if (this.ctrlKey) {
                        // restore the size
                        if (Math.abs($elem.width() - ew) < 1) {
                            $elem.width(nw);
                            $elem.height(nh);
                        } else if (Math.abs($elem.width() - nw) < 1) {
                            $elem.width(ew);
                            $elem.height(eh);
                        }

                    } else {
                        const px = ctx.getImageData(x, y, 1, 1).data;
                        const color = [px[0], px[1], px[2], px[3]];
                        navigator.clipboard.writeText(color2Str(color));
                        this.sb_.update({'pickColor': undefined});
                    }
                })
            ;

            callback(canvas);
        };
        if (elem.data !== undefined) {
            image.src = elem.data;
        }
    }

    /**
     * naive, not working.
     */
    private extractPalette(data: ImageData) {
        const colors = data.data;
        const palette: Map<number, number> = new Map<number, number>();
        for(let i=0; i<colors.length; i+=4) {
            const color = (colors[i]<<16) | (colors[i+1]<<8) | (colors[i+2]);
            const count = palette.get(color);
            if (count === undefined)
                palette.set(color, 1);
            else
                palette.set(color, count+1);
        }

        const sorted = Array.from(palette).sort((a, b) => b[1]-a[1]);
        const p = sorted.slice(0, Math.min(sorted.length, 5));
        if (p.length>0) {
            return p.map(([ color, freq]) =>
                [(color>>16) & 0xff, (color>>8) & 0xff, color & 0xff, 255]);
        } else {
            return [];
        }
    }

    private buildRgb(imageData: Uint8ClampedArray): RGB[] {
        const rgbValues: RGB[] = [];
        for (let i = 0; i < imageData.length; i += 4) {
            const rgb = {
                r: imageData[i],
                g: imageData[i + 1],
                b: imageData[i + 2],
            };
            rgbValues.push(rgb);
        }
        return rgbValues;
    };

    private findBiggestColorRange(rgbValues: RGB[]): string {
        let rMin = Number.MAX_VALUE;
        let gMin = Number.MAX_VALUE;
        let bMin = Number.MAX_VALUE;

        let rMax = Number.MIN_VALUE;
        let gMax = Number.MIN_VALUE;
        let bMax = Number.MIN_VALUE;

        rgbValues.forEach((pixel) => {
            rMin = Math.min(rMin, pixel.r);
            gMin = Math.min(gMin, pixel.g);
            bMin = Math.min(bMin, pixel.b);

            rMax = Math.max(rMax, pixel.r);
            gMax = Math.max(gMax, pixel.g);
            bMax = Math.max(bMax, pixel.b);
        });

        const rRange = rMax - rMin;
        const gRange = gMax - gMin;
        const bRange = bMax - bMin;

        const biggestRange = Math.max(rRange, gRange, bRange);
        if (biggestRange === rRange) {
            return "r";
        } else if (biggestRange === gRange) {
            return "g";
        } else {
            return "b";
        }
    };

    //still bad ...
    private extractPalette2(data: ImageData): RGB[] {
        return this.quantization(this.buildRgb(data.data));
    }

    private quantization(rgbValues: RGB[]): RGB[] {
        return this.quantization_(rgbValues, 2);
    }

    private quantization_(rgbValues: RGB[], depth: number): RGB[] {

        const MAX_DEPTH = 4;
        if (depth === MAX_DEPTH || rgbValues.length === 0) {
            const color = rgbValues.reduce(
                (prev, curr) => {
                    prev.r += curr.r;
                    prev.g += curr.g;
                    prev.b += curr.b;

                    return prev;
                },
                {
                    r: 0,
                    g: 0,
                    b: 0,
                }
            );

            color.r = Math.round(color.r / rgbValues.length);
            color.g = Math.round(color.g / rgbValues.length);
            color.b = Math.round(color.b / rgbValues.length);
            return [color];
        }

        const componentToSortBy: string = this.findBiggestColorRange(rgbValues);
        rgbValues.sort((p1, p2) => {
            //@ts-ignore
            return p1[componentToSortBy] - p2[componentToSortBy];
        });

        const mid = rgbValues.length / 2;
        return [
            ...this.quantization_(rgbValues.slice(0, mid), depth + 1),
            ...this.quantization_(rgbValues.slice(mid + 1), depth + 1),
        ];
    }
}

