'use strict';
/* JFCarpio.com: contact brief stays in the browser until the visitor chooses to send it. */
(function () {
  document.querySelectorAll('form[data-contact-brief]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      if (!form.reportValidity()) return;
      var data = new FormData(form);
      var en = form.getAttribute('data-lang') === 'en';
      var label = en ? ['Project inquiry for JFCarpio.com', 'Name', 'Business', 'Project type', 'Decision to make', 'Deadline'] : ['Consulta para JFCarpio.com', 'Nombre', 'Empresa', 'Tipo de proyecto', 'Decisión pendiente', 'Plazo'];
      var lines = [label[0]];
      [['name', 1], ['company', 2], ['project', 3], ['decision', 4], ['deadline', 5]].forEach(function (pair) {
        var value = String(data.get(pair[0]) || '').trim();
        if (value) lines.push(label[pair[1]] + ': ' + value);
      });
      window.location.assign('https://wa.me/593999905080?text=' + encodeURIComponent(lines.join('\n')));
    });
  });
}());
