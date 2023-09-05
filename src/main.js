const { app, BrowserWindow  } = require('electron');
const express = require('express');
const puppeteer = require('puppeteer');

const expressApp = express(); 

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
  await page.goto(`https://jkanime.net/buscar/${idBusqueda}`);
  const result = await page.evaluate(()=>{
    const items =  document.querySelectorAll('.anime__item');
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
    // const imagen = data.getAttribute('data-setbg')
    return datos
})
await browser.close();
return result
};


expressApp.get('/api/:id', async(req, res) => {
  const parametro =  req.params.id;
  const datos = await animeList(parametro)
  res.json(datos);
});

app.whenReady().then(() => {
  createWindow()
  
  coneccion()
})