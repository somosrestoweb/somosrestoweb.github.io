/* Fuego Lento (marca ficticia, demo de restoweb) — datos de marca editables.
   Cambiá acá el número de WhatsApp, horarios y turnos de reserva.
   Los productos y precios del pedido se leen del menú de la página (data-item / data-price). */
(function () {
  "use strict";
  window.__BRAND__ = {
    name: "Fuego Lento",
    whatsapp: "5491167922355",            // formato internacional, sin + ni espacios
    whatsappDisplay: "+54 9 11 6792-2355",
    address: "Gorriti 5480, Palermo, CABA",
    // Turnos del formulario de reservas, por día (0 = domingo … 6 = sábado).
    // Horario: mié–vie 20–00:30 · sáb y dom 12:30–16 y 20–01 · lunes y martes cerrado.
    slots: {
      lunch:  ["12:30", "13:00", "13:30", "14:00", "14:30"],
      dinner: ["20:00", "20:30", "21:00", "21:30", "22:00", "22:30", "23:00"]
    },
    lunchDays: [0, 6],                     // días con turno de mediodía
    closedDays: [1, 2],                    // días sin reservas
    messages: {
      question: "¡Hola Fuego Lento! Tengo una consulta: "
    }
  };
})();
