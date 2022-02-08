import axios from "axios";
import { IWebsite } from "./interfaces";

const getSubLinkStatus = async (
  urls: string[],
  pattern: RegExp,
  _website: string
) => {
  const queue: any = [];
  const statuses: any[] = [];

  for (let url of urls) {
    const {
      data,
      status,
      request: {
        res: { responseUrl },
      },
    } = await axios.get(url);
    // If not exist in homepage
    for (let href of [...new Set(data.match(pattern))]?.map((href: any) =>
      href.replace('href="', "")
    )) {
      if (!urls.includes(href as string)) {
        queue.push(href);
      }
    }
    statuses.push({ _website, _link: responseUrl, statusCode: status });
  }

  return [statuses, queue];
};

const extractLink = async (url: string) => {
  try {
    const pattern = new RegExp('href="' + url + "[^#][a-z0-9-]+", "gi");
    const scanned = [];

    // Get homepage
    const { data } = await axios.get(url);

    const setQueue = [
      ...new Set(
        data.match(pattern).map((url: string) => url.replace('href="', ""))
      ),
    ];

    const [statuses, queue] = await getSubLinkStatus(
      setQueue as string[],
      pattern,
      url
    );
    scanned.push(...statuses);
    if (queue.length) {
      const [statuses, secondQueue] = await getSubLinkStatus(
        queue,
        pattern,
        url
      );
      scanned.push(...statuses);
    }
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
  // { _website: ["https://hexact.io/"] },
  // { _website: ["https://stackoverflow.com/"] },
  { _website: ["https://hexomatic.com/"] },
])
  .then((res) => console.log("ok"))
  .catch((err) => console.log(err));
