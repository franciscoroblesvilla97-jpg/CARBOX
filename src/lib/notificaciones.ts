import { Resend } from "resend";
import { formatCLP } from "@/lib/format";
import { TELEFONO_CARBOX, whatsappUrl } from "@/lib/whatsapp";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
const ZONA_HORARIA = "America/Santiago";
const DIRECCION = "Pedro de Valdivia 525, Concepción";
const MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`Carbox ${DIRECCION}, Chile`)}`;

/**
 * Envía un mensaje de WhatsApp usando una plantilla aprobada de Meta Cloud API.
 * Fuera de una conversación iniciada por el cliente en las últimas 24h, WhatsApp
 * exige que los mensajes que inicia el negocio usen una plantilla pre-aprobada
 * (no texto libre) — por eso aquí siempre se envía por plantilla, nunca texto plano.
 */
async function enviarWhatsAppTemplate(telefono: string, templateName: string, parametros: string[]) {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneNumberId) {
    console.warn(`[WhatsApp] No configurado — se omite envío de plantilla "${templateName}" a ${telefono}`);
    return;
  }

  const numeroLimpio = telefono.replace(/\D/g, "");

  try {
    const res = await fetch(`https://graph.facebook.com/v21.0/${phoneNumberId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: numeroLimpio,
        type: "template",
        template: {
          name: templateName,
          language: { code: "es" },
          components:
            parametros.length > 0
              ? [{ type: "body", parameters: parametros.map((texto) => ({ type: "text", text: texto })) }]
              : undefined,
        },
      }),
    });

    if (!res.ok) {
      const detalle = await res.text();
      console.error(`[WhatsApp] Error enviando plantilla "${templateName}" a ${telefono}: ${res.status} ${detalle}`);
    }
  } catch (error) {
    console.error(`[WhatsApp] Excepción enviando plantilla "${templateName}" a ${telefono}:`, error);
  }
}

// Copia oculta de todo correo saliente, para que el local tenga registro sin exponer
// la casilla a los demás destinatarios.
const BCC_INTERNO = "carboxconce@gmail.com";

async function enviarEmail(destinatario: string, asunto: string, html: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !from) {
    console.warn(`[Email] No configurado — se omite envío "${asunto}" a ${destinatario}`);
    return;
  }

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({ from, to: destinatario, bcc: BCC_INTERNO, subject: asunto, html });
    if (error) console.error(`[Email] Error enviando "${asunto}" a ${destinatario}:`, error);
  } catch (error) {
    console.error(`[Email] Excepción enviando "${asunto}" a ${destinatario}:`, error);
  }
}

function envoltorioEmail(titulo: string, cuerpoHtml: string) {
  const mensajeWhatsApp = whatsappUrl("Hola Carbox, tengo una consulta sobre mi hora.");
  return `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; color: #1e293b;">
      <h1 style="font-size: 20px; color: #0f172a;">Carbox</h1>
      <h2 style="font-size: 16px; color: #334155;">${titulo}</h2>
      ${cuerpoHtml}
      <p style="font-size: 14px; margin-top: 24px;">
        <a href="${mensajeWhatsApp}" style="color:#16a34a; text-decoration:none; font-weight:bold;">💬 Escribinos por WhatsApp</a>
        &nbsp;·&nbsp;
        <a href="${MAPS_URL}" style="color:#c2410c; text-decoration:none; font-weight:bold;">📍 Cómo llegar</a>
      </p>
      <p style="font-size: 12px; color: #94a3b8; margin-top: 12px;">
        ${DIRECCION} · ${TELEFONO_CARBOX}
      </p>
    </div>
  `;
}

function listaServiciosHtml(servicios: { nombre: string; precio: number }[], total?: number) {
  if (servicios.length === 0) return "";
  const filas = servicios
    .map(
      (s) =>
        `<tr><td style="padding:4px 0;">${s.nombre}</td><td style="padding:4px 0; text-align:right;">${formatCLP(s.precio)}</td></tr>`
    )
    .join("");
  const filaTotal =
    total !== undefined
      ? `<tr><td style="padding:8px 0 0; border-top:1px solid #e2e8f0; font-weight:bold;">Total estimado</td><td style="padding:8px 0 0; border-top:1px solid #e2e8f0; text-align:right; font-weight:bold;">${formatCLP(total)}</td></tr>`
      : "";
  return `<table style="width:100%; font-size:14px; border-collapse:collapse; margin:12px 0;">${filas}${filaTotal}</table>`;
}

export async function notificarSolicitudConfirmada(solicitud: {
  nombreContacto: string;
  telefono: string;
  email: string | null;
  fechaPreferida: Date;
  servicios?: { nombre: string; precio: number }[];
  total?: number;
}) {
  const fecha = new Intl.DateTimeFormat("es-CL", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: ZONA_HORARIA,
  }).format(solicitud.fechaPreferida);

  await Promise.all([
    enviarWhatsAppTemplate(
      solicitud.telefono,
      process.env.WHATSAPP_TEMPLATE_SOLICITUD_CONFIRMADA || "solicitud_confirmada",
      [solicitud.nombreContacto, fecha]
    ),
    solicitud.email
      ? enviarEmail(
          solicitud.email,
          "Tu hora en Carbox fue confirmada",
          envoltorioEmail(
            "¡Tu hora fue confirmada!",
            `<p>Hola ${solicitud.nombreContacto}, confirmamos tu hora para el <strong>${fecha}</strong>.</p>
             ${listaServiciosHtml(solicitud.servicios ?? [], solicitud.total)}
             <p>Te esperamos en Carbox. Si necesitas reagendar, contáctanos.</p>`
          )
        )
      : Promise.resolve(),
  ]);
}

export async function notificarSolicitudRechazada(solicitud: {
  nombreContacto: string;
  telefono: string;
  email: string | null;
}) {
  await Promise.all([
    enviarWhatsAppTemplate(
      solicitud.telefono,
      process.env.WHATSAPP_TEMPLATE_SOLICITUD_RECHAZADA || "solicitud_rechazada",
      [solicitud.nombreContacto]
    ),
    solicitud.email
      ? enviarEmail(
          solicitud.email,
          "Tu hora en Carbox no pudo confirmarse",
          envoltorioEmail(
            "No pudimos confirmar tu hora",
            `<p>Hola ${solicitud.nombreContacto}, lamentablemente no pudimos confirmar tu solicitud de hora.</p>
             <p>Contáctanos para coordinar otra fecha.</p>`
          )
        )
      : Promise.resolve(),
  ]);
}

export async function notificarCotizacionLista(cotizacion: {
  id: string;
  numero: number;
  nombreCliente: string;
  telefono: string | null;
  email: string | null;
}) {
  const url = `${baseUrl}/cotizacion/${cotizacion.id}`;

  await Promise.all([
    cotizacion.telefono
      ? enviarWhatsAppTemplate(
          cotizacion.telefono,
          process.env.WHATSAPP_TEMPLATE_COTIZACION_LISTA || "cotizacion_lista",
          [cotizacion.nombreCliente, String(cotizacion.numero), url]
        )
      : Promise.resolve(),
    cotizacion.email
      ? enviarEmail(
          cotizacion.email,
          `Tu cotización #${cotizacion.numero} en Carbox`,
          envoltorioEmail(
            "Tu cotización está lista",
            `<p>Hola ${cotizacion.nombreCliente}, preparamos la cotización #${cotizacion.numero} que solicitaste.</p>
             <p><a href="${url}" style="color:#c2410c;">Ver cotización →</a></p>`
          )
        )
      : Promise.resolve(),
  ]);
}

export async function notificarRecordatorio24h(orden: {
  numero: number;
  tokenPublico: string;
  clienteNombre: string;
  telefono: string;
  email: string | null;
  fechaProgramada: Date;
}) {
  const fecha = new Intl.DateTimeFormat("es-CL", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: ZONA_HORARIA,
  }).format(orden.fechaProgramada);
  const url = `${baseUrl}/reserva/${orden.tokenPublico}`;

  await Promise.all([
    enviarWhatsAppTemplate(orden.telefono, process.env.WHATSAPP_TEMPLATE_RECORDATORIO || "recordatorio_hora", [
      orden.clienteNombre,
      fecha,
      url,
    ]),
    orden.email
      ? enviarEmail(
          orden.email,
          "Recordatorio: tu hora en Carbox es mañana",
          envoltorioEmail(
            "¡Te esperamos mañana!",
            `<p>Hola ${orden.clienteNombre}, te recordamos tu hora agendada para el <strong>${fecha}</strong>.</p>
             <p><a href="${url}" style="color:#c2410c;">Confirmar o cambiar mi hora →</a></p>`
          )
        )
      : Promise.resolve(),
  ]);
}

export async function notificarOrdenCompletada(orden: {
  id: string;
  numero: number;
  clienteNombre: string;
  telefono: string;
  email: string | null;
}) {
  const url = `${baseUrl}/informe-orden/${orden.id}`;

  await Promise.all([
    enviarWhatsAppTemplate(orden.telefono, process.env.WHATSAPP_TEMPLATE_ORDEN_COMPLETADA || "orden_completada", [
      orden.clienteNombre,
      String(orden.numero),
      url,
    ]),
    orden.email
      ? enviarEmail(
          orden.email,
          `Tu vehículo está listo — OT #${orden.numero}`,
          envoltorioEmail(
            "¡Tu vehículo está listo!",
            `<p>Hola ${orden.clienteNombre}, terminamos el trabajo de la orden #${orden.numero}.</p>
             <p><a href="${url}" style="color:#c2410c;">Ver informe de servicio →</a></p>`
          )
        )
      : Promise.resolve(),
  ]);
}
