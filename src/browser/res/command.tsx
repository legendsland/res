/**
 * Supports shortcut key input
 * This should be the main interface, not clicks and ugly widgets.
 *
 * The idea of course is from the classic editor vi: minimal key strokes to achieve more.
 * To reproduce the 'feeling' of using real editor vi: quick, responsive, smooth and no bullshit.
 */

import * as $ from 'jquery';
import {useState} from 'react';
import {ShortcutHandler} from './shortcuts';
import {Cli} from './cli';
import {createRoot} from 'react-dom/client';

const ID = 'res-cmd-input';

export const CommandInput = (props: any) => {

    const parser: CommandParser = props.parser;

    const [input, setInput] = useState('');
    const [history, setHistory] = useState([]);
    const [backIndex, setBackIndex] = useState(0);

    const addHistory = () => {
        if (input !== '') {
            const newHistory = Object.assign(history);
            newHistory.push(input);
            setHistory(newHistory);
        }
    }

    const clear = () => {
        setInput('');
        setBackIndex(0);
    }

    const up = () => {
        if (history.length > 0) {
            const newIndex = Math.min(history.length - 1, backIndex + 1);
            setBackIndex(newIndex);
            setInput(history[newIndex]);
        }
    }

    const down = () => {
        if (backIndex > 0) {
            const newIndex = Math.max(0, backIndex - 1);
            setBackIndex(newIndex);
            setInput(history[newIndex]);
        }
    }

    const exec = () => {
        parser.exec(input);
    }

    const handleKeyDown = (event: any) => {
        const key = event.key
        console.log(`${input} <- ${key}`);

        switch (key) {
            case 'Escape':
                // save and clear
                addHistory();
                clear();
                break;
            case 'Enter':
                // execute the command
                exec();
                addHistory();
                clear();
                break;
            case 'ArrowUp':
                up();
                break;
            case 'ArrowDown':
                down();
                break;
            default:
                break;
        }

        return true;
    }

    const handleChange = (event: any) => {
        const newValue = event.target.value;
        setInput(newValue);
    }

    return <div>
        <input
            type="text"
            onKeyDown={handleKeyDown}
            onChange={handleChange}
            value={input}
        >

        </input>
    </div>
    ;
}

export class CommandParser {

    private cli: Cli;

    constructor(
        cli: Cli
    ) {
        this.cli = cli;
    }

    exec(command: string) {
        if (command.startsWith('/')) {
            this.cli.f(command.substring(1));
        }
    }
}

export class CommandShortcut implements ShortcutHandler {
    private readonly $elem: JQuery;
    private parser: CommandParser;

    constructor(
        cli: Cli
    ) {
        this.parser = new CommandParser(cli);

        // create instance if not exists
        if($(`#${ID}`).length === 0) {

            $('body').append(`<div id=${ID}></div>`);

            createRoot($(`#${ID}`)[0])
                .render(<CommandInput
                    parser={this.parser}
                ></CommandInput>);

            this.$elem = $(`#${ID}`);
            this.hide();
        }
    }

    canHandle(): string[] {
        return [
            'Escape',
            ':',
            '/',
        ]
    }

    handle(key: string): boolean {
        console.log(key);
        switch (key) {
            case ':':
            case '/':
                // if (this.isFocused()) {
                //     return true;
                // } else {
                //     this.show();
                //     return false;
                // }
                this.show();
                return true;
            case 'Escape':
                this.hide();
                return true;
            default:
                return true;
        }
    }

    show() {
        this.$elem.show();
        this.focus();
    }

    hide() {
        this.$elem.hide();
    }

    focus() {
        $('input', this.$elem).trigger('focus');
    }

    isFocused() {
        return $('input', this.$elem).is(':focus');
    }

    blur() {
        $('input', this.$elem).trigger('blur');
    }
}
////
