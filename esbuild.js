const { build } = require('esbuild');
const { derver } = require('derver');
const {malinaPlugin} = require('malinajs/malina-esbuild');

const DEV = process.argv.includes('-w');

(async ()=>{
    if(DEV){
        await esbuild_lib({minify: false});
        await esbuild_test({minify: false});
        derver({
            dir: 'test/public',
            watch: ['test/public','test/src','cmp','js'],
            spa: true,
            onwatch:async (lr,item)=>{
                if(['test/src','cmp','js'].includes(item)){
                    lr.prevent();
                    await esbuild_lib({minify: false}, e => lr.error(e.toString(),'Build error'));
                    await esbuild_test({minify: false}, e => lr.error(e.toString(),'Build error'));
                }
            }
        })
    }else{
        await esbuild_lib();
        await esbuild_test();
    }
    
})();


async function esbuild_lib(options={},onerror){

    options = {
        entryPoints: ['js/index.js'],
        outfile: 'dist/malina-router.js',
        minify: true,
        bundle: true,
        format: 'esm',
        external:['./cmp/Route.xht','malinajs/runtime.js','storxy'],
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