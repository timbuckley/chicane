import { expectType } from "tsd";
import { test } from "vitest";
import {
  ConcatPaths,
  ConcatSearchs,
  GetAreaRoutes,
  GetHashParams,
  GetPathParams,
  GetSearchParams,
  NonEmptySplit,
  ParseRoute,
  ParseRoutes,
  PrependBasePath,
} from "../src/types";

// @ts-expect-error
const toBe = <T>(): T => {};

test("ParseRoute", () => {
  expectType<ParseRoute<"/foo?bar#baz">>(
    toBe<{ path: "/foo"; search: "bar"; hash: "baz" }>(),
  );

  expectType<ParseRoute<"/foo?bar">>(
    toBe<{ path: "/foo"; search: "bar"; hash: "" }>(),
  );

  expectType<ParseRoute<"/foo#baz">>(
    toBe<{ path: "/foo"; search: ""; hash: "baz" }>(),
  );

  expectType<ParseRoute<"/foo/bar">>(
    toBe<{ path: "/foo/bar"; search: ""; hash: "" }>(),
  );

  expectType<ParseRoute<"/foo/bar?baz&qux">>(
    toBe<{ path: "/foo/bar"; search: "baz&qux"; hash: "" }>(),
  );

  expectType<ParseRoute<"/foo/bar/baz#qux">>(
    toBe<{ path: "/foo/bar/baz"; search: ""; hash: "qux" }>(),
  );
});

test("NonEmptySplit", () => {
  expectType<NonEmptySplit<"/foo", "/">>(toBe<["foo"]>());
  expectType<NonEmptySplit<"foo", "&">>(toBe<["foo"]>());

  expectType<NonEmptySplit<"/foo/bar", "/">>(toBe<["foo", "bar"]>());
  expectType<NonEmptySplit<"foo/bar/", "/">>(toBe<["foo", "bar"]>());
  expectType<NonEmptySplit<"/foo/bar", "/">>(toBe<["foo", "bar"]>());
  expectType<NonEmptySplit<"/foo//bar", "/">>(toBe<["foo", "bar"]>());

  expectType<NonEmptySplit<"foo&bar", "&">>(toBe<["foo", "bar"]>());
  expectType<NonEmptySplit<"foo&bar&", "&">>(toBe<["foo", "bar"]>());
  expectType<NonEmptySplit<"&foo&bar", "&">>(toBe<["foo", "bar"]>());
  expectType<NonEmptySplit<"foo&&bar", "&">>(toBe<["foo", "bar"]>());
});

test("GetPathParams", () => {
  expectType<GetPathParams<"/foo/bar">>(toBe<{}>());
  expectType<GetPathParams<"/foo/:bar">>(toBe<{ bar: string }>());

  expectType<GetPathParams<"/:foo/:bar">>(toBe<{ foo: string; bar: string }>());
});

test("GetSearchParams", () => {
  expectType<GetSearchParams<"foo&bar">>(toBe<{}>()); // no params

  expectType<GetSearchParams<"foo&:bar&:baz">>(
    toBe<{ bar?: string; baz?: string }>(),
  );

  expectType<GetSearchParams<":foo&:bar&:baz[]">>(
    toBe<{ foo?: string; bar?: string; baz?: string[] }>(),
  );
});

test("GetHashParams", () => {
  expectType<GetHashParams<"foo">>(toBe<{}>()); // no param
  expectType<GetSearchParams<":foo">>(toBe<{ foo?: string }>());
});

test("ConcatPaths", () => {
  expectType<ConcatPaths<"/foo", "/bar">>(toBe<"/foo/bar">());
  expectType<ConcatPaths<"/foo", "/">>(toBe<"/foo">());
  expectType<ConcatPaths<"/foo", "">>(toBe<"/foo">());
  expectType<ConcatPaths<"/", "/bar">>(toBe<"/bar">());
  expectType<ConcatPaths<"", "/bar">>(toBe<"/bar">());
  expectType<ConcatPaths<"/foo/bar", "/baz">>(toBe<"/foo/bar/baz">());
});

test("ConcatSearchs", () => {
  expectType<ConcatSearchs<":foo", ":bar">>(toBe<":foo&:bar">());
  expectType<ConcatSearchs<":foo", "">>(toBe<":foo">());
  expectType<ConcatSearchs<"", ":bar">>(toBe<":bar">());
  expectType<ConcatSearchs<":foo&:bar", ":baz">>(toBe<":foo&:bar&:baz">());
});

test("GetAreaRoutes", () => {
  expectType<
    GetAreaRoutes<
      ParseRoutes<{
        User: "/users/:userId";
        RepositoriesArea: "/users/:userId/repositories/*?:foo&:bar[]#:baz";
      }>
    >
  >(
    toBe<{
      RepositoriesArea: {
        path: "/users/:userId/repositories";
        hash: ":baz";
        search: ":foo&:bar[]";
      };
    }>(),
  );
});

test("PrependBasePath", () => {
  type Input = {
    a: ParseRoute<"/">;
    b: ParseRoute<"/foo/bar">;
    c: ParseRoute<"/foo?:bar#:baz">;
  };

  expectType<PrependBasePath<"", Input>>(
    toBe<{
      a: { path: "/"; search: ""; hash: "" };
      b: { path: "/foo/bar"; search: ""; hash: "" };
      c: { path: "/foo"; search: ":bar"; hash: ":baz" };
    }>(),
  );

  expectType<PrependBasePath<"/", Input>>(
    toBe<{
      a: { path: "/"; search: ""; hash: "" };
      b: { path: "/foo/bar"; search: ""; hash: "" };
      c: { path: "/foo"; search: ":bar"; hash: ":baz" };
    }>(),
  );

  expectType<PrependBasePath<"/base", Input>>(
    toBe<{
      a: { path: "/base"; search: ""; hash: "" };
      b: { path: "/base/foo/bar"; search: ""; hash: "" };
      c: { path: "/base/foo"; search: ":bar"; hash: ":baz" };
    }>(),
  );
});
