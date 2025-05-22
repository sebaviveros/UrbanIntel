document.addEventListener('DOMContentLoaded', function () {
  // Activar todos los elementos con data-bs-toggle="collapse"
  var collapseTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="collapse"]'));
  collapseTriggerList.map(function (triggerEl) {
    new bootstrap.Collapse(triggerEl);
  });
});
