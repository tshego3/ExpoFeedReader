import * as rssParser from 'react-native-rss-parser';

export async function fetchFeed(url: string) {
  const response = await fetch(url);
  const text = await response.text();
  const feed = await rssParser.parse(text);
  return feed;
}

export function getItemHtml(item: rssParser.RSSItem) {
  return item.content || item['content:encoded'] || 'No content available.';
}
