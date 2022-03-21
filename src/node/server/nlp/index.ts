import * as crypto from 'crypto';
import { Sentence } from '../types';

/**
 * Split sentence to words
 * 
 * @param sentence 
 */
export function words(sentence: string): Sentence {

    const words = sentence.split(/[\s\.\,\;\!\-\"]+/)
        .map((w) => w.toLowerCase())
        .filter((w) => w.length>0)

    // create a hex for this sentence
    const sent = words.join(' ');
    const sha1sum = crypto.createHash('sha1')
    const hex = sha1sum.update(sent).digest('hex');
    
    return {
        words: words,
        sha1: hex
    }
}
