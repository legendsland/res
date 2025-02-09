/********************************************************************************
 * Copyright (C) 2023 Zhangyi
 ********************************************************************************/

import $ from 'jquery';
import {
    useEffect, useState, useReducer,
} from 'react';
import { createRoot } from 'react-dom/client';
import { color2Str, invertedColor2Str } from './types';

export const StatusBarView = (props: any) => {
    const { sb } = props;

    const initialState = {
        palette: [
            { fg: 'rgba(0,0,0,0)', bg: 'rgba(255,255,255,0)' },
            { fg: 'rgba(0,0,0,0)', bg: 'rgba(255,255,255,0)' },
            { fg: 'rgba(0,0,0,0)', bg: 'rgba(255,255,255,0)' },
            { fg: 'rgba(0,0,0,0)', bg: 'rgba(255,255,255,0)' },
            { fg: 'rgba(0,0,0,0)', bg: 'rgba(255,255,255,0)' },
        ],
        colors: [
            { fg: 'rgba(0,0,0,1)', bg: 'rgba(255,255,255,1)' },
            { fg: 'rgba(0,0,0,1)', bg: 'rgba(255,255,255,1)' },
        ],
    };

    const [force, _forceUpdate] = useReducer((x) => x + 1, 0);
    const [stat, setStat] = useState(initialState);

    const handlePalette = (color_: number[][]) => {
        const s = { ...stat };
        for (let i = 0; i < Math.min(initialState.palette.length, color_.length); ++i) {
            s.palette[i].bg = color2Str(color_[i]);
            s.palette[i].fg = invertedColor2Str(color_[i], true);
        }
        // console.log(s);
        setStat(s);
    };

    const handleColor = (color_: number[]) => {
        const s = { ...stat };
        s.colors[1].bg = color2Str(color_);
        s.colors[1].fg = invertedColor2Str(color_, true);
        setStat(s);
    };

    const handlePickColor = () => {
        const color_ = stat.colors[1];
        const s = { ...stat };
        s.colors[0].fg = color_.fg;
        s.colors[0].bg = color_.bg;
        setStat(s);
    };

    useEffect(() => {
        sb.listen((event: string, data: any) => {
            if (event === 'color') {
                handleColor(data);
            } else if (event === 'pickColor') {
                handlePickColor();
            } else if (event === 'palette') {
                handlePalette(data);
            }
        });
    }, []);

    return (
        <div
            id={sb.id}
            key={force}
        >
            {
                stat.palette.map((c, idx) => (
                    <div
                        key={`palette-${idx}`}
                        style={{
                            fontSize: '12px',
                            width: '120px',
                            textAlign: 'left',
                            // @ts-ignore
                            color: c.fg,
                            // @ts-ignore
                            backgroundColor: c.bg,
                            marginTop: 0,
                            paddingTop: 0,
                        }}
                    >
                        {c.bg}
                    </div>
                ))
            }
            {
                stat.colors.map((c, idx) => (
                    <div
                        key={`colors-${idx}`}
                        style={{
                            fontSize: '12px',
                            width: '120px',
                            textAlign: 'left',
                            // @ts-ignore
                            color: c.fg,
                            // @ts-ignore
                            backgroundColor: c.bg,
                            marginTop: 0,
                            paddingTop: 0,
                        }}
                    >
                        {c.bg}
                    </div>
                ))
            }
        </div>
    );
};

export type Stat = {
    [key: string]: any;
}

export class StatusBar {
    private $elem_: JQuery;

    private listeners_: Set<(event: string, data: any)=>void> = new Set<(event: string, data: any) => void>();

    stat: Stat = {
        color: [255, 255, 255, 1],
    };

    constructor(
        readonly id: string,
    ) {
        this.$elem_ = $(`${this.id}`);
        if (this.$elem_.length === 0) {
            $('body').append(`<div id="${this.id}-container">`);
        }

        createRoot(document.getElementById(`${this.id}-container`)).render(<StatusBarView sb={this} />);

        this.$elem_ = $(`${this.id}`);
    }

    listen(callback: (event: string, data: any) => void) {
        this.listeners_.add(callback);
    }

    update(stat: Stat) {
        this.listeners_.forEach((l) => {
            Object.entries(stat).forEach(([k, v]) => {
                this.stat[k] = v;
                l(k, v);
            });
        });
    }
}
