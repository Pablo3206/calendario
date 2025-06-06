document.addEventListener("DOMContentLoaded", () => {
  // ----------------------------------
  // Referencias a elementos del DOM
  // ----------------------------------
  const monthYearEl           = document.getElementById("monthYear");
  const prevBtn               = document.getElementById("prevMonth");
  const nextBtn               = document.getElementById("nextMonth");
  const todayBtn              = document.getElementById("todayBtn");
  const calendarGrid          = document.getElementById("calendarGrid");
  const hiddenUsers = new Set();

  // ----------------------------------
  // Modal de Notificaciones
  // ----------------------------------
  const notificacionesBtns         = document.querySelectorAll("#notificacionesBtn");
  const notificacionesModal        = document.getElementById("notificacionesModal");
  const closeNotificacionesModal   = document.getElementById("closeNotificacionesModal");
  if (notificacionesBtns.length && notificacionesModal && closeNotificacionesModal) {
    notificacionesBtns.forEach(btn =>
      btn.addEventListener("click", () =>
        notificacionesModal.classList.remove("hidden")
      )
    );
    closeNotificacionesModal.addEventListener("click", () =>
      notificacionesModal.classList.add("hidden")
    );
  }

  // ----------------------------------
  // Modales de Turnos y Trabajos
  // ----------------------------------
  const turnosModal        = document.getElementById("turnosModal");
  const trabajosModal      = document.getElementById("trabajosModal");
  const closeTurnosModal   = document.getElementById("closeTurnosModal");
  const closeTrabajosModal = document.getElementById("closeTrabajosModal");
  const editarEventoModal      = document.getElementById("editarEventoModal");
const closeEditarEventoModal = document.getElementById("closeEditarEventoModal");
const updateBtn              = document.getElementById("updateBtn");
const deleteBtn              = document.getElementById("deleteBtn");
const eventoEditForm         = document.getElementById("eventoEditForm");


  if (closeTurnosModal && turnosModal) {
    closeTurnosModal.addEventListener("click", () =>
      turnosModal.classList.add("hidden")
    );
  }
  if (closeTrabajosModal && trabajosModal) {
    closeTrabajosModal.addEventListener("click", () =>
      trabajosModal.classList.add("hidden")
    );
  }

  // ----------------------------------
  // Modal de Crear Evento
  // ----------------------------------
  const crearEventoModal       = document.getElementById("crearEventoModal");
  const closeCrearEventoModal  = document.getElementById("closeCrearEventoModal");
  if (closeCrearEventoModal && crearEventoModal) {
    closeCrearEventoModal.addEventListener("click", () =>
      crearEventoModal.classList.add("hidden")
    );
  }

  // ----------------------------------
  // Modal de Eventos del Día
  // ----------------------------------
  const diaEventosModal        = document.getElementById("diaEventosModal");
  const closeDiaEventosModal   = document.getElementById("closeDiaEventosModal");
  const addEventoDia           = document.getElementById("addEventoDia");
  if (calendarGrid && diaEventosModal) {
    calendarGrid.addEventListener("click", (e) => {
      const cell = e.target.closest(".calendar-day");
      if (cell && !e.target.closest(".add-event-btn")) {
        diaEventosModal.classList.remove("hidden");
      }
    });
  }
  if (closeDiaEventosModal && diaEventosModal) {
    closeDiaEventosModal.addEventListener("click", () =>
      diaEventosModal.classList.add("hidden")
    );
  }
  if (addEventoDia && crearEventoModal && diaEventosModal) {
    addEventoDia.addEventListener("click", () => {
      diaEventosModal.classList.add("hidden");
      crearEventoModal.classList.remove("hidden");
    });
  }

  // ----------------------------------
  // Modal de Flores
  // ----------------------------------
  const floresBtn        = document.getElementById("floresBtn");
  const floresModalEl    = document.getElementById("floresModal");
  const closeFloresModal = document.getElementById("closeFloresModal");
  const bouquetOptions   = document.querySelectorAll(".bouquet-option");
  const sendFloresBtn    = document.getElementById("sendFloresBtn");
  
// ----------------------------------
// Gestión de Turnos Dinámicos con EDITAR y NUEVO
// ----------------------------------
const turnoForm      = document.getElementById("turnoForm");
const turnosList     = document.getElementById("turnosList");
const turnoSubmitBtn = document.getElementById("turnoSubmitBtn");
const newTurnoBtn    = document.getElementById("newTurnoBtn");

// —— CRUD Persistente para Turnos ——

// 1) Estado y referencias
let editingTurnoId = null;
let turnos   = [];
let trabajos = [];
// 2) Leer y renderizar manteniendo tu estilo e iconos :contentReference[oaicite:0]{index=0}:contentReference[oaicite:1]{index=1}
async function fetchTurnos() {
  turnos = await fetch('/api/tipos?categoria=turno').then(r => r.json());  // :contentReference[oaicite:0]{index=0}:contentReference[oaicite:1]{index=1}
  turnosList.innerHTML = turnos
    .map(t => `
      <div class="flex items-center justify-between bg-gray-50 p-2 rounded">
        <div class="flex-1 cursor-pointer" data-id="${t.id}" data-action="edit">
          <div class="font-medium">${t.nombre}</div>
          <div class="text-sm text-gray-500">${t.inicio} - ${t.fin}</div>
        </div>
        <div class="flex items-center space-x-2">
          <button data-id="${t.id}" data-action="edit" class="text-blue-500 hover:text-blue-700">
            <i class="ri-edit-line"></i>
          </button>
          <button data-id="${t.id}" data-action="delete" class="text-red-500 hover:text-red-700">
            <i class="ri-delete-bin-line"></i>
          </button>
        </div>
      </div>
    `).join('');
}
fetchTurnos();

// 3) Delegación de eventos (editar / borrar)
turnosList.addEventListener('click', async e => {
  const target = e.target.closest('button, [data-action="edit"]');
  if (!target) return;
  const id     = target.dataset.id;
  const action = target.dataset.action;

  if (action === 'delete') {
    await fetch(`/api/tipos/${id}`, { method: 'DELETE' });
    return fetchTurnos();
  }

  // action === 'edit'
  const turno = (await fetch('/api/tipos?categoria=turno').then(r => r.json()))
    .find(t => String(t.id) === id);
  turnoForm.querySelector('input[type="text"]').value = turno.nombre;
  const times = turnoForm.querySelectorAll('input[type="time"]');
  times[0].value = turno.inicio;
  times[1].value = turno.fin;
  editingTurnoId = id;
  turnoSubmitBtn.textContent = 'Guardar';
});

// 4) Crear / Actualizar
turnoForm.addEventListener('submit', async e => {
  e.preventDefault();
  const nombre = turnoForm.querySelector('input[type="text"]').value.trim();
  const [inicio, fin] = Array.from(turnoForm.querySelectorAll('input[type="time"]'))
    .map(i => i.value);
  if (!nombre || !inicio || !fin) return;

  const payload = { nombre, inicio, fin, categoria: 'turno' };
  const url     = editingTurnoId 
                ? `/api/tipos/${editingTurnoId}` 
                : '/api/tipos';
  const method  = editingTurnoId ? 'PUT' : 'POST';

  await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  // Reset y recarga
  editingTurnoId   = null;
  turnoSubmitBtn.textContent = 'Añadir';
  turnoForm.reset();
  fetchTurnos();
});

// 5) Botón “Nuevo”
newTurnoBtn.addEventListener('click', () => {
  editingTurnoId = null;
  turnoSubmitBtn.textContent = 'Añadir';
  turnoForm.reset();
});

// ----------------------------------
// Gestión de Trabajos Dinámicos con EDITAR y NUEVO
// ----------------------------------
const trabajoForm      = document.getElementById("trabajoForm");
const trabajosList     = document.getElementById("trabajosList");
const trabajoSubmitBtn = document.getElementById("trabajoSubmitBtn");
const newTrabajoBtn    = document.getElementById("newTrabajoBtn");

// —— CRUD Persistente para Trabajos ——

let editingTrabajoId = null;

async function fetchTrabajos() {
  trabajos = await fetch('/api/tipos?categoria=trabajo').then(r => r.json());  // :contentReference[oaicite:2]{index=2}:contentReference[oaicite:3]{index=3}
  trabajosList.innerHTML = trabajos
    .map(t => `
      <div class="flex items-center justify-between bg-gray-50 p-2 rounded">
        <div class="flex-1 cursor-pointer" data-id="${t.id}" data-action="edit">
          <div class="font-medium">${t.nombre}</div>
          <div class="text-sm text-gray-500">${t.inicio} - ${t.fin}</div>
        </div>
        <div class="flex items-center space-x-2">
          <button data-id="${t.id}" data-action="edit" class="text-blue-500 hover:text-blue-700">
            <i class="ri-edit-line"></i>
          </button>
          <button data-id="${t.id}" data-action="delete" class="text-red-500 hover:text-red-700">
            <i class="ri-delete-bin-line"></i>
          </button>
        </div>
      </div>
    `).join('');
}
fetchTrabajos();

trabajosList.addEventListener('click', async e => {
  const target = e.target.closest('button, [data-action="edit"]');
  if (!target) return;
  const id     = target.dataset.id;
  const action = target.dataset.action;

  if (action === 'delete') {
    await fetch(`/api/tipos/${id}`, { method: 'DELETE' });
    return fetchTrabajos();
  }

  // action === 'edit'
  const trabajo = (await fetch('/api/tipos?categoria=trabajo').then(r => r.json()))
    .find(t => String(t.id) === id);
  trabajoForm.querySelector('input[type="text"]').value = trabajo.nombre;
  const times = trabajoForm.querySelectorAll('input[type="time"]');
  times[0].value = trabajo.inicio;
  times[1].value = trabajo.fin;
  editingTrabajoId = id;
  trabajoSubmitBtn.textContent = 'Guardar';
});

trabajoForm.addEventListener('submit', async e => {
  e.preventDefault();
  const nombre = trabajoForm.querySelector('input[type="text"]').value.trim();
  const [inicio, fin] = Array.from(trabajoForm.querySelectorAll('input[type="time"]'))
    .map(i => i.value);
  if (!nombre || !inicio || !fin) return;

  const payload = { nombre, inicio, fin, categoria: 'trabajo' };
  const url     = editingTrabajoId 
                ? `/api/tipos/${editingTrabajoId}` 
                : '/api/tipos';
  const method  = editingTrabajoId ? 'PUT' : 'POST';

  await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  editingTrabajoId   = null;
  trabajoSubmitBtn.textContent = 'Añadir';
  trabajoForm.reset();
  fetchTrabajos();
});

newTrabajoBtn.addEventListener('click', () => {
  editingTrabajoId = null;
  trabajoSubmitBtn.textContent = 'Añadir';
  trabajoForm.reset();
});





  // ----------------------------------
  // Generación dinámica del calendario
  // ----------------------------------
  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];
  let currentDate = new Date();
  function generateCalendar(date) {
    const y = date.getFullYear();
    const m = date.getMonth();
    if (monthYearEl) monthYearEl.textContent = `${monthNames[m]} ${y}`;
    if (!calendarGrid) return;
    calendarGrid.innerHTML = "";
  
    const firstDay   = new Date(y, m, 1).getDay();
    const dayIndex   = (firstDay + 6) % 7;
    const daysInMonth= new Date(y, m + 1, 0).getDate();
    const daysPrev   = new Date(y, m, 0).getDate();
  
    for (let i = 0; i < 42; i++) {
      const cell = document.createElement("div");
      cell.className = "border rounded-md p-2 calendar-day relative";
  
      let num, cellMonth = m, cellYear = y;
      if (i < dayIndex) {
        // días del mes anterior
        num = daysPrev - dayIndex + 1 + i;
        cell.classList.add("bg-white","bg-opacity-50","text-gray-400");
        cellMonth = m - 1;
        if (cellMonth < 0) {
          cellMonth = 11;
          cellYear = y - 1;
        }
      } else if (i >= dayIndex + daysInMonth) {
        // días del mes siguiente
        num = i - (dayIndex + daysInMonth) + 1;
        cell.classList.add("bg-white","bg-opacity-50","text-gray-400");
        cellMonth = m + 1;
        if (cellMonth > 11) {
          cellMonth = 0;
          cellYear = y + 1;
        }
      } else {
        // días del mes actual
        num = i - dayIndex + 1;
        cell.classList.add("bg-gray-200","bg-opacity-30");
      }
  
      // asignamos data-date con año y mes corregidos
      const mm = String(cellMonth + 1).padStart(2, "0");
      const dd = String(num).padStart(2, "0");
      cell.dataset.date = `${cellYear}-${mm}-${dd}`;
  
      // 1) Insertar número
      const divNum = document.createElement("div");
      divNum.className = "text-sm font-medium";
      divNum.textContent = num;
      cell.appendChild(divNum);
  
// 2) Sólo pongo “+” en las celdas del mes que estamos viendo
if (cellMonth === m && cellYear === y) {
  const addBtn = document.createElement("div");
  addBtn.className =
    "add-event-btn absolute top-2 right-2 bg-gray-200 bg-opacity-70 " +
    "rounded-full w-6 h-6 flex items-center justify-center " +
    "cursor-pointer opacity-0 transition-opacity";
  addBtn.innerHTML = '<i class="ri-add-line text-base"></i>';
  addBtn.addEventListener("click", e => {
    e.stopPropagation();
    // guardamos la fecha clicada
    selectedDate = cell.dataset.date;
    // rellenamos el modal de Crear Evento
    document.getElementById("eventStartDate").value = selectedDate;
    document.getElementById("eventEndDate").value   = selectedDate;
    document.getElementById("eventStartTime").value = "09:00";
    document.getElementById("eventEndTime").value   = "10:00";
    document.getElementById("eventTitle").value       = "";
    document.getElementById("eventDescription").value = "";
    document.getElementById("eventLocation").value    = "";
    crearEventoModal.classList.remove("hidden");
  });
  cell.appendChild(addBtn);
}

  
      // 3) Añadir la celda al grid
      calendarGrid.appendChild(cell);
    }
  }
  
  
  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      currentDate.setMonth(currentDate.getMonth() - 1);
      generateCalendar(currentDate);
      fetchEventos();
      attachDayEventHandlers();
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      currentDate.setMonth(currentDate.getMonth() + 1);
      generateCalendar(currentDate);
      fetchEventos();
      attachDayEventHandlers();
    });
    
  }
  if (todayBtn) {
    todayBtn.addEventListener("click", () => {
      currentDate = new Date();
      generateCalendar(currentDate);
      fetchEventos();
      attachDayEventHandlers();
    });
  }
  // Primera carga
  generateCalendar(currentDate);
// ----------------------------
// Lluvia de flores y corazones al pulsar el botón principal
// ----------------------------
if (floresBtn) {
  floresBtn.addEventListener("click", () => {
    const emojis = ["🌸","🌹","🌺","🌷","🌻","💐","🌼","🩵"];
    const total = 200;  // ahora caen 200 emojis
    for (let i = 0; i < total; i++) {
      const emo = document.createElement("div");
      emo.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      emo.className = "fixed text-2xl";
      emo.style.left = Math.random() * 100 + "vw";
      emo.style.top = "-2rem";
      emo.style.transform = `rotate(${Math.random() * 360}deg)`;
      emo.style.animation = `fall ${Math.random() * 2 + 3}s linear both`;
      document.body.appendChild(emo);
      setTimeout(() => emo.remove(), 5000);
    }
  });
}

// ----------------------------
// Modal de Notificaciones
// ----------------------------
const notificacionesBtn       = document.getElementById("notificacionesBtn");
if (notificacionesBtn && notificacionesModal && closeNotificacionesModal) {
  notificacionesBtn.addEventListener("click", () =>
    notificacionesModal.classList.remove("hidden")
  );
  closeNotificacionesModal.addEventListener("click", () =>
    notificacionesModal.classList.add("hidden")
  );
}
// — Selección de usuario por nombre (oscurece la tarjeta) —
let selectedUser = null;

const userCards = document.querySelectorAll(".user-card");
const nameSpans = document.querySelectorAll(".user-name");

nameSpans.forEach(span => {
  span.addEventListener("click", () => {
    const user = span.dataset.user;  // "pablo", "paula", etc.
    // Limpiamos selecciones previas
    userCards.forEach(card => card.classList.remove("selected"));
    // Oscurecemos la tarjeta clicada
    const card = document.querySelector(`.user-card[data-user="${user}"]`);
    if (card) card.classList.add("selected");
    // Guardamos la elección
    selectedUser = user;
    console.log("Usuario seleccionado:", selectedUser);
  });
});
['pablo', 'paula', 'both', 'hospi', 'friki'].forEach(user => {
  const icon = document.getElementById(`icon${user.charAt(0).toUpperCase() + user.slice(1)}`);
  if (!icon) return;
  icon.style.cursor = 'pointer';
  icon.addEventListener('click', () => {
    // alterna en el set
    if (hiddenUsers.has(user)) {
      hiddenUsers.delete(user);
      // desatura la tarjeta
      document.querySelector(`.user-card[data-user="${user}"]`).classList.remove('opacity-50');
    } else {
      hiddenUsers.add(user);
      // aplica desaturación a la tarjeta
      document.querySelector(`.user-card[data-user="${user}"]`).classList.add('opacity-50');
    }
    // refresca vista
    refreshEvents();
  });
});
// ----------------------------
// Recordatorios — cuenta atrás
// ----------------------------
const recordatorios = [
  { id: "countdown-paellas",      label: "Añitoo",     target: new Date("2026-04-16T00:00:00") },
  { id: "countdown-verte",        label: "Vernos",       target: new Date("2025-05-10T15:00:00") },
  { id: "countdown-bali",         label: "Bali",        target: new Date("2025-05-26T09:00:00") },
  { id: "countdown-gradu-paula",  label: "Gradu Paula", target: new Date("2025-06-16T10:00:00") },
  { id: "countdown-gradu-pablo",  label: "Gradu Pablo",  target: new Date("2025-09-28T11:00:00") },
];

function updateRecordatorios() {
  const now = new Date();
  recordatorios.forEach(({ id, target }) => {
    const span = document.getElementById(id);
    if (!span) return;
    let diff = target - now;
    if (diff < 0) diff = 0;
    const days    = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours   = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60))       / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60))             / 1000);
    span.textContent = `${days}d ${hours}h ${minutes}m ${seconds}s`;
  });
}

// Ejecutamos inmediatamente y luego cada segundo
updateRecordatorios();
setInterval(updateRecordatorios, 1000);

    // ——————————————————————————————
  // Inicializar modales de lista de Turnos y Trabajos
  // ——————————————————————————————
  let selectedDate = null;

  const listaTurnosModal      = document.getElementById("listaTurnosModal");
  const closeListaTurnosModal = document.getElementById("closeListaTurnosModal");
  const listaTurnosButtons    = document.getElementById("listaTurnosButtons");

  const listaTrabajosModal      = document.getElementById("listaTrabajosModal");
  const closeListaTrabajosModal = document.getElementById("closeListaTrabajosModal");
  const listaTrabajosButtons    = document.getElementById("listaTrabajosButtons");

// —————————————————————————————
// Crea un “globito” o contador de eventos en el calendario
// —————————————————————————————
// Crea un badge o contador de eventos justo debajo del número y centrado
// —————————————————————————————
// Crea un badge o contador de eventos *debajo* del número y centrado
// —————————————————————————————
  // ------------------------------------------------------------------------------------------------
  //  Eventos globales: almacenaremos aquí los eventos creados
  // ------------------------------------------------------------------------------------------------
  const events = [];

  // ------------------------------------------------------------------------------------------------
  //  Función que crea y pinta badge dentro de la celda del calendario
  // ------------------------------------------------------------------------------------------------
  /*function createEventOnCalendar(dateStr, title, startTime, endTime, classes) {
    // Guardamos en el array
    const [startHour, startMin] = startTime.split(":").map(Number);
    const [endHour, endMin]     = endTime.split(":").map(Number);
    events.push({
      date: dateStr,
      title,
      classes,
      startHour,
      startMin,
      endHour,
      endMin
    });
        // Buscamos la celda correspondiente
    const cell = Array.from(calendarGrid.children)
      .find(c => c.querySelector(".text-sm").textContent === String(+dateStr.split("-")[2]));
    if (!cell) return;
    const badge = document.createElement("div");
    badge.className = `text-xs rounded px-1 py-0.5 mb-1 ${classes} event-item`;
    badge.textContent = `${startTime}–${endTime} ${title}`;
    cell.appendChild(badge);
  }
*/
// ----------------------------------
// Flechas: abrir modales de Turnos y Trabajos
// ----------------------------------
const openHospiBtn = document.getElementById('openHospiModal');
if (openHospiBtn) {
  openHospiBtn.addEventListener('click', e => {
    e.stopPropagation();
    if (turnosModal) turnosModal.classList.remove('hidden');
  });
}

const openFrikiBtn = document.getElementById('openFrikiModal');
if (openFrikiBtn) {
  openFrikiBtn.addEventListener('click', e => {
    e.stopPropagation();
    if (trabajosModal) trabajosModal.classList.remove('hidden');
  });
}

function createEventOnCalendar(dateStr, title, startTime, endTime, classes, evObj = {}) {
  // Construir el objeto completo del evento
  const ev = {
    id:            evObj.id            ?? null,
    titulo:        title,
    descripcion:   evObj.descripcion   ?? '',
    ubicacion:     evObj.ubicacion     ?? '',
    fecha_inicio:  evObj.fecha_inicio  ?? `${dateStr}T${startTime}`,
    fecha_fin:     evObj.fecha_fin     ?? `${dateStr}T${endTime}`,
    usuario:       evObj.usuario       ?? selectedUser,
    tipo_id:       evObj.tipo_id       ?? null,
    date:          dateStr,
    startTime,
    endTime,
    classes
  };
  events.push(ev);

  const cell = Array.from(calendarGrid.children)
    .find(c => c.dataset.date === dateStr);
  if (!cell) return;

  // Limpiar badges previos
  cell.querySelectorAll(".event-item, .more-events").forEach(el => el.remove());

  // Pintar hasta dos badges clicables
  const dayEvents = events.filter(e => e.date === dateStr);
  dayEvents.slice(0, 2).forEach(e => {
    const badge = document.createElement("div");
    badge.className = `event-item ${e.classes}`;
    badge.textContent = `${e.startTime}–${e.endTime} ${e.titulo}`;
    badge.dataset.event = JSON.stringify(e);
    badge.addEventListener("click", evt => {
      evt.stopPropagation();
      openEditModal(e);
    });
    cell.appendChild(badge);
  });

  // Indicador de “+X eventos más”
  if (dayEvents.length > 2) {
    const more = document.createElement("div");
    more.className = "more-events";
    more.textContent = `+${dayEvents.length - 2} eventos más`;
    cell.appendChild(more);
  }
}


calendarGrid.addEventListener("click", e => {
  const dayCell = e.target.closest(".calendar-day");
  if (!dayCell) return;

  const selectedDate = dayCell.dataset.date;
  const container = document.getElementById("dayHourList");
  container.innerHTML = "";
  container.style.position = "relative";

  const dayEvents = events.filter(ev => ev.date === selectedDate);

  const rowHeight = 60;  // cada hora tendrá 60px exactos

  // Crear filas horarias claramente definidas
  for (let h = 0; h < 24; h++) {
    const hourRow = document.createElement("div");
    hourRow.className = "flex items-start relative";
    hourRow.style.height = `${rowHeight}px`;
    hourRow.innerHTML = `
      <div class="w-12 text-right text-gray-600 pr-2">${String(h).padStart(2, "0")}:00</div>
      <div class="flex-1 border-b"></div>
    `;
    container.appendChild(hourRow);
  }

// --- 1) Prepara array con start/end en px ---
const positioned = dayEvents.map((ev, i) => {
  const [sh, sm] = ev.startTime.split(":").map(Number);
  const [eh, em] = ev.endTime.split(":").map(Number);
  const startPx = sh * rowHeight + (sm * rowHeight / 60);
  const endPx   = eh * rowHeight + (em * rowHeight / 60);
  return { ...ev, idx: i, startPx, endPx, col: 0, totalCols: 1 };
});

// --- 2) Agrupar en clusters de solapamiento ---
const clusters = [];
positioned.forEach(ev => {
  let found = false;
  for (const cl of clusters) {
    // si ev solapa con cualquiera del cluster, lo añadimos
    if (cl.some(c => ev.startPx < c.endPx && c.startPx < ev.endPx)) {
      cl.push(ev);
      found = true;
      break;
    }
  }
  if (!found) clusters.push([ev]);
});

// --- 3) Asignar columnas dentro de cada cluster ---
clusters.forEach(cluster => {
  const cols = [];
  cluster.forEach(ev => {
    let placed = false;
    for (let i = 0; i < cols.length; i++) {
      // si no solapa con ninguno en cols[i], va en esa columna
      if (!cols[i].some(c => ev.startPx < c.endPx && c.startPx < ev.endPx)) {
        ev.col = i;
        cols[i].push(ev);
        placed = true;
        break;
      }
    }
    if (!placed) {
      ev.col = cols.length;
      cols.push([ev]);
    }
  });
  // total de columnas para este cluster
  cols.forEach(colArr => colArr.forEach(ev => ev.totalCols = cols.length));
});

// --- 4) Renderizar cada bloque con left/width dinámicos ---
// --- 4) Renderizar cada bloque con left/width dinámicos ---
const labelRem = 3.5;  // igual que tu padding-left de horas (3.5rem)
positioned.forEach(ev => {
  const block = document.createElement("div");
  block.className = `absolute rounded event-block ${ev.classes}`;
  const leftPct  = (100 * ev.col / ev.totalCols).toFixed(4);
  const widthPct = (100 / ev.totalCols).toFixed(4);

  block.style.top       = `${ev.startPx}px`;
  block.style.height    = `${ev.endPx - ev.startPx}px`;
  block.style.left      = `calc(${labelRem}rem + ${leftPct}%)`;
  block.style.width     = `calc(${widthPct}% - 0.5rem)`;
  block.style.padding   = "4px 8px";
  block.style.boxSizing = "border-box";

  // Guardamos el objeto completo para poder editarlo
  block.dataset.event = JSON.stringify(ev);
  block.addEventListener("click", e => {
    e.stopPropagation();
    openEditModal(ev);
  });

  block.innerHTML = `
    <div class="text-xs font-medium truncate">
      ${ev.startTime}–${ev.endTime} ${ev.titulo}
    </div>
  `;
  block.addEventListener("click", e => {
    e.stopPropagation();
    // Cerrar modal de día
    diaEventosModal.classList.add("hidden");

    // Rellenar formulario de edición
    editingEventId = ev.id;
    editingEventUser   = ev.usuario;
  editingEventTipoId = ev.tipo_id;

    document.getElementById("editEventTitle").value       = ev.titulo;
    document.getElementById("editEventDescription").value = ev.descripcion;
    document.getElementById("editEventLocation").value    = ev.ubicacion;
    document.getElementById("editEventStartDate").value   = ev.fecha_inicio.split("T")[0];
    document.getElementById("editEventStartTime").value   = ev.fecha_inicio.split("T")[1].substr(0,5);
    document.getElementById("editEventEndDate").value     = ev.fecha_fin.split("T")[0];
    document.getElementById("editEventEndTime").value     = ev.fecha_fin.split("T")[1].substr(0,5);

    // Mostrar modal de edición
    editarEventoModal.classList.remove("hidden");
  });

  container.appendChild(block);
});



  diaEventosModal.classList.remove("hidden");
});

if (closeEditarEventoModal) {
  closeEditarEventoModal.addEventListener("click", () =>
    editarEventoModal.classList.add("hidden")
  );
}

  
updateBtn.addEventListener("click", async () => {
  const payload = {
    titulo:       document.getElementById("editEventTitle").value.trim(),
    descripcion:  document.getElementById("editEventDescription").value.trim(),
    ubicacion:    document.getElementById("editEventLocation").value.trim(),
    fecha_inicio: `${document.getElementById("editEventStartDate").value}T${document.getElementById("editEventStartTime").value}:00`,
    fecha_fin:    `${document.getElementById("editEventEndDate").value}T${document.getElementById("editEventEndTime").value}:00`,
    usuario:      editingEventUser,
    tipo_id:      editingEventTipoId
  };
  await fetch(`/api/eventos/${editingEventId}`, {
    method:  "PUT",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(payload)
  });
  editarEventoModal.classList.add("hidden");
  await fetchEventos();
});

deleteBtn.addEventListener("click", async () => {
  // 1) Llamada a la API
  await fetch(`/api/eventos/${editingEventId}`, { method: "DELETE" });

  // 2) Ocultar modal de edición
  editarEventoModal.classList.add("hidden");

  // 3) Volver a dibujar todo el calendario y sus eventos
  generateCalendar(currentDate);
  await fetchEventos();
});




  // ------------------------------------------------------------------------------------------------
  //  Botón Cerrar y Añadir dentro del modal Día
  // ------------------------------------------------------------------------------------------------
  closeDiaEventosModal.addEventListener("click", () => {
    diaEventosModal.classList.add("hidden");
  });
  addEventoDia.addEventListener("click", () => {
// Ocultar modal de día
diaEventosModal.classList.add("hidden");

// Limpiar campos de título, descripción y ubicación
document.getElementById("eventTitle").value       = "";
document.getElementById("eventDescription").value = "";
document.getElementById("eventLocation").value    = "";

// Abrir modal de creación
crearEventoModal.classList.remove("hidden");

  });



  const historiaBtn = document.getElementById("historiaBtn");
  const historiaModal = document.getElementById("historiaModal");
  const closeHistoriaModal = document.getElementById("closeHistoriaModal");
  
  if (historiaBtn && historiaModal && closeHistoriaModal) {
    historiaBtn.addEventListener("click", () => {
      historiaModal.classList.remove("hidden");
    });
    closeHistoriaModal.addEventListener("click", () => {
      historiaModal.classList.add("hidden");
    });
  }
// Cerrar el modal de Historia al hacer clic fuera del contenido
if (historiaModal) {
  historiaModal.addEventListener("click", (e) => {
    if (e.target === historiaModal) {
      historiaModal.classList.add("hidden");
    }
  });
}
  

// ─────────────────────────────────────────────────────────────────────────────
// 1) Asegúrate de que estas variables están definidas arriba en tu script:


// 2) Botones dentro del modal “Crear Evento” (REEMPLAZA los tuyos si hace falta):
const userHospiBtnModal = document.getElementById("userHospiBtnModal");
const userFrikiBtnModal = document.getElementById("userFrikiBtnModal");

userHospiBtnModal.addEventListener("click", () => {
  selectedUser = "hospi";
  crearEventoModal.classList.add("hidden");
  showTurnosList();
});
userFrikiBtnModal.addEventListener("click", () => {
  selectedUser = "friki";
  crearEventoModal.classList.add("hidden");
  showTrabajosList();
});

// 3) Función para refrescar la vista tras un POST
async function refreshEvents() {
  // 1) Limpiar array y DOM
  events.length = 0;
  generateCalendar(currentDate);
  // 2) Volver a pintar los eventos filtrados
  await fetchEventos();
  // 3) Reenganchar los handlers de edición/detalle
  attachDayEventHandlers();
}


// 4) Lista de TURNOS
async function showTurnosList() {
  // Evita GET/POST inválidos
  if (!selectedDate || !selectedUser) return;

  // Renderiza los botones
  listaTurnosButtons.innerHTML = turnos
    .map((t, i) => `
      <button data-idx="${i}"
              class="w-full text-left bg-green-100 hover:bg-green-200
                     text-green-700 px-4 py-2 rounded-lg">
        ${t.nombre}: ${t.inicio} - ${t.fin}
      </button>
    `).join("");

  // Cada clic hace POST y recarga (obsérvese el async en el callback)
  listaTurnosButtons.querySelectorAll("button").forEach(btn => {
    btn.addEventListener("click", async () => {
      const t = turnos[btn.dataset.idx];
      try {
        const res = await fetch("/api/eventos", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            titulo:      t.nombre,
            descripcion: "",
            ubicacion:   "",
            fecha_inicio:`${selectedDate}T${t.inicio}`,  // quitamos ":00"
            fecha_fin:   `${selectedDate}T${t.fin}`,     // quitamos ":00"
            usuario:     selectedUser,
            tipo_id:     t.id
          })
          
        });
        if (!res.ok) {
          const err = await res.json();
          console.error("API /api/eventos error:", err);
          return;
        }
      } catch (e) {
        console.error("Fetch error al guardar turno:", e);
        return;
      }

      listaTurnosModal.classList.add("hidden");
      await refreshEvents();
    });
  });

  listaTurnosModal.classList.remove("hidden");
}

// 5) Lista de TRABAJOS
async function showTrabajosList() {
  if (!selectedDate || !selectedUser) return;

  listaTrabajosButtons.innerHTML = trabajos
    .map((t, i) => `
      <button data-idx="${i}" 
              class="w-full text-left bg-yellow-100 hover:bg-yellow-200
                     text-yellow-700 px-4 py-2 rounded-lg">
        ${t.nombre}: ${t.inicio} - ${t.fin}
      </button>
    `).join("");

  listaTrabajosButtons.querySelectorAll("button").forEach(btn => {
    btn.addEventListener("click", async () => {
      const t = trabajos[btn.dataset.idx];
      try {
        const res = await fetch("/api/eventos", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            titulo:      t.nombre,
            descripcion: "",
            ubicacion:   "",
            fecha_inicio:`${selectedDate}T${t.inicio}`,
            fecha_fin:   `${selectedDate}T${t.fin}`,
            usuario:     selectedUser,
            tipo_id:     t.id
          })
          
        });
        if (!res.ok) {
          const err = await res.json();
          console.error("API /api/eventos error:", err);
          return;
        }
      } catch (e) {
        console.error("Fetch error al guardar trabajo:", e);
        return;
      }

      listaTrabajosModal.classList.add("hidden");
      await refreshEvents();
    });
  });

  listaTrabajosModal.classList.remove("hidden");
}

// 6) Listener en cada celda del calendario: guarda

  
  

  // Cerrar modales de lista
  if (closeListaTurnosModal) closeListaTurnosModal.addEventListener("click", () =>
    listaTurnosModal.classList.add("hidden")
  );
  if (closeListaTrabajosModal) closeListaTrabajosModal.addEventListener("click", () =>
    listaTrabajosModal.classList.add("hidden")
  );

  userHospiBtnModal.addEventListener("click", () => {
    selectedUser = 'hospi';
    crearEventoModal.classList.add("hidden");
    showTurnosList();
  });
  userFrikiBtnModal.addEventListener("click", () => {
    selectedUser = 'friki';
    crearEventoModal.classList.add("hidden");
    showTrabajosList();
  });
  

  // Guarda la fecha clicada en generateCalendar():
  // dentro de tu bucle de generateCalendar, en el listener de addBtn:
  //   selectedDate = cell.dataset.date;
  //   ...luego abrir modal: crearEventoModal.classList.remove("hidden");
  // ————————————————
  // Guardar evento al pulsar Pablo o Paula
  // ————————————————
  const userPabloBtnModal = document.getElementById("userPabloBtnModal");
  const userPaulaBtnModal = document.getElementById("userPaulaBtnModal");
  const eventoForm        = document.getElementById("eventoForm");




// Para distinguir si vamos a crear o editar
let editingEventId = null;
let editingEventUser   = null;
let editingEventTipoId = null;
// Función para crear un evento (POST)
async function saveEventForUser(user) {
  const titleEl = document.getElementById("eventTitle");
  if (!titleEl.value.trim()) return;
  const title     = titleEl.value.trim();
  const desc      = document.getElementById("eventDescription").value.trim();
  const loc       = document.getElementById("eventLocation").value.trim();
  const startDate = document.getElementById("eventStartDate").value;
  const startTime = document.getElementById("eventStartTime").value;
  const endDate   = document.getElementById("eventEndDate").value;
  const endTime   = document.getElementById("eventEndTime").value;

  const payload = {
    titulo:       title,
    descripcion:  desc,
    ubicacion:    loc,
    fecha_inicio: `${startDate}T${startTime}:00`,
    fecha_fin:    `${endDate}T${endTime}:00`,
    usuario:      user,
    tipo_id:      null
  };

  await fetch('/api/eventos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const colorClasses = user === "pablo"
    ? "bg-blue-100 text-blue-800"
    : "bg-pink-100 text-pink-800";

  createEventOnCalendar(
    selectedDate,
    title,
    startTime,
    endTime,
    colorClasses
  );

  crearEventoModal.classList.add("hidden");
  eventoForm.reset();
}

// Listeners para creación
if (userPabloBtnModal) {
  userPabloBtnModal.addEventListener("click", () => saveEventForUser("pablo"));
}
if (userPaulaBtnModal) {
  userPaulaBtnModal.addEventListener("click", () => saveEventForUser("paula"));
}
const userBothBtnModal = document.getElementById("userBothBtnModal");
if (userBothBtnModal) {
  userBothBtnModal.addEventListener("click", () => saveEventForUser("both"));
}

// ─────────────────────────────────────────────────────────────────────────────
// Funciones para editar y eliminar

// 1. Al hacer clic en un evento del día, lo abrimos para edición
function attachDayEventHandlers() {
  document.querySelectorAll('#dayHourList .event-block').forEach(block => {
    block.addEventListener('click', e => {
      e.stopPropagation();
      const ev = JSON.parse(block.dataset.event);
      openEditModal(ev);
    });
  });
}

// Botones de acción en el modal (Actualizar / Eliminar)
const btnActualizar     = document.getElementById("btnActualizar");
const btnEliminar       = document.getElementById("btnEliminar");

// 2. Abrir modal con datos para editar
function openEditModal(ev) {
  editingEventId = ev.id;

  document.getElementById("eventTitle").value       = ev.titulo;
  document.getElementById("eventDescription").value = ev.descripcion;
  document.getElementById("eventLocation").value    = ev.ubicacion;
  document.getElementById("eventStartDate").value   = ev.fecha_inicio.split('T')[0];
  document.getElementById("eventStartTime").value   = ev.fecha_inicio.split('T')[1].substr(0,5);
  document.getElementById("eventEndDate").value     = ev.fecha_fin.split('T')[0];
  document.getElementById("eventEndTime").value     = ev.fecha_fin.split('T')[1].substr(0,5);

  // Ocultar botón Crear y mostrar Actualizar/Eliminar
  document.getElementById("btnGuardar") .classList.add("hidden");
  btnActualizar                        .classList.remove("hidden");
  btnEliminar                          .classList.remove("hidden");
  crearEventoModal                     .classList.remove("hidden");
}

// 3. Función unificada para crear o actualizar
async function submitEvent(user) {
  const ev = {
    titulo:       document.getElementById("eventTitle").value.trim(),
    descripcion:  document.getElementById("eventDescription").value.trim(),
    ubicacion:    document.getElementById("eventLocation").value.trim(),
    fecha_inicio: `${document.getElementById("eventStartDate").value}T${document.getElementById("eventStartTime").value}:00`,
    fecha_fin:    `${document.getElementById("eventEndDate").value}T${document.getElementById("eventEndTime").value}:00`,
    usuario:      user,
    tipo_id:      null
  };

  const url    = editingEventId
               ? `/api/eventos/${editingEventId}`
               : '/api/eventos';
  const method = editingEventId ? 'PUT' : 'POST';

  await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(ev)
  });

  // Refrescar vista…
  crearEventoModal.classList.add("hidden");
  eventoForm.reset();
  editingEventId = null;
}

// 4. Función para eliminar
async function deleteEvent() {
  if (!editingEventId) return;
  await fetch(`/api/eventos/${editingEventId}`, { method: 'DELETE' });
  crearEventoModal.classList.add("hidden");
  editingEventId = null;
  // Refrescar vista…
}

// Listeners de editar y eliminar
btnActualizar.addEventListener("click", () => submitEvent(selectedUser));
btnEliminar  .addEventListener("click", deleteEvent);

// ─────────────────────────────────────────────────────────────────────────────
// Cerrar modal de Día al clicar fuera del contenido
diaEventosModal.addEventListener("click", function(e) {
  if (e.target === diaEventosModal) {
    diaEventosModal.classList.add("hidden");
  }
});

// MODIFICADO
async function fetchEventos() {
  try {
    const res = await fetch('/api/eventos');
    const eventos = await res.json();
    events.length = 0; // limpiamos el array antes de repoblarlo
    eventos.forEach(ev => {
      if (hiddenUsers.has(ev.usuario)) return;

      let classes = '';      if (ev.usuario === 'pablo') {
        classes = 'bg-blue-100 text-blue-800';
      } else if (ev.usuario === 'paula') {
        classes = 'bg-pink-100 text-pink-800';
      } else if (ev.usuario === 'hospi') {
        classes = 'bg-green-100 text-green-800';
      } else if (ev.usuario === 'friki') {
        classes = 'bg-yellow-100 text-yellow-800';
      } else if (ev.usuario === 'both') {
        classes = 'bg-red-100 text-red-800';
      } else {
        classes = 'bg-gray-100 text-gray-800';
      }
      
      createEventOnCalendar(
        ev.fecha_inicio.split('T')[0],
        ev.titulo,
        ev.fecha_inicio.split('T')[1].substring(0,5),
        ev.fecha_fin.split('T')[1].substring(0,5),
        classes,
        ev  // pasamos TODO el objeto de evento
      );
    });
  } catch (err) {
    console.error('No se pudieron cargar eventos:', err);
  }
}



generateCalendar(currentDate);
fetchEventos();
attachDayEventHandlers();


});
