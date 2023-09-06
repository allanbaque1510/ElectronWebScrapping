const { app, BrowserWindow  } = require('electron');
const express = require('express');
const puppeteer = require('puppeteer');

const expressApp = express(); 
expressApp.use(express.json());
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
  if(idBusqueda.includes('https://jkanime.net/buscar/')){
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
  const result = await page.evaluate(async()=>{
    const resultadoJSON = {};
    const titulo =  document.querySelector('.anime__details__title h3').innerText;
    const resumen =  document.querySelector('p.tab.sinopsis').innerText;
    resultadoJSON.titulo = titulo
    resultadoJSON.resumen = resumen
    
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
  
    // const existePrev = document.querySelector("a.text.nav-prev")
    // const existeNext = document.querySelector("a.text.nav-next") 
    // if (existeNext!= null) {
    //   const enlace = existeNext.getAttribute('href')
    //   resultadoJSON.navNext = enlace.replace(/ /g, '_');
    // }
    // if (existePrev!= null) {
    //   const enlace = existePrev.getAttribute('href')
    //   resultadoJSON.navPrev = enlace.replace(/ /g, '_');
    // }
    // const datos = [...items].map((item)=>{
    //   const link = item.querySelector('a').getAttribute('href')
    //   const imagen = item.querySelector('.anime__item__pic.set-bg').getAttribute('data-setbg')
    //   const titulo = item.querySelector('.title').innerText;
    //   const estado = item.querySelector('li').innerText;
    //   const tipo = item.querySelector('li.anime').innerText;
    //   return {
    //     link,
    //     imagen,
    //     titulo,
    //     estado,
    //     tipo
    //   }
    // })
    return resultadoJSON
})
await browser.close();
return result
}



expressApp.post('/api/buscar', async(req, res) => {
  const {valor} = req.body;
  const datos = await animeList(valor)
  res.json(datos);
});

expressApp.post('/api/info', async(req, res) => {
  const {valor} = req.body;infoAnime
  const datos = await infoAnime(valor)
  res.json(datos);
});

app.whenReady().then(() => {
  createWindow()
  
  coneccion()
})