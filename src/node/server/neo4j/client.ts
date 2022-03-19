
import * as neo4j from 'neo4j-driver';
import { Driver } from 'neo4j-driver-core';

let driver: Driver = undefined;

export async function testConnection(): Promise<Driver | undefined> {

    const pw = 'puma-lava-trinity-madrid-unit-473';
    const uri = 'neo4j://localhost:7687';

    driver = neo4j.driver(uri, neo4j.auth.basic('neo4j', pw))
    const session = driver.session()

    return new Promise((resolve, reject) => {
        session.run(
            'Match () Return 1 Limit 1'
        ).then(result => {
            session.close();
            resolve(driver);
        }).catch(() => {
            reject(undefined);
        });
    })
}


