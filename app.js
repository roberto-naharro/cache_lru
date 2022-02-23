const R = require("ramda");
const readline = require("readline");
const fs = require("fs");

/**
 * Get element index with the lowest hit value
 */
const getOlderElementIdx = R.pipe(
  R.prop("elements"),
  R.reduce(
    (result, element) =>
      element.hit < result.hit
        ? { ...element, idx: result.idx + 1, idxMin: result.idx + 1 }
        : { ...result, idx: result.idx + 1, idxMin: result.idxMin },
    { idx: -1, hit: Infinity, idxMin: -1 }
  ),
  R.prop("idxMin")
);

/**
 * Increase the hit number of the element
 * @param {string} value value to update
 * @param {Cache} cache cache information
 * @returns cache element
 */
const accessElement = (value, cache) => {
  return { value, hit: cache.hit };
};

/**
 * Insert a new element in the cache, increasing the hit number. If the cache is full, overwrite the
 * oldest element
 * @param {string} element
 * @param {Cache} cache
 * @returns updated cache
 */
const insertNewElement = (element, cache) =>
  cache.size > cache.elements.length
    ? {
        size: cache.size,
        elements: [...cache.elements, accessElement(element, cache)],
        hit: cache.hit + 1,
      }
    : {
        size: cache.size,
        elements: R.pipe(
          getOlderElementIdx,
          R.update(R.__, accessElement(element, cache), cache.elements)
        )(cache),
        hit: cache.hit + 1,
      };

/**
 * Look for an element, and update the hit value
 * @param {string} element
 * @param {Cache} cache
 * @returns undefined if the element is not found, the new cache otherwise
 */
const updateIfExists = (element, cache) =>
  R.pipe(
    R.prop("elements"),
    R.findIndex((elem) => elem?.value === element),
    R.ifElse(
      R.equals(-1),
      () => undefined,
      (idx) => ({
        size: cache.size,
        elements: R.update(idx, accessElement(element, cache), cache.elements),
        hit: cache.hit + 1,
      })
    )
  )(cache);

/**
 * Looks for an element, update the hit if it's found, otherwise, save the item and delete the
 * oldest one if there is no space in the cache
 * @param {string} element
 * @param {Cache} cache
 * @returns the new cache
 */
const insertElement = (element, cache) =>
  R.pipe(
    () => updateIfExists(element, cache),
    R.unless(
      (cache) => cache !== undefined,
      () => insertNewElement(element, cache)
    )
  )();

// -------------------------------------------------------------------------------------------------
const args = process.argv.slice(2);

if (args < 2) {
  throw new Error("Invalid params");
}

const ws = fs.createWriteStream(args[1], {
  defaultEncoding: "utf8",
});

const rl = readline.createInterface({
  input: fs.createReadStream(args[0]),
});

let cache = {
  elements: [],
  hit: 1,
};

rl.on("line", function (input) {
  if (!cache.size) {
    cache.size = Number(input);
    return;
  }

  cache = insertElement(input, cache);
});

rl.on("close", () => {
  cache.elements.forEach((element) => ws.write(element.value + "\n"));
});
