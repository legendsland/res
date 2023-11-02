/********************************************************************************
 * Copyright (C) 2023 Zhangyi
 ********************************************************************************/

import $ from 'jquery';

export interface ShortcutHandler {
    // canHandle(key: string): boolean,
    handle(key: string): boolean;
    canHandle(): string[];
}

export class Shortcuts {
    private readonly $body: JQuery;

    private readonly handlers = new Map<string, Set<ShortcutHandler>>();

    constructor() {
        this.$body = $('body');
    }

    add(handler: ShortcutHandler) {
        handler.canHandle().forEach((key) => {
            let handlers = this.handlers.get(key);
            if (handlers === undefined) {
                handlers = new Set<ShortcutHandler>();
                this.handlers.set(key, handlers);
            }
            handlers.add(handler);
        });
    }

    listen() {
        this.$body.on('keydown', (event) => {
            const _handlers = this.handlers.get(event.key);
            const handlers = _handlers === undefined ? [] : Array.from(_handlers);
            let result = true;
            for (let i = 0; i < handlers.length; ++i) {
                result = handlers[i].handle(event.key);
                if (!result) {
                    return false; // break on false return, not continue
                }
            }
            return result;
        });
    }
}
