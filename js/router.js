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
    query: parseQuery(window.location.href),
    hash: window.location.hash.slice(1)
  };
}

function getLocationHash(){
  const match = String(window.location.hash.slice(1)||'/').match(/^([^?#]+)(?:\?([^#]+))?(?:#(.+))?$/);
  return {
    path: match[1] || '',
    query: parseQuery(window.location.href),
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
  const url = new URL(str).searchParams;
    
  let query = {};

  for(let [name, value] of url) {
      query[`${name}`] = value;
  }

  return query;
}