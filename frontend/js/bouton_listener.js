const b1 = document.getElementById('btn-connection');

b1.addEventListener('click', function() {
    window.location.href = 'connection.html';
});
const b2 = document.getElementById('btn-deconnection');

b2.addEventListener('click', function() {
   fetch('/api/deconnect', { method: 'POST', credentials: 'include' })
      .then(() => {
         window.location.href = '/connection.html';
      });
});
