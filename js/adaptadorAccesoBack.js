async function llamarBack(entidad, accion, datos = {}, paginacion = null) {
  const fd = new FormData();

  // Campos “framework ET”
  fd.append('controlador', entidad);
  fd.append('action', accion);

  // Datos normales
  if (datos && typeof datos === 'object') {
    for (const [k, v] of Object.entries(datos)) {
      if (v === undefined || v === null) continue;

      // Si es File/Blob => se adjunta como fichero
      if (v instanceof File || v instanceof Blob) {
        fd.append(k, v, v.name || 'archivo.bin');
      } else {
        fd.append(k, String(v));
      }
    }
  }

  // Paginación (si aplica)
  if (paginacion && typeof paginacion === 'object') {
    for (const [k, v] of Object.entries(paginacion)) {
      if (v === undefined || v === null) continue;
      fd.append(k, String(v));
    }
  }

  const resp = await fetch('http://193.147.87.202/ET2/index.php', {
    method: 'POST',
    body: fd
  });

  // Si el back no responde JSON, aquí petaría; 
  const json = await resp.json();
  return json;
}
