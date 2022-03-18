
import * as neo4j from 'neo4j-driver';



export function test() {

    const pw = 'puma-lava-trinity-madrid-unit-473';
    const uri = 'neo4j://localhost:7687';

    const driver = neo4j.driver(uri, neo4j.auth.basic('neo4j', pw))
    const session = driver.session()

    const resultPromise = session.writeTransaction(tx =>
        tx.run(
            'CREATE (a:Greeting) SET a.message = $message RETURN a.message + ", from node " + id(a)',
            { message: 'hello, world' }
        )
    );

    resultPromise.then(result => {
        session.close()

        const singleRecord = result.records[0]
        const greeting = singleRecord.get(0)

        console.log(greeting)

        // on application exit:
        driver.close()
    });
}
