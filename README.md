# malinajs-router

Declarative router for [Malina.js](https://malinajs.github.io) web applications.

## Contents
- [Usage](#usage)
- [Links](#links)
- [Nested routes](#nested-routes)
- [Redirects](#redirects)
- [Fallbacks](#fallbacks)
- [URL metadata](#url-metadata)
  - [Query](#query)
  - [Parameters](#parameters)
- [Router API](#router-api)
  - [Programmatic navigation](#programmatic-navigation)
  - [Navigation method](#navigation-method)

## Usage

There is only one `Route` component you should to import into your project. Example of the simple routes stricture:

```html
//App.xht
<script>
  import {Route} from 'malinajs-router';
  import Contacts from './Contacts.xht';
</script>

<a href="/">Home</a> 
<a href="/about">About</a>
<a href="/portfolio">Portfolio</a>
<a href="/contacts">Contacts</a>

<Route>
  <Route path="/">This is main page</Route>
  <Route path="/about">This is about page</Route>
  <Route path="/contacts"><Contacts/></Route>
  <Route path="/portfolio/*">

    <a href="/portfolio/photos">Photography</a>
    <a href="/portfolio/websites">Websites</a>

    <Route path="/">Please choose a section</Route>
    <Route path="/photos">My photo gallery...</Route>
    <Route path="/websites">My websites gallery...</Route>

  </Route>
<Route>
```

## Links

Use common `a` links with needed `href` attribute in your app. They will be handeled by router. You don't need to change `href`s when you use different navigation methods.

```html
<a href="/">Main page</a>
<a href="/foo">Foo page</a>
```

Also you can use hash-based notation, but usualy it is not necessary.

```html
<a href="/#/">Main page</a>
<a href="/#/foo">Foo page</a>
```

## Nested routes

Routes may be two types exact and non-exact.  Non-exact routes must have an `path` property which ends with `/*`.

* `exact`-route will be shown only when its `path` property exactly match given URL. 
* `non-exact`-route will be shown when its `path` property coresponding URL from start. Place nested routes only inside non-exact routes.

*Examples:*

```html
<!-- shows only when URL is /page1, but not /page1/subpage -->
<Route path="/page1">Page1</Route> 

<!-- shows when URL is /page2 or /page2/subpage -->
<Route path="/page2/*">Page2</Route> 

<!-- place nested routes inside non-exact routes only -->
<Route path="/page3/*">
  <Route path="/subpage"> 
</Route>

<!-- this will cause an error -->
<Route path="/page3">
  <Route path="/subpage"> 
</Route>
```

## Redirects

An `redirect` property will rdirects user to another page.

```html
<!-- will redirect user to the /anotherpage only 
     when given URL is /page1, but not /page1/subpage -->
<Route path="/page1" redirect="/anotherpage" />

<!-- will redirect user to the /anotherpage when 
     given URL is /page1 or /page1/subpage -->
<Route path="/page1/*" redirect="/anotherpage" />

```

## Fallbacks

When you need to show something to user when no any matched routes were found, use `fallback` property. It is important, that routes should be inside of nonexact Route component. 

Fallbacks are bubbling, so when there no route matched under any nonexact subroute and it not have a fallback on its level, will be shown fallback from upper levels(firs occured). For example:

```html
<Route>
  <Route path="/">Root</Route>
  <Route path="/foo/*">
     <Route path="/">Foo root</Route> 
     <Route fallback>404. Page not in foo</Route>
  </Route>
  <Route path="/bar/*">
     <Route path="/">Bar root</Route>
  </Route>
  <Route fallback>404. Page not found</Route>
</Route>
```

In this example, any URL except `/`,`/foo` or `/bar` will cause fallback showing.  If URL is like `/foo/something` - will be shown fallback `Page not in foo`, but for URL like `/bar/something` will be shown common fallback from upper level, because there no fallbacks on its level.

## Force reload

Sometimes you need that content inside `Route` slot would be reloaded each time the URL changes. For example, when Route's path has parameter components inside slot never be rerendered when paramaeter changes. Add the `force` property to reload `Route` content each time something changes un the URL.

```html
<Route>
  <Route path="/foo/:param">
    <input *{$element.value = ''} />
  </Route>
</Route>
```

## URL metadata

Each Route component provide additional metadata from URL as slot variables... 

```html
<Route>
  {#slot url,query,params}
    Query for this route is: {query.toJson()}
  {/slot}
</Route>
```
... or as a store from component's context.

```html
<!-- App.xht-->
<Route>
  <Sub/>
</Route>

<!-- Sub.xht-->
<script>
  let url;
  let query;
  let params;

  $context.route.subscribe( meta => {
    url = meta.url;
    query = meta.query;
    params = meta.params;
  });
</script>

Query for this route is: {query.toJson()}
```

At the moment you can get folowing metadata:
- `url` - current URL (only path without query)
- `query` - query string parsed in object
- `params` - parameters values from URL

### Query

Query string is a part of URL where you can path some data. It is situated right after `?` sign in URL. It is parsed in object.

For example, `?hello=world&&foo` will be parsed in object `{hello:"world",foo: true}`.

### Parameters

You can get slugs from URL as parameters, just use `:name` notation to define parameter place in the `path` property of the `Route` component.

```html
<!-- Example URL - /books/stanislav_lem/solaris-->
<Route path="/book/:author">
  {#slot params}
    <!-- Params here: {author: "stanislav_lem"} -->
    Author: {params.author}
  {/slot}
  <Route path="/:title">
    {#slot params}
      <!-- Params here: {author: "stanislav_lem", title: "solaris"} -->
      Book title: {params.title}
    {/slot}
  </Route>
</Route>
```

## Router API

Use `router` import to perform some actions and settings for routing.

```js
import {router} from 'malinajs-router';
```

### Programmatic navigation

You can perform user to navigate to any path using `goto` method.

```js
router.goto('/some/path');
```

### Navigation method

The `malinajs-router` supports two types of navigation - History API and hash-based routing. B

- **History API** - in this case you'll get common URL path for each page like `/`,`/foo`,`/foo/bar`. Page not reladed when user folows links on a page. But you must do some additional settings on your production server(nginx,apache,derver) to serve all requests to `index.html` file to avoid `404` error, when user starts navigating not from root URL. This method used by default, except when app is loaded inside frame. 

- **Hash-based** - in some cases you need to use this type of routing. In this case URL path will be situated in fragment part of URL only, right after `#` sign. For example, `#/`, `#/foo`,`#/foo/bar`. It is good choice when you can't setup your server to support Histroy API. If your app is loadied inside frame, this method will be active by default, in other cases you may to turn on hash-based method by calling `router.method` in your app's root file, usually `App.xht`.

```js
import {router} from 'malinajs-router';
router.method('hash');
```