const fs = require("fs");
const axios = require("axios");
const cheerio = require("cheerio");
const { TwitterApi } = require("twitter-api-v2");
require("dotenv").config();

const QUOTE_URL = "https://api.quotable.io/random";
const CHARACTER_URL = "https://bestrandoms.com/random-character";

const main = async () => {
  const quote = await getQuote();
  const [character, pictureUrl] = await getCharacter();
  await dowloadPicture(pictureUrl);

  console.log(`${quote}\n${character}\n${pictureUrl}`);

  const userClient = new TwitterApi({
    appKey: process.env.TWITTER_API_KEY,
    appSecret: process.env.TWITTER_API_SECRET,
    accessToken: process.env.TWITTER_ACCESS_TOKEN,
    accessSecret: process.env.TWITTER_ACCESS_SECRET,
  });

  const mediaId = await userClient.v1.uploadMedia("./image.jpeg");
  console.log("Media Id:", mediaId);

  await userClient.v2.tweet(`${quote}\n\n- ${character}`, {
    media: {
      media_ids: [mediaId],
    },
  });

  console.log("Tweeted!");
};

const getQuote = async () => {
  const quoteApiRes = await axios.get(QUOTE_URL);
  return quoteApiRes.data.content;
};

const getCharacter = async () => {
  const characterPageRes = await axios.post(
    CHARACTER_URL,
    {
      quantity: "1",
      rank: "1000",
    },
    {
      headers: { "Accept-Encoding": "gzip,deflate,compress" },
    }
  );

  const characterPageHtml = characterPageRes.data;
  const $ = cheerio.load(characterPageHtml);

  let character = $(
    ".content > ul:nth-child(2) > li:nth-child(1) > p:nth-child(2) > b:nth-child(1) > span:nth-child(1)"
  )
    .text()
    .trim();

  const pictureUrl = $(
    ".content > ul:nth-child(2) > li:nth-child(1) > p:nth-child(3) > img:nth-child(1)"
  ).attr("src");

  return [character, pictureUrl];
};

const dowloadPicture = async (url) => {
  const pictureRes = await axios.get(url, {
    responseType: "stream",
  });
  return new Promise((resolve, reject) => {
    pictureRes.data
      .pipe(fs.createWriteStream("image.jpeg"))
      .on("finish", () => {
        resolve();
      });
  });
};

main();
