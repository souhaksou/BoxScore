const { Builder } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const cheerio = require('cheerio');
const fs = require('fs');

const url = 'https://www.nba.com/game/mia-vs-den-0042200401/box-score';

const title = ['PLAYER', 'MIN', 'FGM', 'FGA', 'FG%', '3PM',
  '3PA', '3P%', 'FTM', 'FTA', 'FT%', 'OREB',
  'DREB', 'REB', 'AST', 'STL', 'BLK', 'TO',
  'PF', 'PTS', '+/-'];

const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

(async () => {
  try {
    // 選擇 Chrome 瀏覽器並設定選項
    const options = new chrome.Options();
    options.headless(); // 設定為無介面模式

    // 建立 Selenium WebDriver
    const driver = new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();
    console.log('瀏覽器開啟');
    await driver.get(url);

    // 等待網頁加載完成，可以使用 driver.sleep() 或 driver.wait() 方法
    // 在此範例中，使用固定的延遲 8 秒
    await driver.sleep(8000);

    // 取得 table 元素的 outerHTML
    const getTables = await driver.findElements({ tagName: 'table' });
    const tableHTML = await Promise.all(getTables.map(table => table.getAttribute('outerHTML')));

    // start
    console.log('start');

    const $ = cheerio.load(tableHTML.join(''));

    const tables = $('table');
    tables.each((tableIndex, table) => {
      const players = [];
      const trs = $(table).find('tbody>tr');
      trs.each((index, tr) => {
        const player = [];
        const tds = $(tr).find('td');
        tds.each(((i, td) => {
          if (i === 0) {
            const name = $(td).find('div>a>span>span:first-child').text();
            player.push(name);
          }
          else {
            const hasA = $(td).has('a').length > 0;
            if (hasA) {
              const text = $(td).find('a').text();
              player.push(text);
            } else {
              const text = $(td).text();
              player.push(text);
            }
          }
        }));
        players.push(player);
      });
      players.pop();
      // 整理成json
      const result = players.map((element, index) => {
        if (element.length > 2) {
          const obj = {};
          title.forEach((e, i) => {
            obj[e] = element[i];
          });
          return obj;
        }
        else {
          return {
            'PLAYER': element[0],
            'DNP': 'DNP'
          }
        }
      });
      const json = JSON.stringify(result);
      fs.writeFileSync(`boxscore${tableIndex + 1}.json`, json);
      console.log(`第 ${tableIndex + 1} 個檔案`);
      console.log('json', json);
    });

    // end
    console.log('end');

    console.log('瀏覽器關閉');
    await driver.quit();
  }
  catch (err) {
    console.log(`錯誤 : ${err}`);
  }
})();
