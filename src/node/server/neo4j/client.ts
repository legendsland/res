
import * as neo4j from 'neo4j-driver';
import { Driver } from 'neo4j-driver-core';
import {keys} from '../../../../.keys';
import {Sentence} from '../types';
import {Session, Transaction} from 'neo4j-driver';

export async function testConnection(): Promise<boolean> {
    const uri = keys.neo4j.uri;
    const user = keys.neo4j.user;
    const pw = keys.neo4j.pw;

    return new Neo4jClient(uri, user, pw).check();
}

export class Neo4jClient {
    private readonly driver: Driver;
    private session: Session;

    constructor(
        private readonly uri?: string,
        private readonly user?: string,
        private readonly pw?: string
    ) {

        this.uri = this.uri || keys.neo4j.uri;
        this.user = this.user || keys.neo4j.user;
        this.pw = this.pw || keys.neo4j.pw;

        console.log(`connect to: ${this.user}  ${this.uri}`);
        this.driver = neo4j.driver(this.uri, neo4j.auth.basic(this.user, this.pw));
        this.session = this.driver.session();

    }

    async dispose() {
        await this.session.close();
        await this.driver.close();
    }

    async check(): Promise<boolean> {
        try {
            await this.driver.verifyConnectivity()
            console.log('Driver created')
            return true;
        } catch (error) {
            console.log(`connectivity verification failed. ${error}`)
            return false;
        }
    }

    async addSent(sent: Sentence): Promise<boolean> {
        let success = true;
        if (this.driver === undefined) {
            console.log('not connected');
            return Promise.resolve(false);
        }

        if (sent.words.length === 0) {
            // nothing to add
            return Promise.resolve(true);
        }

        let tx: Transaction;
        try {
            tx = this.session.beginTransaction();

            let stmt = `MERGE(:Sentence{text: "${sent.text}", sha1: "${sent.sha1}"})`;

            console.log(stmt);

            tx.run(stmt);

            if (sent.words.length == 1) {
                tx.run(`MERGE(:Word{text: "${sent.words[0]}"})`);
            } else {
                sent.words.reduce((prev, curr) => {
                    // two nodes
                    tx.run(`
                        MERGE(:Word{text: "${prev}"})
                        MERGE(:Word{text: "${curr}"})
                    `);

                    // relationship between two nodes
                    tx.run(`
                    MATCH
                        (a:Word{text: "${prev}"}),
                        (b:Word{text: "${curr}"})
                    MERGE (a)-[:SENTENCE_NEXT]->(b)
                    `);

                    // relationship between words and sentence
                    tx.run(`
                    MATCH
                        (a:Word{text: "${prev}"}),
                        (s:Sentence{sha1: "${sent.sha1}"})
                    MERGE (a)-[:IN_SENTENCE]->(s)
                    `);

                    tx.run(`
                    MATCH
                        (a:Word{text: "${curr}"}),
                        (s:Sentence{sha1: "${sent.sha1}"})
                    MERGE (a)-[:IN_SENTENCE]->(s)
                    `);

                    return curr;
                });
            }

            await tx.commit();

            console.log('tx finished');

        } catch (error ) {
            console.log(error);
            success = false;
        }
        finally {
            if (tx !== undefined) {
                await tx.close();
            }
        }

        return Promise.resolve(success);
    }
}

