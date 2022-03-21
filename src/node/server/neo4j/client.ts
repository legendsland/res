
import { Sentence } from 'natural';
import * as neo4j from 'neo4j-driver';
import { Driver } from 'neo4j-driver-core';
import {keys} from '../../../../.keys';

let driver: Driver = undefined;

export async function testConnection(): Promise<Driver | undefined> {
    const pw = keys.neo4j.pw;
    const uri = 'neo4j://localhost:7687';

    return new Neo4jClient(uri, pw).connect();
}

export class Neo4jClient {
    private driver: Driver;

    constructor(
        private uri: string,
        private pw: string
    ) {

    }

    async connect(): Promise<Driver | undefined> {
        this.driver = neo4j.driver(this.uri, neo4j.auth.basic('neo4j', this.pw))
        const session = driver.session()

        return new Promise((resolve, reject) => {
            session.run(
                'Match () Return 1 Limit 1'
            ).then(result => {
                session.close();
                resolve(this.driver);
            }).catch(() => {
                reject(undefined);
            });
        })
    }

    async addSent(sent: Sentence): Promise<boolean> {
        if (this.driver === undefined) {
            console.log('not connected');
            return false;
        }

        

    }
}

