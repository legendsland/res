import * as crypto from 'crypto';
import { Sentence } from '../types';

/**
 * Split sentence to words
 *
 * @param sentence
 */
export function words(sentence: string): Sentence {

    const sha1sum = crypto.createHash('sha1')
    const hex = sha1sum.update(sentence).digest('hex');

    const words = sentence.split(/[\s\.\,\;\!\-\"]+/)
        .map((w) => w.toLowerCase())
        .filter((w) => w.length>0)

    return {
        words: words,
        text: sentence,
        sha1: hex
    }
}
