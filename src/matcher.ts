import { parsePath, Path as HistoryPath } from "history";
import { isMultipleParam, isNonEmpty, isParam } from "./helpers";
import { encodeSearch } from "./search";
import { Location, Matcher, Params, Search } from "./types";

// Kudos to https://reach.tech/router/ranking
const extractFromPathname = (pathname: string) => {
  const parts = pathname.split("/").filter(isNonEmpty);
  const path: Matcher["path"] = [];

  let ranking = parts.length > 0 ? parts.length * 4 : 5;

  for (const part of parts) {
    const param = isParam(part);
    ranking += param ? 2 : 3;
    path.push(param ? { name: part.substring(1) } : encodeURIComponent(part));
  }

  return { ranking, path };
};

export const getMatcher = (name: string, route: string): Matcher => {
  const { pathname = "/", search, hash } = parsePath(route);
  const isArea = pathname.endsWith("/*");

  const { ranking, path } = extractFromPathname(
    isArea ? pathname.slice(0, -2) : pathname,
  );

  const matcher: Matcher = {
    isArea,
    name,
    // penality due to wildcard
    ranking: isArea ? ranking - 1 : ranking,
    path,
    search: undefined,
    hash: undefined,
  };

  if (search != null) {
    matcher.search = {};
    const params = new URLSearchParams(search.substring(1));

    for (const [key] of params) {
      if (isMultipleParam(key)) {
        matcher.search[key.substring(1, key.length - 2)] = "multiple";
      } else if (isParam(key)) {
        matcher.search[key.substring(1, key.length)] = "unique";
      }
    }
  }

  if (hash != null && isParam(hash.substring(1))) {
    matcher.hash = hash.substring(2);
  }

  return matcher;
};

export const extractLocationParams = (
  location: Location,
  matcher: Matcher,
): Params | undefined => {
  const { path: locationPath } = location;
  const { isArea, path: matcherPath } = matcher;

  if (
    (!isArea && locationPath.length !== matcherPath.length) ||
    (isArea && locationPath.length < matcherPath.length)
  ) {
    return;
  }

  const params: Params = {};

  for (let index = 0; index < matcherPath.length; index++) {
    const locationPart = locationPath[index];
    const matcherPart = matcherPath[index];

    if (matcherPart == null) {
      continue;
    }

    if (typeof matcherPart !== "string") {
      if (locationPart == null) {
        return;
      } else {
        params[matcherPart.name] = locationPart;
        continue;
      }
    } else {
      if (matcherPart === locationPart) {
        continue;
      } else {
        return;
      }
    }
  }

  for (const key in matcher.search) {
    if (Object.prototype.hasOwnProperty.call(matcher.search, key)) {
      const matcherValue = matcher.search[key];
      const locationValue = location.search[key];

      if (matcherValue == null || locationValue == null) {
        continue;
      }

      if (matcherValue === "multiple") {
        params[key] =
          typeof locationValue === "string" ? [locationValue] : locationValue;
        continue;
      }

      if (typeof locationValue === "string") {
        params[key] = locationValue;
      } else if (locationValue[0] != null) {
        params[key] = locationValue[0];
      }
    }
  }

  if (matcher.hash != null && location.hash != null) {
    params[matcher.hash] = location.hash;
  }

  return params;
};

export const match = (
  location: Location,
  matchers: Matcher[],
): { key: string; name: string; params: Params } | undefined => {
  for (const matcher of matchers) {
    const params = extractLocationParams(location, matcher);

    if (params != null) {
      return { key: location.key, name: matcher.name, params };
    }
  }
};

export const matchToHistoryPath = (
  matcher: Matcher,
  params: Params = {},
): HistoryPath => {
  const pathname =
    "/" +
    matcher.path
      .map((part) =>
        encodeURIComponent(
          typeof part === "string" ? part : String(params[part.name]),
        ),
      )
      .join("/");

  // https://github.com/remix-run/history/issues/859
  let search = "";
  let hash = "";

  if (matcher.search != null) {
    const object: Search = {};

    for (const key in params) {
      const value = params[key];

      if (
        Object.prototype.hasOwnProperty.call(params, key) &&
        Object.prototype.hasOwnProperty.call(matcher.search, key) &&
        value != null
      ) {
        object[key] = value;
      }
    }

    search = encodeSearch(object);
  }

  if (matcher.hash != null) {
    const value = params[matcher.hash];

    if (typeof value === "string") {
      hash = "#" + encodeURIComponent(value);
    }
  }

  return { pathname, search, hash };
};
