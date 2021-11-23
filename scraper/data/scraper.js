const cheerio = require('cheerio');

const port1 = 'localhost:3000';

const scrapeContent = async (htmlFileContent, tags, target) => {
	try {
    const html = htmlFileContent;

		const $ = cheerio.load(html);

		const contents = [];
    if(target.type === 'text'){
      $(tags).each((_idx, el) => {
        const content = $(el).text()
        if(content){
          contents.push(content.trim())
        }
      });

    }
    if(target.type === 'attr'){
      $(tags).each((_idx, el) => {
        const content = $(el).attr(target.value)
        if(content){
          contents.push(content.trim())
        }
      });
    }

		return contents;
	} catch (error) {
    console.log(error);
		throw error;
	}

};

module.exports = { scrapeContent };
