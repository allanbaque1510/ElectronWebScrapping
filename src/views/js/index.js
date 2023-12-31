// formulario.js
document.addEventListener('DOMContentLoaded', () => {
    const formulario = document.getElementById('miFormulario');
  
    formulario.addEventListener('submit', (e) => {
      e.preventDefault(); // Evita que se envíe el formulario automáticamente
      const nombre = document.getElementById('nombre').value;
      // Aquí puedes hacer lo que desees con los datos, por ejemplo, enviarlos a través de IPC en Electron
      const formateado = nombre.trim();
      prueba(formateado.replace(/ /g, '_'));
      // Limpia los campos del formulario si es necesario
      document.getElementById('nombre').value = '';
    });
  });

  document.addEventListener("DOMContentLoaded", function() {
    datosInicio()

});

const datosInicio = () =>{
  document.getElementById('listItems').classList.remove('showInfoResult')
  const divInfo = document.getElementById('informacion');
  divInfo.innerHTML =''
  document.getElementById('resultados').innerHTML='Cargando datos, espere por favor....'
  fetch(`http://localhost:3000/api/inicio`,{
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data)
      const contenidoHTML =`
      <h3 style='width:100%;'>Top Animes!!!</h3>
      <div class='col1'>
        <div class='top1' onclick="infoAnime('${data.top1.link}')">
          <span>${data.top1.top}</span>
          <p>${data.top1.titulo}</p>
          <img src='${data.top1.img}'>
        </div>
      </div>
      <div class='topAnimes'>
      
      <div class='col2'>
      ${data.top3.map((item)=>{
       return `<div class='top top3' onclick="infoAnime('${item.link}')">
          <span>${item.top}</span>
          <p>${item.titulo}</p>
          <img src='${item.img}'>
        </div>
        `
      }).join('')}
      </div>
      <div class='col3'>
        ${data.top6.map((item)=>{
          return ` <div class='top top6' onclick="infoAnime('${item.link}')">
            <span>${item.top}</span>
            <p>${item.titulo}</p>
            <img src='${item.img}'>
          </div>
          `
        }).join('')}
      </div>
      </div>
      <div class='trendList'>
        <h3 style='width:100%'>Ultimas Novedades</h3>
        ${
          data.trend.map((objeto) => {
            return `
              <div class='item' >
                <button class='tarjetaBtn' onclick="infoAnime('${objeto.link}')">
                <div class='contImg'>
                  <img src="${objeto.img}" alt="${objeto.titulo}">
                </div>
                <div class='datos'>
                  <span class='tipo'>${objeto.tipo}</span>
                  <span class='estado'>${objeto.estado}</span>
                  <p>${objeto.titulo}</p>
                </div>
                </button>
              </div>
            `;
          }).join('') // Une las cadenas HTML en una sola
  
        }
        
      </div>

      ` 
      document.getElementById('resultados').innerHTML=contenidoHTML
    })




}
  const prueba = (id) => {
    document.getElementById('navegacion').classList.remove('ocultar')
    document.getElementById('listItems').classList.remove('showInfoResult')
    const divInfo = document.getElementById('informacion');
    divInfo.innerHTML =''
      Swal.fire({
        title: 'Buscando lista de animes',
        allowOutsideClick:false,
        didOpen: () => {
          Swal.showLoading()
        },
        willClose: () => {
         
        }
      })
    
    fetch(`http://localhost:3000/api/buscar`,{
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({valor:id}),
    })
      .then((response) => response.json())
      .then((data) => {
        Swal.close();
        // Obtén una referencia al elemento <div> donde deseas mostrar los resultados
        const resultadosDiv = document.getElementById('resultados');
        const navegacionDiv = document.getElementById('navegacion');
        // Utiliza plantillas de JavaScript para construir el contenido HTML
        const contenidoHTML = data.Animes.map((objeto) => {
          return `
            <div class='item' >
              <button class='tarjetaBtn' onclick="infoAnime('${objeto.link}')">
              <div class='contImg'>
                <img src="${objeto.imagen}" alt="${objeto.titulo}">
              </div>
              <div class='datos'>
                <span class='tipo'>${objeto.tipo}</span>
                <span class='estado'>${objeto.estado}</span>
                <p>${objeto.titulo}</p>
              </div>
              </button>
            </div>
          `;
        }).join(''); // Une las cadenas HTML en una sola

        const ambos =`
        ${data.navPrev?`<button class='btnNav' onclick=prueba('${data.navPrev}')>Anterior</button>`:``}
        ${data.navNext?`<button class='btnNav' onclick=prueba('${data.navNext}')>Siguiente</button>`:``}
        `
      navegacionDiv.innerHTML = ambos  
      // Inserta el contenido HTML en el elemento <div>
      resultadosDiv.innerHTML = contenidoHTML;
    })
      .catch((error) => {
        console.log(error)
        Swal.fire({
          icon: 'error',
          title: 'Ah ocurrido un error',
          text: error
        })
      });
  };

  function infoAnime(url){
    document.getElementById('navegacion').classList.remove('ocultar')

    document.getElementById('listItems').classList.add('showInfoResult')
    const divInfo = document.getElementById('informacion');
    const contenidoHTML =`Cargando datos....`
    divInfo.innerHTML =contenidoHTML
    searchInfo(url)
  }


  function verEpisodio(url){
    const resultadosDiv = document.getElementById('divPantalla');
    console.log(url)
    resultadosDiv.innerHTML='Cargando pantalla....'
    fetch(`http://localhost:3000/api/verCap`,{
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({valor:url}),
    }).then((response) => response.json())
    .then(async(data) => {
      const capituloResponse = await fetch(`https://jkanime.net/ajax/download_episode/${data.capitulo}`, {
        method: 'GET'
      });

      const capituloData = await capituloResponse.json();
      const contenidoHTML = `
        <div>
          <h3>${data.titulo}</h3>
          <video class='video' controls autoplay name="media" crossorigin="anonymous" >
            <source src='${capituloData.url}' type='video/mp4'>
          </video>
        </div>
      `
      resultadosDiv.innerHTML=contenidoHTML
    })
  }



  function verCapitulos(url,titulo){
    const resultadosDiv = document.getElementById('resultados');
    resultadosDiv.innerHTML='Cargando episodios....'
    const tituloAnimeTexto = document.getElementById('tituloAnime').innerText +'_'+titulo;
    document.getElementById('navegacion').classList.add('ocultar')
    fetch(`http://localhost:3000/api/ver`,{
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({valor:url}),
    }).then((response) => response.json())
    .then((data) => {
      console.log(data)
      const contenidoHTML = `
      <div class='contEpi scrollBar'>
        <div class='episodeList scrollBar'>${data.episodios.map((episodio)=>{
          return `<div class='episodio' onclick=verEpisodio('${episodio.link}')>
                    <img src='${episodio.imagen}'>
                    <span>${episodio.titulo}</span>
                  </div>`
            }).join('')}
            </div>
            <h3 id='tituloLista'>${tituloAnimeTexto}</h3>
            <button class='btnDescargar' onclick=descargarDatos('${data.episodios.map((epi)=>{
              return `${epi.link}`
            })}')>Descargar lista de capitulos <img width="25" height="25" src="https://img.icons8.com/metro/26/FFFFFF/download--v1.png" alt="download--v1"></button>
            <div id='divPantalla' class='watch'>
            </div>
      </div>
      `

      resultadosDiv.innerHTML=contenidoHTML
    })
  }
  
  async function descargarAnimes(datos) {
    const arreglo = datos.split(",");
    const resultados = [];
    // Utilizamos Promise.all() para esperar todas las solicitudes GET
    await Promise.all(
      arreglo.map(async (urlData) => {
        try {
          const response = await fetch(`http://localhost:3000/api/descargar`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ valor: urlData}),
          });
  
          const data = await response.json();
          const capituloResponse = await fetch(`https://jkanime.net/ajax/download_episode/${data.capitulo}`, {
            method: 'GET'
          });
  
          const capituloData = await capituloResponse.json();
          resultados.push(capituloData); // Agregar datos a la lista
        }catch (error) {
          console.error('Hubo un error:', error);
        }
      })
    );
    return resultados; // Devuelve la lista de respuestas
  }
  
  async function descargarDatos(datos){
    const tituloAnime = document.getElementById('tituloLista').innerText;
    descargarAnimes(datos)
    .then((respuestas) => {
      
      fetch(`http://localhost:3000/api/download`,{
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({valor:respuestas, titulo:tituloAnime}),
      }).then((response) => response.json())
      .then((data) => {
        console.log(data)
      })
    })
    .catch((error) => {
      console.error("Error en la descarga de animes:", error);
    });
  }
  
  async function searchInfo(url){

    fetch(`http://localhost:3000/api/info`,{
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({valor:url}),
    }).then((response) => response.json())
    .then((data) => {
    
      const divInfo = document.getElementById('informacion');
      // Utiliza plantillas de JavaScript para construir el contenido HTML
      const contenidoHTML =`
          <div style='height:100%;background-image:linear-gradient(to left, rgba(22, 20, 41, 1), rgba(22, 20, 41, 0)), linear-gradient(to right, rgba(22, 20, 41, 1), rgba(22, 20, 41, 0)), linear-gradient(rgba(0, 0, 0, 0),rgba(0, 0, 0, 0)), linear-gradient(rgba(22, 20, 41, 0.5), rgba(22, 20, 41, 1)), url(${data.imagen}); background-size: cover; background-position: center;' >
              <h3 id='tituloAnime' style='text-align:center'>${data.titulo}</h3>
              <p>${data.resumen}</p>
              <p ><b>Emitido: </b> ${data.emitido}</p>
              <p><b>Episodios: </b>${data.episodios}</p>
              ${data.genero.map((gen)=>{
                return `<button class='tagsBtn' onclick=prueba('${gen.link}')>${gen.tipo}</button>`
              })}
              <h4>Lista de episodios:</h4>
         
                ${data.paginacion.map((paginas)=>{
                  return `<button class='tagCap' onclick="verCapitulos('${paginas.referencia}','${paginas.titulo}')">
                    ${paginas.titulo}
                  </button>`
                })}
           
       
          </div>
        `;
        divInfo.innerHTML =contenidoHTML
     

    })

  }