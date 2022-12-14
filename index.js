const fs = require("fs");
const axios = require("axios");
const cheerio = require("cheerio");
const { TwitterApi } = require("twitter-api-v2");
require("dotenv").config();

const QUOTE_URL = "https://api.quotable.io/random";
const CHARACTER_URL =
  "https://bestrandoms.com/get-random-best-movie-characters-of-all-time";

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

  // const mediaId = await userClient.v1.uploadMedia("./image.jpg");
  // console.log(mediaId);

  // await userClient.v2.tweet(`${quote}\n\n- ${character}`, {
  //   media: {
  //     media_ids: [mediaId],
  //   },
  // });
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

  let character = $(
    "li.res-item:nth-child(1) > div:nth-child(1) > div:nth-child(2) > h4:nth-child(1)"
  ).text();

  const [id, ...actualName] = character.split(" ");
  character = actualName.join(" ");

  const pictureUrl = $(
    "li.res-item:nth-child(1) > div:nth-child(1) > div:nth-child(1) > a:nth-child(1) > img:nth-child(1)"
  ).attr("src");

  return [character, pictureUrl];
};

const dowloadPicture = async (url) => {
  const pictureRes = await axios.get(url, {
    responseType: "stream",
  });
  pictureRes.data.pipe(fs.createWriteStream("image.jpg"));
};

main();
