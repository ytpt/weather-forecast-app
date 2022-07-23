"use strict";

//Обращение к API прогноза
function getForecast(city){
    const site = 'http://api.openweathermap.org/data/2.5/forecast';
    const key = 'e53de13439964005b3e5ddfa27abca32';
    const link = encodeURI(`${site}?q=${city}&appid=${key}`);
    
    fetch(link) 
        .then(response => {
            if(response.ok) {
                return response.json()
            }else {
                throw Error
            }
        })
        .then(renderForecast) 
        .catch(error => console.log(error.message));
} 

//Рендер API для прогноза
const renderForecast = response => {
    const cityName = response.city.name;

    function prepareForecastView (date, time, temp, tempFeels, conditions, icon) {
        return `<div class="forecastBlock">
                    <div class="dateTime">
                    <p>${date}</p>
                        <p>${time}</p>
                    </div>
                    <div class="tempImg">
                        <ul class="forecastTemp">
                            <li>Temperature: ${temp}&#176;</li>
                            <li>Feels like: ${tempFeels}&#176;</li>
                        </ul>
                        <div class="forecastImg">
                            <p>${conditions}</p>
                            <img src="${icon}" width="40" height="40">
                        </div>
                    </div>
                </div>`;
    }

    function currentDay (date) {
        let dd = String(date.getDate());
        const mm = getMonthName(date);
        return dd + ' ' + mm;        
    }

    let forecastViews = '';
    const forecastList = response.list;
    forecastList.forEach(item => {
        
        const date = new Date(item.dt * 1000);

        forecastViews += prepareForecastView(
            currentDay(date),
            ((date.getHours() < 10 ? '0' : '') + date.getHours()) + ':' + // Время в формате 00:00
            ((date.getMinutes() < 10 ? '0' : '') + date.getMinutes()), // Время в формате 00:00
            Math.round(item.main.temp - 273.15),
            Math.round(item.main.feels_like - 273.15),
            item.weather[0].main,
            "http://openweathermap.org/img/w/" + item.weather[0].icon + ".png"
        );
    })

    let forecastElem = document.getElementById('tab-window-forecast');
    forecastElem.innerHTML = `
        <div class="forecastContent">
            <span class="forecastCity">${cityName}</span>
            ${forecastViews}
        </div>
    `;
    
    function getMonthName(date){
        const monthNames = [
            "January", 
            "February", 
            "March", 
            "April", 
            "May", 
            "June",
            "July", 
            "August", 
            "September", 
            "October", 
            "November", 
            "December"
        ];
    
        return monthNames[date.getMonth()];
    }
}

//Прогноз погоды подгружается по кнопке forecast
function clickForecastBtn() {
    let forecastBtn = document.getElementById('forecastBtn');
    let forecastCity = document.getElementById('city').textContent;

    if (forecastCity){
        getForecast(forecastCity);
        localStorage.setItem('nowCity', forecastCity);
        localStorage.getItem('nowCity');
    }
}



//Запрос API погоды
function getWeather(cityName){
    const serverUrl = 'http://api.openweathermap.org/data/2.5/weather';
    const apiKey = 'f660a2fb1e4bad108d6160b7f58c555f';
    const url = `${serverUrl}?q=${cityName}&appid=${apiKey}&units=metric`;
    fetch(url) 
        .then(res => {
            if(res.ok) {
                return res.json()
            }else {
                alert("Такого города не существует :(")
                throw Error
            }
        })
        .then(render) 
        .catch(error => console.log(error.message));

    document.querySelector('.tabs > button:first-child').click();
} 

//Рендер API погоды
const render = data => {
    const weather = Object.entries(data);
    let iconSRC = "http://openweathermap.org/img/w/" + data.weather[0].icon + ".png";
    let nowIcon = document.querySelector('.nowIcon')  
    let nowTemp = document.querySelector('.nowTemp')
    let nowTemperature = `${Math.round(data.main.temp)}`;
    let nowCity = document.getElementById('city');
    let weatherConditions = document.querySelector('.weatherConditions');
    let feelsLike = document.querySelector('.feelsLike');
    let sunrise = document.querySelector('.sunrise');
    let sunset = document.querySelector('.sunset');

    nowTemp.innerHTML = `
        <p>${nowTemperature}&#176;</p>
    `;
    nowIcon.src = iconSRC;
    nowCity.innerHTML = data.name;
    let detailsCity = nowCity.textContent;
    weatherConditions = data.weather[0].main;
    feelsLike = `${Math.round(data.main.feels_like)}`;
    const sunriseDate = new Date(data.sys.sunrise * 1000);
    const sunsetDate = new Date(data.sys.sunset * 1000);
    sunrise = ((sunriseDate.getHours() < 10 ? '0' : '') + sunriseDate.getHours()) + ':' + // Время в формате 00:00
        ((sunriseDate.getMinutes() < 10 ? '0' : '') + sunriseDate.getMinutes());
    sunset = ((sunsetDate.getHours()< 10 ? '0' : '') + sunsetDate.getHours()) + ':' + // Время в формате 00:00
        ((sunsetDate.getMinutes()< 10 ? '0' : '') + sunsetDate.getMinutes());

    let detailsElem = document.getElementById('tab-window-details');
    detailsElem.innerHTML = `
        <div class="details-content">
            <span class="detailsCity">${detailsCity}</span>
            <ul class="details">
                <li>Temperature: ${nowTemperature}&#176;</li>
                <li>Feels like: ${feelsLike}&#176;</li>
                <li>Weather: ${weatherConditions}</li>
                <li>Sunrise: ${sunrise}</li>
                <li>Sunset: ${sunset}</li>
            </ul>
        </div>    
        `;

    //Очищаем инпут
    let clearInput = document.getElementById("enterCity").value = ''
}

//Запрос API по нажатию ENTER
(function() {
    document.querySelector('input').addEventListener('keydown', function(e) {
        if (e.keyCode === 13) {
            e.preventDefault();
            let enterCity = document.getElementById('enterCity').value;
            getWeather(enterCity);
            localStorage.setItem('nowCity', enterCity);
            localStorage.getItem('nowCity');
        }
    });
  })();

//Запрос API по клику на лупу
function clickSearchBtn() {
    let searchBtn = document.getElementById('search');
    let enterCity = document.getElementById('enterCity').value;
    getWeather(enterCity)
    localStorage.setItem('nowCity', enterCity);
    localStorage.getItem('nowCity');
}

//Город добавляется в избранное
let favoriteArray = [];

function clickHeartBtn() {
    addFavorite();
}

function addFavorite() {
    let cityName = document.getElementById('city').textContent;
    addToFavoriteList(cityName);
}

function addToFavoriteList(cityName){
    let favCity = document.querySelectorAll('.favCity');
    let isCityExist = false;
    Array.from(favCity).map(city => {
        if (cityName === city.childNodes[0].nodeValue){
            isCityExist = true;
        }
    })
    // если город уже в избранном
    if (isCityExist === true){
        return;
    }
    
    const newFavCity = document.createElement('li');
    newFavCity.classList.add('favCity');
    newFavCity.innerHTML = cityName;
    document.getElementById('cities').append(newFavCity);
    newFavCity.addEventListener('click', function(){
        getWeather(cityName);
    })
    addCrossBtn(newFavCity);

    //Добавили в массив для local storage
    favoriteArray.push(newFavCity.childNodes[0].nodeValue);
    saveTofavoriteArray();
}

//Удаление из избранного
const deleteFavCity = function() {
    const currentCity = this.parentElement.childNodes[0].nodeValue;
    this.parentElement.remove();

    //Убираем из массива для LOCALSTORAGE
    const allFavoriteCities = JSON.parse(localStorage.getItem("favCities"));
    if (allFavoriteCities){
        let newFavoriteCities = [];

        allFavoriteCities.forEach(city => {
            if (currentCity !== city){
                newFavoriteCities.push(city);
            }
        });

        favoriteArray = [...newFavoriteCities];
        saveTofavoriteArray();
    }

    delete favoriteArray[this];
    saveTofavoriteArray();
}

//Добавление кнопки крестика
function addCrossBtn(favElem) {
    let crossElements = document.createElement('button');
    crossElements.classList.add('cross');
    crossElements.textContent = '+';
    crossElements.addEventListener('click', deleteFavCity);
    favElem.append(crossElements);
}

let favCity = document.querySelectorAll('.favCity');
Array.from(favCity).map(city => {
    addCrossBtn(city);
});

//Навешивание онклик на крестики
document.querySelectorAll('.cross').forEach(cross => cross.onclick = deleteFavCity);
  
document.querySelectorAll('.favCity').forEach(cityElem => {
    cityElem.addEventListener('click', function(){
        getWeather(this.childNodes[0].nodeValue);
    })
})

//Если в LOCALSTORAGE пусто
if (localStorage.getItem('favCities') === null){
    Array.from(favCity).map(city => {
        favoriteArray.push(city.childNodes[0].nodeValue);
    })
}

//Сохранение в LOCALSTORAGE
function saveTofavoriteArray() {
    localStorage.setItem('favCities', JSON.stringify(favoriteArray));
    const data = JSON.parse(localStorage.getItem('favCities'))
}

const currentCity = localStorage.getItem("nowCity");
if (currentCity && currentCity !== 'undefined'){
    getWeather(currentCity);
}

const favotiteCities = JSON.parse(localStorage.getItem("favCities"));
if (favotiteCities){
    const citiesElem = document.getElementById('cities');
    citiesElem.innerHTML = '';

    favotiteCities.forEach(cityName => {
        addToFavoriteList(cityName);
    })
}


//Смена экранов при нажатии на кнопки NOW, DETAILS, FORECAST
const tabsButtons = document.querySelectorAll('.tabs > button');

tabsButtons.forEach(tabButton => {
    tabButton.addEventListener('click', function(){
        const clickedTab = this;

        tabsButtons.forEach(tab => {
            if (tab === clickedTab){
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });

        const tabWindowId = clickedTab.dataset.window;
        const tabs = document.querySelectorAll('.tab-window');

        tabs.forEach(tabWindow => {
            if (tabWindow.id === tabWindowId){
                tabWindow.style.display = 'block';
            } else {
                tabWindow.style.display = 'none';
            }
        });
    })
})