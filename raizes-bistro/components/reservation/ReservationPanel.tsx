"use client";

import { useEffect, useMemo, useState } from "react";
import { openStatus } from "@/lib/hours";
import { openingHours, site, whatsappLink } from "@/lib/site";

const OCCASIONS = ["Jantar", "Almoço de domingo", "Aniversário", "Comemoração a dois", "Grupo ou evento"];

/** Horários de chegada possíveis (de 30 em 30 min até 1h antes de fechar). */
function slotsFor(dateISO: string) {
  if (!dateISO) return [];
  const day = new Date(`${dateISO}T12:00:00`).getDay();
  const hours = openingHours.find((h) => h.days.includes(day));
  if (!hours) return [];
  const out: string[] = [];
  for (let m = hours.open; m <= hours.close - 60; m += 30) out.push(`${Math.floor(m / 60)}h${m % 60 ? "30" : ""}`);
  return out;
}

const formatDate = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "2-digit" });

/** Informações da casa + formulário que monta a mensagem de reserva para o WhatsApp. */
export function ReservationPanel({ dish }: { dish?: string }) {
  const [status, setStatus] = useState<{ open: boolean; text: string } | null>(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [people, setPeople] = useState("2");
  const [occasion, setOccasion] = useState(OCCASIONS[0]);
  const [name, setName] = useState("");
  const [notes, setNotes] = useState(dish ? `Quero provar o ${dish}.` : "");
  const [today, setToday] = useState("");

  useEffect(() => {
    const update = () => setStatus(openStatus());
    update();
    const id = setInterval(update, 60_000);
    setToday(new Date().toLocaleDateString("en-CA", { timeZone: site.timezone }));
    return () => clearInterval(id);
  }, []);

  const slots = useMemo(() => slotsFor(date), [date]);
  useEffect(() => setTime((t) => (slots.includes(t) ? t : slots[0] ?? "")), [slots]);
  const closedDay = !!date && slots.length === 0;

  const message = [
    `Olá! Gostaria de reservar uma mesa no Raízes.`,
    name && `Nome: ${name}`,
    date && `Data: ${formatDate(date)}`,
    time && `Horário: ${time}`,
    `Pessoas: ${people}`,
    `Ocasião: ${occasion}`,
    notes && `Observações: ${notes}`,
  ]
    .filter(Boolean)
    .join("\n");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (closedDay) return;
    window.open(whatsappLink(message), "_blank", "noopener");
  };

  const field = "w-full border-b border-cream/25 bg-transparent py-3 text-cream outline-none transition-colors placeholder:text-cream/35 focus:border-candle";
  const label = "eyebrow text-cream/55";

  return (
    <div className="grid gap-12 px-6 pb-10 pt-6 md:grid-cols-12 md:gap-10 md:p-12">
        <div className="md:col-span-5">
          <p className="eyebrow text-candle">Reservas</p>
          <h2 className="mt-4 font-display text-[clamp(2.4rem,4vw,3.6rem)] leading-none text-cream">
            Sua mesa <em className="italic text-candle">está posta.</em>
          </h2>
          {status && (
            <p className="mt-8 inline-flex items-center gap-3 rounded-full border border-cream/15 px-4 py-2 text-sm text-cream/85">
              <span className={`size-2 rounded-full ${status.open ? "bg-[#7fb069] shadow-[0_0_10px_#7fb069]" : "bg-terracotta"}`} />
              {status.text}
            </p>
          )}
          <dl className="mt-9 space-y-6 text-cream/80">
            <div>
              <dt className={label}>Horários</dt>
              {openingHours.map((h) => (
                <dd key={h.label} className="mt-2">{h.label}</dd>
              ))}
            </div>
            <div>
              <dt className={label}>Endereço</dt>
              <dd className="mt-2">
                {site.address.street}, {site.address.district}
                <br />
                {site.address.city} · {site.address.region} · {site.address.postalCode}
              </dd>
              <dd className="mt-3">
                <a href={site.mapsUrl} target="_blank" rel="noopener" data-track="maps" className="text-candle underline decoration-candle/40 underline-offset-4 hover:decoration-candle">
                  Como chegar
                </a>
              </dd>
            </div>
            <div>
              <dt className={label}>Contato</dt>
              <dd className="mt-2">
                WhatsApp{" "}
                <a href={whatsappLink("Olá, Raízes!")} target="_blank" rel="noopener" className="hover:text-candle">
                  {site.whatsappDisplay}
                </a>
              </dd>
              <dd>
                Telefone{" "}
                <a href={`tel:${site.phone}`} className="hover:text-candle">
                  {site.phoneDisplay}
                </a>
              </dd>
            </div>
          </dl>
        </div>

        <form onSubmit={submit} className="rounded-sm border border-cream/10 bg-espresso/40 p-6 md:col-span-7 md:p-8" aria-describedby="reserva-ajuda">
          <p id="reserva-ajuda" className="text-sm leading-relaxed text-cream/60">
            Preencha e enviamos tudo pronto para o WhatsApp da casa. A reserva é confirmada pela equipe.
          </p>
          <div className="mt-8 grid gap-7 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className={label}>Seu nome</span>
              <input value={name} onChange={(e) => setName(e.target.value)} className={field} placeholder="Como devemos chamar você?" autoComplete="name" />
            </label>
            <label className="block">
              <span className={label}>Data</span>
              <input type="date" required min={today} value={date} onChange={(e) => setDate(e.target.value)} className={`${field} [color-scheme:dark]`} />
            </label>
            <label className="block">
              <span className={label}>Horário</span>
              <select required value={time} onChange={(e) => setTime(e.target.value)} disabled={!slots.length} className={`${field} disabled:opacity-40`}>
                {!slots.length && <option value="">Escolha a data</option>}
                {slots.map((s) => (
                  <option key={s} value={s} className="bg-walnut">
                    {s}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className={label}>Pessoas</span>
              <select value={people} onChange={(e) => setPeople(e.target.value)} className={field}>
                {["1", "2", "3", "4", "5", "6", "7", "8", "Mais de 8"].map((n) => (
                  <option key={n} value={n} className="bg-walnut">
                    {n}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className={label}>Ocasião</span>
              <select value={occasion} onChange={(e) => setOccasion(e.target.value)} className={field}>
                {OCCASIONS.map((o) => (
                  <option key={o} value={o} className="bg-walnut">
                    {o}
                  </option>
                ))}
              </select>
            </label>
            <label className="block sm:col-span-2">
              <span className={label}>Observações</span>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className={`${field} resize-none`} placeholder="Restrição alimentar, cadeira de bebê, surpresa…" />
            </label>
          </div>
          {closedDay && (
            <p role="alert" className="mt-6 text-sm text-candle">
              Nesse dia a casa está fechada. Abrimos de quarta a sábado à noite e no almoço de domingo.
            </p>
          )}
          <button
            type="submit"
            disabled={closedDay}
            data-track="whatsapp-reserva"
            className="mt-9 w-full rounded-full bg-terracotta py-4 text-xs font-semibold uppercase tracking-[0.24em] text-cream transition-colors duration-300 hover:bg-candle hover:text-espresso disabled:opacity-40"
          >
            Enviar pedido de reserva
          </button>
        </form>
    </div>
  );
}
