const { parse } = require('node-html-parser');

async function getHomePage(page) {
  try {
    const response = await http.get(`https://anime1.me/page/${page}`, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const root = parse(response.body);
    const items = root.querySelectorAll('.post'); // 需調整為 anime1.me 的實際選擇器
    const results = items.map(item => ({
      name: item.querySelector('h2')?.text || 'Unknown Title',
      url: item.querySelector('a')?.getAttribute('href') || '',
      image: item.querySelector('img')?.getAttribute('src') || ''
    })).filter(item => item.url && item.name);
    const hasNextPage = !!root.querySelector('.next-page');
    return { results, hasNextPage };
  } catch (error) {
    console.error('getHomePage error:', error);
    return { results: [], hasNextPage: false };
  }
}

async function getDetails(url) {
  try {
    const response = await http.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const root = parse(response.body);
    const episodes = root.querySelectorAll('.episode-link').map(ep => ({
      name: ep.text || 'Episode',
      url: ep.getAttribute('href') || ''
    }));
    return {
      title: root.querySelector('h1')?.text || 'Unknown Title',
      description: root.querySelector('.entry-content')?.text || 'No description',
      episodes: episodes.filter(ep => ep.url)
    };
  } catch (error) {
    console.error('getDetails error:', error);
    return { title: '', description: '', episodes: [] };
  }
}

async function getSearch(query) {
  try {
    const response = await http.get(`https://anime1.me/?s=${encodeURIComponent(query)}`, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const root = parse(response.body);
    const items = root.querySelectorAll('.post');
    const results = items.map(item => ({
      name: item.querySelector('h2')?.text || 'Unknown Title',
      url: item.querySelector('a')?.getAttribute('href') || '',
      image: item.querySelector('img')?.getAttribute('src') || ''
    })).filter(item => item.url && item.name);
    return { results };
  } catch (error) {
    console.error('getSearch error:', error);
    return { results: [] };
  }
}

async function getVideoList(url) {
  try {
    const response = await http.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const root = parse(response.body);
    const videoUrl = root.querySelector('iframe')?.getAttribute('src') || '';
    if (videoUrl) {
      return [{ url: videoUrl, quality: 'default' }];
    }
    return [];
  } catch (error) {
    console.error('getVideoList error:', error);
    return [];
  }
}

module.exports = { getHomePage, getDetails, getSearch, getVideoList };