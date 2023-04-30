import fs from "fs";
import axios from "axios";
import * as cheerio from "cheerio";
import StyleDictionary from "style-dictionary";
import path from "path";

function parseSection($, paletteId, sectionId, dom) {
  const prefix = `palette-${paletteId}-color-${sectionId}`;
  const result = new Map();
  const heads = dom.find("h4");

  if (heads.length === 0) {
    dom.find(".section-hues-row").each((i, row) => {
      let title = $(row)
        .find(".hue-title")
        .text()
        .toLowerCase()
        .trim()
        .replace(/\s/gi, "-");
      let value = $(row).find(".hue-hex").text().trim();
      let key = [prefix, title].join("-");

      result.set(key, value.trim());
    });
  } else {
    heads.each((idx, head) => {
      const $hues = $(head).nextUntil("h4");
      const block = $(head).text().toLowerCase().trim();

      $hues.find(".section-hues-row").each((i, row) => {
        let title = $(row)
          .find(".hue-title")
          .text()
          .toLowerCase()
          .trim()
          .replace(/\s/gi, "-");
        let value = $(row).find(".hue-hex").text().trim();
        let key = [prefix, block, title].join("-");

        result.set(key, value.trim());
      });
    });
  }

  return result;
}

const baseUrl = "https://www.happyhues.co/palettes/";
const idLen = Array.from(new Array(17).keys());

const fetchPalette = async (id) => {
  let palette = {};

  try {
    const response = await axios.get(baseUrl + id);
    const html = response.data;
    const $ = cheerio.load(html);

    $(".section.wf-section").each((i, wrap) => {
      let result = parseSection($, id, i + 1, $(wrap));

      result.forEach((val, key) => {
        palette[key] = { value: val };
      });
    });

    return palette;
  } catch (err) {
    throw err;
  }
};

let list = [];

function accessWeb () {
  let p = Promise.resolve();

  idLen.forEach((idx) => {
    p = p
      .then(() => {
        return fetchPalette(idx + 1);
      })
      .then((res) => {
        const filename = `palette${idx + 1}`;
        const filepath = `./token/${filename}.json`;

        console.log("🚀 ~ file: index.mjs:83 ~ .then ~ filename:", filename)

        list.push(filename);

        fs.writeFileSync(filepath, JSON.stringify(res, null, "  "));
        setTimeout(() => {
          return Promise.resolve(res);
        }, 2000);
      });
  });

  return p;
}

function createStyleDist(type, list) {
  const types = {
    css: 'css/variables',
    scss: 'scss/variables',
    less: 'less/variables',
  }
  const options = {
    'outputReferences': true
  };


  let base = [];

  if (type === 'ts') {
    base = [
      {
        'destination': `variables.ts`,
        'format': 'javascript/es6',
        options
      },
      {
        'destination': `variables.d.ts`,
        'format': 'typescript/es6-declarations',
        options
      }
    ]
  } else {
    base = [
      {
        'destination': `variables.${type}`,
        'format': types[type],
        options
      }
    ]
  }

  return list.reduce((res, filename) => {
    if (type !== 'ts') {
      res.push({
        destination: `${filename}.${type}`,
        format: types[type],
        options
      });
    } else {
      res.push({
        'destination': `${filename}.ts`,
        'format': 'javascript/es6',
        options
      })
      res.push({
        'destination': `${filename}.d.ts`,
        'format': 'typescript/es6-declarations',
        options
      })
    }

    return res;
  }, base);
}

function createStyles() {
  const sdExtend = StyleDictionary.extend({
    source: ["./token/**/*.json"],
    platforms: {
      scss: {
        transformGroup: "scss",
        buildPath: "dist/scss/",
        files: createStyleDist('scss', list),
      },
      css: {
        transformGroup: "css",
        buildPath: "dist/css/",
        files: createStyleDist('css', list),
      },
      ts: {
        transformGroup: "js",
        buildPath: "dist/ts/",
        files: createStyleDist('ts', list),
      },
    },
  });

  sdExtend.buildAllPlatforms();
}

accessWeb().then(() => {
  console.log(list);
  console.log(createStyleDist('css', list))
  createStyles();
});

// createStyles();
