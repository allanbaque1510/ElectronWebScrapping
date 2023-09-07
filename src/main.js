const { app, BrowserWindow  } = require('electron');
const express = require('express');
const puppeteer = require('puppeteer');
const expressApp = express(); 
const axios = require('axios');
const archiver = require('archiver');
const fs = require('fs');
const path = require('path');

expressApp.use(express.json());

// Directorio de salida para los archivos descargados
const outputDirectory = './descargas';

// Crear el directorio de salida si no existe
if (!fs.existsSync(outputDirectory)) {
  fs.mkdirSync(outputDirectory);
}

const createWindow = () => {
  const win = new BrowserWindow({
    width: 900,
    height: 600,
  })
  win.loadFile('src/views/index.html')
  win.webContents.openDevTools();
}

const coneccion = ()=>{
  const port = 3000; // Puerto en el que se ejecutará el servidor
  expressApp.listen(port, () => {
    console.log(`Servidor Express en funcionamiento en http://localhost:${port}`);
  });
}

const animeList = async (idBusqueda) => {
  const browser = await puppeteer.launch({headless:'new'})
  const page = await browser.newPage();
  if(idBusqueda.includes('https://jkanime.net/')){
    await page.goto(idBusqueda);
  }else{
    await page.goto(`https://jkanime.net/buscar/${idBusqueda}/`);
  }
  const result = await page.evaluate(async()=>{
    const items =  document.querySelectorAll('.anime__item');
    const resultadoJSON = {};
    const existePrev = document.querySelector("a.text.nav-prev")
    const existeNext = document.querySelector("a.text.nav-next") 
    if (existeNext!= null) {
      const enlace = existeNext.getAttribute('href')
      resultadoJSON.navNext = enlace.replace(/ /g, '_');
    }
    if (existePrev!= null) {
      const enlace = existePrev.getAttribute('href')
      resultadoJSON.navPrev = enlace.replace(/ /g, '_');
    }
    const datos = [...items].map((item)=>{
      const link = item.querySelector('a').getAttribute('href')
      const imagen = item.querySelector('.anime__item__pic.set-bg').getAttribute('data-setbg')
      const titulo = item.querySelector('.title').innerText;
      const estado = item.querySelector('li').innerText;
      const tipo = item.querySelector('li.anime').innerText;
      return {
        link,
        imagen,
        titulo,
        estado,
        tipo
      }
    })
    resultadoJSON.Animes = datos
    return resultadoJSON
})
await browser.close();
return result
};

const infoAnime = async(url)=>{
  const browser = await puppeteer.launch({headless:'new'})
  const page = await browser.newPage();
  await page.goto(url);
  const urlWeb = url;
  const result = await page.evaluate(async(url)=>{
    const resultadoJSON = {};
    const imagen =  document.querySelector('.anime__details__pic').getAttribute('data-setbg');
    const titulo =  document.querySelector('.anime__details__title h3').innerText;
    const resumen =  document.querySelector('p.tab.sinopsis').innerText;
    resultadoJSON.titulo = titulo
    resultadoJSON.imagen = imagen
    resultadoJSON.resumen = resumen
    const paginacion = document.querySelectorAll('.anime__pagination a')
    const paginas= [...paginacion].map((pagina)=>{
      const referencia = url+pagina.getAttribute('href')
      const titulo = pagina.innerText;
      return {referencia,titulo}
    })
    resultadoJSON.paginacion = paginas

    const infoData =  document.querySelectorAll('.tab.aninfo li')
    const datos = [...infoData].map((data)=>{
      if(data.querySelector('li span').innerText === 'Genero:'){
        const generos = data.querySelectorAll('a')
        const generoData = [...generos].map((genero)=>{
          const link = genero.getAttribute('href')
          const tipo = genero.innerText
          return {link,tipo}
        })
        resultadoJSON.genero = generoData
      }
      if(data.querySelector('li span').innerText === 'Idiomas:'){
        const clon = data.cloneNode(true);
        clon.querySelector('span').remove();
        const idioma = clon.innerText.trim().replace(/  /g, '')
        resultadoJSON.idioma= idioma
      }
      if(data.querySelector('li span').innerText === 'Episodios:'){
        const clon = data.cloneNode(true);
        clon.querySelector('span').remove();
        const episodios = clon.innerText.trim().replace(/  /g, '')
        resultadoJSON.episodios= episodios
      }
      if(data.querySelector('li span').innerText === 'Emitido:'){
        const clon = data.cloneNode(true);
        clon.querySelector('span').remove();
        const emitido = clon.innerText.trim().replace(/  /g, '')
        resultadoJSON.emitido= emitido
      }
    })
    return resultadoJSON
},urlWeb)
await browser.close();
return result
}

const verAnime = async (idBusqueda) => {
  const browser = await puppeteer.launch({headless:'new'})
  const page = await browser.newPage();
  await page.goto(idBusqueda);
  
  const result = await page.evaluate(async()=>{
    const resultadoJSON = {};
    const items =  document.querySelectorAll('#episodes-content .anime__item');

    const datos = [...items].map((item)=>{
      const link = item.querySelector('a').getAttribute('href')
      const imagen = item.querySelector('.anime__item__pic.homemini.set-bg').getAttribute('data-setbg')
      const titulo = item.querySelector('.anime__item__text span').innerText;
      return {
        link,
        imagen,
        titulo,
      }
    })
    resultadoJSON.episodios = datos
    return resultadoJSON
})
await browser.close();
return result
};

const verEpisodio = async (idBusqueda) => {
  const browser = await puppeteer.launch({headless:'new'})
  const page = await browser.newPage();
  await page.goto(idBusqueda);
  // Buscar el iframe por su clase "player_conte"
  const iframeHandle = await page.$('.player_conte');
  const result = await page.evaluate(async()=>{
    const titulo =  document.querySelector('h1').innerText;
    return titulo
  })
  if (iframeHandle) {
  const iframe = await iframeHandle.contentFrame();
  const videoElement = await iframe.$('video');
  if (videoElement) {
    // Hacer algo con la etiqueta video, por ejemplo, obtener su atributo src
    const videoSrc = await iframe.evaluate(video => video.getAttribute('src'), videoElement);

    await browser.close();
    return {titulo:result,video:videoSrc}
  } else {
    const titulo= ('No se encontró la etiqueta <video> dentro del iframe.');
    await browser.close();
    return {titulo}
  }
}
};


const descargarEpisodio = async (urlBusqueda) => {
  try {
    const browser = await puppeteer.launch({headless:'new'})
    const page = await browser.newPage();
    await page.goto(urlBusqueda);  
    const result = await page.evaluate(async()=>{
      const resultadoJSON = {};
      const titulo =  document.querySelector('h1').innerText;
      const capitulo =  document.querySelector('#guardar-capitulo').getAttribute('data-capitulo');

      resultadoJSON.titulo = titulo
      resultadoJSON.capitulo = capitulo
      return resultadoJSON
    })
    await browser.close();
    return result
  }catch (error) {
    console.log(error)   
  }
};




expressApp.post('/api/buscar', async(req, res) => {
  const {valor} = req.body;
  const datos = await animeList(valor)
  res.json(datos);
});

expressApp.post('/api/info', async(req, res) => {
  const {valor} = req.body;
  const datos = await infoAnime(valor)
  res.json(datos);
});
expressApp.post('/api/ver', async(req, res) => {
  const {valor} = req.body;
  const datos = await verAnime(valor)
  res.json(datos);
});
expressApp.post('/api/verEpisodio', async(req, res) => {
  const {valor} = req.body;
  const datos = await verEpisodio(valor)
  res.json(datos);
});
expressApp.post('/api/descargar', async(req, res) => {
  const {valor} = req.body;
  const datos= await descargarEpisodio(valor)
  res.json(datos);
});

expressApp.post('/api/download', async(req, res) => {
  const {valor,titulo} = req.body;
  console.log(titulo)
  res.json(valor)
});
app.whenReady().then(() => {
  createWindow()
  
  coneccion()
})