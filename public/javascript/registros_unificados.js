function mostrarRegistroUsuario() {
    document.getElementById('registro-usuario').style.display = 'block';
    document.getElementById('registro-empresa').style.display = 'none';
  }
  
  function mostrarRegistroEmpresa() {
    document.getElementById('registro-usuario').style.display = 'none';
    document.getElementById('registro-empresa').style.display = 'block';
  }
  

  function formatDate(dateString) {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', options);
}


$(document).on('click', '.delete-event-button', function(e){
  e.preventDefault();
  var eventId = $(this).data('id');
  $.ajax({
      url: '/api/eliminar_evento/' + eventId,
      method: 'DELETE',
      success: function(response) {
          window.location.reload();
      },
      error: function(error) {
          alert('Hubo un error al eliminar el evento.');
      }
  });
});

$(document).on('click', '.edit-event-button', function(e) {
  e.preventDefault();
  var eventId = $(this).data('id');
  window.location.href = '/editar_evento/' + eventId;
});

$(document).on('click', '.info-event-button', function(e) {
  e.preventDefault();
  var eventId = $(this).data('id');
  window.location.href = '/informacion_evento/' + eventId;
});

// Función para formatear la fecha como día/mes/año
function formatDate(dateString) {
  const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', options);
}