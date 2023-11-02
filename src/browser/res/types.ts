/********************************************************************************
 * Copyright (C) 2023 Zhangyi
 ********************************************************************************/

export function color2Str(color: number[]): string {
    const r = color[0];
    const g = color[1];
    const b = color[2];
    const a = color[3] / 255;

    return `rgba(${r}, ${g}, ${b}, ${a})`;
}

export function invertedColor2Str(color: number[], highContrast?: boolean): string {
    let r = color[0];
    let g = color[1];
    let b = color[2];
    const a = color[3] / 255;

    if (highContrast) {
        if ((r * 0.299 + g * 0.587 + b * 0.114) > 186) {
            r = g = b = 0;
        } else {
            r = g = b = 255;
        }
    } else {
        r = 255 - r;
        g = 255 - g;
        b = 255 - b;
    }

    return `rgba(${r}, ${g}, ${b}, ${a})`;
}
