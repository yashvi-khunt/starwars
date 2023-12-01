//character-api : https://swapi.dev/api/people
//characterimage-api : https://starwars-visualguide.com/assets/img/characters/4.jpg
const imgURL = " https://starwars-visualguide.com/assets/img/characters/";
const baseURL = "https://swapi.dev/api/people";

const mainPage = document.querySelector("#main-page");
mainPage.classList.remove("hidden");

const btnPrev = document.querySelector(".btn-prev");
const btnNext = document.querySelector(".btn-next");
const cardList = document.querySelector("#cardlist");

const model = document.querySelector(".model");
const modelContent = document.querySelector(".model .model-content");
const modelLoader = document.querySelector(".model .model-load");
const closeModel = document.querySelector(".close");

// console.log(cardList, model);

const characters = [];
// characters.push({
//   name: "Luke Skywalker",
//   height: "172",
//   mass: "77",
//   hair_color: "blond",
//   skin_color: "fair",
//   eye_color: "blue",
//   birth_year: "19BBY",
//   gender: "male",
//   homeworld: "https://swapi.dev/api/planets/1/",
//   films: [
//     "https://swapi.dev/api/films/1/",
//     "https://swapi.dev/api/films/2/",
//     "https://swapi.dev/api/films/3/",
//     "https://swapi.dev/api/films/6/",
//   ],
//   species: [],
//   vehicles: [
//     "https://swapi.dev/api/vehicles/14/",
//     "https://swapi.dev/api/vehicles/30/",
//   ],
//   starships: [
//     "https://swapi.dev/api/starships/12/",
//     "https://swapi.dev/api/starships/22/",
//   ],
//   created: "2014-12-09T13:50:51.644000Z",
//   edited: "2014-12-20T21:17:56.891000Z",
//   url: "https://swapi.dev/api/people/1/",
// });
let currPage = 1;
let totalPages;

btnNext.addEventListener("click", function () {
  currPage += 1;
  init();
});

btnPrev.addEventListener("click", function () {
  currPage -= 1;
  init();
});

closeModel.addEventListener("click", function () {
  model.classList.add("hidden");
  modelLoader.classList.add("hidden");
  modelContent.classList.add("hidden");
});

const getCharacters = async function (url, errorMsg = "Characters not found") {
  return fetch(url)
    .then((response) => {
      if (!response.ok) throw new Error(`${errorMsg} (${response.status})`);
      return response.json();
    })
    .then(async (data) => {
      //console.log(data.next);
      totalPages = parseInt(data.count / 10) + 1;
      characters.push(...data.results);
      if (data.next) getCharacters(data.next);
    });
};

const getDetails = async function (url, errorMsg = "Something went wrong") {
  return fetch(url)
    .then((response) => {
      if (!response.ok) throw new Error(`${errorMsg} (${response.status})`);
      return response.json();
    })
    .then((data) => {
      //   console.log(data);
      if (!data.name) return data.title;
      return data.name;
    });
};

const getFilms = async function (films, errorMsg = "Something went wrong") {
  let filmsarr = [];

  await films.forEach(async (f) => {
    const t = await getDetails(f, "Film not found");

    filmsarr.push(t);
  });

  return filmsarr;
};

const renderData = function (page) {
  const range = {
    low: (page - 1) * 10,
    high: page * 10,
  };

  cardList.innerHTML = "";
  let html = "";
  characters
    .filter((_, i) => i >= range.low && i < range.high)
    .forEach((el, i) => {
      html += `<div class="card" id="${
        range.low + i
      }" onclick="openModel(this)">
                  <img id="${range.low + i}" class="picture" src='${imgURL}${
        range.low + i + 1 < 17 ? range.low + i + 1 : range.low + i + 2
      }.jpg' />
                  <div class="title">${el.name}</div>
              </div>`;
    });

  cardList.insertAdjacentHTML("afterbegin", html);
};

const displayButtons = function (currPage) {
  if (currPage === 1) {
    btnNext.classList.remove("hidden");
    btnPrev.classList.add("hidden");
  } else if (currPage === totalPages) {
    btnPrev.classList.remove("hidden");
    btnNext.classList.add("hidden");
  } else {
    btnPrev.classList.remove("hidden");
    btnNext.classList.remove("hidden");
  }
};

const load = async function () {
  await getCharacters(baseURL);
  init();
};

const init = function () {
  //render list on home page
  renderData(currPage);

  //show btns
  displayButtons(currPage);
};
load();

const renderDetails = async function (obj) {
  const charName = document.querySelector(".char-name");
  const charImg = document.querySelector(".portrait");
  const [birthyear, gender, species, homeworld, films] =
    document.querySelectorAll(".stats-data");

  const char = characters[obj];

  if (char.homeworld.includes("https")) {
    char.homeworld = await getDetails(char.homeworld, "HomeWorld not found");

    char.species =
      char.species.length === 0
        ? "unknown"
        : await getDetails(char.species[0], "HomeWorld not found");

    char.films = await getFilms(char.films, "HomeWorld not found");
  }

  charImg.src = `${imgURL}/${+obj + 1 < 17 ? +obj + 1 : +obj + 2}.jpg`;

  modelLoader.classList.add("hidden");
  modelContent.classList.remove("hidden");

  charName.innerHTML = char.name;
  birthyear.innerHTML = char.birth_year;
  gender.innerHTML = char.gender;

  species.innerHTML = char.species;

  films.innerHTML = char.films.join(", ");
  homeworld.innerHTML = char.homeworld;
  //   films.innerHTML = ;
};

const openModel = async function (obj) {
  model.classList.remove("hidden");

  //get data
  await renderDetails(obj.id);

  //remove loader add content
  //modelLoader.classList.add("hidden");
};
