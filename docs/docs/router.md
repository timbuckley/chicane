---
title: Router
sidebar_label: Router
---

The following cover the API exposed by a **Router** ([check out how to create one](/creating-your-router)).

## Router.{RouteName}

The Router has one per route. Takes the route params (if it has some), and returns a build URL.

- `params`: Required params for the route.

```ts
Router.UserDetail({ userId: "123" }); // "/users/123"
```

## Router.useRoute

Takes an array of routes to listen to (a subset of the router), and returns the route and its params if one matches.

- `routes` (**required**): `RouteName[]`

Returns a route match (or `undefined` if nothing matches):

- `name`: a route name
- `params`: its associated params

```ts
const route = Router.useRoute(["Home", "UserArea"]);

// then match on the route
```

## Router.push

Takes a route name and its associated params and navigates to it

- `name`: a route name
- `params`: its associated params

```ts
Router.push("Home");
Router.push("UserDetail", { userId: "123" });
```

## Router.replace

Takes a route name and its associated params and navigates to it **without** creating a new entry in the browser history.

- `name`: a route name
- `params`: its associated params

```ts
Router.replace("Home");
Router.replace("UserDetail", { userId: "123" });
```

## Router.{RouteName}.path

Provides the original string path passed to `createRouter` for the route name. Useful when the whole path must be passed to other routers like React Router

```ts
Router.UserList.path; // "/users"
Router.UserDetail.path; // "/user/:userId"
```
