


export class ProgramRunner {


    constructor() {
    }

    run(code: string) {
        console.log(code);

        return Promise.resolve(code);
    }

}
