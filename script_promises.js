// Способ 2. Для работы с промисами используйте then. Используйте только традиционные функции, описанные ключевым словом function.

const Typed = window['Typed']; // https://github.com/mattboldt/typed.js

const SERVER_URL = 'https://fe.it-academy.by/Examples/words_tree/';
const ROOT_FILE = 'root.txt';

function handle(target) {
  const finalResult = [];
  let maxLevel = 1;
  let currentLevel = 0;

  return new Promise(function(resolve, reject) {
    function deep(target, arr) {
      const promises = target
        .map(function(results, i) {
          return getFileOrList(results).then(function(result) {
            if (Array.isArray(result)) {
              maxLevel++;
              arr[i] = [];
              return deep(result, arr[i]);
            } else {
              arr[i] = result;
              return Promise.resolve(result);
            }
          });
        })
        .map(function(p) {
          return p.catch(function(err) {
            console.error(err);
            return '';
          });
        });

      Promise.all(promises).then(function() {
        currentLevel++;
        if (currentLevel === maxLevel) {
          // it's finish
          resolve(finalResult.flat(Infinity).join(' '));
        }
      });
    }

    deep(target, finalResult);
  });
}

function getFileOrList(filename) {
  return fetch(SERVER_URL + filename)
    .then(function(res) {
      return res.text();
    })
    .then(function(res) {
      try {
        return JSON.parse(res); // list of files
      } catch {
        return res; // file
      }
    });
}

function hideSpinner() {
  const el = document.querySelector('#spinner');
  if (el) {
    el.classList.add('invisible');
  }
}

const insertPhrase = function(phrase) {
  if (Typed) {
    new Typed('#phrase', {
      strings: [phrase],
      showCursor: false,
      startDelay: 200,
    });
  } else {
    const el = document.querySelector('#phrase');
    if (el) {
      el.textContent = phrase;
    }
  }
};

getFileOrList(ROOT_FILE)
  .then(handle)
  .then(function(result) {
    hideSpinner();
    if (typeof result === 'string') {
      insertPhrase(result);
    }
  });
