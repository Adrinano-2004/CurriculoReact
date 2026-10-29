import { openingHours, site } from "./site";

const WEEKDAYS = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];

/** Dia da semana e minutos no fuso do restaurante, independente do fuso do visitante. */
function nowInRestaurant(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: site.timezone,
    weekday: "short",
    hour: "numeric",
    minute: "numeric",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "0";
  const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
  return { day, minutes: Number(get("hour")) * 60 + Number(get("minute")) };
}

const fmt = (m: number) => `${Math.floor(m / 60)}h${m % 60 ? String(m % 60).padStart(2, "0") : ""}`;

export function openStatus(date = new Date()) {
  const { day, minutes } = nowInRestaurant(date);
  const today = openingHours.find((h) => h.days.includes(day));
  if (today && minutes >= today.open && minutes < today.close) {
    return { open: true, text: `Aberto agora · fecha às ${fmt(today.close)}` };
  }
  for (let i = 0; i < 8; i++) {
    const d = (day + i) % 7;
    const slot = openingHours.find((h) => h.days.includes(d));
    if (!slot || (i === 0 && minutes >= slot.open)) continue;
    const when = i === 0 ? "hoje" : i === 1 ? "amanhã" : WEEKDAYS[d];
    return { open: false, text: `Fechado agora · abre ${when} às ${fmt(slot.open)}` };
  }
  return { open: false, text: "Fechado agora" };
}
