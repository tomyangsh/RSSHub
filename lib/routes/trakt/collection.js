const cheerio = require('cheerio');
const got = require('@/utils/got');
const url = require('url');

const base = 'https://trakt.tv/users';

module.exports = async (ctx) => {
    const username = ctx.params.username
    const ctype = ctx.params.type
    const res = await got({
        method: 'get',
        url: `https://api.trakt.tv/users/${username}/collection/${ctype}`,
	headers: {
            'trakt-api-key': `4fb92befa9b5cf6c00c1d3fecbd96f8992c388b4539f5ed34431372bbee1eca8`,
        },
    });
    
    /*
    const img = await got({
        method: 'get',
        url: `https://api.themoviedb.org/3/movie/${item.tmdb}/images?api_key=b729fb42b650d53389fb933b99f4b072`
    });
    const image = img.data
    */
    const items = await Promise.all(
        res.data.slice(res.data.length-10, res.data.length).reverse().map(async (movie) => {
	    const tmdbinfo = await got(`https://api.themoviedb.org/3/movie/${movie.movie.ids.tmdb}?api_key=b729fb42b650d53389fb933b99f4b072&language=zh`);
	    const pubDate = movie.collected_at;
	    let image;
              if (tmdbinfo.data.poster_path !== undefined) {
		image = tmdbinfo.data.poster_path;
              } else {
		image = `/0.jpg`;
	      }
	    return Promise.resolve({
		title: `${tmdbinfo.data.title} (${movie.movie.year})`,
                description: `${tmdbinfo.data.title} (${movie.movie.year})<br><img alt="image" src="https://www.themoviedb.org/t/p/w600_and_h900_bestv2${image}">`,
                pubDate: pubDate,
		link: `https://www.themoviedb.org/movie/${movie.movie.ids.tmdb}`,
            });
        })
    );
	
    ctx.state.data = {
        title: `团队盘新增影片`,
        link: `https://github.com/tomyangsh/tomyangsh/blob/master/movies-list.md`,
        description: `团队盘新增影片`,
        item: items, 
    };
}
