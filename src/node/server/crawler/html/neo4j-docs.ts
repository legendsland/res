
import * as cheerio from 'cheerio'
import got from 'got';
import * as url from 'url'
import * as fs from 'fs'

export async function crawler() {
    const context = await getToc();
    
    fs.writeFileSync('/home/zhangyi/ws/res/out.html', context);
}

const baseUrl = 'https://neo4j.com/docs/cypher-manual/current/'

async function getToc() {

    let html = '<html><head>\n';

    console.log(baseUrl);
    const { body } = await got(baseUrl);

    const $ = cheerio.load(body);

    const styles = await Promise.all($('link[rel="stylesheet"]').get().map(async (css: any) => {

        const $css = $(css);
        
        const url_ = url.resolve(baseUrl, $css.attr('href'));

        console.log(url_);
        const { body } = await got(url_);

        //TODO: embed fonts


        return body;
    }));

    const css = `<style>${styles.join('\n')}</style>`;

    const subpages = ($('.nav-list li a').get().map((a: any) => {

        const $a = $(a);

        const title = $a.text();
        const url_ = url.resolve(baseUrl, $a.attr('href'));

        return {
            title: title,
            url: url_
        }

    }));

    const htmls = await Promise.all(subpages.map(async (page: any): Promise<any> => {
        return await get(page.title, page.url); 
    }));

    return html + css + '</head>\n<body>' + htmls.map(html => html.content).join('\n') + '</body></html>';
}

async function get(title: string, pageUrl: string) {

    console.log(pageUrl);
    const { body } = await got(pageUrl);

    const $ = cheerio.load(body);

    // anchors

    $('[id]').get().map(a => {
        const $a = $(a);

        const start = pageUrl.indexOf(baseUrl);
        if(start !== -1) {
            const newId =  pageUrl.substring(baseUrl.length).replace(/\//g, '-') + $a.attr('id');

            console.log(`${$a.attr('id')} -> ${newId}`)

            $a.attr('id', newId);
        }
    });

    // links

    $('a[href]').get().map(a => {
        const $a = $(a);

        const url_ = url.resolve(pageUrl, $a.attr('href'));

        const start = url_.indexOf(baseUrl);
        if (start !== -1) {

            const newUrl = '#' + url_.substring(baseUrl.length).replace(/\//g, '-').replace(/#/, '');
            console.log(`${$a.attr('href')} -> ${newUrl}`)

            $a.attr('href', newUrl);


        }

    });

    // images
    await Promise.all($('img[src]').get().map(async a => {
        const $a = $(a);

        let src = $a.attr('src');

        const parts = src.split('.');
        let ext = 'png';
        if (parts.length>1) {
            ext = parts[parts.length-1];
        }

        // external source
        if( src.startsWith('http') ) {

        } else if ( !src.startsWith('data:image') ) {
            // local 

            src = url.resolve(pageUrl, src);
        } else {

            return '';
        }

        if (src === 'https://dist.neo4j.com/wp-content/uploads/20210422142941/neo4j-logo-2020.svg') {
            return '';
        }

        const aaa = src.split('/');
        const name = aaa[aaa.length-1].substring(0, 64);
        
        const data = await new Promise<string>((resolve, reject) => {

            /** server would block */
            setTimeout(async () => {

                console.log('got image: ' + src);
                const {body, headers} = await got(src, {responseType: 'buffer'});

                fs.writeFileSync(`/home/zhangyi/ws/res/tmp/${name}`, body);

                const data = `data:${headers['content-type']};base64,` + Buffer.from(body).toString('base64');
        
                resolve(data);
        

            }, 5000);
        })

        $a.attr('src', data);

    }));



    const id = pageUrl.substring(baseUrl.length).replace(/\//g, '-');

    return {
        content: $('main .content').wrap(`<div><div id="${id}"></div></div>`).parent().parent().html()
    }
}
