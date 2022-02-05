import axios from "axios";
import { IWebsite } from "./interfaces";

const getSubLinkStatus = async (urls: string[]) => {
  const promiseUrls: any = [];

  urls.forEach((url) => {
    promiseUrls.push(axios.get(url));
  });
  return await Promise.all(promiseUrls);
};

const extractLink = async (url: string) => {
  try {
    const pattern = new RegExp('href="' + url + "[^#][a-z0-9-]+", "gi");
    const scanned = new Set();

    // Get homepage
    const { data } = await axios.get(url);

    const setQueue = [
      ...new Set(
        data.match(pattern).map((url: string) => url.replace('href="', ""))
      ),
    ];
    (await getSubLinkStatus(setQueue as string[])).forEach((link) => {
      scanned.add({
        _website: [url],
        _link: [link.request.res.responseUrl],
        statusCode: [link.status],
      });
    });
    console.log(scanned);
    return scanned;
  } catch (error) {
    console.log(error);
  }
};

const main = async (urls: IWebsite[]) => {
  if (urls.length <= 0) {
    return 0;
  }
  return await Promise.all(
    urls.map((url) => {
      return extractLink(url._website[0]);
    })
  );
};

main([
  { _website: ["https://hexact.io/"] },
  { _website: ["https://stackoverflow.com/"] },
])
  .then((res) => console.log(res))
  .catch((err) => console.log(err));
