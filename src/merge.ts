const fs = require('fs');

const iframe = `<iframe srcdoc="" style="width:100%; height: 100%;" frameborder="0" hspace="0" vspace="0" marginheight="0" marginwidth="0"></iframe>`;

/**
 * first file is the rest to be merged into.
 * merge in array order
 */
export function merge(files: string[], output: string) {
    console.log(files);

    if (files === undefined || files.length === 0) {
        return '';
    } else if (files.length === 1) {
        return fs.readFileSync(files[0]).toString();
    }

    let merged = '';
    for(let i=1; i<files.length; ++i) {
        merged += merge2(files[i-1], files[i]);
    }

    fs.writeFileSync(output, merged);
}

function merge2(to: string, from: string) {

    const tofile = fs.readFileSync(to).toString();
    const fromfile = fs.readFileSync(from).toString().replace(/"/g, '&quot;');

    const idx = tofile.indexOf('</body>');
    if (idx !== -1) {
        
        const pos = iframe.indexOf('"') + 1;
        
        const iframe_str = iframe.slice(0, pos) + fromfile + iframe.slice(pos);

        const merged = tofile.slice(0, idx) + iframe_str + tofile.slice(idx);

        // console.log(merged);

        return merged;
    } else {
        console.log('</body> not fouund');

        return fromfile;
    }
}
