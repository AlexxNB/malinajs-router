const { build } = require('esbuild');
const { derver } = require('derver');
const {malinaPlugin} = require('malinajs/malina-esbuild');

const DEV = process.argv.includes('-w');

if(DEV){
    esbuild_lib({minify: false});
    esbuild_test({minify: false});
    derver({
        dir: 'test/public',
        watch: ['test/public','test/src','cmp','js'],
        spa: true,
        onwatch:(lr,item)=>{
            if(['test/src','cmp','js'].includes(item)){
                lr.prevent();
                esbuild_lib({minify: false}, e => lr.error(e.toString(),'Build error'));
                esbuild_test({minify: false}, e => lr.error(e.toString(),'Build error'));
            }
        }
    })
}else{
    esbuild_lib();
    esbuild_test();
}


async function esbuild_lib(options={},onerror){

    options = {
        entryPoints: ['js/index.js'],
        outfile: 'dist/index.js',
        minify: true,
        bundle: true,
        format: 'esm',
        external:['./cmp/Route.xht','storik'],
        ...options
    };

    try{
        await build(options)
    }catch(e){
        onerror ? onerror(e) :  process.exit(1);
    }
}

async function esbuild_test(options={},onerror){

    options = {
        entryPoints: ['test/src/main.js'],
        outfile: 'test/public/bundle.js',
        minify: true,
        bundle: true,
        plugins: [malinaPlugin()],
        ...options
    };

    try{
        await build(options)
    }catch(e){
        onerror ? onerror(e) :  process.exit(1);
    }
}