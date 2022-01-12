import {store} from 'storxy';

export const router = routerStore();

function routerStore(){
  let useHash = window.location.pathname === 'srcdoc';

  const getLocation = ()=>{
    return useHash ? getLocationHash() : getLocationHistory();
  };

  const go = (href,store) => {
    useHash ? window.location.hash=href : history.pushState({}, '', href);
    store.$ = getLocation();
  };

  const locStore = store(getLocation(), () => {

    window.hashchange = window.onpopstate = () => {
      locStore.$ = getLocation();
    };

    const removeListener = linkListener(href => go(href,locStore));

    return () => {
      window.hashchange = window.onpopstate = null;
      removeListener();
    };
  });

  return {
    subscribe: locStore.subscribe,
    goto: href => go(href,locStore),
    method: method => locStore.$ = getLocation(useHash = method === 'hash')
  };
}

function getLocationHistory(){
  return {
    path: window.location.pathname,
    query: parseQuery(window.location.search.slice(1)),
    hash: window.location.hash.slice(1)
  };
}

function getLocationHash(){
  const match = String(window.location.hash.slice(1)||'/').match(/^([^?#]+)(?:\?([^#]+))?(?:#(.+))?$/);
  return {
    path: match[1] || '',
    query: parseQuery(match[2] || ''),
    hash: match[3] || '',
  };
}

function linkListener(go){
  const h = e => {
    const a = e.target.closest('a[href]');
    if(a && /^\/$|^\/\w|^\/#\/\w/.test(a.getAttribute('href'))) {
      e.preventDefault();
      go(a.getAttribute('href').replace(/^\/#/,''));
    }
  };

  addEventListener('click', h);
  return () => removeEventListener('click', h);
}

function parseQuery(str){
  const o= str.split('&')
    .map(p => p.split('='))
    .reduce((r,p) => {
      const name = p[0];
      if(!name) return r;
      let value = p.length > 1 ? p[p.length-1] : true;
      if(typeof value === 'string' && value.includes(',')) value = value.split(',');
      (r[name] === undefined) ? r[name]=[value] : r[name].push(value);
      return r;
    },{});

  return Object.entries(o).reduce((r,p)=>(r[p[0]]=p[1].length>1 ? p[1] : p[1][0],r),{});
}