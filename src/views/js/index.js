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


  const prueba = (id) => {

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
    document.getElementById('listItems').classList.add('showInfoResult')
    document.getElementById('informacion').classList.add('showInfo')
    searchInfo(url)
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
    
      console.log(data) 
      const divInfo = document.getElementById('informacion');
      // Utiliza plantillas de JavaScript para construir el contenido HTML
      const contenidoHTML =`
          <div >
          
              <h3>${data.titulo}</h3>
              <p>${data.resumen}</p>
              <p >${data.emitido}</p>
              <p>${data.episodios}</p>
              ${data.genero.map((gen)=>{
                `<a href='${gen.link}'>${gen.tipo}</a>`
              })}
       
          </div>
        `;
        divInfo.innerHTML =contenidoHTML
     

    })

  }