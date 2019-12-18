// Способ 1. Для работы с промисами используйте await. Используйте только стрелочные функции.

const Typed = window['Typed']; // https://github.com/mattboldt/typed.js

const SERVER_URL = 'https://fe.it-academy.by/Examples/words_tree/';
const ROOT_FILE = 'root.txt';

const handle = async target => {
  const acc = [];

  const deep = async target => {
    const promises = target
      .map(filename => {
        return getFileOrList(filename);
      })
      .map(p =>
        p.catch(err => {
          console.error(err);
          return '';
        })
      );

    return Promise.all(promises).then(async results => {
      for (const result of results) {
        if (Array.isArray(result)) {
          await deep(result);
        } else {
          acc.push(result);
          await Promise.resolve(result);
        }
      }
    });
  };

  await deep(target);
  return acc.filter(Boolean).join(' ');
};

const getFileOrList = filename => {
  return fetch(SERVER_URL + filename)
    .then(res => res.text())
    .then(res => {
      try {
        return JSON.parse(res); // list of files
      } catch {
        return res; // file
      }
    });
};

const hideSpinner = () => {
  const el = document.querySelector('#spinner');
  if (el) {
    el.classList.add('invisible');
  }
};

const insertPhrase = phrase => {
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
  .then(result => {
    hideSpinner();
    if (typeof result === 'string') {
      insertPhrase(result);
    }
  });
