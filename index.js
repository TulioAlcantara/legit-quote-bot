const axios = require("axios");
const cheerio = require("cheerio");
require("dotenv").config();

const QUOTE_URL = "https://api.quotable.io/random";
const CHARACTER_URL =
  "https://bestrandoms.com/get-random-best-movie-characters-of-all-time";

const generateQuote = async () => {
  const quote = await getQuote();
  const [character, picture] = await getCharacter();

  console.log(quote, character, picture);
  //   console.log(process.env);
};

const getQuote = async () => {
  const quoteApiRes = await axios.get(QUOTE_URL);
  return quoteApiRes.data.content;
};

const getCharacter = async () => {
  const characterPageRes = await axios.get(CHARACTER_URL, {
    headers: { "Accept-Encoding": "gzip,deflate,compress" },
  });
  const characterPageHtml = characterPageRes.data;
  const $ = cheerio.load(characterPageHtml);
  return [
    $(
      "li.res-item:nth-child(1) > div:nth-child(1) > div:nth-child(2) > h4:nth-child(1)"
    )
      .text()
      .split(" ")[1]
      .trim(),
    $(
      "li.res-item:nth-child(1) > div:nth-child(1) > div:nth-child(1) > a:nth-child(1) > img:nth-child(1)"
    ).attr("src"),
  ];
};

generateQuote();
