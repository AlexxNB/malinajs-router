# malinajs-router

Declarative router for [Malina.js](https://malinajs.github.io) web applications.

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

## Redirect

An `redirect` property will rdirects user to another page.

```html
<!-- will redirect user to the /anotherpage only 
     when given URL is /page1, but not /page1/subpage -->
<Route path="/page1" redirect="/anotherpage" />

<!-- will redirect user to the /anotherpage when 
     given URL is /page1 or /page1/subpage -->
<Route path="/page1/*" redirect="/anotherpage" />

```