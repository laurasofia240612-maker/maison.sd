const formulario = document.getElementById("formAgenda");
const resumen = document.getElementById("resumen");
const mensajeFinal = document.getElementById("mensaje-final");
const detalle = document.getElementById("detalle");
const campoFecha = document.getElementById("fecha");

// La fecha mínima es hoy (en la hora local)
const hoy = new Date();
const hoyLocal = new Date(hoy.getTime() - hoy.getTimezoneOffset() * 60000);
campoFecha.min = hoyLocal.toISOString().split("T")[0];

const mensajes = {
  nombre: {
    vacio: "Escribe tu nombre completo.",
    corto: "El nombre debe tener al menos 3 letras.",
    formato: "Usa solo letras y espacios."
  },
  telefono: {
    vacio: "Escribe tu número de teléfono.",
    formato: "Debe tener exactamente 10 dígitos, sin espacios."
  },
  correo: {
    vacio: "Escribe tu correo electrónico.",
    formato: "Escribe un correo válido, como nombre@correo.com."
  },
  servicio: { vacio: "Selecciona un servicio." },
  fecha: {
    vacio: "Elige la fecha de tu cita.",
    pasada: "Elige una fecha desde hoy en adelante.",
    domingo: "No atendemos los domingos. Elige de lunes a sábado."
  },
  hora: { vacio: "Selecciona una hora." },
  primera: { vacio: "Cuéntanos si es tu primera vez." },
  politicas: { vacio: "Debes aceptar la política de cancelación." }
};

function textoDeError(campo) {
  const v = campo.validity;
  const m = mensajes[campo.name];
  if (!m) return "";
  if (v.valueMissing) return m.vacio;
  if (v.tooShort) return m.corto;
  if (v.patternMismatch || v.typeMismatch) return m.formato;
  if (v.rangeUnderflow) return m.pasada;
  if (v.customError) return campo.validationMessage;
  return "";
}

function validarCampo(campo) {
  campo.setCustomValidity("");

  // Regla extra: el spa no atiende los domingos
  if (campo.name === "fecha" && campo.value) {
    const dia = new Date(campo.value + "T00:00:00").getDay();
    if (dia === 0) {
      campo.setCustomValidity(mensajes.fecha.domingo);
    }
  }

  const error = document.getElementById("error-" + campo.name);
  const valido = campo.validity.valid;
  error.textContent = valido ? "" : textoDeError(campo);

  if (campo.type !== "radio" && campo.type !== "checkbox") {
    campo.classList.toggle("invalido", !valido);
    campo.classList.toggle("valido", valido && campo.value !== "");
  }
  return valido;
}

function validarFormulario() {
  let primerInvalido = null;
  const campos = formulario.querySelectorAll("input, select, textarea");

  campos.forEach(function (campo) {
    // Los radios se validan una sola vez, con el primero del grupo
    if (campo.type === "radio" && campo.id !== "primera-si") return;
    if (!validarCampo(campo) && !primerInvalido) {
      primerInvalido = campo;
    }
  });
  return primerInvalido;
}

// Validación mientras la persona escribe o cambia de campo
formulario.querySelectorAll("input, select, textarea").forEach(function (campo) {
  const evento = (campo.tagName === "SELECT" || campo.type === "radio" ||
                  campo.type === "checkbox" || campo.type === "date") ? "change" : "blur";
  campo.addEventListener(evento, function () {
    validarCampo(campo.type === "radio" ? document.getElementById("primera-si") : campo);
  });
});

formulario.addEventListener("submit", function (evento) {
  evento.preventDefault();

  const primerInvalido = validarFormulario();
  if (primerInvalido) {
    primerInvalido.focus();
    return;
  }

  const datos = new FormData(formulario);

  mensajeFinal.textContent =
    "Gracias, " + datos.get("nombre") + ". Te escribiremos al " +
    datos.get("telefono") + " para confirmar tu cita.";

  detalle.innerHTML = "";
  const filas = [
    ["Servicio", datos.get("servicio")],
    ["Fecha", datos.get("fecha")],
    ["Hora", datos.get("hora")],
    ["Primera vez", datos.get("primera")]
  ];

  filas.forEach(function (fila) {
    const dt = document.createElement("dt");
    const dd = document.createElement("dd");
    dt.textContent = fila[0];
    dd.textContent = fila[1];
    detalle.append(dt, dd);
  });

  resumen.hidden = false;
  resumen.scrollIntoView({ behavior: "smooth" });

  formulario.reset();
  formulario.querySelectorAll(".valido, .invalido").forEach(function (campo) {
    campo.classList.remove("valido", "invalido");
  });
});