

// formulario.js

document.addEventListener('DOMContentLoaded', () => {
    const formulario = document.getElementById('miFormulario');
  
    formulario.addEventListener('submit', (e) => {
      e.preventDefault(); // Evita que se envíe el formulario automáticamente
      const nombre = document.getElementById('nombre').value;
      // Aquí puedes hacer lo que desees con los datos, por ejemplo, enviarlos a través de IPC en Electron
      const formateado = nombre.trim();
      console.log('Nombre:', formateado);
      prueba(formateado.replace(/ /g, '_'));
      // Limpia los campos del formulario si es necesario
      document.getElementById('nombre').value = '';
    });
  });


  const prueba = (id) => {
    fetch(`http://localhost:3000/api/${id}`)
      .then((response) => response.json())
      .then((data) => {
        // Obtén una referencia al elemento <div> donde deseas mostrar los resultados
        const resultadosDiv = document.getElementById('resultados');
        console.log(data)
        // Utiliza plantillas de JavaScript para construir el contenido HTML
        const contenidoHTML = data.map((objeto) => {
          return `
            <div class='item' >
              <a href='${objeto.link}'>
              <div class='contImg'>
                <img src="${objeto.imagen}" alt="${objeto.titulo}">
              </div>
              <div class='datos'>
                <span class='tipo'>${objeto.tipo}</span>
                <span class='estado'>${objeto.estado}</span>
                <p>${objeto.titulo}</p>
              </div>
              </a>
            </div>
          `;
        }).join(''); // Une las cadenas HTML en una sola
  
        // Inserta el contenido HTML en el elemento <div>
        resultadosDiv.innerHTML = contenidoHTML;
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };