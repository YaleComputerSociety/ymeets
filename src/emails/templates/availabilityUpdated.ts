/**
 * Availability Updated Email Template
 * Sent to the event creator when someone fills out their availability
 */

export interface AvailabilityUpdatedData {
  participantName: string;
  eventTitle: string;
  eventUrl: string;
}

export function availabilityUpdatedSubject(
  data: AvailabilityUpdatedData
): string {
  return `New availability submitted: ${data.eventTitle}`;
}

export function availabilityUpdatedEmail(
  data: AvailabilityUpdatedData
): string {
  const { participantName, eventTitle, eventUrl } = data;

  return `
<!--
* This email was built using Tabular.
* For more information, visit https://tabular.email
-->
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">
<head>
<title></title>
<meta charset="UTF-8" />
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<!--[if !mso]>-->
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<!--<![endif]-->
<meta name="x-apple-disable-message-reformatting" content="" />
<meta content="target-densitydpi=device-dpi" name="viewport" />
<meta content="true" name="HandheldFriendly" />
<meta content="width=device-width" name="viewport" />
<meta name="format-detection" content="telephone=no, date=no, address=no, email=no, url=no" />
<style type="text/css">
table {
border-collapse: separate;
table-layout: fixed;
mso-table-lspace: 0pt;
mso-table-rspace: 0pt
}
table td {
border-collapse: collapse
}
.ExternalClass {
width: 100%
}
.ExternalClass,
.ExternalClass p,
.ExternalClass span,
.ExternalClass font,
.ExternalClass td,
.ExternalClass div {
line-height: 100%
}
body, a, li, p, h1, h2, h3 {
-ms-text-size-adjust: 100%;
-webkit-text-size-adjust: 100%;
}
html {
-webkit-text-size-adjust: none !important
}
body {
min-width: 100%;
Margin: 0px;
padding: 0px;
}
body, #innerTable {
-webkit-font-smoothing: antialiased;
-moz-osx-font-smoothing: grayscale
}
#innerTable img+div {
display: none;
display: none !important
}
img {
Margin: 0;
padding: 0;
-ms-interpolation-mode: bicubic
}
h1, h2, h3, p, a {
overflow-wrap: normal;
white-space: normal;
word-break: break-word
}
a {
text-decoration: none
}
h1, h2, h3, p {
min-width: 100%!important;
width: 100%!important;
max-width: 100%!important;
display: inline-block!important;
border: 0;
padding: 0;
margin: 0
}
a[x-apple-data-detectors] {
color: inherit !important;
text-decoration: none !important;
font-size: inherit !important;
font-family: inherit !important;
font-weight: inherit !important;
line-height: inherit !important
}
u + #body a {
color: inherit;
text-decoration: none;
font-size: inherit;
font-family: inherit;
font-weight: inherit;
line-height: inherit;
}
a[href^="mailto"],
a[href^="tel"],
a[href^="sms"] {
color: inherit;
text-decoration: none
}
</style>
<style type="text/css">
@media (min-width: 481px) {
.hd { display: none!important }
}
</style>
<style type="text/css">
@media (max-width: 480px) {
.hm { display: none!important }
}
</style>
<style type="text/css">
@media (max-width: 480px) {
.t58{padding:0 0 22px!important}.t43,.t54,.t70,.t9{text-align:left!important}.t42,.t53,.t69,.t8{vertical-align:top!important;width:600px!important}.t6{border-top-left-radius:0!important;border-top-right-radius:0!important;padding:20px 30px!important}.t40{border-bottom-right-radius:0!important;border-bottom-left-radius:0!important;padding:30px!important}.t78{mso-line-height-alt:20px!important;line-height:20px!important}
}
</style>
<!--[if !mso]>-->
<link href="https://fonts.googleapis.com/css2?family=Albert+Sans:wght@400;500;700;800&amp;display=swap" rel="stylesheet" type="text/css" />
<!--<![endif]-->
<!--[if mso]>
<xml>
<o:OfficeDocumentSettings>
<o:AllowPNG/>
<o:PixelsPerInch>96</o:PixelsPerInch>
</o:OfficeDocumentSettings>
</xml>
<![endif]-->
</head>
<body id="body" class="t81" style="min-width:100%;Margin:0px;padding:0px;background-color:#E0E0E0;"><div class="t80" style="background-color:#E0E0E0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" align="center"><tr><td class="t79" style="font-size:0;line-height:0;mso-line-height-rule:exactly;background-color:#E0E0E0;" valign="top" align="center">
<!--[if mso]>
<v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false">
<v:fill color="#E0E0E0"/>
</v:background>
<![endif]-->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" align="center" id="innerTable"><tr><td align="center">
<table class="t61" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="566" class="t60" style="width:566px;">
<table class="t59" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t58" style="padding:50px 10px 31px 10px;"><div class="t57" style="width:100%;text-align:left;"><div class="t56" style="display:inline-block;"><table class="t55" role="presentation" cellpadding="0" cellspacing="0" align="left" valign="top">
<tr class="t54"><td></td><td class="t53" width="546" valign="top">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t52" style="width:100%;"><tr><td class="t51" style="background-color:transparent;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100% !important;"><tr><td align="center">
<table class="t16" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="546" class="t15" style="width:600px;">
<table class="t14" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t13"><div class="t12" style="width:100%;text-align:left;"><div class="t11" style="display:inline-block;"><table class="t10" role="presentation" cellpadding="0" cellspacing="0" align="left" valign="top">
<tr class="t9"><td></td><td class="t8" width="546" valign="top">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t7" style="width:100%;"><tr><td class="t6" style="overflow:hidden;background-color:#5191F1;padding:14px 50px 18px 50px;border-radius:18px 18px 0 0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100% !important;"><tr><td><div class="t1" style="mso-line-height-rule:exactly;mso-line-height-alt:7px;line-height:7px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr><tr><td align="center">
<table class="t5" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="446" class="t4" style="width:600px;">
<table class="t3" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t2"><p class="t0" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:700;font-style:normal;font-size:20px;text-decoration:none;text-transform:none;direction:ltr;color:#FFFFFF;text-align:center;mso-line-height-rule:exactly;mso-text-raise:1px;">ymeets</p></td></tr></table>
</td></tr></table>
</td></tr></table></td></tr></table>
</td>
<td></td></tr>
</table></div></div></td></tr></table>
</td></tr></table>
</td></tr><tr><td align="center">
<table class="t50" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="546" class="t49" style="width:600px;">
<table class="t48" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t47"><div class="t46" style="width:100%;text-align:left;"><div class="t45" style="display:inline-block;"><table class="t44" role="presentation" cellpadding="0" cellspacing="0" align="left" valign="top">
<tr class="t43"><td></td><td class="t42" width="546" valign="top">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t41" style="width:100%;"><tr><td class="t40" style="overflow:hidden;background-color:#F8F8F8;padding:40px 50px 40px 50px;border-radius:0 0 18px 18px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100% !important;"><tr><td align="center">
<table class="t24" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="446" class="t23" style="width:490px;">
<table class="t22" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t21"><h1 class="t20" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:41px;font-weight:700;font-style:normal;font-size:25px;text-decoration:none;text-transform:none;letter-spacing:-1.56px;direction:ltr;color:#191919;text-align:left;mso-line-height-rule:exactly;mso-text-raise:5px;"><span class="t17" style="margin:0;Margin:0;font-weight:700;mso-line-height-rule:exactly;">${participantName}</span> <span class="t19" style="margin:0;Margin:0;mso-line-height-rule:exactly;"><span class="t18" style="margin:0;Margin:0;font-weight:400;mso-line-height-rule:exactly;">has submitted their availability for</span></span> ${eventTitle}</h1></td></tr></table>
</td></tr></table>
</td></tr><tr><td><div class="t25" style="mso-line-height-rule:exactly;mso-line-height-alt:23px;line-height:23px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr><tr><td align="center">
<table class="t30" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="295" class="t29" style="width:295px;">
<table class="t28" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t27" style="overflow:hidden;background-color:#5191F1;text-align:center;line-height:44px;mso-line-height-rule:exactly;mso-text-raise:10px;padding:10px 30px 10px 30px;border-radius:40px 40px 40px 40px;"><a class="t26" href="${eventUrl}" style="display:block;margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:44px;font-weight:800;font-style:normal;font-size:12px;text-decoration:none;text-transform:uppercase;letter-spacing:2.4px;direction:ltr;color:#FFFFFF;text-align:center;mso-line-height-rule:exactly;mso-text-raise:10px;" target="_blank">View responses</a></td></tr></table>
</td></tr></table>
</td></tr><tr><td><div class="t31" style="mso-line-height-rule:exactly;mso-line-height-alt:27px;line-height:27px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr><tr><td align="left">
<table class="t39" role="presentation" cellpadding="0" cellspacing="0" style="Margin-right:auto;"><tr><td width="446" class="t38" style="width:563px;">
<table class="t37" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t36"><p class="t35" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:14px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#333333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px;"><span class="t32" style="margin:0;Margin:0;color:#888888;mso-line-height-rule:exactly;">Having trouble? Use this link instead: </span><span class="t34" style="margin:0;Margin:0;font-weight:700;font-style:normal;text-decoration:none;direction:ltr;color:#0000FF;mso-line-height-rule:exactly;"><span class="t33" style="margin:0;Margin:0;color:#5191F1;mso-line-height-rule:exactly;">${eventUrl}</span></span></p></td></tr></table>
</td></tr></table>
</td></tr></table></td></tr></table>
</td>
<td></td></tr>
</table></div></div></td></tr></table>
</td></tr></table>
</td></tr></table></td></tr></table>
</td>
<td></td></tr>
</table></div></div></td></tr></table>
</td></tr></table>
</td></tr><tr><td align="center">
<table class="t77" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="600" class="t76" style="width:600px;">
<table class="t75" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t74"><div class="t73" style="width:100%;text-align:left;"><div class="t72" style="display:inline-block;"><table class="t71" role="presentation" cellpadding="0" cellspacing="0" align="left" valign="top">
<tr class="t70"><td></td><td class="t69" width="600" valign="top">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t68" style="width:100%;"><tr><td class="t67" style="padding:0 50px 0 50px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100% !important;"><tr><td align="center">
<table class="t66" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="500" class="t65" style="width:600px;">
<table class="t64" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t63"><p class="t62" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:none;direction:ltr;color:#888888;text-align:center;mso-line-height-rule:exactly;mso-text-raise:3px;">© 2026 – ymeets – a y/cs product<br/></p></td></tr></table>
</td></tr></table>
</td></tr></table></td></tr></table>
</td>
<td></td></tr>
</table></div></div></td></tr></table>
</td></tr></table>
</td></tr><tr><td><div class="t78" style="mso-line-height-rule:exactly;mso-line-height-alt:50px;line-height:50px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr></table></td></tr></table></div><div class="gmail-fix" style="display: none; white-space: nowrap; font: 15px courier; line-height: 0;">&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;</div></body>
</html>
`.trim();
}




// <!DOCTYPE html>
// <html lang="en">
// <head>
//   <meta charset="UTF-8" />
//   <meta name="viewport" content="width=device-width, initial-scale=1.0" />
//   <title>New Availability – ${eventTitle}</title>
// </head>

// <body style="margin:0; padding:0; background-color:#e1e8f7; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
//   <div style="max-width:440px; margin:0 auto; padding:48px 20px;">

//     <!-- Brand -->
//     <div style="text-align:center; margin-bottom:28px;">
//       <span style="font-size:20px; font-weight:600; color:#111827;">ymeets</span>
//     </div>

//     <!-- Card -->
//     <div style="background-color:#ffffff; border-radius:12px; padding:28px; border:1px solid #d1d5db; box-shadow:0 2px 8px rgba(0,0,0,0.08);">

//       <!-- Message -->
//       <p style="margin:0 0 20px; font-size:15px; color:#374151; line-height:1.5;">
//         <strong style="color:#111827;">${participantName}</strong> submitted availability for
//         <strong style="color:#111827;">${eventTitle}</strong>.
//       </p>

//       <!-- Primary CTA -->
//       <a
//         href="${eventUrl}"
//         style="display:block; text-align:center; background-color:#5191F2; color:#ffffff; text-decoration:none; padding:12px 20px; border-radius:8px; font-size:14px; font-weight:500;"
//       >
//         View responses
//       </a>

//       <!-- Context -->
//       <p style="margin:20px 0 0; font-size:12px; color:#6b7280; line-height:1.4;">
//         You're receiving this email because you're the organizer of this event. You can toggle off these emails in the event settings.
//       </p>

//     </div>

//   </div>
// </body>
// </html>
//   `.trim();
// }
